import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  StudentCoursesState,
  StudentCoursesRequest,
  StudentCourseDetailRequest,
  StudentLessonDetailRequest
} from '~/composables/store_models/studentCourses'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useStudentCoursesStore = defineStore('studentCourses', {
  state: (): StudentCoursesState => ({
    ...initState,
    currentCourse: null,
    currentLesson: null
  }),

  getters: {
    courses: (state) => state.list ?? [],
    courseById: (state) => (id: string) => state.list?.find((course: any) => course._id === id),
    totalCourses: (state) => state.list?.length ?? 0,
    hasCurrentCourse: (state) => !!state.currentCourse
  },

  actions: {
    async fetchCourses(requestData: BaseRequestData<StudentCoursesRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        // GET request: ใช้ requestData.query
        const response = await httpClient.get(
          API_ENDPOINTS.STUDENTS.COURSES,
          requestData.query
        )

        this.$patch(successState(response))
        this.list = [...(response?.data || [])]

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchCourseDetail(requestData: BaseRequestData<StudentCourseDetailRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        // GET request: ใช้ requestData.query
        const response = await httpClient.get(
          `${API_ENDPOINTS.STUDENTS.COURSES}/${requestData.body!.courseId}`,
          requestData.query
        )

        this.$patch(successState(response))
        this.currentCourse = response?.data || null

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchLessonDetail(requestData: BaseRequestData<StudentLessonDetailRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        // GET request: ใช้ requestData.query
        const response = await httpClient.get(
          `${API_ENDPOINTS.STUDENTS.LESSONS}/${requestData.body!.lessonId}`,
          requestData.query
        )

        this.$patch(successState(response))
        this.currentLesson = response?.data || null

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    clearCurrentCourse() {
      this.currentCourse = null
    },

    clearCurrentLesson() {
      this.currentLesson = null
    }
  }
})
