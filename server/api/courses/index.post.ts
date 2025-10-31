import { Role } from '~/server/models'
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

    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.code || !body.teacher || !body.academicYear || !body.semester) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['name', 'code', 'teacher', 'academicYear', 'semester']
      })
    }

    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: body.code.toUpperCase() })
    if (existingCourse) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
        details: ['รหัสวิชานี้มีอยู่ในระบบแล้ว']
      })
    }

    // Check if teacher exists and has teacher role
    const mongoose = await import('mongoose')
    const teacher = await User.findById(new mongoose.Types.ObjectId(body.teacher))
    const roles = await Role.find({ code: 'teacher' }).select('_id').lean()
    if (!teacher || teacher.roles.indexOf(roles[0]?._id?.toString()) === -1) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบครูผู้สอนที่ระบุหรือผู้ใช้ไม่ได้มีบทบาทเป็นครู']
      })
    }

    // Validate rooms if provided
    if (body.rooms && Array.isArray(body.rooms) && body.rooms.length > 0) {
      const rooms = body.rooms.map((room: any) => new mongoose.Types.ObjectId(room))
      const roomCount = await Room.countDocuments({ _id: { $in: rooms } })
      if (roomCount !== body.rooms.length) {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['บางห้องเรียนที่ระบุไม่พบในระบบ']
        })
      }
    }

    // Create course data
    const courseData = {
      name: body.name.trim(),
      code: body.code.toUpperCase().trim(),
      description: body.description,
      teacher: body.teacher,
      rooms: body.rooms || [],
      academicYear: body.academicYear.trim(),
      semester: body.semester,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: currentUser._id
    }

    // Create new course
    const newCourse = new Course(courseData)
    const savedCourse = await newCourse.save()

    // Populate relations
    await savedCourse.populate([
      { path: 'teacher', select: 'name email' },
      { path: 'rooms', select: 'name code grade section academicYear' },
      { path: 'createdBy', select: 'name email' }
    ])

    // Return course data
    const courseResponse = {
      id: savedCourse._id.toString(),
      name: savedCourse.name,
      code: savedCourse.code,
      description: savedCourse.description,
      teacher: {
        id: (savedCourse.teacher as any)._id.toString(),
        name: (savedCourse.teacher as any).name,
        email: (savedCourse.teacher as any).email
      },
      rooms: savedCourse.rooms.map((room: any) => ({
        id: room._id.toString(),
        name: room.name,
        code: room.code,
        grade: room.grade,
        section: room.section,
        academicYear: room.academicYear
      })),
      academicYear: savedCourse.academicYear,
      semester: savedCourse.semester,
      isActive: savedCourse.isActive,
      createdBy: {
        id: (savedCourse.createdBy as any)._id.toString(),
        name: (savedCourse.createdBy as any).name,
        email: (savedCourse.createdBy as any).email
      },
      createdAt: savedCourse.createdAt,
      updatedAt: savedCourse.updatedAt
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

    console.error('Create course error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
