import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  StudentDashboardState,
  StudentDashboardRequest,
  DashboardData
} from '~/composables/store_models/studentDashboard'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useStudentDashboardStore = defineStore('studentDashboard', {
  state: (): StudentDashboardState => ({
    ...initState,
    dashboardData: null
  }),

  getters: {
    courses: (state) => state.dashboardData?.courses ?? [],
    upcomingQuizzes: (state) => state.dashboardData?.upcomingQuizzes ?? [],
    recentResults: (state) => state.dashboardData?.recentResults ?? [],
    hasData: (state) => !!state.dashboardData
  },

  actions: {
    async fetchDashboard(requestData: BaseRequestData<StudentDashboardRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get<{ success: boolean; data: DashboardData }>(
          API_ENDPOINTS.STUDENTS.DASHBOARD,
          { studentId: requestData.body!.studentId }
        )

        this.$patch(successState(response))
        this.dashboardData = response.data

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    clearDashboard() {
      this.dashboardData = null
      this.$patch(initState)
    }
  }
})
