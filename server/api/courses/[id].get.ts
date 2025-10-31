import Course from '~/server/models/Course'
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

    // Find current user
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Check if user has permission (admin or teacher)
    if (currentUser.role !== 'admin' && currentUser.role !== 'teacher') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    // Get course ID from route params
    const courseId = getRouterParam(event, 'id')

    if (!courseId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find course by ID
    const course = await Course.findById(courseId)
      .populate('teacher', 'name email')
      .populate('rooms', 'name code grade section academicYear')
      .populate('createdBy', 'name email')
      .lean()

    if (!course) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบรายวิชาที่ระบุ']
      })
    }

    // Transform course data
    const courseResponse = {
      id: course._id.toString(),
      name: course.name,
      code: course.code,
      description: course.description,
      teacher: course.teacher ? {
        id: (course.teacher as any)._id.toString(),
        name: (course.teacher as any).name,
        email: (course.teacher as any).email
      } : null,
      rooms: course.rooms ? course.rooms.map((room: any) => ({
        id: room._id.toString(),
        name: room.name,
        code: room.code,
        grade: room.grade,
        section: room.section,
        academicYear: room.academicYear
      })) : [],
      academicYear: course.academicYear,
      semester: course.semester,
      isActive: course.isActive,
      createdBy: course.createdBy ? {
        id: (course.createdBy as any)._id.toString(),
        name: (course.createdBy as any).name,
        email: (course.createdBy as any).email
      } : null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }

    return createSuccessResponse(courseResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get course error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
