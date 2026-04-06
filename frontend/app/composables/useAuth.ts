import type { TeacherProfile } from '@hurgadan/teachly-contracts'

const TOKEN_KEY = 'auth_token'

const user = ref<TeacherProfile | null>(null)
const isAuthenticated = computed(() => !!user.value)

export function useAuth() {
  const { api } = useApi()

  function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
  }

  function removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  }

  function hasToken(): boolean {
    if (import.meta.server) return false
    return !!localStorage.getItem(TOKEN_KEY)
  }

  async function login(email: string, password: string) {
    const result = await api<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    setToken(result.accessToken)
    await fetchUser()
  }

  async function register(email: string, password: string) {
    await api('/users', {
      method: 'POST',
      body: { email, password },
    })

    await login(email, password)
  }

  async function fetchUser() {
    try {
      user.value = await api<TeacherProfile>('/users/me')
    } catch {
      user.value = null
      removeToken()
    }
  }

  function logout() {
    user.value = null
    removeToken()
    navigateTo('/login')
  }

  async function initAuth() {
    if (hasToken() && !user.value) {
      await fetchUser()
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    initAuth,
    hasToken,
  }
}
