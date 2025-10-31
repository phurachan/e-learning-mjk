<template>
  <div class="space-y-6">
    <BasePageHeader :title="$t('courses.title')" :subtitle="$t('courses.subtitle')">
      <template #actions>
        <BaseButton @click="openCreateModal" variant="primary">
          <div class="flex">
            <BaseIcon name="plus" class="w-5 h-5 mr-2" />
            {{ $t('courses.create') }}
          </div>
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <BaseInput v-model="filters.search" type="search" :placeholder="$t('courses.searchPlaceholder')"
            @input="handleSearch">
            <template #prepend>
              <BaseIcon name="magnifying-glass" class="w-5 h-5" />
            </template>
          </BaseInput>

          <BaseSelect v-model="filters.teacher" :options="teacherOptions" :placeholder="$t('courses.filterByTeacher')"
            @change="handleFilter" />

          <BaseSelect v-model="filters.academicYear" :options="academicYearOptions"
            :placeholder="$t('courses.filterByYear')" @change="handleFilter" />

          <BaseSelect v-model="filters.semester" :options="semesterOptions"
            :placeholder="$t('courses.filterBySemester')" @change="handleFilter" />

          <BaseSelect v-model="filters.isActive" :options="statusOptions" :placeholder="$t('courses.filterByStatus')"
            @change="handleFilter" />
        </div>

        <BaseLoading v-if="coursesStore.isLoading && !courses.length" />

        <div v-else-if="courses.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="course in courses" :key="course.id" class="card bg-base-200 hover:bg-base-300 transition-all">
            <div class="card-body p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1 cursor-pointer" @click="viewCourse(course)">
                  <h3 class="card-title text-lg">{{ course.name }}</h3>
                  <p class="text-sm text-base-content/70">{{ course.code }}</p>
                </div>
                <div class="dropdown dropdown-end" @click.stop>
                  <label tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                    <BaseIcon name="ellipsis-vertical" class="w-5 h-5" />
                  </label>
                  <ul tabindex="0" class="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <a @click="closeDropdown(); editCourse(course)" class="flex items-center gap-2">
                        <BaseIcon name="pencil" class="w-4 h-4 text-primary" />
                        <span>{{ $t('common.edit') }}</span>
                      </a>
                    </li>
                    <li>
                      <a @click="closeDropdown(); deleteCourse(course)"
                        class="flex items-center gap-2 text-error hover:bg-error hover:text-error-content">
                        <BaseIcon name="trash" class="w-4 h-4" />
                        <span>{{ $t('common.delete') }}</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="divider my-2"></div>

              <div class="space-y-2 text-sm cursor-pointer" @click="viewCourse(course)">
                <div v-if="course.description" class="text-base-content/80 line-clamp-2">
                  {{ course.description }}
                </div>
                <div class="flex items-center gap-2">
                  <BaseIcon name="user" class="w-4 h-4 text-primary" />
                  <span>{{ course.teacher.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <BaseIcon name="calendar" class="w-4 h-4 text-primary" />
                  <span>{{ $t('courses.year') }} {{ course.academicYear }} / {{ $t('courses.semester') }} {{
                    course.semester }}</span>
                </div>
                <div v-if="course.rooms.length" class="flex items-center gap-2">
                  <BaseIcon name="academic-cap" class="w-4 h-4 text-primary" />
                  <span>{{ course.rooms.length }} {{ $t('courses.rooms') }}</span>
                </div>
              </div>

              <div class="card-actions justify-end mt-4 cursor-pointer" @click="viewCourse(course)">
                <div class="badge" :class="course.isActive ? 'badge-success' : 'badge-error'">
                  {{ course.isActive ? $t('common.active') : $t('common.inactive') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <BaseIcon name="book-open" class="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <p class="text-lg text-base-content/70">{{ $t('courses.noData') }}</p>
          <BaseButton @click="openCreateModal" variant="primary" class="mt-4">
            {{ $t('courses.createFirst') }}
          </BaseButton>
        </div>

        <BasePagination v-if="coursesStore.pagination && (coursesStore.pagination?.total || 0) > filters.limit"
          :current-page="filters.page" :total-pages="coursesStore.pagination.totalPages || 1" :page-size="filters.limit"
          :totalItems="coursesStore.pagination.total" @update:current-page="handlePageChange"
          @update:page-size="handlePageSizeChange" />
      </div>
    </div>

    <BaseModal :visible="isModalOpen" @update:visible="isModalOpen = $event"
      :title="isEditing ? $t('courses.edit') : $t('courses.create')" size="lg">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-4">
          <BaseInput v-model="form.name" :label="$t('courses.form.name')"
            :placeholder="$t('courses.form.namePlaceholder')" required />

          <BaseInput v-model="form.code" :label="$t('courses.form.code')"
            :placeholder="$t('courses.form.codePlaceholder')" required />

          <BaseTextarea v-model="form.description" :label="$t('courses.form.description')"
            :placeholder="$t('courses.form.descriptionPlaceholder')" />

          <BaseSelect v-model="form.teacher" :label="$t('courses.form.teacher')" :options="teacherSelectOptions"
            :placeholder="$t('courses.form.teacherPlaceholder')" required />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput v-model="form.academicYear" :label="$t('courses.form.academicYear')"
              :placeholder="$t('courses.form.academicYearPlaceholder')" required />

            <BaseSelect v-model.number="form.semester" :label="$t('courses.form.semester')"
              :options="semesterSelectOptions" :placeholder="$t('courses.form.semesterPlaceholder')" required />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ $t('courses.form.rooms') }}</span>
            </label>
            <div class="border border-base-300 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div v-if="availableRooms.length === 0" class="text-center text-base-content/50">
                {{ $t('courses.form.noRooms') }}
              </div>
              <div v-else class="space-y-2">
                <label v-for="room in availableRooms" :key="room.id" class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" :value="room.id" v-model="form.rooms" class="checkbox checkbox-sm" />
                  <span class="text-sm">{{ room.name }} ({{ room.code }})</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="form-control mt-4">
          <BaseCheckbox v-model="form.isActive" :label="$t('courses.form.isActive')" />
        </div>

        <div class="modal-action">
          <BaseButton @click="closeModal" variant="ghost">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="coursesStore.isLoading">
            {{ isEditing ? $t('common.update') : $t('common.create') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { useCoursesStore } from '~/stores/courses'
import { useRoomsStore } from '~/stores/rooms'
import { useUsersStore } from '~/stores/users'
import type { Course } from '~/composables/data_models/courses'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { t } = useI18n()
const toast = useToast()
const coursesStore = useCoursesStore()
const roomsStore = useRoomsStore()
const usersStore = useUsersStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const courses = ref<Course[]>([])
const teachers = ref<any[]>([])
const availableRooms = ref<any[]>([])

const filters = ref({
  page: 1,
  limit: 12,
  search: '',
  teacher: '',
  academicYear: '',
  semester: '',
  isActive: ''
})

const form = ref({
  id: '',
  name: '',
  code: '',
  description: '',
  teacher: '',
  rooms: [] as string[],
  academicYear: new Date().getFullYear() + 543 + '',
  semester: 1,
  isActive: true
})

const teacherOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...teachers.value.map(teacher => ({
    value: teacher.id,
    label: teacher.name
  }))
])

const teacherSelectOptions = computed(() =>
  teachers.value.map(teacher => ({
    value: teacher.id,
    label: teacher.name
  }))
)

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

const semesterOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: '1', label: `${t('courses.semester')} 1` },
  { value: '2', label: `${t('courses.semester')} 2` }
])

const semesterSelectOptions = computed(() => [
  { value: 1, label: `${t('courses.semester')} 1` },
  { value: 2, label: `${t('courses.semester')} 2` }
])

const statusOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'true', label: t('common.active') },
  { value: 'false', label: t('common.inactive') }
])

const fetchTeachers = async () => {
  try {
    const response = await usersStore.fetchUsers({
      query: {
        pagination: { page: 1, limit: 100 },
        filter: { roles: 'teacher', isActive: true }
      }
    })
    teachers.value = response.data || []
  } catch (error: any) {
    console.error('Fetch teachers error:', error)
  }
}

const fetchRooms = async () => {
  try {
    const response = await roomsStore.fetchRooms({
      query: {
        pagination: { page: 1, limit: 100 },
        filter: { isActive: true }
      }
    })
    availableRooms.value = response.data || []
  } catch (error: any) {
    console.error('Fetch rooms error:', error)
  }
}

const fetchCourses = async () => {
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

    if (filters.value.teacher) {
      query.filter = {
        ...query.filter,
        teacher: filters.value.teacher
      }
    }

    if (filters.value.academicYear) {
      query.filter = {
        ...query.filter,
        academicYear: filters.value.academicYear
      }
    }

    if (filters.value.semester) {
      query.filter = {
        ...query.filter,
        semester: parseInt(filters.value.semester)
      }
    }

    if (filters.value.isActive) {
      query.filter = {
        ...query.filter,
        isActive: filters.value.isActive === 'true'
      }
    }

    const response = await coursesStore.fetchCourses({ query })
    courses.value = response.data || []
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

let searchTimeout: NodeJS.Timeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    fetchCourses()
  }, 500)
}

const handleFilter = () => {
  filters.value.page = 1
  fetchCourses()
}

const handlePageChange = (page: number) => {
  filters.value.page = page
  fetchCourses()
}

const handlePageSizeChange = (limit: number) => {
  filters.value.limit = limit
  filters.value.page = 1
  fetchCourses()
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
    description: '',
    teacher: '',
    rooms: [],
    academicYear: new Date().getFullYear() + 543 + '',
    semester: 1,
    isActive: true
  }
  isModalOpen.value = true
}

const editCourse = (course: Course) => {
  isEditing.value = true
  form.value = {
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description || '',
    teacher: course.teacher.id,
    rooms: course.rooms.map(room => room.id),
    academicYear: course.academicYear,
    semester: course.semester,
    isActive: course.isActive
  }
  isModalOpen.value = true
}

const viewCourse = (course: Course) => {
  editCourse(course)
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async () => {
  try {
    const submitData: any = {
      name: form.value.name,
      code: form.value.code,
      teacher: form.value.teacher,
      academicYear: form.value.academicYear,
      semester: form.value.semester,
      isActive: form.value.isActive
    }

    if (form.value.description) {
      submitData.description = form.value.description
    }

    if (form.value.rooms.length > 0) {
      submitData.rooms = form.value.rooms
    }

    if (isEditing.value) {
      await coursesStore.updateCourse({ body: { id: form.value.id, ...submitData } })
      toast.success(t('courses.updateSuccess'))
    } else {
      await coursesStore.createCourse({ body: submitData })
      toast.success(t('courses.createSuccess'))
    }

    closeModal()
    fetchCourses()
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

const deleteCourse = async (course: Course) => {
  const confirmed = await toast.confirm(
    t('courses.deleteConfirm'),
    t('courses.deleteConfirmMessage', { name: course.name }),
    'error'
  )

  if (confirmed) {
    try {
      await coursesStore.deleteCourse({ body: { id: course.id } })
      toast.success(t('courses.deleteSuccess'))
      fetchCourses()
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    }
  }
}

onMounted(() => {
  fetchTeachers()
  fetchRooms()
  fetchCourses()
})
</script>
