import json
from channels.generic.websocket import AsyncWebsocketConsumer

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