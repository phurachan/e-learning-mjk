import Quiz from '~/server/models/Quiz'
import QuizAttempt from '~/server/models/QuizAttempt'
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

    // Get quiz ID from route params
    const quizId = getRouterParam(event, 'id')

    if (!quizId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find existing quiz
    const existingQuiz = await Quiz.findById(quizId).populate('course')

    if (!existingQuiz) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบแบบทดสอบที่ระบุ']
      })
    }

    // If teacher, verify they are teaching this course
    if (currentUser.role === 'teacher') {
      const course = existingQuiz.course as any
      if (course.teacher.toString() !== currentUser._id.toString()) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['คุณไม่มีสิทธิ์ลบแบบทดสอบนี้']
        })
      }
    }

    // Check if there are any quiz attempts
    const attemptCount = await QuizAttempt.countDocuments({ quiz: quizId })
    if (attemptCount > 0) {
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: ['ไม่สามารถลบแบบทดสอบที่มีผู้ทำแล้ว กรุณาปิดใช้งานแทน']
      })
    }

    // Delete quiz
    await Quiz.findByIdAndDelete(quizId)

    return createSuccessResponse({ message: 'ลบแบบทดสอบสำเร็จ' })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Delete quiz error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
