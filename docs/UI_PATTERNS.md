# UI Component Patterns

คู่มือสำหรับการพัฒนา Vue Components ในโปรเจค E-Learning MJK

## Table of Contents
- [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
- [Component Organization](#component-organization)
- [Composition API Patterns](#composition-api-patterns)
- [Styling Guidelines](#styling-guidelines)
- [Common UI Patterns](#common-ui-patterns)
- [Best Practices](#best-practices)

---

## โครงสร้างโปรเจค

```
components/
├── base/                  # Base/Shared components
│   ├── Button.vue
│   ├── Input.vue
│   └── Modal.vue
├── student/              # Student-specific components
│   ├── CourseCard.vue
│   ├── QuizListItem.vue
│   └── ResultListItem.vue
└── layout/               # Layout components
    ├── Header.vue
    ├── Sidebar.vue
    └── Footer.vue

pages/
├── index.vue             # Landing page
├── student/
│   ├── dashboard.vue
│   ├── courses/
│   │   ├── index.vue
│   │   └── [id].vue
│   └── quizzes/
│       └── index.vue

layouts/
├── default.vue           # Default layout
├── student.vue           # Student portal layout
└── admin.vue            # Admin layout
```

---

## Component Organization

### 1. Base Components
**ตำแหน่ง**: `components/base/`

สำหรับ components ที่ใช้ซ้ำทั่วทั้งโปรเจค เช่น:
- Button
- Input
- Select
- Modal
- Card

```vue
<!-- components/base/Button.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading loading-spinner loading-sm"></span>
    <component v-if="icon" :is="icon" class="w-5 h-5" />
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'error'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: any
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  props.loading && 'loading'
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
```

### 2. Feature Components
**ตำแหน่ง**: `components/student/`, `components/teacher/`, etc.

สำหรับ components เฉพาะ feature

```vue
<!-- components/student/CourseCard.vue -->
<template>
  <div
    class="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
    @click="navigateToCourse"
  >
    <!-- Gradient Header -->
    <div
      class="h-40 rounded-t-2xl relative overflow-hidden"
      :style="{ background: gradientBackground }"
    >
      <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      <div class="absolute bottom-4 left-4 right-4">
        <div class="badge badge-sm bg-white/90 text-primary border-0">
          {{ course.code }}
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body p-5">
      <h3 class="card-title text-lg line-clamp-2 min-h-[3.5rem]">
        {{ course.name }}
      </h3>

      <!-- Teacher -->
      <div class="flex items-center gap-2 text-sm text-base-content/70">
        <UserIcon class="w-4 h-4" />
        <span>{{ course.teacher?.name }}</span>
      </div>

      <!-- Progress Bar -->
      <div class="mt-4">
        <div class="flex justify-between text-xs mb-1">
          <span class="text-base-content/70">ความคืบหน้า</span>
          <span class="font-semibold text-primary">{{ progress }}%</span>
        </div>
        <progress
          class="progress progress-primary w-full"
          :value="progress"
          max="100"
        />
      </div>

      <!-- Action Button -->
      <div class="card-actions justify-end mt-4">
        <button class="btn btn-primary btn-sm w-full">
          <AcademicCapIcon class="w-4 h-4" />
          เข้าเรียน
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AcademicCapIcon, UserIcon } from '@heroicons/vue/24/outline'

interface Props {
  course: {
    id: string
    name: string
    code: string
    teacher?: { name: string }
  }
  progress?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0
})

const gradientBackground = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  ]
  const hash = props.course.code.split('').reduce((acc, char) =>
    acc + char.charCodeAt(0), 0
  )
  return gradients[hash % gradients.length]
})

const navigateToCourse = () => {
  navigateTo(`/student/courses/${props.course.id}`)
}
</script>
```

### 3. Layout Components
**ตำแหน่ง**: `layouts/`

```vue
<!-- layouts/student.vue -->
<template>
  <div class="min-h-screen bg-base-200">
    <!-- Header -->
    <header class="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div class="navbar-start">
        <NuxtLink to="/student/dashboard" class="btn btn-ghost text-xl">
          E-Learning MJK
        </NuxtLink>
      </div>

      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li><NuxtLink to="/student/dashboard">Dashboard</NuxtLink></li>
          <li><NuxtLink to="/student/courses">วิชาเรียน</NuxtLink></li>
          <li><NuxtLink to="/student/quizzes">แบบทดสอบ</NuxtLink></li>
        </ul>
      </div>

      <div class="navbar-end">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full">
              <img :src="studentAvatar" />
            </div>
          </label>
          <ul class="menu dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>โปรไฟล์</a></li>
            <li><a @click="logout">ออกจากระบบ</a></li>
          </ul>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-100 text-base-content">
      <div>
        <p>Copyright © 2024 - E-Learning MJK</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const authStore = useStudentAuthStore()

const studentAvatar = computed(() =>
  authStore.student?.avatar || '/default-avatar.png'
)

const logout = async () => {
  await authStore.logout()
}
</script>
```

---

## Composition API Patterns

### 1. Props with TypeScript

```typescript
// Simple props
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Complex props
interface Course {
  id: string
  name: string
  teacher?: { name: string }
}

interface Props {
  course: Course
  progress?: number
  onComplete?: () => void
}

const props = defineProps<Props>()
```

### 2. Emits

```typescript
// Simple emits
const emit = defineEmits<{
  click: [id: string]
  update: [value: number]
}>()

emit('click', 'course-123')
emit('update', 42)

// With validation
const emit = defineEmits({
  click: (id: string) => typeof id === 'string',
  update: (value: number) => value >= 0
})
```

### 3. Computed Properties

```typescript
// Simple computed
const fullName = computed(() =>
  `${props.firstname} ${props.lastname}`
)

// Writable computed
const searchQuery = computed({
  get: () => store.query,
  set: (value) => store.setQuery(value)
})

// Computed with logic
const statusColor = computed(() => {
  if (props.score >= 80) return 'success'
  if (props.score >= 60) return 'warning'
  return 'error'
})
```

### 4. Reactive State

```typescript
// Use ref for primitives
const count = ref(0)
const message = ref('Hello')

// Use reactive for objects
const form = reactive({
  name: '',
  email: '',
  password: ''
})

// Use computed for derived state
const isValid = computed(() =>
  form.name && form.email && form.password
)
```

### 5. Lifecycle Hooks

```typescript
// onMounted
onMounted(async () => {
  await fetchData()
})

// onUnmounted
onUnmounted(() => {
  // Cleanup
  clearInterval(timer)
})

// watch
watch(() => route.params.id, (newId) => {
  fetchCourse(newId)
})

// watchEffect
watchEffect(() => {
  console.log(`Count is ${count.value}`)
})
```

---

## Styling Guidelines

### DaisyUI Components

```html
<!-- Buttons -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-sm">Small</button>

<!-- Cards -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>

<!-- Badges -->
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>

<!-- Loading -->
<span class="loading loading-spinner loading-lg"></span>
<div class="skeleton h-32 w-full"></div>

<!-- Modals -->
<dialog class="modal" ref="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Title</h3>
    <p class="py-4">Content</p>
    <div class="modal-action">
      <button class="btn">Close</button>
    </div>
  </div>
</dialog>
```

### TailwindCSS Utilities

```html
<!-- Layout -->
<div class="flex items-center justify-between gap-4">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<div class="space-y-4">

<!-- Spacing -->
<div class="p-4 m-2">         <!-- padding, margin -->
<div class="px-4 py-2">       <!-- horizontal, vertical -->
<div class="mt-4 mb-8">       <!-- top, bottom -->

<!-- Typography -->
<h1 class="text-3xl font-bold">
<p class="text-sm text-base-content/70">
<span class="line-clamp-2">   <!-- Truncate after 2 lines -->

<!-- Colors -->
<div class="bg-base-100 text-primary">
<div class="bg-primary text-primary-content">

<!-- Effects -->
<div class="shadow-lg hover:shadow-xl transition-all duration-300">
<div class="rounded-lg border border-base-300">

<!-- Responsive -->
<div class="hidden md:block">           <!-- Hide on mobile -->
<div class="w-full md:w-1/2 lg:w-1/3"> <!-- Responsive width -->
```

### Custom Styles

```vue
<style scoped>
/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--bc) / 0.2);
  border-radius: 4px;
}
</style>
```

---

## Common UI Patterns

### 1. Loading States

```vue
<template>
  <div>
    <!-- Skeleton loading -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="skeleton h-40 rounded-lg"></div>
    </div>

    <!-- Spinner loading -->
    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Your content -->
    </div>
  </div>
</template>
```

### 2. Empty States

```vue
<template>
  <div v-if="!items.length" class="card bg-base-100 shadow">
    <div class="card-body items-center text-center py-16">
      <IconComponent class="w-20 h-20 text-base-content/30 mb-4" />
      <h3 class="text-xl font-semibold text-base-content/70">
        ไม่มีข้อมูล
      </h3>
      <p class="text-sm text-base-content/50 mt-2">
        คำอธิบายเพิ่มเติม
      </p>
      <button class="btn btn-primary mt-4" @click="handleAction">
        เพิ่มข้อมูล
      </button>
    </div>
  </div>
</template>
```

### 3. Error States

```vue
<template>
  <div v-if="hasError" class="alert alert-error">
    <ExclamationTriangleIcon class="w-6 h-6" />
    <div>
      <h3 class="font-bold">เกิดข้อผิดพลาด</h3>
      <p class="text-sm">{{ errorMessage }}</p>
    </div>
    <button class="btn btn-sm" @click="retry">ลองอีกครั้ง</button>
  </div>
</template>
```

### 4. Form Patterns

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Text Input -->
    <div class="form-control">
      <label class="label">
        <span class="label-text">ชื่อ</span>
      </label>
      <input
        v-model="form.name"
        type="text"
        class="input input-bordered"
        :class="{ 'input-error': errors.name }"
        placeholder="กรอกชื่อ"
      />
      <label v-if="errors.name" class="label">
        <span class="label-text-alt text-error">{{ errors.name }}</span>
      </label>
    </div>

    <!-- Select -->
    <div class="form-control">
      <label class="label">
        <span class="label-text">ประเภท</span>
      </label>
      <select v-model="form.type" class="select select-bordered">
        <option value="">เลือกประเภท</option>
        <option value="a">ประเภท A</option>
        <option value="b">ประเภท B</option>
      </select>
    </div>

    <!-- Submit -->
    <div class="form-control mt-6">
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="loading loading-spinner"></span>
        {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
const form = reactive({
  name: '',
  type: ''
})

const errors = reactive({
  name: '',
  type: ''
})

const isSubmitting = ref(false)

const validate = () => {
  errors.name = form.name ? '' : 'กรุณากรอกชื่อ'
  errors.type = form.type ? '' : 'กรุณาเลือกประเภท'
  return !errors.name && !errors.type
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true
  try {
    await store.submit(form)
    const toast = useToast()
    toast.success('บันทึกสำเร็จ')
    navigateTo('/success')
  } catch (error) {
    const toast = useToast()
    toast.error('เกิดข้อผิดพลาด')
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

### 5. Modal Pattern

```vue
<template>
  <dialog ref="modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">{{ title }}</h3>

      <div class="py-4">
        <slot />
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="close">ยกเลิก</button>
        <button class="btn btn-primary" @click="confirm">ตกลง</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()

const emit = defineEmits<{
  confirm: []
  close: []
}>()

const modal = ref<HTMLDialogElement>()

const open = () => modal.value?.showModal()
const close = () => {
  modal.value?.close()
  emit('close')
}
const confirm = () => {
  emit('confirm')
  close()
}

defineExpose({ open, close })
</script>
```

---

## Best Practices

### 1. Component Size
- เก็บ component ไว้ขนาดเล็ก (< 300 บรรทัด)
- แยก logic ซับซ้อนเป็น composables
- แยก UI ส่วนย่อยเป็น sub-components

### 2. Props & Emits
- ใช้ TypeScript interfaces สำหรับ props
- ตั้งชื่อ emit events ชัดเจน (on-click, update-value)
- Validate props ที่สำคัญ

### 3. Performance
- ใช้ `v-show` สำหรับ toggle บ่อยๆ
- ใช้ `v-if` สำหรับ conditional render
- ใช้ `:key` กับ `v-for` เสมอ
- Lazy load components ขนาดใหญ่

### 4. Accessibility
- ใช้ semantic HTML
- เพิ่ม `alt` text ให้รูปภาพ
- รองรับ keyboard navigation
- ใช้ ARIA attributes เมื่อจำเป็น

### 5. Testing
- ตรวจสอบ TypeScript errors
- ทดสอบ responsive design
- ทดสอบ loading/error states
- ตรวจสอบ browser console

---

## Related Documentation
- [API Patterns](./API_PATTERNS.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Architecture](./ARCHITECTURE.md)
