import { apiRequest } from './utils'

export async function ensureCsrf() {
  return apiRequest('/auth/csrf/', { method: 'GET' })
}

export async function login(username, password) {
  return apiRequest('/auth/login/', {
    method: 'POST',
    body: { username, password },
  })
}

export async function me() {
  try {
    return await apiRequest('/auth/me/', { method: 'GET' })
  } catch {
    return null
  }
}

export async function logout() {
  return apiRequest('/auth/logout/', { method: 'POST' })
}
