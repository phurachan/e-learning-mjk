<template>
  <!-- Backdrop for confirm/modal alerts -->
  <div
    v-if="visible && (type === 'confirm' || position === 'center')"
    class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    @click.self="handleBackdropClick"
  >
    <!-- Modal Alert -->
    <div :class="modalClasses" @click.stop>
      <!-- Alert Icon (only for non-confirm types) -->
      <div v-if="alertIcon && type !== 'confirm'" class="flex-shrink-0">
        <BaseIcon :name="alertIcon" :class="iconClasses" size="lg" />
      </div>

      <!-- Alert Content -->
      <div class="flex-1">
        <!-- Title for confirm type (inline with icon) -->
        <h3 v-if="title && type === 'confirm'" class="font-bold text-lg mb-2 flex items-center gap-2">
          <BaseIcon v-if="alertIcon" :name="alertIcon" :class="iconClasses" size="lg" />
          <span v-html="title"></span>
        </h3>
        
        <!-- Title for other types -->
        <h3 v-else-if="title" class="font-bold text-lg mb-2" v-html="title"></h3>
        
        <!-- Message -->
        <p class="text-sm" v-html="message"></p>
      </div>

      <!-- Actions for confirm type -->
      <div v-if="type === 'confirm'" class="flex gap-2 mt-4 justify-end">
        <BaseButton
          v-if="showCancel"
          :label="cancelText"
          variant="ghost"
          size="sm"
          @click="handleCancel"
        />
        <BaseButton
          :label="confirmText"
          :variant="confirmVariant"
          size="sm"
          @click="handleConfirm"
        />
      </div>

      <!-- Dismiss button -->
      <button
        v-if="dismissible && type !== 'confirm'"
        class="btn btn-ghost btn-sm btn-circle absolute top-2 right-2"
        @click="handleDismiss"
      >
        <BaseIcon name="x-mark" size="sm" />
      </button>
    </div>
  </div>

  <!-- Inline/Positioned Alert -->
  <div
    v-else-if="visible"
    :class="alertClasses"
    @mouseenter="pauseAutoClose"
    @mouseleave="resumeAutoClose"
  >
    <!-- Alert Icon -->
    <BaseIcon
      v-if="alertIcon"
      :name="alertIcon"
      :class="iconClasses"
      size="md"
    />

    <!-- Alert Content -->
    <div class="flex-1">
      <!-- Title -->
      <div v-if="title" class="font-bold mb-1" v-html="title">
      </div>
      
      <!-- Message -->
      <div class="text-sm" v-html="message"></div>
    </div>

    <!-- Dismiss Button -->
    <button
      v-if="dismissible"
      class="btn btn-ghost btn-sm btn-circle"
      @click="handleDismiss"
    >
      <BaseIcon name="x-mark" size="sm" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { BaseAlertProps } from '~/composables/component_models/form'

interface Props extends BaseAlertProps {}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  visible: true,
  dismissible: true,
  duration: 5000,
  position: 'top',
  confirmText: 'ตกลง',
  cancelText: 'ยกเลิก',
  showCancel: true
})

const $emit = defineEmits<{
  'update:visible': [visible: boolean]
  confirm: []
  cancel: []
  dismiss: []
  close: []
}>()

// Auto dismiss timer
let autoCloseTimer: NodeJS.Timeout | null = null

// Default icons for each type
const defaultIcons = {
  success: 'check-circle',
  error: 'x-circle',
  warning: 'exclamation-triangle',
  info: 'information-circle',
  confirm: 'question-mark-circle'
}

// Alert icon
const alertIcon = computed(() => {
  return props.icon || defaultIcons[props.type]
})

// Icon classes based on type
const iconClasses = computed(() => {
  const typeClasses = {
    success: 'text-success-content',
    error: 'text-error-content',
    warning: 'text-warning-content',
    info: 'text-info-content',
    confirm: 'text-primary'
  }
  return typeClasses[props.type]
})

// Alert classes for inline alerts
const alertClasses = computed(() => {
  const classes = ['alert', 'shadow-lg']
  
  // Type-specific classes
  const typeClasses = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
    confirm: 'alert-info'
  }
  classes.push(typeClasses[props.type])
  
  // Position classes
  if (props.position === 'top') {
    classes.push('fixed', 'top-4', 'left-1/2', 'transform', '-translate-x-1/2', 'z-50', 'w-auto', 'max-w-md')
  } else if (props.position === 'bottom') {
    classes.push('fixed', 'bottom-4', 'left-1/2', 'transform', '-translate-x-1/2', 'z-50', 'w-auto', 'max-w-md')
  }
  
  return classes.join(' ')
})

// Modal classes for confirm/center alerts
const modalClasses = computed(() => {
  const classes = ['bg-base-100', 'rounded-lg', 'shadow-2xl', 'p-6', 'max-w-md', 'w-full', 'relative']
  
  return classes.join(' ')
})

// Confirm button variant based on alert type
const confirmVariant = computed(() => {
  const variantMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    confirm: 'primary'
  }
  return variantMap[props.type]
})

// Event handlers
const handleConfirm = () => {
  $emit('confirm')
  handleClose()
}

const handleCancel = () => {
  $emit('cancel')
  handleClose()
}

const handleDismiss = () => {
  $emit('dismiss')
  handleClose()
}

const handleBackdropClick = () => {
  if (props.type === 'confirm') {
    handleCancel()
  } else {
    handleDismiss()
  }
}

const handleClose = () => {
  $emit('update:visible', false)
  $emit('close')
  clearAutoCloseTimer()
}

// Auto close functionality
const setupAutoClose = () => {
  if (props.duration > 0 && props.type !== 'confirm') {
    autoCloseTimer = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
}

// Pause auto close on mouse enter
const pauseAutoClose = () => {
  if (autoCloseTimer && props.type !== 'confirm') {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
}

// Resume auto close on mouse leave
const resumeAutoClose = () => {
  if (props.duration > 0 && props.type !== 'confirm' && props.visible) {
    setupAutoClose()
  }
}

const clearAutoCloseTimer = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
}

// Keyboard handling for confirm dialogs
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.visible || props.type !== 'confirm') return
  
  if (event.key === 'Escape') {
    handleCancel()
  } else if (event.key === 'Enter') {
    handleConfirm()
  }
}

onMounted(() => {
  setupAutoClose()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearAutoCloseTimer()
  document.removeEventListener('keydown', handleKeydown)
})

// Watch for visibility changes to setup auto close
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    setupAutoClose()
  } else {
    clearAutoCloseTimer()
  }
})
</script>