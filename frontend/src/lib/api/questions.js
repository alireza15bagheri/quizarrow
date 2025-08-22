import { API_BASE, getCookie } from './utils'

export async function addQuizQuestion(quizId, question) {
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(`${API_BASE}/game/quizzes/${quizId}/questions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
    body: JSON.stringify(question),
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message || data.detail || 'Failed to add question')
  }
  return res.json()
}

export async function deleteQuizQuestion(quizId, questionId) {
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(`${API_BASE}/game/quizzes/${quizId}/questions/${questionId}/`, {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrftoken || '' },
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message || data.detail || 'Failed to delete question')
  }
}

export async function updateQuizQuestion(quizId, questionId, payload) {
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(`${API_BASE}/game/quizzes/${quizId}/questions/${questionId}/update/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message || data.detail || 'Failed to update question')
  }
  return res.json()
}
