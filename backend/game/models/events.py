from django.db import models
from django.utils.translation import gettext_lazy as _
from .lobby import LobbyRoom, LobbyParticipant
from .questions import Quiz


from django.db import models
from django.utils.translation import gettext_lazy as _

class GameEvent(models.Model):
    class Type(models.TextChoices):
        LOBBY_CREATED = "lobby_created", _("Lobby created")
        LOBBY_STARTED = "lobby_started", _("Lobby started")
        LOBBY_ENDED = "lobby_ended", _("Lobby ended")
        STATUS_CHANGED = "status_changed", _("Status changed")
        PARTICIPANT_JOINED = "participant_joined", _("Participant joined")
        PARTICIPANT_LEFT = "participant_left", _("Participant left")

    event_type = models.CharField(
        max_length=32,
        choices=Type.choices
    )
    lobby = models.ForeignKey(
        "LobbyRoom",
        on_delete=models.CASCADE,
        related_name="events"
    )
    quiz = models.ForeignKey(
        "Quiz",
        on_delete=models.CASCADE,
        related_name="events",
        null=True,      
        blank=True      
    )
    participant = models.ForeignKey(
        "LobbyParticipant",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="events"
    )
    payload = models.JSONField(
        default=dict,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_event_type_display()} @ {self.created_at.isoformat()}"
