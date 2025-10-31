export interface AlertOptions {
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm'
  title?: string
  message: string
  position?: 'top' | 'bottom' | 'center'
  duration?: number
  html?: boolean
}

export interface ConfirmOptions extends Omit<AlertOptions, 'type'> {
  confirmText?: string
  cancelText?: string
}

const alertState = ref<{
  isVisible: boolean
  options: AlertOptions | null
}>({
  isVisible: false,
  options: null
})

const confirmState = ref<{
  isVisible: boolean
  options: ConfirmOptions | null
  resolver: ((value: boolean) => void) | null
}>({
  isVisible: false,
  options: null,
  resolver: null
})

export const useAlert = () => {
  const { t } = useI18n()

  const showAlert = (options: AlertOptions) => {
    alertState.value = {
      isVisible: true,
      options: {
        position: 'top',
        duration: 5000,
        html: false,
        ...options
      }
    }
  }

  const hideAlert = () => {
    alertState.value = {
      isVisible: false,
      options: null
    }
  }

  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmState.value = {
        isVisible: true,
        options: {
          position: 'center',
          confirmText: t('common.confirm'),
          cancelText: t('common.cancel'),
          ...options
        },
        resolver: resolve
      }
    })
  }

  const hideConfirm = () => {
    if (confirmState.value.resolver) {
      confirmState.value.resolver(false)
    }
    confirmState.value = {
      isVisible: false,
      options: null,
      resolver: null
    }
  }

  const handleConfirmResult = (result: boolean) => {
    if (confirmState.value.resolver) {
      confirmState.value.resolver(result)
    }
    confirmState.value = {
      isVisible: false,
      options: null,
      resolver: null
    }
  }

  // Helper methods for common alert types
  const showSuccess = (message: string, title?: string) => {
    showAlert({
      type: 'success',
      title: title || t('common.success'),
      message
    })
  }

  const showError = (message: string, title?: string) => {
    showAlert({
      type: 'error',
      title: title || t('common.error'),
      message
    })
  }

  const showWarning = (message: string, title?: string) => {
    showAlert({
      type: 'warning',
      title: title || t('common.warning'),
      message
    })
  }

  const showInfo = (message: string, title?: string) => {
    showAlert({
      type: 'info',
      title: title || t('common.info'),
      message
    })
  }

  const confirmDelete = (itemName?: string): Promise<boolean> => {
    const message = itemName
      ? t('common.confirm_delete_item', { item: itemName })
      : t('common.confirm_delete')

    return showConfirm({
      title: t('common.confirm'),
      message,
      confirmText: t('common.delete'),
      cancelText: t('common.cancel')
    })
  }

  return {
    // State
    alertState: readonly(alertState),
    confirmState: readonly(confirmState),

    // Alert methods
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Confirm methods
    showConfirm,
    hideConfirm,
    handleConfirmResult,
    confirmDelete
  }
}