export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// Read csrftoken from cookie
export function getCookie(name) {
  const v = document.cookie.split('; ').find((row) => row.startsWith(name + '='))
  return v ? decodeURIComponent(v.split('=')[1]) : null
}

/**
 * Generic API request helper to reduce repetition across modules.
 * Handles JSON parsing, CSRF token, credentials, and error shaping.
 */
export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = {
    method,
    headers: {
      ...headers,
    },
    credentials: 'include',
  }

  // Attach CSRF token for unsafe methods
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    opts.headers['X-CSRFToken'] = getCookie('csrftoken') || ''
  }

  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE}${path}`, opts)

  let data
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    const msg = data.error?.message || data.error || data.detail || 'Request failed'
    throw new Error(msg)
  }

  return data
}
