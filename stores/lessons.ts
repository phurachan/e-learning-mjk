import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  LessonCreateRequest,
  LessonDeleteRequest,
  LessonListRequest,
  LessonsState,
  LessonUpdateRequest,
  LessonPublishRequest
} from '~/composables/store_models/lessons'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useLessonsStore = defineStore('lessons', {
  state: (): LessonsState => ({
    ...initState
  }),

  getters: {
    getLessonById: (state) => (id: string) => state.list?.find((lesson: any) => lesson.id === id),
    totalLessons: (state) => state.pagination?.total ?? 0,
    publishedLessons: (state) => state.list?.filter((lesson: any) => lesson.isPublished) ?? [],
    activeLessons: (state) => state.list?.filter((lesson: any) => lesson.isActive) ?? []
  },

  actions: {
    async fetchLessons(requestData: BaseRequestData<LessonListRequest> = {}) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.LESSONS.LIST,
          requestData.query
        )

        this.$patch(successState(response))
        this.list = [...(response?.data || [])]
        this.pagination = { ...(response?.pagination || {}) }

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchLesson(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.LESSONS.SHOW(requestData.body!.id)
        )

        this.$patch(successState(response))
        this.current = { ...(response?.data || {}) }

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async createLesson(requestData: BaseRequestData<LessonCreateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post(
          API_ENDPOINTS.LESSONS.CREATE,
          requestData.body
        )

        this.$patch(successState(response))
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async updateLesson(requestData: BaseRequestData<LessonUpdateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.put(
          API_ENDPOINTS.LESSONS.UPDATE(requestData.body!.id),
          requestData.body
        )

        this.$patch(successState(response))
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async publishLesson(requestData: BaseRequestData<LessonPublishRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.put(
          API_ENDPOINTS.LESSONS.PUBLISH(requestData.body!.id),
          requestData.body
        )

        this.$patch(successState(response))
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async deleteLesson(requestData: BaseRequestData<LessonDeleteRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.delete(
          API_ENDPOINTS.LESSONS.DELETE(requestData.body!.id)
        )

        this.$patch(successState(response))
        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
