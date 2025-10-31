<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold text-base-content">User Management</h2>
      <BaseButton @click="openCreateUserModal" variant="primary" icon-left="plus">
        Add User
      </BaseButton>
    </div>

    <!-- Search and Filter -->
    <div class="bg-base-100 rounded-lg">
      <div class="flex gap-4">
        <div class="form-control flex-1">
          <BaseInput v-model="userSearch" type="text" placeholder="Search users..." @input="searchUsers" />
        </div>
        <div class="form-control min-w-48">
          <BaseSelect v-model="roleFilter" hide-placeholder :options="roleFilterOptions" @update:model-value="searchUsers" />
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div>
      <BaseTable :data="paginatedUsers" :columns="userColumns" :loading="loading" loading-text="Loading users..."
        empty-title="No users found" empty-text="There are no users to display" empty-icon="users" striped
        :show-edit="false">
        <!-- User Column -->
        <template #user="{ row }">
          <div class="flex items-center gap-3">
            <BaseAvatar :name="row.name" size="sm" />
            <div class="font-medium text-base-content">{{ row.name }}</div>
          </div>
        </template>

        <!-- Roles Column -->
        <template #roles="{ row }">
          <div class="flex flex-wrap gap-1">
            <div v-if="row.roles && row.roles.length > 0">
              <div v-for="role in row.roles" :key="role.id" class="badge badge-outline badge-sm">
                {{ role.name }}
              </div>
            </div>
            <div v-else class="text-base-content/60 text-sm">No roles assigned</div>
          </div>
        </template>

        <!-- Status Column -->
        <template #status="{ row }">
          <div class="badge" :class="row.isActive ? 'badge-success' : 'badge-error'">
            {{ row.isActive ? 'Active' : 'Inactive' }}
          </div>
        </template>

        <!-- Actions Column -->
        <template #actions="{ row }">
          <div class="flex gap-2">
            <BaseButton @click="editUser(row)" variant="ghost" size="sm" icon-left="pencil" title="Edit User" />
            <BaseButton @click="editUserRoles(row)" variant="ghost" size="sm" icon-left="key" title="Edit Roles" />
            <BaseButton @click="deleteUser(row)" variant="ghost" size="sm" icon-left="trash" title="Delete User" class="text-error hover:text-error" />
          </div>
        </template>
      </BaseTable>
      <BasePagination :currentPage="pagination.currentPage.value" :totalPages="pagination.totalPages.value"
        :totalItems="pagination.totalItems.value" :pageSize="pagination.pageSize.value"
        @update:currentPage="handlePageChange" @update:pageSize="handlePageSizeChange" />
    </div>

    <!-- Edit User Roles Modal -->
    <div v-if="showUserRolesModal" class="modal modal-open">
      <div class="modal-box bg-base-100 text-base-content max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Edit User Roles - {{ selectedUser?.name }}</h3>

        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text text-base-content">Available Roles</span>
            </label>
            <div class="max-h-60 overflow-y-auto border border-base-300 rounded p-3">
              <div v-for="role in availableRoles" :key="role.id" class="form-control">
                <label class="label cursor-pointer">
                  <div class="flex-1">
                    <span class="label-text text-base-content font-medium">{{ role.name }}</span>
                    <div class="text-xs text-base-content/60 mt-1">{{ role.description }}</div>
                  </div>
                  <input type="checkbox" class="checkbox" :value="role.id" v-model="selectedRoles" />
                </label>
              </div>
            </div>
          </div>

          <div class="bg-base-200 rounded p-3">
            <h4 class="font-medium text-base-content mb-2">Selected Roles ({{ selectedRoles.length }})</h4>
            <div class="flex flex-wrap gap-2">
              <div v-for="roleId in selectedRoles" :key="roleId" class="badge badge-primary">
                {{ getRoleName(roleId) }}
              </div>
              <div v-if="selectedRoles.length === 0" class="text-base-content/60 text-sm">
                No roles selected
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <BaseButton @click="closeUserRolesModal" variant="ghost">Cancel</BaseButton>
          <BaseButton @click="saveUserRoles" variant="primary" :disabled="savingRoles" :loading="savingRoles">
            Save Changes
          </BaseButton>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeUserRolesModal"></div>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showUserEditModal" class="modal modal-open">
      <div class="modal-box bg-base-100 text-base-content max-w-2xl">
        <h3 class="font-bold text-lg mb-4">{{ editingUser ? 'Edit User' : 'Add User' }}</h3>

        <div class="space-y-4">
          <BaseInput v-model="userForm.name" type="text" label="Name" placeholder="Full name"
            :error="userFormErrors.name" required />

          <BaseInput v-model="userForm.email" type="email" label="Email" placeholder="Email address"
            :error="userFormErrors.email" required />

          <BaseInput v-model="userForm.department" type="text" label="Department" placeholder="Department" />

          <BaseInput v-model="userForm.position" type="text" label="Position" placeholder="Job position" />

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text text-base-content">Active Status</span>
              <input type="checkbox" class="checkbox" v-model="userForm.isActive" />
            </label>
          </div>

          <BaseInput v-model="userForm.password" type="password" :label="editingUser ? 'Change Password' : 'Password'"
            :placeholder="editingUser ? 'New password (optional)' : 'Enter password'" :error="userFormErrors.password"
            :help="editingUser ? 'Leave empty to keep current password' : ''" :required="!editingUser" />
        </div>

        <div class="modal-action">
          <BaseButton @click="closeUserEditModal" variant="ghost">Cancel</BaseButton>
          <BaseButton @click="saveUser" variant="primary" :disabled="savingUser" :loading="savingUser">
            {{ editingUser ? 'Update' : 'Create' }}
          </BaseButton>
        </div>
      </div>
      <div class="modal-backdrop" @click="closeUserEditModal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUsersStore } from '~/stores/users'
import { useRolesStore } from '~/stores/roles'

// Stores
const usersStore = useUsersStore()
const rolesStore = useRolesStore()

// Reactive data
const savingRoles = ref(false)
const savingUser = ref(false)
const userSearch = ref('')
const roleFilter = ref('')
const showUserRolesModal = ref(false)
const showUserEditModal = ref(false)
const selectedUser = ref<any>(null)
const editingUser = ref<any>(null)
const selectedRoles = ref<string[]>([])

// Computed store getters
const loading = computed(() => usersStore.isLoading)
const users = computed(() => usersStore.list || [])

// Available roles from DB
const availableRoles = computed(() => rolesStore.list || [])

// Role filter options for select dropdown
const roleFilterOptions = computed(() => {
  const options = [{ value: '', label: 'All Roles' }]
  if (availableRoles.value.length > 0) {
    availableRoles.value.forEach((role: any) => {
      options.push({ value: role.id, label: role.name })
    })
  }
  return options
})

// User edit form
const userForm = reactive({
  name: '',
  email: '',
  department: '',
  position: '',
  isActive: true,
  password: ''
})

const userFormErrors = reactive({
  name: '',
  email: '',
  password: ''
})

// Table columns definition
const userColumns = ref([
  {
    key: 'user',
    label: 'User',
    icon: 'user'
  },
  {
    key: 'email',
    label: 'Email',
    icon: 'envelope'
  },
  {
    key: 'roles',
    label: 'Current Roles',
    icon: 'users'
  },
  {
    key: 'status',
    label: 'Status',
    icon: 'check-circle'
  }
])

// Pagination
const pagination = usePagination(10)

// Computed
const paginatedUsers = computed(() => users.value)

// Computed pagination info from store response
const paginationInfo = computed(() => {
  return usersStore.pagination || {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  }
})

// Update pagination when store data changes
watch(paginationInfo, (newPagination) => {
  pagination.totalItems.value = newPagination.total || 0
  pagination.currentPage.value = newPagination.page || 1
  pagination.pageSize.value = newPagination.limit || 50
}, { immediate: true })

// Pagination handlers
const handlePageChange = (page: number) => {
  pagination.goToPage(page)
  fetchUsers() // Refetch data with new page
}

const handlePageSizeChange = (size: number) => {
  pagination.changePageSize(size)
  fetchUsers() // Refetch data with new page size
}

// Methods

const getRoleName = (roleId: string) => {
  const role = availableRoles.value.find((r: any) => r.id === roleId)
  return role ? role.name : 'Unknown'
}

const searchUsers = () => {
  // Reset to first page when searching
  pagination.currentPage.value = 1
  fetchUsers() // Refetch data with search parameters
}

const fetchUsers = async () => {
  try {
    const filterObj: any = {
      isActive: true
    }

    // Add role filter if selected
    if (roleFilter.value) {
      filterObj.roles = roleFilter.value
    }

    await usersStore.fetchUsers({
      query: {
        pagination: {
          page: pagination.currentPage.value,
          limit: pagination.pageSize.value
        },
        filter: filterObj,
        search: userSearch.value || undefined,
      }
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)

    // Handle authentication errors
    if (error.status === 401) {
      console.warn('Authentication required - redirecting to login')
      // The useHttpClient already handles 401 redirects to /login
      return
    }
  }
}


const editUserRoles = async (user: any) => {
  selectedUser.value = user

  // Fetch available roles from DB
  await rolesStore.fetchRoles({
    query: {
      pagination: { page: 1, limit: 100 },
      filter: { isActive: true }
    }
  })

  // Set current user roles from the user object (already populated from API)
  selectedRoles.value = user.roles ? user.roles.map((role: any) => role.id || role._id) : []

  showUserRolesModal.value = true
}

const closeUserRolesModal = () => {
  showUserRolesModal.value = false
  selectedUser.value = null
  selectedRoles.value = []
}

const saveUserRoles = async () => {
  if (!selectedUser.value) return

  savingRoles.value = true

  try {
    // Filter out any null/undefined values
    const validRoleIds = selectedRoles.value.filter(id => id != null && id !== '')

    await usersStore.updateUserRoles({
      body: {
        userId: selectedUser.value.id,
        roleIds: validRoleIds
      }
    })
    useToast().success(ALERT_TEXT.SAVE_SUCCESS.th)

    closeUserRolesModal()
  } catch (error) {
    console.error('Error saving user roles:', error)
    useToast().error(BaseResponseError.getMessageTh(error))
  } finally {
    savingRoles.value = false
  }
}

// User editing methods
const validateUserForm = () => {
  let isValid = true

  // Reset errors
  userFormErrors.name = ''
  userFormErrors.email = ''
  userFormErrors.password = ''

  // Validate name
  if (!userForm.name.trim()) {
    userFormErrors.name = 'Name is required'
    isValid = false
  }

  // Validate email
  if (!userForm.email.trim()) {
    userFormErrors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
    userFormErrors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Validate password
  if (!editingUser.value && !userForm.password.trim()) {
    // Create mode - password required
    userFormErrors.password = 'Password is required'
    isValid = false
  } else if (userForm.password && userForm.password.length < 6) {
    // If password is provided, it must be at least 6 characters
    userFormErrors.password = 'Password must be at least 6 characters long'
    isValid = false
  }

  return isValid
}

const openCreateUserModal = () => {
  editingUser.value = null

  // Reset form for new user
  Object.assign(userForm, {
    name: '',
    email: '',
    department: '',
    position: '',
    isActive: true,
    password: ''
  })

  // Reset errors
  Object.assign(userFormErrors, {
    name: '',
    email: '',
    password: ''
  })

  showUserEditModal.value = true
}

const editUser = (user: any) => {
  editingUser.value = user

  // Populate form with user data
  Object.assign(userForm, {
    name: user.name || '',
    email: user.email || '',
    department: user.department || '',
    position: user.position || '',
    isActive: user.isActive !== false,
    password: ''
  })

  // Reset errors
  Object.assign(userFormErrors, {
    name: '',
    email: '',
    password: ''
  })

  showUserEditModal.value = true
}

const closeUserEditModal = () => {
  showUserEditModal.value = false
  editingUser.value = null

  // Reset form
  Object.assign(userForm, {
    name: '',
    email: '',
    department: '',
    position: '',
    isActive: true,
    password: ''
  })

  // Reset errors
  Object.assign(userFormErrors, {
    name: '',
    email: '',
    password: ''
  })
}

const saveUser = async () => {
  if (!validateUserForm()) {
    return
  }

  savingUser.value = true

  try {
    const updateData: any = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      department: userForm.department.trim(),
      position: userForm.position.trim(),
      isActive: userForm.isActive
    }

    // Only include password if it's provided
    if (userForm.password.trim()) {
      updateData.password = userForm.password.trim()
    }

    if (editingUser.value) {
      // Update mode - only include password if provided
      if (userForm.password.trim()) {
        updateData.password = userForm.password.trim()
      }

      await usersStore.updateUser({
        body: {
          id: editingUser.value.id,
          ...updateData
        }
      })
    } else {
      // Create mode - password is required
      if (!userForm.password.trim()) {
        userFormErrors.password = 'Password is required for new users'
        return
      }

      updateData.password = userForm.password.trim()

      await usersStore.createUser({
        body: updateData
      })
    }

    closeUserEditModal()
    await fetchUsers() // Refresh data

    useToast().success(ALERT_TEXT.SAVE_SUCCESS.th)
  } catch (error: any) {
    console.error('Error updating user:', error)
    useToast().error(BaseResponseError.getMessageTh(error))
  } finally {
    savingUser.value = false
  }
}

const deleteUser = async (user: any) => {
  try {
    // Show confirmation dialog using useToast
    const { confirm } = useToast()
    const confirmed = await confirm(
      'ยืนยันการลบผู้ใช้',
      `คุณต้องการลบผู้ใช้ "${user.name}" หรือไม่?\nการดำเนินการนี้ไม่สามารถยกเลิกได้`,
      'error'
    )
    
    if (confirmed) {
      await usersStore.deleteUser({ body: { id: user.id } })
      await fetchUsers() // Refresh data
      useToast().success('ลบผู้ใช้เรียบร้อยแล้ว')
    }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    useToast().error(BaseResponseError.getMessageTh(error))
  }
}

// Load data on mount
onMounted(async () => {
  await fetchUsers()
  await rolesStore.fetchRoles()

})
</script>