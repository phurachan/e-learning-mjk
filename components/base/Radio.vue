<template>
  <div class="form-control">
    <label :for="inputId" class="cursor-pointer label justify-start gap-3">
      <input
        :id="inputId"
        :name="name"
        type="radio"
        :value="value"
        :checked="modelValue === value"
        :disabled="disabled"
        :class="radioClasses"
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
import { computed, useId } from 'vue'
import type { BaseRadioProps } from '~/composables/component_models/form'

interface Props extends BaseRadioProps {}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean]
  blur: [event: Event]
  focus: [event: Event]
  change: [event: Event]
}>()

const inputId = props.id || useId()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    emit('update:modelValue', props.value)
  }
}

const radioClasses = computed(() => {
  const classes = ['radio']
  
  // Size classes
  const sizeClasses = {
    xs: 'radio-xs',
    sm: 'radio-sm',
    md: '', // default size
    lg: 'radio-lg'
  }
  if (sizeClasses[props.size]) {
    classes.push(sizeClasses[props.size])
  }
  
  // Variant classes
  const variantClasses = {
    default: '',
    primary: 'radio-primary',
    secondary: 'radio-secondary',
    accent: 'radio-accent',
    info: 'radio-info',
    success: 'radio-success',
    warning: 'radio-warning',
    error: 'radio-error'
  }
  if (variantClasses[props.variant]) {
    classes.push(variantClasses[props.variant])
  }
  
  // Error state
  if (props.error && props.variant === 'default') {
    classes.push('radio-error')
  }
  
  return classes.join(' ')
})
</script>