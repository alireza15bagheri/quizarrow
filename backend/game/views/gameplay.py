from django.db.models import F
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Quiz
from ..serializers import QuizQuestionPublicSerializer, QuizLobbySerializer
from ..services import LobbyService, AnswerService


class PublishedQuizzesListView(generics.ListAPIView):
    """
    Public endpoint to list all published quizzes with publisher info and dates.
    """
    serializer_class = QuizLobbySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Quiz.objects.filter(is_published=True).select_related("host").prefetch_related("tags")


class JoinLobbyView(APIView):
    """
    Starts a new solo quiz session for the logged-in user.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        service = LobbyService()
        lobby = service.start_solo_quiz(quiz_id=quiz_id, user=request.user)
        return Response({"lobby_id": lobby.id}, status=status.HTTP_201_CREATED)


class LobbyStateView(APIView):
    """
    Gets the current state of a game lobby (e.g., current question, time left).
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lobby_id):
        service = LobbyService()
        state = service.get_lobby_state(lobby_id=lobby_id, user=request.user)

        # Serialize the question part of the state if it exists
        if state.get("question"):
            serializer = QuizQuestionPublicSerializer(state["question"])
            state["question"] = serializer.data

        return Response(state)


class SubmitAnswerView(APIView):
    """
    Submits an answer for the current question in a lobby.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lobby_id):
        service = AnswerService()
        result = service.submit_answer(
            lobby_id=lobby_id, user=request.user, payload=request.data
        )
        return Response(result, status=status.HTTP_200_OK)