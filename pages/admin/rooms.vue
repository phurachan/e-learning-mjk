<template>
  <div class="space-y-6">
    <BasePageHeader :title="$t('rooms.title')" :subtitle="$t('rooms.subtitle')">
      <template #actions>
        <BaseButton @click="openCreateModal" variant="primary">
          <div class="flex">
            <BaseIcon name="plus" class="w-5 h-5 mr-2" />
            {{ $t('rooms.create') }}
          </div>
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <BaseInput v-model="filters.search" type="search" :placeholder="$t('rooms.searchPlaceholder')"
            @input="handleSearch">
            <template #prepend>
              <BaseIcon name="magnifying-glass" class="w-5 h-5" />
            </template>
          </BaseInput>

          <BaseSelect v-model="filters.grade" :options="gradeOptions" :placeholder="$t('rooms.filterByGrade')"
            @change="handleFilter" />

          <BaseSelect v-model="filters.academicYear" :options="academicYearOptions"
            :placeholder="$t('rooms.filterByYear')" @change="handleFilter" />

          <BaseSelect v-model="filters.isActive" :options="statusOptions" :placeholder="$t('rooms.filterByStatus')"
            @change="handleFilter" />
        </div>

        <BaseLoading v-if="roomsStore.isLoading && !rooms.length" />

        <div v-else-if="rooms.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="room in rooms" :key="room.id" class="card bg-base-200 hover:bg-base-300 transition-all">
            <div class="card-body p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1 cursor-pointer" @click="viewRoom(room)">
                  <h3 class="card-title text-lg">{{ room.name }}</h3>
                  <p class="text-sm text-base-content/70">{{ room.code }}</p>
                </div>
                <div class="dropdown dropdown-end" @click.stop>
                  <label tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                    <BaseIcon name="ellipsis-vertical" class="w-5 h-5" />
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <a @click="closeDropdown(); editRoom(room)" class="flex items-center gap-2">
                        <BaseIcon name="pencil" class="w-4 h-4 text-primary" />
                        <span>{{ $t('common.edit') }}</span>
                      </a>
                    </li>
                    <li>
                      <a @click="closeDropdown(); deleteRoom(room)"
                        class="flex items-center gap-2 text-error hover:bg-error hover:text-error-content">
                        <BaseIcon name="trash" class="w-4 h-4" />
                        <span>{{ $t('common.delete') }}</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="divider my-2"></div>

              <div class="space-y-2 text-sm cursor-pointer" @click="viewRoom(room)">
                <div class="flex items-center gap-2">
                  <BaseIcon name="academic-cap" class="w-4 h-4 text-primary" />
                  <span>{{ $t('rooms.grade') }} {{ room.grade }}/{{ room.section }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <BaseIcon name="calendar" class="w-4 h-4 text-primary" />
                  <span>{{ $t('rooms.year') }} {{ room.academicYear }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <BaseIcon name="users" class="w-4 h-4 text-primary" />
                  <span>{{ $t('rooms.capacity') }}: {{ room.capacity }} {{ $t('rooms.students') }}</span>
                </div>
              </div>

              <div class="card-actions justify-end mt-4 cursor-pointer" @click="viewRoom(room)">
                <div class="badge" :class="room.isActive ? 'badge-success' : 'badge-error'">
                  {{ room.isActive ? $t('common.active') : $t('common.inactive') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <BaseIcon name="academic-cap" class="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <p class="text-lg text-base-content/70">{{ $t('rooms.noData') }}</p>
          <BaseButton @click="openCreateModal" variant="primary" class="mt-4">
            {{ $t('rooms.createFirst') }}
          </BaseButton>
        </div>

        <BasePagination v-if="roomsStore.pagination && (roomsStore.pagination?.total || 0) > filters.limit"
          :current-page="filters.page" :total-pages="roomsStore.pagination.totalPages || 1" :page-size="filters.limit"
          :totalItems="roomsStore.pagination.total" @update:current-page="handlePageChange"
          @update:page-size="handlePageSizeChange" />
      </div>
    </div>

    <BaseModal :visible="isModalOpen" @update:visible="isModalOpen = $event"
      :title="isEditing ? $t('rooms.edit') : $t('rooms.create')" size="lg">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput v-model="form.name" :label="$t('rooms.form.name')" :placeholder="$t('rooms.form.namePlaceholder')"
            required />

          <BaseInput v-model="form.code" :label="$t('rooms.form.code')" :placeholder="$t('rooms.form.codePlaceholder')"
            required />

          <BaseInput v-model.number="form.grade" type="number" :label="$t('rooms.form.grade')"
            :placeholder="$t('rooms.form.gradePlaceholder')" min="1" max="12" required />

          <BaseInput v-model="form.section" :label="$t('rooms.form.section')"
            :placeholder="$t('rooms.form.sectionPlaceholder')" required />

          <BaseInput v-model="form.academicYear" :label="$t('rooms.form.academicYear')"
            :placeholder="$t('rooms.form.academicYearPlaceholder')" required />

          <BaseInput v-model.number="form.capacity" type="number" :label="$t('rooms.form.capacity')"
            :placeholder="$t('rooms.form.capacityPlaceholder')" min="1" required />
        </div>

        <div class="form-control mt-4">
          <BaseCheckbox v-model="form.isActive" :label="$t('rooms.form.isActive')" />
        </div>

        <div class="modal-action">
          <BaseButton @click="closeModal" variant="ghost">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="roomsStore.isLoading">
            {{ isEditing ? $t('common.update') : $t('common.create') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { useRoomsStore } from '~/stores/rooms'
import type { Room } from '~/composables/data_models/rooms'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { t } = useI18n()
const toast = useToast()
const roomsStore = useRoomsStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const rooms = ref<Room[]>([])

const filters = ref({
  page: 1,
  limit: 12,
  search: '',
  grade: '',
  academicYear: '',
  isActive: ''
})

const form = ref({
  id: '',
  name: '',
  code: '',
  grade: 1,
  section: '',
  academicYear: new Date().getFullYear() + 543 + '',
  capacity: 40,
  isActive: true
})

const gradeOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${t('rooms.grade')} ${i + 1}`
  }))
])

const academicYearOptions = computed(() => {
  const currentYear = new Date().getFullYear() + 543
  return [
    { value: '', label: t('common.all') },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: (currentYear - i).toString(),
      label: (currentYear - i).toString()
    }))
  ]
})

const statusOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'true', label: t('common.active') },
  { value: 'false', label: t('common.inactive') }
])

const fetchRooms = async () => {
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

    if (filters.value.grade) {
      query.filter = {
        ...query.filter,
        grade: parseInt(filters.value.grade)
      }
    }

    if (filters.value.academicYear) {
      query.filter = {
        ...query.filter,
        academicYear: parseInt(filters.value.academicYear)
      }
    }

    if (filters.value.isActive) {
      query.filter = {
        ...query.filter,
        isActive: filters.value.isActive === 'true'
      }
    }

    console.log('Fetching rooms with query:', query)

    const response = await roomsStore.fetchRooms({ query })
    rooms.value = response.data || []
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

let searchTimeout: NodeJS.Timeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    fetchRooms()
  }, 500)
}

const handleFilter = () => {
  filters.value.page = 1
  fetchRooms()
}

const handlePageChange = (page: number) => {
  filters.value.page = page
  fetchRooms()
}

const handlePageSizeChange = (limit: number) => {
  filters.value.limit = limit
  filters.value.page = 1
  fetchRooms()
}

const closeDropdown = () => {
  // บังคับปิด dropdown ทั้งหมดโดยการ blur element ที่ active อยู่
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  // ปิด dropdown ทั้งหมดในหน้า
  const dropdowns = document.querySelectorAll('.dropdown')
  dropdowns.forEach(dropdown => {
    const details = dropdown.querySelector('[tabindex]') as HTMLElement
    if (details) {
      details.blur()
    }
  })
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = {
    id: '',
    name: '',
    code: '',
    grade: 1,
    section: '',
    academicYear: new Date().getFullYear() + 543 + '',
    capacity: 40,
    isActive: true
  }
  isModalOpen.value = true
}

const editRoom = (room: Room) => {
  isEditing.value = true
  form.value = {
    id: room.id,
    name: room.name,
    code: room.code,
    grade: room.grade,
    section: room.section,
    academicYear: room.academicYear,
    capacity: room.capacity,
    isActive: room.isActive
  }
  isModalOpen.value = true
}

const viewRoom = (room: Room) => {
  editRoom(room)
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async () => {
  try {
    if (isEditing.value) {
      await roomsStore.updateRoom({ body: form.value })
      toast.success(t('rooms.updateSuccess'))
    } else {
      const { id, ...createData } = form.value
      await roomsStore.createRoom({ body: createData })
      toast.success(t('rooms.createSuccess'))
    }

    closeModal()
    fetchRooms()
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

const deleteRoom = async (room: Room) => {
  const confirmed = await toast.confirm(
    t('rooms.deleteConfirm'),
    t('rooms.deleteConfirmMessage', { name: room.name }),
    'error'
  )

  if (confirmed) {
    try {
      await roomsStore.deleteRoom({ body: { id: room.id } })
      toast.success(t('rooms.deleteSuccess'))
      fetchRooms()
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    }
  }
}

onMounted(() => {
  fetchRooms()
})
</script>
