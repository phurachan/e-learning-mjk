<template>
  <div class="toast-container">
    <BaseAlert
      v-for="toast in toasts"
      :key="toast.id"
      v-model:visible="toast.visible"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :position="toast.position"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/utilities/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.toast-container :deep(.alert) {
  pointer-events: auto;
}
</style>