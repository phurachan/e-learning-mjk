import { usePermissions } from '~/composables/utilities/usePermissions'

export interface MenuItem {
  id: string
  title: string
  icon: string
  path?: string
  permissions?: string[]
  children?: MenuItem[]
  separator?: boolean
  badge?: {
    text: string
    color: string
  }
}

export interface MenuSection {
  title?: string
  items: MenuItem[]
}

export const useMenuConfig = () => {
  const { hasPermission, hasAnyPermission, canAccessModule, isAdmin } = usePermissions()

  // Main menu configuration
  const mainMenuConfig: MenuSection[] = [
    {
      title: 'Main',
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0zM8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z',
          path: '/admin',
          permissions: ['dashboard.access']
        }
      ]
    },
    {
      title: 'System',
      items: [
        {
          id: 'user_management',
          title: 'Settings',
          icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
          path: '/admin/user_management',
          permissions: ['user_management.access'],
          children: [
            {
              id: 'user_management-roles',
              title: 'Roles & Permissions',
              icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
              path: '/user_management?tab=roles',
              permissions: ['user_management.roles']
            },
            {
              id: 'user_management-users',
              title: 'User Management',
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
              path: '/user_management?tab=users',
              permissions: ['user_management.users']
            }
          ]
        },
      ]
    }
  ]

  // Filter menu items based on permissions
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Always show separators
      if (item.separator) return true
      
      // Admin users can see everything
      if (isAdmin.value) return true
      
      // Check if user has required permissions
      if (item.permissions && item.permissions.length > 0) {
        const hasRequiredPermission = hasAnyPermission(item.permissions)
        if (!hasRequiredPermission) return false
      }
      
      // Filter children recursively
      if (item.children) {
        item.children = filterMenuItems(item.children)
        // If no children are visible, hide parent (optional)
        // return item.children.length > 0
      }
      
      return true
    })
  }

  // Filter menu sections based on permissions
  const filterMenuSections = (sections: MenuSection[]): MenuSection[] => {
    return sections.map(section => ({
      ...section,
      items: filterMenuItems(section.items)
    })).filter(section => section.items.length > 0)
  }

  // Get filtered menu config
  const getFilteredMenuConfig = (): MenuSection[] => {
    return filterMenuSections(mainMenuConfig)
  }

  // Get menu item by ID
  const getMenuItemById = (id: string, sections?: MenuSection[]): MenuItem | null => {
    const searchSections = sections || mainMenuConfig
    
    for (const section of searchSections) {
      for (const item of section.items) {
        if (item.id === id) return item
        
        if (item.children) {
          const childItem = getMenuItemById(id, [{ title: '', items: item.children }])
          if (childItem) return childItem
        }
      }
    }
    
    return null
  }

  // Check if menu item is accessible
  const isMenuItemAccessible = (item: MenuItem | null): boolean => {
    if (isAdmin.value) return true
    if (!item) return false
    
    if (item.permissions && item.permissions.length > 0) {
      return hasAnyPermission(item.permissions)
    }
    
    return true
  }

  // Get breadcrumbs for current path
  const getBreadcrumbs = (currentPath: string): MenuItem[] => {
    const breadcrumbs: MenuItem[] = []
    
    const findInMenu = (items: MenuItem[], path: string): boolean => {
      for (const item of items) {
        if (item.path === path) {
          breadcrumbs.push(item)
          return true
        }
        
        if (item.children) {
          if (findInMenu(item.children, path)) {
            breadcrumbs.unshift(item)
            return true
          }
        }
      }
      return false
    }
    
    for (const section of mainMenuConfig) {
      if (findInMenu(section.items, currentPath)) {
        break
      }
    }
    
    return breadcrumbs
  }

  // Get menu statistics
  const getMenuStats = () => {
    const stats = {
      totalItems: 0,
      accessibleItems: 0,
      hiddenItems: 0
    }
    
    const countItems = (items: MenuItem[]) => {
      for (const item of items) {
        if (!item.separator) {
          stats.totalItems++
          if (isMenuItemAccessible(item)) {
            stats.accessibleItems++
          } else {
            stats.hiddenItems++
          }
        }
        
        if (item.children) {
          countItems(item.children)
        }
      }
    }
    
    for (const section of mainMenuConfig) {
      countItems(section.items)
    }
    
    return stats
  }

  return {
    mainMenuConfig,
    getFilteredMenuConfig,
    getMenuItemById,
    isMenuItemAccessible,
    getBreadcrumbs,
    getMenuStats,
    filterMenuItems,
    filterMenuSections
  }
}