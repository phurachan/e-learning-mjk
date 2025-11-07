<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-base-content mb-2">ผลคะแนน</h1>
      <p class="text-base-content/70">ประวัติผลคะแนนและการทำแบบทดสอบทั้งหมด</p>
    </div>

    <!-- Filter Tabs -->
    <div class="mb-6">
      <div class="tabs tabs-boxed">
        <a class="tab" :class="{ 'tab-active': filter === 'all' }" @click="setFilter('all')">
          ทั้งหมด
        </a>
        <a class="tab" :class="{ 'tab-active': filter === 'passed' }" @click="setFilter('passed')">
          <BaseIcon name="check-circle" size="sm" class="mr-1" />
          ผ่าน
        </a>
        <a class="tab" :class="{ 'tab-active': filter === 'failed' }" @click="setFilter('failed')">
          <BaseIcon name="x-circle" size="sm" class="mr-1" />
          ไม่ผ่าน
        </a>
        <a class="tab" :class="{ 'tab-active': filter === 'pending' }" @click="setFilter('pending')">
          <BaseIcon name="clock" size="sm" class="mr-1" />
          รอตรวจ
        </a>
      </div>
    </div>

    <!-- Search and Sort -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
      <!-- Search -->
      <div class="relative">
        <BaseIcon name="magnifying-glass" size="sm" class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 z-[1]" />
        <input v-model="searchQuery" type="text" placeholder="ค้นหาแบบทดสอบ..."
          class="input input-bordered w-full sm:w-80 pl-10" @input="handleSearch">
      </div>

      <!-- Sort -->
      <select v-model="sortBy" class="select select-bordered w-full sm:w-80" @change="handleSort">
        <option value="submittedAt">วันที่ส่ง (ล่าสุด)</option>
        <option value="submittedAt_asc">วันที่ส่ง (เก่าสุด)</option>
        <option value="score">คะแนน (สูงสุด)</option>
        <option value="score_asc">คะแนน (ต่ำสุด)</option>
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
    <div v-else-if="!attempts.length" class="text-center py-12">
      <BaseIcon name="inbox" size="3xl" class="mx-auto text-base-content/30 mb-4" />
      <h3 class="text-xl font-semibold text-base-content/70 mb-2">
        {{ searchQuery || filter !== 'all' ? 'ไม่พบผลคะแนน' : 'ยังไม่มีผลคะแนน' }}
      </h3>
      <p class="text-base-content/50 mb-6">
        {{ searchQuery || filter !== 'all' ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' : 'เริ่มทำแบบทดสอบเพื่อดูผลคะแนนของคุณ' }}
      </p>
      <BaseButton v-if="!searchQuery && filter === 'all'" variant="primary" @click="navigateTo('/student/quizzes')">
        <BaseIcon name="file-text" size="sm" />
        ไปหน้าแบบทดสอบ
      </BaseButton>
    </div>

    <!-- Results List -->
    <div v-else class="space-y-4">
      <div v-for="attempt in attempts" :key="attempt.id || attempt._id"
        class="card bg-base-100 border border-base-300 hover:shadow-lg transition-all duration-200">
        <div class="card-body">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Quiz Info -->
            <div class="flex-1">
              <!-- Title and Badges -->
              <div class="mb-3">
                <h3 class="text-xl font-semibold text-base-content mb-2">
                  {{ attempt.quiz?.title || 'ไม่ระบุชื่อ' }}
                </h3>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="badge badge-primary badge-sm">
                    {{ attempt.quiz?.course?.name || 'ไม่ระบุวิชา' }}
                  </span>
                  <span class="badge badge-outline badge-sm">
                    ครั้งที่ {{ attempt.attemptNumber }}
                  </span>
                  <span class="badge badge-ghost badge-sm">
                    <BaseIcon name="calendar" size="xs" class="mr-1" />
                    {{ formatDate(attempt.submittedAt || attempt.startedAt) }}
                  </span>
                </div>
              </div>

              <!-- Stats Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <div class="text-sm">
                  <div class="text-base-content/60">คะแนน</div>
                  <div v-if="showScore(attempt)" class="font-semibold">
                    {{ attempt.score }}/{{ attempt.maxScore }}
                  </div>
                  <div v-else class="text-base-content/50">รอตรวจ</div>
                </div>
                <div class="text-sm">
                  <div class="text-base-content/60">เปอร์เซ็นต์</div>
                  <div v-if="showScore(attempt)" class="font-semibold">
                    {{ attempt.percentage }}%
                  </div>
                  <div v-else class="text-base-content/50">-</div>
                </div>
                <div v-if="attempt.timeSpent" class="text-sm">
                  <div class="text-base-content/60">เวลาที่ใช้</div>
                  <div class="font-semibold">{{ formatTimeSpent(attempt.timeSpent) }}</div>
                </div>
                <div class="text-sm">
                  <div class="text-base-content/60">สถานะ</div>
                  <div>
                    <span v-if="!attempt.submittedAt" class="badge badge-warning badge-sm">
                      กำลังทำ
                    </span>
                    <span v-else-if="!showScore(attempt)" class="badge badge-info badge-sm">
                      รอตรวจ
                    </span>
                    <span v-else-if="attempt.isPassed" class="badge badge-success badge-sm">
                      ผ่าน
                    </span>
                    <span v-else class="badge badge-error badge-sm">
                      ไม่ผ่าน
                    </span>
                  </div>
                </div>
              </div>

              <!-- Feedback Preview -->
              <div v-if="attempt.feedback && showScore(attempt)"
                class="text-sm text-base-content/70 bg-base-200 p-3 rounded-lg">
                <div class="flex items-start gap-2">
                  <BaseIcon name="message-circle" size="sm" class="flex-shrink-0 mt-0.5" />
                  <div>
                    <div class="font-semibold mb-1">ความเห็นจากอาจารย์:</div>
                    <div class="line-clamp-2">{{ attempt.feedback }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Score Display and Actions -->
            <div class="flex flex-col items-center justify-center gap-4 lg:w-48">
              <!-- Score Circle -->
              <div v-if="showScore(attempt)" class="relative">
                <svg class="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none"
                    class="text-base-300" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="none"
                    :stroke-dasharray="getCircumference(56)"
                    :stroke-dashoffset="getScoreDashOffset(attempt.percentage, 56)" :class="{
                      'text-success': attempt.isPassed,
                      'text-error': !attempt.isPassed && attempt.isPassed !== undefined,
                      'text-primary': attempt.isPassed === undefined
                    }" stroke-linecap="round" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <div class="text-2xl font-bold">{{ attempt.percentage }}%</div>
                  <div class="text-xs text-base-content/60">{{ attempt.score }}/{{ attempt.maxScore }}</div>
                </div>
              </div>
              <div v-else class="w-32 h-32 flex items-center justify-center bg-base-200 rounded-full">
                <div class="text-center">
                  <BaseIcon name="clock" size="2xl" class="text-base-content/30 mb-1" />
                  <div class="text-xs text-base-content/50">รอตรวจ</div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col gap-2 w-full">
                <BaseButton v-if="attempt.submittedAt && showScore(attempt)" variant="primary" size="sm" block
                  @click="viewResult(attempt.id || attempt._id)">
                  <BaseIcon name="eye" size="sm" />
                  ดูผลคะแนน
                </BaseButton>
                <BaseButton v-else-if="!attempt.submittedAt" variant="success" size="sm" block
                  @click="continueQuiz(attempt)">
                  <BaseIcon name="play" size="sm" />
                  ทำต่อ
                </BaseButton>
                <BaseButton variant="default" outline size="sm" block @click="viewQuiz(attempt.quiz.id || attempt.quiz._id)">
                  <BaseIcon name="file-text" size="sm" />
                  ดูโจทย์
                </BaseButton>
              </div>
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
import { useRouter } from 'vue-router'
import { useQuizAttemptStore } from '~/stores/quizAttempt'
import { BaseResponseError } from '~/composables/utility_models/http'
import type { IQuizAttempt } from '~/types/quizAttempt'

// Define layout
definePageMeta({
  layout: 'student'
})

// Router
const router = useRouter()

// Store
const quizAttemptStore = useQuizAttemptStore()

// Filters
const filter = ref<'all' | 'passed' | 'failed' | 'pending'>('all')
const searchQuery = ref('')
const sortBy = ref('submittedAt')
const currentPage = ref(1)
const pageLimit = 20

// Computed from store
const attempts = computed(() => quizAttemptStore.attempts)
const isLoading = computed(() => quizAttemptStore.isLoading)
const error = computed(() => quizAttemptStore.isError ? BaseResponseError.getMessageTh(quizAttemptStore.responseData, 'เกิดข้อผิดพลาดในการโหลดข้อมูล') : null)
const pagination = computed(() => ({
  currentPage: quizAttemptStore.pagination?.page || 1,
  totalPages: quizAttemptStore.pagination?.totalPages || 1,
  totalItems: quizAttemptStore.pagination?.total || 0
}))

// Computed
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
const fetchAttempts = async () => {
  try {
    // ⚠️ สำคัญ: ใช้ query structure แบบ standard
    const query: any = {
      pagination: {
        page: currentPage.value,
        limit: pageLimit
      },
      filter: {
        submitted: true // Only show submitted attempts
      }
    }

    if (searchQuery.value) {
      query.search = searchQuery.value
    }

    // Apply status filter
    if (filter.value === 'pending') {
      query.filter.isGraded = false
    } else if (filter.value === 'passed') {
      query.filter.isPassed = true
    } else if (filter.value === 'failed') {
      query.filter.isPassed = false
    }

    // Apply sorting
    const [sortField, sortOrder] = sortBy.value.includes('_asc')
      ? [sortBy.value.replace('_asc', ''), 'asc']
      : [sortBy.value, 'desc']
    query.sort = sortField
    query.order = sortOrder

    await quizAttemptStore.fetchMyAttempts({ query: query })
  } catch (err: any) {
    console.error('Failed to fetch attempts:', err)
  }
}

const setFilter = (newFilter: 'all' | 'passed' | 'failed' | 'pending') => {
  filter.value = newFilter
  currentPage.value = 1
  fetchAttempts()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchAttempts()
}

const handleSort = () => {
  currentPage.value = 1
  fetchAttempts()
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    currentPage.value = page
    fetchAttempts()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const viewResult = (attemptId: string) => {
  navigateTo(`/student/results/${attemptId}`)
}

const viewQuiz = (quizId: string) => {
  navigateTo(`/student/quizzes/${quizId}`)
}

const continueQuiz = (attempt: IQuizAttempt) => {
  const quizId = attempt.quiz.id || attempt.quiz._id
  const attemptId = attempt.id || attempt._id
  // Use external: true to force a full page navigation
  navigateTo(`/student/quizzes/${quizId}/take/${attemptId}`, { external: true })
}

const showScore = (attempt: IQuizAttempt) => {
  // Show score if graded OR if quiz shows results immediately
  return attempt.isGraded || attempt.quiz?.showResultsImmediately
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTimeSpent = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes > 0) {
    return `${minutes}:${secs.toString().padStart(2, '0')} น.`
  }
  return `${secs} วินาที`
}

const getCircumference = (radius: number) => {
  return 2 * Math.PI * radius
}

const getScoreDashOffset = (percentage: number, radius: number) => {
  const circumference = getCircumference(radius)
  return circumference * (1 - percentage / 100)
}

// Lifecycle
onMounted(() => {
  fetchAttempts()
})
</script>
