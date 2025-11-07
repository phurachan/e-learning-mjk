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

    <!-- Result Content -->
    <div v-else-if="result">
      <!-- Breadcrumb -->
      <div class="text-sm breadcrumbs mb-6">
        <ul>
          <li><NuxtLink to="/student/dashboard">หน้าหลัก</NuxtLink></li>
          <li><NuxtLink to="/student/results">ผลคะแนน</NuxtLink></li>
          <li>{{ result.quiz.title }}</li>
        </ul>
      </div>

      <!-- Score Card -->
      <div class="card bg-gradient-to-br from-primary to-secondary text-primary-content mb-6">
        <div class="card-body">
          <div class="flex flex-col lg:flex-row items-center gap-6">
            <!-- Score Display -->
            <div class="text-center lg:text-left lg:flex-1">
              <h1 class="text-2xl font-bold mb-2">{{ result.quiz.title }}</h1>
              <div class="flex items-center gap-2 justify-center lg:justify-start mb-4">
                <span class="badge badge-lg bg-white/20">ครั้งที่ {{ result.attemptNumber }}</span>
                <span class="badge badge-lg bg-white/20">
                  {{ formatDate(result.submittedAt) }}
                </span>
              </div>

              <!-- Overall Feedback -->
              <p v-if="result.feedback" class="text-primary-content/90 text-sm bg-white/10 p-3 rounded-lg">
                {{ result.feedback }}
              </p>
            </div>

            <!-- Score Circle (only if score is available) -->
            <div v-if="result.score !== undefined" class="flex-shrink-0">
              <div class="relative">
                <svg class="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    stroke-width="12"
                    fill="none"
                    class="text-white/20"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    stroke-width="12"
                    fill="none"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="dashOffset"
                    class="text-white transition-all duration-1000"
                    stroke-linecap="round"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <div class="text-4xl font-bold">{{ result.percentage }}%</div>
                  <div class="text-sm opacity-90">{{ result.score }}/{{ result.maxScore }}</div>
                </div>
              </div>
            </div>

            <!-- Pending Icon (if score is not available) -->
            <div v-else class="flex-shrink-0">
              <div class="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center">
                <BaseIcon name="clock" size="3xl" />
              </div>
            </div>

            <!-- Status -->
            <div class="text-center lg:flex-1">
              <div v-if="result.isPassed !== undefined" class="mb-4">
                <div
                  class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold"
                  :class="{
                    'bg-success text-success-content': result.isPassed,
                    'bg-error text-error-content': !result.isPassed
                  }"
                >
                  <BaseIcon :name="result.isPassed ? 'check-circle' : 'x-circle'" size="lg" />
                  {{ result.isPassed ? 'ผ่าน' : 'ไม่ผ่าน' }}
                </div>
              </div>
              <div v-else class="mb-4">
                <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold bg-white/20">
                  <BaseIcon name="clock" size="lg" />
                  รอตรวจ
                </div>
              </div>

              <!-- Stats -->
              <div class="space-y-2 text-sm">
                <div v-if="result.timeSpent" class="flex items-center gap-2 justify-center">
                  <BaseIcon name="clock" size="sm" />
                  <span>ใช้เวลา {{ formatTimeSpent(result.timeSpent) }}</span>
                </div>
                <div v-if="result.quiz.passingScore" class="flex items-center gap-2 justify-center">
                  <BaseIcon name="target" size="sm" />
                  <span>เกณฑ์ผ่าน {{ result.quiz.passingScore }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Results Message -->
      <div v-if="!result.answers" class="alert alert-info mb-6">
        <BaseIcon name="clock" size="lg" />
        <div>
          <h3 class="font-bold">{{ result.message || 'รอคุณครูประกาศผล' }}</h3>
          <p class="text-sm">คุณครูกำลังตรวจแบบทดสอบของคุณ กรุณารอผลคะแนนจากคุณครู</p>
        </div>
      </div>

      <!-- Statistics Grid -->
      <div v-if="result.answers" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <div class="flex items-center gap-3">
              <BaseIcon name="check-circle" size="2xl" class="text-success" />
              <div>
                <div class="text-2xl font-bold">{{ correctCount }}</div>
                <div class="text-sm text-base-content/60">ถูก</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <div class="flex items-center gap-3">
              <BaseIcon name="x-circle" size="2xl" class="text-error" />
              <div>
                <div class="text-2xl font-bold">{{ incorrectCount }}</div>
                <div class="text-sm text-base-content/60">ผิด</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <div class="flex items-center gap-3">
              <BaseIcon name="award" size="2xl" class="text-primary" />
              <div>
                <div class="text-2xl font-bold">{{ result.score }}</div>
                <div class="text-sm text-base-content/60">คะแนนที่ได้</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 border border-base-300">
          <div class="card-body">
            <div class="flex items-center gap-3">
              <BaseIcon name="percent" size="2xl" class="text-warning" />
              <div>
                <div class="text-2xl font-bold">{{ result.percentage }}%</div>
                <div class="text-sm text-base-content/60">เปอร์เซ็นต์</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions Review -->
      <div v-if="result.answers" class="card bg-base-100 border border-base-300 mb-6">
        <div class="card-body">
          <h2 class="card-title mb-4">
            <BaseIcon name="file-text" class="text-primary" />
            รายละเอียดคำตอบ
          </h2>

          <div class="space-y-6">
            <div
              v-for="(answer, index) in result.answers"
              :key="index"
              class="border border-base-300 rounded-lg p-4"
              :class="{
                'bg-success/5 border-success/30': answer.isCorrect,
                'bg-error/5 border-error/30': answer.isCorrect === false,
                'bg-base-200': answer.isCorrect === undefined
              }"
            >
              <!-- Question Header -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div
                    class="badge"
                    :class="{
                      'badge-success': answer.isCorrect,
                      'badge-error': answer.isCorrect === false,
                      'badge-ghost': answer.isCorrect === undefined
                    }"
                  >
                    ข้อที่ {{ index + 1 }}
                  </div>
                  <div v-if="answer.question" class="badge badge-outline">
                    {{ getQuestionType(answer.question.type) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold">
                    {{ answer.pointsEarned || answer.teacherScore || 0 }} / {{ answer.question?.points || 0 }} คะแนน
                  </div>
                </div>
              </div>

              <!-- Question Text -->
              <div v-if="answer.question" class="prose max-w-none mb-3">
                <p class="font-semibold">{{ answer.question.question }}</p>
              </div>

              <!-- Student Answer -->
              <div class="mb-2">
                <div class="text-sm text-base-content/70 mb-1">คำตอบของคุณ:</div>
                <div
                  class="p-3 rounded bg-base-100 border"
                  :class="{
                    'border-success/50': answer.isCorrect,
                    'border-error/50': answer.isCorrect === false
                  }"
                >
                  <template v-if="Array.isArray(answer.answer)">
                    <span v-if="answer.answer.length === 0" class="text-base-content/50">ไม่ได้ตอบ</span>
                    <ul v-else class="list-disc list-inside">
                      <li v-for="(ans, i) in answer.answer" :key="i">{{ ans }}</li>
                    </ul>
                  </template>
                  <template v-else>
                    <span v-if="!answer.answer" class="text-base-content/50">ไม่ได้ตอบ</span>
                    <span v-else>{{ answer.answer }}</span>
                  </template>
                </div>
              </div>

              <!-- Correct Answer (if available and incorrect) -->
              <div
                v-if="answer.isCorrect === false && answer.question?.correctAnswers"
                class="mb-2"
              >
                <div class="text-sm text-base-content/70 mb-1">คำตอบที่ถูกต้อง:</div>
                <div class="p-3 rounded bg-success/10 border border-success/30">
                  <template v-if="Array.isArray(answer.question.correctAnswers)">
                    <ul class="list-disc list-inside">
                      <li
                        v-for="(ans, i) in answer.question.correctAnswers"
                        :key="i"
                      >
                        {{ ans }}
                      </li>
                    </ul>
                  </template>
                  <template v-else>
                    {{ answer.question.correctAnswers }}
                  </template>
                </div>
              </div>

              <!-- Teacher Feedback -->
              <div v-if="answer.teacherFeedback" class="alert alert-info">
                <BaseIcon name="message-circle" size="sm" />
                <div>
                  <div class="font-semibold text-sm">ความเห็นจากอาจารย์:</div>
                  <div class="text-sm">{{ answer.teacherFeedback }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <BaseButton
          variant="default"
          outline
          @click="navigateTo('/student/results')"
        >
          <BaseIcon name="arrow-left" size="sm" />
          กลับ
        </BaseButton>

        <BaseButton
          variant="primary"
          @click="navigateTo(`/student/quizzes/${result.quiz.id || result.quiz._id}`)"
        >
          <BaseIcon name="eye" size="sm" />
          ดูแบบทดสอบ
        </BaseButton>

        <BaseButton
          v-if="canRetake"
          variant="success"
          @click="retakeQuiz"
        >
          <BaseIcon name="refresh-cw" size="sm" />
          ทำใหม่
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizAttemptStore } from '~/stores/quizAttempt'
import { BaseResponseError } from '~/composables/utility_models/http'

// Define layout
definePageMeta({
  layout: 'student'
})

// Router
const router = useRouter()
const route = useRoute()
const attemptId = route.params.attemptId as string

// Store
const quizAttemptStore = useQuizAttemptStore()

// Computed from store
const result = computed(() => quizAttemptStore.currentAttempt)
const isLoading = computed(() => quizAttemptStore.isLoading)
const error = computed(() => quizAttemptStore.isError ? BaseResponseError.getMessageTh(quizAttemptStore.responseData, 'ไม่สามารถโหลดผลคะแนนได้') : null)

// Computed
const circumference = computed(() => 2 * Math.PI * 70)

const dashOffset = computed(() => {
  if (!result.value) return circumference.value
  const percentage = result.value.percentage / 100
  return circumference.value * (1 - percentage)
})

const correctCount = computed(() => {
  if (!result.value || !result.value.answers) return 0
  return result.value.answers.filter((a: any) => a.isCorrect === true).length
})

const incorrectCount = computed(() => {
  if (!result.value || !result.value.answers) return 0
  return result.value.answers.filter((a: any) => a.isCorrect === false).length
})

const canRetake = computed(() => {
  if (!result.value) return false
  const quiz = result.value.quiz
  if (!quiz.isActive) return false
  if (quiz.availableUntil && new Date(quiz.availableUntil) < new Date()) return false
  // This would need to check remaining attempts from the quiz detail
  return true
})

// Methods
const fetchResult = async () => {
  try {
    await quizAttemptStore.fetchAttemptDetail({
      body: { attemptId }
    })
  } catch (err: any) {
    console.error('Failed to fetch result:', err)
  }
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

const formatTimeSpent = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours} ชั่วโมง`)
  if (minutes > 0) parts.push(`${minutes} นาที`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs} วินาที`)

  return parts.join(' ')
}

const getQuestionType = (type: string) => {
  const types: Record<string, string> = {
    multiple_choice: 'ปรนัย',
    true_false: 'ถูก/ผิด',
    checkboxes: 'เลือกหลายข้อ',
    short_answer: 'คำตอบสั้น',
    essay: 'อัตนัย'
  }
  return types[type] || type
}

const retakeQuiz = async () => {
  const toast = useToast()
  try {
    const quizId = result.value.quiz.id || result.value.quiz._id
    const response = await quizAttemptStore.startQuiz({
      body: { quizId }
    })

    // Use external: true to force a full page navigation
    navigateTo(`/student/quizzes/${quizId}/take/${response.data.id}`, { external: true })
  } catch (err: any) {
    console.error('Failed to retake quiz:', err)
    // Extract error message from details array if available
    let errorMessage = 'ไม่สามารถทำแบบทดสอบอีกครั้งได้'
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

// Lifecycle
onMounted(() => {
  fetchResult()
})
</script>
