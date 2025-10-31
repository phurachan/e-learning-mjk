import Room from '~/server/models/Room'
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

    // Check if user has permission (admin only)
    if (currentUser.role !== 'admin') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    // Get room ID from route params
    const roomId = getRouterParam(event, 'id')

    if (!roomId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    const body = await readBody(event)

    // Find existing room
    const existingRoom = await Room.findById(roomId)

    if (!existingRoom) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบห้องเรียนที่ระบุ']
      })
    }

    // Check if code is being changed and if it already exists
    if (body.code && body.code.toUpperCase() !== existingRoom.code) {
      const duplicateRoom = await Room.findOne({ code: body.code.toUpperCase() })
      if (duplicateRoom) {
        throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
          details: ['รหัสห้องเรียนนี้มีอยู่ในระบบแล้ว']
        })
      }
    }

    // Update room data
    if (body.name) existingRoom.name = body.name.trim()
    if (body.code) existingRoom.code = body.code.toUpperCase().trim()
    if (body.grade) existingRoom.grade = body.grade
    if (body.section) existingRoom.section = String(body.section).trim()
    if (body.academicYear) existingRoom.academicYear = String(body.academicYear).trim()
    if (body.capacity !== undefined) existingRoom.capacity = body.capacity
    if (body.isActive !== undefined) existingRoom.isActive = body.isActive

    // Save updated room
    const updatedRoom = await existingRoom.save()

    // Populate createdBy
    await updatedRoom.populate('createdBy', 'name email')

    // Return room data
    const roomResponse = {
      id: updatedRoom._id.toString(),
      name: updatedRoom.name,
      code: updatedRoom.code,
      grade: updatedRoom.grade,
      section: updatedRoom.section,
      academicYear: updatedRoom.academicYear,
      capacity: updatedRoom.capacity,
      isActive: updatedRoom.isActive,
      createdBy: {
        id: (updatedRoom.createdBy as any)._id.toString(),
        name: (updatedRoom.createdBy as any).name,
        email: (updatedRoom.createdBy as any).email
      },
      createdAt: updatedRoom.createdAt,
      updatedAt: updatedRoom.updatedAt
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

    console.error('Update room error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
