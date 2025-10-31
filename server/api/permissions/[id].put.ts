import Permission from '~/server/models/Permission'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { name, description, module, action, resource, type, isActive } = body

    if (!id) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: [VALIDATION_DETAILS.INVALID_PERMISSION_ID]
      })
    }

    // Check if permission exists
    const existingPermission = await Permission.findById(id)
    if (!existingPermission) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND)
    }

    // Check if name is unique (if changing name)
    if (name && name !== existingPermission.name) {
      const nameExists = await Permission.findOne({ name, _id: { $ne: id } })
      if (nameExists) {
        throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS)
      }
    }

    // Update permission
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (module !== undefined) updateData.module = module
    if (action !== undefined) updateData.action = action
    if (resource !== undefined) updateData.resource = resource
    if (type !== undefined) updateData.type = type
    if (isActive !== undefined) updateData.isActive = isActive

    const updatedPermission = await Permission.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )

    return createSuccessResponse(updatedPermission)
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