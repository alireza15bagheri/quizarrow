import { apiRequest } from './utils';

export async function getAllUsers() {
  return apiRequest('/game/admin/users/', { method: 'GET' });
}

export async function updateUser(userId, payload) {
  return apiRequest(`/game/admin/users/${userId}/`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function getAllQuizzes() {
  return apiRequest('/game/admin/quizzes/', { method: 'GET' });
}

export async function adminDeleteQuiz(quizId) {
  return apiRequest(`/game/admin/quizzes/${quizId}/`, { method: 'DELETE' });
}