// Path: frontend/src/lib/api/utils.js

export const API_BASE = import.meta.env.VITE_API_BASE || '/api';
// Read csrftoken from cookie
export function getCookie(name) {
  const v = document.cookie.split('; ').find((row) => row.startsWith(name + '='));
  return v ? decodeURIComponent(v.split('=')[1]) : null;
}

/**
 * Extracts a descriptive error message from a DRF error response.
 * @param {object} data The JSON response body.
 * @returns {string} A user-friendly error message.
 */
function getApiErrorMessage(data) {
  // Handles standard {"detail": "..."} errors
  if (data.detail) return data.detail;

  // Handles {"error": {"message": "..."}} from the custom json_error helper
  if (data.error?.message) return data.error.message;
  
  // Handles {"error": "..."} for legacy string errors
  if (typeof data.error === 'string') return data.error;

  // Handles non-field errors like ["This quiz cannot be deleted..."]
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors[0];

  // Handles field-specific errors, e.g., {"title": ["This field is required."]}
  const firstKey = Object.keys(data)[0];
  if (firstKey && Array.isArray(data[firstKey])) {
    return `${firstKey}: ${data[firstKey][0]}`;
  }
  
  return 'Request failed';
}

/**
 * Generic API request helper to reduce repetition across modules.
 * Handles JSON parsing, CSRF token, credentials, and error shaping.
 */
export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = {
    method,
    headers: { ...headers },
    credentials: 'include',
  };
  // Attach CSRF token for unsafe methods
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    opts.headers['X-CSRFToken'] = getCookie('csrftoken') || '';
  }

  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    // Use the enhanced helper function to find the best message
    const msg = getApiErrorMessage(data);
    throw new Error(msg);
  }

  return data;
}