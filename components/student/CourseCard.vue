<template>
  <div
    class="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
    @click="handleClick"
  >
    <!-- Course Thumbnail with Gradient -->
    <div
      class="h-40 rounded-t-2xl relative overflow-hidden"
      :style="{ background: gradientBackground }"
    >
      <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      <div class="absolute bottom-4 left-4 right-4">
        <div class="badge badge-sm bg-white/90 text-primary border-0">
          {{ course.courseId || course.code || 'N/A' }}
        </div>
      </div>
    </div>

    <!-- Course Info -->
    <div class="card-body p-5">
      <h3 class="card-title text-lg line-clamp-2 min-h-[3.5rem]">
        {{ course.name }}
      </h3>

      <!-- Teacher Info -->
      <div class="flex items-center gap-2 text-sm text-base-content/70">
        <UserIcon class="w-4 h-4" />
        <span>{{ course.teacher?.name || 'ไม่ระบุครู' }}</span>
      </div>

      <!-- Academic Year & Semester -->
      <div class="flex items-center gap-2 text-sm text-base-content/70">
        <CalendarIcon class="w-4 h-4" />
        <span>{{ course.academicYear }} / ภาคเรียนที่ {{ course.semester }}</span>
      </div>

      <!-- Progress Bar -->
      <div class="mt-4">
        <div class="flex justify-between text-xs mb-1">
          <span class="text-base-content/70">ความคืบหน้า</span>
          <span class="font-semibold text-primary">{{ progressPercentage }}%</span>
        </div>
        <progress
          class="progress progress-primary w-full"
          :value="progressPercentage"
          max="100"
        ></progress>
      </div>

      <!-- Action Button -->
      <div class="card-actions justify-end mt-4">
        <button class="btn btn-primary btn-sm w-full group-hover:btn-primary">
          <AcademicCapIcon class="w-4 h-4" />
          เข้าเรียน
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AcademicCapIcon, UserIcon, CalendarIcon } from '@heroicons/vue/24/outline'

interface Props {
  course: {
    id?: string
    _id?: string
    name: string
    code?: string
    courseId?: string
    teacher?: {
      name: string
    }
    academicYear: string
    semester: number
  }
  progress?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0,
})

const progressPercentage = computed(() => {
  return Math.min(Math.max(props.progress, 0), 100)
})

// Generate gradient based on course code
const gradientBackground = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  ]

  // Use courseId or code, fallback to course name or _id
  const identifier = props.course.courseId || props.course.code || props.course.name || props.course._id || props.course.id || ''

  const hash = identifier.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)

  return gradients[hash % gradients.length]
})

const handleClick = () => {
  // Use id first, fallback to _id
  const courseId = props.course.id || props.course._id
  if (!courseId) {
    console.error('Course ID is missing:', props.course)
    return
  }
  navigateTo(`/student/courses/${courseId}`)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
