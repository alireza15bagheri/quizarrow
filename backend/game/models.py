from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

# --- Question bank ---

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

    # Non-sensitive presentation data (e.g., MCQ choices)
    content = models.JSONField(default=dict, blank=True, verbose_name=_("content"))
    # Sensitive answer key data, never sent to players
    answer_key = models.JSONField(default=dict, blank=True, verbose_name=_("answer key"))

    # Optional defaults (overridable in a quiz context)
    default_timer_seconds = models.PositiveIntegerField(default=20, validators=[MinValueValidator(3), MaxValueValidator(600)])
    default_points = models.PositiveIntegerField(default=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_type_display()}] {self.text[:60]}"

    # Helper expectations for content/answer_key:
    # - MCQ:    content={"choices": ["A", "B", "C", "D"]}, answer_key={"correct_index": 1}
    # - True/False: content={}, answer_key={"is_true": true}
    # - Short:  content={"hints": []}, answer_key={"accepted": ["Paris", "City of Light"], "mode": "casefold"}


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
    # Per-quiz overrides
    points = models.PositiveIntegerField(null=True, blank=True)
    timer_seconds = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(3), MaxValueValidator(1800)])

    class Meta:
        ordering = ["order"]
        constraints = [
            UniqueConstraint(fields=["quiz", "question"], name="uq_quiz_question_unique"),
            UniqueConstraint(fields=["quiz", "order"], name="uq_quiz_question_order_unique"),
        ]

    def __str__(self):
        return f"{self.quiz.title} — Q{self.order}: {self.question.text[:40]}"

    def effective_points(self) -> int:
        return self.points if self.points is not None else self.question.default_points

    def effective_timer(self) -> int:
        return self.timer_seconds if self.timer_seconds is not None else self.question.default_timer_seconds


# --- Lobby / live session ---

class LobbyRoom(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        RUNNING = "running", _("Running")
        PAUSED = "paused", _("Paused")
        ENDED = "ended", _("Ended")

    code = models.CharField(max_length=12, unique=True, verbose_name=_("join code"))
    quiz = models.ForeignKey(Quiz, on_delete=models.PROTECT, related_name="lobbies")
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="hosted_lobbies")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)

    # Live state
    current_q = models.ForeignKey(QuizQuestion, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    question_started_at = models.DateTimeField(null=True, blank=True)
    question_duration = models.PositiveIntegerField(null=True, blank=True)  # seconds
    is_paused = models.BooleanField(default=False)

    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    banned_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL, through="LobbyBan", related_name="banned_from_lobbies", blank=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} — {self.quiz.title}"


class LobbyBan(models.Model):
    lobby = models.ForeignKey(LobbyRoom, on_delete=models.CASCADE, related_name="bans")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lobby_bans")
    reason = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=["lobby", "user"], name="uq_lobby_user_ban_unique")
        ]


class LobbyParticipant(models.Model):
    lobby = models.ForeignKey(LobbyRoom, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="lobby_participations")
    nickname = models.CharField(max_length=32)

    is_host = models.BooleanField(default=False)
    session_id = models.CharField(max_length=64, blank=True, help_text=_("Opaque session/connection identifier"))
    connected = models.BooleanField(default=False)
    last_seen = models.DateTimeField(default=timezone.now)

    score = models.IntegerField(default=0)
    rank = models.PositiveIntegerField(null=True, blank=True)

    state = models.JSONField(default=dict, blank=True, help_text=_("Reconnection snapshot"))

    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-score", "joined_at"]
        constraints = [
            # Enforce unique nickname per lobby (case-insensitive)
            UniqueConstraint(
                Lower("nickname"), "lobby",
                name="uq_lobby_nickname_ci_unique"
            )
        ]

    def __str__(self):
        return f"{self.nickname} @ {self.lobby.code}"


# --- Answers & scoring ---

class Answer(models.Model):
    lobby = models.ForeignKey(LobbyRoom, on_delete=models.CASCADE, related_name="answers")
    participant = models.ForeignKey(LobbyParticipant, on_delete=models.CASCADE, related_name="answers")
    quiz_question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name="answers")

    submitted_at = models.DateTimeField(auto_now_add=True)
    response_time_ms = models.PositiveIntegerField(default=0, validators=[MaxValueValidator(60 * 60 * 1000)])

    # Raw submission payload (e.g., {"choice_index": 2} or {"text": "paris"} or {"bool": true})
    payload = models.JSONField(default=dict, blank=True)

    # Server-side evaluation
    is_correct = models.BooleanField(default=False)
    points_awarded = models.IntegerField(default=0)
    evaluation = models.JSONField(default=dict, blank=True, help_text=_("Scoring notes, bonuses, etc."))

    class Meta:
        ordering = ["submitted_at"]
        constraints = [
            # One answer per participant per quiz question
            UniqueConstraint(fields=["participant", "quiz_question"], name="uq_one_answer_per_question"),
        ]

    def __str__(self):
        return f"Ans by {self.participant.nickname} on Q{self.quiz_question.order} ({'✓' if self.is_correct else '✗'})"


# --- Event trail (lightweight analytics) ---

class GameEvent(models.Model):
    class Type(models.TextChoices):
        LOBBY_CREATED = "lobby_created", _("Lobby created")
        LOBBY_STARTED = "lobby_started", _("Lobby started")
        LOBBY_ENDED = "lobby_ended", _("Lobby ended")
        STATUS_CHANGED = "status_changed", _("Status changed")
        PARTICIPANT_JOINED = "participant_joined", _("Participant joined")
        PARTICIPANT_LEFT = "participant_left", _("Participant left")

    event_type = models.CharField(max_length=32, choices=Type.choices)
    lobby = models.ForeignKey(LobbyRoom, on_delete=models.CASCADE, related_name="events")
    quiz = models.ForeignKey(Quiz, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    participant = models.ForeignKey("LobbyParticipant", on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        who = self.participant.nickname if self.participant else "-"
        return f"{self.get_event_type_display()} @ {self.lobby.code} ({who})"
