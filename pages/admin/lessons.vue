<template>
  <div class="space-y-6">
    <BasePageHeader :title="$t('lessons.title')" :subtitle="$t('lessons.subtitle')">
      <template #actions>
        <BaseButton @click="openCreateModal" variant="primary">
          <div class="flex">
            <BaseIcon name="plus" class="w-5 h-5 mr-2" />
            {{ $t('lessons.create') }}
          </div>
        </BaseButton>
      </template>
    </BasePageHeader>

    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <BaseInput v-model="filters.search" type="search" :placeholder="$t('lessons.searchPlaceholder')"
            @input="handleSearch">
            <template #prepend>
              <BaseIcon name="magnifying-glass" class="w-5 h-5" />
            </template>
          </BaseInput>

          <BaseSelect v-model="filters.course" :options="courseOptions" :placeholder="$t('lessons.filterByCourse')"
            @change="handleFilter" />

          <BaseSelect v-model="filters.isPublished" :options="publishOptions"
            :placeholder="$t('lessons.filterByPublish')" @change="handleFilter" />

          <BaseSelect v-model="filters.isActive" :options="statusOptions" :placeholder="$t('lessons.filterByStatus')"
            @change="handleFilter" />
        </div>

        <BaseLoading v-if="lessonsStore.isLoading && !lessons.length" />

        <div v-else-if="lessons.length" class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>{{ $t('lessons.table.order') }}</th>
                <th>{{ $t('lessons.table.title') }}</th>
                <th>{{ $t('lessons.table.course') }}</th>
                <th>{{ $t('lessons.table.attachments') }}</th>
                <th>{{ $t('lessons.table.published') }}</th>
                <th>{{ $t('lessons.table.status') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lesson in lessons" :key="lesson.id">
                <td>{{ lesson.order }}</td>
                <td>
                  <div class="font-semibold">{{ lesson.title }}</div>
                  <div v-if="lesson.description" class="text-sm text-base-content/70 line-clamp-1">{{
                    lesson.description }}</div>
                </td>
                <td>
                  <div class="text-sm">{{ lesson.course.name }}</div>
                  <div class="text-xs text-base-content/70">{{ lesson.course.code }}</div>
                </td>
                <td>
                  <div class="badge badge-ghost">
                    {{ lesson.attachments?.length || 0 }} {{ $t('lessons.files') }}
                  </div>
                </td>
                <td>
                  <div class="badge" :class="lesson.isPublished ? 'badge-success' : 'badge-warning'">
                    {{ lesson.isPublished ? $t('common.published') : $t('common.draft') }}
                  </div>
                </td>
                <td>
                  <div class="badge" :class="lesson.isActive ? 'badge-success' : 'badge-error'">
                    {{ lesson.isActive ? $t('common.active') : $t('common.inactive') }}
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button @click="editLesson(lesson)" class="btn btn-ghost btn-sm">
                      <BaseIcon name="pencil" class="w-4 h-4" />
                    </button>
                    <button @click="togglePublish(lesson)" class="btn btn-ghost btn-sm"
                      :class="lesson.isPublished ? 'text-warning' : 'text-success'">
                      <BaseIcon :name="lesson.isPublished ? 'eye-slash' : 'eye'" class="w-4 h-4" />
                    </button>
                    <button @click="deleteLesson(lesson)" class="btn btn-ghost btn-sm text-error">
                      <BaseIcon name="trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-12">
          <BaseIcon name="book-open" class="w-16 h-16 mx-auto text-base-content/30 mb-4" />
          <p class="text-lg text-base-content/70">{{ $t('lessons.noData') }}</p>
          <BaseButton @click="openCreateModal" variant="primary" class="mt-4">
            {{ $t('lessons.createFirst') }}
          </BaseButton>
        </div>

        <BasePagination v-if="lessonsStore.pagination && (lessonsStore.pagination?.total || 0) > filters.limit"
          :current-page="filters.page" :total-pages="lessonsStore.pagination.totalPages || 1" :page-size="filters.limit"
          :totalItems="lessonsStore.pagination.total" @update:current-page="handlePageChange"
          @update:page-size="handlePageSizeChange" />
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal :visible="isModalOpen" @update:visible="isModalOpen = $event"
      :title="isEditing ? $t('lessons.edit') : $t('lessons.create')" size="4xl">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput v-model="form.title" :label="$t('lessons.form.title')"
              :placeholder="$t('lessons.form.titlePlaceholder')" required />

            <BaseSelect v-model="form.course" :label="$t('lessons.form.course')" :options="courseSelectOptions"
              :placeholder="$t('lessons.form.coursePlaceholder')" required />
          </div>

          <BaseTextarea v-model="form.description" :label="$t('lessons.form.description')"
            :placeholder="$t('lessons.form.descriptionPlaceholder')" :rows="2" />

          <!-- Rich Text Editor -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ $t('lessons.form.content') }} *</span>
            </label>
            <BaseRichTextEditor v-model="form.content" :placeholder="$t('lessons.form.contentPlaceholder')" />
          </div>

          <!-- File Attachments -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ $t('lessons.form.attachments') }}</span>
            </label>
            <input ref="fileInput" type="file" multiple class="file-input file-input-bordered w-full"
              @change="handleFileSelect" />
            <label class="label">
              <span class="label-text-alt">{{ $t('lessons.form.attachmentsHint') }}</span>
            </label>

            <!-- Selected Files List -->
            <div v-if="(form.attachments && form.attachments.length > 0) || pendingFiles.length > 0"
              class="mt-2 space-y-2">
              <!-- Existing Attachments -->
              <div v-for="(file, index) in form.attachments" :key="`existing-${index}`"
                class="flex items-center justify-between p-2 bg-base-200 rounded">
                <div class="flex items-center gap-2">
                  <BaseIcon name="document" class="w-4 h-4" />
                  <span class="text-sm">{{ file.name }}</span>
                  <span class="text-xs text-base-content/70">({{ formatFileSize(file.size) }})</span>
                  <span class="badge badge-success badge-xs">{{ $t('lessons.uploaded') }}</span>
                </div>
                <button type="button" @click="removeFile(index, false)" class="btn btn-ghost btn-xs text-error">
                  <BaseIcon name="x-mark" class="w-4 h-4" />
                </button>
              </div>

              <!-- Pending Files -->
              <div v-for="(file, index) in pendingFiles" :key="`pending-${index}`"
                class="flex items-center justify-between p-2 bg-warning/10 rounded">
                <div class="flex items-center gap-2">
                  <BaseIcon name="document" class="w-4 h-4" />
                  <span class="text-sm">{{ file.name }}</span>
                  <span class="text-xs text-base-content/70">({{ formatFileSize(file.size) }})</span>
                  <span class="badge badge-warning badge-xs">{{ $t('lessons.pending') }}</span>
                </div>
                <button type="button" @click="removeFile(index, true)" class="btn btn-ghost btn-xs text-error">
                  <BaseIcon name="x-mark" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput v-model.number="form.order" type="number" :label="$t('lessons.form.order')"
              :placeholder="$t('lessons.form.orderPlaceholder')" min="1" required />

            <BaseDatePicker v-model="form.publishDate" :label="$t('lessons.form.publishDate')" />

            <div class="form-control">
              <label class="label">
                <span class="label-text">&nbsp;</span>
              </label>
              <div class="flex gap-4 items-center pt-3">
                <BaseCheckbox v-model="form.isPublished" :label="$t('lessons.form.isPublished')" />
                <BaseCheckbox v-model="form.isActive" :label="$t('lessons.form.isActive')" />
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <BaseButton @click="closeModal" variant="ghost">
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="lessonsStore.isLoading">
            {{ isEditing ? $t('common.update') : $t('common.create') }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { useLessonsStore } from '~/stores/lessons'
import { useCoursesStore } from '~/stores/courses'
import type { Lesson, LessonAttachment } from '~/composables/data_models/lessons'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { t } = useI18n()
const toast = useToast()
const lessonsStore = useLessonsStore()
const coursesStore = useCoursesStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const lessons = ref<Lesson[]>([])
const courses = ref<any[]>([])
const fileInput = ref<HTMLInputElement>()
const pendingFiles = ref<File[]>([])

const filters = ref({
  page: 1,
  limit: 20,
  search: '',
  course: '',
  isPublished: '',
  isActive: ''
})

const form = ref({
  id: '',
  title: '',
  description: '',
  content: '',
  course: '',
  order: 1,
  attachments: [] as LessonAttachment[],
  publishDate: '',
  isPublished: false,
  isActive: true
})

const courseOptions = computed(() => [
  { value: '', label: t('common.all') },
  ...courses.value.map(course => ({
    value: course.id,
    label: `${course.name} (${course.code})`
  }))
])

const courseSelectOptions = computed(() =>
  courses.value.map(course => ({
    value: course.id,
    label: `${course.name} (${course.code})`
  }))
)

const publishOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'true', label: t('common.published') },
  { value: 'false', label: t('common.draft') }
])

const statusOptions = computed(() => [
  { value: '', label: t('common.all') },
  { value: 'true', label: t('common.active') },
  { value: 'false', label: t('common.inactive') }
])

const fetchCourses = async () => {
  try {
    const response = await coursesStore.fetchCourses({
      query: {
        pagination: { page: 1, limit: 100 },
        filter: { isActive: true }
      }
    })
    courses.value = response.data || []
  } catch (error: any) {
    console.error('Fetch courses error:', error)
  }
}

const fetchLessons = async () => {
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

    if (filters.value.course) {
      query.filter = {
        ...query.filter,
        course: filters.value.course
      }
    }

    if (filters.value.isPublished) {
      query.filter = {
        ...query.filter,
        isPublished: filters.value.isPublished === 'true'
      }
    }

    if (filters.value.isActive) {
      query.filter = {
        ...query.filter,
        isActive: filters.value.isActive === 'true'
      }
    }

    const response = await lessonsStore.fetchLessons({ query })
    lessons.value = response.data || []
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

let searchTimeout: NodeJS.Timeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    fetchLessons()
  }, 500)
}

const handleFilter = () => {
  filters.value.page = 1
  fetchLessons()
}

const handlePageChange = (page: number) => {
  filters.value.page = page
  fetchLessons()
}

const handlePageSizeChange = (limit: number) => {
  filters.value.limit = limit
  filters.value.page = 1
  fetchLessons()
}

const openCreateModal = () => {
  isEditing.value = false
  form.value = {
    id: '',
    title: '',
    description: '',
    content: '',
    course: '',
    order: 1,
    attachments: [],
    publishDate: '',
    isPublished: false,
    isActive: true
  }
  pendingFiles.value = []
  isModalOpen.value = true
}

const editLesson = (lesson: Lesson) => {
  isEditing.value = true
  form.value = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description || '',
    content: lesson.content,
    course: lesson.course.id,
    order: lesson.order,
    attachments: lesson.attachments || [],
    publishDate: lesson.publishDate || '',
    isPublished: lesson.isPublished,
    isActive: lesson.isActive
  }
  pendingFiles.value = []
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  pendingFiles.value = []
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    pendingFiles.value = [...pendingFiles.value, ...Array.from(target.files)]
  }
}

const removeFile = (index: number, isPending: boolean) => {
  if (isPending) {
    pendingFiles.value.splice(index, 1)
  } else {
    form.value.attachments?.splice(index, 1)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const uploadFiles = async (): Promise<LessonAttachment[]> => {
  if (pendingFiles.value.length === 0) return form.value.attachments || []

  const uploadedFiles: LessonAttachment[] = []

  try {
    const httpClient = useHttpClient()
    const response = await httpClient.upload('/files/upload', pendingFiles.value)

    if (!response.data?.files || !Array.isArray(response.data?.files)) {
      return []
    }

    for (const file of response.data?.files) {
      uploadedFiles.push({
        name: file.originalName,
        url: file.url,
        type: file.type,
        size: file.size
      })
    }
  } catch (error: any) {
    console.error('File upload error:', error)
    toast.error(`${t('lessons.uploadError')}`)
  }

  // Merge with existing attachments (all existing attachments already have url)
  const existingAttachments = form.value.attachments || []
  return [...existingAttachments, ...uploadedFiles]
}

const handleSubmit = async () => {
  try {
    // Upload files first
    const attachments = await uploadFiles()
    
    const submitData: any = {
      title: form.value.title,
      content: form.value.content,
      course: form.value.course,
      order: form.value.order,
      isPublished: form.value.isPublished,
      isActive: form.value.isActive
    }

    if (form.value.description) {
      submitData.description = form.value.description
    }

    if (attachments.length > 0) {
      submitData.attachments = attachments
    }

    if (form.value.publishDate) {
      submitData.publishDate = form.value.publishDate
    }

    if (isEditing.value) {
      await lessonsStore.updateLesson({ body: { id: form.value.id, ...submitData } })
      toast.success(t('lessons.updateSuccess'))
    } else {
      await lessonsStore.createLesson({ body: submitData })
      toast.success(t('lessons.createSuccess'))
    }

    // Clear pending files after successful submission
    pendingFiles.value = []
    closeModal()
    fetchLessons()
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

const togglePublish = async (lesson: Lesson) => {
  try {
    await lessonsStore.publishLesson({
      body: {
        id: lesson.id,
        isPublished: !lesson.isPublished,
        publishDate: lesson.publishDate
      }
    })
    toast.success(lesson.isPublished ? t('lessons.unpublishSuccess') : t('lessons.publishSuccess'))
    fetchLessons()
  } catch (error: any) {
    toast.error(error.message || t('common.error'))
  }
}

const deleteLesson = async (lesson: Lesson) => {
  const confirmed = await toast.confirm(
    t('lessons.deleteConfirm'),
    t('lessons.deleteConfirmMessage', { title: lesson.title }),
    'error'
  )

  if (confirmed) {
    try {
      await lessonsStore.deleteLesson({ body: { id: lesson.id } })
      toast.success(t('lessons.deleteSuccess'))
      fetchLessons()
    } catch (error: any) {
      toast.error(error.message || t('common.error'))
    }
  }
}

onMounted(() => {
  fetchCourses()
  fetchLessons()
})
</script>
