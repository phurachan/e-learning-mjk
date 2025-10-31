<template>
  <div class="space-y-6">
    <!-- Permissions Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-base-content">Permissions Management</h2>
      <BaseButton
        variant="primary"
        @click="openPermissionModal()"
        icon-left="plus"
      >
        Add Permission
      </BaseButton>
    </div>

    <!-- Permissions Search -->
    <div class="bg-base-100 rounded-lg mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="form-control">
          <BaseInput
            v-model="permissionSearch"
            type="text"
            placeholder="Search permissions..."
            @input="searchPermissions"
          />
        </div>
        <div class="form-control">
          <BaseSelect
            v-model="permissionModuleFilter"
            hide-placeholder
            :options="moduleFilterOptions"
            @update:model-value="searchPermissions"
          />
        </div>
        <div class="form-control">
          <BaseSelect
            v-model="permissionActionFilter"
            hide-placeholder
            :options="[
              { value: '', label: 'All Actions' },
              { value: 'create', label: 'Create' },
              { value: 'read', label: 'Read' },
              { value: 'update', label: 'Update' },
              { value: 'delete', label: 'Delete' },
              { value: 'access', label: 'Access' }
            ]"
            @update:model-value="searchPermissions"
          />
        </div>
        <div class="form-control">
          <BaseSelect
            v-model="permissionTypeFilter"
            hide-placeholder
            :options="[
              { value: '', label: 'All Types' },
              { value: 'menu', label: 'Menu' },
              { value: 'action', label: 'Action' },
              { value: 'input', label: 'Input' }
            ]"
            @update:model-value="searchPermissions"
          />
        </div>
        <div class="form-control">
          <BaseSelect
            v-model="permissionStatusFilter"
            hide-placeholder
            :options="[
              { value: '', label: 'All Status' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]"
            @update:model-value="searchPermissions"
          />
        </div>
      </div>
    </div>

    <!-- Permissions Table -->
    <div class="rounded-lg overflow-hidden">
      <BaseTable
        :data="permissions"
        :columns="permissionColumns"
        :loading="loading"
        loading-text="Loading permissions..."
        empty-title="No permissions found"
        empty-text="There are no permissions to display"
        empty-icon="key"
        striped
        @edit="editPermission"
        @delete="deletePermission"
      >
        <!-- Action Column -->
        <template #action="{ row }">
          <div class="badge badge-outline">{{ row.action }}</div>
        </template>

        <!-- Type Column -->
        <template #type="{ row }">
          <div class="badge" :class="{
            'badge-primary': row.type === 'menu',
            'badge-secondary': row.type === 'action', 
            'badge-accent': row.type === 'input'
          }">
            {{ row.type }}
          </div>
        </template>
        
        <!-- Status Column -->
        <template #status="{ row }">
          <div class="badge" :class="row.isActive ? 'badge-success' : 'badge-error'">
            {{ row.isActive ? 'Active' : 'Inactive' }}
          </div>
        </template>
      </BaseTable>
      <BasePagination
        :currentPage="pagination.currentPage.value"
        :totalPages="pagination.totalPages.value"
        :totalItems="pagination.totalItems.value"
        :pageSize="pagination.pageSize.value"
        @update:currentPage="handlePermissionsPageChange"
        @update:pageSize="handlePermissionsPageSizeChange"
      />
    </div>

    <!-- Permission Modal -->
    <div v-if="showPermissionModal" class="modal modal-open">
      <div class="modal-box bg-base-200 text-base-content">
        <h3 class="font-bold text-lg mb-4">{{ editingPermission ? 'Edit Permission' : 'Add Permission' }}</h3>
        
        <div class="space-y-4">
          <BaseInput
            v-model="permissionForm.name"
            type="text"
            label="Name"
            placeholder="Permission name"
          />
          
          <BaseTextarea
            v-model="permissionForm.description"
            label="Description"
            placeholder="Permission description"
          />
          
          <BaseInput
            v-model="permissionForm.module"
            type="text"
            label="Module"
            placeholder="Module name"
          />
          
          <BaseSelect
            v-model="permissionForm.action"
            label="Action"
            :options="[
              { value: '', label: 'Select action' },
              { value: 'create', label: 'Create' },
              { value: 'read', label: 'Read' },
              { value: 'update', label: 'Update' },
              { value: 'delete', label: 'Delete' },
              { value: 'access', label: 'Access' }
            ]"
          />
          
          <BaseSelect
            v-model="permissionForm.type"
            label="Type"
            :options="[
              { value: 'menu', label: 'Menu' },
              { value: 'action', label: 'Action' },
              { value: 'input', label: 'Input' }
            ]"
          />
          
          <BaseInput
            v-model="permissionForm.resource"
            type="text"
            label="Resource"
            placeholder="Resource name"
          />
          
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-base-content">Active</span>
              <input
                type="checkbox"
                class="checkbox"
                v-model="permissionForm.isActive"
              />
            </label>
          </div>
        </div>
        
        <div class="modal-action">
          <BaseButton @click="closePermissionModal" variant="ghost">Cancel</BaseButton>
          <BaseButton @click="savePermission" variant="primary" :disabled="permissionsStore.isLoading" :loading="permissionsStore.isLoading">
            {{ editingPermission ? 'Update' : 'Create' }}
          </BaseButton>
        </div>
      </div>
      <div class="modal-backdrop" @click="closePermissionModal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissionsStore } from '~/stores/permissions'

// Stores
const permissionsStore = usePermissionsStore()

// Reactive data
const showPermissionModal = ref(false)
const editingPermission = ref<any>(null)
const permissionSearch = ref('')
const permissionModuleFilter = ref('')
const permissionActionFilter = ref('')
const permissionTypeFilter = ref('')
const permissionStatusFilter = ref('')
const permissionForm = reactive({
  name: '',
  description: '',
  module: '',
  action: '',
  resource: '',
  type: 'action',
  isActive: true
})

// Pagination
const pagination = usePagination()

// Computed store getters
const loading = computed(() => permissionsStore.isLoading)
const permissions = computed(() => permissionsStore.list || [])

// Dynamic module filter options
const moduleFilterOptions = computed(() => {
  const modules = new Set([''])
  if (permissions.value.length > 0) {
    permissions.value.forEach((permission: any) => {
      if (permission.module) {
        modules.add(permission.module)
      }
    })
  }
  
  const options = [{ value: '', label: 'All Modules' }]
  Array.from(modules).filter(m => m !== '').forEach(module => {
    options.push({ 
      value: module, 
      label: module.charAt(0).toUpperCase() + module.slice(1)
    })
  })
  
  return options
})

// Table columns definition
const permissionColumns = ref([
  {
    key: 'name',
    label: 'Name',
    icon: 'key'
  },
  {
    key: 'module',
    label: 'Module',
    icon: 'cube'
  },
  {
    key: 'action',
    label: 'Action',
    icon: 'bolt'
  },
  {
    key: 'type',
    label: 'Type',
    icon: 'tag'
  },
  {
    key: 'resource',
    label: 'Resource',
    icon: 'server'
  },
  {
    key: 'status',
    label: 'Status',
    icon: 'check-circle'
  }
])


// Methods
const searchPermissions = () => {
  // Reset to first page when searching
  pagination.currentPage.value = 1
  fetchPermissions() // Refetch data with search parameters
}

const fetchAllPermissionsForOptions = async () => {
  try {
    // Fetch all permissions without filters to populate module options
    await permissionsStore.fetchPermissions({
      query: {
        pagination: { page: 1, limit: 1000 },
        filter: { isActive: true }
      }
    })
  } catch (error: any) {
    console.error('Error fetching all permissions for options:', error)
  }
}

const fetchPermissions = async () => {
  try {
    await permissionsStore.fetchPermissions({
      query: {
        pagination: {
          page: pagination.currentPage.value,
          limit: pagination.pageSize.value
        },
        filter: {
          isActive: permissionStatusFilter.value ? (permissionStatusFilter.value === 'true') : undefined,
          module: permissionModuleFilter.value || undefined,
          action: permissionActionFilter.value || undefined,
          type: permissionTypeFilter.value || undefined
        },
        search: permissionSearch.value || undefined,
      }
    })
  } catch (error: any) {
    console.error('Error fetching permissions:', error)
    
    // Handle authentication errors
    if (error.status === 401) {
      console.warn('Authentication required - redirecting to login')
      // The useHttpClient already handles 401 redirects to /login
      return
    }
    
    useToast().error(ALERT_TEXT.LOAD_FAILED.th)
  }
}

const openPermissionModal = (permission: any = null) => {
  editingPermission.value = permission
  if (permission) {
    Object.assign(permissionForm, {
      name: permission.name,
      description: permission.description,
      module: permission.module,
      action: permission.action,
      resource: permission.resource,
      type: permission.type || 'action',
      isActive: permission.isActive
    })
  } else {
    Object.assign(permissionForm, {
      name: '',
      description: '',
      module: '',
      action: '',
      resource: '',
      type: 'action',
      isActive: true
    })
  }
  showPermissionModal.value = true
}

const closePermissionModal = () => {
  showPermissionModal.value = false
  editingPermission.value = null
}

const savePermission = async () => {
  try {
    const permissionData: PermissionCreateRequest = {
      name: permissionForm.name,
      description: permissionForm.description,
      module: permissionForm.module,
      action: permissionForm.action,
      resource: permissionForm.resource,
      type: permissionForm.type,
      isActive: permissionForm.isActive
    }

    if (editingPermission.value) {
      if (!editingPermission.value.id) {
        throw new Error('Permission ID is required for update')
      }
      await permissionsStore.updatePermission({
        body: {
          id: editingPermission.value.id,
          ...permissionData
        }
      })
    } else {
      await permissionsStore.createPermission({
        body: permissionData
      })
    }

    closePermissionModal()
    await fetchPermissions() // Refresh data
    
    useToast().success(ALERT_TEXT.SAVE_SUCCESS.th)
  } catch (error) {
    console.error('Error saving permission:', error)
    useToast().error(ALERT_TEXT.SAVE_FAILED.th)
  }
}

const editPermission = (permission: any) => {
  openPermissionModal(permission)
}

const deletePermission = async (permission: any) => {
  try {
    // Show confirmation dialog using useToast
    const { confirm } = useToast()
    const confirmed = await confirm(
      'ยืนยันการลบสิทธิ์',
      `คุณต้องการลบสิทธิ์ "${permission.name}" หรือไม่?\nการดำเนินการนี้ไม่สามารถยกเลิกได้`,
      'error'
    )

    if (confirmed) {
      await permissionsStore.deletePermission({
        body: {
          id: permission.id
        }
      })
      await fetchPermissions() // Refresh data
      useToast().success(ALERT_TEXT.DELETE_SUCCESS.th)
    }
  } catch (error) {
    console.error('Error deleting permission:', error)
    useToast().error(ALERT_TEXT.DELETE_FAILED.th)
  }
}

// Computed pagination info from store response
const paginationInfo = computed(() => {
  const responseData = permissionsStore.responseData
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
const handlePermissionsPageChange = (page: number) => {
  pagination.goToPage(page)
  fetchPermissions() // Refetch data with new page
}

const handlePermissionsPageSizeChange = (size: number) => {
  pagination.changePageSize(size)
  fetchPermissions() // Refetch data with new page size
}

// Load data on mount
onMounted(async () => {
  await fetchAllPermissionsForOptions() // Load all permissions for filter options first
  await fetchPermissions() // Load filtered permissions for table
})
</script>