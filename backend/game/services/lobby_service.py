import random
import string
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied

from ..models import Quiz, LobbyRoom, LobbyParticipant


class LobbyService:
    """
    Encapsulates business logic for lobby creation and state management.
    """

    def _generate_lobby_code(self):
        """Generates a unique 8-character uppercase code for a lobby."""
        while True:
            code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not LobbyRoom.objects.filter(code=code).exists():
                return code

    def start_solo_quiz(self, quiz_id: int, user):
        """
        Creates a new solo lobby session for a user to take a quiz.
        """
        try:
            quiz = Quiz.objects.get(pk=quiz_id, is_published=True)
        except Quiz.DoesNotExist:
            raise ValidationError("Published quiz not found.")

        lobby = LobbyRoom.objects.create(
            code=self._generate_lobby_code(),
            quiz=quiz,
            host=user,
            status=LobbyRoom.Status.RUNNING,
            started_at=timezone.now(),
        )

        LobbyParticipant.objects.create(
            lobby=lobby, user=user, nickname=user.username, is_host=True, connected=True
        )

        return lobby

    def get_lobby_state(self, lobby_id: int, user):
        """
        Retrieves the current state of a lobby for a participant.
        Advances to the first question if the game is just starting.
        """
        try:
            lobby = LobbyRoom.objects.get(pk=lobby_id, host=user)
            participant = LobbyParticipant.objects.get(lobby=lobby, user=user)
        except (LobbyRoom.DoesNotExist, LobbyParticipant.DoesNotExist):
            raise PermissionDenied("You are not in this lobby.")

        if lobby.status != LobbyRoom.Status.RUNNING:
            return {"status": lobby.status, "detail": "Lobby is not active."}

        # If quiz is just starting (no current question), serve the first one.
        if not lobby.current_q:
            first_q = lobby.quiz.quiz_questions.order_by("order").first()
            if not first_q:
                lobby.status = LobbyRoom.Status.ENDED
                lobby.ended_at = timezone.now()
                lobby.save()
                return {"status": lobby.status, "detail": "Quiz has no questions."}

            lobby.current_q = first_q
            lobby.question_started_at = timezone.now()
            lobby.save()

        time_left = 0
        if lobby.question_started_at:
            duration = lobby.current_q.effective_timer()
            elapsed = (timezone.now() - lobby.question_started_at).total_seconds()
            time_left = max(0, duration - elapsed)

        return {
            "status": lobby.status,
            "lobby_id": lobby.id,
            "quiz_title": lobby.quiz.title,
            "question": lobby.current_q,
            "score": participant.score,
            "time_left": time_left,
        }