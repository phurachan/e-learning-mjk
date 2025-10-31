import { defineStore } from 'pinia'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { API_ENDPOINTS } from '~/composables/constants/api'
import { initState } from '~/composables/store_models/base'
import type { BaseRequestData } from '~/composables/store_models/base'
import type { AuthState, AuthLoginRequest, AuthRegisterRequest } from '~/composables/store_models/auth'
import type { User } from '~/composables/data_models/user-management'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    ...initState,
    user: null,
    isAuthenticated: false,
    isInitializing: false,
    hasInitialized: false,
  }),

  persist: false, // Don't persist auth state - use cookies instead

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    token: () => useCookie('token').value,
  },

  actions: {
    async login(requestData: BaseRequestData<AuthLoginRequest> = {}) {
      try {
        this.requestData = { ...requestData };

        const httpClient = useHttpClient({ useAuth: false })
        const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, requestData.body)

        // Cookies are now set server-side, just update store state
        this.user = response?.data?.user
        this.isAuthenticated = true

        
        // Navigate to admin after successful login
        await navigateTo('/admin')
        
        this.responseData = { ...(response || {}) };
        return response
      } catch (error: any) {
        this.isAuthenticated = false
        this.responseData = { ...(error || {}) };
        throw new BaseResponseError(error?.data || error);
        // throw new Error(error.message || 'Login failed')
      }
    },

    async logout() {
      // Clear cookies
      const tokenCookie = useCookie('token', { default: () => null, watch: false })
      const userCookie = useCookie('user', { default: () => null, watch: false })

      tokenCookie.value = null
      userCookie.value = null

      this.user = null
      this.isAuthenticated = false

      await navigateTo('/login')
    },

    async register(requestData: BaseRequestData<AuthRegisterRequest> = {}) {
      try {
        this.requestData = { ...requestData };

        const httpClient = useHttpClient({ useAuth: false })
        const response = await httpClient.post(API_ENDPOINTS.AUTH.REGISTER, requestData.body)

        // Store token in cookie
        const tokenCookie = useCookie('token', {
          default: () => null,
          secure: false, // Allow HTTP in development
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          watch: false
        })
        const userCookie = useCookie<User | null>('user', {
          default: () => null,
          secure: false, // Allow HTTP in development
          httpOnly: false,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          watch: false
        })

        tokenCookie.value = response?.data?.token
        userCookie.value = response?.data?.user
        this.user = response?.data?.user
        this.isAuthenticated = true

        this.responseData = { ...(response || {}) };
        return response
      } catch (error: any) {
        throw new Error(error.message || 'Registration failed')
      }
    },

    async fetchCurrentUser() {
      const tokenCookie = useCookie('token', {
        default: () => null,
        watch: false
      })
      if (!tokenCookie.value) {
        this.isAuthenticated = false
        return null
      }

      try {
        const httpClient = useHttpClient({ useAuth: true })
        const response = await httpClient.get(API_ENDPOINTS.AUTH.ME)

        // Update user cookie
        const userCookie = useCookie<User | null>('user', {
          default: () => null,
          watch: false
        })
        userCookie.value = response?.data?.user

        this.user = response?.data?.user
        this.isAuthenticated = true

        this.responseData = { ...(response || {}) };
        return response
      } catch (error: any) {
        
        // Token is invalid, clear auth state but don't redirect
        this.user = null
        this.isAuthenticated = false

        // Clear cookies
        const tokenCookie = useCookie('token', { default: () => null, watch: false })
        const userCookie = useCookie<User | null>('user', { default: () => null, watch: false })
        tokenCookie.value = null
        userCookie.value = null

        return null
      }
    },

    async initializeAuth() {
      if (this.hasInitialized) {
        return
      }
      this.isInitializing = true

      try {
        const tokenCookie = useCookie('token', {
          default: () => null,
          watch: false
        })
        const userCookie = useCookie<User | null>('user', {
          default: () => null,
          watch: false
        })

        if (tokenCookie.value && userCookie.value) {
          // Set initial state from cookies
          this.user = userCookie.value
          this.isAuthenticated = true

          // Try to validate token in background, but don't block navigation
          try {
            const result = await this.fetchCurrentUser()
            if (!result) {
              // Only clear if token validation explicitly fails
              this.isAuthenticated = false
              this.user = null
            }
          } catch (error) {
            // If validation fails, keep cookies but mark as unauthenticated
            // This allows graceful handling without immediate logout
            this.isAuthenticated = false
            this.user = null
          }
        } else {
          this.isAuthenticated = false
          this.user = null
        }
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
      }

      this.isInitializing = false
      this.hasInitialized = true
    },
  },
})