<template>
  <div class="form-control w-full">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error ml-1">*</span>
      </span>
    </label>

    <!-- Autocomplete Input Container -->
    <div class="dropdown w-full" :class="{ 'dropdown-open': isOpen && (filteredOptions.length > 0 || isLoading) }">
      <!-- Input Field -->
      <div class="relative">
        <input
          :id="inputId"
          ref="inputRef"
          v-model="inputValue"
          type="text"
          :class="inputClasses"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          novalidate
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />
        
        <!-- Clear Button -->
        <button
          v-if="inputValue && clearable && !disabled && !readonly"
          type="button"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-circle btn-xs"
          @click="clearInput"
        >
          <BaseIcon name="x-mark" size="xs" />
        </button>
        
        <!-- Loading Spinner -->
        <div
          v-if="isLoading"
          class="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <span class="loading loading-spinner loading-sm"></span>
        </div>
      </div>

      <!-- Dropdown Options -->
      <div 
        v-if="isOpen && (filteredOptions.length > 0 || isLoading || noResultsText)"
        class="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-auto border mt-1"
      >
        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-4">
          <span class="loading loading-spinner loading-sm mr-2"></span>
          <span class="text-sm text-base-content/70">กำลังค้นหา...</span>
        </div>
        
        <!-- No Results -->
        <div 
          v-else-if="filteredOptions.length === 0 && inputValue.trim()" 
          class="px-4 py-2 text-base-content/50 text-sm"
        >
          {{ noResultsText || 'ไม่พบข้อมูลที่ค้นหา' }}
        </div>
        
        <!-- Options List -->
        <ul v-else class="space-y-1">
          <li
            v-for="(option, index) in filteredOptions"
            :key="getOptionKey(option)"
            :class="[
              'menu-item rounded-lg cursor-pointer px-4 py-2 hover:bg-base-200 transition-colors',
              {
                'bg-primary text-primary-content': isSelected(option),
                'bg-base-200': highlightedIndex === index,
                'opacity-50 cursor-not-allowed': option.disabled
              }
            ]"
            @click="selectOption(option)"
            @mouseenter="highlightedIndex = index"
          >
            <!-- Option Icon -->
            <BaseIcon
              v-if="option.icon"
              :name="option.icon"
              size="sm"
              class="mr-2"
            />
            
            <!-- Option Content -->
            <div class="flex-1">
              <div class="font-medium">{{ option.label }}</div>
              <div v-if="option.description" class="text-sm text-base-content/70">
                {{ option.description }}
              </div>
            </div>
            
            <!-- Selected Indicator -->
            <BaseIcon
              v-if="isSelected(option)"
              name="check"
              size="sm"
              class="ml-2"
            />
          </li>
        </ul>
      </div>
    </div>

    <!-- Helper text -->
    <label v-if="hint || error" class="label">
      <span class="label-text-alt" :class="{ 'text-error': error, 'text-base-content/60': !error }">
        {{ error || hint }}
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted, useId } from 'vue'
import type { BaseAutocompleteProps, AutocompleteOption } from '~/composables/component_models/form'

interface Props extends BaseAutocompleteProps {}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  placeholder: 'พิมพ์เพื่อค้นหา...',
  minChars: 1,
  debounceMs: 300,
  clearable: true,
  disabled: false,
  readonly: false,
  required: false,
  options: () => [],
  displayKey: 'label',
  valueKey: 'value'
})

const $emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  'update:displayValue': [value: string]
  change: [value: string | number | null, option: AutocompleteOption | null]
  search: [query: string]
  'api-search': [query: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  clear: []
}>()

const inputId = props.id || useId()
const inputRef = ref<HTMLInputElement>()
const inputValue = ref('')
const isOpen = ref(false)
const isLoading = ref(false)
const highlightedIndex = ref(-1)
const searchTimeout = ref<NodeJS.Timeout>()

// Initialize input value from modelValue or displayValue
onMounted(() => {
  if (props.displayValue) {
    inputValue.value = props.displayValue
  } else if (props.modelValue) {
    const selectedOption = props.options.find(option => 
      option[props.valueKey] === props.modelValue
    )
    if (selectedOption) {
      inputValue.value = selectedOption[props.displayKey]
    }
  }
})

// Watch for external displayValue changes
watch(() => props.displayValue, (newValue) => {
  if (newValue !== undefined) {
    inputValue.value = newValue
  }
})

// Filter options based on input value
const filteredOptions = computed(() => {
  if (!inputValue.value || inputValue.value.length < props.minChars) {
    return props.options.slice(0, 10) // Show first 10 options when no search
  }
  
  const query = inputValue.value.toLowerCase().trim()
  return props.options.filter(option => 
    !option.disabled && 
    option[props.displayKey].toLowerCase().includes(query)
  ).slice(0, props.maxResults || 50)
})

// Input classes computation
const inputClasses = computed(() => {
  const classes = ['input', 'input-bordered', 'w-full']
  
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
    default: '',
    primary: 'input-primary',
    secondary: 'input-secondary',
    accent: 'input-accent',
    info: 'input-info',
    success: 'input-success',
    warning: 'input-warning',
    error: 'input-error'
  }
  if (variantClasses[props.variant]) {
    classes.push(variantClasses[props.variant])
  }
  
  // Error state
  if (props.error) {
    classes.push('input-error')
  }
  
  // Focus state
  if (isOpen.value) {
    classes.push('input-focus')
  }
  
  return classes.join(' ')
})

// Get option key for v-for
const getOptionKey = (option: AutocompleteOption): string | number => {
  return option[props.valueKey] || option[props.displayKey]
}

// Check if option is selected
const isSelected = (option: AutocompleteOption): boolean => {
  return option[props.valueKey] === props.modelValue
}

// Handle input changes
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  inputValue.value = value
  $emit('update:displayValue', value)
  
  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  // Debounced search
  searchTimeout.value = setTimeout(() => {
    if (value.length >= props.minChars) {
      isOpen.value = true
      highlightedIndex.value = -1
      
      // Emit search events
      $emit('search', value)
      
      // Emit API search if searchApi is provided
      if (props.searchApi) {
        performApiSearch(value)
      }
    } else {
      isOpen.value = false
    }
  }, props.debounceMs)
}

// Perform API search
const performApiSearch = async (query: string) => {
  if (!props.searchApi || !query.trim()) return
  
  isLoading.value = true
  
  try {
    $emit('api-search', query)
    // Note: The parent component should handle the API call and update the options prop
  } catch (error) {
    console.error('Autocomplete API search error:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle focus
const handleFocus = (event: FocusEvent) => {
  if (inputValue.value.length >= props.minChars) {
    isOpen.value = true
  }
  $emit('focus', event)
}

// Handle blur
const handleBlur = (event: FocusEvent) => {
  // Delay closing to allow option selection
  setTimeout(() => {
    isOpen.value = false
    highlightedIndex.value = -1
  }, 150)
  
  $emit('blur', event)
}

// Handle keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.readonly) return
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      if (isOpen.value && filteredOptions.value.length > 0) {
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          filteredOptions.value.length - 1
        )
      }
      break
      
    case 'ArrowUp':
      event.preventDefault()
      if (isOpen.value && filteredOptions.value.length > 0) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      }
      break
      
    case 'Enter':
      event.preventDefault()
      if (isOpen.value && highlightedIndex.value >= 0) {
        selectOption(filteredOptions.value[highlightedIndex.value])
      }
      break
      
    case 'Escape':
      event.preventDefault()
      isOpen.value = false
      highlightedIndex.value = -1
      inputRef.value?.blur()
      break
      
    case 'Tab':
      isOpen.value = false
      highlightedIndex.value = -1
      break
  }
}

// Select option
const selectOption = (option: AutocompleteOption) => {
  if (option.disabled) return
  
  inputValue.value = option[props.displayKey]
  $emit('update:modelValue', option[props.valueKey])
  $emit('update:displayValue', option[props.displayKey])
  $emit('change', option[props.valueKey], option)
  
  isOpen.value = false
  highlightedIndex.value = -1
  inputRef.value?.blur()
}

// Clear input
const clearInput = () => {
  inputValue.value = ''
  $emit('update:modelValue', null)
  $emit('update:displayValue', '')
  $emit('change', null, null)
  $emit('clear')
  
  isOpen.value = false
  highlightedIndex.value = -1
  
  // Clear search timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  // Focus input after clearing
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.dropdown')) {
    isOpen.value = false
    highlightedIndex.value = -1
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>