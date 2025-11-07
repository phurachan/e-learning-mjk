import Role from '~/server/models/Role'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Find Teacher role
    const teacherRole = await Role.findOne({ code: 'teacher' })

    if (!teacherRole) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        additionalData: { message: 'Teacher role not found' }
      })
    }

    // Update permissions with correct codes
    const teacherPermissions = [
      // Dashboard
      'dashboard.access',

      // E-Learning (Teacher can manage their own classes)
      'rooms.access',
      'students.access',
      'courses.access',
      'lessons.access',
    ]

    teacherRole.permissions = teacherPermissions
    await teacherRole.save()

    return createSuccessResponse({
      role: teacherRole.name,
      code: teacherRole.code,
      permissionsCount: teacherPermissions.length,
      permissions: teacherPermissions
    }, {
      additionalData: {
        message: `Teacher role updated with ${teacherPermissions.length} permissions`,
      }
    })
  } catch (error: any) {
    console.error('Update teacher role error:', error)

    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle validation errors
    if (error.name === API_RESPONSE_CODES.VALIDATION_ERROR_EXCEPTION_NAME) {
      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: fieldErrors
      })
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
