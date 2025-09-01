import random
import string
from django.utils import timezone
from django.db import transaction, IntegrityError
from rest_framework.exceptions import ValidationError, PermissionDenied

from .models import (
    Quiz, LobbyRoom, LobbyParticipant, QuizQuestion, Answer, Question, QuizParticipation
)


class GameService:
    """
    Encapsulates business logic for the quiz game lifecycle.
    """

    def _generate_lobby_code(self):
        """Generates a unique 8-character uppercase code for a lobby."""
        while True:
            code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not LobbyRoom.objects.filter(code=code).exists():
                return code

    def start_solo_quiz(self, quiz_id, user):
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

    def get_lobby_state(self, lobby_id, user):
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
    def submit_answer(self, lobby_id, user, payload):
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
            participation = QuizParticipation.objects.create(
                user=user,
                quiz=lobby.quiz,
                lobby=lobby,
                final_score=participant.score
            )
            return {"status": "finished", "score": participant.score, "participation_id": participation.id}