<template>
  <div class="avatar" :class="{ 'online': showOnline, 'offline': showOffline }">
    <div 
      :class="avatarClasses"
      @click="clickable ? $emit('click', $event) : undefined"
    >
      <!-- Image Avatar -->
      <img 
        v-if="src" 
        :src="src" 
        :alt="alt || name || 'Avatar'"
        @error="handleImageError"
      />
      
      <!-- Initial Avatar -->
      <div 
        v-else-if="name && !imageError" 
        class="h-full flex items-center justify-center text-primary-content bg-primary font-semibold text-xs"
      >
        {{ getInitials(name) }}
      </div>
      
      <!-- Placeholder Avatar -->
      <div 
        v-else 
        class="h-full flex items-center justify-center text-neutral-content bg-neutral"
      >
        <BaseIcon :name="placeholderIcon" :size="iconSize" />
      </div>
    </div>
    
    <!-- Badge/Indicator -->
    <div v-if="badge" class="absolute -top-2 -right-2 !overflow-clip">
      <div :class="badgeClasses">
        <span v-if="typeof badge === 'string' || typeof badge === 'number'">
          {{ badge }}
        </span>
        <BaseIcon v-else-if="badge.icon" :name="badge.icon" size="xs" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Badge {
  text?: string | number
  icon?: string
  variant?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error'
}

interface Props {
  src?: string
  name?: string
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  shape?: 'circle' | 'square'
  ring?: boolean
  ringColor?: string
  showOnline?: boolean
  showOffline?: boolean
  badge?: string | number | Badge
  placeholderIcon?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle',
  ring: false,
  ringColor: 'ring-primary',
  placeholderIcon: 'user'
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const imageError = ref(false)

const handleImageError = () => {
  imageError.value = true
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const avatarClasses = computed(() => {
  const classes = []
  
  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  }
  
  classes.push(sizeClasses[props.size])
  
  // Shape classes
  if (props.shape === 'circle') {
    classes.push('rounded-full')
  } else {
    classes.push('rounded-lg')
  }
  
  // Ring classes
  if (props.ring) {
    classes.push('ring', 'ring-offset-base-100', 'ring-offset-2')
    classes.push(props.ringColor)
  }
  
  // Clickable
  if (props.clickable) {
    classes.push('cursor-pointer', 'hover:opacity-80', 'transition-opacity')
  }
  
  return classes
})

const iconSize = computed(() => {
  const iconSizeMap = {
    xs: 'xs',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'xl'
  }
  return iconSizeMap[props.size]
})

const badgeClasses = computed(() => {
  const classes = ['badge', 'badge-sm']
  
  if (typeof props.badge === 'object' && props.badge.variant) {
    classes.push(`badge-${props.badge.variant}`)
  } else {
    classes.push('badge-primary')
  }
  
  return classes
})
</script>