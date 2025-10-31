import Permission from '~/server/models/Permission'
import Role from '~/server/models/Role'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: [VALIDATION_DETAILS.INVALID_PERMISSION_ID]
      })
    }

    // Check if permission exists
    const permission = await Permission.findById(id)
    if (!permission) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND)
    }

    // Check if permission is assigned to any roles
    const rolesWithPermission = await Role.countDocuments({ permissions: permission.name })
    if (rolesWithPermission > 0) {
      throw createPredefinedError(API_RESPONSE_CODES.DATA_USED)
    }

    // Delete the permission
    await Permission.findByIdAndDelete(id)

    return createSuccessResponse({})
  } catch (error: any) {
    console.error('Error deleting permission:', error)
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})