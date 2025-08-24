from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


class Tag(models.Model):
    name = models.CharField(max_length=64, unique=True, verbose_name=_("name"))

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Question(models.Model):
    class Type(models.TextChoices):
        MCQ = "mcq", _("Multiple choice")
        TRUE_FALSE = "tf", _("True/False")
        SHORT_TEXT = "short", _("Short text")

    class Difficulty(models.TextChoices):
        EASY = "easy", _("Easy")
        MEDIUM = "medium", _("Medium")
        HARD = "hard", _("Hard")

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="questions"
    )
    type = models.CharField(max_length=8, choices=Type.choices, verbose_name=_("type"))
    difficulty = models.CharField(
        max_length=8, choices=Difficulty.choices, default=Difficulty.MEDIUM, verbose_name=_("difficulty")
    )
    text = models.TextField(verbose_name=_("text"))
    image = models.ImageField(upload_to="question_images/", null=True, blank=True, verbose_name=_("image"))
    tags = models.ManyToManyField(Tag, blank=True, related_name="questions", verbose_name=_("tags"))

    content = models.JSONField(default=dict, blank=True, verbose_name=_("content"))
    answer_key = models.JSONField(default=dict, blank=True, verbose_name=_("answer key"))

    default_timer_seconds = models.PositiveIntegerField(
        default=20, validators=[MinValueValidator(3), MaxValueValidator(600)]
    )
    default_points = models.PositiveIntegerField(default=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_type_display()}] {self.text[:60]}"


class Quiz(models.Model):
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quizzes"
    )
    title = models.CharField(max_length=200, verbose_name=_("title"))
    description = models.TextField(blank=True, verbose_name=_("description"))
    tags = models.ManyToManyField(Tag, blank=True, related_name="quizzes", verbose_name=_("tags"))
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    questions = models.ManyToManyField(Question, through="QuizQuestion", related_name="quizzes")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="quiz_questions")
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="quiz_links")
    order = models.PositiveIntegerField(default=0)
    points = models.PositiveIntegerField(null=True, blank=True)
    timer_seconds = models.PositiveIntegerField(
        null=True, blank=True, validators=[MinValueValidator(3), MaxValueValidator(1800)]
    )

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(fields=["quiz", "question"], name="uq_quiz_question_unique"),
            models.UniqueConstraint(fields=["quiz", "order"], name="uq_quiz_question_order_unique"),
        ]

    def __str__(self):
        return f"{self.quiz.title} — Q{self.order}: {self.question.text[:40]}"

    def effective_points(self) -> int:
        return self.points if self.points is not None else self.question.default_points

    def effective_timer(self) -> int:
        return self.timer_seconds if self.timer_seconds is not None else self.question.default_timer_seconds
