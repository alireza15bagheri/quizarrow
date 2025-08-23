import { apiRequest } from './utils';

export async function addQuizQuestion(quizId, question) {
  return apiRequest(`/game/quizzes/${quizId}/questions/`, {
    method: 'POST',
    body: question,
  });
}

export async function deleteQuizQuestion(quizId, questionId) {
  return apiRequest(`/game/quizzes/${quizId}/questions/${questionId}/`, {
    method: 'DELETE',
  });
}

// Corrected the endpoint to include '/update/'
export async function updateQuizQuestion(quizId, questionId, updates) {
  return apiRequest(`/game/quizzes/${quizId}/questions/${questionId}/update/`, {
    method: 'PATCH',
    body: updates,
  });
}