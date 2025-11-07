<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">วิชาของฉัน</h1>
        <p class="text-base-content/60 mt-1">รายวิชาทั้งหมดที่คุณลงทะเบียนเรียน</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="skeleton h-80 rounded-2xl"></div>
    </div>

    <!-- Courses Grid -->
    <div v-else-if="courses.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StudentCourseCard
        v-for="course in courses"
        :key="course._id"
        :course="course"
        :progress="course.progress"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="card bg-base-100 shadow">
      <div class="card-body items-center text-center py-16">
        <BaseIcon name="academic-cap" class="w-20 h-20 text-base-content/30 mb-4" />
        <h3 class="text-xl font-semibold text-base-content/70 mb-2">ยังไม่มีวิชาที่ลงทะเบียน</h3>
        <p class="text-base-content/50">กรุณาติดต่อครูเพื่อลงทะเบียนเรียน</p>
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

// Stores
const coursesStore = useStudentCoursesStore()
const authStore = useStudentAuthStore()

// State
const loading = computed(() => coursesStore.isLoading)
const courses = computed(() => {
  return (coursesStore.courses || []).map((course: any) => ({
    id: course._id,
    name: course.name,
    code: course.courseId,
    courseId: course.courseId,
    _id: course._id,
    teacher: course.teacher,
    academicYear: course.academicYear,
    semester: course.semester,
    progress: course.progress || 0,
  }))
})

// Fetch courses
const fetchCourses = async () => {
  try {
    const studentId = authStore.studentId

    if (!studentId) {
      console.error('No studentId found')
      navigateTo('/student/login')
      return
    }

    // ⚠️ สำคัญ: ใช้ query structure แบบ standard
    await coursesStore.fetchCourses({
      query: {
        filter: {
          studentId
        }
      }
    })
  } catch (error: any) {
    const err = error instanceof BaseResponseError ? error : new BaseResponseError(error)
    console.error('Failed to fetch courses:', BaseResponseError.getMessageTh(err))
    const toast = useToast()
    toast.error(BaseResponseError.getMessageTh(err, 'ไม่สามารถโหลดรายวิชาได้'), 'เกิดข้อผิดพลาด')
  }
}

// Fetch on mounted
onMounted(() => {
  fetchCourses()
})
</script>
