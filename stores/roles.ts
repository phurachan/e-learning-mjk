import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState } from '~/composables/store_models/base'
import type {
  RoleCreateRequest,
  RoleDeleteRequest,
  RoleListRequest,
  RolesState,
  RoleUpdateRequest
} from '~/composables/store_models/roles'
import { useHttpClient } from '~/composables/utilities/useHttpClient'

export const useRolesStore = defineStore('roles', {
  state: (): RolesState => ({
    ...initState
  }),

  getters: {
    getRoleById: (state) => (id: string) => state.list?.find((role: any) => role.id === id),
    totalRoles: (state) => state.pagination?.total ?? 0
  },

  actions: {
    async fetchRoles(requestData: BaseRequestData<RoleListRequest> = {}) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()

        const response = await httpClient.get(
          API_ENDPOINTS.ROLES.LIST,
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

    async fetchRole(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get(
          API_ENDPOINTS.ROLES.SHOW(requestData.body!.id)
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

    async createRole(requestData: BaseRequestData<RoleCreateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post(
          API_ENDPOINTS.ROLES.CREATE,
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

    async updateRole(requestData: BaseRequestData<RoleUpdateRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.put(
          API_ENDPOINTS.ROLES.UPDATE(requestData.body!.id),
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

    async deleteRole(requestData: BaseRequestData<RoleDeleteRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.delete(
          API_ENDPOINTS.ROLES.DELETE(requestData.body!.id)
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