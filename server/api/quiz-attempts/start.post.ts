import Quiz from '~/server/models/Quiz'
import QuizAttempt from '~/server/models/QuizAttempt'
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

    // Find current student
    const currentStudent = await Student.findById(decoded.userId)

    if (!currentStudent || !currentStudent.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.quizId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['quizId']
      })
    }

    // Find quiz
    const quiz = await Quiz.findById(body.quizId)

    if (!quiz) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบแบบทดสอบที่ระบุ']
      })
    }

    // Check if quiz is active
    if (!quiz.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['แบบทดสอบนี้ไม่เปิดใช้งาน']
      })
    }

    // Check availability dates
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

    // Check if student has an unfinished attempt
    const unfinishedAttempt = await QuizAttempt.findOne({
      quiz: body.quizId,
      student: currentStudent._id,
      submittedAt: { $exists: false }
    })

    if (unfinishedAttempt) {
      // Check if the unfinished attempt is expired
      if (quiz.duration) {
        const elapsedMinutes = (now.getTime() - unfinishedAttempt.startedAt.getTime()) / (1000 * 60)

        if (elapsedMinutes > quiz.duration) {
          // Auto-submit expired attempt with 0 score
          unfinishedAttempt.submittedAt = now
          unfinishedAttempt.timeSpent = Math.floor((now.getTime() - unfinishedAttempt.startedAt.getTime()) / 1000)
          unfinishedAttempt.isGraded = true
          unfinishedAttempt.score = 0
          unfinishedAttempt.percentage = 0
          unfinishedAttempt.isPassed = false
          await unfinishedAttempt.save()

          // Continue to create new attempt (fall through)
        } else {
          // Still has time, block starting new attempt
          throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
            details: ['คุณมีการทำแบบทดสอบที่ยังไม่เสร็จ กรุณาทำให้เสร็จก่อน']
          })
        }
      } else {
        // No duration limit, block starting new attempt
        throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
          details: ['คุณมีการทำแบบทดสอบที่ยังไม่เสร็จ กรุณาทำให้เสร็จก่อน']
        })
      }
    }

    // Check max attempts
    if (quiz.maxAttempts > 0) {
      const attemptCount = await QuizAttempt.countDocuments({
        quiz: body.quizId,
        student: currentStudent._id,
        submittedAt: { $exists: true }
      })

      if (attemptCount >= quiz.maxAttempts) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['คุณทำแบบทดสอบนี้ครบจำนวนครั้งที่กำหนดแล้ว']
        })
      }
    }

    // Count current attempt number
    const totalAttempts = await QuizAttempt.countDocuments({
      quiz: body.quizId,
      student: currentStudent._id
    })

    // Create new attempt
    const newAttempt = new QuizAttempt({
      quiz: body.quizId,
      student: currentStudent._id,
      answers: [],
      score: 0,
      maxScore: quiz.totalPoints,
      percentage: 0,
      startedAt: new Date(),
      attemptNumber: totalAttempts + 1,
      isGraded: false
    })

    const savedAttempt = await newAttempt.save()

    // Populate relations
    await savedAttempt.populate([
      { path: 'quiz', select: 'title totalPoints duration' },
      { path: 'student', select: 'studentId firstname lastname fullname' }
    ])

    return createSuccessResponse({
      id: savedAttempt._id.toString(),
      quiz: {
        id: (savedAttempt.quiz as any)._id.toString(),
        title: (savedAttempt.quiz as any).title,
        totalPoints: (savedAttempt.quiz as any).totalPoints,
        duration: (savedAttempt.quiz as any).duration
      },
      startedAt: savedAttempt.startedAt,
      attemptNumber: savedAttempt.attemptNumber,
      message: 'เริ่มทำแบบทดสอบสำเร็จ'
    })
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

    console.error('Start quiz attempt error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
