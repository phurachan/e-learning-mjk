import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  CourseCreateRequest,
  CourseDeleteRequest,
  CourseListRequest,
  CoursesState,
  CourseUpdateRequest
} from '~/composables/store_models/courses'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useCoursesStore = defineStore('courses', {
  state: (): CoursesState => ({
    ...initState
  }),

  getters: {
    getCourseById: (state) => (id: string) => state.list?.find((course: any) => course.id === id),
    totalCourses: (state) => state.pagination?.total ?? 0,
    activeCourses: (state) => state.list?.filter((course: any) => course.isActive) ?? []
  },

  actions: {
    async fetchCourses(requestData: BaseRequestData<CourseListRequest> = {}) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.COURSES.LIST,
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

    async fetchCourse(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.COURSES.SHOW(requestData.body!.id)
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

    async createCourse(requestData: BaseRequestData<CourseCreateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post(
          API_ENDPOINTS.COURSES.CREATE,
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

    async updateCourse(requestData: BaseRequestData<CourseUpdateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.put(
          API_ENDPOINTS.COURSES.UPDATE(requestData.body!.id),
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

    async deleteCourse(requestData: BaseRequestData<CourseDeleteRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.delete(
          API_ENDPOINTS.COURSES.DELETE(requestData.body!.id)
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
