<template>
  <div>
    <!-- This will automatically redirect to login or dashboard based on auth state -->
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Only redirect if we're actually on the root page, not during refresh
onMounted(() => {
  // Only redirect if we're actually on the root path
  if (window.location.pathname === '/') {
    if (authStore.isAuthenticated) {
      navigateTo('/admin')
    } else {
      navigateTo('/login')
    }
  } else {
    console.log('INDEX PAGE: Not on root path, skipping redirect')
  }
})
</script>