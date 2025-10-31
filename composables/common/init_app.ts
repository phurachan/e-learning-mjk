// App initialization functions and utilities

// Global state to prevent duplicate initialization
let isInitialized = false

/**
 * Initialize application on startup
 * This function runs when the app starts
 */
export const useInitApp = () => {
  /**
   * Setup theme and UI preferences
   */
  const initTheme = () => {
    // Set default theme if not already set
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        document.documentElement.setAttribute('data-theme', 'light')
        localStorage.setItem('theme', 'light')
      } else {
        document.documentElement.setAttribute('data-theme', savedTheme)
      }
    }
  }

  /**
   * Setup global error handling
   */
  const initErrorHandling = () => {
    // Global error handler for uncaught errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.error)
        // Here you could send to error tracking service
      })

      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason)
        // Here you could send to error tracking service
      })
    }
  }

  /**
   * Setup app-wide configurations
   */
  const initConfig = () => {
    // Initialize any app-wide configurations
  }

  /**
   * Initialize path mapping for breadcrumbs
   */
  const initPathMapping = async (router?: any) => {
    try {
      const { usePathMappingStore } = await import('~/stores/pathMapping')
      const store = usePathMappingStore()
      
      if (!store.isGenerated && router) {
        store.generateFromRouter(router)
      } else if (!router) {
        console.warn('Router not provided to initPathMapping')
      } else {
      }
    } catch (error) {
      console.warn('Path mapping initialization failed:', error)
    }
  }

  /**
   * Initialize all app components
   */
  const initialize = async (router?: any) => {
    // Prevent duplicate initialization
    if (isInitialized) {
      return
    }

    try {
      initTheme()
      initErrorHandling()
      await initPathMapping(router)
      initConfig()
      
      isInitialized = true
    } catch (error) {
      console.error('App initialization failed:', error)
    }
  }

  return {
    initialize,
    initTheme,
    initErrorHandling,
    initPathMapping,
    initConfig
  }
}

/**
 * Utility functions for app lifecycle
 */
export const useAppUtils = () => {
  /**
   * Check if app is running in development mode
   */
  const isDevelopment = () => {
    return typeof window !== 'undefined' ? 
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' :
      false
  }

  /**
   * Check if app is running in production mode
   */
  const isProduction = () => {
    return !isDevelopment()
  }

  /**
   * Get app version from package.json
   */
  const getAppVersion = () => {
    // This would need to be configured based on your build process
    return '1.0.0'
  }

  /**
   * Check if browser supports required features
   */
  const checkBrowserSupport = () => {
    if (typeof window === 'undefined') return true
    
    const requirements = {
      localStorage: typeof Storage !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      customElements: typeof customElements !== 'undefined'
    }

    const unsupported = Object.entries(requirements)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature)

    if (unsupported.length > 0) {
      console.warn('Browser missing required features:', unsupported)
      return false
    }

    return true
  }

  return {
    isDevelopment,
    isProduction,
    getAppVersion,
    checkBrowserSupport
  }
}