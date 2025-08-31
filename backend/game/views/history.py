from rest_framework import generics, permissions
from ..models import QuizParticipation
from ..serializers import QuizParticipationSerializer


class MyParticipationsListView(generics.ListAPIView):
    """
    Lists the quiz participation history for the current user.
    """

    serializer_class = QuizParticipationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizParticipation.objects.filter(user=self.request.user).select_related(
            "quiz"
        )


class QuizParticipationDetailView(generics.RetrieveAPIView):
    """
    Retrieves a single participation record.
    """

    serializer_class = QuizParticipationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizParticipation.objects.filter(user=self.request.user)