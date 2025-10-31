import { useAuthStore } from '~/stores/auth'

export interface UserPermission {
  name: string
  description: string
  module: string
  action: string
  resource: string
}

export const usePermissions = () => {
  const authStore = useAuthStore()
  
  // Get all permissions for the current user
  const userPermissions = computed(() => {
    if (!authStore.user?.roles) {
      return []
    }
    
    const permissions: any[] = []
    authStore.user.roles.forEach(role => {
      if (role.permissions) {
        permissions.push(...role.permissions)
      }
    })
    
    const uniquePermissions = [...new Set(permissions)]
    return uniquePermissions
  })
  
  // Check if user has a specific permission
  const hasPermission = (permissionName: string): boolean => {
    if (!authStore.user) return false
    
    // Super admin check (if user has admin role)
    if (authStore.user.role === 'admin') return true
    
    return userPermissions.value.includes(permissionName)
  }
  
  // Check if user has any of the provided permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }
  
  // Check if user has all of the provided permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }
  
  // Check if user can access a specific module
  const canAccessModule = (moduleName: string): boolean => {
    return hasPermission(`${moduleName}.access`)
  }
  
  // Check if user can perform an action on a resource
  const canPerformAction = (module: string, action: string, resource?: string): boolean => {
    const permissionName = resource 
      ? `${module}.${action}.${resource}`
      : `${module}.${action}`
    
    return hasPermission(permissionName)
  }
  
  // Get permissions for a specific module
  const getModulePermissions = (moduleName: string): string[] => {
    return userPermissions.value.filter(permission => 
      permission.startsWith(`${moduleName}.`)
    )
  }
  
  // Check if user is admin
  const isAdmin = computed(() => {
    return authStore.user?.role === 'admin'
  })
  
  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    canPerformAction,
    getModulePermissions,
    isAdmin,
  }
}