const PUBLIC_ROUTES = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const { hasToken, initAuth } = useAuth()

  const isPublicRoute = PUBLIC_ROUTES.includes(to.path)

  if (!hasToken()) {
    if (!isPublicRoute) {
      return navigateTo('/login')
    }
    return
  }

  await initAuth()

  if (isPublicRoute) {
    return navigateTo('/')
  }
})
