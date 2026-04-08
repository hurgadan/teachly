import { AuthApi } from '@hurgadan/teachly-contracts'
import type { BodyLogin, CreateUser, Login, TeacherProfile } from '@hurgadan/teachly-contracts'

const TOKEN_KEY = 'auth_token'

const user = ref<TeacherProfile | null>(null)
const isAuthenticated = computed(() => !!user.value)

type ApiRequest = ReturnType<typeof useApi>['api']

class AuthHttpApi extends AuthApi {
  public constructor(private readonly request: ApiRequest) {
    super()
  }

  protected login(data: BodyLogin): Promise<Login> {
    return this.request<Login>(`${this.baseUrl}/login`, {
      method: 'POST',
      body: data,
    })
  }

  protected logout(): Promise<void> {
    return this.request<void>(`${this.baseUrl}/logout`, {
      method: 'POST',
    })
  }

  public loginUser(data: BodyLogin) {
    return this.login(data)
  }

  public logoutUser() {
    return this.logout()
  }
}

export function useAuth() {
  const { api } = useApi()
  const { createUser, getMyProfile } = useUsersApi()
  const authApi = new AuthHttpApi(api)

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
    const body: BodyLogin = { email, password }
    const result = await authApi.loginUser(body)

    setToken(result.accessToken)
    await fetchUser()
  }

  async function register(email: string, password: string) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const payload: CreateUser = { email, password, timezone }
    await createUser(payload)

    await login(email, password)
  }

  async function fetchUser() {
    try {
      user.value = await getMyProfile()
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
