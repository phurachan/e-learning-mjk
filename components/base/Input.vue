<template>
  <div class="form-control w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error ml-1">*</span>
      </span>
    </label>
    
    <!-- Input -->
    <input
      :id="inputId"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :minlength="minlength"
      :min="min"
      :max="max"
      :step="step"
      :class="inputClasses"
      novalidate
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @change="handleChange"
    />
    
    <!-- Helper text -->
    <label class="label" v-if="hint || error">
      <span class="label-text-alt" :class="{ 'text-error': error, 'text-base-content/70': !error }">
        {{ error || hint }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import type { BaseInputProps } from '~/composables/component_models/form'

interface Props extends BaseInputProps {}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  variant: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'update:error': [error: string | undefined]
  blur: [event: Event]
  focus: [event: Event]
  change: [event: Event]
  validate: [value: string | number]
}>()

const inputId = props.id || useId()

const inputClasses = computed(() => {
  const classes = ['input', 'w-full']
  
  // Size classes
  const sizeClasses = {
    xs: 'input-xs',
    sm: 'input-sm',
    md: '', // default size
    lg: 'input-lg'
  }
  if (sizeClasses[props.size]) {
    classes.push(sizeClasses[props.size])
  }
  
  // Variant classes
  const variantClasses = {
    default: 'input-bordered',
    bordered: 'input-bordered',
    ghost: 'input-ghost',
    primary: 'input-primary input-bordered',
    secondary: 'input-secondary input-bordered',
    accent: 'input-accent input-bordered',
    info: 'input-info input-bordered',
    success: 'input-success input-bordered',
    warning: 'input-warning input-bordered',
    error: 'input-error input-bordered'
  }
  classes.push(variantClasses[props.variant])
  
  // Error state
  if (props.error && props.variant === 'default') {
    classes.push('input-error')
  }
  
  // Disabled state
  if (props.disabled) {
    classes.push('input-disabled')
  }
  
  return classes.join(' ')
})

// Use validation composable
const { validateRequired, validateEmail, validateMinLength, validateMaxLength, validateNumber, validateMinValue, validateMaxValue } = useValidation()

// Validation function using composable
const validateValue = (value: string | number): string | undefined => {
  const strValue = String(value || '')
  
  // Required validation
  if (props.required) {
    const requiredError = validateRequired(strValue)
    if (requiredError) return requiredError
  }
  
  // Skip other validations if value is empty and not required
  if (!strValue) return undefined
  
  // Email validation
  if (props.type === 'email') {
    // For email, we validate format only if there's a value
    const emailError = validateEmail(strValue)
    // Return error only if it's not the "required" error (since we handled that above)
    if (emailError && emailError !== 'This field is required') {
      return emailError
    }
  }
  
  // Min length validation
  if (props.minlength) {
    const minLengthError = validateMinLength(strValue, props.minlength)
    if (minLengthError) return minLengthError
  }
  
  // Max length validation
  if (props.maxlength) {
    const maxLengthError = validateMaxLength(strValue, props.maxlength)
    if (maxLengthError) return maxLengthError
  }
  
  // Number validations
  if (props.type === 'number') {
    const numberError = validateNumber(strValue)
    if (numberError) return numberError
    
    const numValue = Number(strValue)
    if (!isNaN(numValue)) {
      if (props.min !== undefined) {
        const minValueError = validateMinValue(numValue, Number(props.min))
        if (minValueError) return minValueError
      }
      
      if (props.max !== undefined) {
        const maxValueError = validateMaxValue(numValue, Number(props.max))
        if (maxValueError) return maxValueError
      }
    }
  }
  
  return undefined
}

// Event handlers
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value)
}

const handleBlur = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // Validate on blur
  const errorMessage = validateValue(value)
  emit('update:error', errorMessage)
  emit('validate', value)
  emit('blur', event)
}

const handleFocus = (event: Event) => {
  emit('focus', event)
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // Validate on change
  const errorMessage = validateValue(value)
  emit('update:error', errorMessage)
  emit('validate', value)
  emit('change', event)
}
</script>