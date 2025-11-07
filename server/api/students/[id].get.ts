import Student from '~/server/models/Student'
import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'
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

    // Find current user
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Check if user has permission to access students
    await requirePermission(decoded.userId, 'students.access')

    // Get student ID from route params
    const studentId = getRouterParam(event, 'id')

    if (!studentId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find student by ID
    const student = await Student.findById(studentId)
      .populate('room', 'name code grade section academicYear')
      .populate('createdBy', 'name email')
      .select('-password')
      .lean()

    if (!student) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบนักเรียนที่ระบุ']
      })
    }

    // Transform student data
    const studentResponse = {
      id: student._id.toString(),
      studentId: student.studentId,
      firstname: student.firstname,
      lastname: student.lastname,
      fullname: student.fullname,
      phone: student.phone,
      avatar: student.avatar,
      room: student.room ? {
        id: (student.room as any)._id.toString(),
        name: (student.room as any).name,
        code: (student.room as any).code,
        grade: (student.room as any).grade,
        section: (student.room as any).section,
        academicYear: (student.room as any).academicYear
      } : null,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      isActive: student.isActive,
      createdBy: student.createdBy ? {
        id: (student.createdBy as any)._id.toString(),
        name: (student.createdBy as any).name,
        email: (student.createdBy as any).email
      } : null,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    }

    return createSuccessResponse(studentResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get student error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
