from django.utils import timezone
from django.db import transaction, IntegrityError
from rest_framework.exceptions import ValidationError, PermissionDenied

from ..models import LobbyRoom, LobbyParticipant, Answer, Question
from .history_service import HistoryService


class AnswerService:
    """
    Encapsulates business logic for submitting and evaluating answers.
    """

    def _evaluate_answer(self, question: Question, payload: dict):
        """
        Evaluates a user's answer payload against the question's answer key.
        """
        key = question.answer_key
        if not payload:
            return False

        if question.type == Question.Type.MCQ:
            return key.get("correct_index") == payload.get("index")

        if question.type == Question.Type.TRUE_FALSE:
            return key.get("is_true") == payload.get("answer")

        if question.type == Question.Type.SHORT_TEXT:
            submitted_answer = (payload.get("answer") or "").strip()
            if not submitted_answer:
                return False

            accepted_answers = key.get("accepted", [])
            mode = key.get("mode", "casefold")

            if mode == "exact":
                return submitted_answer in accepted_answers
            elif mode == "casefold":
                return submitted_answer.casefold() in [ans.casefold() for ans in accepted_answers]

        return False

    @transaction.atomic
    def submit_answer(self, lobby_id: int, user, payload: dict):
        """
        Processes a user's answer submission for the current question.
        Scores the answer, updates state, and advances to the next question.
        """
        try:
            lobby = LobbyRoom.objects.select_related("current_q__question").get(pk=lobby_id, host=user)
            participant = LobbyParticipant.objects.get(lobby=lobby, user=user)
        except (LobbyRoom.DoesNotExist, LobbyParticipant.DoesNotExist):
            raise PermissionDenied("You are not in this lobby.")

        if lobby.status != LobbyRoom.Status.RUNNING:
            raise ValidationError("Lobby is not active.")
        if not lobby.current_q or not lobby.question_started_at:
            raise ValidationError("No question is currently active.")

        # --- Time validation ---
        duration = lobby.current_q.effective_timer()
        elapsed = (timezone.now() - lobby.question_started_at).total_seconds()
        if elapsed > duration:
            is_correct = False
            points = 0
            # Create a record for the late answer
            Answer.objects.create(
                lobby=lobby,
                participant=participant,
                quiz_question=lobby.current_q,
                payload=payload,
                is_correct=False,
                points_awarded=0,
                response_time_ms=int(elapsed * 1000)
            )
        else:
            # --- Answer Evaluation ---
            question = lobby.current_q.question
            is_correct = self._evaluate_answer(question, payload)
            points = lobby.current_q.effective_points() if is_correct else 0

            # Update participant score
            participant.score += points
            participant.save(update_fields=["score"])

            # Create Answer record
            try:
                Answer.objects.create(
                    lobby=lobby,
                    participant=participant,
                    quiz_question=lobby.current_q,
                    payload=payload,
                    is_correct=is_correct,
                    points_awarded=points,
                    response_time_ms=int(elapsed * 1000)
                )
            except IntegrityError:
                raise ValidationError("You have already answered this question.")

        # --- Advance to Next Question or End ---
        current_order = lobby.current_q.order
        next_q = (
            lobby.quiz.quiz_questions.filter(order__gt=current_order)
            .order_by("order")
            .first()
        )

        if next_q:
            lobby.current_q = next_q
            lobby.question_started_at = timezone.now()
            lobby.save()
            return {"status": "next_question", "score": participant.score}
        else:
            # End of quiz
            lobby.status = LobbyRoom.Status.ENDED
            lobby.ended_at = timezone.now()
            lobby.current_q = None
            lobby.question_started_at = None
            lobby.save()

            # Create historical participation record
            history_service = HistoryService()
            participation = history_service.create_participation_record(
                lobby=lobby,
                participant=participant,
            )
            return {"status": "finished", "score": participant.score, "participation_id": participation.id}