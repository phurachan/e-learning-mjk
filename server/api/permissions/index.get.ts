import Permission from '~/server/models/Permission'
import User from '~/server/models/User'
import Role from '~/server/models/Role'
import { createPermissionFilterConfig } from '~/server/utils/filter_config/userManagement'
import { connectMongoDB } from '~/server/utils/mongodb'
import { parseQueryAndBuildFilter } from '~/server/utils/queryParser'
import { API_RESPONSE_CODES, createPaginatedResponse, createPredefinedError } from '~/server/utils/responseHandler'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Get user from token
    const authHeader = getRequestHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    const decoded = verifyToken(token)

    // Get user with roles populated
    const user = await User.findById(decoded.userId).select('roles')
    if (!user) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Get all permissions from user's roles
    const userRoles = await Role.find({
      _id: { $in: user.roles || [] },
      isActive: true
    }).select('permissions')

    // Collect all unique permission codes from all roles
    const permissionCodes = new Set<string>()
    userRoles.forEach(role => {
      role.permissions.forEach((permCode: string) => permissionCodes.add(permCode))
    })

    const query = getQuery(event)

    // Parse query and build MongoDB filter using global utilities
    const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
      query,
      createPermissionFilterConfig(),
      ['name', 'description', 'module', 'resource'] // Custom search fields for permissions
    )

    const { page, limit } = parsedQuery.pagination

    // Add permission code filter to only show user's accessible permissions
    const filter = {
      ...mongoFilter,
      code: { $in: Array.from(permissionCodes) }
    }

    // Get total count
    const total = await Permission.countDocuments(filter)

    // Get permissions with pagination
    const permissions = await Permission.find(filter)
      .sort({ module: 1, action: 1 })
      .skip((page - 1) * limit)
      .limit(limit)


    return createPaginatedResponse(permissions, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    })
  } catch (error: any) {
    console.error('Get Permission error:', error)
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})