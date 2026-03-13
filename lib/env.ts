function normalizeApiBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return null
  return trimmed
}

export function getBackendUrl() {
  const apiBaseUrl = normalizeApiBaseUrl(process.env.VITE_API_BASE_URL || '')
  console.log('Using backend URL:', apiBaseUrl)
  if (!apiBaseUrl) {
    throw new Error('Missing VITE_API_BASE_URL (expected e.g. http://localhost:8000/api)')
  }

  if (!/\/api$/i.test(apiBaseUrl)) {
    throw new Error('Invalid VITE_API_BASE_URL (must end with /api)')
  }

  // Convert API base URL to backend origin
  return apiBaseUrl.replace(/\/api$/i, '')
}
