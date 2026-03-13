import { getBackendUrl } from './env'

const BACKEND_URL = getBackendUrl()

// Pass the super admin JWT (from the session cookie) on every call.
// No env-var credentials needed — the token is issued by the backend on login.
export async function backendFetch(path: string, token: string, options: RequestInit = {}) {
  if (!BACKEND_URL) {
    throw new Error('Backend URL is not configured')
  }
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  })
}
