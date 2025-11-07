import Role from '~/server/models/Role'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Find Admin role
    const adminRole = await Role.findOne({ code: 'admin' })

    if (!adminRole) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        additionalData: { message: 'Admin role not found' }
      })
    }

    // Update permissions
    const allPermissions = [
      // Dashboard
      'dashboard.access',

      // E-Learning
      'rooms.access',
      'students.access',
      'courses.access',
      'lessons.access',

      // User Management
      'user_management.access',
      'user_management.users',
      'user_management.roles',
      'user_management.permissions',

      // Developer
      'demo.access',
      'components.access',
      'i18n_test.access',
    ]

    adminRole.permissions = allPermissions
    await adminRole.save()

    return createSuccessResponse({
      role: adminRole.name,
      permissionsCount: allPermissions.length,
      permissions: allPermissions
    }, {
      additionalData: {
        message: `Admin role updated with ${allPermissions.length} permissions`,
      }
    })
  } catch (error: any) {
    console.error('Update admin role error:', error)

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
