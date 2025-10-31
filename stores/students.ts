import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  StudentCreateRequest,
  StudentDeleteRequest,
  StudentImportRequest,
  StudentListRequest,
  StudentsState,
  StudentUpdateRequest
} from '~/composables/store_models/students'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useStudentsStore = defineStore('students', {
  state: (): StudentsState => ({
    ...initState
  }),

  getters: {
    getStudentById: (state) => (id: string) => state.list?.find((student: any) => student.id === id),
    totalStudents: (state) => state.pagination?.total ?? 0,
    activeStudents: (state) => state.list?.filter((student: any) => student.isActive) ?? []
  },

  actions: {
    async fetchStudents(requestData: BaseRequestData<StudentListRequest> = {}) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.STUDENTS.LIST,
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

    async fetchStudent(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.STUDENTS.SHOW(requestData.body!.id)
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

    async createStudent(requestData: BaseRequestData<StudentCreateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post(
          API_ENDPOINTS.STUDENTS.CREATE,
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

    async updateStudent(requestData: BaseRequestData<StudentUpdateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.put(
          API_ENDPOINTS.STUDENTS.UPDATE(requestData.body!.id),
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

    async deleteStudent(requestData: BaseRequestData<StudentDeleteRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.delete(
          API_ENDPOINTS.STUDENTS.DELETE(requestData.body!.id)
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

    async importStudents(requestData: BaseRequestData<StudentImportRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const formData = new FormData()
        formData.append('file', requestData.body!.file)

        const response = await httpClient.post(
          API_ENDPOINTS.STUDENTS.IMPORT,
          formData
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
