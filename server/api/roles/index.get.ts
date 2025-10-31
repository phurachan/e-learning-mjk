import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import Role from '~/server/models/Role'
import User from '~/server/models/User'
import { createPredefinedError, createPaginatedResponse, API_RESPONSE_CODES } from '~/server/utils/responseHandler'
import { createRoleFilterConfig } from '~/server/utils/filter_config/userManagement'
import { parseQueryAndBuildFilter } from '~/server/utils/queryParser'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Verify and decode token
    const decoded = verifyToken(token)

    // Find current user to check permissions
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Check if user has permission to view roles (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    const query = getQuery(event)

    // Parse query and build MongoDB filter using global utilities
    const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
      query,
      createRoleFilterConfig(),
      ['name', 'description'] // Custom search fields for roles
    )

    const { page, limit } = parsedQuery.pagination
    const filter = mongoFilter

    // Get total count
    const total = await Role.countDocuments(filter)

    // Get roles with pagination
    const roles = await Role.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return createPaginatedResponse(roles, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    })
  } catch (error: any) {
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