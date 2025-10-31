import User from '~/server/models/User'
import Student from '~/server/models/Student'
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

    // Check if user is a student
    if (decoded.role === 'student') {
      // Find student by ID and populate room
      const student = await Student.findById(decoded.userId)
        .populate('room', 'name code grade section academicYear')

      if (!student || !student.isActive) {
        throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
      }

      // Return student data
      return createSuccessResponse({
        id: student._id.toString(),
        studentId: student.studentId,
        firstname: student.firstname,
        lastname: student.lastname,
        fullname: student.fullname,
        avatar: student.avatar,
        role: 'student',
        isChangePassword: student.isChangePassword,
        room: student.room ? {
          id: (student.room as any)._id.toString(),
          name: (student.room as any).name,
          code: (student.room as any).code,
          grade: (student.room as any).grade,
          section: (student.room as any).section,
          academicYear: (student.room as any).academicYear
        } : null
      })
    }

    // Find user by ID and populate roles
    const user = await User.findById(decoded.userId)
      .populate('roles', 'name code description permissions isActive')

    if (!user || !user.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Return user data
    return createSuccessResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
      roles: user.roles || []
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

    // Log unexpected errors
    console.error('Get user error:', error)

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})