<template>
  <ClientOnly>
    <div class="drawer lg:drawer-open">
      <input id="admin-drawer" type="checkbox" class="drawer-toggle" />

      <!-- Main Content -->
      <div class="drawer-content flex flex-col">
        <!-- Enhanced Navbar with proper DaisyUI components -->
        <div class="navbar bg-base-100 shadow-lg border-b border-base-300">
          <!-- Sidebar Toggle - Mobile & Desktop -->
          <div class="navbar-start">
            <!-- Mobile hamburger -->
            <label for="admin-drawer" class="btn btn-square btn-ghost lg:hidden drawer-button">
              <BaseIcon name="bars-3" size="lg" />
            </label>

            <!-- Desktop sidebar toggle -->
            <button @click="toggleSidebar" class="btn btn-square btn-ghost hidden lg:flex">
              <BaseIcon :name="isSidebarCollapsed ? 'bars-3' : 'x-mark'" size="lg" />
            </button>
          </div>

          <!-- Empty center space -->
          <div class="navbar-center">
            <!-- Breadcrumbs moved to individual pages -->
          </div>

          <!-- Center title for mobile -->
          <div class="navbar-center lg:hidden">
            <h1 class="text-xl font-bold text-primary flex items-center gap-2">
              Admin Panel
            </h1>
          </div>

          <!-- Right side actions -->
          <div class="navbar-end gap-2">
            <!-- Search -->
            <div class="form-control hidden md:flex">
              <input type="text" placeholder="Search..." class="input input-bordered input-sm w-24 md:w-auto" />
            </div>

            <!-- Notifications dropdown -->
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <div class="indicator">
                  <BaseIcon name="bell" size="md" />
                  <span class="badge badge-xs badge-primary indicator-item">3</span>
                </div>
              </div>
              <div class="dropdown-content mt-3 z-[1] card card-compact w-80 bg-base-100 shadow-xl">
                <div class="card-body">
                  <div class="flex items-center justify-between">
                    <h3 class="font-bold text-lg">Notifications</h3>
                    <div class="badge badge-primary">3 New</div>
                  </div>
                  <div class="divider my-2"></div>
                  <div class="space-y-3">
                    <div class="alert alert-info py-2">
                      <BaseIcon name="information-circle" variant="solid" size="sm" />
                      <div>
                        <div class="text-sm font-semibold">New user registered</div>
                        <div class="text-xs opacity-70">5 minutes ago</div>
                      </div>
                    </div>
                    <div class="alert alert-success py-2">
                      <BaseIcon name="check-circle" variant="solid" size="sm" />
                      <div>
                        <div class="text-sm font-semibold">Order #1234 completed</div>
                        <div class="text-xs opacity-70">10 minutes ago</div>
                      </div>
                    </div>
                    <div class="alert alert-warning py-2">
                      <BaseIcon name="exclamation-triangle" variant="solid" size="sm" />
                      <div>
                        <div class="text-sm font-semibold">System maintenance in 2h</div>
                        <div class="text-xs opacity-70">15 minutes ago</div>
                      </div>
                    </div>
                  </div>
                  <div class="card-actions justify-end mt-3">
                    <button class="btn btn-primary btn-sm">View All</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Language Switcher -->
            <BaseLanguageSwitcher />

            <!-- Theme Toggle -->
            <BaseThemeToggle
              shape="circle"
              variant="ghost"
              size="md"
              @change="onThemeChange"
            />

            <!-- User profile dropdown -->
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
                <BaseAvatar
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                  name="Admin User"
                  alt="Admin Profile"
                  ring
                  ring-color="ring-primary"
                  clickable
                />
              </div>
              <ul tabindex="0"
                class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-xl border">
                <li class="menu-title">
                  <div class="flex items-center gap-2">
                    <BaseAvatar
                      src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      name="Admin User"
                      size="sm"
                    />
                    <div>
                      <div class="font-semibold">Admin User</div>
                      <div class="text-xs text-base-content/70">admin@example.com</div>
                    </div>
                  </div>
                </li>
                <li><a><BaseIcon name="user" size="sm" />Profile</a></li>
                <li><a><BaseIcon name="cog-6-tooth" size="sm" />Settings</a></li>
                <li><a><BaseIcon name="document-text" size="sm" />Help & Support</a></li>
                <li>
                  <hr class="my-2">
                </li>
                <li><a @click="logout" class="text-error"><BaseIcon name="arrow-right-on-rectangle" size="sm" />Logout</a></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Main page content -->
        <main class="flex-1 p-6 bg-base-200 min-h-screen">
          <slot />
        </main>
      </div>

      <!-- Enhanced Drawer Sidebar with proper Menu components -->
      <div class="drawer-side">
        <label for="admin-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <aside class="min-h-full bg-base-100 shadow-xl transition-all duration-300 border-r border-base-300"
          :class="{ 'w-80': !isSidebarCollapsed, 'w-20': isSidebarCollapsed }">
          <!-- Enhanced Logo Section -->
          <div class="bg-gradient-to-r from-primary to-secondary text-primary-content transition-all duration-300"
            :class="{ 'p-6': !isSidebarCollapsed, 'p-4': isSidebarCollapsed }">
            <div class="flex items-center"
              :class="{ 'justify-center space-x-3': !isSidebarCollapsed, 'justify-center': isSidebarCollapsed }">
              <BaseIcon name="shield-check" size="xl" />
              <div v-if="!isSidebarCollapsed" class="hidden lg:block">
                <h1 class="text-xl font-bold">Admin Panel</h1>
                <p class="text-sm opacity-80">Management System</p>
              </div>
              <!-- Mobile always shows text -->
              <div class="lg:hidden">
                <h1 class="text-xl font-bold">Admin Panel</h1>
                <p class="text-sm opacity-80">Management System</p>
              </div>
            </div>
          </div>

          <!-- Dynamic Menu -->
          <div class="p-4">
            <ul class="w-full" :class="{ 'menu menu-lg': !isSidebarCollapsed }">
              <template v-for="section in menuSections" :key="section.title">
                <!-- Section Title - Hidden when collapsed on desktop -->
                <li class="menu-title !pl-1" v-if="section.title && (!isSidebarCollapsed || isMobile)">
                  <span class="flex items-center gap-2">
                    <BaseIcon v-if="section.icon" :name="section.icon" size="sm" />
                    <span class="lg:hidden">{{ section.title }}</span>
                    <span v-if="!isSidebarCollapsed" class="hidden lg:block">{{ section.title }}</span>
                  </span>
                </li>

                <!-- Menu Items -->
                <li v-for="item in section.items" :key="item.path">
                  <!-- Collapsed state with hover tooltip -->
                  <div v-if="isSidebarCollapsed && !isMobile" class="relative">
                    <NuxtLink :to="item.path" :class="{ 'active': isActiveRoute(item.path, item.activeWhen) }"
                      class="flex items-center justify-center p-3 rounded-lg transition-colors"
                      @mouseenter="showTooltip(item, $event)" @mouseleave="hideTooltip">
                      <BaseIcon :name="item.icon" size="md" />
                    </NuxtLink>
                  </div>

                  <!-- Expanded state (normal menu item) -->
                  <NuxtLink v-else :to="item.path" :class="{ 'active': isActiveRoute(item.path, item.activeWhen) }">
                    <BaseIcon :name="item.icon" size="md" />
                    <span>{{ item.label }}</span>
                    <div v-if="item.badge" :class="`badge badge-${item.badge.variant} badge-sm`">
                      {{ item.badge.text }}
                    </div>
                  </NuxtLink>
                </li>
              </template>
            </ul>
          </div>
        </aside>
      </div>

      <!-- Tooltip Portal - rendered outside drawer context -->
      <Teleport to="body">
        <div v-if="tooltipVisible"
          class="fixed bg-neutral text-neutral-content px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-2xl pointer-events-none transition-opacity duration-200"
          :style="tooltipStyle">
          {{ tooltipData?.label }}
          <div v-if="tooltipData?.badge" :class="`badge badge-${tooltipData.badge.variant} badge-xs ml-2`">
            {{ tooltipData.badge.text }}
          </div>
          <!-- Arrow pointing left -->
          <div
            class="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-neutral">
          </div>
        </div>
      </Teleport>

      <!-- Toast Container -->
      <BaseToastContainer />
      
      <!-- Confirm Container -->
      <BaseConfirmContainer />
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// Theme change handler
const onThemeChange = (theme) => {
  console.log('Theme changed to:', theme)
  // The useTheme composable handles all theme logic
}

// Sidebar state management using DaisyUI drawer pattern
const isSidebarCollapsed = ref(false)
const isMobile = ref(false)

// Tooltip management
const tooltipVisible = ref(false)
const tooltipData = ref(null)
const tooltipStyle = ref({})

// Check if device is mobile
const checkIsMobile = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 1024
  }
}

// Toggle sidebar collapse
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// Tooltip functions
const showTooltip = (item, event) => {
  if (typeof window === 'undefined') return

  const rect = event.target.getBoundingClientRect()
  tooltipData.value = item
  tooltipStyle.value = {
    left: (rect.right + 8) + 'px',
    top: (rect.top + rect.height / 2) + 'px',
    transform: 'translateY(-50%)',
    zIndex: '99999'
  }
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
  tooltipData.value = null
}

// Initialize on mount
onMounted(async () => {
  checkIsMobile()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', checkIsMobile)
  }
})

// Menu configuration
const menuSections = ref([
  {
    title: "Dashboard",
    icon: "chart-bar",
    items: [
      {
        path: "/admin",
        label: "Overview",
        icon: "home",
        activeWhen: ["/admin"]
      }
    ]
  },
  {
    title: "E-Learning",
    icon: "academic-cap",
    items: [
      {
        path: "/admin/rooms",
        label: "จัดการห้องเรียน",
        icon: "academic-cap"
      },
      {
        path: "/admin/students",
        label: "จัดการนักเรียน",
        icon: "users"
      },
      {
        path: "/admin/courses",
        label: "จัดการรายวิชา",
        icon: "book-open"
      },
      {
        path: "/admin/lessons",
        label: "จัดการบทเรียน",
        icon: "document-text"
      }
    ]
  },
  {
    title: "Settings",
    icon: "users",
    items: [
      {
        path: "/admin/user_management",
        label: "จัดการผู้ใช้",
        icon: "user",
        badge: {
          text: "New",
          variant: "primary"
        }
      },
    ]
  },
  {
    title: "Examples",
    icon: "beaker",
    items: [
      {
        path: "/admin/demo",
        label: "Demo",
        icon: "server",
      },
      {
        path: "/admin/components",
        label: "Components",
        icon: "puzzle-piece",
        badge: {
          text: "UI",
          variant: "info"
        }
      },
      {
        path: "/admin/i18n-test",
        label: "i18n Test",
        icon: "language",
        badge: {
          text: "Test",
          variant: "warning"
        }
      }
    ]
  }
])

// Helper function to check if route is active
const isActiveRoute = (itemPath, activeWhen = []) => {
  const currentPath = route.path
  if (currentPath === itemPath) return true
  if (activeWhen && activeWhen.includes(currentPath)) return true
  return false
}


const logout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.menu-lg > li > a,
.menu-lg > li > a > span {
  font-size: 1rem !important;
}
</style>