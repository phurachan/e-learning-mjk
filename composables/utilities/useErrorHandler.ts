export interface APIErrorResponse {
  statusCode: number
  statusMessage: string
  message?: string
  data?: {
    errors?: Record<string, string[]>
    messages?: {
      th?: string
      en?: string
    }
    [key: string]: any
  }
}

export const useErrorHandler = () => {
  const { t } = useI18n()
  const { showAlert } = useAlert()

  const getErrorMessage = (error: any): string => {
    // Check if it's a Nuxt error with statusMessage
    if (error?.statusMessage) {
      // Try to get translation for the statusMessage key
      const translationKey = `errors.${error.statusMessage}`
      const translatedMessage = t(translationKey)

      // If translation exists (not the same as key), return it
      if (translatedMessage !== translationKey) {
        return translatedMessage
      }

      // If no translation, try to get from error data messages
      if (error.data?.messages) {
        const { locale } = useI18n()
        const currentLocale = locale.value as 'th' | 'en'
        const message = error.data.messages[currentLocale]
        if (message) return message
      }

      // Fallback to statusMessage
      return error.statusMessage
    }

    // Check if it's a validation error with field details
    if (error?.data?.errors) {
      const errors = error.data.errors
      const errorMessages: string[] = []

      Object.keys(errors).forEach(field => {
        const fieldErrors = errors[field]
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach(errorKey => {
            // Try to translate validation message
            const validationKey = `validation.${errorKey}`
            const translatedValidation = t(validationKey)

            if (translatedValidation !== validationKey) {
              errorMessages.push(translatedValidation)
            } else {
              // Try field name translation
              const fieldKey = `fields.${field}`
              const translatedField = t(fieldKey)
              const fieldName = translatedField !== fieldKey ? translatedField : field
              errorMessages.push(`${fieldName}: ${errorKey}`)
            }
          })
        }
      })

      return errorMessages.join(', ')
    }

    // Check if it's a standard message
    if (error?.message) {
      return error.message
    }

    // Fallback for unknown errors
    return t('errors.INTERNAL_SERVER_ERROR')
  }

  const getSuccessMessage = (messageKey?: string): string => {
    if (!messageKey) {
      return t('success.SAVE_SUCCESS')
    }

    const translationKey = `success.${messageKey}`
    const translatedMessage = t(translationKey)

    return translatedMessage !== translationKey ? translatedMessage : messageKey
  }

  const handleAPIError = (error: any, customMessage?: string) => {
    console.error('API Error:', error)

    const errorMessage = customMessage || getErrorMessage(error)

    showAlert({
      type: 'error',
      title: t('common.error') || 'Error',
      message: errorMessage,
      position: 'top'
    })
  }

  const handleAPISuccess = (messageKey?: string, customMessage?: string) => {
    const message = customMessage || getSuccessMessage(messageKey)

    showAlert({
      type: 'success',
      title: t('common.success') || 'Success',
      message: message,
      position: 'top'
    })
  }

  const handleValidationErrors = (errors: Record<string, string[]>) => {
    const errorMessages: string[] = []

    Object.keys(errors).forEach(field => {
      const fieldErrors = errors[field]
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach(errorKey => {
          const validationKey = `validation.${errorKey}`
          const translatedValidation = t(validationKey)

          if (translatedValidation !== validationKey) {
            errorMessages.push(translatedValidation)
          } else {
            const fieldKey = `fields.${field}`
            const translatedField = t(fieldKey)
            const fieldName = translatedField !== fieldKey ? translatedField : field
            errorMessages.push(`${fieldName}: ${errorKey}`)
          }
        })
      }
    })

    showAlert({
      type: 'error',
      title: t('errors.VALIDATION_FAILED'),
      message: errorMessages.join('<br>'),
      position: 'top'
    })
  }

  return {
    getErrorMessage,
    getSuccessMessage,
    handleAPIError,
    handleAPISuccess,
    handleValidationErrors
  }
}