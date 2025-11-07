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

    // Check if user has permission to access rooms
    await requirePermission(decoded.userId, 'rooms.access')

    // Get room ID from route params
    const roomId = getRouterParam(event, 'id')

    if (!roomId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find room by ID
    const room = await Room.findById(roomId)
      .populate('createdBy', 'name email')
      .lean()

    if (!room) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบห้องเรียนที่ระบุ']
      })
    }

    // Transform room data
    const roomResponse = {
      id: room._id.toString(),
      name: room.name,
      code: room.code,
      grade: room.grade,
      section: room.section,
      academicYear: room.academicYear,
      capacity: room.capacity,
      isActive: room.isActive,
      createdBy: room.createdBy ? {
        id: (room.createdBy as any)._id.toString(),
        name: (room.createdBy as any).name,
        email: (room.createdBy as any).email
      } : null,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    }

    return createSuccessResponse(roomResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get room error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
