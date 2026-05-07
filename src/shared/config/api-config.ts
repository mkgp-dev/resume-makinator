const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = rawApiBaseUrl && rawApiBaseUrl.trim().length > 0
  ? rawApiBaseUrl.trim()
  : 'http://localhost:3000'
