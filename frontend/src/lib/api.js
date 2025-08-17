// Simple API helper: primes CSRF, performs login, session check, and logout.
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// Read csrftoken from cookie
function getCookie(name) {
  const v = document.cookie.split('; ').find((row) => row.startsWith(name + '='))
  return v ? decodeURIComponent(v.split('=')[1]) : null
}

export async function ensureCsrf() {
  await fetch(`${API_BASE}/auth/csrf/`, {
    method: 'GET',
    credentials: 'include',
  })
}

export async function login(username, password) {
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken || '',
    },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data.error || data.detail || 'Login failed'
    throw new Error(msg)
  }
  return res.json()
}

export async function me() {
  const res = await fetch(`${API_BASE}/auth/me/`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!res.ok) return null
  return res.json()
}

export async function logout() {
  const csrftoken = getCookie('csrftoken')
  const res = await fetch(`${API_BASE}/auth/logout/`, {
    method: 'POST',
    headers: { 'X-CSRFToken': csrftoken || '' },
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Logout failed')
}
