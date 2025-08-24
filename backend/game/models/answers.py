from django.db import models
from django.db.models import UniqueConstraint
from django.core.validators import MaxValueValidator
from django.utils.translation import gettext_lazy as _
from .lobby import LobbyRoom, LobbyParticipant
from .questions import QuizQuestion


class Answer(models.Model):
    lobby = models.ForeignKey(LobbyRoom, on_delete=models.CASCADE, related_name="answers")
    participant = models.ForeignKey(LobbyParticipant, on_delete=models.CASCADE, related_name="answers")
    quiz_question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name="answers")

    submitted_at = models.DateTimeField(auto_now_add=True)
    response_time_ms = models.PositiveIntegerField(
        default=0, validators=[MaxValueValidator(60 * 60 * 1000)]
    )

    payload = models.JSONField(default=dict, blank=True)

    is_correct = models.BooleanField(default=False)
    points_awarded = models.IntegerField(default=0)
    evaluation = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["submitted_at"]
        constraints = [
            UniqueConstraint(fields=["participant", "quiz_question"], name="uq_one_answer_per_question"),
        ]

    def __str__(self):
        return f"Ans by {self.participant.nickname} on Q{self.quiz_question.order} ({'✓' if self.is_correct else '✗'})"
