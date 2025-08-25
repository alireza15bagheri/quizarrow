from rest_framework import serializers
from ..models import QuizParticipation


class QuizParticipationSerializer(serializers.ModelSerializer):
    """
    Serializer for a user's historical quiz participations.
    """

    quiz_title = serializers.CharField(source="quiz.title", read_only=True)

    class Meta:
        model = QuizParticipation
        fields = [
            "id",
            "quiz",
            "quiz_title",
            "final_score",
            "completed_at",
        ]