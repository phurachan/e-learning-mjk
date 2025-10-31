import Room from '~/server/models/Room'
import User from '~/server/models/User'
import { createRoomFilterConfig } from '~/server/utils/filter_config/room'
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
      createRoomFilterConfig()
    )

    const { page, limit } = parsedQuery.pagination
    const filter = mongoFilter

    // Get total count
    const total = await Room.countDocuments(filter)

    // Get rooms with pagination
    const rooms = await Room.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform rooms data
    const transformedRooms = rooms.map((room: any) => ({
      id: room._id.toString(),
      name: room.name,
      code: room.code,
      grade: room.grade,
      section: room.section,
      academicYear: room.academicYear,
      capacity: room.capacity,
      isActive: room.isActive,
      createdBy: room.createdBy ? {
        id: room.createdBy._id.toString(),
        name: room.createdBy.name,
        email: room.createdBy.email
      } : null,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    }))

    return createPaginatedResponse(transformedRooms, {
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

    console.error('Get rooms error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
