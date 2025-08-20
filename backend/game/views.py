from rest_framework import generics, permissions
from .models import Quiz
from .serializers import QuizAdminSerializer

class HostNewQuizView(generics.CreateAPIView):
    """
    Allows authenticated hosts to create a new quiz.
    """
    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated]


class MyQuizzesListDeleteView(generics.ListAPIView, generics.DestroyAPIView):
    """
    Lists quizzes belonging to the current user and allows deletion.
    """
    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only quizzes created by this user
        return Quiz.objects.filter(host=self.request.user)

    def delete(self, request, *args, **kwargs):
        """
        Delete a specific quiz (by ID in URL).
        """
        return self.destroy(request, *args, **kwargs)
