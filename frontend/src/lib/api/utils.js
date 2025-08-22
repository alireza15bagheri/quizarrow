export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// Read csrftoken from cookie
export function getCookie(name) {
  const v = document.cookie.split('; ').find((row) => row.startsWith(name + '='))
  return v ? decodeURIComponent(v.split('=')[1]) : null
}
