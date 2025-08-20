from rest_framework import generics, permissions
from .models import Quiz
from .serializers import QuizAdminSerializer

class HostNewQuizView(generics.CreateAPIView):
    """
    Allows authenticated hosts to create a new quiz.
    """
    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

