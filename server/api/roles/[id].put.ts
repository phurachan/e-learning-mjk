import Role from '~/server/models/Role'
import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

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

    // Check if user has permission to update roles (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { name, code, description, permissions, isActive } = body

    if (!id) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: [VALIDATION_DETAILS.INVALID_ROLE_ID]
      })
    }

    // Check if role exists
    const existingRole = await Role.findById(id)
    if (!existingRole) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND)
    }

    // Check if name is unique (if changing name)
    if (name && name !== existingRole.name) {
      const nameExists = await Role.findOne({ name, _id: { $ne: id } })
      if (nameExists) {
        throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS)
      }
    }

    // Update role
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (code !== undefined) updateData.code = code
    if (description !== undefined) updateData.description = description
    if (permissions !== undefined) updateData.permissions = permissions
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    return createSuccessResponse(updatedRole)
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    // Handle validation errors
    if (error.name === API_RESPONSE_CODES.VALIDATION_ERROR_EXCEPTION_NAME) {
      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: fieldErrors
      })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS)
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})