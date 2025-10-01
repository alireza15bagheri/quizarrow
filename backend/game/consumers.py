import json
import time
import bleach
from django.conf import settings
from django.core.cache import cache
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, ChatMessage
from django.contrib.auth.models import User


class NotificationConsumer(AsyncWebsocketConsumer):
    GROUP_NAME = "quiz_notifications"

    async def connect(self):
        # Reject unauthenticated users
        if not self.scope["user"] or not self.scope["user"].is_authenticated:
            await self.close()
            return

        # Add user to a group for broadcasting
        await self.channel_layer.group_add(self.GROUP_NAME, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Remove user from the broadcast group
        await self.channel_layer.group_discard(self.GROUP_NAME, self.channel_name)

    async def receive(self, text_data):
        # This consumer does not handle incoming messages from clients, only broadcasts
        pass

    # Handler for messages sent to the group
    async def quiz_published(self, event):
        """
        Forwards a 'quiz.published' event from the channel layer to the client,
        but filters out the original publisher to prevent duplicate notifications.
        """
        publisher_id = event.get("publisher_id")

        # Do not send the notification to the user who published the quiz
        if self.scope["user"].id == publisher_id:
            return
            
        # Send a message down to the WebSocket
        await self.send(text_data=json.dumps({
            'type': 'quiz.published',
            'payload': event['payload']
        }))


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"
        self.user = self.scope["user"]

        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        # --- Rate Limiting Check ---
        cache_key = f"chat-ratelimit:{self.user.id}:{self.room_id}"
        num_messages = settings.CHAT_RATE_LIMIT_NUM_MESSAGES
        seconds = settings.CHAT_RATE_LIMIT_SECONDS

        now = time.time()
        # Access cache asynchronously
        history = await database_sync_to_async(cache.get)(cache_key, [])

        # Remove timestamps older than the window
        while history and history[0] < now - seconds:
            history.pop(0)

        if len(history) >= num_messages:
            # Rate limit exceeded, send error and drop message
            await self.send(text_data=json.dumps({
                'error': 'rate_limit_exceeded',
                'message': f'You are sending messages too quickly. Please wait a moment.'
            }))
            return

        history.append(now)
        await database_sync_to_async(cache.set)(cache_key, history, timeout=seconds)
        
        # --- Original Logic ---
        text_data_json = json.loads(text_data)
        # Sanitize message content to prevent XSS
        message = bleach.clean(text_data_json["message"])

        # Save message to database
        new_message = await self.save_message(message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": new_message.message,
                "user_username": self.user.username,
                "timestamp": new_message.timestamp.isoformat(),
            },
        )

    # Receive message from room group
    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "message": event["message"],
                    "user_username": event["user_username"],
                    "timestamp": event["timestamp"],
                }
            )
        )

    @database_sync_to_async
    def save_message(self, message):
        room = ChatRoom.objects.get(id=self.room_id)
        return ChatMessage.objects.create(room=room, user=self.user, message=message)