<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <BasePageHeader
      title="Admin Dashboard"
      code="DASH-001"
      description="ยินดีต้อนรับสู่ระบบจัดการ Base Components"
      :breadcrumbs="breadcrumbItems"
    />

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Components Count -->
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-primary">
          <BaseIcon name="puzzle-piece" size="2xl" />
        </div>
        <div class="stat-title">Base Components</div>
        <div class="stat-value text-primary">12</div>
        <div class="stat-desc">Form & UI Components</div>
      </div>

      <!-- Demo -->
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-success">
          <BaseIcon name="server" size="2xl" />
        </div>
        <div class="stat-title">API Integration</div>
        <div class="stat-value text-success">✓</div>
        <div class="stat-desc">JSONPlaceholder Ready</div>
      </div>

      <!-- Features -->
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-info">
          <BaseIcon name="star" size="2xl" />
        </div>
        <div class="stat-title">Features</div>
        <div class="stat-value text-info">15+</div>
        <div class="stat-desc">CRUD, Loading, Alerts</div>
      </div>

      <!-- Status -->
      <div class="stat bg-base-100 shadow rounded-lg">
        <div class="stat-figure text-warning">
          <BaseIcon name="chart-bar" size="2xl" />
        </div>
        <div class="stat-title">Status</div>
        <div class="stat-value text-warning">Demo</div>
        <div class="stat-desc">Development Mode</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Available Components -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title flex items-center gap-2">
            <BaseIcon name="wrench-screwdriver" size="md" class="text-primary" />
            Available Components
          </h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <div class="flex items-center gap-3">
                <BaseIcon name="cursor-arrow-ripple" size="md" class="text-primary" />
                <div>
                  <div class="font-medium">BaseButton</div>
                  <div class="text-sm text-base-content/70">Interactive buttons with loading states</div>
                </div>
              </div>
              <div class="badge badge-success">Ready</div>
            </div>

            <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <div class="flex items-center gap-3">
                <BaseIcon name="table-cells" size="md" class="text-info" />
                <div>
                  <div class="font-medium">BaseDataTable</div>
                  <div class="text-sm text-base-content/70">Advanced data table with sorting</div>
                </div>
              </div>
              <div class="badge badge-success">Ready</div>
            </div>

            <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <div class="flex items-center gap-3">
                <BaseIcon name="arrow-path" size="md" class="text-warning" />
                <div>
                  <div class="font-medium">BaseLoading</div>
                  <div class="text-sm text-base-content/70">Global loading overlay system</div>
                </div>
              </div>
              <div class="badge badge-success">Ready</div>
            </div>

            <div class="flex items-center justify-between p-3 bg-base-200 rounded-lg">
              <div class="flex items-center gap-3">
                <BaseIcon name="bell" size="md" class="text-error" />
                <div>
                  <div class="font-medium">BaseAlert</div>
                  <div class="text-sm text-base-content/70">Notification and confirmation system</div>
                </div>
              </div>
              <div class="badge badge-success">Ready</div>
            </div>
          </div>

          <div class="card-actions justify-end mt-4">
            <NuxtLink to="/admin/components" class="btn btn-primary">
              View All Components
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Quick Start -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title flex items-center gap-2">
            <BaseIcon name="rocket-launch" size="md" class="text-success" />
            Quick Start
          </h2>
          <div class="space-y-4">
            <div class="alert alert-info">
              <BaseIcon name="information-circle" size="md" />
              <div>
                <h3 class="font-bold">Try the Demo!</h3>
                <div class="text-sm">Experience full CRUD operations with real API integration</div>
              </div>
            </div>

            <div class="space-y-2">
              <h3 class="font-semibold">Features Available:</h3>
              <ul class="space-y-1 text-sm">
                <li class="flex items-center gap-2">
                  <BaseIcon name="check" size="sm" class="text-success" />
                  RESTful API Integration (JSONPlaceholder)
                </li>
                <li class="flex items-center gap-2">
                  <BaseIcon name="check" size="sm" class="text-success" />
                  Data Table with Pagination
                </li>
                <li class="flex items-center gap-2">
                  <BaseIcon name="check" size="sm" class="text-success" />
                  Add/Edit Form with Modal
                </li>
                <li class="flex items-center gap-2">
                  <BaseIcon name="check" size="sm" class="text-success" />
                  Delete Confirmation
                </li>
                <li class="flex items-center gap-2">
                  <BaseIcon name="check" size="sm" class="text-success" />
                  Loading States & Alerts
                </li>
              </ul>
            </div>
          </div>

          <div class="card-actions justify-end mt-4">
            <NuxtLink to="/admin/demo" class="btn btn-success">
              <BaseIcon name="play" size="sm" />
              Try Demo
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- System Info -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title flex items-center gap-2">
          <BaseIcon name="information-circle" size="md" class="text-info" />
          System Information
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 class="font-semibold mb-2">Framework Stack</h3>
            <div class="space-y-1 text-sm">
              <div>• Vue 3 (Composition API)</div>
              <div>• Nuxt 4.1.0</div>
              <div>• TypeScript</div>
              <div>• DaisyUI + Tailwind CSS</div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Components</h3>
            <div class="space-y-1 text-sm">
              <div>• BaseButton (Submit Loading)</div>
              <div>• BaseDataTable (Sortable)</div>
              <div>• BaseModal (Responsive)</div>
              <div>• BaseAlert (Multi-type)</div>
              <div>• BaseLoading (Singleton)</div>
              <div>• BasePagination</div>
            </div>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Features</h3>
            <div class="space-y-1 text-sm">
              <div>• REST API Integration</div>
              <div>• Form Validation</div>
              <div>• CRUD Operations</div>
              <div>• Loading States</div>
              <div>• Error Handling</div>
              <div>• Responsive Design</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Breadcrumb configuration
const breadcrumbItems = [
  {
    label: 'Admin',
    to: '/admin',
    icon: 'home'
  },
  {
    label: 'Welcome',
  }
]
</script>