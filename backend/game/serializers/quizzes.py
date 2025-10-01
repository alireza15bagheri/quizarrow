import bleach
from rest_framework import serializers
from ..models import Quiz, QuizQuestion
from .questions import QuestionPublicSerializer, QuestionAdminSerializer
from .tags import TagSerializer
from ..models import Tag, Question

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
            "id", "order", "points", "timer_seconds",
            "effective_points", "effective_timer", "question", "question_id",
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
    publisher_username = serializers.CharField(source="host.username", read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id", "title", "description", "tags", "tag_ids",
            "is_published", "publish_date", "available_to_date",
            "created_at", "updated_at", "quiz_questions", "publisher_username",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "tags", "publish_date"]

    def validate_title(self, value):
        """Sanitize quiz title to prevent XSS."""
        return bleach.clean(value)

    def validate_description(self, value):
        """Sanitize quiz description to prevent XSS."""
        return bleach.clean(value)

    def create(self, validated_data):
        qlinks = validated_data.pop("quiz_questions", [])
        tags = validated_data.pop("tags", [])
        quiz = Quiz.objects.create(**validated_data)
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
    
    def update(self, instance, validated_data):
        tags = validated_data.pop("tags", None)
        instance = super().update(instance, validated_data)
        if tags is not None:
            instance.tags.set(tags)
        return instance


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
            "id", "title", "description", "tags",
            "is_published", "quiz_questions",
        ]

class QuizLobbySerializer(serializers.ModelSerializer):
    """
    Serializer for quizzes listed in the public lobby.
    Includes tags for filtering.
    """
    tags = TagSerializer(many=True, read_only=True)
    publisher_username = serializers.CharField(source="host.username", read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id", "title", "description", "tags",
            "publisher_username", "publish_date", "available_to_date",
        ]