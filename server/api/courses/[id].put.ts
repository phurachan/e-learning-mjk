import Course from '~/server/models/Course'
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

    // Get course ID from route params
    const courseId = getRouterParam(event, 'id')

    if (!courseId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    const body = await readBody(event)

    // Find existing course
    const existingCourse = await Course.findById(courseId)

    if (!existingCourse) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบรายวิชาที่ระบุ']
      })
    }

    // Check if code is being changed and if it already exists
    if (body.code && body.code.toUpperCase() !== existingCourse.code) {
      const duplicateCourse = await Course.findOne({ code: body.code.toUpperCase() })
      if (duplicateCourse) {
        throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
          details: ['รหัสวิชานี้มีอยู่ในระบบแล้ว']
        })
      }
    }

    // Check if teacher exists and has teacher role if provided
    if (body.teacher) {
      const teacher = await User.findById(body.teacher)
      if (!teacher || teacher.role !== 'teacher') {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['ไม่พบครูผู้สอนที่ระบุหรือผู้ใช้ไม่ได้มีบทบาทเป็นครู']
        })
      }
    }

    // Validate rooms if provided
    if (body.rooms && Array.isArray(body.rooms) && body.rooms.length > 0) {
      const roomCount = await Room.countDocuments({ _id: { $in: body.rooms } })
      if (roomCount !== body.rooms.length) {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['บางห้องเรียนที่ระบุไม่พบในระบบ']
        })
      }
    }

    // Update course data
    if (body.name) existingCourse.name = body.name.trim()
    if (body.code) existingCourse.code = body.code.toUpperCase().trim()
    if (body.description !== undefined) existingCourse.description = body.description
    if (body.teacher) existingCourse.teacher = body.teacher
    if (body.rooms !== undefined) existingCourse.rooms = body.rooms
    if (body.academicYear) existingCourse.academicYear = body.academicYear.trim()
    if (body.semester) existingCourse.semester = body.semester
    if (body.isActive !== undefined) existingCourse.isActive = body.isActive

    // Save updated course
    const updatedCourse = await existingCourse.save()

    // Populate relations
    await updatedCourse.populate([
      { path: 'teacher', select: 'name email' },
      { path: 'rooms', select: 'name code grade section academicYear' },
      { path: 'createdBy', select: 'name email' }
    ])

    // Return course data
    const courseResponse = {
      id: updatedCourse._id.toString(),
      name: updatedCourse.name,
      code: updatedCourse.code,
      description: updatedCourse.description,
      teacher: {
        id: (updatedCourse.teacher as any)._id.toString(),
        name: (updatedCourse.teacher as any).name,
        email: (updatedCourse.teacher as any).email
      },
      rooms: updatedCourse.rooms.map((room: any) => ({
        id: room._id.toString(),
        name: room.name,
        code: room.code,
        grade: room.grade,
        section: room.section,
        academicYear: room.academicYear
      })),
      academicYear: updatedCourse.academicYear,
      semester: updatedCourse.semester,
      isActive: updatedCourse.isActive,
      createdBy: {
        id: (updatedCourse.createdBy as any)._id.toString(),
        name: (updatedCourse.createdBy as any).name,
        email: (updatedCourse.createdBy as any).email
      },
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt
    }

    return createSuccessResponse(courseResponse)
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

    console.error('Update course error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
