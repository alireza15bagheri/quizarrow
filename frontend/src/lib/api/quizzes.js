import { API_BASE, getCookie } from './utils'

export async function hostNewQuiz(payload) {
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(`${API_BASE}/game/quizzes/new/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message || data.detail || 'Failed to create quiz')
  }
  return res.json()
}

export async function getMyQuizzes() {
  const res = await fetch(`${API_BASE}/game/quizzes/mine/`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch quizzes')
  return res.json()
}

export async function deleteQuiz(id) {
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(`${API_BASE}/game/quizzes/mine/${id}/`, {
    method: 'DELETE',
    headers: { 'X-CSRFToken': csrftoken || '' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete quiz')
}

export async function getQuizDetail(id) {
  const res = await fetch(`${API_BASE}/game/quizzes/${id}/`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message || data.detail || 'Failed to fetch quiz details')
  }
  return res.json()
}
