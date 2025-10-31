// Validation composable for form validation
export const useValidation = () => {
  // Basic validation functions
  const validateRequired = (value: string | number, message?: string): string | undefined => {
    const strValue = String(value || '').trim()
    if (!strValue) {
      return message || 'This field is required'
    }
    return undefined
  }

  const validateEmail = (email: string, message?: string): string | undefined => {
    const emailStr = String(email || '').trim()
    
    // Check if required
    if (!emailStr) {
      return 'This field is required'
    }
    
    // Check email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(emailStr)) {
      return message || 'Please enter a valid email address'
    }
    
    return undefined
  }

  const validateMinLength = (value: string, minLength: number, message?: string): string | undefined => {
    const strValue = String(value || '')
    if (strValue.length < minLength) {
      return message || `Minimum ${minLength} characters required`
    }
    return undefined
  }

  const validateMaxLength = (value: string, maxLength: number, message?: string): string | undefined => {
    const strValue = String(value || '')
    if (strValue.length > maxLength) {
      return message || `Maximum ${maxLength} characters allowed`
    }
    return undefined
  }

  const validateNumber = (value: string | number, message?: string): string | undefined => {
    const strValue = String(value || '').trim()
    if (strValue && isNaN(Number(strValue))) {
      return message || 'Please enter a valid number'
    }
    return undefined
  }

  const validateMinValue = (value: string | number, minValue: number, message?: string): string | undefined => {
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue < minValue) {
      return message || `Minimum value is ${minValue}`
    }
    return undefined
  }

  const validateMaxValue = (value: string | number, maxValue: number, message?: string): string | undefined => {
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue > maxValue) {
      return message || `Maximum value is ${maxValue}`
    }
    return undefined
  }

  const validatePassword = (password: string, message?: string): string | undefined => {
    const passwordStr = String(password || '').trim()
    
    if (!passwordStr) {
      return 'This field is required'
    }
    
    return undefined
  }

  const validateConfirmPassword = (password: string, confirmPassword: string, message?: string): string | undefined => {
    if (password !== confirmPassword) {
      return message || 'Passwords do not match'
    }
    return undefined
  }

  const validatePhone = (phone: string, message?: string): string | undefined => {
    const phoneStr = String(phone || '').trim()
    
    if (!phoneStr) {
      return 'This field is required'
    }
    
    // Thai phone number pattern (simplified)
    const phonePattern = /^[0-9]{9,10}$/
    if (!phonePattern.test(phoneStr.replace(/[-\s]/g, ''))) {
      return message || 'Please enter a valid phone number'
    }
    
    return undefined
  }

  const validateUrl = (url: string, message?: string): string | undefined => {
    const urlStr = String(url || '').trim()
    
    if (!urlStr) {
      return 'This field is required'
    }
    
    try {
      new URL(urlStr)
      return undefined
    } catch {
      return message || 'Please enter a valid URL'
    }
  }

  // Combined validation function for multiple rules
  const validateField = (
    value: string | number,
    rules: Array<{
      type: 'required' | 'email' | 'minLength' | 'maxLength' | 'number' | 'minValue' | 'maxValue' | 'password' | 'phone' | 'url'
      value?: any
      message?: string
    }>
  ): string | undefined => {
    for (const rule of rules) {
      let error: string | undefined

      switch (rule.type) {
        case 'required':
          error = validateRequired(value, rule.message)
          break
        case 'email':
          error = validateEmail(String(value), rule.message)
          break
        case 'minLength':
          error = validateMinLength(String(value), rule.value, rule.message)
          break
        case 'maxLength':
          error = validateMaxLength(String(value), rule.value, rule.message)
          break
        case 'number':
          error = validateNumber(value, rule.message)
          break
        case 'minValue':
          error = validateMinValue(value, rule.value, rule.message)
          break
        case 'maxValue':
          error = validateMaxValue(value, rule.value, rule.message)
          break
        case 'password':
          error = validatePassword(String(value), rule.message)
          break
        case 'phone':
          error = validatePhone(String(value), rule.message)
          break
        case 'url':
          error = validateUrl(String(value), rule.message)
          break
      }

      if (error) {
        return error
      }
    }

    return undefined
  }

  return {
    validateRequired,
    validateEmail,
    validateMinLength,
    validateMaxLength,
    validateNumber,
    validateMinValue,
    validateMaxValue,
    validatePassword,
    validateConfirmPassword,
    validatePhone,
    validateUrl,
    validateField
  }
}