from rest_framework import serializers
from ..models import ChatRoom, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "user_username", "message", "timestamp"]


class ChatRoomSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = ChatRoom
        fields = ["id", "name", "created_by_username", "created_at"]
        read_only_fields = ["id", "created_by_username", "created_at"]