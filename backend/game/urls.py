from django.urls import path
from .views import HostNewQuizView, MyQuizzesListDeleteView

urlpatterns = [
    path('quizzes/new/', HostNewQuizView.as_view(), name='host-new-quiz'),
    path('quizzes/mine/', MyQuizzesListDeleteView.as_view(), name='my-quizzes'),  # list
    path('quizzes/mine/<int:pk>/', MyQuizzesListDeleteView.as_view(), name='delete-quiz'),  # delete
]
