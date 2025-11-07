import User from '~/server/models/User'
import Role from '~/server/models/Role'
import { API_RESPONSE_CODES, createPredefinedError } from '~/server/utils/responseHandler'

/**
 * Get all permission codes for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await User.findById(userId).select('roles')
  if (!user || !user.roles || user.roles.length === 0) {
    return []
  }

  const userRoles = await Role.find({
    _id: { $in: user.roles },
    isActive: true
  }).select('permissions')

  const permissionCodes = new Set<string>()
  userRoles.forEach(role => {
    role.permissions.forEach((permCode: string) => permissionCodes.add(permCode))
  })

  return Array.from(permissionCodes)
}

/**
 * Check if user has a specific permission
 */
export async function userHasPermission(userId: string, permissionCode: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.includes(permissionCode)
}

/**
 * Check if user has any of the specified permissions
 */
export async function userHasAnyPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissionCodes.some(code => permissions.includes(code))
}

/**
 * Check if user has all of the specified permissions
 */
export async function userHasAllPermissions(userId: string, permissionCodes: string[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissionCodes.every(code => permissions.includes(code))
}

/**
 * Verify user has required permission, throw error if not
 */
export async function requirePermission(userId: string, permissionCode: string): Promise<void> {
  const hasPermission = await userHasPermission(userId, permissionCode)
  if (!hasPermission) {
    throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
      additionalData: {
        message: `Missing required permission: ${permissionCode}`
      }
    })
  }
}

/**
 * Verify user has any of required permissions, throw error if not
 */
export async function requireAnyPermission(userId: string, permissionCodes: string[]): Promise<void> {
  const hasPermission = await userHasAnyPermission(userId, permissionCodes)
  if (!hasPermission) {
    throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
      additionalData: {
        message: `Missing required permissions. Need one of: ${permissionCodes.join(', ')}`
      }
    })
  }
}
