"""
Aggregate and re-export all game views so existing imports like
`from game.views import MyQuizzesListDeleteView` continue to work
after splitting views into domain-specific modules.
"""

from .management import (
    HostNewQuizView,
    MyQuizzesListDeleteView,
    QuizQuestionAddView,
    MyQuizDetailView,
    QuizQuestionDeleteView,
    QuizQuestionUpdateView,
)
from .gameplay import (
    PublishedQuizzesListView,
    JoinLobbyView,
    LobbyStateView,
    SubmitAnswerView,
)
from .history import (
    MyParticipationsListView,
    QuizParticipationDetailView,
)

__all__ = [
    # Quiz Management (for hosts)
    "HostNewQuizView",
    "MyQuizzesListDeleteView",
    "MyQuizDetailView",
    "QuizQuestionAddView",
    "QuizQuestionDeleteView",
    "QuizQuestionUpdateView",
    # Public & Gameplay
    "PublishedQuizzesListView",
    "JoinLobbyView",
    "LobbyStateView",
    "SubmitAnswerView",
    # History
    "MyParticipationsListView",
    "QuizParticipationDetailView",
]