const API_BASE = '/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export function useApi() {
  function getToken(): string | null {
    if (import.meta.server) return null
    return localStorage.getItem('auth_token')
  }

  async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body } = options
    const token = getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return $fetch<T>(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  return { api, getToken }
}
