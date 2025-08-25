"""
Aggregate and re‑export all serializers so external code
can still do:  from game.serializers import QuizAdminSerializer, ...
"""

from .tags import TagSerializer
from .questions import QuestionPublicSerializer, QuestionAdminSerializer
from .quizzes import (
    QuizAdminSerializer,
    QuizPublicSerializer,
    QuizQuestionAdminSerializer,
    QuizQuestionPublicSerializer,
)
from .lobby import LobbySerializer, LobbyParticipantSerializer
from .answers import AnswerSerializer, AnswerSubmitSerializer
from .participation import QuizParticipationSerializer

__all__ = [
    # tags
    "TagSerializer",
    # questions
    "QuestionPublicSerializer",
    "QuestionAdminSerializer",
    # quizzes
    "QuizAdminSerializer",
    "QuizPublicSerializer",
    "QuizQuestionAdminSerializer",
    "QuizQuestionPublicSerializer",
    # lobby
    "LobbySerializer",
    "LobbyParticipantSerializer",
    # answers
    "AnswerSerializer",
    "AnswerSubmitSerializer",
    # history
    "QuizParticipationSerializer",
]