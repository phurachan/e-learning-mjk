<template>
  <div>
    <BaseBreadcrumbs />

    <BasePageHeader
      :title="t('nav.settings')"
      :subtitle="'i18n & Error Handling Test'"
    />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Language Testing -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{{ t('common.language') || 'Language Testing' }}</h2>

          <div class="space-y-4">
            <div>
              <label class="label">
                <span class="label-text">{{ t('common.current_language') || 'Current Language' }}</span>
              </label>
              <div class="text-lg font-semibold">{{ currentLocaleName }}</div>
            </div>

            <div>
              <label class="label">
                <span class="label-text">{{ t('fields.name') }}</span>
              </label>
              <div>{{ t('fields.name') }}</div>
            </div>

            <div>
              <label class="label">
                <span class="label-text">{{ t('fields.email') }}</span>
              </label>
              <div>{{ t('fields.email') }}</div>
            </div>

            <div>
              <label class="label">
                <span class="label-text">{{ t('common.save') }}</span>
              </label>
              <div>{{ t('common.save') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Testing -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Error Handling Test</h2>

          <div class="space-y-3">
            <BaseButton
              :label="'Test Success Alert'"
              variant="success"
              @click="testSuccessAlert"
            />

            <BaseButton
              :label="'Test Error Alert'"
              variant="error"
              @click="testErrorAlert"
            />

            <BaseButton
              :label="'Test Warning Alert'"
              variant="warning"
              @click="testWarningAlert"
            />

            <BaseButton
              :label="'Test Info Alert'"
              variant="info"
              @click="testInfoAlert"
            />

            <BaseButton
              :label="'Test Confirm Dialog'"
              variant="primary"
              @click="testConfirmDialog"
            />

            <BaseButton
              :label="'Test API Error (Invalid User ID)'"
              variant="error"
              outline
              @click="testAPIError"
            />

            <BaseButton
              :label="'Test Validation Error'"
              variant="error"
              outline
              @click="testValidationError"
            />
          </div>
        </div>
      </div>

      <!-- Localized Content -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{{ t('nav.users') }}</h2>

          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              <span class="badge badge-primary">{{ t('common.add') }}</span>
              <span class="badge badge-secondary">{{ t('common.edit') }}</span>
              <span class="badge badge-accent">{{ t('common.delete') }}</span>
              <span class="badge badge-neutral">{{ t('common.view') }}</span>
            </div>

            <div class="alert alert-info">
              <BaseIcon name="information-circle" size="sm" />
              <span>{{ t('success.SAVE_SUCCESS') }}</span>
            </div>

            <div class="alert alert-warning">
              <BaseIcon name="exclamation-triangle" size="sm" />
              <span>{{ t('errors.VALIDATION_FAILED') }}</span>
            </div>

            <div class="alert alert-error">
              <BaseIcon name="x-circle" size="sm" />
              <span>{{ t('errors.USER_NOT_FOUND') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Testing -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Form Validation Test</h2>

          <form @submit.prevent="testFormSubmit" class="space-y-4">
            <BaseInput
              v-model="testForm.name"
              :label="t('fields.name')"
              :placeholder="t('fields.name')"
              required
            />

            <BaseInput
              v-model="testForm.email"
              :label="t('fields.email')"
              :placeholder="t('fields.email')"
              type="email"
              required
            />

            <BaseInput
              v-model="testForm.password"
              :label="t('fields.password')"
              :placeholder="t('fields.password')"
              type="password"
              required
            />

            <div class="flex gap-2">
              <BaseButton
                type="submit"
                :label="t('common.submit')"
                variant="primary"
                v-model:submitLoading="isSubmitting"
                loadingText="กำลังส่ง..."
                successText="ส่งสำเร็จ!"
              />

              <BaseButton
                type="button"
                :label="t('common.reset')"
                variant="ghost"
                @click="resetForm"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { $i18n } = useNuxtApp()
const { t } = useI18n()
const { showAlert, showSuccess, showError, showWarning, showInfo, showConfirm, confirmDelete } = useAlert()
const { handleAPIError, handleAPISuccess, handleValidationErrors } = useErrorHandler()

// Current language info
const currentLocaleName = computed(() => {
  const currentLocale = $i18n.locales.value.find(locale => locale.code === $i18n.locale.value)
  return currentLocale?.name || $i18n.locale.value
})

// Test form
const testForm = ref({
  name: '',
  email: '',
  password: ''
})

const isSubmitting = ref(false)

// Test functions
const testSuccessAlert = () => {
  showSuccess(t('success.SAVE_SUCCESS'))
}

const testErrorAlert = () => {
  showError(t('errors.USER_NOT_FOUND'))
}

const testWarningAlert = () => {
  showWarning(t('errors.VALIDATION_FAILED'))
}

const testInfoAlert = () => {
  showInfo(t('common.info') + ': This is an info message')
}

const testConfirmDialog = async () => {
  const result = await showConfirm({
    title: t('common.confirm'),
    message: 'Are you sure you want to proceed with this action?'
  })

  if (result) {
    showSuccess('You confirmed the action!')
  } else {
    showInfo('You cancelled the action.')
  }
}

const testAPIError = () => {
  // Simulate API error response
  const mockError = {
    statusMessage: 'INVALID_USER_ID',
    statusCode: 400,
    data: {
      messages: {
        th: 'รหัสผู้ใช้งานไม่ถูกต้อง',
        en: 'Invalid user ID'
      }
    }
  }

  handleAPIError(mockError)
}

const testValidationError = () => {
  // Simulate validation error
  const mockValidationErrors = {
    name: ['USER_NAME_REQUIRED'],
    email: ['USER_EMAIL_REQUIRED', 'USER_EMAIL_INVALID_FORMAT'],
    password: ['USER_PASSWORD_MIN_LENGTH']
  }

  handleValidationErrors(mockValidationErrors)
}

const testFormSubmit = async () => {
  if (!testForm.value.name || !testForm.value.email || !testForm.value.password) {
    handleValidationErrors({
      name: !testForm.value.name ? ['USER_NAME_REQUIRED'] : [],
      email: !testForm.value.email ? ['USER_EMAIL_REQUIRED'] : [],
      password: !testForm.value.password ? ['USER_PASSWORD_REQUIRED'] : []
    })
    return
  }

  isSubmitting.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))

  isSubmitting.value = false
  handleAPISuccess('CREATE_SUCCESS')
}

const resetForm = () => {
  testForm.value = {
    name: '',
    email: '',
    password: ''
  }
}
</script>