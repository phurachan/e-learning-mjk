<template>
  <div>
    <div class="flex items-center gap-2">
      <!-- Theme Toggle Button -->
      <button :class="buttonClasses" :disabled="disabled" @click="handleToggle" :title="toggleTooltip"
        :aria-label="ariaLabel">
        <!-- Light Icon (visible in dark mode) -->
        <BaseIcon v-if="!isDark" name="sun" :size="iconSize" class="transition-all duration-200" />

        <!-- Dark Icon (visible in light mode) -->
        <BaseIcon v-else name="moon" :size="iconSize" class="transition-all duration-200" />

        <!-- Label text if showLabel is true -->
        <span v-if="showLabel" class="ml-2 text-sm font-medium">
          {{ currentLabel }}
        </span>
      </button>

      <!-- Theme indicator badge (optional) -->
      <div v-if="showBadge" class="badge badge-sm" :class="badgeClasses">
        {{ currentTheme }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // Appearance
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  shape?: 'default' | 'circle' | 'square'

  // Features
  showLabel?: boolean
  showBadge?: boolean
  disabled?: boolean

  // Custom labels
  lightLabel?: string
  darkLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'md',
  shape: 'default',
  showLabel: false,
  showBadge: false,
  disabled: false,
  lightLabel: 'Light Mode',
  darkLabel: 'Dark Mode'
})

const emit = defineEmits<{
  toggle: [theme: 'light' | 'dark']
  change: [theme: 'light' | 'dark']
}>()

// Use theme composable
const { currentTheme, isDark, isLight, toggleTheme } = useTheme()

// Computed properties
const iconSize = computed(() => {
  const sizeMap = {
    xs: 'xs',
    sm: 'sm',
    md: 'sm',
    lg: 'md'
  }
  return sizeMap[props.size] as 'xs' | 'sm' | 'md'
})

const buttonClasses = computed(() => [
  'btn',
  `btn-${props.size}`,
  `btn-${props.variant}`,
  {
    'btn-circle': props.shape === 'circle',
    'btn-square': props.shape === 'square',
    'btn-disabled': props.disabled
  },
  'transition-all duration-200 hover:scale-105'
])

const badgeClasses = computed(() => [
  {
    'badge-primary': isDark.value,
    'badge-warning': isLight.value
  }
])

const currentLabel = computed(() => {
  return isDark.value ? props.darkLabel : props.lightLabel
})

const toggleTooltip = computed(() => {
  return `Switch to ${isDark.value ? 'light' : 'dark'} mode`
})

const ariaLabel = computed(() => {
  return `Toggle theme. Current theme: ${currentTheme.value}`
})

// Handle toggle
const handleToggle = () => {
  if (props.disabled) return

  const previousTheme = currentTheme.value
  toggleTheme()
  const newTheme = currentTheme.value

  // Emit events
  emit('toggle', newTheme)
  emit('change', newTheme)

  // Optional: Add haptic feedback on mobile
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
}
</script>

<style scoped>
/* Additional animations */
.btn:hover .transition-all {
  transform: rotate(180deg);
}

/* Smooth theme transition */
:global(html) {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>