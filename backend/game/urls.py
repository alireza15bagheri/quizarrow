from django.urls import path
from .views import (
    HostNewQuizView, MyQuizzesListDeleteView, QuizQuestionAddView,
    MyQuizDetailView, QuizQuestionDeleteView, QuizQuestionUpdateView,
    PublishedQuizzesListView, JoinLobbyView, LobbyStateView, SubmitAnswerView,
    MyParticipationsListView, QuizParticipationDetailView,
)

urlpatterns = [
    # --- Quiz Management (for hosts) ---
    path('quizzes/new/', HostNewQuizView.as_view(), name='host-new-quiz'),
    path('quizzes/mine/', MyQuizzesListDeleteView.as_view(), name='my-quizzes'),
    path('quizzes/mine/<int:pk>/', MyQuizzesListDeleteView.as_view(), name='delete-quiz'),
    path('quizzes/<int:pk>/', MyQuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:pk>/questions/', QuizQuestionAddView.as_view(), name='quiz-add-question'),
    path('quizzes/<int:pk>/questions/<int:qid>/', QuizQuestionDeleteView.as_view(), name='quiz-delete-question'),
    path('quizzes/<int:pk>/questions/<int:qid>/update/', QuizQuestionUpdateView.as_view(), name='quiz-update-question'),
    
    # --- Public & Gameplay ---
    path('quizzes/published/', PublishedQuizzesListView.as_view(), name='published-quizzes'),
    path('lobby/join/<int:quiz_id>/', JoinLobbyView.as_view(), name='join-lobby'),
    path('lobby/<int:lobby_id>/state/', LobbyStateView.as_view(), name='lobby-state'),
    path('lobby/<int:lobby_id>/submit/', SubmitAnswerView.as_view(), name='submit-answer'),

    # --- History ---
    path('participations/mine/', MyParticipationsListView.as_view(), name='my-participations'),
    path('participations/<int:pk>/', QuizParticipationDetailView.as_view(), name='participation-detail'),
]