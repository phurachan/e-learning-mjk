import { defineStore } from 'pinia'

interface PathMappingNode {
  label: string
  children?: Record<string, PathMappingNode>
}

interface PathMappingState {
  mapping: Record<string, PathMappingNode>
  isGenerated: boolean
}

export const usePathMappingStore = defineStore('pathMapping', {
  state: (): PathMappingState => ({
    mapping: {},
    isGenerated: false
  }),

  actions: {
    /**
     * Generate path mapping from Nuxt router
     */
    generateFromRouter(router: any) {
      if (this.isGenerated) return

      const routes = router.getRoutes()
      const mapping: Record<string, PathMappingNode> = {}

      routes.forEach((route: any) => {
        if (route.path === '/' || route.path.includes(':') || route.path.includes('*')) {
          return // Skip root, dynamic routes, and catch-all routes
        }

        const segments = route.path.split('/').filter(Boolean)
        let currentLevel = mapping

        segments.forEach((segment: string, index: number) => {
          if (!currentLevel[segment]) {
            currentLevel[segment] = {
              label: this.formatLabel(segment),
              children: {}
            }
          }

          if (index < segments.length - 1) {
            if (!currentLevel[segment].children) {
              currentLevel[segment].children = {}
            }
            currentLevel = currentLevel[segment].children as Record<string, PathMappingNode>
          }
        })
      })

      this.mapping = mapping
      this.isGenerated = true
    },

    /**
     * Format segment name to readable label
     */
    formatLabel(segment: string): string {
      // Convert kebab-case or snake_case to Title Case
      return segment
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },

    /**
     * Get path mapping for a specific path
     */
    getPathMapping(path: string): PathMappingNode | null {
      const segments = path.split('/').filter(Boolean)
      let current = this.mapping
      let result: PathMappingNode | null = null

      for (const segment of segments) {
        if (current[segment]) {
          result = current[segment]
          current = current[segment].children || {}
        } else {
          return null
        }
      }

      return result
    },

    /**
     * Manually add or update a path mapping
     */
    setPathMapping(path: string, label: string) {
      const segments = path.split('/').filter(Boolean)
      let currentLevel = this.mapping

      segments.forEach((segment, index) => {
        if (!currentLevel[segment]) {
          currentLevel[segment] = {
            label: this.formatLabel(segment),
            children: {}
          }
        }

        if (index === segments.length - 1) {
          currentLevel[segment].label = label
        } else {
          if (!currentLevel[segment].children) {
            currentLevel[segment].children = {}
          }
          currentLevel = currentLevel[segment].children as Record<string, PathMappingNode>
        }
      })
    },

    /**
     * Reset and regenerate mapping
     */
    resetMapping() {
      this.mapping = {}
      this.isGenerated = false
    }
  },

  persist: {
    key: 'pathMapping',
    storage: typeof window !== 'undefined' ? localStorage : undefined
  }
})