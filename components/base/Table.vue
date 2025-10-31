<template>
  <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 my-2">
    <table class="table" :class="tableClasses">
      <!-- Table Header -->
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :class="getColumnClasses(column)">
            <div class="flex items-center gap-2">
              <BaseIcon v-if="column.icon" :name="column.icon" size="sm" />
              <span>{{ column.label }}</span>
              <div v-if="column.sortable" class="flex flex-col">
                <BaseIcon 
                  name="chevron-up" 
                  size="xs" 
                  :class="{ 'text-primary': sortBy === column.key && sortOrder === 'asc' }"
                  class="cursor-pointer hover:text-primary"
                  @click="handleSort(column.key, 'asc')"
                />
                <BaseIcon 
                  name="chevron-down" 
                  size="xs"
                  :class="{ 'text-primary': sortBy === column.key && sortOrder === 'desc' }"
                  class="cursor-pointer hover:text-primary -mt-1"
                  @click="handleSort(column.key, 'desc')"
                />
              </div>
            </div>
          </th>
          <th v-if="hasActions" class="text-center">Actions</th>
        </tr>
      </thead>
      
      <!-- Table Body -->
      <tbody>
        <!-- Loading State -->
        <tr v-if="loading">
          <td :colspan="totalColumns" class="text-center py-8">
            <div class="flex items-center justify-center gap-3">
              <span class="loading loading-spinner loading-md"></span>
              <span>{{ loadingText }}</span>
            </div>
          </td>
        </tr>
        
        <!-- Empty State -->
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="totalColumns" class="text-center py-8 text-base-content/60">
            <div class="flex flex-col items-center gap-3">
              <BaseIcon v-if="emptyIcon" :name="emptyIcon" size="xl" class="text-base-content/30" />
              <div>
                <div class="font-medium">{{ emptyTitle }}</div>
                <div class="text-sm text-base-content/50">{{ emptyText }}</div>
              </div>
            </div>
          </td>
        </tr>
        
        <!-- Data Rows -->
        <tr 
          v-else 
          v-for="(row, index) in data" 
          :key="getRowKey(row, index)"
          :class="getRowClasses(row, index)"
          @click="handleRowClick(row, index)"
        >
          <td v-for="column in columns" :key="column.key" :class="getColumnClasses(column)">
            <!-- Custom slot for column -->
            <slot 
              v-if="$slots[column.key]" 
              :name="column.key" 
              :row="row" 
              :value="getValue(row, column.key)"
              :index="index"
            />
            <!-- Default cell content -->
            <span v-else>{{ formatValue(getValue(row, column.key), column) }}</span>
          </td>
          
          <!-- Actions Column -->
          <td v-if="hasActions" class="text-center">
            <slot name="actions" :row="row" :index="index">
              <div class="flex items-center justify-center gap-1">
                <BaseButton
                  v-if="showEdit"
                  size="sm"
                  variant="ghost"
                  icon-left="pencil"
                  @click.stop="$emit('edit', row, index)"
                />
                <BaseButton
                  v-if="showDelete"
                  size="sm"
                  variant="ghost"
                  icon-left="trash"
                  class="text-error hover:text-error"
                  @click.stop="$emit('delete', row, index)"
                />
              </div>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'

interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  icon?: string
  format?: 'text' | 'number' | 'date' | 'currency' | 'badge'
  badgeVariant?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
}

interface Props {
  data?: any[]
  columns: TableColumn[]
  loading?: boolean
  loadingText?: string
  emptyTitle?: string
  emptyText?: string
  emptyIcon?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  rowKey?: string
  clickableRows?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  showEdit?: boolean
  showDelete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  loadingText: 'Loading...',
  emptyTitle: 'No data found',
  emptyText: 'There are no items to display',
  emptyIcon: 'inbox',
  size: 'md',
  striped: false,
  hoverable: true,
  compact: false,
  rowKey: 'id',
  clickableRows: false,
  showEdit: true,
  showDelete: true
})

const emits = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc']
  rowClick: [row: any, index: number]
  edit: [row: any, index: number]
  delete: [row: any, index: number]
}>()

// Reactive data
const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Computed properties
const tableClasses = computed(() => {
  const classes = []
  
  // Size classes
  const sizeClasses = {
    xs: 'table-xs',
    sm: 'table-sm',
    md: '',
    lg: 'table-lg'
  }
  if (sizeClasses[props.size]) {
    classes.push(sizeClasses[props.size])
  }
  
  // Style classes
  if (props.striped) classes.push('table-zebra')
  if (props.compact) classes.push('table-compact')
  
  return classes
})

const totalColumns = computed(() => {
  return props.columns.length + (hasActions.value ? 1 : 0)
})

const hasActions = computed(() => {
  return props.showEdit || props.showDelete || Boolean(slots?.actions)
})

// Methods
const getValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const formatValue = (value: any, column: TableColumn) => {
  if (value == null) return ''
  
  switch (column.format) {
    case 'number':
      return Number(value).toLocaleString()
    case 'date':
      return new Date(value).toLocaleDateString()
    case 'currency':
      return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB'
      }).format(value)
    default:
      return String(value)
  }
}

const getRowKey = (row: any, index: number) => {
  return getValue(row, props.rowKey) || index
}

const getRowClasses = (row: any, index: number) => {
  const classes = []
  
  if (props.hoverable && (props.clickableRows || hasActions.value)) {
    classes.push('hover')
  }
  
  if (props.clickableRows) {
    classes.push('cursor-pointer')
  }
  
  return classes
}

const getColumnClasses = (column: TableColumn) => {
  const classes = []
  
  if (column.width) {
    classes.push(`w-${column.width}`)
  }
  
  if (column.align === 'center') {
    classes.push('text-center')
  } else if (column.align === 'right') {
    classes.push('text-right')
  }
  
  return classes
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortBy.value = key
  sortOrder.value = order
  emits('sort', key, order)
}

const handleRowClick = (row: any, index: number) => {
  if (props.clickableRows) {
    emits('rowClick', row, index)
  }
}

// Expose slots for checking
const slots = useSlots()
</script>