<template>
  <div>
    <form @submit.prevent="handleLogin" class="space-y-6" novalidate>
      <!-- Email Input -->
      <BaseInput v-model="form.email" type="email" label="Email" placeholder="Enter your email" :error="errors.email"
        :disabled="loading" required @update:error="errors.email = $event" />

      <!-- Password Input -->
      <BaseInput v-model="form.password" type="password" label="Password" placeholder="Enter your password"
        :error="errors.password" :disabled="loading" required @keyup.enter="handleLogin"
        @update:error="errors.password = $event" />

      <!-- Submit Button -->
      <BaseButton type="submit" variant="primary" size="lg" class="w-full" :loading="loading"
        loading-text="Signing in..." @click="handleLogin">
        Sign In
      </BaseButton>
    </form>

    <!-- Error Alert -->
    <BaseAlert v-if="error.title" type="error" :title="error.title" :visible="!!error.title" :message="error.message"
      @close="error.title = ''" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth',
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