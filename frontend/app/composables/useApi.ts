interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: BodyInit | Record<string, any> | null
}

export function useApi() {
  function getToken(): string | null {
    if (import.meta.server) return null
    return localStorage.getItem('auth_token')
  }

  async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body } = options
    const token = getToken()
    const config = useRuntimeConfig()
    const apiBase = config.public.apiBase

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return $fetch<T>(`${apiBase}${path}`, {
      method,
      headers,
      body,
    })
  }

  return { api, getToken }
}
