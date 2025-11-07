<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <BaseIcon name="alert-circle" />
      <span>{{ error }}</span>
      <BaseButton variant="default" outline @click="router.back()">
        กลับ
      </BaseButton>
    </div>

    <!-- Quiz Content -->
    <div v-else-if="quiz">
      <!-- Breadcrumb -->
      <div class="text-sm breadcrumbs mb-6">
        <ul>
          <li><NuxtLink to="/student/dashboard">หน้าหลัก</NuxtLink></li>
          <li><NuxtLink to="/student/quizzes">แบบทดสอบ</NuxtLink></li>
          <li>{{ quiz.title }}</li>
        </ul>
      </div>

      <!-- Quiz Header -->
      <div class="card bg-base-100 border border-base-300 mb-6">
        <div class="card-body">
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div class="flex-shrink-0 hidden sm:block">
              <div class="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                <BaseIcon name="document-text" size="3xl" class="text-primary" />
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-base-content mb-2">{{ quiz.title }}</h1>

              <!-- Course Badge -->
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="badge badge-primary badge-lg">
                  {{ quiz.course?.name || 'ไม่ระบุวิชา' }}
                </span>
                <span v-if="quiz.lesson" class="badge badge-outline badge-lg">
                  <BaseIcon name="book-open" size="sm" class="mr-1" />
                  {{ quiz.lesson.title }}
                </span>
              </div>

              <!-- Description -->
              <p v-if="quiz.description" class="text-base-content/70 mb-4">
                {{ quiz.description }}
              </p>

              <!-- Quiz Stats -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="flex items-center gap-2">
                  <BaseIcon name="help-circle" class="text-primary" />
                  <div>
                    <div class="text-xs text-base-content/60">จำนวนข้อ</div>
                    <div class="font-semibold">{{ quiz.questions?.length || 0 }} ข้อ</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <BaseIcon name="award" class="text-primary" />
                  <div>
                    <div class="text-xs text-base-content/60">คะแนนเต็ม</div>
                    <div class="font-semibold">{{ quiz.totalPoints }} คะแนน</div>
                  </div>
                </div>
                <div v-if="quiz.duration" class="flex items-center gap-2">
                  <BaseIcon name="clock" class="text-primary" />
                  <div>
                    <div class="text-xs text-base-content/60">เวลาทำ</div>
                    <div class="font-semibold">{{ quiz.duration }} นาที</div>
                  </div>
                </div>
                <div v-if="quiz.passingScore" class="flex items-center gap-2">
                  <BaseIcon name="check-circle" class="text-success" />
                  <div>
                    <div class="text-xs text-base-content/60">เกณฑ์ผ่าน</div>
                    <div class="font-semibold">{{ quiz.passingScore }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quiz Details Grid -->
      <div class="grid md:grid-cols-3 gap-6 mb-6">
        <!-- Attempt Information -->
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <h3 class="card-title text-lg">
              <BaseIcon name="repeat" class="text-primary" />
              ความพยายาม
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-base-content/70">จำนวนครั้งที่ทำ:</span>
                <span class="font-semibold">{{ attemptInfo.attemptCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-base-content/70">จำกัดจำนวน:</span>
                <span class="font-semibold">
                  {{ quiz.maxAttempts === 0 ? 'ไม่จำกัด' : `${quiz.maxAttempts} ครั้ง` }}
                </span>
              </div>
              <div v-if="attemptInfo.remainingAttempts !== null" class="flex justify-between">
                <span class="text-base-content/70">เหลือ:</span>
                <span class="font-semibold text-primary">
                  {{ attemptInfo.remainingAttempts }} ครั้ง
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Best Score -->
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <h3 class="card-title text-lg">
              <BaseIcon name="trophy" class="text-warning" />
              คะแนนสูงสุด
            </h3>
            <div v-if="attemptInfo.bestScore !== null" class="space-y-2">
              <div class="text-center">
                <div
                  class="text-3xl font-bold"
                  :class="{
                    'text-success': attemptInfo.isPassed,
                    'text-error': !attemptInfo.isPassed
                  }"
                >
                  {{ attemptInfo.bestPercentage }}%
                </div>
                <div class="text-sm text-base-content/60">
                  {{ attemptInfo.bestScore }} / {{ quiz.totalPoints }} คะแนน
                </div>
              </div>
              <div v-if="quiz.passingScore" class="text-center">
                <span
                  class="badge"
                  :class="{
                    'badge-success': attemptInfo.isPassed,
                    'badge-error': !attemptInfo.isPassed
                  }"
                >
                  {{ attemptInfo.isPassed ? 'ผ่าน' : 'ไม่ผ่าน' }}
                </span>
              </div>
            </div>
            <div v-else class="text-center text-base-content/50">
              ยังไม่เคยทำแบบทดสอบนี้
            </div>
          </div>
        </div>

        <!-- Availability -->
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <h3 class="card-title text-lg">
              <BaseIcon name="calendar" class="text-info" />
              ช่วงเวลา
            </h3>
            <div class="space-y-2 text-sm">
              <div v-if="quiz.availableFrom">
                <div class="text-base-content/60">เปิดรับ:</div>
                <div class="font-semibold">{{ formatDate(quiz.availableFrom) }}</div>
              </div>
              <div v-if="quiz.availableUntil">
                <div class="text-base-content/60">ปิดรับ:</div>
                <div class="font-semibold" :class="{ 'text-error': isQuizExpired }">
                  {{ formatDate(quiz.availableUntil) }}
                </div>
              </div>
              <div v-if="!quiz.availableFrom && !quiz.availableUntil" class="text-base-content/50">
                เปิดรับตลอดเวลา
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Previous Attempts -->
      <div v-if="attempts.length > 0" class="card bg-base-100 border border-base-300 mb-6">
        <div class="card-body">
          <h3 class="card-title mb-4">
            <BaseIcon name="history" class="text-primary" />
            ประวัติการทำแบบทดสอบ
          </h3>
          <div class="overflow-x-auto">
            <table class="table table-zebra">
              <thead>
                <tr>
                  <th>ครั้งที่</th>
                  <th>วันที่ทำ</th>
                  <th>เวลาที่ใช้</th>
                  <th>คะแนน</th>
                  <th>สถานะ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="attempt in attempts" :key="attempt.id || attempt._id">
                  <td>{{ attempt.attemptNumber }}</td>
                  <td>{{ formatDate(attempt.submittedAt || attempt.startedAt) }}</td>
                  <td>
                    <span v-if="attempt.timeSpent">
                      {{ Math.floor(attempt.timeSpent / 60) }} นาที {{ attempt.timeSpent % 60 }} วินาที
                    </span>
                    <span v-else class="text-base-content/50">-</span>
                  </td>
                  <td>
                    <span v-if="attempt.isGraded || quiz.showResultsImmediately" class="font-semibold">
                      {{ attempt.score }}/{{ attempt.maxScore }} ({{ attempt.percentage }}%)
                    </span>
                    <span v-else class="text-base-content/50">รอตรวจ</span>
                  </td>
                  <td>
                    <span
                      v-if="!attempt.submittedAt"
                      class="badge badge-warning"
                    >
                      กำลังทำ
                    </span>
                    <span
                      v-else-if="!attempt.isGraded && !quiz.showResultsImmediately"
                      class="badge badge-info"
                    >
                      รอตรวจ
                    </span>
                    <span
                      v-else-if="attempt.isPassed"
                      class="badge badge-success"
                    >
                      ผ่าน
                    </span>
                    <span
                      v-else
                      class="badge badge-error"
                    >
                      ไม่ผ่าน
                    </span>
                  </td>
                  <td>
                    <BaseButton
                      v-if="attempt.submittedAt && (attempt.isGraded || quiz.showResultsImmediately)"
                      variant="default"
                      outline
                      size="sm"
                      @click="viewResult(attempt.id || attempt._id)"
                    >
                      <BaseIcon name="eye" size="sm" />
                      ดูผล
                    </BaseButton>
                    <BaseButton
                      v-else-if="!attempt.submittedAt"
                      variant="primary"
                      size="sm"
                      @click.stop="continueQuiz(attempt.id || attempt._id)"
                    >
                      <BaseIcon name="play" size="sm" />
                      ทำต่อ
                    </BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div v-if="quiz.duration || quiz.maxAttempts > 0" class="alert alert-info mb-6">
        <BaseIcon name="info" />
        <div>
          <h4 class="font-bold">คำแนะนำ</h4>
          <ul class="text-sm mt-1 list-disc list-inside">
            <li v-if="quiz.duration">
              คุณมีเวลา {{ quiz.duration }} นาที ในการทำแบบทดสอบนี้
            </li>
            <li v-if="quiz.maxAttempts > 0">
              คุณสามารถทำแบบทดสอบนี้ได้สูงสุด {{ quiz.maxAttempts }} ครั้ง
            </li>
            <li v-if="quiz.passingScore">
              คะแนนขั้นต่ำเพื่อผ่านคือ {{ quiz.passingScore }}%
            </li>
            <li v-if="!quiz.showResultsImmediately">
              ผลคะแนนจะแสดงหลังจากที่อาจารย์ตรวจแบบทดสอบเรียบร้อยแล้ว
            </li>
          </ul>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <BaseButton
          variant="default"
          outline
          @click="router.back()"
        >
          <BaseIcon name="arrow-left" size="sm" />
          กลับ
        </BaseButton>

        <BaseButton
          v-if="canStartQuiz"
          variant="primary"
          size="lg"
          class="flex-1"
          @click="startQuiz"
        >
          <BaseIcon name="play" size="sm" />
          {{ attemptInfo.attemptCount > 0 ? 'ทำอีกครั้ง' : 'เริ่มทำแบบทดสอบ' }}
        </BaseButton>

        <div v-else class="flex-1">
          <BaseButton
            v-if="isQuizExpired"
            variant="default"
            outline
            disabled
            class="w-full"
          >
            <BaseIcon name="x-circle" size="sm" />
            แบบทดสอบหมดเวลาแล้ว
          </BaseButton>
          <BaseButton
            v-else-if="hasReachedMaxAttempts"
            variant="default"
            outline
            disabled
            class="w-full"
          >
            <BaseIcon name="x-circle" size="sm" />
            ครบจำนวนครั้งที่กำหนดแล้ว
          </BaseButton>
          <BaseButton
            v-else
            variant="default"
            outline
            disabled
            class="w-full"
          >
            <BaseIcon name="lock" size="sm" />
            ยังไม่เปิดให้ทำ
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizStore } from '~/stores/quiz'
import { useQuizAttemptStore } from '~/stores/quizAttempt'
import { BaseResponseError } from '~/composables/utility_models/http'

// Define layout
definePageMeta({
  layout: 'student'
})

// Router
const router = useRouter()
const route = useRoute()
const quizId = route.params.id as string

// Stores
const quizStore = useQuizStore()
const quizAttemptStore = useQuizAttemptStore()

// Computed from stores
const quiz = computed(() => quizStore.currentQuiz)
const attempts = computed(() => quizAttemptStore.attempts)
const isLoading = computed(() => quizStore.isLoading || quizAttemptStore.isLoading)
const error = computed(() => {
  if (quizStore.isError) return BaseResponseError.getMessageTh(quizStore.responseData, 'ไม่พบแบบทดสอบ')
  if (quizAttemptStore.isError) return BaseResponseError.getMessageTh(quizAttemptStore.responseData, 'ไม่สามารถโหลดข้อมูลการทำแบบทดสอบได้')
  return null
})

// Computed
const attemptInfo = computed(() => {
  const attemptCount = attempts.value.filter(a => a.submittedAt).length
  const gradedAttempts = attempts.value.filter(a => a.isGraded || quiz.value?.showResultsImmediately)

  let bestScore = null
  let bestPercentage = null
  let isPassed = false

  if (gradedAttempts.length > 0) {
    const best = gradedAttempts.reduce((prev, current) =>
      (current.percentage > prev.percentage) ? current : prev
    )
    bestScore = best.score
    bestPercentage = best.percentage
    isPassed = best.isPassed || false
  }

  const remainingAttempts = quiz.value?.maxAttempts === 0
    ? null
    : (quiz.value?.maxAttempts || 0) - attemptCount

  return {
    attemptCount,
    bestScore,
    bestPercentage,
    isPassed,
    remainingAttempts
  }
})

const isQuizExpired = computed(() => {
  if (!quiz.value?.availableUntil) return false
  return new Date(quiz.value.availableUntil) < new Date()
})

const hasReachedMaxAttempts = computed(() => {
  if (!quiz.value || quiz.value.maxAttempts === 0) return false
  return attemptInfo.value.attemptCount >= quiz.value.maxAttempts
})

const canStartQuiz = computed(() => {
  if (!quiz.value?.isActive) return false
  if (isQuizExpired.value) return false
  if (hasReachedMaxAttempts.value) return false

  // Check if quiz is available
  if (quiz.value.availableFrom && new Date(quiz.value.availableFrom) > new Date()) {
    return false
  }

  return true
})

// Methods
const fetchQuiz = async () => {
  try {
    await quizStore.fetchQuizDetail({ body: { quizId } })
  } catch (err: any) {
    console.error('Failed to fetch quiz:', err)
  }
}

const fetchAttempts = async () => {
  try {
    await quizAttemptStore.fetchMyAttempts({
      query: {
        pagination: {
          page: 1,
          limit: 100
        },
        filter: {
          quiz: quizId
        }
      }
    })
  } catch (err) {
    console.error('Failed to fetch attempts:', err)
  }
}

const startQuiz = async () => {
  const toast = useToast()
  try {
    const response = await quizAttemptStore.startQuiz({
      body: { quizId }
    })

    // Use external: true to force a full page navigation
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

const continueQuiz = (attemptId: string) => {
  console.log('continueQuiz called with attemptId:', attemptId)
  console.log('Navigating to:', `/student/quizzes/${quizId}/take/${attemptId}`)
  if (!attemptId) {
    console.error('Attempt ID is undefined!')
    const toast = useToast()
    toast.error('ไม่พบข้อมูลการทำแบบทดสอบ', 'เกิดข้อผิดพลาด')
    return
  }
  // Use external: true to force a full page navigation
  navigateTo(`/student/quizzes/${quizId}/take/${attemptId}`, { external: true })
}

const viewResult = (attemptId: string) => {
  navigateTo(`/student/results/${attemptId}`)
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

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([fetchQuiz(), fetchAttempts()])
  } catch (err) {
    // Error already handled in fetch methods
  }
})
</script>
