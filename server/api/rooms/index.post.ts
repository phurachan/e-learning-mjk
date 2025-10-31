import Room from '~/server/models/Room'
import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

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

    // Check if user has permission (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.code || !body.grade || !body.section || !body.academicYear) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['name', 'code', 'grade', 'section', 'academicYear']
      })
    }

    // Check if room code already exists
    const existingRoom = await Room.findOne({ code: body.code.toUpperCase() })
    if (existingRoom) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
        details: ['รหัสห้องเรียนนี้มีอยู่ในระบบแล้ว']
      })
    }

    // Create room data
    const roomData = {
      name: body.name.trim(),
      code: body.code.toUpperCase().trim(),
      grade: body.grade,
      section: String(body.section).trim(),
      academicYear: String(body.academicYear).trim(),
      capacity: body.capacity,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: currentUser._id
    }

    // Create new room
    const newRoom = new Room(roomData)
    const savedRoom = await newRoom.save()

    // Populate createdBy
    await savedRoom.populate('createdBy', 'name email')

    // Return room data
    const roomResponse = {
      id: savedRoom._id.toString(),
      name: savedRoom.name,
      code: savedRoom.code,
      grade: savedRoom.grade,
      section: savedRoom.section,
      academicYear: savedRoom.academicYear,
      capacity: savedRoom.capacity,
      isActive: savedRoom.isActive,
      createdBy: {
        id: (savedRoom.createdBy as any)._id.toString(),
        name: (savedRoom.createdBy as any).name,
        email: (savedRoom.createdBy as any).email
      },
      createdAt: savedRoom.createdAt,
      updatedAt: savedRoom.updatedAt
    }

    return createSuccessResponse(roomResponse)
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

    console.error('Create room error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
