# State Management with Pinia

คู่มือสำหรับการจัดการ State ด้วย Pinia ในโปรเจค E-Learning MJK

## Table of Contents
- [โครงสร้าง Store](#โครงสร้าง-store)
- [Store Patterns](#store-patterns)
- [Type Definitions](#type-definitions)
- [HTTP Client Integration](#http-client-integration)
- [Best Practices](#best-practices)

---

## โครงสร้าง Store

```
stores/
├── studentAuth.ts        # Student authentication
├── studentCourses.ts     # Student courses
├── quiz.ts              # Quiz management
└── quizAttempt.ts       # Quiz attempts

composables/
├── store_models/        # Type definitions
│   ├── base.ts
│   ├── studentAuth.ts
│   ├── studentCourses.ts
│   └── quiz.ts
├── utilities/
│   ├── useHttpClient.ts # HTTP client
│   └── useToast.ts      # Toast notifications
└── constants/
    └── api.ts           # API endpoints
```

---

## Store Patterns

### 1. Basic Store Structure

```typescript
import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type { YourFeatureState, YourRequest, YourResponse } from '~/composables/store_models/yourFeature'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useYourFeatureStore = defineStore('yourFeature', {
  // State
  state: (): YourFeatureState => ({
    ...initState,
    items: [],
    currentItem: null
  }),

  // Getters
  getters: {
    allItems: (state) => state.items,
    itemCount: (state) => state.items.length,
    hasItems: (state) => state.items.length > 0
  },

  // Actions
  actions: {
    async fetchItems(requestData: BaseRequestData<void>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get<YourResponse[]>(
          API_ENDPOINTS.YOUR_FEATURE.LIST
        )

        this.$patch(successState(response))
        this.items = response.data

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    }
  }
})
```

### 2. Authentication Store Example

```typescript
// stores/studentAuth.ts
import { defineStore } from 'pinia'
import { API_ENDPOINTS } from '~/composables/constants/api'
import type { BaseRequestData } from '~/composables/store_models/base'
import { initState, loadingState, successState, errorState } from '~/composables/store_models/base'
import type {
  StudentAuthState,
  StudentLoginRequest,
  StudentLoginResponse
} from '~/composables/store_models/studentAuth'
import { useHttpClient } from '~/composables/utilities/useHttpClient'
import { BaseResponseError } from '~/composables/utility_models/http'

export const useStudentAuthStore = defineStore('studentAuth', {
  state: (): StudentAuthState => ({
    ...initState,
    student: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    currentStudent: (state) => state.student,
    studentId: (state) => state.student?.studentId ?? null,
    studentFullname: (state) => state.student?.fullname ?? '',
    isLoggedIn: (state) => state.isAuthenticated && !!state.student
  },

  actions: {
    // Login
    async login(requestData: BaseRequestData<StudentLoginRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient({ useAuth: false })
        const response = await httpClient.post<StudentLoginResponse>(
          API_ENDPOINTS.STUDENTS.LOGIN,
          requestData.body
        )

        this.$patch(successState(response))

        // Store token and student data
        this.token = response.data.token
        this.student = response.data.student
        this.isAuthenticated = true

        // Store in cookie
        const tokenCookie = useCookie('token', {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
          sameSite: 'lax'
        })
        tokenCookie.value = response.data.token

        // Store in localStorage
        if (process.client) {
          localStorage.setItem('student_info', JSON.stringify(response.data.student))
        }

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    // Logout
    async logout() {
      try {
        // Clear cookie
        const tokenCookie = useCookie('token')
        tokenCookie.value = null

        // Clear localStorage
        if (process.client) {
          localStorage.removeItem('student_info')
        }

        // Reset state
        this.token = null
        this.student = null
        this.isAuthenticated = false
        this.$patch(initState)

        // Redirect
        await navigateTo('/student/login')
      } catch (error: any) {
        console.error('Logout error:', error)
      }
    },

    // Restore session
    restoreSession() {
      const tokenCookie = useCookie('token')

      if (tokenCookie.value) {
        this.token = tokenCookie.value
        this.isAuthenticated = true

        if (process.client) {
          const studentInfo = localStorage.getItem('student_info')
          if (studentInfo) {
            try {
              this.student = JSON.parse(studentInfo)
            } catch (error) {
              console.error('Failed to parse student info:', error)
            }
          }
        }
      }
    }
  }
})
```

### 3. CRUD Store Example

```typescript
// stores/courses.ts
export const useCoursesStore = defineStore('courses', {
  state: (): CoursesState => ({
    ...initState,
    courses: [],
    currentCourse: null,
    filters: {
      search: '',
      semester: null,
      page: 1,
      limit: 10
    }
  }),

  getters: {
    allCourses: (state) => state.courses,
    filteredCourses: (state) => {
      let filtered = state.courses
      if (state.filters.search) {
        filtered = filtered.filter(c =>
          c.name.includes(state.filters.search)
        )
      }
      if (state.filters.semester) {
        filtered = filtered.filter(c =>
          c.semester === state.filters.semester
        )
      }
      return filtered
    }
  },

  actions: {
    // GET all
    async fetchCourses(requestData: BaseRequestData<void>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get<Course[]>(
          API_ENDPOINTS.COURSES.LIST,
          { params: this.filters }
        )

        this.$patch(successState(response))
        this.courses = response.data

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    // GET by ID
    async fetchCourse(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.get<Course>(
          API_ENDPOINTS.COURSES.GET(requestData.body.id)
        )

        this.$patch(successState(response))
        this.currentCourse = response.data

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    // POST create
    async createCourse(requestData: BaseRequestData<CreateCourseRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.post<Course>(
          API_ENDPOINTS.COURSES.CREATE,
          requestData.body
        )

        this.$patch(successState(response))
        this.courses.push(response.data)

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    // PUT update
    async updateCourse(requestData: BaseRequestData<UpdateCourseRequest>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.put<Course>(
          API_ENDPOINTS.COURSES.UPDATE(requestData.body.id),
          requestData.body
        )

        this.$patch(successState(response))

        // Update in array
        const index = this.courses.findIndex(c => c.id === requestData.body.id)
        if (index !== -1) {
          this.courses[index] = response.data
        }

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    // DELETE
    async deleteCourse(requestData: BaseRequestData<{ id: string }>) {
      try {
        this.$patch(loadingState(requestData))

        const httpClient = useHttpClient()
        const response = await httpClient.delete(
          API_ENDPOINTS.COURSES.DELETE(requestData.body.id)
        )

        this.$patch(successState(response))

        // Remove from array
        this.courses = this.courses.filter(c => c.id !== requestData.body.id)

        return response
      } catch (error: any) {
        this.$patch(errorState({ ...(error || {}) }))
        throw new BaseResponseError(error?.data || error)
      } finally {
        this.isLoading = false
      }
    },

    // Update filters
    setFilters(filters: Partial<typeof this.filters>) {
      this.filters = { ...this.filters, ...filters }
    },

    // Reset filters
    resetFilters() {
      this.filters = {
        search: '',
        semester: null,
        page: 1,
        limit: 10
      }
    }
  }
})
```

---

## Type Definitions

### 1. Base Types

```typescript
// composables/store_models/base.ts
export interface BaseState {
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  errorMessage: string | null
  successMessage: string | null
}

export interface BaseRequestData<T = any> {
  body: T
  params?: Record<string, any>
  headers?: Record<string, string>
}

export const initState: BaseState = {
  isLoading: false,
  isError: false,
  isSuccess: false,
  errorMessage: null,
  successMessage: null
}

export const loadingState = (requestData?: any): Partial<BaseState> => ({
  isLoading: true,
  isError: false,
  isSuccess: false,
  errorMessage: null
})

export const successState = (response?: any): Partial<BaseState> => ({
  isLoading: false,
  isError: false,
  isSuccess: true,
  successMessage: response?.message || null
})

export const errorState = (error?: any): Partial<BaseState> => ({
  isLoading: false,
  isError: true,
  isSuccess: false,
  errorMessage: error?.message || 'An error occurred'
})
```

### 2. Feature-Specific Types

```typescript
// composables/store_models/studentAuth.ts
import type { BaseState } from './base'

export interface Student {
  id: string
  studentId: string
  firstname: string
  lastname: string
  fullname: string
  avatar: string | null
  isChangePassword: boolean
  room: any
}

export interface StudentLoginRequest {
  studentId: string
  password: string
}

export interface StudentLoginResponse {
  token: string
  student: Student
}

export interface StudentAuthState extends BaseState {
  student: Student | null
  token: string | null
  isAuthenticated: boolean
}
```

---

## HTTP Client Integration

### 1. HTTP Client Setup

```typescript
// composables/utilities/useHttpClient.ts
import type { UseFetchOptions } from '#app'

interface HttpClientOptions {
  useAuth?: boolean
  baseURL?: string
}

export const useHttpClient = (options: HttpClientOptions = {}) => {
  const { useAuth = true, baseURL = '' } = options

  const config = useRuntimeConfig()
  const tokenCookie = useCookie('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (useAuth && tokenCookie.value) {
    headers['Authorization'] = `Bearer ${tokenCookie.value}`
  }

  const fetchOptions: UseFetchOptions<any> = {
    baseURL: baseURL || config.public.apiBase || '',
    headers,
    onResponseError({ response }) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        const authStore = useStudentAuthStore()
        authStore.logout()
      }
    }
  }

  return {
    async get<T>(url: string, opts?: UseFetchOptions<T>) {
      return await $fetch<T>(url, { ...fetchOptions, ...opts, method: 'GET' })
    },

    async post<T>(url: string, body?: any, opts?: UseFetchOptions<T>) {
      return await $fetch<T>(url, { ...fetchOptions, ...opts, method: 'POST', body })
    },

    async put<T>(url: string, body?: any, opts?: UseFetchOptions<T>) {
      return await $fetch<T>(url, { ...fetchOptions, ...opts, method: 'PUT', body })
    },

    async delete<T>(url: string, opts?: UseFetchOptions<T>) {
      return await $fetch<T>(url, { ...fetchOptions, ...opts, method: 'DELETE' })
    }
  }
}
```

### 2. API Endpoints

```typescript
// composables/constants/api.ts
export const API_ENDPOINTS = {
  STUDENTS: {
    LOGIN: '/api/students/auth/login',
    LOGOUT: '/api/students/auth/logout',
    CHANGE_PASSWORD: '/api/students/auth/change-password',
    DASHBOARD: '/api/students/dashboard',
    PROFILE: '/api/students/profile'
  },

  COURSES: {
    LIST: '/api/students/courses',
    GET: (id: string) => `/api/students/courses/${id}`,
    CREATE: '/api/students/courses',
    UPDATE: (id: string) => `/api/students/courses/${id}`,
    DELETE: (id: string) => `/api/students/courses/${id}`
  },

  QUIZZES: {
    LIST: '/api/quizzes',
    GET: (id: string) => `/api/quizzes/${id}`,
    SUBMIT: (id: string) => `/api/quizzes/${id}/submit`
  },

  QUIZ_ATTEMPTS: {
    MY_ATTEMPTS: '/api/quiz-attempts/my-attempts',
    GET: (id: string) => `/api/quiz-attempts/${id}`
  }
}
```

---

## Best Practices

### 1. Store Organization

```typescript
// ✅ GOOD: Separate concerns
const authStore = useStudentAuthStore()     // Authentication
const coursesStore = useCoursesStore()      // Courses data
const uiStore = useUIStore()                // UI state (modals, etc.)

// ❌ BAD: Everything in one store
const mainStore = useMainStore()  // Too generic
```

### 2. State Updates

```typescript
// ✅ GOOD: Use actions for state changes
await store.fetchCourses({ body: {} })

// ❌ BAD: Direct state mutation
store.courses = newCourses  // Don't do this
```

### 3. Error Handling

```typescript
// ✅ GOOD: Handle errors in components
try {
  await store.fetchCourses({ body: {} })
} catch (error: any) {
  const toast = useToast()
  toast.error(
    BaseResponseError.getMessageTh(error, 'ไม่สามารถโหลดข้อมูลได้'),
    'เกิดข้อผิดพลาด'
  )
}

// ❌ BAD: Silent failure
await store.fetchCourses({ body: {} })  // No error handling
```

### 4. Loading States

```typescript
// ✅ GOOD: Use computed for reactive loading state
const isLoading = computed(() => store.isLoading)

<div v-if="isLoading">Loading...</div>

// ✅ GOOD: Multiple loading states
const isFetchingCourses = computed(() => coursesStore.isLoading)
const isFetchingQuizzes = computed(() => quizzesStore.isLoading)
```

### 5. Getters Usage

```typescript
// ✅ GOOD: Computed getters
getters: {
  activeCourses: (state) => state.courses.filter(c => c.isActive),
  courseCount: (state) => state.courses.length
}

// Use in component
const activeCourses = computed(() => store.activeCourses)

// ❌ BAD: Filtering in component
const activeCourses = computed(() =>
  store.courses.filter(c => c.isActive)  // Should be in getter
)
```

### 6. Component Usage

```vue
<script setup lang="ts">
// Import store
const coursesStore = useCoursesStore()

// Use getters with computed
const courses = computed(() => coursesStore.allCourses)
const isLoading = computed(() => coursesStore.isLoading)

// Call actions
const fetchCourses = async () => {
  try {
    await coursesStore.fetchCourses({ body: {} })
  } catch (error: any) {
    const toast = useToast()
    toast.error('ไม่สามารถโหลดข้อมูลได้')
  }
}

// Fetch on mount
onMounted(() => {
  fetchCourses()
})
</script>
```

### 7. Persistence

```typescript
// ✅ GOOD: Use cookies for auth tokens
const tokenCookie = useCookie('token', {
  maxAge: 60 * 60 * 24 * 7,  // 7 days
  path: '/',
  sameSite: 'lax'
})

// ✅ GOOD: Use localStorage for user data
if (process.client) {
  localStorage.setItem('user_data', JSON.stringify(user))
}

// ❌ BAD: Storing sensitive data in localStorage
localStorage.setItem('password', password)  // Don't do this!
```

### 8. TypeScript

```typescript
// ✅ GOOD: Strong typing
interface Course {
  id: string
  name: string
  teacher: { name: string }
}

const courses = ref<Course[]>([])

// ✅ GOOD: Type request/response
async createCourse(data: CreateCourseRequest): Promise<Course> {
  // ...
}
```

---

## Testing Store Actions

```typescript
// Example: Testing in component
const testStore = async () => {
  const store = useCoursesStore()

  console.log('Initial state:', {
    courses: store.courses,
    isLoading: store.isLoading
  })

  try {
    await store.fetchCourses({ body: {} })
    console.log('Success! Courses:', store.courses)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

---

## Related Documentation
- [API Patterns](./API_PATTERNS.md)
- [UI Patterns](./UI_PATTERNS.md)
- [Architecture](./ARCHITECTURE.md)
