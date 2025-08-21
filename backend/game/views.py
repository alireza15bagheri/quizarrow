from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.shortcuts import get_object_or_404

from .models import Quiz, QuizQuestion, Question
from .serializers import QuizAdminSerializer, QuizQuestionAdminSerializer


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


class QuizQuestionAddView(generics.CreateAPIView):
    """
    Allows the quiz owner to append new questions to an existing quiz.
    Accepts the same `quiz_questions` format as QuizAdminSerializer.
    """
    serializer_class = QuizQuestionAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        quiz = get_object_or_404(Quiz, pk=kwargs["pk"])
        if quiz.host != request.user:
            raise PermissionDenied("You do not have permission to edit this quiz.")

        # Expecting a payload like {"quiz_questions": [ {...}, {...} ]}
        quiz_questions_data = request.data.get("quiz_questions", [])
        if not isinstance(quiz_questions_data, list):
            return Response({"error": "quiz_questions must be a list"}, status=400)

        created_links = []
        for link in quiz_questions_data:
            # If `question` key is present: create a new Question object
            question_data = link.pop("question", None)
            if question_data:
                question = Question.objects.create(
                    author=request.user,
                    **question_data
                )
                link["question"] = question

            # Associate with quiz
            qlink = QuizQuestion.objects.create(quiz=quiz, **link)
            created_links.append(qlink)

        serializer = QuizQuestionAdminSerializer(created_links, many=True)
        return Response(serializer.data, status=201)


class MyQuizDetailView(generics.RetrieveAPIView):
    """
    Returns the details of a single quiz (with questions)
    for the currently authenticated host.
    """
    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only quizzes created by the logged-in user
        return Quiz.objects.filter(host=self.request.user)