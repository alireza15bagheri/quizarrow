from django.contrib.auth.models import User
from django.db.models.signals import post_delete
from django.dispatch import receiver
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from accounts.serializers import UserAdminSerializer
from ..models import Quiz, LobbyRoom, LobbyParticipant
from ..permissions import IsAdminUser
from ..serializers import QuizAdminSerializer
from ..signals import participant_deleted
from accounts.models import UserProfile


class AdminUserListView(generics.ListAPIView):
    """
    Admin endpoint to list all users with their roles.
    Admins can only see non-admin users.
    """
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        # Exclude other admins and the current user
        return User.objects.exclude(
            profile__role=UserProfile.Role.ADMIN
        ).exclude(
            id=self.request.user.id
        ).select_related("profile")


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    Admin endpoint to update a user's role or active status.
    Admins can only modify non-admin users.
    """
    serializer_class = UserAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    lookup_field = 'pk'

    def get_queryset(self):
        # Exclude other admins and the current user from being modifiable
        return User.objects.exclude(
            profile__role=UserProfile.Role.ADMIN
        ).exclude(
            id=self.request.user.id
        )


class AdminQuizListView(generics.ListAPIView):
    """
    Admin endpoint to list all quizzes from all users.
    """
    queryset = Quiz.objects.select_related("host").all()
    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]


class AdminQuizDetailView(generics.DestroyAPIView):
    """
    Admin endpoint to delete any quiz.
    """
    queryset = Quiz.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    lookup_field = 'pk'

    def perform_destroy(self, instance):
        # The Quiz model has on_delete=PROTECT for lobbies
        # have signals that fire on deletion. For a full admin wipe, we
        # need to bypass some of this. The most direct way is to disconnect
        # the signal that's causing the foreign key violation.
        post_delete.disconnect(participant_deleted, sender=LobbyParticipant)
        
        try:
            # Manually delete associated lobbies first to bypass PROTECT.
            LobbyRoom.objects.filter(quiz=instance).delete()
            # Now delete the quiz instance itself.
            instance.delete()
        finally:
            # ALWAYS reconnect the signal to avoid side effects elsewhere.
            post_delete.connect(participant_deleted, sender=LobbyParticipant)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)