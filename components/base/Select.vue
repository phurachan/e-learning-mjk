<template>
  <div class="form-control w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error ml-1">*</span>
      </span>
    </label>

    <!-- Select Element -->
    <select
      :id="inputId"
      :class="selectClasses"
      :value="modelValue"
      :disabled="disabled"
      novalidate
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
    >
      <option v-if="!hidePlaceholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Helper text -->
    <label v-if="hint || error" class="label">
      <span class="label-text-alt" :class="{ 'text-error': error, 'text-base-content/60': !error }">
        {{ error || hint }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, onMounted } from 'vue'
import type { BaseSelectProps, SelectOption } from '~/composables/component_models/form'

interface Props extends BaseSelectProps {}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  placeholder: 'กรุณาเลือก',
  disabled: false,
  required: false,
  options: () => [],
  hidePlaceholder: false,
  autoSelectFirst: false
})

const $emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null, option: SelectOption | null]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = props.id || useId()

// Select classes computation
const selectClasses = computed(() => {
  const classes = ['select', 'select-bordered', 'w-full']
  
  // Size classes
  const sizeClasses = {
    xs: 'select-xs',
    sm: 'select-sm',
    md: '', // default size
    lg: 'select-lg'
  }
  if (sizeClasses[props.size]) {
    classes.push(sizeClasses[props.size])
  }
  
  // Variant classes
  const variantClasses = {
    default: '',
    primary: 'select-primary',
    secondary: 'select-secondary',
    accent: 'select-accent',
    info: 'select-info',
    success: 'select-success',
    warning: 'select-warning',
    error: 'select-error'
  }
  if (variantClasses[props.variant]) {
    classes.push(variantClasses[props.variant])
  }
  
  // Error state
  if (props.error) {
    classes.push('select-error')
  }
  
  // Disabled state
  if (props.disabled) {
    classes.push('select-disabled')
  }
  
  return classes.join(' ')
})

// Handle change event
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value || null
  
  // Find selected option
  const selectedOption = props.options.find(option => 
    String(option.value) === String(value)
  ) || null
  
  $emit('update:modelValue', value)
  $emit('change', value, selectedOption)
}

// Handle blur
const handleBlur = (event: FocusEvent) => {
  $emit('blur', event)
}

// Handle focus
const handleFocus = (event: FocusEvent) => {
  $emit('focus', event)
}

// Auto select first option if enabled and no value is set
onMounted(() => {
  if (props.autoSelectFirst && !props.modelValue && props.options.length > 0) {
    const firstOption = props.options[0]
    if (firstOption && !firstOption.disabled) {
      $emit('update:modelValue', firstOption.value)
      $emit('change', firstOption.value, firstOption)
    }
  }
})
</script>