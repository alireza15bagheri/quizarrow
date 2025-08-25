from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from .lobby import LobbyRoom
from .questions import Quiz


class QuizParticipation(models.Model):
    """
    A record of a user completing a quiz session (lobby).
    This is used for historical purposes, like a user's result history page.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="participations",
    )
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="participations")
    lobby = models.OneToOneField(
        LobbyRoom, on_delete=models.CASCADE, related_name="participation_record"
    )
    final_score = models.IntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user.username} participated in {self.quiz.title} (Score: {self.final_score})"