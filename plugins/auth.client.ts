export default defineNuxtPlugin({
  name: 'auth-init',
  parallel: false,
  async setup() {
    const authStore = useAuthStore()
    
    // Initialize auth on app start (client-side only)
    if (!authStore.hasInitialized) {
      await authStore.initializeAuth()
    }
  }
})