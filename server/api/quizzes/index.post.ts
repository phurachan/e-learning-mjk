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

    const body = await readBody(event)

    // Validate required fields
    if (!body.title || !body.course || !body.questions || body.questions.length === 0) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['title', 'course', 'questions']
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
        details: ['คุณไม่มีสิทธิ์สร้างแบบทดสอบในรายวิชานี้']
      })
    }

    // Check if lesson exists if provided
    if (body.lesson) {
      const lesson = await Lesson.findById(body.lesson)
      if (!lesson || lesson.course.toString() !== body.course) {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['ไม่พบบทเรียนที่ระบุหรือบทเรียนไม่อยู่ในรายวิชานี้']
        })
      }
    }

    // Validate questions
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

    // Create quiz data
    const quizData = {
      title: body.title.trim(),
      description: body.description?.trim(),
      course: body.course,
      lesson: body.lesson,
      questions: body.questions,
      totalPoints: 0, // Will be calculated by pre-save hook
      passingScore: body.passingScore,
      duration: body.duration,
      maxAttempts: body.maxAttempts !== undefined ? body.maxAttempts : 1,
      showResultsImmediately: body.showResultsImmediately !== undefined ? body.showResultsImmediately : false,
      availableFrom: body.availableFrom,
      availableUntil: body.availableUntil,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: currentUser._id
    }

    // Create new quiz
    const newQuiz = new Quiz(quizData)
    const savedQuiz = await newQuiz.save()

    // Populate relations
    await savedQuiz.populate([
      { path: 'course', select: 'name code' },
      { path: 'lesson', select: 'title order' },
      { path: 'createdBy', select: 'name email' }
    ])

    // Return quiz data
    const quizResponse = {
      id: savedQuiz._id.toString(),
      title: savedQuiz.title,
      description: savedQuiz.description,
      course: {
        id: (savedQuiz.course as any)._id.toString(),
        name: (savedQuiz.course as any).name,
        code: (savedQuiz.course as any).code
      },
      lesson: savedQuiz.lesson ? {
        id: (savedQuiz.lesson as any)._id.toString(),
        title: (savedQuiz.lesson as any).title,
        order: (savedQuiz.lesson as any).order
      } : null,
      questions: savedQuiz.questions,
      totalPoints: savedQuiz.totalPoints,
      passingScore: savedQuiz.passingScore,
      duration: savedQuiz.duration,
      maxAttempts: savedQuiz.maxAttempts,
      showResultsImmediately: savedQuiz.showResultsImmediately,
      availableFrom: savedQuiz.availableFrom,
      availableUntil: savedQuiz.availableUntil,
      isActive: savedQuiz.isActive,
      createdBy: {
        id: (savedQuiz.createdBy as any)._id.toString(),
        name: (savedQuiz.createdBy as any).name,
        email: (savedQuiz.createdBy as any).email
      },
      createdAt: savedQuiz.createdAt,
      updatedAt: savedQuiz.updatedAt
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

    console.error('Create quiz error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
