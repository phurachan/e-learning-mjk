import Quiz from '~/server/models/Quiz'
import Course from '~/server/models/Course'
import Lesson from '~/server/models/Lesson'
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

    const body = await readBody(event)

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
          details: ['คุณไม่มีสิทธิ์แก้ไขแบบทดสอบนี้']
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
          details: ['คุณไม่มีสิทธิ์ย้ายแบบทดสอบไปยังรายวิชานี้']
        })
      }
    }

    // Check if lesson exists if provided
    if (body.lesson) {
      const lesson = await Lesson.findById(body.lesson)
      const courseId = body.course || existingQuiz.course
      if (!lesson || lesson.course.toString() !== courseId.toString()) {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['ไม่พบบทเรียนที่ระบุหรือบทเรียนไม่อยู่ในรายวิชานี้']
        })
      }
    }

    // Validate questions if provided
    if (body.questions) {
      if (body.questions.length === 0) {
        throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
          details: ['แบบทดสอบต้องมีคำถามอย่างน้อย 1 ข้อ']
        })
      }

      for (const question of body.questions) {
        if (!question.question || !question.type || question.points === undefined) {
          throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
            details: ['คำถามไม่ครบถ้วน: ต้องมี question, type, และ points']
          })
        }

        // Validate question types that need options
        if (['multiple_choice', 'true_false', 'checkboxes'].includes(question.type)) {
          if (!question.options || question.options.length === 0) {
            throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
              details: [`คำถามประเภท ${question.type} ต้องมีตัวเลือก (options)`]
            })
          }
        }

        // Validate auto-gradable questions must have correct answers
        if (['multiple_choice', 'true_false', 'checkboxes'].includes(question.type)) {
          if (!question.correctAnswers || question.correctAnswers.length === 0) {
            throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
              details: [`คำถามประเภท ${question.type} ต้องมีคำตอบที่ถูกต้อง (correctAnswers)`]
            })
          }
        }
      }
    }

    // Update quiz data
    if (body.title) existingQuiz.title = body.title.trim()
    if (body.description !== undefined) existingQuiz.description = body.description?.trim()
    if (body.course) existingQuiz.course = body.course
    if (body.lesson !== undefined) existingQuiz.lesson = body.lesson
    if (body.questions) existingQuiz.questions = body.questions
    if (body.passingScore !== undefined) existingQuiz.passingScore = body.passingScore
    if (body.duration !== undefined) existingQuiz.duration = body.duration
    if (body.maxAttempts !== undefined) existingQuiz.maxAttempts = body.maxAttempts
    if (body.showResultsImmediately !== undefined) existingQuiz.showResultsImmediately = body.showResultsImmediately
    if (body.availableFrom !== undefined) existingQuiz.availableFrom = body.availableFrom
    if (body.availableUntil !== undefined) existingQuiz.availableUntil = body.availableUntil
    if (body.isActive !== undefined) existingQuiz.isActive = body.isActive

    // Save updated quiz
    const updatedQuiz = await existingQuiz.save()

    // Populate relations
    await updatedQuiz.populate([
      { path: 'course', select: 'name code' },
      { path: 'lesson', select: 'title order' },
      { path: 'createdBy', select: 'name email' }
    ])

    // Return quiz data
    const quizResponse = {
      id: updatedQuiz._id.toString(),
      title: updatedQuiz.title,
      description: updatedQuiz.description,
      course: {
        id: (updatedQuiz.course as any)._id.toString(),
        name: (updatedQuiz.course as any).name,
        code: (updatedQuiz.course as any).code
      },
      lesson: updatedQuiz.lesson ? {
        id: (updatedQuiz.lesson as any)._id.toString(),
        title: (updatedQuiz.lesson as any).title,
        order: (updatedQuiz.lesson as any).order
      } : null,
      questions: updatedQuiz.questions,
      totalPoints: updatedQuiz.totalPoints,
      passingScore: updatedQuiz.passingScore,
      duration: updatedQuiz.duration,
      maxAttempts: updatedQuiz.maxAttempts,
      showResultsImmediately: updatedQuiz.showResultsImmediately,
      availableFrom: updatedQuiz.availableFrom,
      availableUntil: updatedQuiz.availableUntil,
      isActive: updatedQuiz.isActive,
      createdBy: {
        id: (updatedQuiz.createdBy as any)._id.toString(),
        name: (updatedQuiz.createdBy as any).name,
        email: (updatedQuiz.createdBy as any).email
      },
      createdAt: updatedQuiz.createdAt,
      updatedAt: updatedQuiz.updatedAt
    }

    return createSuccessResponse(quizResponse)
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

    console.error('Update quiz error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
