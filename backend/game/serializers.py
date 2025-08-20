from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Tag,
    Question,
    Quiz,
    QuizQuestion,
    LobbyRoom,
    LobbyParticipant,
    Answer,
)

User = get_user_model()


# --- Tag ---

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


# --- Questions ---

class QuestionPublicSerializer(serializers.ModelSerializer):
    """
    Public/player-facing serializer: never exposes answer_key.
    """
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "type",
            "difficulty",
            "text",
            "image",
            "tags",
            "content",
            "default_timer_seconds",
            "default_points",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class QuestionAdminSerializer(serializers.ModelSerializer):
    """
    Host/Admin-facing serializer: includes answer_key.
    """
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        source="tags", many=True, queryset=Tag.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = Question
        fields = [
            "id",
            "type",
            "difficulty",
            "text",
            "image",
            "tags",
            "tag_ids",
            "content",
            "answer_key",
            "default_timer_seconds",
            "default_points",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "tags"]

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
        qtype = attrs.get("type", getattr(self.instance, "type", None))
        content = attrs.get("content", getattr(self.instance, "content", {}))
        answer_key = attrs.get("answer_key", getattr(self.instance, "answer_key", {}))

        # Minimal structural checks to prevent bad shapes
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


# --- Quizzes ---

class QuizQuestionAdminSerializer(serializers.ModelSerializer):
    question = QuestionAdminSerializer(required=False)  # <-- allow nested creation
    question_id = serializers.PrimaryKeyRelatedField(
        source="question", queryset=Question.objects.all(), write_only=True, required=False
    )
    effective_points = serializers.SerializerMethodField()
    effective_timer = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = [
            "id",
            "order",
            "points",
            "timer_seconds",
            "effective_points",
            "effective_timer",
            "question",
            "question_id",
        ]

    def get_effective_points(self, obj):
        return obj.effective_points()

    def get_effective_timer(self, obj):
        return obj.effective_timer()

class QuizQuestionAdminSerializer(serializers.ModelSerializer):
    question = QuestionAdminSerializer(required=False)
    question_id = serializers.PrimaryKeyRelatedField(
        source="question", queryset=Question.objects.all(), write_only=True, required=False
    )
    effective_points = serializers.SerializerMethodField()
    effective_timer = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = [
            "id",
            "order",
            "points",
            "timer_seconds",
            "effective_points",
            "effective_timer",
            "question",
            "question_id",
        ]

    def get_effective_points(self, obj):
        return obj.effective_points()

    def get_effective_timer(self, obj):
        return obj.effective_timer()


class QuizAdminSerializer(serializers.ModelSerializer):
    quiz_questions = QuizQuestionAdminSerializer(many=True, required=False)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        source="tags", many=True, queryset=Tag.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "tags",
            "tag_ids",
            "is_published",
            "created_at",
            "updated_at",
            "quiz_questions",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "tags"]

    def create(self, validated_data):
        qlinks = validated_data.pop("quiz_questions", [])
        tags = validated_data.pop("tags", [])
        quiz = Quiz.objects.create(host=self.context["request"].user, **validated_data)
        if tags:
            quiz.tags.set(tags)
        for link in qlinks:
            question_data = link.pop("question", None)
            if question_data:
                question = Question.objects.create(
                    author=self.context["request"].user, **question_data
                )
                link["question"] = question
            QuizQuestion.objects.create(quiz=quiz, **link)
        return quiz






class QuizQuestionPublicSerializer(serializers.ModelSerializer):
    question = QuestionPublicSerializer(read_only=True)
    effective_points = serializers.SerializerMethodField()
    effective_timer = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = ["id", "order", "effective_points", "effective_timer", "question"]

    def get_effective_points(self, obj):
        return obj.effective_points()

    def get_effective_timer(self, obj):
        return obj.effective_timer()


class QuizPublicSerializer(serializers.ModelSerializer):
    quiz_questions = QuizQuestionPublicSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "title",
            "description",
            "tags",
            "is_published",
            "quiz_questions",
        ]


# --- Lobby / live ---

class LobbyParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = LobbyParticipant
        fields = [
            "id",
            "nickname",
            "is_host",
            "connected",
            "last_seen",
            "score",
            "rank",
        ]
        read_only_fields = fields


class LobbySerializer(serializers.ModelSerializer):
    quiz = QuizPublicSerializer(read_only=True)
    participants = LobbyParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = LobbyRoom
        fields = [
            "id",
            "code",
            "status",
            "is_private",
            "created_at",
            "started_at",
            "ended_at",
            "is_paused",
            "current_q",
            "question_started_at",
            "question_duration",
            "quiz",
            "participants",
        ]
        read_only_fields = fields


# --- Answers ---

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = [
            "id",
            "participant",
            "quiz_question",
            "submitted_at",
            "response_time_ms",
            "payload",
            "is_correct",
            "points_awarded",
            "evaluation",
        ]
        read_only_fields = [
            "id",
            "submitted_at",
            "is_correct",
            "points_awarded",
            "evaluation",
        ]


class AnswerSubmitSerializer(serializers.ModelSerializer):
    """
    Use this for submit endpoints; server will evaluate and fill scoring fields.
    """
    class Meta:
        model = Answer
        fields = ["participant", "quiz_question", "response_time_ms", "payload"]

    def validate(self, attrs):
        # Basic shape checks; deeper validation will happen in the view/service layer
        payload = attrs.get("payload", {})
        if not isinstance(payload, dict):
            raise serializers.ValidationError({"payload": "Payload must be an object."})
        return attrs
