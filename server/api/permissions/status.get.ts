import Permission from '~/server/models/Permission'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()

    // Get total permissions count
    const totalPermissions = await Permission.countDocuments()

    // Find permissions without type field or with null/undefined type
    const permissionsWithoutType = await Permission.find({
      $or: [
        { type: { $exists: false } },
        { type: null },
        { type: undefined }
      ]
    }).select('_id name module action resource type')

    // Find permissions with invalid type values
    const invalidTypePermissions = await Permission.find({
      type: { $nin: ['menu', 'action', 'input'] }
    }).select('_id name module action resource type')

    // Count permissions with valid types
    const validTypeCount = await Permission.countDocuments({
      type: { $in: ['menu', 'action', 'input'] }
    })

    // Count by type
    const typeCounts = await Permission.aggregate([
      {
        $match: {
          type: { $in: ['menu', 'action', 'input'] }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ])

    const needsMigration = permissionsWithoutType.length > 0 || invalidTypePermissions.length > 0

    return createSuccessResponse({
      migration: {
        needed: needsMigration,
        permissionsNeedingUpdate: permissionsWithoutType.length + invalidTypePermissions.length
      },
      summary: {
        total: totalPermissions,
        withValidType: validTypeCount,
        withoutType: permissionsWithoutType.length,
        withInvalidType: invalidTypePermissions.length
      },
      typeCounts: typeCounts.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {} as Record<string, number>),
      details: {
        permissionsWithoutType: permissionsWithoutType,
        invalidTypePermissions: invalidTypePermissions
      }
    }, {
      additionalData: {
        message: needsMigration
          ? `Migration needed: ${permissionsWithoutType.length + invalidTypePermissions.length} permissions require type field updates`
          : 'All permissions have valid type fields',
      }
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

    // Log unexpected errors for debugging
    console.error('Status check error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})