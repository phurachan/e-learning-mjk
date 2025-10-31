<template>
  <button
    :id="inputId"
    :type="type"
    :disabled="disabled || isLoading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
    
    <!-- Success icon -->
    <BaseIcon
      v-else-if="showSuccess"
      name="check-circle"
      :size="iconSize"
      class="text-success"
    />
    
    <!-- Icon (left) -->
    <BaseIcon 
      v-else-if="iconLeft" 
      :name="iconLeft" 
      :size="iconSize" 
    />
    
    <!-- Button text/content -->
    <span v-if="$slots.default || displayText">
      <slot>{{ displayText }}</slot>
    </span>
    
    <!-- Icon (right) -->
    <BaseIcon 
      v-if="iconRight && !isLoading && !showSuccess" 
      :name="iconRight" 
      :size="iconSize" 
    />
  </button>
</template>

<script setup lang="ts">
import { computed, useId, ref, watch, onUnmounted } from 'vue'
import type { BaseButtonProps } from '~/composables/component_models/form'

interface Props extends BaseButtonProps {}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  size: 'md',
  variant: 'default',
  block: false,
  loading: false,
  disabled: false,
  outline: false,
  ghost: false,
  glass: false,
  square: false,
  circle: false,
  wide: false,
  active: false,
  submitLoading: false,
  loadingText: 'กำลังดำเนินการ...',
  successText: 'สำเร็จ!',
  successDuration: 2000
})

const $emit = defineEmits<{
  click: [event: MouseEvent]
  'update:submitLoading': [loading: boolean]
}>()

const inputId = props.id || useId()

// Internal state for submit loading
const isSubmitLoading = ref(false)
const showSuccess = ref(false)
const successTimer = ref<NodeJS.Timeout | null>(null)

// Computed loading state
const isLoading = computed(() => props.loading || isSubmitLoading.value)

// Display text based on state
const displayText = computed(() => {
  if (showSuccess.value && props.successText) {
    return props.successText
  }
  if (isSubmitLoading.value && props.loadingText) {
    return props.loadingText
  }
  return props.label
})

// Handle click event
const handleClick = async (event: MouseEvent) => {
  if (props.disabled || isLoading.value) return
  
  // Start submit loading for submit buttons
  if (props.type === 'submit') {
    // isSubmitLoading.value = true
    $emit('update:submitLoading', true)
  }
  
  $emit('click', event)
}

// Watch for submitLoading prop changes
watch(() => props.submitLoading, (newVal) => {
  if (newVal === false && isSubmitLoading.value) {
    // Show success state
    isSubmitLoading.value = false
    showSuccess.value = true
    
    // Clear success state after duration
    if (successTimer.value) {
      clearTimeout(successTimer.value)
    }
    
    successTimer.value = setTimeout(() => {
      showSuccess.value = false
      $emit('update:submitLoading', false)
    }, props.successDuration)
  } else {
    isSubmitLoading.value = newVal
  }
})

// Cleanup timer on unmount
const cleanupTimer = () => {
  if (successTimer.value) {
    clearTimeout(successTimer.value)
    successTimer.value = null
  }
}

onUnmounted(cleanupTimer)

// Button classes computation
const buttonClasses = computed(() => {
  const classes = ['btn']

  // Size classes
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '', // default size
    lg: 'btn-lg'
  }
  if (sizeClasses[props.size]) {
    classes.push(sizeClasses[props.size])
  }

  // Variant classes
  if (props.outline) {
    const outlineVariants = {
      default: 'btn-outline',
      primary: 'btn-outline btn-primary',
      secondary: 'btn-outline btn-secondary',
      accent: 'btn-outline btn-accent',
      info: 'btn-outline btn-info',
      success: 'btn-outline btn-success',
      warning: 'btn-outline btn-warning',
      error: 'btn-outline btn-error',
      ghost: 'btn-outline btn-ghost',
      link: 'btn-outline btn-link'
    }
    classes.push(outlineVariants[props.variant] || outlineVariants.default)
  } else {
    const variantClasses = {
      default: '',
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      accent: 'btn-accent',
      info: 'btn-info',
      success: 'btn-success',
      warning: 'btn-warning',
      error: 'btn-error',
      ghost: 'btn-ghost',
      link: 'btn-link'
    }
    if (variantClasses[props.variant]) {
      classes.push(variantClasses[props.variant])
    }
  }

  // Modifier classes
  if (props.block) classes.push('btn-block')
  if (props.glass) classes.push('glass')
  if (props.square) classes.push('btn-square')
  if (props.circle) classes.push('btn-circle')
  if (props.wide) classes.push('btn-wide')
  if (props.active) classes.push('btn-active')
  if (props.ghost && !props.outline) classes.push('btn-ghost')
  if (props.disabled) classes.push('btn-disabled')

  return classes.join(' ')
})

// Icon size based on button size
const iconSize = computed(() => {
  const iconSizeMap = {
    xs: 'xs',
    sm: 'sm',
    md: 'sm',
    lg: 'md'
  }
  return iconSizeMap[props.size] as 'xs' | 'sm' | 'md' | 'lg'
})
</script>