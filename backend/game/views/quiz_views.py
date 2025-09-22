from django.db.models import ProtectedError
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404

# Imports for channels broadcast
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from ..models import Quiz
from ..serializers import QuizAdminSerializer, QuizLobbySerializer
from ..permissions import IsHostOrAdmin
from .mixins import QuizEditPermissionMixin


class HostNewQuizView(generics.CreateAPIView):
    """
    Allows authenticated hosts to create a new quiz.
    """

    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def perform_create(self, serializer):
        """Ensure the quiz is saved with the current user as the host."""
        serializer.save(host=self.request.user)


class MyQuizzesListDeleteView(generics.ListAPIView, generics.DestroyAPIView):
    """
    Lists quizzes belonging to the current user and allows deletion.
    Prevents deletion if the quiz is published or has a session history.
    """

    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def get_queryset(self):
        # Only quizzes created by this user
        return Quiz.objects.filter(host=self.request.user).prefetch_related(
            "quiz_questions"
        )

    def delete(self, request, *args, **kwargs):
        """
        Delete a specific quiz (by ID in URL) if not published.
        """
        quiz = get_object_or_404(self.get_queryset(), pk=kwargs.get("pk"))
        if quiz.is_published:
            return Response(
                {"detail": "Published quizzes cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # The destroy method calls perform_destroy, which calls instance.delete()
            self.destroy(request, *args, **kwargs)
            # destroy returns a 204 No Content response on success
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {
                    "detail": "This quiz cannot be deleted because it has a history of past sessions."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class MyQuizDetailView(QuizEditPermissionMixin, generics.RetrieveUpdateAPIView):
    """
    Returns the details of a single quiz (with questions)
    for the currently authenticated host.
    Allows PATCH/PUT to update quiz meta (e.g., is_published) for owner.
    """

    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def get_queryset(self):
        # Only quizzes created by the logged-in user
        return Quiz.objects.filter(host=self.request.user)

    def update(self, request, *args, **kwargs):
        quiz = self.get_object()
        was_published_before_update = quiz.is_published

        # Only allow editing some fields on a published quiz
        if was_published_before_update:
            allowed_fields = {"is_published", "available_to_date"}
            update_fields = set(request.data.keys())
            if not update_fields.issubset(allowed_fields):
                raise ValidationError("This quiz is published and cannot be fully edited.")

        is_publishing_now = False
        if "is_published" in request.data:
            next_published = bool(request.data.get("is_published"))

            # --- State transition logic ---
            if next_published and not was_published_before_update:
                # This is a PUBLISH action
                is_publishing_now = True
                if not quiz.quiz_questions.exists():
                    raise ValidationError("A quiz must have at least one question to be published.")
                # Always set/update the publish_date when transitioning to published
                quiz.publish_date = timezone.now()

            elif not next_published and was_published_before_update:
                # This is an UNPUBLISH action
                # Clear related dates to ensure a clean state for future publishing
                quiz.publish_date = None
                quiz.available_to_date = None

        response = super().update(request, *args, **kwargs)

        # If the update was successful and the quiz just became published, broadcast it.
        if response.status_code == 200 and is_publishing_now:
            # The quiz instance is updated by super().update(), so it's safe to serialize
            channel_layer = get_channel_layer()
            if channel_layer:
                payload = QuizLobbySerializer(quiz).data
                async_to_sync(channel_layer.group_send)(
                    "quiz_notifications",
                    {
                        "type": "quiz.published",
                        "publisher_id": request.user.id, # Add the publisher's ID
                        "payload": payload,
                    }
                )

        return response