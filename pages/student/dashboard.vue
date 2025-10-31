<template>
  <div class="space-y-8">
    <!-- Quick Actions -->
    <section>
      <StudentQuickActions />
    </section>

    <!-- My Courses Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <AcademicCapIcon class="w-7 h-7 text-primary" />
          วิชาของฉัน
        </h2>
        <NuxtLink to="/student/courses" class="btn btn-ghost btn-sm gap-2">
          ดูทั้งหมด
          <ChevronRightIcon class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loadingCourses" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="i in 4" :key="i" class="skeleton h-80 rounded-2xl"></div>
      </div>

      <!-- Courses Grid -->
      <div v-else-if="myCourses.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StudentCourseCard
          v-for="course in myCourses.slice(0, 4)"
          :key="course.id"
          :course="course"
          :progress="course.progress || 0"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="card bg-base-100 shadow">
        <div class="card-body items-center text-center py-12">
          <AcademicCapIcon class="w-16 h-16 text-base-content/30 mb-4" />
          <h3 class="text-lg font-semibold text-base-content/70">ยังไม่มีวิชาที่ลงทะเบียน</h3>
          <p class="text-sm text-base-content/50">กรุณาติดต่อครูเพื่อลงทะเบียนเรียน</p>
        </div>
      </div>
    </section>

    <!-- Upcoming Quizzes Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <DocumentTextIcon class="w-7 h-7 text-primary" />
          แบบทดสอบที่ต้องทำ
        </h2>
        <NuxtLink to="/student/quizzes" class="btn btn-ghost btn-sm gap-2">
          ดูทั้งหมด
          <ChevronRightIcon class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loadingQuizzes" class="space-y-4">
        <div v-for="i in 3" :key="i" class="skeleton h-24 rounded-xl"></div>
      </div>

      <!-- Quizzes List -->
      <div v-else-if="upcomingQuizzes.length > 0" class="space-y-4">
        <StudentQuizListItem
          v-for="quiz in upcomingQuizzes.slice(0, 3)"
          :key="quiz.id"
          :quiz="quiz"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="card bg-base-100 shadow">
        <div class="card-body items-center text-center py-12">
          <DocumentTextIcon class="w-16 h-16 text-base-content/30 mb-4" />
          <h3 class="text-lg font-semibold text-base-content/70">ไม่มีแบบทดสอบที่ต้องทำ</h3>
          <p class="text-sm text-base-content/50">คุณทำแบบทดสอบครบแล้ว</p>
        </div>
      </div>
    </section>

    <!-- Recent Results Section -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <ChartBarIcon class="w-7 h-7 text-primary" />
          ผลคะแนนล่าสุด
        </h2>
        <NuxtLink to="/student/results" class="btn btn-ghost btn-sm gap-2">
          ดูทั้งหมด
          <ChevronRightIcon class="w-4 h-4" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loadingResults" class="space-y-4">
        <div v-for="i in 3" :key="i" class="skeleton h-24 rounded-xl"></div>
      </div>

      <!-- Results List -->
      <div v-else-if="recentResults.length > 0" class="space-y-4">
        <StudentResultListItem
          v-for="result in recentResults.slice(0, 3)"
          :key="result.id"
          :result="result"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="card bg-base-100 shadow">
        <div class="card-body items-center text-center py-12">
          <ChartBarIcon class="w-16 h-16 text-base-content/30 mb-4" />
          <h3 class="text-lg font-semibold text-base-content/70">ยังไม่มีผลคะแนน</h3>
          <p class="text-sm text-base-content/50">เมื่อคุณทำแบบทดสอบ ผลคะแนนจะแสดงที่นี่</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useStudentDashboardStore } from '~/stores/studentDashboard'
import { useStudentAuthStore } from '~/stores/studentAuth'

definePageMeta({
  layout: 'student',
})

// Stores
const dashboardStore = useStudentDashboardStore()
const authStore = useStudentAuthStore()

// Restore session on mount
authStore.restoreSession()

// Check if user is logged in, redirect to login if not
if (!authStore.isLoggedIn) {
  navigateTo('/student/login')
}

// State
const loading = computed(() => dashboardStore.isLoading)
const loadingCourses = computed(() => dashboardStore.isLoading)
const loadingQuizzes = computed(() => dashboardStore.isLoading)
const loadingResults = computed(() => dashboardStore.isLoading)

// Data from store
const myCourses = computed(() => {
  return (dashboardStore.courses || []).map((course: any) => ({
    id: course._id,
    name: course.name,
    code: course.courseId,
    teacher: course.teacher,
    academicYear: course.academicYear,
    semester: course.semester,
    progress: course.progress || 0,
  }))
})

const upcomingQuizzes = computed(() => {
  return (dashboardStore.upcomingQuizzes || []).map((quiz: any) => ({
    id: quiz._id,
    title: quiz.title,
    course: quiz.course,
    maxAttempts: quiz.maxAttempts,
    attemptCount: quiz.attemptsMade || 0,
    duration: quiz.duration,
    availableUntil: quiz.endDate,
  }))
})

const recentResults = computed(() => {
  return (dashboardStore.recentResults || []).map((result: any) => ({
    id: result._id,
    quiz: result.quiz,
    score: result.score,
    maxScore: result.maxScore,
    percentage: result.percentage,
    isPassed: result.isPassed,
    isGraded: result.isGraded,
    submittedAt: result.submittedAt,
    attemptNumber: 1, // This should come from the API
    feedback: result.teacherFeedback,
  }))
})

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    // Get studentId from auth store
    const studentId = authStore.studentId

    if (!studentId) {
      console.error('No studentId found in auth store')
      navigateTo('/student/login')
      return
    }

    await dashboardStore.fetchDashboard({
      body: { studentId }
    })
  } catch (error: any) {
    console.error('Failed to fetch dashboard data:', error)
    // TODO: Show error alert using useToast or useAlert
  }
}

// Fetch data on mounted
onMounted(() => {
  fetchDashboardData()
})
</script>
