export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  
  // Initialize auth if not started (client-side only)
  if (process.client && !authStore.hasInitialized && !authStore.isInitializing) {
    await authStore.initializeAuth()
  }
  
  // Wait for auth initialization to complete if it's in progress
  if (process.client && authStore.isInitializing) {
    // Wait for initialization to complete with timeout
    let attempts = 0
    const maxAttempts = 100 // 5 seconds max wait
    
    while (authStore.isInitializing && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50))
      attempts++
    }
    
    // If still initializing after timeout, assume failure
    if (authStore.isInitializing) {
      authStore.isInitializing = false
      authStore.hasInitialized = true
      authStore.isAuthenticated = false
    }
  }
  
  
  // If not authenticated, redirect to login with current path
  if (!authStore.isAuthenticated) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(to.fullPath)}`
    return navigateTo(redirectUrl)
  }
})