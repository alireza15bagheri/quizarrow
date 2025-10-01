import bleach
from rest_framework import serializers
from ..models import Question, Tag
from .tags import TagSerializer

class QuestionPublicSerializer(serializers.ModelSerializer):
    """Public/player-facing serializer: never exposes answer_key."""
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id", "type", "difficulty", "text", "image", "tags",
            "content", "default_timer_seconds", "default_points",
            "created_at", "updated_at",
        ]
        read_only_fields = fields


class QuestionAdminSerializer(serializers.ModelSerializer):
    """Host/Admin-facing serializer: includes answer_key."""
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        source="tags", many=True, queryset=Tag.objects.all(),
        write_only=True, required=False
    )

    class Meta:
        model = Question
        fields = [
            "id", "type", "difficulty", "text", "image", "tags", "tag_ids",
            "content", "answer_key", "default_timer_seconds",
            "default_points", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "tags"]

    def validate_text(self, value):
        """Sanitize question text to prevent XSS."""
        return bleach.clean(value)

    def validate_content(self, value):
        """Sanitize choices within MCQ questions to prevent XSS."""
        if 'choices' in value and isinstance(value['choices'], list):
            value['choices'] = [bleach.clean(str(choice)) for choice in value['choices']]
        return value

    def create(self, validated_data):
        tags = validated_data.pop("tags", [])
        q = super().create(validated_data)
        if tags:
            q.tags.set(tags)
        return q

    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        q = super().update(instance, validated_data)
        if tags is not None:
            q.tags.set(tags)
        return q

    def validate(self, attrs):
        """Minimal structural checks for content/answer_key."""
        qtype = attrs.get("type", getattr(self.instance, "type", None))
        content = attrs.get("content", getattr(self.instance, "content", {}))
        answer_key = attrs.get("answer_key", getattr(self.instance, "answer_key", {}))

        if qtype == Question.Type.MCQ:
            if "choices" not in content or not isinstance(content["choices"], list) or len(content["choices"]) < 2:
                raise serializers.ValidationError({"content": "MCQ requires 'choices' (>=2)."})
            if "correct_index" not in answer_key or not isinstance(answer_key["correct_index"], int):
                raise serializers.ValidationError({"answer_key": "MCQ requires integer 'correct_index'."})
            if not (0 <= answer_key["correct_index"] < len(content["choices"])):
                raise serializers.ValidationError({"answer_key": "correct_index out of range."})

        if qtype == Question.Type.TRUE_FALSE:
            if "is_true" not in answer_key or not isinstance(answer_key["is_true"], bool):
                raise serializers.ValidationError({"answer_key": "True/False requires boolean 'is_true'."})

        if qtype == Question.Type.SHORT_TEXT:
            accepted = answer_key.get("accepted", [])
            if not isinstance(accepted, list) or not all(isinstance(x, str) and x.strip() for x in accepted):
                raise serializers.ValidationError({"answer_key": "Short text requires non-empty list 'accepted'."})
            mode = answer_key.get("mode", "casefold")
            if mode not in {"exact", "casefold", "regex"}:
                raise serializers.ValidationError({"answer_key": "mode must be 'exact', 'casefold', or 'regex'."})

        return attrs