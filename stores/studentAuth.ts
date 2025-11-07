import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  StudentAuthState,
  StudentLoginRequest,
  StudentLoginResponse,
  StudentChangePasswordRequest
} from '~/composables/store_models/studentAuth'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useStudentAuthStore = defineStore('studentAuth', {
  state: (): StudentAuthState => ({
    ...initState,
    student: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    currentStudent: (state) => state.student,
    studentId: (state) => state.student?.studentId ?? null,
    studentFullname: (state) => state.student?.fullname ?? '',
    studentRoom: (state) => state.student?.room ?? null,
    isLoggedIn: (state) => state.isAuthenticated && !!state.student,
    needChangePassword: (state) => state.student?.isChangePassword ?? false
  },

  actions: {
    async login(requestData: BaseRequestData<StudentLoginRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient({ useAuth: false })
        const response = await httpClient.post<StudentLoginResponse>(
          API_ENDPOINTS.STUDENTS.LOGIN,
          requestData.body
        )

        this.$patch(successState(response))

        // Store token and student data
        this.token = response.data.token
        this.student = response.data.student
        this.isAuthenticated = true

        // Store token in cookie for API calls
        const tokenCookie = useCookie('token', {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
          sameSite: 'lax'
        })
        tokenCookie.value = response.data.token

        // Store student info in localStorage for persistence
        if (process.client) {
          localStorage.setItem('student_info', JSON.stringify(response.data.student))
        }

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        // Clear token cookie
        const tokenCookie = useCookie('token')
        tokenCookie.value = null

        // Clear localStorage
        if (process.client) {
          localStorage.removeItem('student_info')
        }

        // Reset state
        this.token = null
        this.student = null
        this.isAuthenticated = false
        this.$patch(initState)

        // Redirect to login
        await navigateTo('/student/login')
      } catch (error: any) {
        console.error('Logout error:', error)
      }
    },

    async changePassword(requestData: BaseRequestData<StudentChangePasswordRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post(
          API_ENDPOINTS.STUDENTS.CHANGE_PASSWORD,
          requestData.body
        )

        this.$patch(successState(response))

        // Update isChangePassword flag
        if (this.student) {
          this.student.isChangePassword = false
          if (process.client) {
            localStorage.setItem('student_info', JSON.stringify(this.student))
          }
        }

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    // Restore session from cookie and localStorage
    restoreSession() {
      const tokenCookie = useCookie('token')

      // Check if token exists in cookie
      if (tokenCookie.value) {
        this.token = tokenCookie.value
        this.isAuthenticated = true

        // Try to restore student info from localStorage (client side only)
        if (process.client) {
          const studentInfo = localStorage.getItem('student_info')
          if (studentInfo) {
            try {
              this.student = JSON.parse(studentInfo)
            } catch (error) {
              console.error('Failed to parse student info:', error)
            }
          }
        }

        // If we don't have student info, try to extract studentId from token
        if (!this.student) {
          try {
            const { decodeToken } = useJwt()
            const decoded = decodeToken(tokenCookie.value)

            if (decoded && decoded.studentId) {
              // Create minimal student object from token
              this.student = {
                id: decoded.userId,
                studentId: decoded.studentId,
                firstname: '',
                lastname: '',
                fullname: '',
                avatar: null,
                isChangePassword: false,
                room: null
              }
            }
          } catch (error) {
            console.error('Failed to decode token:', error)
          }
        }
      } else {
        // No token, clear everything
        this.token = null
        this.student = null
        this.isAuthenticated = false
      }
    }
  }
})
