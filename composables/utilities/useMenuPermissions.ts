import type { IPermission } from '~/server/models/Permission'

export interface MenuItem {
  path: string
  label: string
  icon?: string
  code: string
  activeWhen?: string[]
}

export interface MenuSection {
  title: string
  icon?: string
  module: string
  items: MenuItem[]
}

export const useMenuPermissions = () => {
  const menuSections = ref<MenuSection[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchMenuPermissions = async () => {
    try {
      isLoading.value = true
      error.value = null

      const httpClient = useHttpClient()

      // Fetch all menu type permissions that user has access to
      const response = await httpClient.get('/permissions', {
        pagination: { page: 1, limit: 100 },
        filter: {
          type: 'menu',
          isActive: true
        }
      })

      if (response?.data) {
        const permissions: IPermission[] = response.data

        // Group permissions by module
        const groupedByModule = permissions.reduce((acc, permission) => {
          const module = permission.module
          if (!acc[module]) {
            acc[module] = {
              title: permission.moduleName,
              module: permission.module,
              items: []
            }
          }

          acc[module].items.push({
            path: permission.path || generatePath(permission),
            label: permission.name,
            icon: permission.icon,
            code: permission.code
          })

          return acc
        }, {} as Record<string, MenuSection>)

        // Convert to array and sort by module
        menuSections.value = Object.values(groupedByModule).sort((a, b) =>
          a.module.localeCompare(b.module)
        )
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch menu permissions'
      console.error('Error fetching menu permissions:', err)
    } finally {
      isLoading.value = false
    }
  }

  const generatePath = (permission: IPermission): string => {
    // Fallback: Generate path from permission code if path not provided
    // Example: dashboard.access -> /admin
    // Example: rooms.access -> /admin/rooms

    const [module] = permission.code.split('.')

    if (module === 'dashboard') {
      return '/admin'
    }

    // Convert snake_case to kebab-case
    const path = module.replace(/_/g, '-')
    return `/admin/${path}`
  }

  return {
    menuSections,
    isLoading,
    error,
    fetchMenuPermissions
  }
}
