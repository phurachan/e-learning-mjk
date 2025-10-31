# Claude Code Project Knowledge

## Project Overview
This is a Nuxt 4.1.1 admin panel project using TailwindCSS 3.x and DaisyUI 5.1.6, inspired by AdminLTE design.

## Tech Stack & Setup Issues
- **Framework**: Nuxt 4.1.1 (Vue 3, SSR enabled)
- **Styling**: TailwindCSS 3.4.17 + DaisyUI 5.1.6 + @nuxtjs/tailwindcss 6.12.4
- **Icons**: @heroicons/vue 2.2.0
- **Date Picker**: @vuepic/vue-datepicker 11.0.2 (Vue 3 Datepicker library)
- **State Management**: Pinia 3.0.3 + @pinia/nuxt 0.11.2 + pinia-plugin-persistedstate 4.5.0
- **Language**: TypeScript 5.9.2
- **Package Manager**: npm (consistent with other projects)
- **Node Version**: 22.17.0 (Nuxt 4 requires Node 22+, not 18.18.0)

### Setup Issues Resolved
1. **Node.js Compatibility**: npm install failed with Nuxt 4 on Node 18.18.0 → Fixed with `nvm use 22.17`
2. **Package Manager**: npm had oxc-parser native binding issues → Switched to yarn
3. **TailwindCSS v4 Compatibility**: Originally used TailwindCSS 4.1.12 → Downgraded to 3.4.17
   - DaisyUI 5.1.6 incompatible with TailwindCSS v4
   - @nuxtjs/tailwindcss module doesn't support v4 
   - PostCSS plugin conflicts and semantic color issues
   - Switched from `@tailwindcss/vite` plugin to `@nuxtjs/tailwindcss` module
4. **CSS Module Resolution**: CSS import errors in nuxt.config.ts → @nuxtjs/tailwindcss handles it automatically
5. **SSR Window Issues**: window.innerWidth errors → Added `typeof window !== 'undefined'` checks
6. **Web Components Integration**: Cally calendar components needed Vue compiler config → Added `isCustomElement` for `calendar-*` tags (Note: Currently using @vuepic/vue-datepicker instead of Cally)
7. **Pinia Persistence**: `@pinia-plugin-persistedstate/nuxt` is deprecated → Migrated to `pinia-plugin-persistedstate` with manual plugin setup

### Modern Pinia Persistence Setup
Since `@pinia-plugin-persistedstate/nuxt` is deprecated, we use modern setup:

```typescript
// plugins/pinia.client.ts
import { createPersistedState } from 'pinia-plugin-persistedstate'

export default defineNuxtPlugin(nuxtApp => {
  const pinia = nuxtApp.$pinia as any
  pinia.use(createPersistedState({
    storage: localStorage
  }))
})
```

**Benefits:**
- ✅ No deprecated warnings
- ✅ Better TypeScript support
- ✅ Works with fresh installs
- ✅ Future-proof maintenance

## Directory Structure & Project Evolution

### Original Structure Issues
- Initially created `/app/app.vue` which broke Nuxt routing
- Fixed by moving to root `app.vue` and removing `/app/` folder

### Interface Organization (Final Structure)
- **Component Interfaces**: `/composables/component_models/`
  - `base.ts` - Base component interfaces (IconProps, BreadcrumbItem, ButtonProps, etc.)
  - `form.ts` - Form-related interfaces (FormField, ValidationRule, BaseInputProps, BaseDatePickerProps, BaseCheckboxProps, BaseRadioProps, etc.)
- **API Interfaces**: `/composables/models/`
  - `api.ts` - API response interfaces, pagination, CRUD operations
- **Utility Functions**: `/composables/utilities/`
  - `usePathMapping.ts` - Path mapping utilities for breadcrumb generation (moved from common/)

### Component Organization
- **Base Components**: `/components/base/`
  - All reusable base components go here
  - Named without "Base" prefix in filename (Icon.vue, Breadcrumbs.vue, Input.vue, etc.)
  - Auto-imported as `<BaseIcon />`, `<BaseBreadcrumbs />`, `<BaseInput />` etc.
  - **Important**: User emphasized using DaisyUI components, not hardcoded solutions
  
#### Component Categorization System (September 2025)
**All components are located in `/components/base/` but categorized logically by function:**

**Base Components (5 components):**
- **BaseIcon** - HeroIcons integration with variants (outline, solid, mini) and sizes
- **BaseButton** - Comprehensive button component with loading states, icons, and all DaisyUI variants  
- **BaseAlert** - Toast notifications and confirmation dialogs with position control
- **BaseAvatar** - User profile pictures with fallback text and sizes
- **BaseThemeToggle** - Light/dark theme switcher with multiple variants and smooth animations

**Form Components (7 components):**  
- **BaseInput** - Text, email, number, password inputs with DaisyUI styling
- **BaseTextarea** - Multi-line text input with auto-resize and validation
- **BaseDatePicker** - @vuepic/vue-datepicker with Thai localization and Buddhist Era support
- **BaseCheckbox** - Checkbox with indeterminate state support
- **BaseRadio** - Radio buttons with consistent styling  
- **BaseSelect** - Native HTML select element with DaisyUI styling for simple dropdowns
- **BaseAutocomplete** - Advanced search component with API integration, debounced search, and dual model binding

**Layout Components (4 components):**
- **BasePageHeader** - Page titles, breadcrumbs, and action buttons
- **BaseModal** - Dialogs with size variants and slot support
- **BaseLoading** - Loading overlays with spinner variants
- **BaseBreadcrumbs** - Auto-generation from URL path with pathMapping integration

**Data Components (3 components):**
- **BaseTable** - Simple data tables with sorting and styling
- **BaseDataTable** - Advanced tables with selection, nested rows, and server-side features
- **BasePagination** - Navigation for paginated data with page size control

**Important Notes:**
- All form components support variants (primary, success, warning, error) and sizes (xs, sm, md, lg)
- Total: 19 components (5+7+4+3)
- Component summary in showcase should reflect these exact numbers and categories
- **BaseAvatar** is in Base category but currently not displayed in showcase tabs as requested

## Layout & Admin Panel Development

### Admin Layout Evolution
- **Sidebar**: Uses DaisyUI Drawer + Menu components
- **Collapsible Functionality**: 
  - Desktop: Default open, collapses to mini sidebar showing only icons
  - Mobile: Default closed, opens as overlay
  - Toggle with hamburger bars3 icon in navbar
- **Tooltip Issues**: Collapsed sidebar tooltips were covered by content → Fixed with Vue 3 Teleport to document body
- **Responsive Design**: Mobile overlay vs desktop mini-collapse behavior

### Menu System
- Dynamic menuSections array with support for:
  - Sections with titles and icons
  - Menu items with paths, labels, icons
  - Active state detection with `activeWhen` patterns
  - Badge support with variants
  - Disabled state support

### Breadcrumb System Evolution
- **Original**: Manual breadcrumbs in navbar
- **Updated**: Moved to individual pages for flexibility
- **Final**: Auto-generation from URL path with pathMapping constant
- **Features**:
  - Auto-generation from current route
  - Manual items override via props
  - Route meta integration via `definePageMeta`
  - No icons (removed as requested)

## Component Development History

### BaseIcon Component
- **Purpose**: Standardized icon usage with @heroicons/vue
- **Variants**: outline (default), solid, mini
- **Sizes**: xs, sm, md (default), lg, xl, 2xl
- **Interface**: Uses IconProps from composables with explicit type import
- **User Rule**: Replace ALL SVG/emoji icons with BaseIcon throughout project

### BaseBreadcrumbs Component
- **Evolution**: From manual props → auto-generation → pathMapping integration
- **Auto-Generation Logic**:
  1. Check for manual items prop
  2. Check for route meta breadcrumb
  3. Auto-generate from URL using pathMapping constant
- **PathMapping Structure**: Nested object with labels and children
- **No Icons**: User requested removal of icon support

### Interface Cleanup
- **Problem**: Duplicate interfaces in components vs composables
- **Solution**: Centralized all interfaces in `/composables/` folders
- **Process**: Removed duplicates from components, used auto-imported versions
- **Examples**: BreadcrumbItem, IconProps moved to composables

## Development Workflow & User Preferences

### Base Component Creation Process
1. Create component in `/components/base/` using DaisyUI patterns
2. Use TypeScript interfaces from `/composables/component_models/`
3. Follow existing patterns and conventions
4. **Critical**: After user confirms component is complete, add documentation to `/pages/admin/components.vue`

### Page Creation Rules
- **Default Layout**: All new pages use `admin` layout unless user specifies otherwise
- **Breadcrumbs**: Use `<BaseBreadcrumbs />` for automatic generation
- **Component Documentation**: All base components must be documented in showcase page

### Code Standards & Preferences
- **TypeScript**: Use `<script setup lang="ts">` syntax with proper interfaces
- **DaisyUI First**: Always use DaisyUI components, avoid hardcoded solutions
- **Consistency**: Follow existing patterns for naming, structure, and styling
- **Auto-Import**: Use Nuxt's auto-import for composables interfaces
- **No Comments**: Don't add code comments unless explicitly requested

## Technical Decisions & Fixes

### TailwindCSS Version Decisions
- **Original Plan**: TailwindCSS v4.1.12 + `@tailwindcss/vite` plugin
- **Reality**: TailwindCSS v4 is too bleeding edge for production
- **Final Decision**: TailwindCSS v3.4.17 + `@nuxtjs/tailwindcss` module
- **Key Issues Resolved**:
  - DaisyUI semantic colors (`text-base-content`, `bg-primary-focus`) don't work in @apply directive with v4
  - PostCSS plugin conflicts between @tailwindcss/vite and @nuxtjs/tailwindcss
  - Color opacity syntax `/30` not supported in @apply → use `opacity-30` or direct colors

### Form Component Architecture
- **BaseInput**: Handles text, email, number, password, tel, url, search types
- **BaseDatePicker**: @vuepic/vue-datepicker with Thai localization, Buddhist Era, and type support (date, datetime-local, time)
- **BaseCheckbox/BaseRadio**: Consistent form controls with DaisyUI variants
- **BaseButton**: Full DaisyUI button features - loading states, icons, variants, modifiers (outline, ghost, wide, block, etc.)
- **BaseSelect**: Native HTML select with DaisyUI classes - removed searchable/clearable props to keep it simple
- **BaseAutocomplete**: Advanced component with dual model binding (v-model + v-model:display-value), debounced API search, flexible option structure
- **Interface Centralization**: All props interfaces in `/composables/component_models/form.ts`
- **Emit Patterns**: Use `defineEmits<{}>()` without variable assignment to avoid TS warnings

### SSR vs Client-Side Understanding
- **SSR + `<script setup>`**: Not the same thing
- **SSR**: Server-side rendering (Nuxt feature)
- **`<script setup>`**: Vue 3 Composition API syntax
- **Previous Pattern**: `export default { setup() {} }` also works with SSR

### Vue Template Issues Fixed
- **Double Curly Braces**: `{{ }}` in code examples interpreted as Vue expressions
- **Solution**: Use single `{ }` in mockup-code examples to show object syntax
- **Context**: Documentation code examples in `/pages/admin/components.vue`

### TypeScript Integration
- **Issue**: Vue compiler couldn't resolve imported types
- **Solution**: Added explicit `import type { IconProps } from '~/composables/component_models/base'`
- **Context**: TypeScript dependency was missing, added as devDependency

## Commands & Environment
- **Dev Server**: `nvm use 22.17 && npm run dev`
- **Install Dependencies**: `nvm use 22.17 && npm install`
- **Build**: `nvm use 22.17 && npm run build`

### Port Management Rules
- **User Port**: 3000 (user always runs on this port)
- **Claude Port**: 3001 (Claude should always use `PORT=3001 nvm use 22.17 && npm run dev`)
- **Background Tasks**: Only one npm run dev background task should run at a time
- **Task Management**: Always kill background tasks when testing/verification is complete
- **Port**: Usually 3000, but may use 3001 if 3000 is occupied

## BaseDatePicker Implementation Details

### Library and Dependencies
- **Package**: `@vuepic/vue-datepicker` v11.0.2
- **Additional**: `date-fns` v4.1.0 for locale support
- **Import**: `import VueDatePicker from '@vuepic/vue-datepicker'`

### Thai Localization Features
- **Locale**: Uses `locale="th"` for Thai language
- **Buddhist Era**: Custom year display using Vue slots
  - Header: `#year="{ value }"` → `{{ value + 543 }}`
  - Year dropdown: `#year-overlay-value="{ value }"` → `{{ value + 543 }}`
- **Date Format**: Custom formatter displays "19 กันยายน 2568"
- **Button Labels**: Thai text (ยกเลิก, เลือก, วันนี้)

### Type Support
- **date**: Date picker only
- **datetime-local**: Date + time picker
- **time**: Time picker only
- **Props Interface**: `BaseDatePickerProps` supports `modelValue?: string | Date | null`

### Key Implementation Decisions
1. **Slots over DOM Manipulation**: Used Vue slots for year display instead of MutationObserver
2. **Type Handling**: Custom `handleDateChange` function converts various input types to proper Date/string/null
3. **No Custom CSS**: Removed all custom styling to avoid conflicts, uses default Vue Datepicker styles
4. **Auto-apply**: Uses `auto-apply` prop for immediate date selection

### Known Issues
- Time picker value changes may not reflect properly in some cases
- Uses `any` type for `handleDateChange` parameter to handle Vue Datepicker's various return types

## Recent Component Development Decisions (Latest Session)

### BaseSelect Architecture Decision
- **Original Approach**: Custom dropdown with search, clear button, keyboard navigation
- **User Feedback**: "ใช้งานไม่ได้" and questioning why not using `<select>` and `<option>` tags
- **Final Decision**: Rewrote to use native HTML `<select>` element following DaisyUI patterns
- **Reasoning**: BaseAutocomplete already handles advanced features, BaseSelect should be simple and reliable
- **Result**: Simplified component that works immediately with native browser behavior

### Component Organization Lessons
- **Duplication Issue**: Initially had BaseButton in both Base Components and Form Components sections
- **Fix**: Moved BaseButton to Base Components section only, removed duplicate
- **Layout Fix**: Changed button examples from `space-x-2 space-y-2` to `flex flex-wrap gap-2` for consistent margins

### TypeScript Error Patterns
- **Array Access Issues**: `filteredOptions.value[highlightedIndex.value]` can return undefined
- **Solution**: Add proper null checks before passing to functions that expect defined values
- **Pattern**: Use `const selectedOption = array[index]; if (selectedOption) { ... }` instead of direct access

## Utility Functions

### Thai Formatting Utilities
- **useFormatDate** - Thai Buddhist Era date formatting with `dateToThai()` function
- **useFormatNumber** - Thai numeral conversion and number formatting with comma separators
- **Global Plugins** - `formatters.client.ts` provides `$formatDate` and `$formatNumber` globally
- **Usage**: Available in both `<template>` (via $formatDate/$formatNumber) and `<script>` (via useFormatDate/useFormatNumber)

## Component Selection Guidelines

### Form Components Usage
- **BaseInput** - Text, email, number, password inputs
- **BaseDatePicker** - Date, time, datetime selections with Thai localization
- **BaseCheckbox/BaseRadio** - Single/multiple choice selections
- **BaseButton** - Actions, form submissions, navigation
- **BaseSelect** - Simple dropdown selections (native HTML select)
- **BaseAutocomplete** - Search, API integration, advanced filtering

### Component Philosophy
- **Native vs Custom**: Use native HTML elements (BaseSelect) for simple cases, custom components (BaseAutocomplete) for advanced features
- **Performance**: BaseSelect is lighter and faster, BaseAutocomplete provides rich functionality
- **User Experience**: BaseSelect for familiar interactions, BaseAutocomplete for search-heavy workflows

## Key Learnings & User Requirements
1. **DaisyUI First**: User strongly prefers DaisyUI components over custom solutions
2. **Native HTML When Possible**: Use native elements (select, input) over custom dropdowns for simplicity
3. **Systematic Approach**: User wants proper organization and documentation
4. **Interface Centralization**: All interfaces in composables for consistency
5. **Component Documentation**: Must document usage in showcase page after completion
6. **Responsive Design**: Mobile and desktop behavior differences are important
7. **Auto-Generation**: User prefers smart defaults with manual override options
8. **Clean Code**: Avoid duplicates, use proper TypeScript, follow conventions
9. **Thai Localization**: Comprehensive Thai language support with Buddhist Era dates and Thai numerals

## Latest Base Components Development (Current Session)

### BaseDataTable Component
**Location**: `/components/base/DataTable.vue`
**Features**:
- Field-based column configuration with sortable columns
- Single/Multi selection with checkbox controls
- Expandable nested children with distinct styling
- Custom cell formatters and types (text, number, date, boolean)
- Locale-aware sorting with Thai language support
- Row click handling and selection management
- Responsive design with proper hover states

**Key Implementation Details**:
- Uses original data references for reactivity (not computed copies)
- Supports custom formatters that can return HTML
- Children rows have gradient background for distinction
- Sort functionality with 3-state cycle: asc → desc → null

### BasePagination Component  
**Location**: `/components/base/Pagination.vue`
**Features**:
- Smart page range calculation with configurable maxPages
- DaisyUI join styling for seamless button appearance
- First/Last/Prev/Next navigation with proper disabled states
- Responsive design with icon buttons

### BaseAlert Component
**Location**: `/components/base/Alert.vue`
**Features**:
- Multiple types: success, error, warning, info, confirm
- Auto-dismiss with hover pause/resume (default 5000ms)
- Modal confirmation dialogs with backdrop
- Position options: top, bottom, center
- HTML support in title and message content
- Keyboard support (ESC/Enter for confirm dialogs)
- Icon color optimization for better contrast

**Key Implementation**:
- Uses watcher for visibility to setup auto-close
- Pause/resume functionality on mouse hover
- Success/error icons use `-content` colors for better contrast
- Confirm type shows icon inline with title

### BaseLoading Component
**Location**: `/components/base/Loading.vue`  
**Features**:
- Global loading overlay with backdrop
- Multiple spinner types: spinner, dots, ring, ball, bars, infinity
- Configurable sizes and backdrop colors
- High z-index (9999) to ensure visibility

**Composable**: `useLoading.ts`
- Singleton pattern ensures only one loading at a time
- Global state management with readonly accessors
- Configuration options for spinner type and appearance

### BaseModal Component
**Location**: `/components/base/Modal.vue`
**Features**:
- Responsive sizing: xs, sm, md, lg, xl
- Backdrop control with configurable click-to-close
- Keyboard ESC support for closing
- Body scroll lock when modal is open
- Slot-based content with optional actions slot
- Teleport-based rendering for proper z-index

### BaseButton Submit Loading Enhancement
**Enhanced Features**:
- Automatic loading state on submit button clicks
- Success feedback with configurable duration
- Custom loading and success text
- Visual states: loading (spinner) → success (check icon) → normal
- Two-way binding with `v-model:submitLoading`

**Usage Pattern**:
```vue
<BaseButton 
  type="submit"
  v-model:submitLoading="isLoading"
  loadingText="กำลังบันทึก..."
  successText="บันทึกสำเร็จ!"
  @click="handleSubmit"
/>
```

## Complete CRUD Demo Implementation

### Demo Page (`/pages/admin/demo.vue`)
**Features**:
- JSONPlaceholder API integration for real REST operations
- Complete CRUD operations: Create, Read, Update, Delete
- Paginated data table with sorting
- Modal-based add/edit forms with validation
- Delete confirmation alerts
- Loading states for all async operations
- Success/error notifications

**Integration Pattern**:
- Global loading overlay during data fetching
- Button submit loading for form submissions
- Alert notifications for operation feedback
- Modal forms for data entry
- Confirmation dialogs for destructive actions

### API Integration Best Practices
1. **Loading States**: Always show loading during async operations
2. **Error Handling**: Graceful error messages with user-friendly alerts
3. **Success Feedback**: Immediate confirmation of successful operations
4. **Loading Hierarchy**: Global loading for page-level, button loading for actions
5. **Thai Messages**: All user-facing text in Thai language

## Navigation & Layout System

### Side Menu Configuration
**Location**: `/layouts/admin.vue` - `menuSections` array
**Current Structure**:
```javascript
[
  {
    title: "Dashboard",
    items: [{ path: "/admin", label: "Overview", icon: "home" }]
  },
  {
    title: "Examples", 
    items: [
      { path: "/admin/demo", label: "Demo", badge: { text: "New", variant: "success" }},
      { path: "/admin/components", label: "Components", badge: { text: "UI", variant: "info" }}
    ]
  }
]
```

**Key Features**:
- Responsive collapsible sidebar with tooltips
- Active state detection with `activeWhen` patterns  
- Badge system for feature status
- Mobile overlay vs desktop mini-collapse
- Section grouping with titles and icons

### Menu Development Rule
**IMPORTANT**: User explicitly requested **no "Coming Soon" menu items**
- Only create menu items for completed, functional features
- Remove placeholders immediately when requested
- Focus on working functionality over future plans

### Dashboard Page Enhancement
**Location**: `/pages/admin/index.vue`
- Stats cards showing project metrics
- Component showcase with status badges
- Quick start guide for new users
- System information display
- Links to key features (Demo, Components)

## Knowledge Base Management

### Important File Location Rules
**CRITICAL KNOWLEDGE**: When user says "บันทึกไว้เป็น knowledge" or similar:
- **MUST use existing file**: `/CLAUDE_KNOWLEDGE.md` 
- **DO NOT create new files** like `KNOWLEDGE.md`
- **Always append/edit** the existing CLAUDE_KNOWLEDGE.md file
- This file serves as Claude's persistent memory for the project

### Knowledge Documentation Standards
1. **User Preferences**: Document explicit user requirements and preferences
2. **Technical Decisions**: Record why certain approaches were chosen/rejected
3. **Component Patterns**: Document reusable patterns and conventions
4. **Bug Fixes**: Record issues encountered and their solutions
5. **Development Rules**: Capture workflow and coding standards established

## HTTP Client Architecture (Latest Development)

### New HTTP Client - useHttpClient.ts
**Purpose**: Single HTTP client using $fetch only to eliminate SSR/Client confusion
**Location**: `/composables/useHttpClient.ts`
**Interfaces**: `/composables/utility_models/http.ts`

### Key Features:
- **$fetch Only**: No useFetch to prevent developer confusion
- **Dynamic TypeScript**: Generic `<T>` support for all methods
- **Bearer Token Support**: Auto-injection from cookies + un-auth option
- **Custom Headers**: Set/remove/clear headers dynamically
- **Query Object**: Multi-level object to query string conversion
- **FormData Upload**: Auto-detect with proper Content-Type handling
- **Interceptors**: onRequest, onResponse, onError hooks
- **Error Handling**: Auto 401 redirect, token cleanup

### Usage Patterns:
```javascript
// Authenticated requests
const { get, post, put, delete: del } = useApi()

// Unauthenticated requests  
const { get, post, put, delete: del } = useApiUnauth()

// Examples
await get('/users', { _page: 1, _limit: 10 })    // Query params
await post('/users', userData)                    // JSON body
await put(`/users/${id}`, userData)              // Update
await del(`/users/${id}`)                        // Delete
await upload('/files', files, { category: 'docs' }) // File upload
```

### Interface Organization:
- **HTTP Interfaces**: `/composables/utility_models/http.ts`
- **Component Interfaces**: `/composables/component_models/`
- **API Interfaces**: `/composables/models/`

### Configuration:
- **Base URL**: From `runtimeConfig.public.apiBase` or fallback
- **Auth Token**: From `useCookie('token')`  
- **Headers**: Automatic Content-Type, Authorization management
- **Timeout**: Configurable (default 10s)

## RESTful API Implementation (Latest Development)

### Database & Models Architecture
**Purpose**: Replace JSONPlaceholder with real MongoDB-based API
**Database**: MongoDB Atlas
**Connection**: `/server/utils/server/utils/mongodb.ts` with connection caching for hot reloads

### Models Created:
- **User Model** (`/server/models/User.ts`):
  - Fields: name, email, role, department, position, phone, website, avatar, isActive
  - Validation: Email format, unique email, required fields
  - Indexes: email, isActive, role, text search on name/email
  - Soft delete support (isActive field)

- **Role Model** (`/server/models/Role.ts`):
  - Fields: name, description, permissions[], isActive
  - Relations: References Permission model
  
- **Permission Model** (`/server/models/Permission.ts`):
  - Fields: name, description, module, action, resource, isActive
  - Actions: create, read, update, delete, manage

### API Endpoints Structure:
```
/server/api/users/
├── index.get.ts      # GET /api/users - List with pagination/filtering
├── index.post.ts     # POST /api/users - Create user
├── [id].get.ts       # GET /api/users/:id - Get by ID
├── [id].put.ts       # PUT /api/users/:id - Update user
├── [id].delete.ts    # DELETE /api/users/:id - Soft delete
└── seed.post.ts      # POST /api/users/seed - Seed sample data
```

### API Features:
- **Server-side pagination**: page, limit parameters
- **Search & filtering**: name/email search, role/isActive filters
- **Error handling**: Validation errors, duplicate checks, 404s
- **Response structure**: `{ success: boolean, data: any, message?: string, pagination?: object }`
- **Thai sample data**: 10 users with Thai names and realistic data

### Environment Configuration:
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
NUXT_PUBLIC_API_BASE=http://localhost:3000/api
```

### Demo Page Integration:
- **Updated HTTP calls**: Uses new API endpoints instead of JSONPlaceholder
- **Real pagination**: Server-side pagination with actual count
- **Proper error handling**: Shows API error messages
- **Data refresh**: Refreshes list after CRUD operations
- **Response structure**: Handles `{ success, data, message }` format

## Current Project Status
- ✅ Complete base component library with 12+ components
- ✅ Full CRUD demo with real API integration  
- ✅ Responsive admin layout with navigation
- ✅ TypeScript interfaces and strong typing
- ✅ Loading states and error handling throughout
- ✅ Thai localization and Buddhist Era support
- ✅ DaisyUI styling consistency
- ✅ Mobile-responsive design
- ✅ Documentation and examples for all components
- ✅ Modern HTTP client with $fetch only approach
- ✅ Centralized interface organization in utility_models
- ✅ **NEW**: Complete RESTful API with MongoDB backend
- ✅ **NEW**: Real server-side pagination and filtering
- ✅ **NEW**: Thai sample data with realistic user information

### Architecture Principles:
- **Database**: MongoDB with Mongoose ODM
- **API**: Nuxt server API routes with proper error handling
- **Client**: useHttpClient composable for all HTTP requests
- **Data Flow**: Real database → API → HTTP Client → Vue components
- **No Mock Data**: Completely replaced JSONPlaceholder simulation

### Interface Architecture Rules:
- **Component interfaces**: `/composables/component_models/` (UI components)
- **Utility interfaces**: `/composables/utility_models/` (HTTP, utilities)
- **API interfaces**: `/composables/models/` (API responses, data models)

## Complete User Management System Implementation (Latest Development)

### **Models Implemented**
- **Enhanced User Model** (`/server/models/User.ts`):
  - Password hashing with bcryptjs (cost 12)
  - JWT authentication support
  - Dual role system (basic + advanced roles)
  - Password reset functionality
  - Email verification system
  - Last login tracking
  - Methods: comparePassword(), createPasswordResetToken(), findByEmail()
  
- **Role Model** (`/server/models/Role.ts`):
  - Role-based access control (RBAC)
  - Permission arrays as strings
  - Created by tracking
  - Active/inactive status
  
- **Permission Model** (`/server/models/Permission.ts`):
  - Granular permission structure: module.action.resource
  - Extended actions: create, read, update, delete, access, hr_view, approve, reject, balance_manage, export, submit, reports
  - Module-based organization

### **Authentication System**
- **JWT Library** (`/server/utils/jwt.ts`): Token signing, verification, header extraction
- **MongoDB Connection** (`/server/utils/mongodb.ts`): Connection caching with model loading
- **Model Loading** (`/server/utils/loadModels.ts`): Ensures all models are registered

### **API Endpoints**
#### **Authentication APIs** (`/server/api/auth/`)
- `POST /api/auth/login` - User login with JWT generation
- `POST /api/auth/register` - User registration with validation
- `GET /api/auth/me` - Get current user profile

#### **Role Management APIs** (`/server/api/roles/`)
- `GET /api/roles` - List roles with pagination/filtering
- `POST /api/roles` - Create new role
- `GET /api/roles/[id]` - Get specific role
- `PUT /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Delete role (prevents deletion if users assigned)
- `POST /api/roles/seed` - Seed initial Thai roles and permissions

#### **Permission Management APIs** (`/server/api/permissions/`)
- Complete CRUD operations with pagination
- `GET /api/permissions/modules` - Get distinct modules
- `GET /api/permissions/status` - System status overview
- `POST /api/permissions/seed` - Comprehensive permission seeding
- `POST /api/permissions/cleanup` - Remove obsolete permissions

### **Interface Architecture**
- **Auth Interfaces** (`/composables/utility_models/auth.ts`): Authentication types
- **User Management Interfaces** (`/composables/data_models/user-management.ts`): CRUD types
- **Permissions Composable** (`/composables/usePermissions.ts`): Permission checking logic

### **Key Features**
#### **Thai Localization**
- Role names: ผู้ดูแลระบบ, ผู้จัดการฝ่ายบุคคล, พนักงาน
- Bilingual error messages and descriptions
- Thai permission descriptions alongside English

#### **Security Implementation**
- Password hashing with bcrypt (cost 12)
- JWT tokens with 7-day expiration
- Authorization header validation
- Admin bypass for permission checks
- Validation for duplicate emails and unique roles

#### **Permission System**
- Module-based permissions (dashboard, user-management)
- Action-based control (create, read, update, delete, approve, etc.)
- Role inheritance and assignment
- Permission seeding with 47 initial permissions

### **Testing Results**
✅ **All APIs tested successfully:**
- Permissions seed: 47 permissions created
- Roles seed: 3 roles created with Thai names
- User registration: admin users created
- Authentication: login/logout with JWT tokens
- Authorization: token validation working
- Data retrieval: pagination and filtering operational

### **Response Format**
Consistent API response structure:
```typescript
{
  success: boolean
  data: any
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
```

### **Dependencies Added**
- `bcryptjs@3.0.2` - Password hashing
- `jsonwebtoken@9.0.2` - JWT token management
- `@types/jsonwebtoken@9.0.10` - TypeScript definitions

### **Bug Fixes Applied**
- Fixed duplicate index warning by removing `index: true` from email field
- Used proper schema indexing instead of field-level indexing
- Fixed TypeScript errors in password hashing and error handling

### **Environment Configuration**
```env
JWT_SECRET=<256-bit-secret-key>
JWT_EXPIRES_IN=7d
MONGO_URI=<mongodb-connection-string>
NUXT_PUBLIC_API_BASE=http://localhost:3000/api
```

### **Next Development Opportunities**
The User Management system is now complete and ready for:
1. Frontend authentication integration
2. Route protection middleware
3. Permission-based UI component visibility
4. Role assignment interface
5. User profile management pages
6. Password reset flow implementation

**Architecture Status**: Production-ready User Management system with complete RBAC implementation, Thai localization, and comprehensive API coverage.

## Component Showcase Tab System Fix (September 2025)

### **Issue Resolution**
Fixed Vue warning: `[Vue warn]: Failed to resolve component: BaseComponentsTab` in `/pages/admin/components.vue`

### **Root Cause**
The components showcase page was trying to import tab components using incorrect naming:
- `BaseComponentsTab` → Should be `ShowcaseBaseComponentsTab`
- `FormComponentsTab` → Should be `ShowcaseFormComponentsTab`  
- `LayoutComponentsTab` → Should be `ShowcaseLayoutComponentsTab`
- `UtilityComponentsTab` → Should be `ShowcaseUtilityComponentsTab`

### **Solution Applied**
Updated `/pages/admin/components.vue` to use correct component names matching the actual files in `/components/showcase/`:
- **Location**: All tab components are in `/components/showcase/` directory
- **Naming**: Components follow `Showcase[Category]ComponentsTab.vue` pattern
- **Auto-import**: Nuxt auto-imports them with the `Showcase` prefix

### **Tab Components Structure**
```
/components/showcase/
├── BaseComponentsTab.vue      → ShowcaseBaseComponentsTab
├── FormComponentsTab.vue      → ShowcaseFormComponentsTab  
├── LayoutComponentsTab.vue    → ShowcaseLayoutComponentsTab
└── UtilityComponentsTab.vue   → ShowcaseUtilityComponentsTab
```

### **Tab System Features**
Each tab contains comprehensive documentation for:
1. **Base Components Tab**: Icons, Breadcrumbs, Buttons, Pagination, DataTable, Alert
2. **Form Components Tab**: Input, Textarea, DatePicker, Checkbox, Radio, Select, Autocomplete  
3. **Layout Components Tab**: PageHeader, Modal, Loading, Avatar, Table
4. **Utility Components Tab**: PathMapping, FormatDate, FormatNumber composables

### **Testing Results**
✅ **Fixed Issues:**
- Vue warning completely resolved
- All tab components load without errors
- DaisyUI styles apply correctly  
- No console errors during development
- Components showcase page fully functional

### **Component Documentation Status**
- All 12+ base components documented with examples
- Props and usage patterns clearly explained
- Live demos with interactive examples
- Code snippets for copy-paste usage
- Thai localization examples included

**Fix Status**: Complete - Components showcase tab system working perfectly with no warnings.

## Layout Configuration Fix (September 2025)

### **Issue Resolution**
Fixed Nuxt layout error: `Invalid layout 'admin' selected` and hydration mismatch in components showcase page.

### **Root Cause**
The `/pages/admin/components.vue` file was configured to use `layout: 'admin'` but the `layouts/admin.vue` file did not exist in the project structure.

### **Available Layouts**
Current project only has these layout files:
- `layouts/default.vue` - Main layout for all pages
- `layouts/auth.vue` - Authentication layout

### **Solution Applied**
Updated `/pages/admin/components.vue` to use the correct layout:
```javascript
// Before (causing error)
definePageMeta({
  layout: 'admin',    // ← File doesn't exist
  middleware: 'auth'
})

// After (working correctly)
definePageMeta({
  layout: 'default',  // ← Uses existing layout
  middleware: 'auth'
})
```

### **Layout Consistency Check**
Verified all admin pages now use consistent layout configuration:
- `/pages/admin/index.vue` → `layout: 'default'`
- `/pages/admin/demo.vue` → `layout: 'default'` 
- `/pages/admin/user_management.vue` → `layout: 'default'`
- `/pages/admin/components.vue` → `layout: 'default'` ✅ **Fixed**

### **Error Types Resolved**
✅ **Layout Error**: `Invalid layout 'admin' selected`  
✅ **Hydration Mismatch**: Server/client rendering inconsistency  
✅ **Console Warnings**: No more layout-related warnings  

### **Testing Results**
- Dev server starts without layout errors
- All admin pages use consistent layout structure
- No hydration mismatches in browser console
- DaisyUI styles load correctly

### **Layout Architecture Notes**
- **Current Setup**: Single `default` layout for all admin pages
- **No Admin Layout**: The project does not have a dedicated admin layout file
- **Consistency**: All pages in `/pages/admin/` directory use `layout: 'default'`
- **Future**: If admin layout is needed, create `/layouts/admin.vue` and update all admin pages

**Fix Status**: Complete - All layout configuration issues resolved and documented.

## BaseRadio Component Props Fix (September 2025)

### **Issue Resolution**
Fixed Vue warning: `[Vue warn]: Missing required prop: "name"` for BaseRadio components in the form showcase.

### **Root Cause**
The `BaseRadioProps` interface defines `name: string` as a required prop, but the FormComponentsTab was not providing the `name` attribute to BaseRadio instances.

### **BaseRadio Props Requirement**
From `/composables/component_models/form.ts`:
```typescript
export interface BaseRadioProps {
  modelValue?: string | number | boolean
  value: string | number | boolean
  name: string                    // ← Required prop
  label?: string
  // ... other optional props
}
```

### **Solution Applied**
Updated all BaseRadio components in `/components/showcase/FormComponentsTab.vue`:

**Size Demo Radio Group:**
```vue
<!-- Before (missing name prop) -->
<BaseRadio v-model="radioDemo.size" value="small" label="Small" />
<BaseRadio v-model="radioDemo.size" value="medium" label="Medium" />
<BaseRadio v-model="radioDemo.size" value="large" label="Large" />

<!-- After (with required name prop) -->
<BaseRadio v-model="radioDemo.size" name="size-demo" value="small" label="Small" />
<BaseRadio v-model="radioDemo.size" name="size-demo" value="medium" label="Medium" />
<BaseRadio v-model="radioDemo.size" name="size-demo" value="large" label="Large" />
```

**Color Demo Radio Group:**
```vue
<!-- Before (missing name prop) -->
<BaseRadio v-model="radioDemo.color" value="red" label="Red" />
<BaseRadio v-model="radioDemo.color" value="blue" label="Blue" />
<BaseRadio v-model="radioDemo.color" value="green" label="Green" />

<!-- After (with required name prop) -->
<BaseRadio v-model="radioDemo.color" name="color-demo" value="red" label="Red" />
<BaseRadio v-model="radioDemo.color" name="color-demo" value="blue" label="Blue" />
<BaseRadio v-model="radioDemo.color" name="color-demo" value="green" label="Green" />
```

### **Usage Example Update**
Also updated the code examples to include the required `name` prop:
```vue
<BaseRadio v-model="selected" name="demo" value="option1" label="Option 1" />
<BaseRadio v-model="selected" name="demo" value="option2" label="Option 2" />
<BaseRadio v-model="selected" name="demo" value="option3" disabled />
```

### **Radio Button Grouping**
- **Size Demo**: All radios use `name="size-demo"` for proper grouping
- **Color Demo**: All radios use `name="color-demo"` for proper grouping
- **HTML Standard**: The `name` attribute ensures radio buttons work as exclusive groups

### **Testing Results**
✅ **Vue Warning Resolved**: No more missing prop warnings  
✅ **Radio Functionality**: Proper radio button group behavior  
✅ **Component Documentation**: Usage examples updated with correct props  
✅ **Type Safety**: All BaseRadio props now match TypeScript interface  

### **Development Note**
The `name` prop is essential for HTML radio button functionality - radio buttons with the same `name` form an exclusive group where only one can be selected at a time.

**Fix Status**: Complete - BaseRadio component warnings resolved and prop requirements documented.

## Theme System Implementation (September 2025)

### **Overview**
Implemented a comprehensive light/dark theme system using DaisyUI themes with full component integration and user preferences persistence.

### **DaisyUI Configuration Update**
Updated `/tailwind.config.js` to support only light and dark themes:
```javascript
daisyui: {
  themes: ["light", "dark"],  // ← Simplified from 6 themes to 2
  base: true,
  styled: true,
  utils: true,
  prefix: "",
  logs: true,
}
```

### **Theme Management Composable**
Created `/composables/useTheme.ts` with comprehensive theme switching functionality:

#### **Features:**
- **Global State Management**: Singleton pattern for consistent theme across app
- **Persistent Storage**: Saves user preference to localStorage
- **System Theme Detection**: Automatically detects OS dark/light preference
- **Dynamic Theme Application**: Applies `data-theme` attribute to `<html>` element
- **Reactive API**: Vue 3 reactivity with computed properties

#### **API:**
```typescript
const { 
  currentTheme,     // 'light' | 'dark'
  isDark,          // boolean computed
  isLight,         // boolean computed
  setTheme,        // (theme: Theme) => void
  toggleTheme,     // () => void
  availableThemes  // ['light', 'dark']
} = useTheme()
```

### **BaseThemeToggle Component**
Created `/components/base/ThemeToggle.vue` - A fully featured theme switching component:

#### **Props Interface:**
```typescript
interface Props {
  // Appearance
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  shape?: 'default' | 'circle' | 'square'
  
  // Features
  showLabel?: boolean    // Show text label
  showBadge?: boolean   // Show theme indicator badge
  disabled?: boolean    // Disable toggle
  
  // Custom labels
  lightLabel?: string   // Custom light mode label
  darkLabel?: string    // Custom dark mode label
}
```

#### **Key Features:**
- **Dynamic Icons**: Sun icon (dark mode) ⇄ Moon icon (light mode)
- **Smooth Animations**: Icon rotation and hover effects with CSS transitions
- **Accessibility**: ARIA labels, tooltips, and keyboard support
- **Haptic Feedback**: Vibration on mobile devices (when supported)
- **Event Emissions**: `@toggle` and `@change` events for parent components
- **DaisyUI Integration**: Full button variant and size support

#### **Usage Examples:**
```vue
<!-- Basic toggle -->
<BaseThemeToggle />

<!-- Circle button with primary color -->
<BaseThemeToggle shape="circle" variant="primary" />

<!-- With label and badge -->
<BaseThemeToggle show-label show-badge />

<!-- Event handling -->
<BaseThemeToggle @change="handleThemeChange" />
```

### **Integration Points**
1. **Components Showcase**: Added theme toggle in page header and Base Components tab
2. **Component Statistics**: Updated count from 6 to 7 base components
3. **Documentation**: Complete usage examples and props documentation

### **Theme System Architecture**
```
├── composables/
│   └── useTheme.ts                 # Core theme management
├── components/base/
│   └── ThemeToggle.vue            # Theme toggle component
├── tailwind.config.js             # DaisyUI theme configuration
└── pages/admin/components.vue     # Theme toggle integration
```

### **Automatic Theme Features**
1. **Initialization**: Auto-detects system preference on first visit
2. **Persistence**: Remembers user choice across sessions
3. **System Sync**: Follows OS theme changes if no manual preference set
4. **SSR Safe**: Handles server-side rendering without hydration issues

### **CSS Smooth Transitions**
Added global CSS transitions for seamless theme switching:
```css
:global(html) {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### **Testing Results**
✅ **Theme Switching**: Light ⇄ Dark modes work perfectly  
✅ **Persistence**: User preferences saved and restored  
✅ **System Integration**: Follows OS dark/light preference  
✅ **Component Variants**: All sizes, shapes, and variants work  
✅ **No Build Errors**: Clean compilation and runtime  
✅ **Responsive Design**: Works on all screen sizes  
✅ **Accessibility**: Full ARIA support and keyboard navigation  

### **Component Count Update**
- **Total Base Components**: 7 (was 6)
- **New Addition**: BaseThemeToggle
- **Updated Stats**: Components showcase statistics reflect new count

### **Development Benefits**
1. **Consistency**: All components automatically respect theme changes
2. **User Experience**: Smooth transitions and preference persistence
3. **Developer Experience**: Simple API with comprehensive features
4. **Accessibility**: Built-in accessibility features
5. **Performance**: Efficient global state management with minimal re-renders

**Implementation Status**: Complete - Full theme system with light/dark modes, user preferences, and comprehensive component integration.

## Navbar Theme Integration Update (September 2025)

### **Issue Fixed**
Replaced the legacy dropdown theme selector in the main navigation with the new BaseThemeToggle component for consistency and improved UX.

### **Changes Made in Default Layout**
Updated `/layouts/default.vue` navbar section:

#### **Before (Legacy Theme Selector):**
```vue
<!-- Old dropdown with multiple theme options -->
<div class="dropdown dropdown-end">
  <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
    <BaseIcon name="sun" size="md" />
  </div>
  <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-xl border">
    <li class="menu-title">Choose Theme</li>
    <li><a @click="changeTheme('corporate')">Corporate</a></li>
    <li><a @click="changeTheme('business')">Business</a></li>
    <li><a @click="changeTheme('dark')">Dark</a></li>
    <li><a @click="changeTheme('cyberpunk')">Cyberpunk</a></li>
    <li><a @click="changeTheme('retro')">Retro</a></li>
  </ul>
</div>
```

#### **After (BaseThemeToggle Integration):**
```vue
<!-- Modern theme toggle with automatic light/dark switching -->
<BaseThemeToggle 
  shape="circle" 
  variant="ghost" 
  size="md"
  @change="onThemeChange"
/>
```

### **Layout Theme Support Improvements**
1. **Removed Hardcoded Theme**: Removed `data-theme="corporate"` from drawer
2. **Dynamic Background**: Changed main content from `bg-white` to `bg-base-200` for theme responsiveness
3. **Simplified Handler**: Replaced manual `changeTheme()` with simple `onThemeChange()` callback

### **Layout Integration Benefits**
- **Consistent UX**: Same theme toggle behavior across all pages
- **Better Accessibility**: Inherits all BaseThemeToggle accessibility features
- **Simplified Code**: Removed complex dropdown menu logic

## Third-Party Component Dark Theme Support (September 2025)

### **Issue: CSS Variables Scope in Third-Party Components**
DaisyUI CSS variables (`oklch(var(--b1))`) may not work in third-party components due to different CSS scoping.

### **Solution: Explicit Color Values**
For components like VueDatePicker, use actual hex colors instead of CSS variables:

#### **BaseDatePicker Dark Theme Implementation**
```css
/* ❌ This doesn't work */
[data-theme="dark"] .dp__menu {
  background-color: oklch(var(--b1));
}

/* ✅ This works */
[data-theme="dark"] .dp__menu {
  background-color: #1f2937 !important;
}
```

#### **Color Mapping for Light/Dark Themes**
```css
/* Light Theme Colors */
.dp-custom-menu {
  --dp-background-color: #ffffff;
  --dp-text-color: #1f2937;
  --dp-border-color: #e5e7eb;
  --dp-hover-color: #f3f4f6;
}

/* Dark Theme Colors */
[data-theme="dark"] .dp-custom-menu {
  --dp-background-color: #1f2937 !important;
  --dp-text-color: #f9fafb !important;
  --dp-border-color: #4b5563 !important;
  --dp-hover-color: #374151 !important;
}
```

### **Third-Party Component Theming Best Practices**
1. **Use `!important`**: Override default component styles
2. **Target Specific Selectors**: Use component's CSS classes (e.g., `.dp__menu`, `.dp__input`)
3. **Both Theme States**: Define styles for both `[data-theme="light"]` and `[data-theme="dark"]`
4. **Test CSS Variables**: If DaisyUI vars don't work, fallback to hex colors
5. **Dynamic Theme Detection**: Use `useTheme()` composable for reactive theme switching

### **Components with Dark Theme Support**
- ✅ **BaseTable**: Fixed `bg-white` → `bg-base-100` 
- ✅ **BaseDatePicker**: Complete VueDatePicker theming with custom CSS
- ✅ **BaseThemeToggle**: Native dark theme support
- ✅ **All Base Components**: Use DaisyUI semantic classes

### **Common Third-Party Component Issues**
1. **White backgrounds in dark theme**: Most common issue
2. **CSS variable scope**: Third-party components may not inherit DaisyUI variables
3. **Input styling**: Often requires explicit background/border color overrides
4. **Popup/dropdown theming**: Usually needs separate styling from main input
- **Theme Persistence**: Automatic theme preference saving/loading
- **Responsive Design**: Better mobile experience with circle button

### **Theme Toggle Locations**
Now BaseThemeToggle is integrated in:
1. **Main Navbar** (top-right): Circle ghost variant for clean navbar design
2. **Components Showcase Header**: Outline variant with actions layout
3. **Base Components Tab**: Multiple variants for documentation

### **Visual Improvements**
- **Navbar**: Clean circular button that changes icon based on current theme
- **Smooth Transitions**: CSS transitions applied globally for seamless theme switching
- **Dynamic Content**: All content areas now properly respond to theme changes
- **No Flash**: Proper initialization prevents theme flashing on page load

### **User Experience**
- **Single Click**: Toggle between light/dark with single button press
- **Visual Feedback**: Dynamic sun/moon icons indicate current and target theme
- **System Integration**: Respects user's OS theme preference on first visit
- **Persistence**: Remembers choice across browser sessions

**Navbar Integration Status**: Complete - Legacy theme dropdown replaced with modern BaseThemeToggle component throughout the application.

## State Management Patterns & Best Practices (September 2025)

### **Pinia Store State Subscription Methods**
เมื่อต้องการติดตามการเปลี่ยนแปลงของ Pinia store state มีหลายวิธี:

### **1. Computed Properties (แนะนำสำหรับ Simple State)**
```vue
<script setup>
const authStore = useAuthStore()

// ✅ ดีที่สุดสำหรับ simple reactive data
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>
```

**ข้อดี:**
- Auto-reactive โดยอัตโนมัติ
- ไม่ต้อง manual cleanup
- Performance ดี (Vue จัดการให้)
- เข้าใจง่าย

### **2. Watch (แนะนำสำหรับ Complex Logic)**
```vue
<script setup>
const authStore = useAuthStore()
const router = useRouter()

// ✅ ดีสำหรับ side effects หรือ complex logic
watch(() => authStore.isAuthenticated, (newVal) => {
  if (newVal) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}, { immediate: true })

// สำหรับ deep watching object changes
watch(() => authStore.user, (newUser) => {
  console.log('User changed:', newUser)
}, { deep: true })
</script>
```

**ข้อดี:**
- Control มากกว่า (immediate, deep, etc.)
- เหมาะกับ side effects
- กำหนด condition ได้

**ข้อควรระวัง:**
- ต้อง cleanup ใน onUnmounted (Vue ทำให้อัตโนมัติในส่วนใหญ่)

### **3. Pinia Store Subscription (แนะนำสำหรับ Store-wide Changes)**
```vue
<script setup>
const authStore = useAuthStore()

// ✅ ดีสำหรับ monitor ทุกการเปลี่ยนแปลงใน store
authStore.$subscribe((mutation, state) => {
  console.log('Store changed:', mutation.type)
  
  if (mutation.events?.key === 'user') {
    console.log('User updated:', state.user)
  }
  
  // บันทึก state ลง localStorage
  if (state.user) {
    localStorage.setItem('cached-user', JSON.stringify(state.user))
  }
})
</script>
```

**ข้อดี:**
- Monitor ทุกการเปลี่ยนแปลงใน store
- เหมาะสำหรับ logging, caching, analytics
- มี mutation metadata

### **4. WatchEffect (แนะนำสำหรับ Auto-dependency Tracking)**
```vue
<script setup>
const authStore = useAuthStore()

// ✅ ดีเมื่อต้องการ auto-track หลาย dependencies
watchEffect(() => {
  // Auto-track authStore.user และ authStore.isAuthenticated
  if (authStore.user && authStore.isAuthenticated) {
    console.log('Logged in user:', authStore.user.name)
    // อัพเดต page title
    document.title = `Dashboard - ${authStore.user.name}`
  }
})
</script>
```

**ข้อดี:**
- Auto-track dependencies
- ไม่ต้องระบุ dependencies manually
- เหมาะสำหรับ multiple related state

## 🎯 แนะนำแบบไหน?

### **สำหรับ Simple State Display:**
```vue
<!-- ✅ ใช้ computed -->
<template>
  <div>Welcome, {{ user?.name }}</div>
</template>

<script setup>
const user = computed(() => useAuthStore().user)
</script>
```

### **สำหรับ Navigation Logic:**
```vue
<!-- ✅ ใช้ watch -->
<script setup>
watch(() => authStore.isAuthenticated, (authenticated) => {
  if (authenticated) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
})
</script>
```

### **สำหรับ Global State Monitoring:**
```vue
<!-- ✅ ใช้ $subscribe -->
<script setup>
// ใน app.vue หรือ layout
authStore.$subscribe((mutation, state) => {
  // Log all auth changes for debugging
  console.log('Auth state changed:', mutation.type)
  
  // Auto-save user preferences
  if (state.user?.preferences) {
    api.saveUserPreferences(state.user.preferences)
  }
})
</script>
```

### **สำหรับ Multiple Dependencies:**
```vue
<!-- ✅ ใช้ watchEffect -->
<script setup>
watchEffect(() => {
  if (authStore.user && themeStore.currentTheme) {
    // Auto-apply user's theme preference
    themeStore.setTheme(authStore.user.preferredTheme || 'light')
  }
})
</script>
```

## 🏆 สรุป Best Practices:

1. **Default Choice**: ใช้ `computed` สำหรับ simple reactive data
2. **Side Effects**: ใช้ `watch` เมื่อต้องการ navigate, API calls, หรือ complex logic
3. **Store Monitoring**: ใช้ `$subscribe` สำหรับ logging, caching, analytics
4. **Multi-dependencies**: ใช้ `watchEffect` เมื่อต้องการ auto-track หลาย state
5. **Performance**: `computed` มี performance ดีที่สุด, `watch` และ `watchEffect` ใช้เมื่อจำเป็น

### **ตัวอย่างการใช้งานจริงในโปรเจค:**
- **computed**: แสดง user name, authentication status
- **watch**: redirect หลัง login/logout, API calls หลัง state change  
- **$subscribe**: auto-save user data, logging, analytics tracking
- **watchEffect**: theme synchronization, multi-store coordination

## Authentication System Improvements (September 2025)

### **Cookie Configuration Fix**
**Issue**: Authentication cookies not being saved in development mode, causing redirect loops.
**Root Cause**: `secure: true` in cookie configuration prevents cookies from being set over HTTP (development).

**Solution Applied**:
```typescript
// stores/auth.ts - Cookie configuration
const tokenCookie = useCookie('token', {
  secure: process.env.NODE_ENV === 'production',  // ✅ Fixed: conditional secure
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  sameSite: 'lax'  // ✅ Added: better cross-site handling
})
```

### **API Response Structure Alignment**
**Issue**: Auth store was accessing `response.token` but API returns `response.data.token`.
**Fixed Locations**:
- `login()` method: `response?.data?.token` และ `response?.data?.user`
- `register()` method: `response?.data?.token` และ `response?.data?.user` 
- `fetchCurrentUser()` method: `response?.data?.user`

### **Debug Log Cleanup**
Removed all console.log statements from:
- **stores/auth.ts**: Login responses, initialization logs, validation logs
- **middleware/auth.ts**: Middleware status logs, redirect logs, timing logs

### **Authentication Flow Testing Results**
✅ **Cookie Persistence**: Cookies now save correctly in development  
✅ **Page Refresh**: /admin/components stays on page after refresh (no redirect to login)  
✅ **API Integration**: Response structure properly handled with `response?.data?.` pattern  
✅ **Clean Console**: No debug logs cluttering development console  
✅ **Production Ready**: Secure cookies enabled only in production environment  

### **Key Technical Decisions**
1. **Conditional Security**: `secure: process.env.NODE_ENV === 'production'` allows development testing
2. **SameSite Policy**: Added `'lax'` for better browser compatibility and security
3. **Consistent API Pattern**: All auth methods now use `response?.data?.` structure
4. **Clean Development**: Removed debug logs for production-ready codebase

### **Authentication Architecture Status**
The authentication system now provides:
- **Persistent Sessions**: Cookies work in both development and production
- **Proper Error Handling**: Graceful handling of invalid tokens and expired sessions
- **API Consistency**: Standardized response structure across all auth endpoints
- **Security**: Production-grade cookie security with development-friendly settings
- **User Experience**: Smooth authentication flow without redirect loops

**Authentication Implementation**: Complete - Production-ready authentication system with persistent cookies, proper error handling, and clean development experience.

## Store Pattern Standardization & User Management Features (Latest Session)

### **Store Architecture Evolution**
**Objective**: Convert user management components from mock data to real store integration following consistent patterns across all management tabs.

### **User Store Implementation**
Created comprehensive `/stores/users.ts` following established store patterns:
```typescript
// Store State Structure
export interface UsersState extends BaseState {
  userRoles?: Role[]
}

// Key CRUD Operations
- fetchUsers(params: BaseRequestData)
- createUser(data: BaseRequestData<UserCreateRequest>)
- updateUser(data: BaseRequestData)
- deleteUser(data: BaseRequestData)
- fetchUserRoles(data: BaseRequestData)
- updateUserRoles(data: BaseRequestData)
```

**TypeScript Interfaces**: `/composables/store_models/users.ts`
- User, UserCreateRequest, UserUpdateRequest interfaces
- UsersState interface extending BaseState
- Complete type safety for all store operations

### **Server-Side Query Parsing System**
**Purpose**: Dynamic filtering support for APIs with security validation
**Location**: `/server/utils/queryParser.ts`

**Key Features**:
- **Bracket Notation Support**: Handles `filter[role][]` → `{ filter: { role: ['admin'] } }`
- **Security Whitelist**: Only allows pre-approved query parameters
- **Type Conversion**: Automatic string to boolean/number conversion
- **Deep Object Support**: Multi-level nested queries

```typescript
// Example Usage
const parsedQuery = parseQuery(query, {
  allowedParams: ['pagination', 'filter', 'search'],
  allowedFilters: ['role', 'isActive', 'department']
})
```

### **User Management Enhancement**
**Component**: `/components/user-management/UsersTab.vue`

**New Features Added**:
1. **Single Modal System**: Combined create/edit modal (like RolesTabs pattern)
2. **User Creation**: Full user creation with password hashing
3. **Form Validation**: Client-side validation with error display
4. **Store Integration**: Complete CRUD operations via user store
5. **Removed Refresh Button**: Auto-refresh after operations

**Key Implementation Pattern**:
```vue
<script setup>
// Store integration
const usersStore = useUsersStore()
const { success, error } = useToast()

// Modal state management
const showUserEditModal = ref(false)
const editingUser = ref<any>(null)

// Form handling
const saveUser = async () => {
  if (editingUser.value) {
    await usersStore.updateUser({ body: { id: editingUser.value.id, ...updateData } })
  } else {
    await usersStore.createUser({ body: updateData })
  }
  await fetchUsers() // Refresh data
}
</script>
```

### **API Endpoint Implementation**
**Created**: `/server/api/users/index.post.ts` for user creation

**Key Security Features**:
- **Password Hashing**: bcryptjs with salt rounds 12
- **Input Validation**: Required fields validation
- **Duplicate Prevention**: Email uniqueness check
- **Error Handling**: Comprehensive error response structure

```typescript
// Password Security Implementation
const saltRounds = 12
const hashedPassword = await bcrypt.hash(body.password, saltRounds)

// User Data Structure
const userData = {
  name: body.name.trim(),
  email: body.email.toLowerCase().trim(),
  password: hashedPassword,
  role: body.role || 'user',
  // ... other fields
}
```

### **Toast Notification System**
**Purpose**: Replace browser `alert()` with proper BaseAlert integration
**Location**: `/composables/utilities/useToast.ts`

**Features**:
- **Multiple Types**: success, error, warning, info
- **Global State**: Reactive toast management
- **Auto-dismiss**: Configurable duration with hover pause
- **Position Control**: top, bottom, center positioning

**Usage Pattern**:
```vue
<script setup>
const { success, error } = useToast()

// Replace alert() calls
success('User created successfully')
error('Failed to save user. Please try again.')
</script>
```

**Integration**: Added `<ToastContainer />` to default layout for global display.

### **Authentication Cookie Fix**
**Issue**: Login wasn't saving cookies, causing authentication failures
**Root Cause**: Secure cookie setting in development environment

**Solution Applied**:
```typescript
// Auth Store Cookie Configuration
const tokenCookie = useCookie('token', {
  secure: false,    // ✅ Allow HTTP in development
  httpOnly: false,
  maxAge: 60 * 60 * 24 * 7,
  sameSite: 'lax'
})
```

**Alternative Solution**: Server-side cookie setting in auth endpoints:
```typescript
// Set cookie on server-side for better reliability
setCookie(event, 'token', token, {
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
})
```

### **Component Pattern Standardization**
**Objective**: Update PermissionsTab.vue and RolesTab.vue to follow UsersTab.vue store pattern

**Standardized Patterns**:
1. **Store Integration**: Replace mock data with store API calls
2. **Error Handling**: Consistent toast notifications instead of alerts
3. **Loading States**: Store loading states for UI feedback
4. **CRUD Operations**: Standardized create/update/delete patterns
5. **Pagination**: Server-side pagination with consistent parameters

### **Console Log Cleanup**
**Applied Across**:
- `/components/user-management/UsersTab.vue`
- `/stores/users.ts`
- `/server/api/users/*.ts`

**Preserved**:
- Error logging for debugging and monitoring
- Validation error logs for development

### **TypeScript Error Fixes**
**Common Issues Resolved**:
```typescript
// Pagination type errors
pagination.totalItems.value = newPagination.total || 0  // ✅ Default fallback

// Button variant errors  
variant="secondary"  // ✅ Changed from invalid "outline"

// Store method signatures
await usersStore.createUser({ body: updateData })  // ✅ BaseRequestData wrapper
```

### **Database Schema Enhancements**
**User Model Extensions**: 
- Added `roles: [ObjectId]` array for advanced role assignment
- Department and position fields for organizational structure
- Avatar field for profile pictures
- Created/updated timestamps for audit trails

### **Current Architecture Status**
✅ **Complete Store Pattern**: Users, Roles, Permissions all follow BaseRequestData pattern
✅ **Real API Integration**: No mock data, all backed by MongoDB
✅ **Security Implementation**: Password hashing, input validation, error handling
✅ **User Experience**: Toast notifications, loading states, form validation
✅ **Consistent Patterns**: Same CRUD approach across all management tabs
✅ **Production Ready**: Proper authentication, cookies, error handling

### **Development Workflow Established**
1. **Store-First Approach**: Create stores before components
2. **BaseRequestData Pattern**: Consistent API call structure
3. **Server-Side Validation**: API-level validation with client-side feedback
4. **Toast Notifications**: Replace all browser alerts
5. **Error Handling**: Graceful error display with user-friendly messages
6. **Auto-refresh**: Update data after CRUD operations

**User Management System Status**: Complete production-ready implementation with comprehensive CRUD operations, authentication integration, and standardized component patterns across all management tabs.

## User Management Filter System Implementation (September 10, 2025)

### **Filter System Enhancement Overview**
**Objective**: Implement comprehensive filtering across all user management tabs with real database integration, replacing hardcoded values with dynamic options.

### **Issue Resolution Summary**
**Problems Identified**:
1. **UsersTab Role Filter**: Not working due to incorrect parameter mapping and ObjectId handling
2. **PermissionsTab Module Options**: Using hardcoded values instead of real database data  
3. **PermissionsTab Type Filter**: Missing from server-side filter configuration
4. **Migration Error**: Permission model `type` field migration causing server errors

### **Technical Fixes Applied**

#### **1. User Role Filtering Fix**
**Location**: `/components/user-management/UsersTab.vue`
**Changes**:
- **Parameter Name**: Changed from `filterObj.roleId` to `filterObj.roles` to match User model
- **Dynamic Role Options**: Replaced hardcoded role options with database-driven `roleFilterOptions`
- **API Integration**: Fixed fetchUsers function to include role filter in API calls

```vue
// Before (hardcoded)
const roleFilterOptions = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' }
]

// After (dynamic from database)
const roleFilterOptions = computed(() => {
  const options = [{ value: '', label: 'All Roles' }]
  if (availableRoles.value.length > 0) {
    availableRoles.value.forEach((role: any) => {
      options.push({ value: role.id, label: role.name })
    })
  }
  return options
})
```

#### **2. Server-Side Filter Configuration Enhancement**
**Location**: `/server/utils/filter_config/userManagement.ts`
**Additions**:
- **User Roles Filter**: Added `roles: commonFieldHandlers.objectIdOrArray('roles')`
- **Permission Type Filter**: Added `type: commonFieldHandlers.stringOrArray('type')`

#### **3. ObjectId Handler Implementation**
**Location**: `/server/utils/queryParser.ts`
**New Feature**: Created `objectIdOrArray` field handler for MongoDB ObjectId conversion
```typescript
objectIdOrArray: (field: string): FilterFieldHandler => 
  (value: any) => {
    // String-based filtering as fallback for ObjectId fields
    if (typeof value === 'string' && value.trim()) {
      return { [field]: value.trim() }
    }
    if (Array.isArray(value) && value.length > 0) {
      return { [field]: { $in: value } }
    }
    return null
  }
```

#### **4. Users API ObjectId Conversion**
**Location**: `/server/api/users/index.get.ts`
**Enhancement**: Added dynamic ObjectId conversion for roles filter
```typescript
// Handle ObjectId conversion for roles field
if (filter.roles && typeof filter.roles === 'string') {
  try {
    filter.roles = new (await import('mongoose')).Types.ObjectId(filter.roles)
  } catch (error) {
    console.warn('Invalid ObjectId for roles filter:', filter.roles)
    delete filter.roles
  }
}
```

#### **5. Dynamic Permission Module Options**
**Location**: `/components/user-management/PermissionsTab.vue`
**Changes**:
- **Replaced Hardcoded Modules**: Removed static module list
- **Added Dynamic Generation**: Created `moduleFilterOptions` computed property
- **Database Integration**: Fetches all permissions on mount to populate options

```vue
// Dynamic module options from real data
const moduleFilterOptions = computed(() => {
  const modules = new Set([''])
  if (permissions.value.length > 0) {
    permissions.value.forEach((permission: any) => {
      if (permission.module) {
        modules.add(permission.module)
      }
    })
  }
  
  const options = [{ value: '', label: 'All Modules' }]
  Array.from(modules).filter(m => m !== '').forEach(module => {
    options.push({ 
      value: module, 
      label: module.charAt(0).toUpperCase() + module.slice(1)
    })
  })
  
  return options
})
```

#### **6. Permission Migration Error Fix**
**Location**: `/server/api/permissions/migrate.post.ts`
**Issue**: Variable name conflict in compiled code causing `permissionsWithValidType is not defined`
**Solution**: Renamed variables and restructured response object
```typescript
// Before (causing compilation error)
const permissionsWithValidType = await Permission.countDocuments({
  type: { $in: ['menu', 'action', 'input'] }
})

// After (clean variable naming)
const validTypeCount = await Permission.countDocuments({
  type: { $in: ['menu', 'action', 'input'] }
})

const migrationStatus = {
  updated: updatedCount,
  totalPermissions: totalPermissions,
  permissionsWithValidType: validTypeCount,
  migrationComplete: totalPermissions === validTypeCount
}
```

#### **7. Permission Type Field Support**
**Added Features**:
- **Database Model**: Permission model includes `type` field with enum validation
- **API Support**: Permission CRUD operations support type filtering
- **UI Integration**: Type-based tabs in role permission management
- **Migration System**: Automatic migration for existing permissions without type field

### **Grid Layout Fix**
**Location**: `/components/user-management/PermissionsTab.vue`
**Issue**: 5 filter controls in 4-column grid causing layout problems
**Solution**: Updated grid from `grid-cols-4` to `grid-cols-5`

### **Testing Results**
✅ **User Role Filter**: Works correctly with real database role IDs  
✅ **Permission Module Filter**: Shows actual modules from database  
✅ **Permission Type Filter**: Filters by menu/action/input types  
✅ **Server Migration**: No more compilation errors on startup  
✅ **ObjectId Handling**: Proper string to ObjectId conversion  
✅ **Grid Layout**: All filter controls display correctly  
✅ **API Integration**: All filters work with server-side filtering  

### **Key Technical Achievements**
1. **Real Database Integration**: All filters now use actual database data
2. **ObjectId Support**: Proper handling of MongoDB ObjectId fields in filters
3. **Dynamic Options**: Filter options automatically update based on database content
4. **Error Handling**: Graceful handling of invalid ObjectIds and filter values
5. **Performance**: Efficient querying with proper indexing and filtering
6. **User Experience**: Intuitive filtering with real options instead of hardcoded values

### **Filter System Architecture**
```
Frontend Filter Flow:
1. User selects filter option (e.g., specific role)
2. Frontend sends query with filter parameters
3. Server parses query using queryParser utilities
4. Filter config validates and converts parameters
5. MongoDB query executed with proper ObjectId conversion
6. Results returned with pagination metadata
7. Frontend updates table with filtered results
```

### **Security Considerations**
- **Parameter Validation**: Only whitelisted filter parameters accepted
- **ObjectId Validation**: Invalid ObjectIds are handled gracefully
- **SQL Injection Prevention**: MongoDB query structure prevents injection
- **Input Sanitization**: All filter values are validated and sanitized

### **Performance Optimizations**
- **Indexed Fields**: Database indexes on commonly filtered fields (roles, type, module)
- **Efficient Queries**: Uses MongoDB $in operator for array filters
- **Pagination**: Server-side pagination prevents large result sets
- **Caching**: Filter options cached on frontend until data refresh

**Filter System Implementation Status**: Complete - All user management filters working with real database integration, proper ObjectId handling, and dynamic option generation.

## Swagger API Documentation Implementation (September 2025)

### **Overview**
Implemented comprehensive Swagger/OpenAPI documentation for the complete API system, providing interactive API testing and documentation interface.

### **Documentation Architecture**
**Approach**: Manual OpenAPI specification generation (not annotation-based) for better control and compatibility with Nuxt 4.

#### **Files Created**:
1. **OpenAPI Specification**: `/public/openapi.json` - Complete API documentation in OpenAPI 3.0.3 format
2. **Swagger UI Route**: `/server/api/docs/index.get.ts` - Interactive Swagger UI interface

### **API Documentation Coverage**
**Complete documentation for all API endpoints**:

#### **Authentication Endpoints** (`/api/auth/`):
- `POST /auth/login` - User authentication with JWT token generation
- `POST /auth/register` - User registration with validation
- `GET /auth/me` - Get current authenticated user profile

#### **User Management Endpoints** (`/api/users/`):
- `GET /users` - Paginated user list with filtering (role, department, isActive)
- `POST /users` - Create new user with password hashing
- `GET /users/{id}` - Get specific user by ID
- `PUT /users/{id}` - Update user information
- `DELETE /users/{id}` - Soft delete user (set isActive: false)

#### **Role Management Endpoints** (`/api/roles/`):
- `GET /roles` - Paginated roles list with filtering
- `POST /roles` - Create new role with permissions
- `GET /roles/{id}` - Get specific role by ID
- `PUT /roles/{id}` - Update role and permissions
- `DELETE /roles/{id}` - Delete role (prevents deletion if users assigned)
- `POST /roles/seed` - Seed initial Thai roles

#### **Permission Management Endpoints** (`/api/permissions/`):
- `GET /permissions` - Paginated permissions with module/action/type filtering
- `POST /permissions` - Create new permission
- `GET /permissions/{id}` - Get specific permission
- `PUT /permissions/{id}` - Update permission
- `DELETE /permissions/{id}` - Delete permission
- `POST /permissions/seed` - Seed 47 initial permissions
- `GET /permissions/modules` - Get distinct module list
- `GET /permissions/status` - System status overview

### **Swagger UI Features**
#### **Interactive Testing**:
- **Try It Out**: Test APIs directly from documentation interface
- **Authorization**: Automatic JWT token injection from localStorage/cookies
- **Request/Response Examples**: Real examples with Thai data
- **Schema Validation**: Complete TypeScript interface documentation

#### **Documentation Features**:
- **Organized by Tags**: Authentication, User Management, Role Management, Permission Management
- **Response Schemas**: Detailed response structure documentation
- **Error Handling**: Comprehensive error response documentation
- **Thai Localization**: Examples use Thai names and descriptions
- **Parameter Documentation**: Complete query parameter and filter documentation

### **TypeScript Schema Integration**
**Complete schema definitions for**:
- **User Model**: Full user schema with roles, department, Thai names
- **Role Model**: RBAC role structure with permissions array
- **Permission Model**: Granular permission system with module.action.resource pattern
- **API Responses**: Standardized `{ success, data, message, pagination }` structure
- **Request Bodies**: Validation schemas for create/update operations

### **Security Documentation**
#### **Authentication**:
- **JWT Bearer Token**: Documented in security schemes
- **Token Injection**: Automatic header injection in Swagger UI
- **Cookie Support**: Supports both localStorage and cookie-based auth

#### **Authorization**:
- **Public Endpoints**: Auth and seed endpoints marked as no auth required
- **Protected Routes**: All management endpoints require authentication
- **Permission-based Access**: Role-based access control documented

### **Testing Results**
✅ **Swagger UI Access**: Available at `http://localhost:3000/api/docs`
✅ **OpenAPI Spec**: Accessible at `http://localhost:3000/openapi.json`
✅ **Interactive Testing**: All endpoints testable with real responses
✅ **Schema Validation**: TypeScript interfaces properly documented
✅ **Authentication**: JWT token integration working
✅ **Real Data Examples**: Thai localized examples throughout

### **Key Technical Features**
1. **CDN-based UI**: Uses unpkg.com for Swagger UI assets (no local dependencies)
2. **Custom Styling**: Dark theme integration matching admin panel
3. **Request Interceptor**: Automatic authorization header injection
4. **Deep Linking**: Enable direct links to specific endpoints
5. **Try It Out**: Interactive API testing with real database
6. **Validation**: Schema validation for requests and responses

### **Developer Experience Benefits**
- **API Discovery**: Easy browsing of all available endpoints
- **Testing Interface**: No need for separate testing tools like Postman
- **Documentation**: Self-documenting API with examples
- **Schema Reference**: Complete TypeScript interface documentation
- **Thai Examples**: Realistic data examples with Thai names and text

### **Usage Instructions**
```bash
# Start development server
npm run dev

# Access Swagger UI
http://localhost:3000/api/docs

# Access OpenAPI spec
http://localhost:3000/openapi.json
```

### **Integration with Existing Systems**
- **No Code Changes**: Existing API endpoints unchanged
- **Compatible**: Works with all existing authentication and RBAC
- **Real Database**: Tests against actual MongoDB data
- **Production Ready**: Suitable for staging and production environments

### **Maintenance Strategy**
- **Manual Updates**: Update OpenAPI spec when adding new endpoints
- **Version Control**: OpenAPI spec tracked in git
- **Documentation First**: Consider updating docs before implementing new features
- **Testing**: Use Swagger UI for API testing during development

**API Documentation Status**: Complete - Full Swagger/OpenAPI documentation with interactive testing interface, comprehensive schema definitions, and Thai localization support covering all authentication, user management, role management, and permission management endpoints.

## API Error Handling i18n Standardization (September 2025)

### **Overview**
Completely refactored API error handling system to use i18n constant keys instead of hardcoded messages, preparing the entire system for internationalization support.

### **Key Changes Made**

#### **1. StatusMessage Standardization**
**Before (Hardcoded):**
```javascript
INVALID_CREDENTIALS: {
  statusCode: HTTP_STATUS.UNAUTHORIZED,
  statusMessage: 'Invalid email or password'
}
```

**After (i18n Constants):**
```javascript
INVALID_CREDENTIALS: {
  statusCode: HTTP_STATUS.UNAUTHORIZED,
  statusMessage: 'INVALID_EMAIL_PASSWORD'
}
```

#### **2. Validation Details Constants**
**Created VALIDATION_DETAILS constant** with 25+ validation error keys:
```javascript
export const VALIDATION_DETAILS = {
  // Field Requirements
  FIELD_NAME_REQUIRED: 'FIELD_NAME_REQUIRED',
  FIELD_EMAIL_REQUIRED: 'FIELD_EMAIL_REQUIRED',
  FIELD_PASSWORD_REQUIRED: 'FIELD_PASSWORD_REQUIRED',

  // Field Validation
  PASSWORD_MIN_6: 'PASSWORD_MIN_6',
  EMAIL_INVALID_FORMAT: 'EMAIL_INVALID_FORMAT',
  USER_EMAIL_DUPLICATE: 'USER_EMAIL_DUPLICATE',

  // ID Validation
  USER_ID_INVALID: 'USER_ID_INVALID',
  INVALID_ROLE_ID: 'INVALID_ROLE_ID',
  INVALID_PERMISSION_ID: 'INVALID_PERMISSION_ID'
}
```

#### **3. API Endpoints Update**
**Updated 12 API endpoint files** to use constants instead of hardcoded details:

**Before:**
```javascript
throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
  details: ['email', 'password']
})
```

**After:**
```javascript
throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
  details: [VALIDATION_DETAILS.FIELD_EMAIL_REQUIRED, VALIDATION_DETAILS.FIELD_PASSWORD_REQUIRED]
})
```

### **Files Updated**

#### **Error Handler System:**
- `/server/utils/responseHandler.ts`: Updated API_ERRORS constants and added VALIDATION_DETAILS

#### **Authentication Endpoints:**
- `/server/api/auth/login.post.ts`: Required fields validation
- `/server/api/auth/register.post.ts`: User registration validation, password requirements

#### **User Management Endpoints:**
- `/server/api/users/index.post.ts`: User creation validation
- `/server/api/users/[id].put.ts`: User update validation, email format
- `/server/api/users/[id]/roles.get.ts`: User ID validation

#### **Role Management Endpoints:**
- `/server/api/roles/index.post.ts`: Role creation validation
- `/server/api/roles/[id].get.ts`: Role ID validation
- `/server/api/roles/[id].put.ts`: Role update validation
- `/server/api/roles/[id].delete.ts`: Role deletion validation

#### **Permission Management Endpoints:**
- `/server/api/permissions/[id].get.ts`: Permission ID validation
- `/server/api/permissions/[id].put.ts`: Permission update validation
- `/server/api/permissions/[id].delete.ts`: Permission deletion validation

### **Error Response Format**
**New standardized error response structure:**
```json
{
  "error": true,
  "statusCode": 400,
  "statusMessage": "REQUIRED_FIELDS_MISSING",
  "message": "REQUIRED_FIELDS_MISSING",
  "data": {
    "messages": {
      "th": "ข้อมูลจำเป็นขาดหายไป",
      "en": "Required fields are missing"
    },
    "details": [
      "FIELD_EMAIL_REQUIRED",
      "FIELD_PASSWORD_REQUIRED"
    ]
  }
}
```

### **Updated Constants List**
**StatusMessage Constants (15 updated):**
- `INVALID_EMAIL_PASSWORD` (was: Invalid email or password)
- `AUTHENTICATION_REQUIRED` (was: Authentication required)
- `ACCESS_DENIED_INSUFFICIENT_PERMISSIONS` (was: Access denied...)
- `REQUIRED_FIELDS_MISSING` (was: Required fields are missing)
- `VALIDATION_FAILED` (was: Validation failed)
- `RESOURCE_NOT_FOUND` (was: Resource not found)
- `USER_ALREADY_EXISTS` (was: User already exists)
- `ROLE_IN_USE_CANNOT_DELETE` (was: Role is currently in use...)

**Validation Detail Constants (25 created):**
- Field requirements: `FIELD_*_REQUIRED` pattern
- Validation rules: `PASSWORD_MIN_6`, `EMAIL_INVALID_FORMAT`
- Business logic: `USER_EMAIL_DUPLICATE`, `ROLE_IN_USE`
- ID validation: `USER_ID_INVALID`, `INVALID_ROLE_ID`

### **Swagger Documentation Update**
**Updated OpenAPI ErrorResponse schema** to reflect new format:
- Added `statusMessage` as i18n constant key
- Updated `data.details` to show constant key examples
- Added descriptions explaining i18n structure
- Updated examples to match real API responses

### **Testing Results**
✅ **API Endpoints**: All 12 endpoints tested with new constant format
✅ **Error Responses**: Constants properly returned in details arrays
✅ **Backward Compatibility**: Existing error handling logic preserved
✅ **Multi-language Support**: Messages object contains both Thai and English
✅ **Swagger Documentation**: Updated to reflect new error format
✅ **Development Server**: No breaking changes, all endpoints functional

### **i18n Implementation Benefits**
1. **Consistent Error Keys**: All errors use standardized constant keys
2. **Frontend i18n Ready**: Constants can be mapped to localized messages
3. **Maintainable**: Error messages centralized in one location
4. **Type Safety**: Constants prevent typos in error details
5. **Scalable**: Easy to add new languages and error types

### **Frontend Integration Pattern**
```javascript
// Error handling in frontend components
const errorKey = error.data.details[0] // e.g., 'FIELD_EMAIL_REQUIRED'
const localizedMessage = i18n.t(errorKey) // Translates to localized text
```

### **Migration Strategy**
- **No Breaking Changes**: Existing API structure preserved
- **Additive Updates**: Added constants alongside existing messages
- **Gradual Rollout**: Can implement frontend i18n incrementally
- **Fallback Support**: English messages still available in `data.messages.en`

### **Development Workflow Impact**
- **Error Creation**: Use `VALIDATION_DETAILS.*` constants instead of hardcoded strings
- **Testing**: Error responses now consistent and predictable
- **Documentation**: Swagger shows actual error format developers will receive
- **Debugging**: Error keys make it easier to identify specific validation failures

**i18n Error Handling Status**: Complete - All API endpoints now use i18n constant keys for error messages and validation details, with updated Swagger documentation and comprehensive testing validation.

## Mongoose Model Validation i18n Implementation (September 2025)

### **Overview**
Extended i18n standardization to Mongoose model validation messages, replacing all hardcoded validation messages in schema definitions with constant keys for complete internationalization support.

### **Validation Constants Architecture**
**Created**: `/server/models/constants/validation.ts` - Centralized validation message constants for all Mongoose models

#### **Constant Categories (25+ constants):**
```typescript
export const MODEL_VALIDATION_MESSAGES = {
  // User Model Validation
  USER_NAME_REQUIRED: 'USER_NAME_REQUIRED',
  USER_EMAIL_REQUIRED: 'USER_EMAIL_REQUIRED',
  USER_PASSWORD_REQUIRED: 'USER_PASSWORD_REQUIRED',
  USER_NAME_MAX_LENGTH: 'USER_NAME_MAX_LENGTH',
  USER_PASSWORD_MIN_LENGTH: 'USER_PASSWORD_MIN_LENGTH',
  USER_EMAIL_INVALID_FORMAT: 'USER_EMAIL_INVALID_FORMAT',

  // Role Model Validation
  ROLE_NAME_REQUIRED: 'ROLE_NAME_REQUIRED',
  ROLE_DESCRIPTION_REQUIRED: 'ROLE_DESCRIPTION_REQUIRED',
  ROLE_NAME_MAX_LENGTH: 'ROLE_NAME_MAX_LENGTH',

  // Permission Model Validation
  PERMISSION_NAME_REQUIRED: 'PERMISSION_NAME_REQUIRED',
  PERMISSION_MODULE_REQUIRED: 'PERMISSION_MODULE_REQUIRED',
  PERMISSION_ACTION_REQUIRED: 'PERMISSION_ACTION_REQUIRED',
  PERMISSION_TYPE_REQUIRED: 'PERMISSION_TYPE_REQUIRED'

  // Length validation constants
  // Field format validation constants
}
```

### **Model Updates Summary**

#### **User Model (`/server/models/User.ts`)**
**Validation messages replaced:**
- `required: [true, 'Name is required']` → `required: [true, MODEL_VALIDATION_MESSAGES.USER_NAME_REQUIRED]`
- `maxlength: [100, 'Name cannot be more than 100 characters']` → `maxlength: [100, MODEL_VALIDATION_MESSAGES.USER_NAME_MAX_LENGTH]`
- `match: [regex, 'Please enter a valid email']` → `match: [regex, MODEL_VALIDATION_MESSAGES.USER_EMAIL_INVALID_FORMAT]`
- `minlength: [6, 'Password must be at least 6 characters']` → `minlength: [6, MODEL_VALIDATION_MESSAGES.USER_PASSWORD_MIN_LENGTH]`

**Updated validations (8 fields):**
- name, email, password, role (required fields)
- department, position, phone, website (length validations)

#### **Role Model (`/server/models/Role.ts`)**
**Validation messages replaced:**
- `required: [true, 'Role name is required']` → `required: [true, MODEL_VALIDATION_MESSAGES.ROLE_NAME_REQUIRED]`
- `maxlength: [50, 'Role name cannot be more than 50 characters']` → `maxlength: [50, MODEL_VALIDATION_MESSAGES.ROLE_NAME_MAX_LENGTH]`

**Updated validations (2 fields):**
- name (required + length)
- description (required + length)

#### **Permission Model (`/server/models/Permission.ts`)**
**Validation messages replaced:**
- All required field validations for name, description, module, action, resource, type
- All maxlength validations for name (100), description (200), module (50), resource (50)

**Updated validations (6 fields):**
- name, description, module, action, resource, type

### **Before vs After Comparison**

#### **Before (Hardcoded):**
```javascript
// User Schema
name: {
  type: String,
  required: [true, 'Name is required'],
  maxlength: [100, 'Name cannot be more than 100 characters']
}
```

#### **After (i18n Constants):**
```javascript
// User Schema with constants import
import { MODEL_VALIDATION_MESSAGES } from './constants/validation'

name: {
  type: String,
  required: [true, MODEL_VALIDATION_MESSAGES.USER_NAME_REQUIRED],
  maxlength: [100, MODEL_VALIDATION_MESSAGES.USER_NAME_MAX_LENGTH]
}
```

### **Integration with API Error Handling**
**Seamless integration** with existing API error handling system:
- **Model validation errors** now use constant keys in error messages
- **API validation errors** use VALIDATION_DETAILS constants
- **Both systems** follow the same i18n pattern
- **Frontend** can handle both types with same translation approach

### **Testing Results**
✅ **Model Loading**: All models (User, Role, Permission) load successfully with constants
✅ **Validation Errors**: Model validation failures return constant keys
✅ **API Integration**: Validation errors properly caught and formatted by API handlers
✅ **Backward Compatibility**: No breaking changes to existing functionality
✅ **Type Safety**: TypeScript validation ensures constant usage correctness

### **Example Validation Error Response**
**Model validation failure now returns:**
```json
{
  "statusCode": 400,
  "statusMessage": "VALIDATION_FAILED",
  "data": {
    "messages": {
      "th": "การตรวจสอบข้อมูลล้มเหลว",
      "en": "Validation failed"
    },
    "details": ["email"] // Field that failed with constant key
  }
}
```

### **Development Benefits**
1. **Complete i18n Coverage**: Both API and model validation messages use constants
2. **Centralized Management**: All validation messages in one location
3. **Type Safety**: Constants prevent typos in validation messages
4. **Consistency**: Same validation message patterns across all models
5. **Maintainable**: Easy to update messages without touching model definitions
6. **Scalable**: Adding new models follows established constant pattern

### **Frontend Integration Strategy**
```javascript
// i18n configuration can handle both API and model validation
const validationMessages = {
  // API validation constants
  'FIELD_EMAIL_REQUIRED': 'อีเมลเป็นข้อมูลจำเป็น',

  // Model validation constants
  'USER_EMAIL_INVALID_FORMAT': 'รูปแบบอีเมลไม่ถูกต้อง',
  'USER_PASSWORD_MIN_LENGTH': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
}
```

### **Architecture Consistency**
**Three-layer i18n validation system:**
1. **Frontend Validation**: User input validation with i18n messages
2. **API Validation**: Request validation with VALIDATION_DETAILS constants
3. **Model Validation**: Schema validation with MODEL_VALIDATION_MESSAGES constants

**All layers** use same constant key approach for unified i18n implementation.

### **Migration Notes**
- **No Database Changes**: Only validation message constants updated
- **No API Changes**: Same error response structure maintained
- **No Frontend Changes**: Error handling patterns remain identical
- **Additive Updates**: Constants added alongside existing functionality

### **Future Development Guidelines**
- **New Models**: Use MODEL_VALIDATION_MESSAGES constants for all validation messages
- **Validation Updates**: Add new constants to validation.ts before using in models
- **Message Updates**: Update constants file instead of individual model definitions
- **Testing**: Verify constant usage in model validation error responses

**Mongoose Model i18n Status**: Complete - All Mongoose model validation messages now use centralized i18n constants, providing comprehensive internationalization support across the entire validation layer.

## TypeScript Model Error Fixes (September 2025)

### **Issue Fixed**
Resolved TypeScript strict mode errors: `The operand of a 'delete' operator must be optional.ts(2790)` in Mongoose model toJSON transforms.

### **Problem**
TypeScript strict mode flagged `delete ret._id` operations in toJSON transforms because `_id` is a required property in Mongoose documents, making the delete operation invalid according to TypeScript's type system.

### **Solution Applied**
**Replaced delete operations with ES6 destructuring pattern** for cleaner, type-safe code:

#### **Before (TypeScript Error):**
```javascript
toJSON: {
  transform: function(doc, ret) {
    ret.id = ret._id
    delete ret._id        // ❌ TypeScript error
    delete ret.__v        // ❌ TypeScript error
    delete ret.password   // ❌ TypeScript error (User model)
    return ret
  }
}
```

#### **After (Type-Safe):**
```javascript
toJSON: {
  transform: function(doc, ret) {
    const { _id, __v, password, ...userData } = ret  // ✅ Destructuring
    return {
      id: _id,
      ...userData
    }
  }
}
```

### **Files Updated**
#### **User Model (`/server/models/User.ts`)**
- **Fixed**: `_id`, `__v`, `password`, `passwordResetToken`, `passwordResetExpires`, `emailVerificationToken` removal
- **Method**: Destructuring with sensitive field exclusion
- **Result**: Clean JSON output without sensitive data

#### **Role Model (`/server/models/Role.ts`)**
- **Fixed**: `_id`, `__v` removal with `toString()` conversion
- **Method**: Destructuring pattern
- **Result**: Clean JSON with string ID conversion

#### **Permission Model (`/server/models/Permission.ts`)**
- **Fixed**: `_id`, `__v` removal with `toString()` conversion
- **Method**: Destructuring pattern
- **Result**: Clean JSON with string ID conversion

### **Benefits of New Approach**
1. **Type Safety**: No TypeScript strict mode errors
2. **Modern JavaScript**: Uses ES6 destructuring instead of imperative delete operations
3. **Cleaner Code**: More readable and maintainable transformation logic
4. **Immutable Pattern**: Creates new object instead of mutating existing one
5. **Performance**: Similar performance with better type checking

### **Testing Results**
✅ **TypeScript Compilation**: No errors in strict mode
✅ **Server Startup**: Clean startup without compilation warnings
✅ **JSON Output**: Correct transformation - `id` instead of `_id`, no `__v` field
✅ **API Responses**: All endpoints return properly formatted JSON
✅ **Sensitive Data**: Password and token fields properly excluded in User model
✅ **Backward Compatibility**: Same JSON structure as before, no breaking changes

### **Example JSON Output**
**Permission API Response:**
```json
{
  "id": "68c1aceffd53bc7c5cdbf8c4",         // ✅ _id converted to id
  "name": "dashboard.access",
  "description": "Access to dashboard page",
  "module": "dashboard",
  "action": "access",
  "resource": "dashboard",
  "type": "menu",
  "isActive": true,
  "createdAt": "2025-09-10T16:53:03.698Z",
  "updatedAt": "2025-09-10T16:59:27.959Z"
  // ✅ __v field automatically excluded
}
```

### **Development Impact**
- **No Breaking Changes**: API responses maintain same structure
- **Improved Developer Experience**: No more TypeScript warnings in IDE
- **Consistent Pattern**: Same destructuring approach across all models
- **Future-Proof**: Modern JavaScript pattern suitable for strict TypeScript environments

### **Best Practices Established**
1. **Use destructuring** instead of delete operations for object property removal
2. **Extract sensitive fields** explicitly in destructuring pattern
3. **Convert ObjectId to string** in the return statement for consistent API responses
4. **Maintain immutability** by creating new objects rather than mutating existing ones

**TypeScript Model Fix Status**: Complete - All Mongoose models now use type-safe destructuring patterns for JSON transformation, eliminating TypeScript strict mode errors while maintaining identical API response structure.