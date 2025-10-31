import { ref } from 'vue'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'confirm'
  variant?: 'primary' | 'error' | 'warning' | 'success'
}

interface ConfirmDialog extends ConfirmDialogOptions {
  id: string
  visible: boolean
  resolve?: (result: boolean) => void
}

const confirmDialogs = ref<ConfirmDialog[]>([])

export const useConfirm = () => {
  let confirmIdCounter = 0

  const showConfirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = `confirm-${++confirmIdCounter}`
      const dialog: ConfirmDialog = {
        id,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'ตกลง',
        cancelText: options.cancelText || 'ยกเลิก',
        type: 'confirm',
        variant: options.variant || 'primary',
        visible: true,
        resolve
      }

      confirmDialogs.value.push(dialog)
    })
  }

  const handleConfirm = (id: string) => {
    const dialogIndex = confirmDialogs.value.findIndex(d => d.id === id)
    if (dialogIndex > -1) {
      const dialog = confirmDialogs.value[dialogIndex]
      if (dialog.resolve) {
        dialog.resolve(true)
      }
      confirmDialogs.value.splice(dialogIndex, 1)
    }
  }

  const handleCancel = (id: string) => {
    const dialogIndex = confirmDialogs.value.findIndex(d => d.id === id)
    if (dialogIndex > -1) {
      const dialog = confirmDialogs.value[dialogIndex]
      if (dialog.resolve) {
        dialog.resolve(false)
      }
      confirmDialogs.value.splice(dialogIndex, 1)
    }
  }

  const hideDialog = (id: string) => {
    const dialog = confirmDialogs.value.find(d => d.id === id)
    if (dialog) {
      dialog.visible = false
      // Remove from array after animation
      setTimeout(() => {
        const index = confirmDialogs.value.findIndex(d => d.id === id)
        if (index > -1) {
          confirmDialogs.value.splice(index, 1)
        }
      }, 300)
    }
  }

  const clearAll = () => {
    // Reject all pending confirmations
    confirmDialogs.value.forEach(dialog => {
      if (dialog.resolve) {
        dialog.resolve(false)
      }
    })
    confirmDialogs.value = []
  }

  return {
    confirmDialogs,
    showConfirm,
    handleConfirm,
    handleCancel,
    hideDialog,
    clearAll
  }
}