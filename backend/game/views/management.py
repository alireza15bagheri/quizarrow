from django.db.models import ProtectedError
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from ..models import Quiz, QuizQuestion, Question
from ..serializers import QuizAdminSerializer, QuizQuestionAdminSerializer
from ..permissions import IsHostOrAdmin


class QuizEditPermissionMixin:
    """
    Mixin to centralize common quiz ownership and publish-state checks.
    Provides `get_owned_quiz_or_403` to retrieve a quiz and enforce:
      - Current user is the host
      - Quiz is not published (unless allow_published=True)
    """

    def get_owned_quiz_or_403(self, quiz_id, *, allow_published=False):
        quiz = get_object_or_404(Quiz, pk=quiz_id)
        if quiz.host != self.request.user:
            raise PermissionDenied("You do not have permission to edit this quiz.")
        if quiz.is_published and not allow_published:
            raise ValidationError("This quiz is published and cannot be modified.")
        return quiz


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


class QuizQuestionAddView(QuizEditPermissionMixin, generics.CreateAPIView):
    """
    Allows the quiz owner to append new questions to an existing quiz.
    Accepts the same `quiz_questions` format as QuizAdminSerializer.
    """

    serializer_class = QuizQuestionAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def create(self, request, *args, **kwargs):
        quiz = self.get_owned_quiz_or_403(kwargs["pk"], allow_published=False)

        # Expecting a payload like {"quiz_questions": [ {...}, {...} ]}
        quiz_questions_data = request.data.get("quiz_questions", [])
        if not isinstance(quiz_questions_data, list):
            return Response({"error": "quiz_questions must be a list"}, status=400)

        created_links = []
        for link in quiz_questions_data:
            # If `question` key is present: create a new Question object
            question_data = link.pop("question", None)
            if question_data:
                question = Question.objects.create(
                    author=request.user, **question_data
                )
                link["question"] = question

            # Associate with quiz
            qlink = QuizQuestion.objects.create(quiz=quiz, **link)
            created_links.append(qlink)

        serializer = QuizQuestionAdminSerializer(created_links, many=True)
        return Response(serializer.data, status=201)


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
        # Only allow editing if not published, except for toggling is_published itself
        # and updating available_to_date.
        if quiz.is_published:
            allowed_fields = {"is_published", "available_to_date"}
            update_fields = set(request.data.keys())
            if not update_fields.issubset(allowed_fields):
                raise ValidationError("This quiz is published and cannot be edited.")

        # If transitioning from draft -> published, check for questions and set publish_date
        if "is_published" in request.data:
            next_published = bool(request.data.get("is_published"))
            if next_published and not quiz.is_published:
                # Prevent publishing a quiz with no questions
                if not quiz.quiz_questions.exists():
                    raise ValidationError(
                        "A quiz must have at least one question to be published."
                    )

                quiz.publish_date = timezone.now()

        return super().update(request, *args, **kwargs)


class QuizQuestionDeleteView(QuizEditPermissionMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def delete(self, request, pk, qid):
        """
        Delete a specific question from a quiz (by quiz id and quiz_question id).
        """
        quiz = self.get_owned_quiz_or_403(pk, allow_published=False)
        quiz_question = get_object_or_404(QuizQuestion, pk=qid, quiz=quiz)
        quiz_question.delete()
        return Response(
            {"ok": True, "detail": "Question removed"}, status=status.HTTP_204_NO_CONTENT
        )


class QuizQuestionUpdateView(QuizEditPermissionMixin, APIView):
    """
    Partially update a quiz question link (points, timer_seconds).
    Sending null resets to the Question defaults (effective_* fields).
    """

    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def patch(self, request, pk, qid):
        quiz = self.get_owned_quiz_or_403(pk, allow_published=False)
        quiz_question = get_object_or_404(QuizQuestion, pk=qid, quiz=quiz)
        serializer = QuizQuestionAdminSerializer(
            quiz_question, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)