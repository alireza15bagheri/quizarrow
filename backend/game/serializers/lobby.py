from rest_framework import serializers
from ..models import LobbyParticipant, LobbyRoom
from .quizzes import QuizPublicSerializer

class LobbyParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = LobbyParticipant
        fields = [
            "id", "nickname", "is_host", "connected",
            "last_seen", "score", "rank",
        ]
        read_only_fields = fields


class LobbySerializer(serializers.ModelSerializer):
    quiz = QuizPublicSerializer(read_only=True)
    participants = LobbyParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = LobbyRoom
        fields = [
            "id", "code", "status", "is_private", "created_at", "started_at",
            "ended_at", "is_paused", "current_q", "question_started_at",
            "question_duration", "quiz", "participants",
        ]
        read_only_fields = fields
