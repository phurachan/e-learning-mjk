import Quiz from '~/server/models/Quiz'
import User from '~/server/models/User'
import Student from '~/server/models/Student'
import { createQuizFilterConfig } from '~/server/utils/filter_config/quiz'
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
      createQuizFilterConfig()
    )

    const { page, limit } = parsedQuery.pagination
    let filter = mongoFilter

    // Handle ObjectId conversion for course and lesson fields
    if (filter.course && typeof filter.course === 'string') {
      try {
        filter.course = new (await import('mongoose')).Types.ObjectId(filter.course)
      } catch (error) {
        console.warn('Invalid ObjectId for course filter:', filter.course)
        delete filter.course
      }
    }

    if (filter.lesson && typeof filter.lesson === 'string') {
      try {
        filter.lesson = new (await import('mongoose')).Types.ObjectId(filter.lesson)
      } catch (error) {
        console.warn('Invalid ObjectId for lesson filter:', filter.lesson)
        delete filter.lesson
      }
    }

    // Students can only see active quizzes that are available
    if (userRole === 'student') {
      filter.isActive = true
      const now = new Date()
      filter.$or = [
        { availableFrom: { $exists: false } },
        { availableFrom: { $lte: now } }
      ]
    }

    // Get total count
    const total = await Quiz.countDocuments(filter)

    // Get quizzes with pagination
    const quizzes = await Quiz.find(filter)
      .populate('course', 'name code')
      .populate('lesson', 'title order')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform quizzes data (hide correct answers for students)
    const transformedQuizzes = quizzes.map((quiz: any) => {
      const baseQuiz = {
        id: quiz._id.toString(),
        title: quiz.title,
        description: quiz.description,
        course: quiz.course ? {
          id: quiz.course._id.toString(),
          name: quiz.course.name,
          code: quiz.course.code
        } : null,
        lesson: quiz.lesson ? {
          id: quiz.lesson._id.toString(),
          title: quiz.lesson.title,
          order: quiz.lesson.order
        } : null,
        questionCount: quiz.questions.length,
        totalPoints: quiz.totalPoints,
        passingScore: quiz.passingScore,
        duration: quiz.duration,
        maxAttempts: quiz.maxAttempts,
        showResultsImmediately: quiz.showResultsImmediately,
        availableFrom: quiz.availableFrom,
        availableUntil: quiz.availableUntil,
        isActive: quiz.isActive,
        createdBy: quiz.createdBy ? {
          id: quiz.createdBy._id.toString(),
          name: quiz.createdBy.name,
          email: quiz.createdBy.email
        } : null,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      }

      // Include questions for admin/teacher only
      if (userRole !== 'student') {
        return {
          ...baseQuiz,
          questions: quiz.questions
        }
      }

      return baseQuiz
    })

    return createPaginatedResponse(transformedQuizzes, {
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

    console.error('Get quizzes error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
