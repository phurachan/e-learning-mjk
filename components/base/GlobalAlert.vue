<template>
  <!-- Global Alert -->
  <BaseAlert
    v-if="alertState.isVisible && alertState.options"
    v-model:visible="alertVisible"
    :type="alertState.options.type"
    :title="alertState.options.title"
    :message="alertState.options.message"
    :position="alertState.options.position"
    :duration="alertState.options.duration"
    :html="alertState.options.html"
    @close="handleAlertClose"
  />

  <!-- Global Confirm -->
  <BaseAlert
    v-if="confirmState.isVisible && confirmState.options"
    v-model:visible="confirmVisible"
    type="confirm"
    :title="confirmState.options.title"
    :message="confirmState.options.message"
    :position="confirmState.options.position"
    :confirm-text="confirmState.options.confirmText"
    :cancel-text="confirmState.options.cancelText"
    @confirm="handleConfirmResult(true)"
    @cancel="handleConfirmResult(false)"
    @close="handleConfirmClose"
  />
</template>

<script setup lang="ts">
const { alertState, confirmState, hideAlert, hideConfirm, handleConfirmResult } = useAlert()

// Local reactive variables for v-model
const alertVisible = computed({
  get: () => alertState.value.isVisible,
  set: (value: boolean) => {
    if (!value) {
      hideAlert()
    }
  }
})

const confirmVisible = computed({
  get: () => confirmState.value.isVisible,
  set: (value: boolean) => {
    if (!value) {
      hideConfirm()
    }
  }
})

const handleAlertClose = () => {
  hideAlert()
}

const handleConfirmClose = () => {
  hideConfirm()
}
</script>