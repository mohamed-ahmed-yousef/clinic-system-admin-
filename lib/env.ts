function normalizeApiBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return null
  return trimmed
}

export function getBackendUrl() {
  const apiBaseUrl = normalizeApiBaseUrl(process.env.VITE_API_BASE_URL || '')
  if (apiBaseUrl) {
    // Expected: http(s)://host:port/api  → backend origin is everything before `/api`
    return apiBaseUrl
  }

  throw new Error('Missing VITE_API_BASE_URL (expected e.g. http://localhost:8000/api)')
}
