import Course from '~/server/models/Course'
import User from '~/server/models/User'
import { createCourseFilterConfig } from '~/server/utils/filter_config/course'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { parseQueryAndBuildFilter } from '~/server/utils/queryParser'
import { API_RESPONSE_CODES, createPaginatedResponse, createPredefinedError } from '~/server/utils/responseHandler'

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
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Check if user has permission (admin or teacher)
    if (currentUser.role !== 'admin' && currentUser.role !== 'teacher') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    const query: any = getQuery(event)

    // Parse query and build MongoDB filter
    const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
      query,
      createCourseFilterConfig()
    )

    const { page, limit } = parsedQuery.pagination
    let filter = mongoFilter

    // Handle ObjectId conversion for teacher field
    if (filter.teacher && typeof filter.teacher === 'string') {
      try {
        filter.teacher = new (await import('mongoose')).Types.ObjectId(filter.teacher)
      } catch (error) {
        console.warn('Invalid ObjectId for teacher filter:', filter.teacher)
        delete filter.teacher
      }
    }

    // Get total count
    const total = await Course.countDocuments(filter)

    // Get courses with pagination
    const courses = await Course.find(filter)
      .populate('teacher', 'name email')
      .populate('rooms', 'name code grade section academicYear')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform courses data
    const transformedCourses = courses.map((course: any) => ({
      id: course._id.toString(),
      name: course.name,
      code: course.code,
      description: course.description,
      teacher: course.teacher ? {
        id: course.teacher._id.toString(),
        name: course.teacher.name,
        email: course.teacher.email
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
        id: course.createdBy._id.toString(),
        name: course.createdBy.name,
        email: course.createdBy.email
      } : null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }))

    return createPaginatedResponse(transformedCourses, {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get courses error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
