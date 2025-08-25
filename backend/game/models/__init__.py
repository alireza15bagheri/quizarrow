"""
Aggregate and re-export all game models so existing imports like
`from game.models import Quiz, LobbyRoom, Answer` continue to work
after splitting models into domain-specific modules.
"""

from .questions import Tag, Question, Quiz, QuizQuestion
from .lobby import LobbyRoom, LobbyBan, LobbyParticipant
from .answers import Answer
from .events import GameEvent
from .participation import QuizParticipation

__all__ = [
    # Question bank
    "Tag",
    "Question",
    "Quiz",
    "QuizQuestion",
    # Lobby / live session
    "LobbyRoom",
    "LobbyBan",
    "LobbyParticipant",
    # Answers & scoring
    "Answer",
    # Event log
    "GameEvent",
    # History
    "QuizParticipation",
]