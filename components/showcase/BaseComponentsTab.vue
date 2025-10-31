<template>
  <div class="space-y-8">

    <!-- BaseIcon Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseIcon Component</h3>
            <p class="text-sm">Standardized icon component using Heroicons with consistent sizing and variants.</p>
          </div>
        </div>

        <!-- Size Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Icon Sizes
          </h3>
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <BaseIcon name="heart" size="xs" class="text-error" />
              <code class="text-xs">xs</code>
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="heart" size="sm" class="text-error" />
              <code class="text-xs">sm</code>
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="heart" size="md" class="text-error" />
              <code class="text-xs">md</code>
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="heart" size="lg" class="text-error" />
              <code class="text-xs">lg</code>
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="heart" size="xl" class="text-error" />
              <code class="text-xs">xl</code>
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="heart" size="2xl" class="text-error" />
              <code class="text-xs">2xl</code>
            </div>
          </div>
        </div>

        <!-- Variant Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="swatch" size="sm" />
            Icon Variants
          </h3>
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2">
              <BaseIcon name="star" variant="outline" size="lg" class="text-warning" />
              <code class="text-xs">outline</code>
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="star" variant="solid" size="lg" class="text-warning" />
              <code class="text-xs">solid</code>
            </div>
            <div class="flex items-center gap-2">
              <BaseIcon name="star" variant="mini" size="lg" class="text-warning" />
              <code class="text-xs">mini</code>
            </div>
          </div>
        </div>

        <!-- Usage Code -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="code-bracket" size="sm" />
            Usage Examples
          </h3>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>&lt;BaseIcon name="user" /&gt;</code></pre>
            <pre data-prefix="2"><code>&lt;BaseIcon name="heart" variant="solid" size="lg" class="text-error" /&gt;</code></pre>
            <pre data-prefix="3"><code>&lt;BaseIcon name="chevron-right" variant="mini" size="sm" /&gt;</code></pre>
          </div>
        </div>

        <!-- Props Documentation -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="adjustments-horizontal" size="sm" />
            Props
          </h3>
          <div class="text-xs space-y-1">
            <div><code>name: string</code> - HeroIcon name (required)</div>
            <div><code>variant?: 'outline' | 'solid' | 'mini'</code> - Icon style</div>
            <div><code>size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'</code> - Icon size</div>
          </div>
        </div>
      </div>
    </div>

    <!-- BaseButton Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseButton Component</h3>
            <p class="text-sm">Flexible button component with loading states, icons, and comprehensive DaisyUI styling options.</p>
          </div>
        </div>

        <!-- Button Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="cursor-arrow-ripple" size="sm" />
            Button Examples
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium mb-3">Basic Variants:</p>
              <div class="flex flex-wrap gap-2">
                <BaseButton label="Default Button" />
                <BaseButton label="Primary Button" variant="primary" />
                <BaseButton label="Success Button" variant="success" />
                <BaseButton label="Warning Button" variant="warning" />
              </div>
            </div>
            <div>
              <p class="text-sm font-medium mb-3">With Icons & States:</p>
              <div class="flex flex-wrap gap-2">
                <BaseButton label="Save" variant="primary" icon-left="check" />
                <BaseButton label="Delete" variant="error" icon-left="trash" />
                <BaseButton label="Loading..." variant="primary" :loading="true" />
                <BaseButton label="Disabled" :disabled="true" />
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Code -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="code-bracket" size="sm" />
            Usage Examples
          </h3>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>&lt;BaseButton label="Click Me" /&gt;</code></pre>
            <pre data-prefix="2"><code>&lt;BaseButton variant="primary" icon-left="save" /&gt;</code></pre>
            <pre data-prefix="3"><code>&lt;BaseButton :loading="isLoading" loadingText="Saving..." /&gt;</code></pre>
          </div>
        </div>
      </div>
    </div>


    <!-- BaseAlert Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseAlert Component</h3>
            <p class="text-sm">Alert notification system with success, error, warning, info, and confirm dialog support.</p>
          </div>
        </div>

        <!-- Alert Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="bell" size="sm" />
            Alert Examples
          </h3>
          <div class="flex flex-wrap gap-2">
            <BaseButton label="Show Success" variant="success" size="sm" @click="alertDemo.showSuccess = true" />
            <BaseButton label="Show Error" variant="error" size="sm" @click="alertDemo.showError = true" />
            <BaseButton label="Show Warning" variant="warning" size="sm" @click="alertDemo.showWarning = true" />
            <BaseButton label="Show Confirm" variant="info" size="sm" @click="alertDemo.showConfirm = true" />
          </div>
          <div v-if="alertDemo.confirmResult" class="mt-3 text-sm">
            ผลลัพธ์: {{ alertDemo.confirmResult }}
          </div>
        </div>

        <!-- Usage Code -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="code-bracket" size="sm" />
            Usage Examples
          </h3>
          <div class="mockup-code text-sm">
            <pre data-prefix="1"><code>&lt;BaseAlert</code></pre>
            <pre data-prefix="2"><code>  v-model:visible="showAlert"</code></pre>
            <pre data-prefix="3"><code>  type="success"</code></pre>
            <pre data-prefix="4"><code>  title="สำเร็จ!"</code></pre>
            <pre data-prefix="5"><code>  message="บันทึกข้อมูลเรียบร้อยแล้ว"</code></pre>
            <pre data-prefix="6"><code>/&gt;</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- BaseAvatar Component -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="alert alert-info">
          <BaseIcon name="information-circle" size="md" />
          <div>
            <h3 class="font-semibold">BaseAvatar Component</h3>
            <p class="text-sm">Flexible avatar component with image support, initials display, badges, online status, and customizable appearance.</p>
          </div>
        </div>

        <!-- Avatar Examples -->
        <div class="bg-base-200 rounded-lg p-4">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <BaseIcon name="user-circle" size="sm" />
            Avatar Examples
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <!-- Size Examples -->
            <div class="space-y-3">
              <p class="text-xs font-medium">Sizes:</p>
              <div class="flex items-end gap-2">
                <BaseAvatar name="John Doe" size="xs" />
                <BaseAvatar name="Jane Smith" size="sm" />
                <BaseAvatar name="Bob Wilson" size="md" />
                <BaseAvatar name="Alice Brown" size="lg" />
              </div>
            </div>

            <!-- Shape Examples -->
            <div class="space-y-3">
              <p class="text-xs font-medium">Shapes:</p>
              <div class="flex items-center gap-2">
                <BaseAvatar name="Circle User" shape="circle" />
                <BaseAvatar name="Square User" shape="square" />
              </div>
            </div>

            <!-- Status Examples -->
            <div class="space-y-3">
              <p class="text-xs font-medium">Status:</p>
              <div class="flex items-center gap-2">
                <BaseAvatar name="Online User" :show-online="true" />
                <BaseAvatar name="Offline User" :show-offline="true" />
              </div>
            </div>

            <!-- Badge Examples -->
            <div class="space-y-3">
              <p class="text-xs font-medium">With Badges:</p>
              <div class="flex items-center gap-2">
                <BaseAvatar name="Admin User" badge="A" />
                <BaseAvatar name="VIP User" :badge="{ icon: 'star', variant: 'warning' }" />
              </div>
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
            <div><code>src?: string</code> - Image URL for avatar</div>
            <div><code>name?: string</code> - Display name (for initials)</div>
            <div><code>size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'</code> - Avatar size</div>
            <div><code>shape?: 'circle' | 'square'</code> - Avatar shape</div>
            <div><code>showOnline?: boolean</code> - Show online indicator</div>
            <div><code>showOffline?: boolean</code> - Show offline indicator</div>
            <div><code>badge?: string | number | Badge</code> - Badge display</div>
            <div><code>clickable?: boolean</code> - Enable click interaction</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props for demo data from parent
const props = defineProps({
  alertDemo: { type: Object, required: true }
})
</script>