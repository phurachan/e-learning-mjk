import Lesson from '~/server/models/Lesson'
import Course from '~/server/models/Course'
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

    // Check if user has permission (admin or teacher)
    if (currentUser.role !== 'admin' && currentUser.role !== 'teacher') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    // Get lesson ID from route params
    const lessonId = getRouterParam(event, 'id')

    if (!lessonId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    const body = await readBody(event)

    // Find existing lesson
    const existingLesson = await Lesson.findById(lessonId).populate('course')

    if (!existingLesson) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบบทเรียนที่ระบุ']
      })
    }

    // If teacher, verify they are teaching this course
    if (currentUser.role === 'teacher') {
      const course = existingLesson.course as any
      if (course.teacher.toString() !== currentUser._id.toString()) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['คุณไม่มีสิทธิ์แก้ไขบทเรียนนี้']
        })
      }
    }

    // Check if course exists if provided
    if (body.course) {
      const course = await Course.findById(body.course)
      if (!course) {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['ไม่พบรายวิชาที่ระบุ']
        })
      }

      // If teacher, verify they are teaching the new course
      if (currentUser.role === 'teacher' && course.teacher.toString() !== currentUser._id.toString()) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['คุณไม่มีสิทธิ์ย้ายบทเรียนไปยังรายวิชานี้']
        })
      }
    }

    // Update lesson data
    if (body.title) existingLesson.title = body.title.trim()
    if (body.description !== undefined) existingLesson.description = body.description?.trim()
    if (body.content !== undefined) existingLesson.content = body.content
    if (body.course) existingLesson.course = body.course
    if (body.order !== undefined) existingLesson.order = body.order
    if (body.attachments !== undefined) existingLesson.attachments = body.attachments
    if (body.publishDate !== undefined) existingLesson.publishDate = body.publishDate
    if (body.isPublished !== undefined) existingLesson.isPublished = body.isPublished
    if (body.isActive !== undefined) existingLesson.isActive = body.isActive

    // Save updated lesson
    const updatedLesson = await existingLesson.save()

    // Populate relations
    await updatedLesson.populate([
      { path: 'course', select: 'name code teacher' },
      { path: 'createdBy', select: 'name email' }
    ])

    // Return lesson data
    const lessonResponse = {
      id: updatedLesson._id.toString(),
      title: updatedLesson.title,
      description: updatedLesson.description,
      content: updatedLesson.content,
      course: {
        id: (updatedLesson.course as any)._id.toString(),
        name: (updatedLesson.course as any).name,
        code: (updatedLesson.course as any).code
      },
      order: updatedLesson.order,
      attachments: updatedLesson.attachments,
      publishDate: updatedLesson.publishDate,
      isPublished: updatedLesson.isPublished,
      isActive: updatedLesson.isActive,
      createdBy: {
        id: (updatedLesson.createdBy as any)._id.toString(),
        name: (updatedLesson.createdBy as any).name,
        email: (updatedLesson.createdBy as any).email
      },
      createdAt: updatedLesson.createdAt,
      updatedAt: updatedLesson.updatedAt
    }

    return createSuccessResponse(lessonResponse)
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

    console.error('Update lesson error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
