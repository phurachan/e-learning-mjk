import { ref } from 'vue'

interface ToastOptions {
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  duration?: number
  position?: 'top' | 'bottom' | 'center'
  onConfirm?: (result: boolean) => void
}

interface Toast extends ToastOptions {
  id: string
  visible: boolean
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
  let toastIdCounter = 0

  const createToast = (options: ToastOptions): string => {
    const id = `toast-${++toastIdCounter}`
    const toast: Toast = {
      id,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      position: options.position || 'top',
      visible: true
    }

    toasts.value.push(toast)

    // Auto remove toast after duration
    if ((toast?.duration ?? 0) > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const hideToast = (id: string) => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.visible = false
      // Remove from array after animation
      setTimeout(() => removeToast(id), 300)
    }
  }

  const clearAll = () => {
    toasts.value = []
  }

  // Convenience methods
  const success = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    return createToast({ ...options, message, title, type: 'success' })
  }

  const error = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    return createToast({ ...options, message, title, type: 'error' })
  }

  const warning = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    return createToast({ ...options, message, title, type: 'warning' })
  }

  const info = (message: string, title?: string, options?: Partial<ToastOptions>) => {
    return createToast({ ...options, message, title, type: 'info' })
  }

  const confirm = (title: string, message: string, variant: 'primary' | 'error' | 'warning' | 'success' = 'primary'): Promise<boolean> => {
    const { showConfirm } = useConfirm()
    return showConfirm({
      title,
      message,
      variant,
      confirmText: 'ตกลง',
      cancelText: 'ยกเลิก'
    })
  }

  return {
    toasts,
    createToast,
    removeToast,
    hideToast,
    clearAll,
    success,
    error,
    warning,
    info,
    confirm
  }
}