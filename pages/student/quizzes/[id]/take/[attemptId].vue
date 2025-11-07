<template>
  <div class="min-h-screen bg-base-200">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-screen">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-8">
      <div class="alert alert-error">
        <BaseIcon name="alert-circle" />
        <span>{{ error }}</span>
        <BaseButton variant="default" outline @click="router.push('/student/quizzes')">
          กลับไปหน้าแบบทดสอบ
        </BaseButton>
      </div>
    </div>

    <!-- Quiz Taking Interface -->
    <div v-else-if="quiz && !isSubmitted">
      <!-- Fixed Header -->
      <div class="sticky top-0 z-10 bg-base-100 border-b border-base-300 shadow-sm">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <!-- Quiz Title -->
            <div class="flex-1 min-w-0">
              <h1 class="text-xl font-bold text-base-content truncate">{{ quiz.title }}</h1>
              <div class="text-sm text-base-content/60">
                ครั้งที่ {{ attemptNumber }} • {{ quiz.questions?.length ?? 0 }} ข้อ • {{ quiz.totalPoints }} คะแนน
              </div>
            </div>

            <!-- Timer -->
            <div v-if="quiz.duration" class="flex items-center gap-2 px-4 py-2 bg-base-200 rounded-lg">
              <BaseIcon
                name="clock"
                :class="{
                  'text-error animate-pulse': timeRemaining < 300,
                  'text-warning': timeRemaining >= 300 && timeRemaining < 600,
                  'text-primary': timeRemaining >= 600
                }"
              />
              <span
                class="font-mono font-bold text-lg"
                :class="{
                  'text-error': timeRemaining < 300,
                  'text-warning': timeRemaining >= 300 && timeRemaining < 600
                }"
              >
                {{ formatTime(timeRemaining) }}
              </span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-3">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm text-base-content/70">ความคืบหน้า</span>
              <span class="text-sm font-semibold text-primary">
                {{ answeredCount }}/{{ quiz.questions?.length || 0 }} ข้อ
              </span>
            </div>
            <progress
              class="progress progress-primary w-full"
              :value="answeredCount"
              :max="quiz.questions?.length"
            ></progress>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container mx-auto px-4 py-6">
        <div class="grid lg:grid-cols-4 gap-6">
          <!-- Question Navigation Sidebar -->
          <div class="lg:col-span-1">
            <div class="card bg-base-100 border border-base-300 sticky top-32">
              <div class="card-body">
                <h3 class="card-title text-sm">
                  <BaseIcon name="list" size="sm" />
                  รายการข้อ
                </h3>
                <div class="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  <button
                    v-for="(question, index) in quiz.questions"
                    :key="index"
                    class="btn btn-sm"
                    :class="{
                      'btn-primary': currentQuestionIndex === index,
                      'btn-success btn-outline': currentQuestionIndex !== index && answers[index] !== undefined && answers[index] !== '' && answers[index] !== null,
                      'btn-ghost': currentQuestionIndex !== index && (answers[index] === undefined || answers[index] === '' || answers[index] === null)
                    }"
                    @click="goToQuestion(index)"
                  >
                    {{ index + 1 }}
                  </button>
                </div>

                <div class="divider my-2"></div>

                <!-- Legend -->
                <div class="space-y-1 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded btn-primary"></div>
                    <span>ข้อปัจจุบัน</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded btn-success btn-outline"></div>
                    <span>ตอบแล้ว</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded btn-ghost border border-base-300"></div>
                    <span>ยังไม่ได้ตอบ</span>
                  </div>
                </div>

                <div class="divider my-2"></div>

                <!-- Submit Button -->
                <BaseButton
                  variant="primary"
                  size="sm"
                  block
                  @click="confirmSubmit"
                >
                  <BaseIcon name="check-circle" size="sm" />
                  ส่งคำตอบ
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Question Content -->
          <div class="lg:col-span-3">
            <div class="card bg-base-100 border border-base-300">
              <div class="card-body">
                <!-- Question Number and Points -->
                <div class="flex items-center justify-between mb-4">
                  <div class="badge badge-lg badge-primary">
                    ข้อที่ {{ currentQuestionIndex + 1 }}
                  </div>
                  <div class="badge badge-lg badge-outline">
                    {{ currentQuestion?.points }} คะแนน
                  </div>
                </div>

                <!-- Question Text -->
                <div class="prose max-w-none mb-6">
                  <h2 class="text-xl font-semibold text-base-content">
                    {{ currentQuestion?.question }}
                  </h2>
                </div>

                <!-- Answer Input based on Question Type -->
                <div class="space-y-3">
                  <!-- Multiple Choice -->
                  <div v-if="currentQuestion?.type === 'multiple_choice'" class="space-y-2">
                    <div
                      v-for="(option, optIndex) in currentQuestion?.options"
                      :key="optIndex"
                      class="form-control"
                    >
                      <label class="label cursor-pointer justify-start gap-4 p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors">
                        <input
                          type="radio"
                          :name="`question-${currentQuestionIndex}`"
                          :value="option"
                          v-model="answers[currentQuestionIndex]"
                          class="radio radio-primary"
                        />
                        <span class="label-text text-base">{{ option }}</span>
                      </label>
                    </div>
                  </div>

                  <!-- True/False -->
                  <div v-else-if="currentQuestion?.type === 'true_false'" class="space-y-2">
                    <div
                      v-for="option in ['ถูก', 'ผิด']"
                      :key="option"
                      class="form-control"
                    >
                      <label class="label cursor-pointer justify-start gap-4 p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors">
                        <input
                          type="radio"
                          :name="`question-${currentQuestionIndex}`"
                          :value="option"
                          v-model="answers[currentQuestionIndex]"
                          class="radio radio-primary"
                        />
                        <span class="label-text text-base">{{ option }}</span>
                      </label>
                    </div>
                  </div>

                  <!-- Checkboxes -->
                  <div v-else-if="currentQuestion?.type === 'checkboxes'" class="space-y-2">
                    <div
                      v-for="(option, optIndex) in currentQuestion?.options"
                      :key="optIndex"
                      class="form-control"
                    >
                      <label class="label cursor-pointer justify-start gap-4 p-4 border border-base-300 rounded-lg hover:bg-base-200 transition-colors">
                        <input
                          type="checkbox"
                          :value="option"
                          :checked="Array.isArray(answers[currentQuestionIndex]) && answers[currentQuestionIndex].includes(option)"
                          @change="handleCheckboxChange(option)"
                          class="checkbox checkbox-primary"
                        />
                        <span class="label-text text-base">{{ option }}</span>
                      </label>
                    </div>
                  </div>

                  <!-- Short Answer -->
                  <div v-else-if="currentQuestion?.type === 'short_answer'" class="form-control">
                    <textarea
                      v-model="answers[currentQuestionIndex]"
                      class="textarea textarea-bordered h-24"
                      placeholder="พิมพ์คำตอบของคุณที่นี่..."
                    ></textarea>
                  </div>

                  <!-- Essay -->
                  <div v-else-if="currentQuestion?.type === 'essay'" class="form-control">
                    <textarea
                      v-model="answers[currentQuestionIndex]"
                      class="textarea textarea-bordered h-48"
                      placeholder="พิมพ์คำตอบของคุณที่นี่..."
                    ></textarea>
                  </div>
                </div>

                <!-- Navigation Buttons -->
                <div class="flex justify-between mt-8">
                  <BaseButton
                    v-if="currentQuestionIndex > 0"
                    variant="default"
                    outline
                    @click="previousQuestion"
                  >
                    <BaseIcon name="chevron-left" size="sm" />
                    ข้อก่อนหน้า
                  </BaseButton>
                  <div v-else></div>

                  <BaseButton
                    v-if="currentQuestionIndex < quiz.questions.length - 1"
                    variant="primary"
                    @click="nextQuestion"
                  >
                    ข้อถัดไป
                    <BaseIcon name="chevron-right" size="sm" />
                  </BaseButton>
                  <BaseButton
                    v-else
                    variant="success"
                    @click="confirmSubmit"
                  >
                    <BaseIcon name="check-circle" size="sm" />
                    ส่งคำตอบ
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submitted State -->
    <div v-else-if="isSubmitted" class="container mx-auto px-4 py-12">
      <div class="card bg-base-100 border border-base-300 max-w-2xl mx-auto">
        <div class="card-body text-center">
          <div class="mb-4">
            <BaseIcon name="check-circle" size="4xl" class="text-success mx-auto" />
          </div>
          <h2 class="text-2xl font-bold text-base-content mb-2">ส่งคำตอบสำเร็จ!</h2>
          <p class="text-base-content/70 mb-6">
            คุณได้ส่งคำตอบแบบทดสอบเรียบร้อยแล้ว
            {{ quiz?.showResultsImmediately ? 'คะแนนของคุณจะแสดงในหน้าถัดไป' : 'รอผลคะแนนจากอาจารย์' }}
          </p>
          <div class="flex gap-4 justify-center">
            <BaseButton
              variant="default"
              outline
              @click="router.push('/student/quizzes')"
            >
              กลับไปหน้าแบบทดสอบ
            </BaseButton>
            <BaseButton
              v-if="quiz?.showResultsImmediately"
              variant="primary"
              @click="viewResult"
            >
              <BaseIcon name="eye" size="sm" />
              ดูผลคะแนน
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <dialog ref="submitModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">ยืนยันการส่งคำตอบ</h3>
        <p class="mb-2">คุณได้ตอบคำถามแล้ว {{ answeredCount }} จาก {{ quiz?.questions?.length }} ข้อ</p>
        <p v-if="unansweredCount > 0" class="text-warning mb-4">
          ⚠️ คุณยังไม่ได้ตอบ {{ unansweredCount }} ข้อ
        </p>
        <p class="mb-4">คุณแน่ใจหรือไม่ว่าต้องการส่งคำตอบ?</p>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeSubmitModal">ยกเลิก</button>
          <button class="btn btn-primary" @click="submitQuiz">
            <BaseIcon name="check-circle" size="sm" />
            ยืนยันส่งคำตอบ
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
const attemptId = route.params.attemptId as string

// Stores
const quizStore = useQuizStore()
const quizAttemptStore = useQuizAttemptStore()

// State
const attemptNumber = ref(1)
const answers = ref<Record<number, any>>({})
const currentQuestionIndex = ref(0)
const isSubmitted = ref(false)
const startTime = ref<Date | null>(null)
const timeRemaining = ref<number>(0)
const timerInterval = ref<NodeJS.Timeout | null>(null)
const submitModal = ref<HTMLDialogElement | null>(null)

// Page loading state
const pageLoading = ref(false)

// Computed from stores
const quiz = computed(() => quizStore.currentQuiz)
const isLoading = computed(() => pageLoading.value || quizStore.isLoading || quizAttemptStore.isLoading)
const error = computed(() => {
  if (quizStore.isError) return BaseResponseError.getMessageTh(quizStore.responseData, 'ไม่สามารถโหลดข้อมูลแบบทดสอบได้')
  if (quizAttemptStore.isError) return BaseResponseError.getMessageTh(quizAttemptStore.responseData, 'ไม่สามารถส่งคำตอบได้')
  return null
})

// Computed
const currentQuestion = computed(() => {
  if (!quiz.value) return null
  return quiz.value.questions[currentQuestionIndex.value]
})

const answeredCount = computed(() => {
  console.log(answers.value);
  
  return Object.values(answers.value).filter(answer => {
    if (Array.isArray(answer)) {
      return answer.length > 0
    }
    return answer !== undefined && answer !== '' && answer !== null
  }).length
})

const unansweredCount = computed(() => {
  return (quiz.value?.questions?.length || 0) - answeredCount.value
})

// Methods
const fetchQuiz = async () => {
  try {
    await quizStore.fetchQuizDetail({ body: { quizId } })
  } catch (err: any) {
    console.error('Failed to fetch quiz:', err)
  }
}

const fetchQuizQuestions = async () => {
  try {
    await quizStore.fetchQuizQuestions({
      body: { quizId }
    })
    // Store will update currentQuiz automatically
  } catch (err: any) {
    console.error('Failed to fetch quiz questions:', err)
    throw err
  }
}

const fetchAttempt = async () => {
  try {
    const response = await quizAttemptStore.fetchAttemptDetail({
      body: { attemptId }
    })

    const attempt = response.data
    attemptNumber.value = attempt.attemptNumber
    startTime.value = new Date(attempt.startedAt)

    // Load existing answers if any
    if (attempt.answers && attempt.answers.length > 0) {
      attempt.answers.forEach((ans: any) => {
        answers.value[ans.questionIndex] = ans.answer
      })
    }

    // Calculate time remaining
    if (quiz.value?.duration) {
      const elapsed = Math.floor((Date.now() - startTime.value.getTime()) / 1000)
      timeRemaining.value = Math.max(0, (quiz.value.duration * 60) - elapsed)
    }
  } catch (err: any) {
    console.error('Failed to fetch attempt:', err)
    throw err
  }
}

const startTimer = () => {
  if (!quiz.value?.duration) return

  timerInterval.value = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      // Auto submit when time runs out
      submitQuiz()
    }
  }, 1000)
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const goToQuestion = (index: number) => {
  currentQuestionIndex.value = index
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < (quiz.value?.questions.length || 0) - 1) {
    currentQuestionIndex.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleCheckboxChange = (option: string) => {
  const currentAnswers = Array.isArray(answers.value[currentQuestionIndex.value])
    ? [...answers.value[currentQuestionIndex.value]]
    : []

  const index = currentAnswers.indexOf(option)
  if (index > -1) {
    currentAnswers.splice(index, 1)
  } else {
    currentAnswers.push(option)
  }

  answers.value[currentQuestionIndex.value] = currentAnswers
}

const confirmSubmit = () => {
  submitModal.value?.showModal()
}

const closeSubmitModal = () => {
  submitModal.value?.close()
}

const submitQuiz = async () => {
  try {
    closeSubmitModal()

    // Prepare answers array
    const answersArray = quiz.value?.questions?.map((_, index) => ({
      questionIndex: index,
      answer: answers.value[index] || null
    })) || []

    await quizAttemptStore.submitQuiz({
      body: {
        attemptId,
        answers: answersArray
      }
    })

    isSubmitted.value = true

    // Stop timer
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  } catch (err: any) {
    console.error('Failed to submit quiz:', err)
    // Stop timer
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
    }
  }
}

const viewResult = () => {
  router.push(`/student/results/${attemptId}`)
}

// Lifecycle
onMounted(async () => {
  try {
    pageLoading.value = true
    await Promise.all([fetchQuiz(), fetchQuizQuestions(), fetchAttempt()])
    startTimer()
  } catch (err) {
    // Error already set
  } finally {
    pageLoading.value = false
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

// Prevent accidental page close
onMounted(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (!isSubmitted.value) {
      e.preventDefault()
      e.returnValue = ''
    }
  }
  window.addEventListener('beforeunload', handleBeforeUnload)

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
})
</script>
