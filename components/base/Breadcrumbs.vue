<template>
  <div class="breadcrumbs text-sm">
    <ul>
      <li v-for="(item, index) in breadcrumbItems" :key="index">
        <!-- Clickable breadcrumb item -->
        <NuxtLink 
          v-if="item.to && index < breadcrumbItems.length - 1"
          :to="item.to"
          :class="item.class || 'text-primary font-medium hover:text-primary-focus'"
        >
          {{ item.label }}
        </NuxtLink>
        
        <!-- Non-clickable breadcrumb item (current page) -->
        <span 
          v-else
          :class="item.class || (index === breadcrumbItems.length - 1 ? 'text-base-content/70' : 'text-primary font-medium')"
        >
          {{ item.label }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePathMappingStore } from '~/stores/pathMapping'
import type { BreadcrumbItem } from '~/composables/component_models/base'

interface Props {
  items?: BreadcrumbItem[]
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()
const pathMappingStore = usePathMappingStore()

const breadcrumbItems = computed(() => {
  // If items are provided manually, use them
  if (props.items && props.items.length > 0) {
    return props.items
  }
  
  // Try to generate from Nuxt routes first
  const routes = router.getRoutes()
  const matchedRoute = routes.find(r => r.path === route.path)
  
  if (matchedRoute?.meta?.breadcrumb) {
    // If route has breadcrumb meta, use it
    return matchedRoute.meta.breadcrumb as BreadcrumbItem[]
  }
  
  // Auto-generate from path using Pinia store
  const pathSegments = route.path.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []
  
  let currentPath = ''
  let currentMapping = pathMappingStore.mapping
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    if (currentMapping && currentMapping[segment]) {
      items.push({
        label: currentMapping[segment].label || segment,
        to: index < pathSegments.length - 1 ? currentPath : undefined
      })
      currentMapping = currentMapping[segment].children || {}
    } else {
      // Fallback to formatted segment name if not in mapping
      items.push({
        label: pathMappingStore.formatLabel(segment),
        to: index < pathSegments.length - 1 ? currentPath : undefined
      })
      currentMapping = {}
    }
  })
  
  return items
})
</script>