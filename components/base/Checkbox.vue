<template>
  <div class="form-control">
    <label :for="inputId" class="cursor-pointer label justify-start gap-3">
      <input
        :id="inputId"
        :name="name"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :indeterminate="indeterminate"
        :class="checkboxClasses"
        novalidate
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @change="$emit('change', $event)"
      />
      
      <span class="label-text" v-if="label">
        {{ label }}
        <span v-if="required" class="text-error ml-1">*</span>
      </span>
    </label>
    
    <!-- Helper text -->
    <label class="label" v-if="hint || error">
      <span class="label-text-alt" :class="{ 'text-error': error, 'text-base-content/70': !error }">
        {{ error || hint }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useId, ref, watch } from 'vue'
import type { BaseCheckboxProps } from '~/composables/component_models/form'

interface Props extends BaseCheckboxProps {}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  indeterminate: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  blur: [event: Event]
  focus: [event: Event]
  change: [event: Event]
}>()

const inputId = props.id || useId()
const checkboxRef = ref<HTMLInputElement>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}

// Handle indeterminate state
watch(() => props.indeterminate, (newVal) => {
  if (checkboxRef.value) {
    checkboxRef.value.indeterminate = newVal
  }
}, { immediate: true })

const checkboxClasses = computed(() => {
  const classes = ['checkbox']
  
  // Size classes
  const sizeClasses = {
    xs: 'checkbox-xs',
    sm: 'checkbox-sm',
    md: '', // default size
    lg: 'checkbox-lg'
  }
  if (sizeClasses[props.size]) {
    classes.push(sizeClasses[props.size])
  }
  
  // Variant classes
  const variantClasses = {
    default: '',
    primary: 'checkbox-primary',
    secondary: 'checkbox-secondary',
    accent: 'checkbox-accent',
    info: 'checkbox-info',
    success: 'checkbox-success',
    warning: 'checkbox-warning',
    error: 'checkbox-error'
  }
  if (variantClasses[props.variant]) {
    classes.push(variantClasses[props.variant])
  }
  
  // Error state
  if (props.error && props.variant === 'default') {
    classes.push('checkbox-error')
  }
  
  return classes.join(' ')
})
</script>