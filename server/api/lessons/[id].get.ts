import Lesson from '~/server/models/Lesson'
import User from '~/server/models/User'
import Student from '~/server/models/Student'
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

    // Check if it's a student or user
    let currentUser = null
    let currentStudent = null
    let userRole = null

    // Try to find as User first
    currentUser = await User.findById(decoded.userId)
    if (currentUser && currentUser.isActive) {
      userRole = currentUser.role
    } else {
      // Try to find as Student
      currentStudent = await Student.findById(decoded.userId)
      if (currentStudent && currentStudent.isActive) {
        userRole = 'student'
      }
    }

    if (!currentUser && !currentStudent) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Get lesson ID from route params
    const lessonId = getRouterParam(event, 'id')

    if (!lessonId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find lesson by ID
    const lesson = await Lesson.findById(lessonId)
      .populate('course', 'name code teacher')
      .populate('createdBy', 'name email')
      .lean()

    if (!lesson) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบบทเรียนที่ระบุ']
      })
    }

    // Students can only see published lessons
    if (userRole === 'student' && (!lesson.isPublished || !lesson.isActive)) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['คุณไม่มีสิทธิ์เข้าถึงบทเรียนนี้']
      })
    }

    // Transform lesson data
    const lessonResponse = {
      id: lesson._id.toString(),
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      course: lesson.course ? {
        id: (lesson.course as any)._id.toString(),
        name: (lesson.course as any).name,
        code: (lesson.course as any).code
      } : null,
      order: lesson.order,
      attachments: lesson.attachments || [],
      publishDate: lesson.publishDate,
      isPublished: lesson.isPublished,
      isActive: lesson.isActive,
      createdBy: lesson.createdBy ? {
        id: (lesson.createdBy as any)._id.toString(),
        name: (lesson.createdBy as any).name,
        email: (lesson.createdBy as any).email
      } : null,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    }

    return createSuccessResponse(lessonResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get lesson error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
