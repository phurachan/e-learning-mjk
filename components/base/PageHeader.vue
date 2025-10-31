<template>
  <div class="page-header">
    <!-- Main Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div class="flex-1">
        <!-- Page Title with optional code -->
        <div class="flex items-end gap-3 mb-2">
          <h1 class="text-2xl sm:text-3xl font-bold text-base-content">
            {{ title }}
          </h1>
          <div v-if="code" class="badge badge-primary badge-outline font-mono text-xs mb-1">
            {{ code }}
          </div>
        </div>
        
        <!-- Page Description -->
        <p v-if="description" class="text-base-content/70 text-sm sm:text-base max-w-2xl">
          {{ description }}
        </p>
      </div>
      
      <!-- Action Buttons Slot -->
      <div v-if="$slots.actions" class="flex-shrink-0">
        <slot name="actions" />
      </div>
    </div>
    
    <!-- Breadcrumb Section -->
    <div v-if="breadcrumbs && breadcrumbs.length > 0" class="breadcrumbs text-sm mb-4">
      <ul>
        <li v-for="(breadcrumb, index) in breadcrumbs" :key="index">
          <NuxtLink 
            v-if="breadcrumb.to && index < breadcrumbs.length - 1" 
            :to="breadcrumb.to"
            class="hover:text-primary transition-colors"
          >
            <BaseIcon v-if="breadcrumb.icon" :name="breadcrumb.icon" size="sm" class="mr-1" />
            {{ breadcrumb.label }}
          </NuxtLink>
          <span v-else class="text-base-content/70">
            <BaseIcon v-if="breadcrumb.icon" :name="breadcrumb.icon" size="sm" class="mr-1" />
            {{ breadcrumb.label }}
          </span>
        </li>
      </ul>
    </div>
    
    <!-- Stats Section (optional) -->
    <div v-if="stats && stats.length > 0" class="stats stats-horizontal lg:stats-horizontal shadow mb-6">
      <div v-for="stat in stats" :key="stat.title" class="stat">
        <div v-if="stat.icon" class="stat-figure text-primary">
          <BaseIcon :name="stat.icon" size="lg" />
        </div>
        <div class="stat-title">{{ stat.title }}</div>
        <div class="stat-value" :class="stat.valueClass">{{ stat.value }}</div>
        <div v-if="stat.desc" class="stat-desc" :class="stat.descClass">{{ stat.desc }}</div>
      </div>
    </div>
    
    <!-- Additional Content Slot -->
    <div v-if="$slots.default">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Breadcrumb {
  label: string
  to?: string
  icon?: string
}

interface Stat {
  title: string
  value: string | number
  desc?: string
  icon?: string
  valueClass?: string
  descClass?: string
}

interface Props {
  title: string
  code?: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  stats?: Stat[]
}

withDefaults(defineProps<Props>(), {
  breadcrumbs: () => [],
  stats: () => []
})
</script>