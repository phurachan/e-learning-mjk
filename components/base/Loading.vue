<template>
  <!-- Loading Overlay with Backdrop -->
  <div
    v-if="visible"
    class="fixed inset-0 z-[9999] flex items-center justify-center"
    :class="backdropClasses"
  >
    <!-- Loading Content -->
    <div class="flex flex-col items-center justify-center gap-4 bg-base-100 rounded-lg shadow-2xl p-8">
      <!-- Loading Spinner -->
      <span :class="spinnerClasses"></span>
      
      <!-- Loading Message -->
      <div v-if="message" class="text-base-content font-medium text-center max-w-xs">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BaseLoadingProps } from '~/composables/component_models/form'

interface Props extends BaseLoadingProps {}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  message: 'กำลังโหลด...',
  size: 'md',
  spinner: 'spinner',
  backdrop: true,
  backdropColor: 'bg-black/50'
})

// Backdrop classes
const backdropClasses = computed(() => {
  const classes = []
  
  if (props.backdrop) {
    classes.push(props.backdropColor)
  }
  
  return classes.join(' ')
})

// Spinner classes based on type and size
const spinnerClasses = computed(() => {
  const classes = ['loading']
  
  // Spinner type classes
  const typeClasses = {
    spinner: 'loading-spinner',
    dots: 'loading-dots',
    ring: 'loading-ring',
    ball: 'loading-ball',
    bars: 'loading-bars',
    infinity: 'loading-infinity'
  }
  classes.push(typeClasses[props.spinner])
  
  // Size classes
  const sizeClasses = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  }
  classes.push(sizeClasses[props.size])
  
  return classes.join(' ')
})
</script>