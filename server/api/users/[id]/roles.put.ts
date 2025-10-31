import mongoose from 'mongoose'
import Role from '~/server/models/Role'
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

    // Check if user has permission to update user roles (admin)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { roleIds } = body

    if (!id) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Check if user exists
    const user = await User.findById(id)
    if (!user) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Validate role IDs if provided
    if (roleIds && roleIds.length > 0) {
      // Filter out null/undefined values and convert string IDs to ObjectIds
      const validRoleIds = roleIds.filter((id: any) => id != null && id !== '')

      if (validRoleIds.length === 0) {
        // If no valid IDs after filtering, just clear the roles
        const updatedUser: any = await User.findByIdAndUpdate(
          id,
          { roles: [] },
          { new: true, runValidators: true }
        ).populate('roles', 'name code description permissions isActive').lean()

        return createSuccessResponse(updatedUser.roles || [])
      }

      const objectIds = validRoleIds.map((id: any) => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id)
        }
        throw createPredefinedError(API_RESPONSE_CODES.INVALID_INPUT)
      })

      const validRoles = await Role.countDocuments({
        _id: { $in: objectIds },
        isActive: true
      })
      if (validRoles !== validRoleIds.length) {
        throw createPredefinedError(API_RESPONSE_CODES.INVALID_INPUT)
      }

      // Update user roles with validated ObjectIds
      const updatedUser: any = await User.findByIdAndUpdate(
        id,
        { roles: objectIds },
        { new: true, runValidators: true }
      ).populate('roles', 'name code description permissions isActive').lean()

      return createSuccessResponse(updatedUser.roles || [])
    }

    // Update user roles (empty array if no roleIds provided)
    const rolesToAssign: any[] = []
    const updatedUser: any = await User.findByIdAndUpdate(
      id,
      { roles: rolesToAssign },
      { new: true, runValidators: true }
    ).populate('roles', 'name code description permissions isActive').lean()

    return createSuccessResponse(updatedUser.roles || [])
  } catch (error: any) {
    // If it's already a createPredefinedError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Log unexpected errors
    console.error('Error updating user roles:', error)

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})