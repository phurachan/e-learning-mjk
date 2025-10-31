import { ref, computed, onMounted } from 'vue'

const STORAGE_KEY = 'theme-preference'
const THEMES = ['light', 'dark'] as const

type Theme = typeof THEMES[number]

// Global state
const currentTheme = ref<Theme>('light')

export const useTheme = () => {
  // Computed properties
  const isDark = computed(() => currentTheme.value === 'dark')
  const isLight = computed(() => currentTheme.value === 'light')
  
  // Get theme from localStorage or system preference
  const getStoredTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light'
    
    const stored = localStorage.getItem(STORAGE_KEY) as Theme
    if (stored && THEMES.includes(stored)) {
      return stored
    }
    
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  
  // Set theme and persist
  const setTheme = (theme: Theme) => {
    if (!THEMES.includes(theme)) return
    
    currentTheme.value = theme
    
    if (typeof document !== 'undefined') {
      // Apply theme to html element
      document.documentElement.setAttribute('data-theme', theme)
    }
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }
  
  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  // Initialize theme
  const initializeTheme = () => {
    const storedTheme = getStoredTheme()
    setTheme(storedTheme)
  }
  
  // Listen for system theme changes
  const watchSystemTheme = () => {
    if (typeof window === 'undefined') return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no manual preference is stored
      const hasStoredPreference = localStorage.getItem(STORAGE_KEY)
      if (!hasStoredPreference) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }
  
  // Auto-initialize on mount
  onMounted(() => {
    initializeTheme()
    const cleanup = watchSystemTheme()
    
    // Cleanup on unmount
    return cleanup
  })
  
  return {
    // State
    currentTheme: computed(() => currentTheme.value),
    isDark,
    isLight,
    
    // Actions
    setTheme,
    toggleTheme,
    initializeTheme,
    
    // Constants
    availableThemes: THEMES
  }
}

// Export singleton for global access
export const themeStore = {
  current: currentTheme,
  isDark: computed(() => currentTheme.value === 'dark'),
  isLight: computed(() => currentTheme.value === 'light'),
}