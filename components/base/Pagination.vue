<template>
  <!-- Full width layout with info -->
  <div v-if="showInfo" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <!-- Info text (left side) -->
    <div class="text-sm text-base-content/70 order-2 sm:order-1">
      {{ displayInfoText }}
    </div>
    
    <!-- Pagination controls (right side) -->
    <div class="join order-1 sm:order-2">
      <!-- First Page Button -->
      <button
        v-if="showFirstLast"
        :class="firstButtonClasses"
        :disabled="disabled || currentPage === 1"
        @click="goToPage(1)"
      >
        <BaseIcon name="chevron-double-left" size="sm" />
      </button>

      <!-- Previous Page Button -->
      <button
        v-if="showPrevNext"
        :class="prevButtonClasses"
        :disabled="disabled || currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <BaseIcon name="chevron-left" size="sm" />
      </button>

      <!-- Page Number Buttons -->
      <button
        v-for="page in visiblePages"
        :key="page"
        :class="getPageButtonClasses(page)"
        :disabled="disabled"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <!-- Next Page Button -->
      <button
        v-if="showPrevNext"
        :class="nextButtonClasses"
        :disabled="disabled || currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <BaseIcon name="chevron-right" size="sm" />
      </button>

      <!-- Last Page Button -->
      <button
        v-if="showFirstLast"
        :class="lastButtonClasses"
        :disabled="disabled || currentPage === totalPages"
        @click="goToPage(totalPages)"
      >
        <BaseIcon name="chevron-double-right" size="sm" />
      </button>
    </div>
  </div>

  <!-- Simple centered layout (original) -->
  <div v-else class="join">
    <!-- First Page Button -->
    <button
      v-if="showFirstLast"
      :class="firstButtonClasses"
      :disabled="disabled || currentPage === 1"
      @click="goToPage(1)"
    >
      <BaseIcon name="chevron-double-left" size="sm" />
    </button>

    <!-- Previous Page Button -->
    <button
      v-if="showPrevNext"
      :class="prevButtonClasses"
      :disabled="disabled || currentPage === 1"
      @click="goToPage(currentPage - 1)"
    >
      <BaseIcon name="chevron-left" size="sm" />
    </button>

    <!-- Page Number Buttons -->
    <button
      v-for="page in visiblePages"
      :key="page"
      :class="getPageButtonClasses(page)"
      :disabled="disabled"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>

    <!-- Next Page Button -->
    <button
      v-if="showPrevNext"
      :class="nextButtonClasses"
      :disabled="disabled || currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
    >
      <BaseIcon name="chevron-right" size="sm" />
    </button>

    <!-- Last Page Button -->
    <button
      v-if="showFirstLast"
      :class="lastButtonClasses"
      :disabled="disabled || currentPage === totalPages"
      @click="goToPage(totalPages)"
    >
      <BaseIcon name="chevron-double-right" size="sm" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BasePaginationProps } from '~/composables/component_models/form'

interface Props extends BasePaginationProps {}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showFirstLast: true,
  showPrevNext: true,
  maxPages: 7,
  disabled: false,
  showInfo: true,
  perPage: 10,
  totalItems: 0,
  currentPage: 1
})

const $emit = defineEmits<{
  'update:currentPage': [page: number]
  change: [page: number]
}>()

// Base button classes
const baseButtonClasses = computed(() => {
  const classes = ['join-item', 'btn']
  
  // Size classes
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }
  
  if (sizeClasses[props.size]) {
    classes.push(sizeClasses[props.size])
  }
  
  return classes
})

// Navigation button classes (first, prev, next, last)
const firstButtonClasses = computed(() => [...baseButtonClasses.value])
const prevButtonClasses = computed(() => [...baseButtonClasses.value])
const nextButtonClasses = computed(() => [...baseButtonClasses.value])
const lastButtonClasses = computed(() => [...baseButtonClasses.value])

// Page button classes with active state
const getPageButtonClasses = (page: number) => {
  const classes = [...baseButtonClasses.value]
  
  if (page === props.currentPage) {
    classes.push('btn-active')
  }
  
  return classes.join(' ')
}

// Calculate visible pages
const visiblePages = computed(() => {
  if (totalPages.value <= props.maxPages) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1)
  }
  
  const half = Math.floor(props.maxPages / 2)
  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(totalPages.value, start + props.maxPages - 1)
  
  // Adjust start if we're near the end
  if (end - start + 1 < props.maxPages) {
    start = Math.max(1, end - props.maxPages + 1)
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Calculate total pages
const totalPages = computed(() => {
  if (!props.totalItems || props.totalItems <= 0) {
    return 1
  }
  return Math.ceil(props.totalItems / props.perPage)
})

// Calculate info text
const displayInfoText = computed(() => {
  if (props.infoText) {
    return props.infoText
  }
  
  if (!props.totalItems || props.totalItems <= 0) {
    return ''
  }
  
  const startItem = (props.currentPage - 1) * props.perPage + 1
  const endItem = Math.min(props.currentPage * props.perPage, props.totalItems)
  
  return `แสดง ${startItem} ถึง ${endItem} จาก ${props.totalItems} รายการ`
})

// Go to specific page
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage || props.disabled) {
    return
  }
  
  $emit('update:currentPage', page)
  $emit('change', page)
}
</script>