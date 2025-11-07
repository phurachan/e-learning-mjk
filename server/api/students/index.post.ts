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

    const body = await readBody(event)

    // Validate required fields
    if (!body.studentId || !body.firstname || !body.lastname) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['studentId', 'firstname', 'lastname']
      })
    }

    // Auto-generate password from dateOfBirth if not provided
    let password = body.password
    if (!password && body.dateOfBirth) {
      // Format: ddmmyyyy (e.g., 15052010 for 2010-05-15)
      const date = new Date(body.dateOfBirth)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      password = `${day}${month}${year}`
    } else if (!password) {
      // If no dateOfBirth, use default password
      password = '123456'
    }

    // Check if studentId already exists
    const existingStudent = await Student.findOne({ studentId: body.studentId.toUpperCase() })
    if (existingStudent) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
        details: ['รหัสนักเรียนนี้มีอยู่ในระบบแล้ว']
      })
    }

    // Check if room exists (if provided)
    if (body.room) {
      const room = await Room.findById(body.room)
      if (!room) {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['ไม่พบห้องเรียนที่ระบุ']
        })
      }
    }

    // Create student data
    const studentData = {
      studentId: body.studentId.toUpperCase().trim(),
      password: password,
      firstname: body.firstname.trim(),
      lastname: body.lastname.trim(),
      phone: body.phone,
      avatar: body.avatar,
      room: body.room,
      dateOfBirth: body.dateOfBirth,
      address: body.address,
      parentName: body.parentName,
      parentPhone: body.parentPhone,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: currentUser._id,
      isChangePassword: false,
    }

    // Create new student
    const newStudent = new Student(studentData)
    const savedStudent = await newStudent.save()

    // Populate relations
    await savedStudent.populate([
      { path: 'room', select: 'name code grade section academicYear' },
      { path: 'createdBy', select: 'name email' }
    ])

    // Return student data
    const studentResponse = {
      id: savedStudent._id.toString(),
      studentId: savedStudent.studentId,
      firstname: savedStudent.firstname,
      lastname: savedStudent.lastname,
      fullname: savedStudent.fullname,
      phone: savedStudent.phone,
      avatar: savedStudent.avatar,
      room: savedStudent.room ? {
        id: (savedStudent.room as any)._id.toString(),
        name: (savedStudent.room as any).name,
        code: (savedStudent.room as any).code,
        grade: (savedStudent.room as any).grade,
        section: (savedStudent.room as any).section,
        academicYear: (savedStudent.room as any).academicYear
      } : null,
      dateOfBirth: savedStudent.dateOfBirth,
      address: savedStudent.address,
      parentName: savedStudent.parentName,
      parentPhone: savedStudent.parentPhone,
      isActive: savedStudent.isActive,
      createdBy: {
        id: (savedStudent.createdBy as any)._id.toString(),
        name: (savedStudent.createdBy as any).name,
        email: (savedStudent.createdBy as any).email
      },
      createdAt: savedStudent.createdAt,
      updatedAt: savedStudent.updatedAt
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

    console.error('Create student error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
