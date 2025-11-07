import Student from '~/server/models/Student'
import User from '~/server/models/User'
import { createStudentFilterConfig } from '~/server/utils/filter_config/student'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { parseQueryAndBuildFilter } from '~/server/utils/queryParser'
import { API_RESPONSE_CODES, createPaginatedResponse, createPredefinedError } from '~/server/utils/responseHandler'
import { requirePermission } from '~/server/utils/permissions'

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

    // Check if user has permission to access students
    await requirePermission(decoded.userId, 'students.access')

    const query: any = getQuery(event)

    // Parse query and build MongoDB filter
    const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
      query,
      createStudentFilterConfig()
    )

    const { page, limit } = parsedQuery.pagination
    let filter = mongoFilter

    // Handle ObjectId conversion for room field
    if (filter.room && typeof filter.room === 'string') {
      try {
        filter.room = new (await import('mongoose')).Types.ObjectId(filter.room)
      } catch (error) {
        console.warn('Invalid ObjectId for room filter:', filter.room)
        delete filter.room
      }
    }

    // Get total count
    const total = await Student.countDocuments(filter)

    // Get students with pagination
    const students = await Student.find(filter)
      .populate('room', 'name code grade section academicYear')
      .populate('createdBy', 'name email')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform students data
    const transformedStudents = students.map((student: any) => ({
      id: student._id.toString(),
      studentId: student.studentId,
      firstname: student.firstname,
      lastname: student.lastname,
      fullname: student.fullname,
      phone: student.phone,
      avatar: student.avatar,
      room: student.room ? {
        id: student.room._id.toString(),
        name: student.room.name,
        code: student.room.code,
        grade: student.room.grade,
        section: student.room.section,
        academicYear: student.room.academicYear
      } : null,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      isActive: student.isActive,
      createdBy: student.createdBy ? {
        id: student.createdBy._id.toString(),
        name: student.createdBy.name,
        email: student.createdBy.email
      } : null,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    }))

    return createPaginatedResponse(transformedStudents, {
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

    console.error('Get students error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
