import { ref, readonly } from 'vue'

// Global loading state - singleton pattern
const isLoading = ref(false)
const loadingMessage = ref('กำลังโหลด...')
const loadingConfig = ref({
  size: 'md' as 'xs' | 'sm' | 'md' | 'lg',
  spinner: 'spinner' as 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity',
  backdrop: true,
  backdropColor: 'bg-black/50'
})

// Loading composable
export const useLoading = () => {
  // Show loading with optional configuration
  const show = (message?: string, config?: Partial<typeof loadingConfig.value>) => {
    if (message) {
      loadingMessage.value = message
    }
    
    if (config) {
      loadingConfig.value = { ...loadingConfig.value, ...config }
    }
    
    isLoading.value = true
  }
  
  // Hide loading
  const hide = () => {
    isLoading.value = false
  }
  
  // Toggle loading
  const toggle = (message?: string, config?: Partial<typeof loadingConfig.value>) => {
    if (isLoading.value) {
      hide()
    } else {
      show(message, config)
    }
  }
  
  // Check if loading is active
  const isActive = readonly(isLoading)
  
  // Get current message
  const getMessage = readonly(loadingMessage)
  
  // Get current config
  const getConfig = readonly(loadingConfig)
  
  return {
    show,
    hide,
    toggle,
    isActive,
    getMessage,
    getConfig
  }
}