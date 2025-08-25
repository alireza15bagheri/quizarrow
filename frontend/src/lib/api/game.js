import { apiRequest } from './utils';

export async function joinLobby(quizId) {
  return apiRequest(`/game/lobby/join/${quizId}/`, { method: 'POST' });
}

export async function getLobbyState(lobbyId) {
  return apiRequest(`/game/lobby/${lobbyId}/state/`, { method: 'GET' });
}

export async function submitAnswer(lobbyId, payload) {
  return apiRequest(`/game/lobby/${lobbyId}/submit/`, {
    method: 'POST',
    body: payload,
  });
}

export async function getMyParticipations() {
  return apiRequest('/game/participations/mine/', { method: 'GET' });
}

export async function getParticipationDetail(id) {
    return apiRequest(`/game/participations/${id}/`, { method: 'GET' });
}