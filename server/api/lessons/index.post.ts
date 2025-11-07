import Lesson from '~/server/models/Lesson'
import Course from '~/server/models/Course'
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

    // Check if user has permission to access lessons
    await requirePermission(decoded.userId, 'lessons.access')

    const body = await readBody(event)

    // Validate required fields
    if (!body.title || !body.content || !body.course || body.order === undefined) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['title', 'content', 'course', 'order']
      })
    }

    // Check if course exists
    const course = await Course.findById(body.course)
    if (!course) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบรายวิชาที่ระบุ']
      })
    }

    // If teacher, verify they are teaching this course
    if (currentUser.role === 'teacher' && course.teacher.toString() !== currentUser._id.toString()) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['คุณไม่มีสิทธิ์สร้างบทเรียนในรายวิชานี้']
      })
    }

    // Create lesson data
    const lessonData = {
      title: body.title.trim(),
      description: body.description?.trim(),
      content: body.content,
      course: body.course,
      order: body.order,
      attachments: body.attachments || [],
      publishDate: body.publishDate,
      isPublished: body.isPublished !== undefined ? body.isPublished : false,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: currentUser._id
    }

    // Create new lesson
    const newLesson = new Lesson(lessonData)
    const savedLesson = await newLesson.save()

    // Populate relations
    await savedLesson.populate([
      { path: 'course', select: 'name code teacher' },
      { path: 'createdBy', select: 'name email' }
    ])

    // Return lesson data
    const lessonResponse = {
      id: savedLesson._id.toString(),
      title: savedLesson.title,
      description: savedLesson.description,
      content: savedLesson.content,
      course: {
        id: (savedLesson.course as any)._id.toString(),
        name: (savedLesson.course as any).name,
        code: (savedLesson.course as any).code
      },
      order: savedLesson.order,
      attachments: savedLesson.attachments,
      publishDate: savedLesson.publishDate,
      isPublished: savedLesson.isPublished,
      isActive: savedLesson.isActive,
      createdBy: {
        id: (savedLesson.createdBy as any)._id.toString(),
        name: (savedLesson.createdBy as any).name,
        email: (savedLesson.createdBy as any).email
      },
      createdAt: savedLesson.createdAt,
      updatedAt: savedLesson.updatedAt
    }

    return createSuccessResponse(lessonResponse)
  } catch (error: any) {
    console.error('Create lesson error:', error)
    
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

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
