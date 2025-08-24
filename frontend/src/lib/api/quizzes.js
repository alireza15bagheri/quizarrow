import { apiRequest } from './utils';

export async function hostNewQuiz(payload) {
  return apiRequest('/game/quizzes/new/', {
    method: 'POST',
    body: payload,
  });
}

export async function getMyQuizzes() {
  return apiRequest('/game/quizzes/mine/', { method: 'GET' });
}

export async function deleteQuiz(id) {
  return apiRequest(`/game/quizzes/mine/${id}/`, { method: 'DELETE' });
}

export async function getQuizDetail(id) {
  return apiRequest(`/game/quizzes/${id}/`, { method: 'GET' });
}

export async function updateQuizMeta(id, updates) {
  return apiRequest(`/game/quizzes/${id}/`, {
    method: 'PATCH',
    body: updates,
  });
}

export async function getPublishedQuizzes() {
  return apiRequest('/game/quizzes/published/', { method: 'GET' });
}
