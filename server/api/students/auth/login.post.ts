import Student from '~/server/models/Student'
import { signToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.studentId || !body.password) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['studentId', 'password']
      })
    }

    // Find student by studentId
    const student = await Student.findOne({
      studentId: body.studentId.toUpperCase(),
      isActive: true
    }).populate('room', 'name code grade section academicYear')

    if (!student) {
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_CREDENTIALS)
    }

    // Check password
    const isPasswordValid = await student.comparePassword(body.password)

    if (!isPasswordValid) {
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_CREDENTIALS)
    }

    // Generate JWT token
    const token = signToken({
      userId: student._id.toString(),
      studentId: student.studentId, // Add studentId to token
      email: student.studentId, // Use studentId as email for JWT
      role: 'student'
    })

    // Return student data and token
    return createSuccessResponse({
      token,
      isChangePassword: student.isChangePassword,
      student: {
        id: student._id.toString(),
        studentId: student.studentId,
        firstname: student.firstname,
        lastname: student.lastname,
        fullname: student.fullname,
        avatar: student.avatar,
        isChangePassword: student.isChangePassword,
        room: student.room ? {
          id: (student.room as any)._id.toString(),
          name: (student.room as any).name,
          code: (student.room as any).code,
          grade: (student.room as any).grade,
          section: (student.room as any).section,
          academicYear: (student.room as any).academicYear
        } : null
      }
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Student login error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
