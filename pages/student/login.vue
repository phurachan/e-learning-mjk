<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-2xl">
      <div class="card-body">
        <!-- Logo & Title -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
            E-Learning MJK
          </h1>
          <p class="text-base-content/70">เข้าสู่ระบบนักเรียน</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Student ID -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">รหัสนักเรียน</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon class="w-5 h-5 text-base-content/40" />
              </div>
              <input
                v-model="form.studentId"
                type="text"
                placeholder="กรอกรหัสนักเรียน"
                class="input input-bordered w-full pl-10"
                :class="{ 'input-error': errors.studentId }"
                required
              />
            </div>
            <label v-if="errors.studentId" class="label">
              <span class="label-text-alt text-error">{{ errors.studentId }}</span>
            </label>
          </div>

          <!-- Password -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">รหัสผ่าน</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="w-5 h-5 text-base-content/40" />
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="กรอกรหัสผ่าน"
                class="input input-bordered w-full pl-10 pr-10"
                :class="{ 'input-error': errors.password }"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showPassword" class="w-5 h-5 text-base-content/40 hover:text-base-content/70" />
                <EyeSlashIcon v-else class="w-5 h-5 text-base-content/40 hover:text-base-content/70" />
              </button>
            </div>
            <label v-if="errors.password" class="label">
              <span class="label-text-alt text-error">{{ errors.password }}</span>
            </label>
          </div>

          <!-- Error Alert -->
          <div v-if="loginError" class="alert alert-error">
            <ExclamationCircleIcon class="w-5 h-5" />
            <span>{{ loginError }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn-primary w-full"
            :class="{ 'btn-disabled': loading }"
            :disabled="loading"
          >
            <span v-if="loading" class="loading loading-spinner"></span>
            <span v-else>เข้าสู่ระบบ</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider text-sm text-base-content/50">หรือ</div>

        <!-- Back to Main Site -->
        <NuxtLink to="/" class="btn btn-ghost btn-sm w-full">
          <ArrowLeftIcon class="w-4 h-4" />
          กลับหน้าหลัก
        </NuxtLink>

        <!-- Help Text -->
        <div class="text-center text-sm text-base-content/60 mt-4">
          <p>ลืมรหัสผ่าน? ติดต่อครูผู้สอน</p>
        </div>
      </div>
    </div>

    <!-- Demo Credentials (ลบออกใน production) -->
    <div class="fixed bottom-4 right-4 card bg-base-100 shadow-lg max-w-xs hidden lg:block">
      <div class="card-body p-4">
        <h4 class="font-semibold text-sm mb-2">🔑 ข้อมูลทดสอบ:</h4>
        <div class="text-xs space-y-1 text-base-content/70">
          <p><strong>รหัส:</strong> STD001</p>
          <p><strong>รหัสผ่าน:</strong> student123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'
import { useStudentAuthStore } from '~/stores/studentAuth'
import { BaseResponseError } from '~/composables/utility_models/http'

definePageMeta({
  layout: false,
})

// Store
const authStore = useStudentAuthStore()

const form = ref({
  studentId: '',
  password: '',
})

const errors = ref({
  studentId: '',
  password: '',
})

const loginError = ref('')
const loading = computed(() => authStore.isLoading)
const showPassword = ref(false)

const handleLogin = async () => {
  // Reset errors
  errors.value = { studentId: '', password: '' }
  loginError.value = ''

  // Validate
  if (!form.value.studentId) {
    errors.value.studentId = 'กรุณากรอกรหัสนักเรียน'
    return
  }

  if (!form.value.password) {
    errors.value.password = 'กรุณากรอกรหัสผ่าน'
    return
  }

  try {
    // Call login action from store
    await authStore.login({
      body: {
        studentId: form.value.studentId.toUpperCase(),
        password: form.value.password
      }
    })

    // Success - redirect to dashboard
    navigateTo('/student/dashboard')
  } catch (error: any) {
    // Handle error from BaseResponseError
    const err = error instanceof BaseResponseError ? error : new BaseResponseError(error)
    loginError.value = BaseResponseError.getMessageTh(err, 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
  }
}
</script>
