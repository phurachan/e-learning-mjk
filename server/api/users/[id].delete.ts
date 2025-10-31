import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import User from '~/server/models/User'
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
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Check if user has permission to delete users (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    // Get user ID from params
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, 'User ID is required')
    }

    // Prevent deleting self
    if (userId === currentUser._id.toString()) {
      throw createPredefinedError(API_RESPONSE_CODES.DATA_USED, 'Cannot delete your own account')
    }

    // Find user to delete
    const userToDelete = await User.findById(userId)

    if (!userToDelete) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, 'User not found')
    }

    // Soft delete - set isActive to false
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: currentUser._id
      },
      { new: true }
    ).select('_id name email isActive')

    return createSuccessResponse({
      id: updatedUser?._id.toString(),
      name: updatedUser?.name,
      email: updatedUser?.email,
      isActive: updatedUser?.isActive
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
    console.error('Delete user error:', error)

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})