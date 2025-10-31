<template>
  <div class="file-upload">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Preview -->
    <div v-if="previewUrl" class="mb-4">
      <div class="relative inline-block">
        <img
          :src="previewUrl"
          :alt="label"
          class="w-32 h-32 object-cover rounded-lg border border-gray-300"
        >
        <button
          type="button"
          @click="removeFile"
          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Upload Area -->
    <div
      v-if="!previewUrl"
      @click="triggerFileInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      ]"
    >
      <div v-if="uploading" class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
        <p class="text-sm text-gray-600">Uploading... {{ uploadProgress }}%</p>
      </div>

      <div v-else class="flex flex-col items-center">
        <svg class="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <p class="text-sm text-gray-600 mb-1">
          <span class="font-medium text-blue-600">Click to upload</span> or drag and drop
        </p>
        <p class="text-xs text-gray-500">{{ accept || 'PNG, JPG, GIF up to 10MB' }}</p>
      </div>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInput"
      type="file"
      :accept="accept || 'image/*'"
      @change="handleFileChange"
      class="hidden"
    >

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>

    <!-- Help Text -->
    <p v-if="helpText && !error" class="mt-2 text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  required: {
    type: Boolean,
    default: false
  },
  helpText: {
    type: String,
    default: ''
  },
  uploadEndpoint: {
    type: String,
    default: '/api/digital-agency/upload/image'
  }
})

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error'])

const fileInput = ref(null)
const previewUrl = ref(props.modelValue || '')
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const isDragging = ref(false)

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== previewUrl.value) {
    previewUrl.value = newValue
  }
})

const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const validateFile = (file) => {
  error.value = ''

  // Check file size
  if (file.size > props.maxSize) {
    error.value = `File size must be less than ${props.maxSize / (1024 * 1024)}MB`
    return false
  }

  // Check file type
  if (props.accept && !file.type.match(props.accept.replace('*', '.*'))) {
    error.value = 'Invalid file type'
    return false
  }

  return true
}

const uploadFile = async (file) => {
  if (!validateFile(file)) return

  uploading.value = true
  uploadProgress.value = 0
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('file', file)

    // Get auth token from cookie or localStorage
    const authStore = useAuthStore()
    const token = authStore.token

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    const response = await $fetch(props.uploadEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (response.data?.url) {
      previewUrl.value = response.data.url
      emit('update:modelValue', response.data.url)
      emit('upload-success', response.data)
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (err) {
    console.error('Upload error:', err)
    error.value = err.data?.message || err.message || 'Failed to upload file'
    emit('upload-error', err)
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const handleFileChange = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) {
    uploadFile(file)
  }
}

const removeFile = () => {
  previewUrl.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.file-upload {
  @apply w-full;
}
</style>
