<template>
  <div class="space-y-8">
    <!-- BaseBreadcrumbs Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseBreadcrumbs Component</h3>
            <p class="text-sm">Automatic breadcrumb generation from URL path with configurable mapping and manual override support.</p>
          </div>
        </div>

        <!-- Auto Generation Example -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="link" size="sm" />
            Auto Generation
          </h3>
          <p class="text-sm text-base-content/70 mb-3">
            Breadcrumbs are automatically generated from the current URL path using pathMapping.
          </p>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>&lt;!-- Auto generate from current path --&gt;</code></pre>
            <pre data-prefix="2"><code>&lt;BaseBreadcrumbs /&gt;</code></pre>
          </div>
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>items?: BreadcrumbItem[]</code> - Manual breadcrumb items</div>
          </div>
        </div>
      </div>
    </div>

    <!-- BasePageHeader Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BasePageHeader Component</h3>
            <p class="text-sm">Comprehensive page header with title, description, breadcrumbs, actions, and stats display.</p>
          </div>
        </div>

        <!-- PageHeader Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="document-text" size="sm" />
            Basic Page Header
          </h3>
          <BasePageHeader
            title="Example Page"
            code="EX-001"
            description="This is an example page header with title, code, and description."
            :breadcrumbs="[
              { label: 'Home', to: '/', icon: 'home' },
              { label: 'Admin', to: '/admin', icon: 'cog-6-tooth' },
              { label: 'Examples' }
            ]"
          />
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>title: string</code> - Page title</div>
            <div><code>code?: string</code> - Page code/identifier</div>
            <div><code>description?: string</code> - Page description</div>
            <div><code>breadcrumbs?: BreadcrumbItem[]</code> - Breadcrumb items</div>
          </div>
        </div>
      </div>
    </div>

    <!-- BaseModal Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseModal Component</h3>
            <p class="text-sm">Modal dialog component with size variants, backdrop control, and slot support for content and actions.</p>
          </div>
        </div>

        <!-- Modal Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="window" size="sm" />
            Modal Examples
          </h3>
          <div class="flex flex-wrap gap-2">
            <BaseButton label="Basic Modal" variant="primary" size="sm" @click="modalDemo.showBasic = true" />
            <BaseButton label="Large Modal" variant="secondary" size="sm" @click="modalDemo.showLarge = true" />
            <BaseButton label="With Actions" variant="accent" size="sm" @click="modalDemo.showWithActions = true" />
          </div>
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>visible: boolean</code> - Modal visibility (v-model)</div>
            <div><code>title?: string</code> - Modal title</div>
            <div><code>size?: 'sm' | 'md' | 'lg' | 'xl'</code> - Modal size</div>
            <div><code>closeable?: boolean</code> - Show close button</div>
            <div><code>backdropClose?: boolean</code> - Close on backdrop click</div>
          </div>
        </div>
      </div>
    </div>

    <!-- BaseLoading Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseLoading Component</h3>
            <p class="text-sm">Loading overlay with various spinner types, customizable messages, and size options.</p>
          </div>
        </div>

        <!-- Loading Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="arrow-path" size="sm" />
            Loading Examples
          </h3>
          <div class="flex flex-wrap gap-2">
            <BaseButton label="Basic Loading" variant="primary" size="sm" @click="showLoadingDemo('basic')" />
            <BaseButton label="Custom Message" variant="secondary" size="sm" @click="showLoadingDemo('custom-message')" />
            <BaseButton label="Dots Spinner" variant="accent" size="sm" @click="showLoadingDemo('dots')" />
            <BaseButton label="Ring Spinner" variant="info" size="sm" @click="showLoadingDemo('ring')" />
          </div>
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>message?: string</code> - Loading message</div>
            <div><code>spinner?: 'default' | 'dots' | 'ring'</code> - Spinner type</div>
            <div><code>size?: 'sm' | 'md' | 'lg'</code> - Spinner size</div>
          </div>
        </div>
      </div>
    </div>

    <!-- BaseThemeToggle Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseThemeToggle Component</h3>
            <p class="text-sm">Theme switching component with support for light and dark modes, configurable appearance and accessibility features.</p>
          </div>
        </div>

        <!-- Theme Toggle Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="sun" size="sm" />
            Theme Toggle Variants
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <!-- Basic Toggle -->
            <div class="text-center space-y-2">
              <p class="text-xs font-medium">Basic</p>
              <BaseThemeToggle />
            </div>
            
            <!-- Circle Toggle -->
            <div class="text-center space-y-2">
              <p class="text-xs font-medium">Circle</p>
              <BaseThemeToggle shape="circle" variant="primary" />
            </div>
            
            <!-- With Label -->
            <div class="text-center space-y-2">
              <p class="text-xs font-medium">With Label</p>
              <BaseThemeToggle show-label variant="outline" />
            </div>
            
            <!-- With Badge -->
            <div class="text-center space-y-2">
              <p class="text-xs font-medium">With Badge</p>
              <BaseThemeToggle show-badge shape="circle" variant="secondary" />
            </div>
          </div>
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'</code></div>
            <div><code>size?: 'xs' | 'sm' | 'md' | 'lg'</code></div>
            <div><code>shape?: 'default' | 'circle' | 'square'</code></div>
            <div><code>showLabel?: boolean</code> - Show text label</div>
            <div><code>showBadge?: boolean</code> - Show theme badge</div>
            <div><code>@change: (theme) => void</code> - Theme change event</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// Props from parent component
const props = defineProps({
  modalDemo: {
    type: Object,
    required: true
  },
  showLoadingDemo: {
    type: Function,
    required: true
  }
})
</script>