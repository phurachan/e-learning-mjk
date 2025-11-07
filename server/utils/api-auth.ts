/**
 * API Authentication and Permission Helper
 *
 * This utility provides standardized authentication and permission checking for API endpoints
 */

import type { H3Event } from 'h3'
import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { API_RESPONSE_CODES, createPredefinedError } from '~/server/utils/responseHandler'
import { requirePermission, requireAnyPermission } from '~/server/utils/permissions'

/**
 * Authenticate user and return user ID
 * Throws error if not authenticated
 */
export async function authenticateUser(event: H3Event): Promise<string> {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
  }

  const decoded = verifyToken(token)

  // Find current user
  const currentUser = await User.findById(decoded.userId)

  if (!currentUser || !currentUser.isActive) {
    throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
  }

  return decoded.userId
}

/**
 * Authenticate user and check specific permission
 */
export async function authenticateAndAuthorize(event: H3Event, permissionCode: string): Promise<string> {
  const userId = await authenticateUser(event)
  await requirePermission(userId, permissionCode)
  return userId
}

/**
 * Authenticate user and check if has any of the permissions
 */
export async function authenticateAndAuthorizeAny(event: H3Event, permissionCodes: string[]): Promise<string> {
  const userId = await authenticateUser(event)
  await requireAnyPermission(userId, permissionCodes)
  return userId
}
