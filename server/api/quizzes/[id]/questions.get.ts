import Quiz from '~/server/models/Quiz'
import User from '~/server/models/User'
import Student from '~/server/models/Student'
import QuizAttempt from '~/server/models/QuizAttempt'
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
    let userId = null

    // Try to find as User first
    currentUser = await User.findById(decoded.userId)
    if (currentUser && currentUser.isActive) {
      userRole = currentUser.role
      userId = currentUser._id
    } else {
      // Try to find as Student
      currentStudent = await Student.findById(decoded.userId)
      if (currentStudent && currentStudent.isActive) {
        userRole = 'student'
        userId = currentStudent._id
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
      .lean()

    if (!quiz) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบแบบทดสอบที่ระบุ']
      })
    }

    // Students need additional checks
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

      // Check max attempts
      if (quiz.maxAttempts > 0) {
        const attemptCount = await QuizAttempt.countDocuments({
          quiz: quizId,
          student: userId,
          submittedAt: { $exists: true }
        })

        if (attemptCount >= quiz.maxAttempts) {
          throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
            details: ['คุณทำแบบทดสอบนี้ครบจำนวนครั้งที่กำหนดแล้ว']
          })
        }
      }
    }

    // Transform questions - hide correct answers for students
    const questions = quiz.questions.map((q: any, index: number) => {
      const baseQuestion = {
        index,
        question: q.question,
        type: q.type,
        options: q.options || [],
        points: q.points,
        order: q.order
      }

      // Include correct answers only for admin/teacher
      if (userRole !== 'student') {
        return {
          ...baseQuestion,
          correctAnswers: q.correctAnswers || []
        }
      }

      return baseQuestion
    })

    return createSuccessResponse({
      quizId: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      totalPoints: quiz.totalPoints,
      duration: quiz.duration,
      questions
    })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get quiz questions error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
