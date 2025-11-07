import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  QuizAttemptState,
  QuizAttemptListRequest,
  StartQuizRequest,
  SubmitQuizRequest,
  QuizAttemptDetailRequest
} from '~/composables/store_models/quizAttempt'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useQuizAttemptStore = defineStore('quizAttempt', {
  state: (): QuizAttemptState => ({
    ...initState,
    currentAttempt: null
  }),

  getters: {
    attempts: (state) => state.list ?? [],
    attemptById: (state) => (id: string) => state.list?.find((attempt: any) => attempt._id === id),
    totalAttempts: (state) => state.pagination?.total ?? 0,
    hasCurrentAttempt: (state) => !!state.currentAttempt
  },

  actions: {
    async fetchMyAttempts(requestData: BaseRequestData<QuizAttemptListRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.QUIZ_ATTEMPTS.MY_ATTEMPTS,
          requestData.body
        )

        this.$patch(successState(response))
        this.list = [...(response?.data || [])]
        this.pagination = response?.pagination || null

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error?.data || error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchAttemptDetail(requestData: BaseRequestData<QuizAttemptDetailRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.QUIZ_ATTEMPTS.SHOW(requestData.body!.attemptId)
        )

        this.$patch(successState(response))
        this.currentAttempt = response?.data || null

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error?.data || error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async startQuiz(requestData: BaseRequestData<StartQuizRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post(
          API_ENDPOINTS.QUIZ_ATTEMPTS.START,
          requestData.body
        )

        this.$patch(successState(response))
        this.currentAttempt = response?.data || null

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error?.data || error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async submitQuiz(requestData: BaseRequestData<SubmitQuizRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post(
          API_ENDPOINTS.QUIZ_ATTEMPTS.SUBMIT(requestData.body!.attemptId),
          { answers: requestData.body!.answers }
        )

        this.$patch(successState(response))
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error?.data || error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    clearCurrentAttempt() {
      this.currentAttempt = null
    }
  }
})
