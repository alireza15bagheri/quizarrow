from django.urls import path
from .views import (
    HostNewQuizView, MyQuizzesListDeleteView, QuizQuestionAddView,
    MyQuizDetailView, QuizQuestionDeleteView, QuizQuestionUpdateView,
    PublishedQuizzesListView,
)

urlpatterns = [
    path('quizzes/new/', HostNewQuizView.as_view(), name='host-new-quiz'),
    path('quizzes/mine/', MyQuizzesListDeleteView.as_view(), name='my-quizzes'),
    path('quizzes/mine/<int:pk>/', MyQuizzesListDeleteView.as_view(), name='delete-quiz'),
    path('quizzes/<int:pk>/', MyQuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<int:pk>/questions/', QuizQuestionAddView.as_view(), name='quiz-add-question'),
    path('quizzes/<int:pk>/questions/<int:qid>/', QuizQuestionDeleteView.as_view(), name='quiz-delete-question'),
    path('quizzes/<int:pk>/questions/<int:qid>/update/', QuizQuestionUpdateView.as_view(), name='quiz-update-question'),
    path('quizzes/published/', PublishedQuizzesListView.as_view(), name='published-quizzes'),
]
