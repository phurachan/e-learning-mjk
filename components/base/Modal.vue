<template>
  <!-- Modal Backdrop -->
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    :class="backdropClasses"
    @click.self="handleBackdropClick"
  >
    <!-- Modal Content -->
    <div :class="modalClasses" @click.stop>
      <!-- Modal Header -->
      <div v-if="title || closeable" class="flex items-center justify-between p-6 border-b border-base-300">
        <h3 class="text-lg font-bold" v-if="title">{{ title }}</h3>
        <div v-else></div>
        
        <button
          v-if="closeable"
          class="btn btn-sm btn-circle btn-ghost"
          @click="handleClose"
        >
          <BaseIcon name="x-mark" size="sm" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6">
        <slot></slot>
      </div>

      <!-- Modal Actions (if slot provided) -->
      <div v-if="$slots.actions" class="px-6 py-4 border-t border-base-300">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import type { BaseModalProps } from '~/composables/component_models/form'

interface Props extends BaseModalProps {}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  size: 'md',
  closeable: true,
  backdrop: true,
  backdropClose: true
})

const $emit = defineEmits<{
  'update:visible': [visible: boolean]
  close: []
  open: []
}>()

// Backdrop classes
const backdropClasses = computed(() => {
  const classes = []
  
  if (props.backdrop) {
    classes.push('bg-black/50')
  }
  
  return classes.join(' ')
})

// Modal classes based on size
const modalClasses = computed(() => {
  const classes = ['bg-base-100', 'rounded-lg', 'shadow-2xl', 'max-h-[90vh]', 'overflow-y-auto', 'relative']
  
  // Size classes
  const sizeClasses = {
    xs: 'w-full max-w-xs',
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl'
  }
  
  classes.push(sizeClasses[props.size])
  
  return classes.join(' ')
})

// Event handlers
const handleClose = () => {
  $emit('update:visible', false)
  $emit('close')
}

const handleBackdropClick = () => {
  if (props.backdropClose) {
    handleClose()
  }
}

// Keyboard handling
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.visible) return
  
  if (event.key === 'Escape' && props.closeable) {
    handleClose()
  }
}

// Watch for visibility changes
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    $emit('open')
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  } else {
    // Restore body scroll when modal is closed
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Ensure body scroll is restored
  document.body.style.overflow = ''
})
</script>