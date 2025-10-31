import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

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

    // Get user ID from route params
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_USER_ID)
    }

    // Check if user has permission to view users (admin or viewing own profile)
    if (currentUser.role !== 'admin' && currentUser._id.toString() !== userId) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    // Find the user
    const user: any = await User.findById(userId)
      .populate('roles', 'name code description isActive')
      .select('_id name email role department position avatar lastLogin emailVerified isActive roles createdAt updatedAt')
      .lean()

    if (!user) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Transform user data
    const transformedUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    return createSuccessResponse(transformedUser)

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
    console.error('Get user error:', error)

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})