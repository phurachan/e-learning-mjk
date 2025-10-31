<template>
  <div class="form-control w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error ml-1">*</span>
      </span>
    </label>
    
    <!-- Vue Datepicker -->
    <VueDatePicker
      v-model="dateValue"
      :id="inputId"
      :name="name"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :min-date="minDate"
      :max-date="maxDate"
      :mode-height="240"
      :enable-time-picker="enableTimePicker"
      :time-picker="timeOnly"
      :format="customDateFormatter"
      :preview-format="customDateFormatter"
      :locale="thaiLocale"
      :year-range="yearRange"
      :format-locale="formatLocale"
      :year-first="true"
      :dark="isDarkTheme"
      :class="wrapperClasses"
      :input-class-name="inputClasses"
      :calendar-class-name="calendarClasses"
      :day-class="dayClasses"
      :text-input="false"
      :cancel-text="cancelText"
      :select-text="selectText"
      :now-button-label="todayText"
      auto-apply
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      @update:model-value="handleDateChange"
      @time-update="handleDateChange"
    >
    <!-- Only keep the year slot that works -->
    <template #year="{ value }">
      {{ value + 543 }}
    </template>
    <template #year-overlay-value="{ value }">
      {{ value + 543 }}
    </template>
  </VueDatePicker>
    <!-- Helper text -->
    <label class="label" v-if="hint || error">
      <span class="label-text-alt" :class="{ 'text-error': error, 'text-gray-600': !error }">
        {{ error || hint }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
// Remove unused import
import type { BaseDatePickerProps, TimeObject } from '~/composables/component_models/form'

interface Props extends BaseDatePickerProps {}

const props = withDefaults(defineProps<Props>(), {
  type: 'date',
  size: 'md',
  variant: 'default'
})

const $emit = defineEmits<{
  'update:modelValue': [value: string | Date | TimeObject | null]
  blur: [event: Event]
  focus: [event: Event]
  change: [event: Event]
}>()

const inputId = props.id || useId()

// Import useTheme composable for dark theme detection
const { isDark: isDarkTheme } = useTheme()

// Convert modelValue to Date for VueDatePicker
const dateValue = computed({
  get() {
    if (!props.modelValue) return null
    if (props.type === 'time' && typeof props.modelValue === 'object' && 'hours' in props.modelValue) {
      return props.modelValue
    }
    if (props.modelValue instanceof Date) {
      return props.modelValue
    }
    if (typeof props.modelValue === 'string') {
      return new Date(props.modelValue)
    }
    return null
  },
  set(value: Date | TimeObject | null) {
    handleDateChange(value)
  }
})

// Convert min/max to Date objects
const minDate = computed(() => {
  return props.min ? new Date(props.min) : undefined
})

const maxDate = computed(() => {
  return props.max ? new Date(props.max) : undefined
})

// Determine picker configuration based on type
const enableTimePicker = computed(() => {
  return props.type === 'datetime-local'
})

const timeOnly = computed(() => {
  return props.type === 'time'
})

// Thai locale configuration
const thaiLocale = computed(() => 'th')

// Thai text labels
const cancelText = computed(() => 'ยกเลิก')
const selectText = computed(() => 'เลือก') 
const todayText = computed(() => 'วันนี้')

// Keep year range in Christian Era for internal logic
const yearRange = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 50, currentYear + 10]
})

// Custom format locale for Buddhist Era
const formatLocale = computed(() => ({
  name: 'th-TH-u-ca-buddhist',
  weekdays: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
  weekdaysShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  months: [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ],
  monthsShort: [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ]
}))


// Custom date formatter that converts year to Buddhist Era for display
const customDateFormatter = computed(() => {
  return (date: Date) => {
    if (!date) return ''
    
    const buddhistYear = date.getFullYear() + 543
    const month = formatLocale.value.months[date.getMonth()]
    const day = date.getDate()
    
    if (props.type === 'date') {
      return `${day} ${month} ${buddhistYear}`
    } else if (props.type === 'datetime-local') {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${day} ${month} ${buddhistYear} ${hours}:${minutes}`
    } else if (props.type === 'time') {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    
    return `${day} ${month} ${buddhistYear}`
  }
})


const handleDateChange = (value: any) => {
  // Convert value to proper type
  let dateValue: Date | string | TimeObject | null = null
  
  if (value) {
    if (value instanceof Date) {
      dateValue = value
    } else if (typeof value === 'object' && value.hours !== undefined) {
      // For time picker, keep the time object as-is
      if (props.type === 'time') {
        dateValue = value
      } else {
        // Handle time picker object { hours: 14, minutes: 30 } for datetime
        const today = new Date()
        today.setHours(value.hours || 0, value.minutes || 0, 0, 0)
        dateValue = today
      }
    } else if (typeof value === 'object' && (value.hours !== undefined || value.minutes !== undefined)) {
      // Handle partial time object
      if (props.type === 'time') {
        dateValue = value
      } else {
        const today = new Date()
        today.setHours(value.hours || 0, value.minutes || 0, 0, 0)
        dateValue = today
      }
    } else if (typeof value === 'string') {
      dateValue = value
    } else {
      // Try to convert to Date
      try {
        dateValue = new Date(value)
        if (isNaN(dateValue.getTime())) {
          dateValue = null
        }
      } catch {
        dateValue = null
      }
    }
  }
  
  $emit('update:modelValue', dateValue)
  // Emit change event for compatibility
  const event = new Event('change')
  $emit('change', event)
}

// Wrapper classes for the entire datepicker
const wrapperClasses = computed(() => {
  return 'w-full'
})

// Input classes following DaisyUI patterns
const inputClasses = computed(() => {
  const classes = ['input', 'w-full']
  
  // Size classes
  const sizeClasses = {
    xs: 'input-xs',
    sm: 'input-sm', 
    md: '', // default size
    lg: 'input-lg'
  }
  if (sizeClasses[props.size]) {
    classes.push(sizeClasses[props.size])
  }
  
  // Variant classes
  const variantClasses = {
    default: 'input-bordered',
    bordered: 'input-bordered',
    ghost: 'input-ghost',
    primary: 'input-primary input-bordered',
    secondary: 'input-secondary input-bordered',
    accent: 'input-accent input-bordered',
    info: 'input-info input-bordered',
    success: 'input-success input-bordered',
    warning: 'input-warning input-bordered',
    error: 'input-error input-bordered'
  }
  classes.push(variantClasses[props.variant])
  
  // Error state
  if (props.error && props.variant === 'default') {
    classes.push('input-error')
  }
  
  // Disabled state
  if (props.disabled) {
    classes.push('input-disabled')
  }
  
  return classes.join(' ')
})

// Calendar popup classes to match DaisyUI theme
const calendarClasses = computed(() => {
  return 'dp-custom-menu bg-base-100 border border-base-300 rounded-lg shadow-lg text-base-content'
})

// Day cell styling
const dayClasses = computed(() => {
  return (_date: Date, isCurrentMonth: boolean) => {
    const baseClasses = ['hover:bg-primary hover:text-primary-content rounded-lg transition-colors']
    
    if (!isCurrentMonth) {
      baseClasses.push('text-base-content')
    }
    
    return baseClasses.join(' ')
  }
})
</script>

<style>
/* VueDatePicker light theme (default) */
.dp-custom-menu {
  --dp-background-color: #ffffff;
  --dp-text-color: #1f2937;
  --dp-hover-color: #f3f4f6;
  --dp-hover-text-color: #1f2937;
  --dp-hover-icon-color: #1f2937;
  --dp-primary-color: #3b82f6;
  --dp-primary-text-color: #ffffff;
  --dp-secondary-color: #6b7280;
  --dp-border-color: #e5e7eb;
  --dp-menu-border-color: #e5e7eb;
  --dp-border-color-hover: #d1d5db;
  --dp-disabled-color: #f3f4f6;
  --dp-scroll-bar-background: #f3f4f6;
  --dp-scroll-bar-color: #e5e7eb;
  --dp-success-color: #10b981;
  --dp-success-color-disabled: rgba(16, 185, 129, 0.4);
  --dp-icon-color: #1f2937;
  --dp-danger-color: #ef4444;
  --dp-highlight-color: rgba(59, 130, 246, 0.2);
}

/* VueDatePicker dark theme */
[data-theme="dark"] .dp__theme_dark,
[data-theme="dark"] .dp-custom-menu {
  --dp-background-color: #1f2937 !important;
  --dp-text-color: #f9fafb !important;
  --dp-hover-color: #374151 !important;
  --dp-hover-text-color: #f9fafb !important;
  --dp-hover-icon-color: #f9fafb !important;
  --dp-primary-color: #3b82f6 !important;
  --dp-primary-text-color: #ffffff !important;
  --dp-secondary-color: #9ca3af !important;
  --dp-border-color: #4b5563 !important;
  --dp-menu-border-color: #4b5563 !important;
  --dp-border-color-hover: #6b7280 !important;
  --dp-disabled-color: #374151 !important;
  --dp-scroll-bar-background: #374151 !important;
  --dp-scroll-bar-color: #4b5563 !important;
  --dp-success-color: #10b981 !important;
  --dp-success-color-disabled: rgba(16, 185, 129, 0.4) !important;
  --dp-icon-color: #f9fafb !important;
  --dp-danger-color: #ef4444 !important;
  --dp-highlight-color: rgba(59, 130, 246, 0.2) !important;
}

/* Force input background and border in dark theme */
[data-theme="dark"] .dp__input_wrap input,
[data-theme="dark"] .dp__input {
  background-color: #1f2937 !important;
  border-color: #4b5563 !important;
  color: #f9fafb !important;
}

[data-theme="dark"] .dp__input_wrap input:focus,
[data-theme="dark"] .dp__input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 1px #3b82f6 !important;
}

/* Force input background and border in light theme */
[data-theme="light"] .dp__input_wrap input,
[data-theme="light"] .dp__input {
  background-color: #ffffff !important;
  border-color: #e5e7eb !important;
  color: #1f2937 !important;
}

[data-theme="light"] .dp__input_wrap input:focus,
[data-theme="light"] .dp__input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 1px #3b82f6 !important;
}

/* Force menu popup background */
[data-theme="dark"] .dp__menu {
  background-color: #1f2937 !important;
  border: 1px solid #4b5563 !important;
}

[data-theme="light"] .dp__menu {
  background-color: #ffffff !important;
  border: 1px solid #e5e7eb !important;
}

/* Force calendar cells styling - Dark */
[data-theme="dark"] .dp__calendar_item {
  color: #f9fafb !important;
}

[data-theme="dark"] .dp__calendar_item:hover {
  background-color: #374151 !important;
  color: #f9fafb !important;
}

/* Force calendar cells styling - Light */
[data-theme="light"] .dp__calendar_item {
  color: #1f2937 !important;
}

[data-theme="light"] .dp__calendar_item:hover {
  background-color: #f3f4f6 !important;
  color: #1f2937 !important;
}

/* Force header styling - Dark */
[data-theme="dark"] .dp__calendar_header,
[data-theme="dark"] .dp__calendar_header_item {
  color: #f9fafb !important;
}

/* Force header styling - Light */
[data-theme="light"] .dp__calendar_header,
[data-theme="light"] .dp__calendar_header_item {
  color: #1f2937 !important;
}

/* Force navigation arrows - Dark */
[data-theme="dark"] .dp__arrow_top,
[data-theme="dark"] .dp__arrow_bottom {
  border-color: transparent transparent #f9fafb transparent !important;
}

/* Force navigation arrows - Light */
[data-theme="light"] .dp__arrow_top,
[data-theme="light"] .dp__arrow_bottom {
  border-color: transparent transparent #1f2937 transparent !important;
}
</style>

