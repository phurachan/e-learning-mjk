<template>
  <div class="space-y-6">
    <BasePageHeader :title="$t('students.title')" :subtitle="$t('students.subtitle')">
      <template #actions>
        <BaseButton @click="openImportModal" variant="ghost">
          <div class="flex">
            <BaseIcon name="arrow-up-tray" class="w-5 h-5 mr-2" />
            {{ $t('students.import') }}
          </div>
        </BaseButton>
        <BaseButton @click="openCreateModal" variant="primary">
          <div class="flex">
            <BaseIcon name="plus" class="w-5 h-5 mr-2" />
            {{ $t('students.create') }}
          </div>
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <BaseInput v-model="filters.search" type="search" :placeholder="$t('students.searchPlaceholder')"
            @input="handleSearch">
            <template #prepend>
              <BaseIcon name="magnifying-glass" class="w-5 h-5" />
            </template>
          </BaseInput>

          <BaseSelect v-model="filters.room" :options="roomOptions" :placeholder="$t('students.filterByRoom')"
            @change="handleFilter" />

          <BaseSelect v-model="filters.isActive" :options="statusOptions" :placeholder="$t('students.filterByStatus')"
            @change="handleFilter" />
        </div>

        <BaseLoading v-if="studentsStore.isLoading && !students.length" />

        <div v-else-if="students.length" class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>{{ $t('students.table.studentId') }}</th>
                <th>{{ $t('students.table.name') }}</th>
                <th>{{ $t('students.table.phone') }}</th>
                <th>{{ $t('students.table.room') }}</th>
                <th>{{ $t('students.table.status') }}</th>
                <th class="text-right">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td>
                  <div class="font-semibold">{{ student.studentId }}</div>
                </td>
                <td>
                  <div class="flex items-center gap-3">
                    <BaseAvatar :name="student.fullname" size="sm" />
                    <div>
                      <div class="font-semibold">{{ student.fullname }}</div>
                      <div class="text-sm text-base-content/70">{{ formatDate(student.dateOfBirth) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="text-sm">{{ student.phone || '-' }}</div>
                </td>
                <td>
                  <div v-if="student.room" class="badge badge-sm badge-primary">
                    {{ student.room.name }}
                  </div>
                  <div v-else class="text-sm text-base-content/50">-</div>
                </td>
                <td>
                  <div class="badge badge-sm" :class="student.isActive ? 'badge-success' : 'badge-error'">
                    {{ student.isActive ? $t('common.active') : $t('common.inactive') }}
                  </div>
                </td>
                <td>
                  <div class="flex justify-end gap-2">
                    <button @click="viewStudent(student)" class="btn btn-ghost btn-sm" :title="$t('common.view')">
                      <BaseIcon name="eye" class="w-4 h-4" />
                    </button>
                    <button @click="editStudent(student)" class="btn btn-ghost btn-sm" :title="$t('common.edit')">
                      <BaseIcon name="pencil" class="w-4 h-4" />
                    </button>
                    <button @click="deleteStudent(student)" class="btn btn-ghost btn-sm text-error"
                      :title="$t('common.delete')">
                      <BaseIcon name="trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-12">
          <BaseIcon name="user-group" class="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <p class="text-lg text-base-content/70">{{ $t('students.noData') }}</p>
          <BaseButton @click="openCreateModal" variant="primary" class="mt-4">
            {{ $t('students.createFirst') }}
          </BaseButton>
        </div>

        <BasePagination v-if="studentsStore.pagination && (studentsStore.pagination?.total || 0) > filters.limit"
          :current-page="filters.page" :total-pages="studentsStore.pagination.totalPages || 1"
          :page-size="filters.limit" :total="studentsStore.pagination.total" @update:current-page="handlePageChange"
          @update:page-size="handlePageSizeChange" />
      </div>
    </div>

    <BaseModal :visible="isModalOpen" @update:visible="isModalOpen = $event"
      :title="isEditing ? $t('students.edit') : $t('students.create')" size="xl">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput v-model="form.studentId" :label="$t('students.form.studentId')"
            :placeholder="$t('students.form.studentIdPlaceholder')" required :disabled="isEditing" />

          <BaseInput v-model="form.firstname" :label="$t('students.form.firstname')"
            :placeholder="$t('students.form.firstnamePlaceholder')" required />

          <BaseInput v-model="form.lastname" :label="$t('students.form.lastname')"
            :placeholder="$t('students.form.lastnamePlaceholder')" required />

          <BaseInput v-if="!isEditing" v-model="form.password" type="password" :label="$t('students.form.password')"
            :placeholder="$t('students.form.passwordPlaceholder')" />

          <BaseInput v-model="form.phone" type="tel" :label="$t('students.form.phone')"
            :placeholder="$t('students.form.phonePlaceholder')" />

          <BaseSelect v-model="form.room" :options="roomSelectOptions" :label="$t('students.form.room')"
            :placeholder="$t('students.form.roomPlaceholder')" />

          <BaseDatePicker v-model="form.dateOfBirth" :label="$t('students.form.dateOfBirth')"
            :placeholder="$t('students.form.dateOfBirthPlaceholder')" type="date" />

          <BaseInput v-model="form.parentPhone" type="tel" :label="$t('students.form.parentPhone')"
            :placeholder="$t('students.form.parentPhonePlaceholder')" />
        </div>

        <div class="mt-4">
          <BaseInput v-model="form.address" :label="$t('students.form.address')"
            :placeholder="$t('students.form.addressPlaceholder')" />
        </div>

        <div class="mt-4">
          <BaseInput v-model="form.parentName" :label="$t('students.form.parentName')"
            :placeholder="$t('students.form.parentNamePlaceholder')" />
        </div>

        <div class="form-control mt-4">
          <BaseCheckbox v-model="form.isActive" :label="$t('students.form.isActive')" />
        </div>

        <div class="modal-action">
          <BaseButton @click="closeModal" variant="ghost">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="studentsStore.isLoading">
            {{ isEditing ? $t('common.update') : $t('common.create') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <BaseModal :visible="isImportModalOpen" @update:visible="isImportModalOpen = $event"
      :title="$t('students.import')" size="lg">
      <div class="space-y-4">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" class="w-5 h-5" />
          <div>
            <p class="font-semibold">{{ $t('students.importInfo') }}</p>
            <p class="text-sm">{{ $t('students.importDescription') }}</p>
          </div>
        </div>

        <div class="flex gap-2">
          <BaseButton @click="downloadTemplate" variant="secondary" class="flex-1">
            <div class="flex items-center gap-2">
              <BaseIcon name="arrow-down-tray" class="w-5 h-5" />
              <span>{{ $t('students.downloadTemplate') }}</span>
            </div>
          </BaseButton>
        </div>

        <div class="divider">{{ $t('students.uploadFile') }}</div>

        <input ref="fileInput" type="file" class="file-input file-input-bordered w-full" accept=".csv,.xlsx,.xls"
          @change="handleFileSelect" />

        <div v-if="selectedFile" class="alert">
          <BaseIcon name="document" class="w-5 h-5" />
          <span>{{ selectedFile.name }}</span>
        </div>
      </div>

      <div class="modal-action">
        <BaseButton @click="closeImportModal" variant="ghost">
          {{ $t('common.cancel') }}
        </BaseButton>
        <BaseButton @click="handleImport" variant="primary" :loading="studentsStore.isLoading"
          :disabled="!selectedFile">
          {{ $t('students.importButton') }}
        </BaseButton>
      </div>
    </BaseModal>

    <BaseModal :visible="isViewModalOpen" @update:visible="isViewModalOpen = $event"
      :title="$t('students.viewDetails')" size="lg">
      <div v-if="viewingStudent" class="space-y-4">
        <div class="flex items-center gap-4">
          <BaseAvatar :name="viewingStudent.fullname" size="lg" />
          <div>
            <h3 class="text-xl font-bold">{{ viewingStudent.fullname }}</h3>
            <p class="text-sm text-base-content/70">{{ viewingStudent.studentId }}</p>
          </div>
        </div>

        <div class="divider"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-base-content/70">{{ $t('students.form.phone') }}</p>
            <p class="font-semibold">{{ viewingStudent.phone || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-base-content/70">{{ $t('students.form.dateOfBirth') }}</p>
            <p class="font-semibold">{{ formatDate(viewingStudent.dateOfBirth) }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm text-base-content/70">{{ $t('students.form.address') }}</p>
            <p class="font-semibold">{{ viewingStudent.address || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-base-content/70">{{ $t('students.form.parentName') }}</p>
            <p class="font-semibold">{{ viewingStudent.parentName || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-base-content/70">{{ $t('students.form.parentPhone') }}</p>
            <p class="font-semibold">{{ viewingStudent.parentPhone || '-' }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-sm text-base-content/70">{{ $t('students.table.room') }}</p>
            <div v-if="viewingStudent.room" class="badge badge-primary mt-1">
              {{ viewingStudent.room.name }} ({{ viewingStudent.room.code }})
            </div>
            <p v-else class="text-base-content/50">{{ $t('students.noRoom') }}</p>
          </div>
          <div>
            <p class="text-sm text-base-content/70">{{ $t('students.table.status') }}</p>
            <div class="badge mt-1" :class="viewingStudent.isActive ? 'badge-success' : 'badge-error'">
              {{ viewingStudent.isActive ? $t('common.active') : $t('common.inactive') }}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <BaseButton @click="isViewModalOpen = false" variant="ghost">
          {{ $t('common.close') }}
        </BaseButton>
        <BaseButton @click="editStudent(viewingStudent)" variant="primary">
          {{ $t('common.edit') }}
        </BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { useStudentsStore } from '~/stores/students'
import { useRoomsStore } from '~/stores/rooms'
import type { Student } from '~/composables/data_models/students'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { t } = useI18n()
const toast = useToast()
const studentsStore = useStudentsStore()
const roomsStore = useRoomsStore()

const isModalOpen = ref(false)
const isImportModalOpen = ref(false)
const isViewModalOpen = ref(false)
const isEditing = ref(false)
const students = ref<Student[]>([])
const viewingStudent = ref<Student | null>(null)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const filters = ref({
  page: 1,
  limit: 20,
  search: '',
  room: '',
  isActive: ''
})

const form = ref({
  id: '',
  studentId: '',
  firstname: '',
  lastname: '',
  password: '',
  phone: '',
  room: '',
  dateOfBirth: '',
  address: '',
  parentName: '',
  parentPhone: '',
  isActive: true
})

const roomOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...(roomsStore.list || []).map(room => ({
    value: room.id,
    label: room.name
  }))
])

const roomSelectOptions = computed(() => [
  { value: '', label: t('students.form.noRoom') },
  ...(roomsStore.list || []).map(room => ({
    value: room.id,
    label: `${room.name} (${room.code})`
  }))
])

const statusOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'true', label: t('common.active') },
  { value: 'false', label: t('common.inactive') }
])

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

const fetchStudents = async () => {
  try {
    const query: any = {
      pagination: {
        page: filters.value.page,
        limit: filters.value.limit
      },
      filter: {}
    }

    if (filters.value.search) {
      query.search = filters.value.search
    }

    if (filters.value.room) {
      query.filter.room = filters.value.room
    }

    if (filters.value.isActive) {
      query.filter.isActive = filters.value.isActive === 'true'
    }

    const response = await studentsStore.fetchStudents({ query })
    students.value = response.data || []
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

let searchTimeout: NodeJS.Timeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    fetchStudents()
  }, 500)
}

const handleFilter = () => {
  filters.value.page = 1
  fetchStudents()
}

const handlePageChange = (page: number) => {
  filters.value.page = page
  fetchStudents()
}

const handlePageSizeChange = (limit: number) => {
  filters.value.limit = limit
  filters.value.page = 1
  fetchStudents()
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = {
    id: '',
    studentId: '',
    firstname: '',
    lastname: '',
    password: '',
    phone: '',
    room: '',
    dateOfBirth: '',
    address: '',
    parentName: '',
    parentPhone: '',
    isActive: true
  }
  isModalOpen.value = true
}

const editStudent = (student: Student | null) => {
  if (!student) return

  isEditing.value = true
  form.value = {
    id: student.id,
    studentId: student.studentId,
    firstname: student.firstname,
    lastname: student.lastname,
    password: '',
    phone: student.phone || '',
    room: student.room?.id || '',
    dateOfBirth: student.dateOfBirth || '',
    address: student.address || '',
    parentName: student.parentName || '',
    parentPhone: student.parentPhone || '',
    isActive: student.isActive
  }
  isViewModalOpen.value = false
  isModalOpen.value = true
}

const viewStudent = (student: Student) => {
  viewingStudent.value = student
  isViewModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async () => {
  try {
    const submitData: any = {
      studentId: form.value.studentId,
      firstname: form.value.firstname,
      lastname: form.value.lastname,
      isActive: form.value.isActive
    }

    if (form.value.password) submitData.password = form.value.password
    if (form.value.phone) submitData.phone = form.value.phone
    if (form.value.room) submitData.room = form.value.room
    if (form.value.dateOfBirth) submitData.dateOfBirth = form.value.dateOfBirth
    if (form.value.address) submitData.address = form.value.address
    if (form.value.parentName) submitData.parentName = form.value.parentName
    if (form.value.parentPhone) submitData.parentPhone = form.value.parentPhone

    if (isEditing.value) {
      submitData.id = form.value.id
      await studentsStore.updateStudent({ body: submitData })
      toast.success(t('students.updateSuccess'))
    } else {
      await studentsStore.createStudent({ body: submitData })
      toast.success(t('students.createSuccess'))
    }

    closeModal()
    fetchStudents()
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

const deleteStudent = async (student: Student) => {
  const confirmed = await toast.confirm(
    t('students.deleteConfirm'),
    t('students.deleteConfirmMessage', { name: student.fullname }),
    'error'
  )

  if (confirmed) {
    try {
      await studentsStore.deleteStudent({ body: { id: student.id } })
      toast.success(t('students.deleteSuccess'))
      fetchStudents()
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    }
  }
}

const openImportModal = () => {
  selectedFile.value = null
  isImportModalOpen.value = true
}

const closeImportModal = () => {
  selectedFile.value = null
  isImportModalOpen.value = false
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const handleImport = async () => {
  if (!selectedFile.value) return

  try {
    await studentsStore.importStudents({ body: { file: selectedFile.value } })
    toast.success(t('students.importSuccess'))
    closeImportModal()
    fetchStudents()
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

const downloadTemplate = () => {
  const headers = [
    'studentId',
    'firstname',
    'lastname',
    'password',
    'phone',
    'dateOfBirth',
    'address',
    'parentName',
    'parentPhone',
    'isActive'
  ]

  const exampleRow = [
    '12345',
    'สมชาย',
    'ใจดี',
    'password123',
    '0812345678',
    '2010-01-15',
    '123 ถนนสุขุมวิท กรุงเทพฯ 10110',
    'นายสมศักดิ์ ใจดี',
    '0898765432',
    'true'
  ]

  const csvContent = [
    headers.join(','),
    exampleRow.join(','),
    ',,,,,,,,,' // Empty row for user to fill
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', 'students_template.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(async () => {
  await roomsStore.fetchRooms({ query: { pagination: { page: 1, limit: 100 } } })
  fetchStudents()
})
</script>
