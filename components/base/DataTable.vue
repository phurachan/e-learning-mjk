<template>
  <div class="overflow-x-auto">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <span class="loading loading-spinner loading-md"></span>
      <span class="ml-2">กำลังโหลดข้อมูล...</span>
    </div>

    <!-- Data Table -->
    <table v-else :class="tableClasses">
      <!-- Table Header -->
      <thead>
        <tr>
          <!-- Expand/Collapse All Column -->
          <th v-if="expandable" class="w-12">
            <button
              v-if="hasExpandableRows"
              class="btn btn-ghost btn-xs"
              @click="toggleAllExpanded"
            >
              <BaseIcon
                :name="allExpanded ? 'chevron-up' : 'chevron-down'"
                size="sm"
              />
            </button>
          </th>

          <!-- Selection Column -->
          <th v-if="selectable" class="w-12">
            <input
              v-if="multiSelect"
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="allSelected"
              :indeterminate="someSelected && !allSelected"
              @change="toggleAllSelected"
            />
          </th>

          <!-- Data Columns -->
          <th
            v-for="field in visibleFields"
            :key="field.key"
            :class="getHeaderClass(field)"
            :style="field.width ? { width: field.width } : {}"
          >
            <div class="flex items-center gap-2">
              {{ field.label }}
              <button
                v-if="field.sortable"
                class="btn btn-ghost btn-xs p-1 ml-1"
                @click.stop="toggleSort(field.key)"
              >
                <BaseIcon
                  v-if="sortField === field.key && sortDirection === 'asc'"
                  name="chevron-up"
                  size="xs"
                  class="text-primary"
                />
                <BaseIcon
                  v-else-if="sortField === field.key && sortDirection === 'desc'"
                  name="chevron-down"
                  size="xs"
                  class="text-primary"
                />
                <BaseIcon
                  v-else
                  name="arrows-up-down"
                  size="xs"
                  class="opacity-50 hover:opacity-100"
                />
              </button>
            </div>
          </th>
        </tr>
      </thead>

      <!-- Table Body -->
      <tbody>
        <template v-if="processedData.length === 0">
          <tr>
            <td :colspan="totalColumns" class="text-center py-8 text-base-content/50">
              {{ emptyText }}
            </td>
          </tr>
        </template>

        <template v-else>
          <template v-for="(row, index) in processedData" :key="getRowKey(row, index)">
            <!-- Main Row -->
            <tr :class="getRowClass(row, index)" @click="handleRowClick(row)">
              <!-- Expand/Collapse Cell -->
              <td v-if="expandable" class="text-center">
                <button
                  v-if="row.children && row.children.length > 0"
                  class="btn btn-ghost btn-xs"
                  @click.stop="toggleRowExpanded(row)"
                >
                  <BaseIcon
                    :name="row._expanded ? 'chevron-up' : 'chevron-down'"
                    size="sm"
                  />
                </button>
              </td>

              <!-- Selection Cell -->
              <td v-if="selectable" class="text-center">
                <input
                  v-if="!row._disabled"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :checked="row._selected"
                  @click.stop
                  @change="toggleRowSelected(row)"
                />
              </td>

              <!-- Data Cells -->
              <td
                v-for="field in visibleFields"
                :key="field.key"
                :class="getCellClass(field)"
              >
                <component
                  :is="getCellComponent(field, row)"
                  v-bind="getCellProps(field, row)"
                />
              </td>
            </tr>

            <!-- Children Rows -->
            <template v-if="expandable && row._expanded && row.children">
              <template v-for="(child, childIndex) in row.children" :key="`${getRowKey(row, index)}-child-${childIndex}`">
                <tr :class="getChildRowClass(child, childIndex)" @click="handleRowClick(child)">
                  <!-- Expand/Collapse Cell -->
                  <td v-if="expandable" class="text-center">
                    <div class="ml-6">
                      <button
                        v-if="child.children && child.children.length > 0"
                        class="btn btn-ghost btn-xs"
                        @click.stop="toggleRowExpanded(child)"
                      >
                        <BaseIcon
                          :name="child._expanded ? 'chevron-up' : 'chevron-down'"
                          size="sm"
                        />
                      </button>
                    </div>
                  </td>

                  <!-- Selection Cell -->
                  <td v-if="selectable" class="text-center">
                    <input
                      v-if="!child._disabled"
                      type="checkbox"
                      class="checkbox checkbox-sm"
                      :checked="child._selected"
                      @click.stop
                      @change="toggleRowSelected(child)"
                    />
                  </td>

                  <!-- Data Cells -->
                  <td
                    v-for="field in visibleFields"
                    :key="field.key"
                    :class="getCellClass(field)"
                  >
                    <div class="ml-6">
                      <component
                        :is="getCellComponent(field, child)"
                        v-bind="getCellProps(field, child)"
                      />
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BaseDataTableProps, DataTableField, DataTableRow } from '~/composables/component_models/form'

interface Props extends BaseDataTableProps {}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  selectable: false,
  multiSelect: false,
  expandable: false,
  loading: false,
  emptyText: 'ไม่มีข้อมูล',
  size: 'md',
  striped: true,
  bordered: true,
  hover: true
})

const $emit = defineEmits<{
  'row-click': [row: DataTableRow]
  'selection-change': [selectedRows: DataTableRow[]]
  'expand-change': [row: DataTableRow, expanded: boolean]
  'sort-change': [field: string, direction: 'asc' | 'desc' | null]
}>()

// Internal state
const sortField = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc' | null>(null)

// Computed properties
const visibleFields = computed(() => 
  props.fields.filter(field => !field.hidden)
)

const totalColumns = computed(() => {
  let count = visibleFields.value.length
  if (props.expandable) count++
  if (props.selectable) count++
  return count
})

const tableClasses = computed(() => {
  const classes = ['table', 'w-full']
  
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
  if (props.hover) classes.push('table-hover')
  
  return classes.join(' ')
})

// Process data with sorting
const processedData = computed(() => {
  let data = [...props.data]
  
  // Apply sorting if active
  if (sortField.value && sortDirection.value) {
    data.sort((a, b) => {
      const aValue = a[sortField.value!]
      const bValue = b[sortField.value!]
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortDirection.value === 'asc' ? 1 : -1
      if (bValue == null) return sortDirection.value === 'asc' ? -1 : 1
      
      // Compare values
      let result = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        result = aValue - bValue
      } else {
        result = String(aValue).localeCompare(String(bValue))
      }
      
      return sortDirection.value === 'asc' ? result : -result
    })
  }
  
  return data
})

// Selection logic - use original data for consistency
const selectedRows = computed(() => 
  props.data.filter(row => row._selected)
)

const allSelected = computed(() => 
  props.data.length > 0 && 
  props.data.every(row => row._selected || row._disabled)
)

const someSelected = computed(() => 
  props.data.some(row => row._selected)
)

// Expansion logic - use original data
const hasExpandableRows = computed(() =>
  props.data.some(row => row.children && row.children.length > 0)
)

const allExpanded = computed(() =>
  props.data.every(row => 
    !row.children || row.children.length === 0 || row._expanded
  )
)

// Methods
const getRowKey = (row: DataTableRow, index: number): string => {
  return row[props.rowKey] || index.toString()
}

const getHeaderClass = (field: DataTableField): string => {
  const classes = []
  
  if (field.align === 'center') classes.push('text-center')
  else if (field.align === 'right') classes.push('text-right')
  
  if (field.sortable) classes.push('cursor-pointer select-none')
  
  return classes.join(' ')
}

const getRowClass = (row: DataTableRow, index: number): string => {
  const classes = []
  
  if (row._selected) classes.push('bg-primary/10')
  if (row._disabled) classes.push('opacity-50')
  else classes.push('cursor-pointer', 'hover:bg-base-100') // Add hover effect for main rows
  
  return classes.join(' ')
}

const getChildRowClass = (row: DataTableRow, index: number): string => {
  const classes = ['bg-gradient-to-r', 'from-base-200/60', 'to-base-200/40', 'border-l-4', 'border-l-base-300'] // Distinct gradient background for children
  
  if (row._selected) classes.push('!bg-gradient-to-r', '!from-primary/15', '!to-primary/10', '!border-l-primary') // Stronger highlight for selected children
  if (row._disabled) classes.push('opacity-50')
  else classes.push('cursor-pointer', 'hover:from-base-200/80', 'hover:to-base-200/60') // Add hover effect for children
  
  return classes.join(' ')
}

const getCellClass = (field: DataTableField): string => {
  const classes = []
  
  if (field.align === 'center') classes.push('text-center')
  else if (field.align === 'right') classes.push('text-right')
  
  return classes.join(' ')
}

const getCellComponent = (field: DataTableField, row: DataTableRow): any => {
  if (field.formatter) {
    return 'span'
  }
  
  switch (field.type) {
    case 'boolean':
      return 'input'
    default:
      return 'span'
  }
}

const getCellProps = (field: DataTableField, row: DataTableRow): any => {
  const value = row[field.key]
  
  if (field.formatter) {
    return {
      innerHTML: field.formatter(value, row)
    }
  }
  
  switch (field.type) {
    case 'boolean':
      return {
        type: 'checkbox',
        class: 'checkbox checkbox-sm',
        checked: !!value,
        disabled: true
      }
    case 'number':
      return {
        textContent: typeof value === 'number' ? value.toLocaleString() : value
      }
    case 'date':
      return {
        textContent: value ? new Date(value).toLocaleDateString('th-TH') : '-'
      }
    default:
      return {
        textContent: value || '-'
      }
  }
}

// Event handlers
const handleRowClick = (row: DataTableRow) => {
  if (!props.selectable) {
    $emit('row-click', row)
    return
  }
  
  if (!props.multiSelect) {
    // Single select mode
    props.data.forEach(r => {
      r._selected = false
      // Also clear children selection
      if (r.children) {
        r.children.forEach(child => child._selected = false)
      }
    })
    row._selected = true
    $emit('selection-change', [row])
  }
  
  $emit('row-click', row)
}

const toggleRowSelected = (row: DataTableRow) => {
  row._selected = !row._selected
  $emit('selection-change', selectedRows.value)
}

const toggleAllSelected = () => {
  const newState = !allSelected.value
  props.data.forEach(row => {
    if (!row._disabled) {
      row._selected = newState
    }
  })
  $emit('selection-change', selectedRows.value)
}

const toggleRowExpanded = (row: DataTableRow) => {
  row._expanded = !row._expanded
  $emit('expand-change', row, row._expanded)
}

const toggleAllExpanded = () => {
  const newState = !allExpanded.value
  props.data.forEach(row => {
    if (row.children && row.children.length > 0) {
      row._expanded = newState
    }
  })
}

const toggleSort = (fieldKey: string) => {
  if (sortField.value === fieldKey) {
    // Cycle through: asc -> desc -> null
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
      $emit('sort-change', fieldKey, 'desc')
    } else if (sortDirection.value === 'desc') {
      sortDirection.value = null
      sortField.value = null
      $emit('sort-change', '', null)
    }
  } else {
    sortField.value = fieldKey
    sortDirection.value = 'asc'
    $emit('sort-change', fieldKey, 'asc')
  }
}
</script>