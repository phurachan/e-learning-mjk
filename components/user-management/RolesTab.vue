<template>
  <div class="space-y-6">
    <!-- Roles Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-base-content">Roles Management</h2>
      <BaseButton variant="primary" @click="openRoleModal()" icon-left="plus">
        Add Role
      </BaseButton>
    </div>

    <!-- Roles Search -->
    <div class="bg-base-100 rounded-lg mb-6">
      <div class="flex gap-4">
        <div class="flex-1">
          <BaseInput v-model="roleSearch" type="text" placeholder="Search roles..." @input="searchRoles" />
        </div>
        <div class="min-w-48">
          <BaseSelect v-model="roleStatusFilter" hide-placeholder :options="[
            { value: '', label: 'All Status' },
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' }
          ]" @update:model-value="searchRoles" />
        </div>
      </div>
    </div>

    <!-- Roles Table -->
    <div class="rounded-lg overflow-hidden">
      <BaseTable :data="roles" :columns="roleColumns" :loading="loading"
        loading-text="Loading roles..." empty-title="No roles found" empty-text="There are no roles to display"
        empty-icon="users" striped @edit="editRole" @delete="deleteRole">
        <!-- Permissions Column -->
        <template #permissions="{ row }">
          <span class="text-base-content">{{ row.permissions.length }} permissions</span>
        </template>

        <!-- Status Column -->
        <template #status="{ row }">
          <div class="badge" :class="row.isActive ? 'badge-success' : 'badge-error'">
            {{ row.isActive ? 'Active' : 'Inactive' }}
          </div>
        </template>
      </BaseTable>
      <BasePagination :currentPage="pagination.currentPage.value" :totalPages="pagination.totalPages.value"
        :totalItems="pagination.totalItems.value" :pageSize="pagination.pageSize.value" @update:currentPage="handleRolesPageChange"
        @update:pageSize="handleRolesPageSizeChange" />
    </div>

    <!-- Role Modal -->
    <div v-if="showRoleModal" class="modal modal-open">
      <div class="modal-box bg-base-200 text-base-content">
        <h3 class="font-bold text-lg mb-4">{{ editingRole ? 'Edit Role' : 'Add Role' }}</h3>

        <div class="space-y-4">
          <BaseInput v-model="roleForm.name" type="text" label="Name" placeholder="Role name" />
          <BaseInput v-model="roleForm.code" type="text" label="Code" placeholder="Role code" />

          <BaseTextarea v-model="roleForm.description" label="Description" placeholder="Role description" />

          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content">Permissions</span>
              <span class="label-text-alt text-base-content/60">{{ Object.keys(groupedPermissions).length }} modules, {{
                permissionsStore.totalPermissions }} total permissions</span>
            </label>
            
            <!-- Permission Type Tabs -->
            <div class="tabs tabs-bordered">
              <a class="tab" :class="{ 'tab-active': activePermissionTab === 'menu' }" @click="activePermissionTab = 'menu'">
                Menu ({{ getPermissionsByType('menu').length }})
              </a>
              <a class="tab" :class="{ 'tab-active': activePermissionTab === 'action' }" @click="activePermissionTab = 'action'">
                Action ({{ getPermissionsByType('action').length }})
              </a>
              <a class="tab" :class="{ 'tab-active': activePermissionTab === 'input' }" @click="activePermissionTab = 'input'">
                Input ({{ getPermissionsByType('input').length }})
              </a>
            </div>
            
            <div class="max-h-80 overflow-y-auto border border-base-300 rounded p-3">
              <div v-for="(permissions, module) in getGroupedPermissionsByType(activePermissionTab)" :key="module" class="mb-4">
                <div class="flex items-center justify-between mb-2 border-b border-base-300 pb-1">
                  <h4 class="font-semibold text-base-content capitalize">
                    {{ module }} ({{ permissions.length }})
                  </h4>
                  <div class="flex gap-1">
                    <BaseButton v-if="!isAllModulePermissionsSelected(permissions)"
                      @click="selectAllPermissionsInModule(permissions)" variant="primary" size="xs" type="button">
                      Select All
                    </BaseButton>
                    <BaseButton v-if="isSomeModulePermissionsSelected(permissions)"
                      @click="deselectAllPermissionsInModule(permissions)" variant="ghost" size="xs" type="button">
                      Clear
                    </BaseButton>
                  </div>
                </div>
                <div class="grid grid-cols-1 gap-1">
                  <div v-for="permission in permissions" :key="permission.id" class="form-control">
                    <label class="label cursor-pointer py-1">
                      <span class="label-text text-base-content text-sm">{{ permission.name }}</span>
                      <input type="checkbox" class="checkbox checkbox-sm" :value="permission.name"
                        v-model="roleForm.permissions" />
                    </label>
                  </div>
                </div>
              </div>

              <!-- No permissions message -->
              <div v-if="getPermissionsByType(activePermissionTab).length === 0" class="text-center py-8 text-base-content/60">
                No {{ activePermissionTab }} permissions available.
              </div>
            </div>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-base-content">Active</span>
              <input type="checkbox" class="checkbox" v-model="roleForm.isActive" />
            </label>
          </div>
        </div>

        <div class="modal-action">
          <BaseButton @click="closeRoleModal" variant="ghost">Cancel</BaseButton>
          <BaseButton @click="saveRole" variant="primary" :disabled="rolesStore.isLoading" :loading="rolesStore.isLoading">
            {{ editingRole ? 'Update' : 'Create' }}
          </BaseButton>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeRoleModal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRolesStore } from '~/stores/roles'
import { usePermissionsStore } from '~/stores/permissions'
import { useAuthStore } from '~/stores/auth'

// Stores
const rolesStore = useRolesStore()
const permissionsStore = usePermissionsStore()
const authStore = useAuthStore()

// Reactive data
const showRoleModal = ref(false)
const editingRole = ref<any>(null)
const roleSearch = ref('')
const roleStatusFilter = ref('')
const activePermissionTab = ref<'menu' | 'action' | 'input'>('menu')
const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  permissions: [] as string[],
  isActive: true
})

// Pagination
const pagination = usePagination()

// Computed store getters
const loading = computed(() => rolesStore.isLoading)
const roles = computed(() => rolesStore.list || [])

// Table columns definition
const roleColumns = ref([
  {
    key: 'name',
    label: 'Name',
    icon: 'tag'
  },
  {
    key: 'code',
    label: 'code',
    icon: 'tag'
  },
  {
    key: 'description',
    label: 'Description',
    icon: 'document-text'
  },
  {
    key: 'permissions',
    label: 'Permissions',
    icon: 'key'
  },
  {
    key: 'status',
    label: 'Status',
    icon: 'check-circle'
  }
])

// Computed properties
const groupedPermissions = computed(() => {
  if (!permissionsStore.list?.length) return {}

  return permissionsStore.list.reduce((groups: any, permission: any) => {
    const module = permission.module || 'other'
    if (!groups[module]) {
      groups[module] = []
    }
    groups[module].push(permission)
    return groups
  }, {})
})

// Helper functions for permission type filtering
const getPermissionsByType = (type: 'menu' | 'action' | 'input') => {
  if (!permissionsStore.list?.length) return []
  return permissionsStore.list.filter((permission: any) => permission.type === type)
}

const getGroupedPermissionsByType = (type: 'menu' | 'action' | 'input') => {
  const permissions = getPermissionsByType(type)
  if (!permissions.length) return {}
  
  return permissions.reduce((groups: any, permission: any) => {
    const module = permission.module || 'other'
    if (!groups[module]) {
      groups[module] = []
    }
    groups[module].push(permission)
    return groups
  }, {})
}

// Helper functions for permission management
const selectAllPermissionsInModule = (permissions: any[]) => {
  const permissionNames = permissions.map(p => p.name)
  // Add all permissions from this module if not already present
  permissionNames.forEach(permName => {
    if (!roleForm.permissions.includes(permName)) {
      roleForm.permissions.push(permName)
    }
  })
}

const deselectAllPermissionsInModule = (permissions: any[]) => {
  const permissionNames = permissions.map(p => p.name)
  // Remove all permissions from this module
  roleForm.permissions = roleForm.permissions.filter(permName =>
    !permissionNames.includes(permName)
  )
}

const isAllModulePermissionsSelected = (permissions: any[]) => {
  return permissions.every(p => roleForm.permissions.includes(p.name))
}

const isSomeModulePermissionsSelected = (permissions: any[]) => {
  return permissions.some(p => roleForm.permissions.includes(p.name))
}


// Methods
const searchRoles = () => {
  // Reset to first page when searching
  pagination.currentPage.value = 1
  fetchRoles() // Refetch data with search parameters
}

const fetchRoles = async () => {
  try {
    await rolesStore.fetchRoles({
      query: {
        pagination: {
          page: pagination.currentPage.value,
          limit: pagination.pageSize.value
        },
        filter: {
          isActive: roleStatusFilter.value ? (roleStatusFilter.value === 'true') : undefined
        },
        search: roleSearch.value || undefined,
      }
    })
  } catch (error: any) {
    console.error('Error fetching roles:', error)
    
    // Handle authentication errors
    if (error.status === 401) {
      console.warn('Authentication required - redirecting to login')
      // The useHttpClient already handles 401 redirects to /login
      return
    }
    
    useToast().error(ALERT_TEXT.LOAD_FAILED.th)
  }
}

const openRoleModal = async (role: any = null) => {
  editingRole.value = role

  // Fetch all permissions without filters for the role modal
  await permissionsStore.fetchPermissions({
    query: {
      pagination: {
        page: 1,
        limit: 1000
      },
    }
  })

  if (role) {
    Object.assign(roleForm, {
      name: role.name,
      code: role.code,
      description: role.description,
      permissions: Array.from(role.permissions || []),
      isActive: role.isActive
    })
  } else {
    Object.assign(roleForm, {
      name: '',
      code: '',
      description: '',
      permissions: [],
      isActive: true
    })
  }
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  editingRole.value = null
}

const saveRole = async () => {
  try {
    const roleData = {
      name: roleForm.name,
      code: roleForm.code,
      description: roleForm.description,
      permissions: roleForm.permissions,
      isActive: roleForm.isActive,
      createdBy: authStore.user?.id
    }

    if (editingRole.value) {
      if (!editingRole.value.id) {
        throw new Error('Role ID is required for update')
      }
      await rolesStore.updateRole({ 
        body: { 
          id: editingRole.value.id, 
          ...roleData 
        } 
      })
    } else {
      await rolesStore.createRole({ body: roleData })
    }

    closeRoleModal()
    await fetchRoles() // Refresh data
    
    useToast().success(ALERT_TEXT.SAVE_SUCCESS.th)
  } catch (error) {
    console.error('Error saving role:', error)
    useToast().error(ALERT_TEXT.SAVE_FAILED.th)
  }
}

const editRole = async (role: any) => {
  await openRoleModal(role)
}

const deleteRole = async (role: any) => {
  if (!role.id) {
    useToast().error('Role ID is required for deletion')
    return
  }

  try {
    // Show confirmation dialog using useToast
    const { confirm } = useToast()
    const confirmed = await confirm(
      'ยืนยันการลบบทบาท',
      `คุณต้องการลบบทบาท "${role.name}" หรือไม่?\nการดำเนินการนี้ไม่สามารถยกเลิกได้`,
      'error'
    )

    if (confirmed) {
      await rolesStore.deleteRole({
        body: {
          id: role.id
        }
      })
      await fetchRoles() // Refresh data
      useToast().success(ALERT_TEXT.DELETE_SUCCESS.th)
    }
  } catch (error) {
    console.error('Error deleting role:', error)
    useToast().error(ALERT_TEXT.DELETE_FAILED.th)
  }
}

// Computed pagination info from store response
const paginationInfo = computed(() => {
  const responseData = rolesStore.responseData
  return responseData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
})

// Update pagination when store data changes
watch(paginationInfo, (newPagination) => {
  pagination.totalItems.value = newPagination.total || 0
  pagination.currentPage.value = newPagination.page || 1
  pagination.pageSize.value = newPagination.limit || 10
}, { immediate: true })

// Pagination handlers
const handleRolesPageChange = (page: number) => {
  pagination.goToPage(page)
  fetchRoles() // Refetch data with new page
}

const handleRolesPageSizeChange = (size: number) => {
  pagination.changePageSize(size)
  fetchRoles() // Refetch data with new page size
}

// Load data on mount
onMounted(async () => {
  await fetchRoles()
})
</script>