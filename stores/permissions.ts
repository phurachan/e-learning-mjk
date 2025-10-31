import { defineStore } from 'pinia'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { API_ENDPOINTS } from '~/composables/constants/api'
import { initState } from '~/composables/store_models/base'
import type { BaseRequestData } from '~/composables/store_models/base'
import type {
  PermissionListRequest,
  PermissionsState,
  PermissionCreateRequest,
  PermissionUpdateRequest,
  PermissionDeleteRequest
} from '~/composables/store_models/permissions'

export const usePermissionsStore = defineStore('permissions', {
  state: (): PermissionsState => ({
    ...initState,
    modules: []
  }),

  getters: {
    getPermissionById: (state) => (id: string) => state.list?.find((permission: any) => permission.id === id),
    totalPermissions: (state) => state.pagination?.total ?? 0
  },

  actions: {
    async fetchPermissions(requestData: BaseRequestData<PermissionListRequest> = {}) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.PERMISSIONS.LIST,
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

    async fetchModules(requestData: BaseRequestData = {}) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(API_ENDPOINTS.PERMISSIONS.MODULES)

        this.$patch(successState(response))
        this.modules = [...(response?.modules || [])]

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchPermission(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.PERMISSIONS.SHOW(requestData.body!.id)
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

    async createPermission(requestData: BaseRequestData<PermissionCreateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post(
          API_ENDPOINTS.PERMISSIONS.CREATE,
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

    async updatePermission(requestData: BaseRequestData<PermissionUpdateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.put(
          API_ENDPOINTS.PERMISSIONS.UPDATE(requestData.body!.id),
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

    async deletePermission(requestData: BaseRequestData<PermissionDeleteRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.delete(
          API_ENDPOINTS.PERMISSIONS.DELETE(requestData.body!.id)
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
  }
})