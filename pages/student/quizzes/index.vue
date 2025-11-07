<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-base-content mb-2">แบบทดสอบ</h1>
      <p class="text-base-content/70">แบบทดสอบทั้งหมดที่คุณสามารถทำได้</p>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <!-- Search -->
      <div class="relative">
        <BaseIcon name="magnifying-glass" size="sm" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 z-[1]" />
        <input v-model="searchQuery" type="text" placeholder="ค้นหาแบบทดสอบ..."
          class="input input-bordered w-full sm:w-80 pl-10" @input="handleSearch">
      </div>

      <!-- Course Filter -->
      <select v-model="selectedCourse" class="select select-bordered w-full sm:w-80" @change="handleFilter">
        <option value="">วิชาทั้งหมด</option>
        <option v-for="course in enrolledCourses" :key="course._id" :value="course._id">
          {{ course.name }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <BaseIcon name="alert-circle" />
      <span>{{ error }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!quizzes.length" class="text-center py-12">
      <BaseIcon name="file-text" size="3xl" class="mx-auto text-base-content/30 mb-4" />
      <h3 class="text-xl font-semibold text-base-content/70 mb-2">
        {{ searchQuery || selectedCourse ? 'ไม่พบแบบทดสอบ' : 'ยังไม่มีแบบทดสอบ' }}
      </h3>
      <p class="text-base-content/50">
        {{ searchQuery || selectedCourse ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' : 'ยังไม่มีแบบทดสอบที่เปิดให้ทำในขณะนี้' }}
      </p>
    </div>

    <!-- Quiz List -->
    <div v-else class="space-y-4">
      <div v-for="quiz in quizzes" :key="quiz.id || quiz._id"
        class="card bg-base-100 border border-base-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
        @click="navigateToQuiz(quiz.id || quiz._id)">
        <div class="card-body">
          <div class="flex flex-col lg:flex-row lg:items-start gap-4">
            <!-- Quiz Icon -->
            <div class="flex-shrink-0">
              <div class="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <BaseIcon name="file-text" size="2xl" class="text-primary" />
              </div>
            </div>

            <!-- Quiz Info -->
            <div class="flex-1 min-w-0">
              <!-- Title and Course -->
              <div class="mb-2">
                <h3 class="text-xl font-semibold text-base-content mb-1">
                  {{ quiz.title }}
                </h3>
                <div class="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
                  <span class="badge badge-sm badge-primary badge-outline">
                    {{ quiz.course?.name || 'ไม่ระบุวิชา' }}
                  </span>
                  <span v-if="quiz.lesson" class="flex items-center gap-1">
                    <BaseIcon name="book-open" size="xs" />
                    {{ quiz.lesson.title }}
                  </span>
                </div>
              </div>

              <!-- Description -->
              <p v-if="quiz.description" class="text-base-content/70 mb-3 line-clamp-2">
                {{ quiz.description }}
              </p>

              <!-- Quiz Details -->
              <div class="flex flex-wrap gap-4 text-sm text-base-content/70 mb-3">
                <span class="flex items-center gap-1">
                  <BaseIcon name="help-circle" size="sm" />
                  {{ quiz.questions?.length || 0 }} ข้อ
                </span>
                <span class="flex items-center gap-1">
                  <BaseIcon name="award" size="sm" />
                  {{ quiz.totalPoints }} คะแนน
                </span>
                <span v-if="quiz.duration" class="flex items-center gap-1">
                  <BaseIcon name="clock" size="sm" />
                  {{ quiz.duration }} นาที
                </span>
                <span v-if="quiz.passingScore" class="flex items-center gap-1">
                  <BaseIcon name="check-circle" size="sm" />
                  ผ่าน {{ quiz.passingScore }}%
                </span>
              </div>

              <!-- Attempt Info -->
              <div v-if="quiz.attemptInfo" class="mb-3">
                <div class="text-sm">
                  <span class="text-base-content/70">ความพยายาม: </span>
                  <span class="font-semibold">
                    {{ quiz.attemptInfo.attemptCount }} /
                    {{ quiz.maxAttempts === 0 ? '∞' : quiz.maxAttempts }}
                  </span>
                  <span v-if="quiz.attemptInfo.bestScore !== null" class="ml-3">
                    <span class="text-base-content/70">คะแนนสูงสุด: </span>
                    <span class="font-semibold" :class="{
                      'text-success': quiz.attemptInfo.isPassed,
                      'text-error': !quiz.attemptInfo.isPassed
                    }">
                      {{ quiz.attemptInfo.bestScore }}/{{ quiz.totalPoints }}
                      ({{ quiz.attemptInfo.bestPercentage }}%)
                    </span>
                  </span>
                </div>
              </div>

              <!-- Availability -->
              <div v-if="quiz.availableFrom || quiz.availableUntil" class="text-sm text-base-content/60">
                <span v-if="quiz.availableFrom" class="flex items-center gap-1">
                  <BaseIcon name="calendar" size="xs" />
                  เปิดทำ: {{ formatDate(quiz.availableFrom) }}
                </span>
                <span v-if="quiz.availableUntil" class="flex items-center gap-1 text-warning">
                  <BaseIcon name="alert-circle" size="xs" />
                  ปิดรับ: {{ formatDate(quiz.availableUntil) }}
                </span>
              </div>
            </div>

            <!-- Action Button -->
            <div class="flex-shrink-0">
              <BaseButton v-if="canTakeQuiz(quiz)" variant="primary" size="md" @click.stop="startQuiz(quiz.id || quiz._id)">
                <BaseIcon name="play" size="sm" />
                {{ (quiz.attemptInfo?.attemptCount || 0) > 0 ? 'ทำอีกครั้ง' : 'เริ่มทำ' }}
              </BaseButton>
              <BaseButton v-else-if="isQuizExpired(quiz)" variant="default" outline disabled>
                หมดเวลา
              </BaseButton>
              <BaseButton v-else-if="hasReachedMaxAttempts(quiz)" variant="default" outline disabled>
                ครบจำนวนครั้ง
              </BaseButton>
              <BaseButton v-else variant="default" outline @click.stop="navigateToQuiz(quiz.id || quiz._id)">
                ดูรายละเอียด
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-8 flex justify-center">
      <div class="join">
        <button class="join-item btn btn-sm" :disabled="pagination.currentPage === 1"
          @click="goToPage(pagination.currentPage - 1)">
          <BaseIcon name="chevron-left" size="sm" />
        </button>
        <button v-for="page in visiblePages" :key="page" class="join-item btn btn-sm"
          :class="{ 'btn-active': page === pagination.currentPage }" @click="goToPage(Number(page))">
          {{ page }}
        </button>
        <button class="join-item btn btn-sm" :disabled="pagination.currentPage === pagination.totalPages"
          @click="goToPage(pagination.currentPage + 1)">
          <BaseIcon name="chevron-right" size="sm" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuizStore } from '~/stores/quiz'
import { useQuizAttemptStore } from '~/stores/quizAttempt'
import { BaseResponseError } from '~/composables/utility_models/http'
import type { IQuiz } from '~/types/quiz'

// Define layout
definePageMeta({
  layout: 'student'
})

// Stores
const quizStore = useQuizStore()
const quizAttemptStore = useQuizAttemptStore()

// Filters
const searchQuery = ref('')
const selectedCourse = ref('')
const currentPage = ref(1)
const pageLimit = 20

// Computed
const quizzes = computed(() => quizStore.quizzes)
const enrolledCourses = computed(() => quizStore.enrolledCourses)
const isLoading = computed(() => quizStore.isLoading)
const error = computed(() => quizStore.isError ? BaseResponseError.getMessageTh(quizStore.responseData, 'เกิดข้อผิดพลาดในการโหลดข้อมูล') : null)
const pagination = computed(() => ({
  currentPage: quizStore.pagination?.page || 1,
  totalPages: quizStore.pagination?.totalPages || 1,
  totalItems: quizStore.pagination?.total || 0
}))

const visiblePages = computed(() => {
  const pages = []
  const total = pagination.value.totalPages
  const current = pagination.value.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// Methods
const fetchQuizzes = async () => {
  try {
    // ⚠️ สำคัญ: ใช้ query structure แบบ standard
    const query: any = {
      pagination: {
        page: currentPage.value,
        limit: pageLimit
      },
      filter: {}
    }

    if (searchQuery.value) {
      query.search = searchQuery.value
    }

    if (selectedCourse.value) {
      query.filter.course = selectedCourse.value
    }

    await quizStore.fetchQuizzes({ query: query })
  } catch (err: any) {
    console.error('Failed to fetch quizzes:', err)
  }
}

const fetchEnrolledCourses = async () => {
  try {
    await quizStore.fetchEnrolledCourses()
  } catch (err) {
    console.error('Failed to fetch enrolled courses:', err)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchQuizzes()
}

const handleFilter = () => {
  currentPage.value = 1
  fetchQuizzes()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    currentPage.value = page
    fetchQuizzes()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const navigateToQuiz = (quizId: string) => {
  navigateTo(`/student/quizzes/${quizId}`)
}

const startQuiz = async (quizId: string) => {
  const toast = useToast()
  try {
    const response = await quizAttemptStore.startQuiz({
      body: { quizId }
    })

    // Navigate to taking page - use external: true to force full page load
    navigateTo(`/student/quizzes/${quizId}/take/${response.data.id}`, { external: true })
  } catch (err: any) {
    console.error('Failed to start quiz:', err)
    // Extract error message from details array if available
    let errorMessage = 'ไม่สามารถเริ่มทำแบบทดสอบได้'
    if (err?.response?.details?.length > 0) {
      errorMessage = err.response.details[0]
    } else if (err?.response?.messages?.th) {
      errorMessage = err.response.messages.th
    } else if (err?.response?.message) {
      errorMessage = err.response.message
    }
    toast.error(errorMessage, 'เกิดข้อผิดพลาด')
  }
}

const canTakeQuiz = (quiz: IQuiz) => {
  if (!quiz.isActive) return false
  if (isQuizExpired(quiz)) return false
  if (hasReachedMaxAttempts(quiz)) return false
  return true
}

const isQuizExpired = (quiz: IQuiz) => {
  if (!quiz.availableUntil) return false
  return new Date(quiz.availableUntil) < new Date()
}

const hasReachedMaxAttempts = (quiz: IQuiz) => {
  if (quiz.maxAttempts === 0) return false
  if (!quiz.attemptInfo) return false
  return quiz.attemptInfo.attemptCount >= quiz.maxAttempts
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchQuizzes()
  fetchEnrolledCourses()
})
</script>
