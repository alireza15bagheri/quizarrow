from django.urls import path
from .views import HostNewQuizView

urlpatterns = [
    path('quizzes/new/', HostNewQuizView.as_view(), name='host-new-quiz'),
]
