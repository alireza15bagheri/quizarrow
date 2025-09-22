from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView

from ..models import QuizQuestion, Question
from ..serializers import QuizQuestionAdminSerializer
from ..permissions import IsHostOrAdmin
from .mixins import QuizEditPermissionMixin


class QuizQuestionAddView(QuizEditPermissionMixin, generics.CreateAPIView):
    """
    Allows the quiz owner to append new questions to an existing quiz.
    Accepts the same `quiz_questions` format as QuizAdminSerializer.
    """

    serializer_class = QuizQuestionAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def create(self, request, *args, **kwargs):
        quiz = self.get_owned_quiz_or_403(kwargs["pk"], allow_published=False)

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
                    author=request.user, **question_data
                )
                link["question"] = question

            # Associate with quiz
            qlink = QuizQuestion.objects.create(quiz=quiz, **link)
            created_links.append(qlink)

        serializer = QuizQuestionAdminSerializer(created_links, many=True)
        return Response(serializer.data, status=201)


class QuizQuestionDeleteView(QuizEditPermissionMixin, APIView):
    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def delete(self, request, pk, qid):
        """
        Delete a specific question from a quiz (by quiz id and quiz_question id).
        """
        quiz = self.get_owned_quiz_or_403(pk, allow_published=False)
        quiz_question = get_object_or_404(QuizQuestion, pk=qid, quiz=quiz)
        quiz_question.delete()
        return Response(
            {"ok": True, "detail": "Question removed"}, status=status.HTTP_204_NO_CONTENT
        )


class QuizQuestionUpdateView(QuizEditPermissionMixin, APIView):
    """
    Partially update a quiz question link (points, timer_seconds).
    Sending null resets to the Question defaults (effective_* fields).
    """

    permission_classes = [permissions.IsAuthenticated, IsHostOrAdmin]

    def patch(self, request, pk, qid):
        quiz = self.get_owned_quiz_or_403(pk, allow_published=False)
        quiz_question = get_object_or_404(QuizQuestion, pk=qid, quiz=quiz)
        serializer = QuizQuestionAdminSerializer(
            quiz_question, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)