<template>
  <div
    class="card bg-base-100 shadow hover:shadow-lg transition-all duration-300 cursor-pointer"
    @click="handleClick"
  >
    <div class="card-body p-4">
      <div class="flex flex-col md:flex-row md:items-center gap-4">
        <!-- Status Icon -->
        <div class="flex-shrink-0">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="statusColor.bg"
          >
            <component :is="statusIcon" class="w-6 h-6" :class="statusColor.text" />
          </div>
        </div>

        <!-- Result Info -->
        <div class="flex-grow">
          <h4 class="font-semibold text-base">{{ result.quiz?.title }}</h4>
          <div class="flex flex-wrap items-center gap-3 mt-1 text-sm text-base-content/70">
            <div class="flex items-center gap-1">
              <AcademicCapIcon class="w-4 h-4" />
              <span>{{ result.quiz?.course?.name }}</span>
            </div>
            <div class="flex items-center gap-1">
              <CalendarIcon class="w-4 h-4" />
              <span>{{ formatDate(result.submittedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Score Display -->
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <!-- Score -->
          <div class="text-center">
            <div class="text-2xl font-bold" :class="statusColor.text">
              {{ result.percentage }}%
            </div>
            <div class="text-xs text-base-content/70">
              {{ result.score }}/{{ result.maxScore }} คะแนน
            </div>
          </div>

          <!-- Status Badge -->
          <div class="flex flex-col gap-2">
            <div class="badge gap-1" :class="statusColor.badge">
              <component :is="statusIcon" class="w-4 h-4" />
              {{ statusText }}
            </div>
            <div class="text-xs text-base-content/70" v-if="result.attemptNumber">
              ครั้งที่ {{ result.attemptNumber }}
            </div>
          </div>

          <!-- View Button -->
          <button class="btn btn-sm btn-ghost">
            ดูรายละเอียด
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Feedback -->
      <div v-if="result.feedback" class="mt-3 p-3 bg-base-200 rounded-lg">
        <div class="flex items-start gap-2">
          <ChatBubbleLeftIcon class="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div class="flex-grow">
            <div class="text-xs text-base-content/70 mb-1">ความคิดเห็นจากครู:</div>
            <p class="text-sm">{{ result.feedback }}</p>
          </div>
        </div>
      </div>

      <!-- Waiting for Grading -->
      <div v-if="!result.isGraded" class="mt-3 alert alert-info py-2">
        <ClockIcon class="w-5 h-5" />
        <span class="text-sm">รอครูตรวจคะแนน...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/vue/24/outline'

interface Props {
  result: {
    id: string
    quiz?: {
      title: string
      course?: {
        name: string
      }
      passingScore?: number
    }
    score: number
    maxScore: number
    percentage: number
    isPassed?: boolean
    isGraded: boolean
    submittedAt: string
    attemptNumber?: number
    feedback?: string
  }
}

const props = defineProps<Props>()

const isPassed = computed(() => {
  if (!props.result.isGraded) return null
  if (props.result.isPassed !== undefined) return props.result.isPassed

  // Fallback: ถ้าไม่มี isPassed ให้ดูจาก passingScore
  if (props.result.quiz?.passingScore) {
    return props.result.score >= props.result.quiz.passingScore
  }

  // Default: ถ้าไม่มีข้อมูล ให้ดูจาก 60%
  return props.result.percentage >= 60
})

const statusIcon = computed(() => {
  if (!props.result.isGraded) return ClockIcon
  return isPassed.value ? CheckCircleIcon : XCircleIcon
})

const statusText = computed(() => {
  if (!props.result.isGraded) return 'รอตรวจ'
  return isPassed.value ? 'ผ่าน' : 'ไม่ผ่าน'
})

const statusColor = computed(() => {
  if (!props.result.isGraded) {
    return {
      bg: 'bg-info/10',
      text: 'text-info',
      badge: 'badge-info',
    }
  }

  if (isPassed.value) {
    return {
      bg: 'bg-success/10',
      text: 'text-success',
      badge: 'badge-success',
    }
  }

  return {
    bg: 'bg-error/10',
    text: 'text-error',
    badge: 'badge-error',
  }
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
  navigateTo(`/student/results/${props.result.id}`)
}
</script>
