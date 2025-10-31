<template>
  <div class="form-control w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error ml-1">*</span>
      </span>
    </label>
    
    <!-- Textarea -->
    <textarea
      :id="inputId"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :cols="cols"
      :maxlength="maxlength"
      :minlength="minlength"
      :class="textareaClasses"
      novalidate
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      @change="$emit('change', $event)"
    />
    
    <!-- Helper text -->
    <label class="label" v-if="help || error">
      <span class="label-text-alt" :class="{ 'text-error': error, 'text-base-content/70': !error }">
        {{ error || help }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

interface Props {
  modelValue?: string | number
  label?: string
  name?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  error?: string
  help?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'bordered' | 'ghost' | 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
  rows?: number
  cols?: number
  maxlength?: number
  minlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'bordered',
  rows: 3,
  readonly: false
})

const emits = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]  
  change: [event: Event]
}>()

const inputId = useId()

const textareaClasses = computed(() => {
  const baseClasses = ['textarea', 'w-full']
  
  // Size classes
  const sizeClasses = {
    xs: 'textarea-xs',
    sm: 'textarea-sm', 
    md: '',
    lg: 'textarea-lg'
  }
  
  // Variant classes
  const variantClasses = {
    default: '',
    bordered: 'textarea-bordered',
    ghost: 'textarea-ghost',
    primary: 'textarea-primary',
    secondary: 'textarea-secondary',
    accent: 'textarea-accent',
    info: 'textarea-info',
    success: 'textarea-success',
    warning: 'textarea-warning',
    error: 'textarea-error'
  }
  
  if (sizeClasses[props.size]) {
    baseClasses.push(sizeClasses[props.size])
  }
  
  if (variantClasses[props.variant]) {
    baseClasses.push(variantClasses[props.variant])
  }
  
  if (props.error) {
    baseClasses.push('textarea-error')
  }
  
  if (props.disabled) {
    baseClasses.push('textarea-disabled')
  }
  
  return baseClasses
})
</script>