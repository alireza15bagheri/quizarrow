from ..models import QuizParticipation, LobbyRoom, LobbyParticipant


class HistoryService:
    """
    Handles creation of historical records for completed games.
    """

    def create_participation_record(self, lobby: LobbyRoom, participant: LobbyParticipant):
        """
        Creates a historical record of a user's participation in a quiz.
        """
        return QuizParticipation.objects.create(
            user=participant.user,
            quiz=lobby.quiz,
            lobby=lobby,
            final_score=participant.score,
        )