<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading">
      <div class="skeleton h-16 w-full rounded-2xl mb-6"></div>
      <div class="skeleton h-96 w-full rounded-2xl mb-6"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="skeleton h-12 rounded-xl"></div>
        <div class="skeleton h-12 rounded-xl"></div>
      </div>
    </div>

    <!-- Lesson Content -->
    <template v-else-if="lesson">
      <!-- Breadcrumb and Header -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <!-- Breadcrumb -->
          <div class="text-sm breadcrumbs mb-4">
            <ul>
              <li>
                <NuxtLink to="/student/courses" class="text-primary hover:underline">
                  รายวิชาทั้งหมด
                </NuxtLink>
              </li>
              <li>
                <NuxtLink :to="`/student/courses/${route.params.courseId}`" class="text-primary hover:underline">
                  {{ lesson.course.name }}
                </NuxtLink>
              </li>
              <li class="text-base-content/60">{{ lesson.title }}</li>
            </ul>
          </div>

          <!-- Lesson Header -->
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h1 class="text-3xl font-bold mb-2">{{ lesson.title }}</h1>
              <p v-if="lesson.description" class="text-base-content/70 mb-4">
                {{ lesson.description }}
              </p>
              <div class="flex flex-wrap gap-4 text-sm text-base-content/60">
                <div v-if="lesson.duration" class="flex items-center gap-2">
                  <BaseIcon name="clock" size="sm" />
                  <span>{{ lesson.duration }} นาที</span>
                </div>
                <div class="flex items-center gap-2">
                  <BaseIcon name="book-open" size="sm" />
                  <span>บทที่ {{ lesson.order }}</span>
                </div>
                <div v-if="lesson.hasQuiz" class="flex items-center gap-2 text-warning">
                  <BaseIcon name="document-text" size="sm" />
                  <span>มีแบบทดสอบ</span>
                </div>
              </div>
            </div>
            <!-- Mark as Complete Button -->
            <div class="flex-shrink-0">
              <BaseButton v-if="!lesson.isCompleted" variant="success" size="md" @click="markAsComplete">
                <div class="flex items-center gap-2">
                  <BaseIcon name="check-circle" size="sm" />
                  <span>ทำเครื่องหมายว่าเสร็จสิ้น</span>
                </div>
              </BaseButton>
              <div v-else class="badge badge-success gap-2 p-4">
                <BaseIcon name="check-circle" size="sm" />
                เรียนจบแล้ว
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lesson Content -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="prose max-w-none" v-html="lesson.content"></div>
        </div>
      </div>

      <!-- Attachments -->
      <div v-if="lesson.files && lesson.files.length > 0" class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-4">
            <BaseIcon name="paper-clip" size="lg" class="text-primary" />
            ไฟล์แนบ
          </h2>
          <div class="space-y-2">
            <a v-for="file in lesson.files" :key="file._id" :href="file.url" target="_blank"
              class="flex items-center gap-3 p-3 rounded-lg border-2 border-base-300 hover:border-primary hover:bg-base-200 transition-all">
              <BaseIcon name="document" size="md" class="text-primary" />
              <div class="flex-1">
                <div class="font-medium">{{ file.name }}</div>
                <div class="text-sm text-base-content/60">
                  {{ file.type }} - {{ formatFileSize(file.size) }}
                </div>
              </div>
              <BaseIcon name="arrow-down-tray" size="sm" class="text-base-content/40" />
            </a>
          </div>
        </div>
      </div>

      <!-- Quiz Section -->
      <div v-if="lesson.hasQuiz && lesson.quiz"
        class="card bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-xl mb-2">
            <BaseIcon name="document-text" size="lg" class="text-warning" />
            แบบทดสอบ
          </h2>
          <h3 class="text-lg font-semibold">{{ lesson.quiz.title }}</h3>
          <p v-if="lesson.quiz.description" class="text-base-content/70">
            {{ lesson.quiz.description }}
          </p>
          <div class="card-actions justify-end mt-4">
            <BaseButton variant="warning" size="md" @click="navigateTo(`/student/quizzes/${lesson.quiz._id}`)">
              <BaseIcon name="pencil-square" size="sm" />
              <span>เริ่มทำแบบทดสอบ</span>
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex gap-4">
        <!-- Previous Lesson -->
        <BaseButton
          v-if="lesson.navigation?.previous"
          variant="default"
          outline
          size="lg"
          @click="navigateToLesson(lesson.navigation.previous._id)"
        >
          <div class="flex items-center gap-2">
            <BaseIcon name="chevron-left" size="sm" class="flex-shrink-0" />
            <div class="text-left">
              <div class="text-xs text-base-content/60 whitespace-nowrap">บทก่อนหน้า</div>
              <div class="font-semibold whitespace-nowrap">{{ lesson.navigation.previous.title }}</div>
            </div>
          </div>
        </BaseButton>

        <!-- Next Lesson -->
        <BaseButton
          v-if="lesson.navigation?.next"
          variant="primary"
          size="lg"
          class="ml-auto"
          @click="navigateToLesson(lesson.navigation.next._id)"
        >
          <div class="flex items-center gap-2">
            <div class="text-right">
              <div class="text-xs text-primary-content/80 whitespace-nowrap">บทถัดไป</div>
              <div class="font-semibold whitespace-nowrap">{{ lesson.navigation.next.title }}</div>
            </div>
            <BaseIcon name="chevron-right" size="sm" class="flex-shrink-0" />
          </div>
        </BaseButton>
      </div>
    </template>

    <!-- Error State -->
    <div v-else class="card bg-base-100 shadow">
      <div class="card-body items-center text-center py-16">
        <BaseIcon name="exclamation-circle" class="w-20 h-20 text-error mb-4" />
        <h3 class="text-xl font-semibold mb-2">ไม่พบบทเรียน</h3>
        <p class="text-base-content/60 mb-4">ไม่สามารถโหลดข้อมูลบทเรียนได้</p>
        <BaseButton variant="primary" @click="navigateTo(`/student/courses/${route.params.courseId}`)">
          กลับไปหน้ารายละเอียดวิชา
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStudentCoursesStore } from '~/stores/studentCourses'
import { useStudentAuthStore } from '~/stores/studentAuth'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { API_ENDPOINTS } from '~/composables/constants/api'
import { BaseResponseError } from '~/composables/utility_models/http'

definePageMeta({
  layout: 'student',
})

const route = useRoute()

// Stores
const coursesStore = useStudentCoursesStore()
const authStore = useStudentAuthStore()

// State
const loading = computed(() => coursesStore.isLoading)
const lesson = computed(() => coursesStore.currentLesson)

// Fetch lesson detail
const fetchLessonDetail = async () => {
  try {
    const studentId = authStore.studentId
    const lessonId = route.params.lessonId as string

    if (!studentId) {
      console.error('No studentId found')
      navigateTo('/student/login')
      return
    }

    await coursesStore.fetchLessonDetail({
      body: { lessonId },
      query: { filter: { studentId } }
    })
  } catch (error: any) {
    const err = error instanceof BaseResponseError ? error : new BaseResponseError(error)
    console.error('Failed to fetch lesson detail:', BaseResponseError.getMessageTh(err))
    const toast = useToast()
    toast.error(BaseResponseError.getMessageTh(err, 'ไม่สามารถโหลดบทเรียนได้'), 'เกิดข้อผิดพลาด')
  }
}

// Mark lesson as complete
const markAsComplete = async () => {
  try {
    const httpClient = useHttpClient()
    const toast = useToast()

    await httpClient.post(API_ENDPOINTS.STUDENTS.LESSON_COMPLETE(route.params.lessonId as string))

    // Show success message
    toast.success('บันทึกความคืบหน้าสำเร็จ', 'สำเร็จ')

    // Refresh lesson data to show updated completion status
    await fetchLessonDetail()
  } catch (error: any) {
    const err = error instanceof BaseResponseError ? error : new BaseResponseError(error)
    const toast = useToast()
    toast.error(BaseResponseError.getMessageTh(err, 'ไม่สามารถบันทึกความคืบหน้าได้'), 'เกิดข้อผิดพลาด')
    console.error('Failed to mark lesson as complete:', error)
  }
}

// Navigate to another lesson
const navigateToLesson = (lessonId: string) => {
  navigateTo(`/student/courses/${route.params.courseId}/lessons/${lessonId}`)
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Fetch on mounted
onMounted(() => {
  fetchLessonDetail()
})

// Clear on unmount
onUnmounted(() => {
  coursesStore.clearCurrentLesson()
})

// Watch route changes to refetch lesson
watch(() => route.params.lessonId, () => {
  if (route.params.lessonId) {
    fetchLessonDetail()
  }
})
</script>
