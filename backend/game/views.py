from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView

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

        if quiz.is_published:
            raise ValidationError("This quiz is published and cannot be modified.")

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


class MyQuizDetailView(generics.RetrieveUpdateAPIView):
    """
    Returns the details of a single quiz (with questions)
    for the currently authenticated host.
    Allows PATCH/PUT to update quiz meta (e.g., is_published) for owner.
    """
    serializer_class = QuizAdminSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only quizzes created by the logged-in user
        return Quiz.objects.filter(host=self.request.user)

    def update(self, request, *args, **kwargs):
        quiz = self.get_object()
        # Only allow editing if not published, except for toggling is_published itself
        if quiz.is_published:
            # Only is_published can be changed (allow unpublishing)
            allowed_fields = {"is_published"}
            update_fields = set(request.data.keys())
            if not update_fields.issubset(allowed_fields):
                raise ValidationError("This quiz is published and cannot be edited.")
        return super().update(request, *args, **kwargs)


class QuizQuestionDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, qid):
        """
        Delete a specific question from a quiz (by quiz id and quiz_question id).
        """
        quiz = get_object_or_404(Quiz, pk=pk)
        if quiz.host != request.user:
            raise PermissionDenied("You do not have permission to edit this quiz.")

        if quiz.is_published:
            return Response(
                {"error": "This quiz is published and cannot be modified."},
                status=status.HTTP_403_FORBIDDEN,
            )

        quiz_question = get_object_or_404(QuizQuestion, pk=qid, quiz=quiz)
        quiz_question.delete()
        return Response({"ok": True, "detail": "Question removed"}, status=status.HTTP_204_NO_CONTENT)


class QuizQuestionUpdateView(APIView):
    """
    Partially update a quiz question link (points, timer_seconds).
    Sending null resets to the Question defaults (effective_* fields).
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk, qid):
        quiz = get_object_or_404(Quiz, pk=pk)
        if quiz.host != request.user:
            raise PermissionDenied("You do not have permission to edit this quiz.")

        if quiz.is_published:
            return Response(
                {"error": "This quiz is published and cannot be modified."},
                status=status.HTTP_403_FORBIDDEN,
            )

        quiz_question = get_object_or_404(QuizQuestion, pk=qid, quiz=quiz)
        serializer = QuizQuestionAdminSerializer(quiz_question, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)