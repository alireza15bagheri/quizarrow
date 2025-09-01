"""
Aggregate and re-export all game services so external code
can still do: from game.services import LobbyService, ...
"""

from .lobby_service import LobbyService
from .answer_service import AnswerService
from .history_service import HistoryService

__all__ = ["LobbyService", "AnswerService", "HistoryService"]