// Get API Base URL from environment variables
export const getApiBaseUrl = (): string => {
  const runtimeConfig = useRuntimeConfig()
  
  // Check if external API URL is configured
  const externalApiUrl = runtimeConfig.public.apiBaseUrl?.toString() || 
                        process.env.API_BASE_URL || 
                        process.env.NUXT_PUBLIC_API_BASE_URL
  
  if (externalApiUrl) {
    // Use external API server
    return externalApiUrl
  }
  
  // Fallback to SSR API (same domain)
  if (typeof window === 'undefined') {
    // Server-side - use relative path for SSR
    return '/api'
  } else {
    // Client-side - use current domain for SSR
    const protocol = window.location.protocol
    const host = window.location.host
    return `${protocol}//${host}/api`
  }
}

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification'
  },

  // User Management
  USERS: {
    LIST: '/users',
    SHOW: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    CHANGE_PASSWORD: (id: string) => `/users/${id}/change-password`,
    UPLOAD_AVATAR: (id: string) => `/users/${id}/avatar`
  },

  // Roles & Permissions
  ROLES: {
    LIST: '/roles',
    SHOW: (id: string) => `/roles/${id}`,
    CREATE: '/roles',
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`
  },

  PERMISSIONS: {
    LIST: '/permissions',
    SHOW: (id: string) => `/permissions/${id}`,
    CREATE: '/permissions',
    UPDATE: (id: string) => `/permissions/${id}`,
    DELETE: (id: string) => `/permissions/${id}`,
    MODULES: '/permissions/modules'
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ANALYTICS: '/dashboard/analytics',
    ACTIVITIES: '/dashboard/activities'
  },

  // File Management
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id: string) => `/files/${id}/download`,
    DELETE: (id: string) => `/files/${id}`
  },

  // Settings
  SETTINGS: {
    GENERAL: '/settings/general',
    SECURITY: '/settings/security',
    NOTIFICATIONS: '/settings/notifications',
    UPDATE: '/settings'
  },

  // E-Learning: Rooms
  ROOMS: {
    LIST: '/rooms',
    SHOW: (id: string) => `/rooms/${id}`,
    CREATE: '/rooms',
    UPDATE: (id: string) => `/rooms/${id}`,
    DELETE: (id: string) => `/rooms/${id}`
  },

  // E-Learning: Students
  STUDENTS: {
    LIST: '/students',
    SHOW: (id: string) => `/students/${id}`,
    CREATE: '/students',
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
    IMPORT: '/students/import',
    LOGIN: '/students/auth/login',
    CHANGE_PASSWORD: '/students/auth/change-password',
    DASHBOARD: '/students/dashboard'
  },

  // E-Learning: Courses
  COURSES: {
    LIST: '/courses',
    SHOW: (id: string) => `/courses/${id}`,
    CREATE: '/courses',
    UPDATE: (id: string) => `/courses/${id}`,
    DELETE: (id: string) => `/courses/${id}`
  },

  // E-Learning: Lessons
  LESSONS: {
    LIST: '/lessons',
    SHOW: (id: string) => `/lessons/${id}`,
    CREATE: '/lessons',
    UPDATE: (id: string) => `/lessons/${id}`,
    DELETE: (id: string) => `/lessons/${id}`,
    PUBLISH: (id: string) => `/lessons/${id}/publish`
  },

  // E-Learning: Quizzes
  QUIZZES: {
    LIST: '/quizzes',
    SHOW: (id: string) => `/quizzes/${id}`,
    CREATE: '/quizzes',
    UPDATE: (id: string) => `/quizzes/${id}`,
    DELETE: (id: string) => `/quizzes/${id}`,
    QUESTIONS: (id: string) => `/quizzes/${id}/questions`
  },

  // E-Learning: Quiz Attempts
  QUIZ_ATTEMPTS: {
    LIST: '/quiz-attempts',
    SHOW: (id: string) => `/quiz-attempts/${id}`,
    START: '/quiz-attempts/start',
    SUBMIT: (id: string) => `/quiz-attempts/${id}/submit`,
    GRADE: (id: string) => `/quiz-attempts/${id}/grade`,
    MY_ATTEMPTS: '/quiz-attempts/my-attempts'
  },

  // E-Learning: Reports
  REPORTS: {
    STUDENT: (studentId: string) => `/reports/student/${studentId}`,
    COURSE: (courseId: string) => `/reports/course/${courseId}`,
    QUIZ: (quizId: string) => `/reports/quiz/${quizId}`,
    CLASS: (roomId: string) => `/reports/class/${roomId}`
  }
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

// Request Timeouts (in milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 10000,    // 10 seconds
  UPLOAD: 60000,     // 1 minute
  DOWNLOAD: 30000,   // 30 seconds
  AUTH: 15000        // 15 seconds
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100
} as const