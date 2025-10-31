import { computed } from 'vue'
import { usePathMappingStore } from '~/stores/pathMapping'
import { useRouter } from 'vue-router'

/**
 * Composable for managing path mapping functionality
 */
export const usePathMapping = () => {
  const store = usePathMappingStore()
  const router = useRouter()

  /**
   * Initialize path mapping if not already done
   */
  const initializePathMapping = () => {
    if (!store.isGenerated) {
      store.generateFromRouter(router)
    }
  }

  /**
   * Get formatted label for a path segment
   */
  const getFormattedLabel = (segment: string): string => {
    return store.formatLabel(segment)
  }

  /**
   * Get path mapping for specific path
   */
  const getPathMapping = (path: string) => {
    return store.getPathMapping(path)
  }

  /**
   * Manually set a custom label for a path
   */
  const setCustomLabel = (path: string, label: string) => {
    store.setPathMapping(path, label)
  }

  /**
   * Reset and regenerate path mapping
   */
  const resetPathMapping = () => {
    store.resetMapping()
    store.generateFromRouter(router)
  }

  /**
   * Get all path mappings
   */
  const getAllMappings = () => {
    return store.mapping
  }

  return {
    initializePathMapping,
    getFormattedLabel,
    getPathMapping,
    setCustomLabel,
    resetPathMapping,
    getAllMappings,
    isGenerated: computed(() => store.isGenerated)
  }
}