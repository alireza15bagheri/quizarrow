from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .questions import Quiz, QuizQuestion


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

    current_q = models.ForeignKey(QuizQuestion, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    question_started_at = models.DateTimeField(null=True, blank=True)
    question_duration = models.PositiveIntegerField(null=True, blank=True)
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
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="lobby_participations"
    )
    nickname = models.CharField(max_length=32)

    is_host = models.BooleanField(default=False)
    session_id = models.CharField(max_length=64, blank=True)
    connected = models.BooleanField(default=False)
    last_seen = models.DateTimeField(default=timezone.now)

    score = models.IntegerField(default=0)
    rank = models.PositiveIntegerField(null=True, blank=True)

    state = models.JSONField(default=dict, blank=True)

    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-score", "joined_at"]
        constraints = [
            UniqueConstraint(Lower("nickname"), "lobby", name="uq_lobby_nickname_ci_unique")
        ]

    def __str__(self):
        return f"{self.nickname} @ {self.lobby.code}"
