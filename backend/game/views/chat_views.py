from rest_framework import generics, permissions
from ..models import ChatRoom, ChatMessage
from ..permissions import IsHostOrAdmin, IsChatRoomOwnerOrAdmin
from ..serializers import ChatRoomSerializer, ChatMessageSerializer


class ChatRoomListCreateView(generics.ListCreateAPIView):
    """
    Lists all chat rooms.
    Allows hosts and admins to create new chat rooms.
    """

    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsHostOrAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ChatRoomRetrieveView(generics.RetrieveAPIView):
    """
    Retrieves the details of a single chat room.
    """
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChatRoomDestroyView(generics.DestroyAPIView):
    """
    Allows the owner of a chat room or an admin to delete it.
    """
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated, IsChatRoomOwnerOrAdmin]


class ChatMessageListView(generics.ListAPIView):
    """
    Lists the last 50 messages for a given chat room.
    """

    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs.get("room_id")
        return ChatMessage.objects.filter(room_id=room_id).order_by("-timestamp")[:50]