# DEVELOPER Docs

## Project Overview
This is a Nuxt 4.1.0 admin panel project using TailwindCSS 3.x and DaisyUI 5.1.6, inspired by AdminLTE design.

## Tech Stack & Setup Issues
- **Framework**: Nuxt 4.1.0 (Vue 3, SSR enabled)
- **Styling**: TailwindCSS 3.4.17 + DaisyUI 5.1.6 + @nuxtjs/tailwindcss 6.12.4
- **Icons**: @heroicons/vue 2.2.0
- **Date Picker**: @vuepic/vue-datepicker 11.0.2 (Vue 3 Datepicker library)
- **State Management**: Pinia 3.0.3 + @pinia/nuxt 0.11.2 + @pinia-plugin-persistedstate/nuxt 1.2.1
- **Language**: TypeScript 5.9.2
- **Package Manager**: Yarn (npm failed with native binding errors)
- **Node Version**: 22.17.0 (Nuxt 4 requires Node 22+, not 18.18.0)

## Demo Credentials:
- **Admin:** admin@moonoi.com / admin123

## 🚀 Getting Started

### Prerequisites
```bash
# Required versions
Node.js >= 22.17.0
Yarn package manager
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd web_admin_base

# Install dependencies
nvm use 22.17
yarn install

# Start development server
yarn dev
```

### Environment Setup
Create `.env` file:
```env
NUXT_SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
```

## 📁 Project Structure

### Key Directories
```
├── components/
│   ├── base/           # Reusable base components
│   └── user-management/ # Feature-specific components
├── layouts/            # Nuxt layouts
├── pages/             # Application pages
├── stores/            # Pinia stores
├── composables/       # Vue composables
├── assets/            # Static assets
└── server/            # Nuxt server API
```

### Base Components Architecture
The project follows a **Base Components** pattern for consistency:

- **BaseButton** - Standardized buttons with loading states
- **BaseInput** - Form inputs with validation
- **BaseSelect** - Dropdown selects with advanced features
- **BaseTable** - Data tables with sorting/pagination
- **BaseModal** - Modal dialogs
- **BaseAvatar** - User avatars with fallbacks
- **BasePageHeader** - Page headers with breadcrumbs
- **BasePagination** - Table pagination

## 🎨 Styling Guidelines

### DaisyUI + TailwindCSS
- Use **DaisyUI components** as primary UI elements
- Follow **DaisyUI theme system** for consistent colors
- Use **TailwindCSS utilities** for custom styling
- Current theme: `corporate` (can be changed in layout)

### Component Styling Patterns
```vue
<!-- Good: Use DaisyUI classes -->
<button class="btn btn-primary">Click me</button>

<!-- Good: Combine with Tailwind utilities -->
<div class="card bg-base-100 shadow-xl">
  <div class="card-body">...</div>
</div>

<!-- Avoid: Custom CSS when DaisyUI exists -->
<button style="background: blue;">Click me</button>
```

### Color System
- `base-100` - Primary background
- `base-200` - Secondary background  
- `base-content` - Primary text
- `primary` - Brand color
- `secondary` - Secondary brand color

## 🏗️ Development Patterns

### State Management with Pinia
```typescript
// stores/example.ts
export const useExampleStore = defineStore('example', () => {
  const items = ref([])
  const loading = ref(false)
  
  const fetchItems = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/items')
      items.value = data
    } finally {
      loading.value = false
    }
  }
  
  return { items, loading, fetchItems }
})
```

### Component Composition
```vue
<!-- Use composition API with TypeScript -->
<script setup lang="ts">
interface Props {
  title: string
  items?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
})

const emits = defineEmits<{
  select: [item: string]
}>()
</script>
```

### API Integration
```typescript
// Use $fetch for API calls
const data = await $fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: { key: 'value' }
})
```

## 🧩 Component Usage Examples

### BaseTable
```vue
<BaseTable
  :data="users"
  :columns="columns"
  :loading="loading"
  striped
  @edit="handleEdit"
  @delete="handleDelete"
>
  <template #status="{ row }">
    <div class="badge" :class="row.isActive ? 'badge-success' : 'badge-error'">
      {{ row.isActive ? 'Active' : 'Inactive' }}
    </div>
  </template>
</BaseTable>
```

### BasePageHeader
```vue
<BasePageHeader
  title="User Management"
  code="USER-001"
  description="Manage system users and permissions"
  :breadcrumbs="breadcrumbs"
>
  <template #actions>
    <BaseButton @click="addUser" variant="primary" icon-left="plus">
      Add User
    </BaseButton>
  </template>
</BasePageHeader>
```

## 🔐 Authentication & Permissions

### Auth Store Usage
```typescript
const authStore = useAuthStore()

// Check authentication
if (!authStore.isAuthenticated) {
  return navigateTo('/login')
}

// Check permissions
if (!authStore.hasPermission('users.create')) {
  throw createError({ statusCode: 403 })
}
```

### Page Protection
```vue
<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth' // Requires authentication
})
</script>
```

## 🚨 Common Pitfalls & Solutions

### 1. Node Version Issues
```bash
# Error: Nuxt 4 requires Node 22+
nvm install 22.17.0
nvm use 22.17.0
```

### 2. Package Manager Issues
```bash
# Use Yarn, not npm (native binding issues)
yarn install # ✅ Good
npm install  # ❌ Avoid
```

### 3. DaisyUI Theme Issues
```html
<!-- Ensure data-theme is set on html element -->
<html data-theme="corporate">
```

### 4. TypeScript Strict Mode
- All components must have proper TypeScript interfaces
- Use `defineProps<Props>()` pattern
- Avoid `any` types when possible

### 5. Component Auto-import
- Components in `components/` are auto-imported
- Use PascalCase for component names
- Clear `.nuxt` cache if imports fail

## 📚 Key Learning Resources

### Nuxt 4 (Latest)
- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/composition-api-introduction.html)
- [TypeScript with Vue](https://vuejs.org/guide/typescript/overview.html)

### UI Framework
- [DaisyUI Components](https://daisyui.com/components/)
- [TailwindCSS Utilities](https://tailwindcss.com/docs/utility-first)
- [Hero Icons](https://heroicons.com/)

### State Management
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Pinia with Nuxt](https://pinia.vuejs.org/ssr/nuxt.html)

## 🛠️ Development Commands

```bash
# Development
yarn dev              # Start dev server
yarn build            # Build for production
yarn preview          # Preview production build
yarn lint             # Lint code (if configured)
yarn typecheck        # Type checking (if configured)

# Useful for debugging
rm -rf .nuxt          # Clear Nuxt cache
yarn dev --port 3001  # Run on different port
```

## 📋 Project Status: **STABLE**

This project has reached a stable state with:
- ✅ Core architecture established
- ✅ Base components system implemented  
- ✅ Authentication & permission system
- ✅ User management features
- ✅ Consistent UI/UX patterns
- ✅ TypeScript integration
- ✅ Clean code patterns

Ready for feature development and scaling!



ความหมาย folder composables
  - component_models คือ interface ที่ใช้กับ base component ต่างๆ เช่น Props
  - data_models คือ interface ที่ใช้สำหรับ data ที่ response กลับมาจาก api
  - store_models คือ interface ที่ใช้สำหรับ store state management เช่น state, interface ของ parameter
  - utility_models คือ interface ที่ใช้สำหรับ funtions useXXX เช่น interface ของ parameter, result functions