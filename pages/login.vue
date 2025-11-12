<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-2xl">
      <div class="card-body">
        <!-- Logo & Title -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
            E-Learning MJK
          </h1>
          <p class="text-base-content/70">เข้าสู่ระบบผู้ดูแลระบบ</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Email</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon class="w-5 h-5 text-base-content/40" />
              </div>
              <input
                v-model="form.email"
                type="email"
                placeholder="กรอกอีเมล"
                class="input input-bordered w-full pl-10"
                :class="{ 'input-error': errors.email }"
                required
              />
            </div>
            <label v-if="errors.email" class="label">
              <span class="label-text-alt text-error">{{ errors.email }}</span>
            </label>
          </div>

          <!-- Password -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Password</span>
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
          <div v-if="error.title" class="alert alert-error">
            <ExclamationCircleIcon class="w-5 h-5" />
            <span>{{ error.message }}</span>
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
      </div>
    </div>

    <!-- Demo Credentials (ลบออกใน production) -->
    <div class="fixed bottom-4 right-4 card bg-base-100 shadow-lg max-w-xs hidden lg:block">
      <div class="card-body p-4">
        <h4 class="font-semibold text-sm mb-2">🔑 ข้อมูลทดสอบ:</h4>
        <div class="text-xs space-y-1 text-base-content/70">
          <p><strong>Email:</strong> admin@mjk.com</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
        <div class="text-xs space-y-1 text-base-content/70">
          <p><strong>Email:</strong> teacher@mjk.com</p>
          <p><strong>Password:</strong> teacher123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
})

interface LoginErrors {
  email?: string
  password?: string
}

interface LoginAlertError {
  title: string
  message: string
}

const errors = ref<LoginErrors>({})
const error = ref<LoginAlertError>({ title: '', message: '' })
const loading = ref(false)
const showPassword = ref(false)

// Use validation composable
const { validateEmail, validatePassword } = useValidation()

const handleLogin = async () => {
  // Clear previous API errors
  error.value = { title: '', message: '' }

  // Validate all fields before submit
  const emailError = validateEmail(form.value.email)
  const passwordError = validatePassword(form.value.password)

  errors.value = {
    email: emailError,
    password: passwordError
  }

  // Check if there are any validation errors
  if (errors.value.email || errors.value.password) {
    return
  }

  loading.value = true

  try {
    const payload: BaseRequestData<AuthLoginRequest> = {
      body: {
        email: form.value.email,
        password: form.value.password,
      }
    }
    await authStore.login(payload)

    // Check for redirect parameter in URL
    const redirect = router.currentRoute.value.query.redirect as string
    const targetPath = redirect ? decodeURIComponent(redirect) : '/admin'

    // Force navigation and wait for it to complete
    await navigateTo(targetPath, { replace: true, external: false })

  } catch (err: BaseResponseError | any) {
    // Make sure loading is reset on error
    loading.value = false
    error.value = {
      title: ALERT_TEXT.LOGIN_TITLE.th,
      message: BaseResponseError.getMessageTh(err, ALERT_TEXT.LOGIN_FAILED.th)
    }
  }
  // Don't reset loading here for successful login - let the navigation handle it
}

// Handle redirect when already authenticated
onMounted(async () => {

  // Wait a bit for any pending auth initialization
  await nextTick()

  if (authStore.isAuthenticated) {
    const redirect = router.currentRoute.value.query.redirect as string
    const targetPath = redirect ? decodeURIComponent(redirect) : '/admin'
    await navigateTo(targetPath, { replace: true })
  }
})

// Also watch for auth state changes in case auth completes after mount
watch(() => authStore.isAuthenticated, async (isAuthenticated, oldValue) => {
  if (isAuthenticated && !oldValue) {
    const redirect = router.currentRoute.value.query.redirect as string
    const targetPath = redirect ? decodeURIComponent(redirect) : '/admin'
    await navigateTo(targetPath, { replace: true })
  }
})
</script>