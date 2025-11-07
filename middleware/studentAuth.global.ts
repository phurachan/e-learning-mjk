import { useStudentAuthStore } from '~/stores/studentAuth'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run for student routes (except login page)
  if (!to.path.startsWith('/student/')) {
    return
  }

  // Skip authentication check for student login page
  if (to.path === '/student/login') {
    return
  }

  const studentAuthStore = useStudentAuthStore()

  // Restore session from cookie (works on both server and client)
  studentAuthStore.restoreSession()

  // Check if student is authenticated (has token)
  // Note: On server side, we may not have student object (from localStorage)
  // but if we have token, that's enough for authentication
  if (!studentAuthStore.isAuthenticated) {
    return navigateTo(`/student/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
