<template>
  <div class="min-h-screen bg-base-200">
    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <!-- Left: System Name -->
      <div class="navbar-start">
        <NuxtLink to="/student/dashboard" class="btn btn-ghost text-xl font-bold">
          <span class="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
            E-Learning MJK
          </span>
        </NuxtLink>
      </div>

      <!-- Center: Menu -->
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1 gap-2">
          <li>
            <NuxtLink
              to="/student/courses"
              class="btn btn-ghost"
              active-class="btn-primary"
            >
              <AcademicCapIcon class="w-5 h-5" />
              วิชาของฉัน
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/student/quizzes"
              class="btn btn-ghost"
              active-class="btn-primary"
            >
              <DocumentTextIcon class="w-5 h-5" />
              แบบทดสอบ
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/student/results"
              class="btn btn-ghost"
              active-class="btn-primary"
            >
              <ChartBarIcon class="w-5 h-5" />
              ผลคะแนน
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Right: Student Info + Dark Mode -->
      <div class="navbar-end gap-2">
        <!-- Dark Mode Toggle -->
        <label class="swap swap-rotate btn btn-ghost btn-circle">
          <input
            type="checkbox"
            class="theme-controller"
            :checked="isDark"
            @change="toggleTheme"
          />
          <SunIcon class="swap-off w-6 h-6" />
          <MoonIcon class="swap-on w-6 h-6" />
        </label>

        <!-- Student Info -->
        <div class="hidden md:flex items-center gap-3">
          <div class="text-right">
            <div class="text-sm font-semibold">{{ studentName }}</div>
            <div class="text-xs text-base-content/70">{{ studentId }}</div>
          </div>
          <div class="avatar placeholder">
            <div class="bg-gradient-to-br from-blue-500 to-pink-500 text-white rounded-full w-10 !flex !items-center !justify-center">
              <span class="text-lg font-bold">{{ studentInitial }}</span>
            </div>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div class="dropdown dropdown-end lg:hidden">
          <label tabindex="0" class="btn btn-ghost btn-circle">
            <Bars3Icon class="w-6 h-6" />
          </label>
          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <NuxtLink to="/student/courses">
                <AcademicCapIcon class="w-5 h-5" />
                วิชาของฉัน
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/student/quizzes">
                <DocumentTextIcon class="w-5 h-5" />
                แบบทดสอบ
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/student/results">
                <ChartBarIcon class="w-5 h-5" />
                ผลคะแนน
              </NuxtLink>
            </li>
            <li class="md:hidden border-t mt-2 pt-2">
              <div class="flex items-center gap-2">
                <div class="avatar placeholder">
                  <div class="bg-gradient-to-br from-blue-500 to-pink-500 text-white rounded-full w-8 flex items-center justify-center">
                    <span class="text-sm font-bold">{{ studentInitial }}</span>
                  </div>
                </div>
                <div>
                  <div class="text-sm font-semibold">{{ studentName }}</div>
                  <div class="text-xs text-base-content/70">{{ studentId }}</div>
                </div>
              </div>
            </li>
            <li>
              <button @click="handleLogout" class="text-error">
                <ArrowRightOnRectangleIcon class="w-5 h-5" />
                ออกจากระบบ
              </button>
            </li>
          </ul>
        </div>

        <!-- Logout Button (Desktop) -->
        <button @click="handleLogout" class="btn btn-ghost btn-circle hidden lg:flex" title="ออกจากระบบ">
          <ArrowRightOnRectangleIcon class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import { useStudentAuthStore } from '~/stores/studentAuth'

// Store
const authStore = useStudentAuthStore()

// Restore session
authStore.restoreSession()

// Get student data from store
const studentName = computed(() => authStore.studentFullname || 'นักเรียน')
const studentId = computed(() => authStore.studentId || '')
const studentInitial = computed(() => {
  const name = authStore.currentStudent?.firstname || authStore.studentFullname || 'N'
  return name.charAt(0).toUpperCase()
})

// Dark mode toggle
const isDark = ref(false)

onMounted(() => {
  // Check saved theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    isDark.value = false
    document.documentElement.setAttribute('data-theme', 'light')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

const handleLogout = async () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    await authStore.logout()
  }
}
</script>
