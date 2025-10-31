import Quiz from '~/server/models/Quiz'
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

    // Get quiz ID from route params
    const quizId = getRouterParam(event, 'id')

    if (!quizId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find quiz by ID
    const quiz = await Quiz.findById(quizId)
      .populate('course', 'name code')
      .populate('lesson', 'title order')
      .populate('createdBy', 'name email')
      .lean()

    if (!quiz) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบแบบทดสอบที่ระบุ']
      })
    }

    // Students can only see active quizzes that are available
    if (userRole === 'student') {
      if (!quiz.isActive) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['แบบทดสอบนี้ไม่เปิดใช้งาน']
        })
      }

      const now = new Date()
      if (quiz.availableFrom && quiz.availableFrom > now) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['แบบทดสอบนี้ยังไม่เปิดให้ทำ']
        })
      }

      if (quiz.availableUntil && quiz.availableUntil < now) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['แบบทดสอบนี้หมดเวลาแล้ว']
        })
      }
    }

    // Transform quiz data
    const quizResponse = {
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      course: quiz.course ? {
        id: (quiz.course as any)._id.toString(),
        name: (quiz.course as any).name,
        code: (quiz.course as any).code
      } : null,
      lesson: quiz.lesson ? {
        id: (quiz.lesson as any)._id.toString(),
        title: (quiz.lesson as any).title,
        order: (quiz.lesson as any).order
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
        id: (quiz.createdBy as any)._id.toString(),
        name: (quiz.createdBy as any).name,
        email: (quiz.createdBy as any).email
      } : null,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt
    }

    // Include full questions for admin/teacher only
    if (userRole !== 'student') {
      return createSuccessResponse({
        ...quizResponse,
        questions: quiz.questions
      })
    }

    return createSuccessResponse(quizResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get quiz error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
