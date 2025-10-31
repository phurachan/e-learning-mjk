import Lesson from '~/server/models/Lesson'
import User from '~/server/models/User'
import Student from '~/server/models/Student'
import { createLessonFilterConfig } from '~/server/utils/filter_config/lesson'
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

    const query: any = getQuery(event)

    // Parse query and build MongoDB filter
    const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
      query,
      createLessonFilterConfig()
    )

    const { page, limit } = parsedQuery.pagination
    let filter = mongoFilter

    // Handle ObjectId conversion for course field
    if (filter.course && typeof filter.course === 'string') {
      try {
        filter.course = new (await import('mongoose')).Types.ObjectId(filter.course)
      } catch (error) {
        console.warn('Invalid ObjectId for course filter:', filter.course)
        delete filter.course
      }
    }

    // Students can only see published lessons
    if (userRole === 'student') {
      filter.isPublished = true
      filter.isActive = true
    }

    // Get total count
    const total = await Lesson.countDocuments(filter)

    // Get lessons with pagination
    const lessons = await Lesson.find(filter)
      .populate('course', 'name code teacher')
      .populate('createdBy', 'name email')
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform lessons data
    const transformedLessons = lessons.map((lesson: any) => ({
      id: lesson._id.toString(),
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      course: lesson.course ? {
        id: lesson.course._id.toString(),
        name: lesson.course.name,
        code: lesson.course.code
      } : null,
      order: lesson.order,
      attachments: lesson.attachments || [],
      publishDate: lesson.publishDate,
      isPublished: lesson.isPublished,
      isActive: lesson.isActive,
      createdBy: lesson.createdBy ? {
        id: lesson.createdBy._id.toString(),
        name: lesson.createdBy.name,
        email: lesson.createdBy.email
      } : null,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    }))

    return createPaginatedResponse(transformedLessons, {
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

    console.error('Get lessons error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
