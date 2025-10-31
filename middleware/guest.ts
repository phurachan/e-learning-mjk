export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  
  // If authenticated, redirect to the intended path or dashboard
  if (authStore.isAuthenticated) {
    const redirect = to.query.redirect as string
    const targetPath = redirect ? decodeURIComponent(redirect) : '/admin'
    return navigateTo(targetPath)
  }
})