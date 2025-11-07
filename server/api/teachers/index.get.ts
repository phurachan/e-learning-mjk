import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'
import { requirePermission } from '~/server/utils/permissions'

/**
 * GET /api/teachers
 *
 * Public endpoint to get list of teachers
 * Accessible by anyone with courses.access permission
 * Returns only basic teacher information (id, name, email)
 */
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

    // Find current user
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Check if user has permission to access courses
    // If you can access courses, you can see the list of teachers
    await requirePermission(decoded.userId, 'courses.access')

    // Get query parameters
    const query = getQuery(event)
    const isActiveFilter = query.isActive !== undefined
      ? query.isActive === 'true'
      : true // Default to active only

    // Fetch teachers (users with role 'teacher')
    const teachers = await User.find({
      role: 'teacher',
      isActive: isActiveFilter
    })
      .select('_id name email avatar') // Only return basic info
      .sort({ name: 1 })
      .lean()

    // Transform to simple format
    const teachersList = teachers.map(teacher => ({
      id: teacher._id.toString(),
      name: teacher.name,
      email: teacher.email,
      avatar: teacher.avatar || null
    }))

    return createSuccessResponse({
      data: teachersList,
      pagination: {
        total: teachersList.length,
        page: 1,
        totalPages: 1,
        limit: teachersList.length
      }
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get teachers error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
