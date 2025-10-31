<template>
  <div
    class="card bg-base-100 shadow hover:shadow-lg transition-all duration-300 cursor-pointer"
    @click="handleClick"
  >
    <div class="card-body p-4">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="statusColor.bg"
          >
            <DocumentTextIcon class="w-6 h-6" :class="statusColor.text" />
          </div>
        </div>

        <!-- Quiz Info -->
        <div class="flex-grow">
          <h4 class="font-semibold text-base line-clamp-1">{{ quiz.title }}</h4>
          <div class="flex flex-wrap items-center gap-3 mt-1 text-sm text-base-content/70">
            <div class="flex items-center gap-1">
              <AcademicCapIcon class="w-4 h-4" />
              <span>{{ quiz.course?.name }}</span>
            </div>
            <div class="flex items-center gap-1" v-if="quiz.availableUntil">
              <ClockIcon class="w-4 h-4" />
              <span>ถึง {{ formatDate(quiz.availableUntil) }}</span>
            </div>
          </div>
        </div>

        <!-- Quiz Stats -->
        <div class="flex flex-col md:flex-row items-start md:items-center gap-3">
          <!-- Attempts -->
          <div class="flex items-center gap-2" v-if="quiz.maxAttempts > 0">
            <div class="badge badge-outline gap-1">
              <span class="text-xs">ทำได้</span>
              <span class="font-semibold">{{ attemptsLeft }}/{{ quiz.maxAttempts }}</span>
              <span class="text-xs">ครั้ง</span>
            </div>
          </div>

          <!-- Duration -->
          <div class="flex items-center gap-1 text-sm text-base-content/70" v-if="quiz.duration">
            <ClockIcon class="w-4 h-4" />
            <span>{{ quiz.duration }} นาที</span>
          </div>

          <!-- Action Button -->
          <button class="btn btn-sm" :class="statusColor.btn">
            {{ buttonText }}
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Deadline Warning -->
      <div
        v-if="isNearDeadline"
        class="alert alert-warning mt-3 py-2"
      >
        <ExclamationTriangleIcon class="w-5 h-5" />
        <span class="text-sm">ใกล้ถึงกำหนดส่ง!</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DocumentTextIcon,
  AcademicCapIcon,
  ClockIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  quiz: {
    id: string
    title: string
    course?: {
      name: string
    }
    maxAttempts: number
    duration?: number
    availableFrom?: string
    availableUntil?: string
    attemptCount?: number
  }
}

const props = defineProps<Props>()

const attemptsLeft = computed(() => {
  const attempted = props.quiz.attemptCount || 0
  return Math.max(props.quiz.maxAttempts - attempted, 0)
})

const canTakeQuiz = computed(() => {
  if (props.quiz.maxAttempts === 0) return true
  return attemptsLeft.value > 0
})

const isNearDeadline = computed(() => {
  if (!props.quiz.availableUntil) return false
  const deadline = new Date(props.quiz.availableUntil)
  const now = new Date()
  const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return daysUntilDeadline > 0 && daysUntilDeadline <= 3
})

const statusColor = computed(() => {
  if (!canTakeQuiz.value) {
    return {
      bg: 'bg-base-200',
      text: 'text-base-content/50',
      btn: 'btn-disabled',
    }
  }
  if (isNearDeadline.value) {
    return {
      bg: 'bg-warning/10',
      text: 'text-warning',
      btn: 'btn-warning',
    }
  }
  return {
    bg: 'bg-primary/10',
    text: 'text-primary',
    btn: 'btn-primary',
  }
})

const buttonText = computed(() => {
  if (!canTakeQuiz.value) return 'ทำครบแล้ว'
  if (props.quiz.attemptCount && props.quiz.attemptCount > 0) return 'ทำอีกครั้ง'
  return 'เริ่มทำ'
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleClick = () => {
  if (canTakeQuiz.value) {
    navigateTo(`/student/quizzes/${props.quiz.id}`)
  }
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
