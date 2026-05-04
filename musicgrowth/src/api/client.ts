// ─── Base API client ──────────────────────────────────────────────────────────
// All requests go through here. Handles auth tokens automatically.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  getAccess: () => localStorage.getItem('mg_access'),
  getRefresh: () => localStorage.getItem('mg_refresh'),
  set: (access: string, refresh: string) => {
    localStorage.setItem('mg_access', access)
    localStorage.setItem('mg_refresh', refresh)
  },
  clear: () => {
    localStorage.removeItem('mg_access')
    localStorage.removeItem('mg_refresh')
  },
}

// ─── Refresh access token ─────────────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) return null

  const res = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) {
    tokenStorage.clear()
    window.location.href = '/login'
    return null
  }

  const data = await res.json()
  localStorage.setItem('mg_access', data.access)
  return data.access
}

// ─── Main request function ────────────────────────────────────────────────────
export async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = tokenStorage.getAccess()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Token expired — try refreshing once
  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return request<T>(endpoint, options, false)
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Something went wrong' }))
    throw new Error(error.detail || JSON.stringify(error))
  }

  // Handle empty responses (e.g. DELETE)
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}

// ─── Convenience methods ──────────────────────────────────────────────────────
export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(url: string, data: unknown) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
}