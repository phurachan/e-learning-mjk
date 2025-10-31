<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- My Courses -->
    <NuxtLink
      to="/student/courses"
      class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div class="card-body items-center text-center p-6">
        <AcademicCapIcon class="w-12 h-12 mb-2" />
        <h3 class="card-title text-lg">วิชาของฉัน</h3>
        <p class="text-sm opacity-90">เรียนรู้เนื้อหาบทเรียน</p>
      </div>
    </NuxtLink>

    <!-- All Quizzes -->
    <NuxtLink
      to="/student/quizzes"
      class="card bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div class="card-body items-center text-center p-6">
        <DocumentTextIcon class="w-12 h-12 mb-2" />
        <h3 class="card-title text-lg">แบบทดสอบทั้งหมด</h3>
        <p class="text-sm opacity-90">ทำแบบทดสอบและฝึกฝน</p>
      </div>
    </NuxtLink>

    <!-- My Results -->
    <NuxtLink
      to="/student/results"
      class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div class="card-body items-center text-center p-6">
        <ChartBarIcon class="w-12 h-12 mb-2" />
        <h3 class="card-title text-lg">ผลคะแนนของฉัน</h3>
        <p class="text-sm opacity-90">ดูผลการเรียนและคะแนน</p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import {
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'
</script>
