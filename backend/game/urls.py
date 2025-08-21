from django.urls import path
from .views import (
    HostNewQuizView, MyQuizzesListDeleteView, QuizQuestionAddView,
    MyQuizDetailView,   # NEW import
)

urlpatterns = [
    path('quizzes/new/', HostNewQuizView.as_view(), name='host-new-quiz'),
    path('quizzes/mine/', MyQuizzesListDeleteView.as_view(), name='my-quizzes'),
    path('quizzes/mine/<int:pk>/', MyQuizzesListDeleteView.as_view(), name='delete-quiz'),
    path('quizzes/<int:pk>/', MyQuizDetailView.as_view(), name='quiz-detail'),  # NEW
    path('quizzes/<int:pk>/questions/', QuizQuestionAddView.as_view(), name='quiz-add-question'),
]
