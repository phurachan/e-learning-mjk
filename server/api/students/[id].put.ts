import Student from '~/server/models/Student'
import Room from '~/server/models/Room'
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

    const body = await readBody(event)

    // Find existing student
    const existingStudent = await Student.findById(studentId)

    if (!existingStudent) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบนักเรียนที่ระบุ']
      })
    }

    // Check if studentId is being changed and if it already exists
    if (body.studentId && body.studentId.toUpperCase() !== existingStudent.studentId) {
      const duplicateStudent = await Student.findOne({ studentId: body.studentId.toUpperCase() })
      if (duplicateStudent) {
        throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
          details: ['รหัสนักเรียนนี้มีอยู่ในระบบแล้ว']
        })
      }
    }

    // Check if room exists if provided
    if (body.room) {
      const room = await Room.findById(body.room)
      if (!room) {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['ไม่พบห้องเรียนที่ระบุ']
        })
      }
    }

    // Update student data
    if (body.studentId) existingStudent.studentId = body.studentId.toUpperCase().trim()

    // Handle password update
    if (body.password) {
      existingStudent.password = body.password
    } else if (body.dateOfBirth && !body.password) {
      // Auto-generate password from new dateOfBirth if password not provided
      const date = new Date(body.dateOfBirth)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      existingStudent.password = `${day}${month}${year}`
    }
    if (body.firstname) existingStudent.firstname = body.firstname.trim()
    if (body.lastname) existingStudent.lastname = body.lastname.trim()
    if (body.phone !== undefined) existingStudent.phone = body.phone
    if (body.avatar !== undefined) existingStudent.avatar = body.avatar
    if (body.room) existingStudent.room = body.room
    if (body.dateOfBirth !== undefined) existingStudent.dateOfBirth = body.dateOfBirth
    if (body.address !== undefined) existingStudent.address = body.address
    if (body.parentName !== undefined) existingStudent.parentName = body.parentName
    if (body.parentPhone !== undefined) existingStudent.parentPhone = body.parentPhone
    if (body.isActive !== undefined) existingStudent.isActive = body.isActive

    // Save updated student
    const updatedStudent = await existingStudent.save()

    // Populate relations
    await updatedStudent.populate([
      { path: 'room', select: 'name code grade section academicYear' },
      { path: 'createdBy', select: 'name email' }
    ])

    // Return student data
    const studentResponse = {
      id: updatedStudent._id.toString(),
      studentId: updatedStudent.studentId,
      firstname: updatedStudent.firstname,
      lastname: updatedStudent.lastname,
      fullname: updatedStudent.fullname,
      phone: updatedStudent.phone,
      avatar: updatedStudent.avatar,
      room: updatedStudent.room ? {
        id: (updatedStudent.room as any)._id.toString(),
        name: (updatedStudent.room as any).name,
        code: (updatedStudent.room as any).code,
        grade: (updatedStudent.room as any).grade,
        section: (updatedStudent.room as any).section,
        academicYear: (updatedStudent.room as any).academicYear
      } : null,
      dateOfBirth: updatedStudent.dateOfBirth,
      address: updatedStudent.address,
      parentName: updatedStudent.parentName,
      parentPhone: updatedStudent.parentPhone,
      isActive: updatedStudent.isActive,
      createdBy: {
        id: (updatedStudent.createdBy as any)._id.toString(),
        name: (updatedStudent.createdBy as any).name,
        email: (updatedStudent.createdBy as any).email
      },
      createdAt: updatedStudent.createdAt,
      updatedAt: updatedStudent.updatedAt
    }

    return createSuccessResponse(studentResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    // Handle validation errors
    if (error.name === API_RESPONSE_CODES.VALIDATION_ERROR_EXCEPTION_NAME) {
      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: fieldErrors
      })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS)
    }

    console.error('Update student error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
