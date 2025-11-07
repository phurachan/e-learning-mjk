import Role from '~/server/models/Role'
import User from '~/server/models/User'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Get admin role by code
    const adminRole = await Role.findOne({ code: 'admin' })
    const teacherRole = await Role.findOne({ code: 'teacher' })

    if (!adminRole) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        additionalData: { message: 'Admin role not found' }
      })
    }

    let updatedCount = 0

    // Update all users with role='admin' to have roles array
    const adminUsers = await User.find({ role: 'admin' })
    for (const user of adminUsers) {
      if (!user.roles || user.roles.length === 0) {
        user.roles = [adminRole._id]
        await user.save()
        updatedCount++
      }
    }

    // Update all users with role='teacher' to have roles array
    if (teacherRole) {
      const teacherUsers = await User.find({ role: 'teacher' })
      for (const user of teacherUsers) {
        if (!user.roles || user.roles.length === 0) {
          user.roles = [teacherRole._id]
          await user.save()
          updatedCount++
        }
      }
    }

    return createSuccessResponse({
      updatedCount,
      adminRoleId: adminRole._id,
      teacherRoleId: teacherRole?._id
    }, {
      additionalData: {
        message: `Updated ${updatedCount} users with roles array`,
      }
    })
  } catch (error: any) {
    console.error('Update user roles error:', error)

    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
