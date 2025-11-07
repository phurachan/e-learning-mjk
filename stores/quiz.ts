import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  QuizState,
  QuizListRequest,
  QuizDetailRequest,
  QuizQuestionsRequest
} from '~/composables/store_models/quiz'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useQuizStore = defineStore('quiz', {
  state: (): QuizState => ({
    ...initState,
    currentQuiz: null,
    enrolledCourses: []
  }),

  getters: {
    quizzes: (state) => state.list ?? [],
    quizById: (state) => (id: string) => state.list?.find((quiz: any) => quiz._id === id),
    totalQuizzes: (state) => state.pagination?.total ?? 0,
    hasCurrentQuiz: (state) => !!state.currentQuiz
  },

  actions: {
    async fetchQuizzes(requestData: BaseRequestData<QuizListRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.QUIZZES.LIST,
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

    async fetchQuizDetail(requestData: BaseRequestData<QuizDetailRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.QUIZZES.SHOW(requestData.body!.quizId)
        )

        this.$patch(successState(response))
        this.currentQuiz = response?.data || null
        
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error?.data || error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchQuizQuestions(requestData: BaseRequestData<QuizQuestionsRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.QUIZZES.QUESTIONS(requestData.body!.quizId)
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

    async fetchEnrolledCourses() {
      try {
        const httpClient = useHttpClient()
        const response = await httpClient.get('/students/courses/my-courses')

        this.enrolledCourses = response?.data || []
        return response
      } catch (error: any) {
        console.error('Failed to fetch enrolled courses:', error)
        throw new BaseResponseError(error?.data || error)
      }
    },

    clearCurrentQuiz() {
      this.currentQuiz = null
    }
  }
})
