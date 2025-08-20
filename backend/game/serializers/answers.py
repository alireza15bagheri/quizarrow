from rest_framework import serializers
from ..models import Answer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "id", "participant", "quiz_question", "submitted_at",
            "response_time_ms", "payload", "is_correct",
            "points_awarded", "evaluation",
        ]
        read_only_fields = [
            "id", "submitted_at", "is_correct",
            "points_awarded", "evaluation",
        ]


class AnswerSubmitSerializer(serializers.ModelSerializer):
    """
    Use this for submit endpoints; server will evaluate and fill scoring fields.
    """
    class Meta:
        model = Answer
        fields = ["participant", "quiz_question", "response_time_ms", "payload"]

    def validate(self, attrs):
        payload = attrs.get("payload", {})
        if not isinstance(payload, dict):
            raise serializers.ValidationError({"payload": "Payload must be an object."})
        return attrs
