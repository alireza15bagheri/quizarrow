import { apiRequest } from './utils';

export async function getChatRooms() {
  return apiRequest('/game/chat/rooms/', { method: 'GET' });
}

export async function createChatRoom(name) {
  return apiRequest('/game/chat/rooms/', { method: 'POST', body: { name } });
}

export async function adminDeleteChatRoom(roomId) {
  return apiRequest(`/game/chat/rooms/${roomId}/delete/`, { method: 'DELETE' });
}

export async function getChatRoomDetails(roomId) {
  return apiRequest(`/game/chat/rooms/${roomId}/`, { method: 'GET' });
}

export async function getChatMessages(roomId) {
  return apiRequest(`/game/chat/rooms/${roomId}/messages/`, { method: 'GET' });
}