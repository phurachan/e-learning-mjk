<template>
  <!-- Confirmation Dialogs -->
  <div v-for="dialog in confirmDialogs" :key="dialog.id">
    <BaseAlert
      :visible="dialog.visible"
      :type="dialog.type"
      :title="dialog.title"
      :message="dialog.message"
      :confirmText="dialog.confirmText"
      :cancelText="dialog.cancelText"
      position="center"
      :dismissible="false"
      :duration="0"
      @confirm="handleConfirm(dialog.id)"
      @cancel="handleCancel(dialog.id)"
      @update:visible="(visible) => !visible && handleCancel(dialog.id)"
    />
  </div>
</template>

<script setup lang="ts">
const { confirmDialogs, handleConfirm, handleCancel } = useConfirm()
</script>