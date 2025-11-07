<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading">
      <div class="skeleton h-32 w-full rounded-2xl mb-6"></div>
      <div class="space-y-4">
        <div v-for="i in 5" :key="i" class="skeleton h-24 rounded-xl"></div>
      </div>
    </div>

    <!-- Course Content -->
    <template v-else-if="course">
      <!-- Course Header -->
      <div class="card bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl">
        <div class="card-body">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <BaseButton
                  variant="ghost"
                  size="sm"
                  class="text-white hover:bg-white/20"
                  @click="navigateTo('/student/courses')"
                >
                  <BaseIcon name="arrow-left" size="sm" />
                  <span>กลับ</span>
                </BaseButton>
              </div>
              <h1 class="text-3xl font-bold mb-2">{{ course.name }}</h1>
              <p class="text-white/90 mb-4">{{ course.description }}</p>
              <div class="flex flex-wrap gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <BaseIcon name="user" size="sm" />
                  <span>{{ teacherName }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <BaseIcon name="calendar" size="sm" />
                  <span>{{ course.academicYear }} / {{ course.semester }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <BaseIcon name="book-open" size="sm" />
                  <span>{{ course.totalLessons }} บทเรียน</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-4xl font-bold">{{ course.progress }}%</div>
              <div class="text-sm text-white/80">ความคืบหน้า</div>
            </div>
          </div>
          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="w-full bg-white/20 rounded-full h-3">
              <div
                class="bg-white h-3 rounded-full transition-all"
                :style="{ width: `${course.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lessons List -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <BaseIcon name="list-bullet" size="lg" class="text-primary" />
            รายการบทเรียน
          </h2>

          <!-- Empty State -->
          <div v-if="!lessons || lessons.length === 0" class="text-center py-12">
            <BaseIcon name="book-open" class="w-16 h-16 text-base-content/30 mb-4 mx-auto" />
            <p class="text-base-content/60">ยังไม่มีบทเรียนในวิชานี้</p>
          </div>

          <!-- Lessons -->
          <div v-else class="space-y-3">
            <NuxtLink
              v-for="(lesson, index) in lessons"
              :key="lesson._id"
              :to="`/student/courses/${route.params.id}/lessons/${lesson._id}`"
              class="block p-4 rounded-xl border-2 hover:border-primary hover:bg-base-200 transition-all"
              :class="lesson.isCompleted ? 'border-success bg-success/5' : 'border-base-300'"
            >
              <div class="flex items-center gap-4">
                <!-- Lesson Number -->
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  :class="lesson.isCompleted ? 'bg-success text-success-content' : 'bg-primary text-primary-content'"
                >
                  {{ index + 1 }}
                </div>

                <!-- Lesson Info -->
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">{{ lesson.title }}</h3>
                  <p v-if="lesson.description" class="text-sm text-base-content/60 line-clamp-1">
                    {{ lesson.description }}
                  </p>
                  <div class="flex items-center gap-4 mt-1 text-sm text-base-content/60">
                    <span v-if="lesson.duration" class="flex items-center gap-1">
                      <BaseIcon name="clock" size="xs" />
                      {{ lesson.duration }} นาที
                    </span>
                    <span v-if="lesson.hasQuiz" class="flex items-center gap-1 text-warning">
                      <BaseIcon name="document-text" size="xs" />
                      มีแบบทดสอบ
                    </span>
                  </div>
                </div>

                <!-- Status Icon -->
                <div class="flex-shrink-0">
                  <BaseIcon
                    v-if="lesson.isCompleted"
                    name="check-circle"
                    size="lg"
                    class="text-success"
                  />
                  <BaseIcon
                    v-else
                    name="arrow-right"
                    size="lg"
                    class="text-base-content/30"
                  />
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <!-- Error State -->
    <div v-else class="card bg-base-100 shadow">
      <div class="card-body items-center text-center py-16">
        <BaseIcon name="exclamation-circle" class="w-20 h-20 text-error mb-4" />
        <h3 class="text-xl font-semibold mb-2">ไม่พบรายวิชา</h3>
        <p class="text-base-content/60 mb-4">ไม่สามารถโหลดข้อมูลรายวิชาได้</p>
        <BaseButton variant="primary" @click="navigateTo('/student/courses')">
          กลับไปหน้ารายวิชา
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStudentCoursesStore } from '~/stores/studentCourses'
import { useStudentAuthStore } from '~/stores/studentAuth'
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
const course = computed(() => coursesStore.currentCourse)
const lessons = computed(() => course.value?.lessons ?? [])
const teacherName = computed(() => {
  const teacher = course.value?.teacher
  if (!teacher) return 'ไม่ระบุ'
  if (teacher.name) return teacher.name
  return `${teacher.firstname || ''} ${teacher.lastname || ''}`.trim() || 'ไม่ระบุ'
})

// Fetch course detail
const fetchCourseDetail = async () => {
  try {
    const studentId = authStore.studentId
    const courseId = route.params.id as string

    if (!studentId) {
      console.error('No studentId found')
      navigateTo('/student/login')
      return
    }

    await coursesStore.fetchCourseDetail({
      body: { courseId },
      query: { filter: { studentId } }
    })
  } catch (error: any) {
    const err = error instanceof BaseResponseError ? error : new BaseResponseError(error)
    console.error('Failed to fetch course detail:', BaseResponseError.getMessageTh(err))
    const toast = useToast()
    toast.error(BaseResponseError.getMessageTh(err, 'ไม่สามารถโหลดรายละเอียดวิชาได้'), 'เกิดข้อผิดพลาด')
  }
}

// Fetch on mounted
onMounted(() => {
  fetchCourseDetail()
})

// Clear on unmount
onUnmounted(() => {
  coursesStore.clearCurrentCourse()
})
</script>
