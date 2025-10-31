import Quiz from '~/server/models/Quiz'
import QuizAttempt from '~/server/models/QuizAttempt'
import Student from '~/server/models/Student'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

// Helper function to check if answer is correct
function checkAnswer(question: any, answer: string | string[]): boolean {
  if (!question.correctAnswers || question.correctAnswers.length === 0) {
    return false
  }

  if (question.type === 'checkboxes') {
    // For checkboxes, compare arrays
    if (!Array.isArray(answer)) return false
    const answerSet = new Set(answer)
    const correctSet = new Set(question.correctAnswers)
    if (answerSet.size !== correctSet.size) return false
    for (const item of answerSet) {
      if (!correctSet.has(item)) return false
    }
    return true
  } else {
    // For multiple_choice and true_false, compare single values
    const answerStr = Array.isArray(answer) ? answer[0] : answer
    return question.correctAnswers.includes(answerStr)
  }
}

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

    // Get attempt ID from route params
    const attemptId = getRouterParam(event, 'id')

    if (!attemptId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.answers || !Array.isArray(body.answers)) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['answers']
      })
    }

    // Find attempt
    const attempt = await QuizAttempt.findById(attemptId).populate('quiz')

    if (!attempt) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบการทำแบบทดสอบที่ระบุ']
      })
    }

    // Verify this attempt belongs to current student
    if (attempt.student.toString() !== currentStudent._id.toString()) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['คุณไม่มีสิทธิ์ส่งการทำแบบทดสอบนี้']
      })
    }

    // Check if already submitted
    if (attempt.submittedAt) {
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: ['แบบทดสอบนี้ถูกส่งแล้ว']
      })
    }

    const quiz = attempt.quiz as any

    // Check if quiz is still available
    const now = new Date()
    if (quiz.availableUntil && quiz.availableUntil < now) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['แบบทดสอบนี้หมดเวลาแล้ว']
      })
    }

    // Check duration if set
    if (quiz.duration) {
      const elapsedMinutes = (now.getTime() - attempt.startedAt.getTime()) / (1000 * 60)
      if (elapsedMinutes > quiz.duration) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['เกินเวลาที่กำหนดในการทำแบบทดสอบ']
        })
      }
    }

    // Auto-grade answers
    let totalScore = 0
    let needsManualGrading = false
    const gradedAnswers = body.answers.map((answer: any) => {
      const question = quiz.questions[answer.questionIndex]

      if (!question) {
        return {
          questionIndex: answer.questionIndex,
          answer: answer.answer,
          isCorrect: false,
          pointsEarned: 0
        }
      }

      // Auto-grade if question type is multiple_choice, true_false, or checkboxes
      if (['multiple_choice', 'true_false', 'checkboxes'].includes(question.type)) {
        const isCorrect = checkAnswer(question, answer.answer)
        const pointsEarned = isCorrect ? question.points : 0
        totalScore += pointsEarned

        return {
          questionIndex: answer.questionIndex,
          answer: answer.answer,
          isCorrect,
          pointsEarned
        }
      } else {
        // short_answer and essay need manual grading
        needsManualGrading = true
        return {
          questionIndex: answer.questionIndex,
          answer: answer.answer,
          isCorrect: undefined,
          pointsEarned: 0
        }
      }
    })

    // Calculate time spent
    const timeSpentSeconds = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000)

    // Update attempt
    attempt.answers = gradedAnswers
    attempt.score = totalScore
    attempt.submittedAt = now
    attempt.timeSpent = timeSpentSeconds
    attempt.isGraded = !needsManualGrading

    // Calculate isPassed if passing score is set and fully graded
    if (quiz.passingScore !== undefined && !needsManualGrading) {
      attempt.isPassed = totalScore >= quiz.passingScore
    }

    // Save updated attempt
    const savedAttempt = await attempt.save()

    // Populate relations
    await savedAttempt.populate([
      { path: 'quiz', select: 'title totalPoints passingScore showResultsImmediately' },
      { path: 'student', select: 'studentId firstname lastname fullname' }
    ])

    // Prepare response
    const response: any = {
      id: savedAttempt._id.toString(),
      quiz: {
        id: (savedAttempt.quiz as any)._id.toString(),
        title: (savedAttempt.quiz as any).title,
        totalPoints: (savedAttempt.quiz as any).totalPoints,
        passingScore: (savedAttempt.quiz as any).passingScore
      },
      submittedAt: savedAttempt.submittedAt,
      timeSpent: savedAttempt.timeSpent,
      attemptNumber: savedAttempt.attemptNumber,
      isGraded: savedAttempt.isGraded,
      message: 'ส่งแบบทดสอบสำเร็จ'
    }

    // Include score only if quiz shows results immediately or if it needs manual grading
    if ((savedAttempt.quiz as any).showResultsImmediately || !needsManualGrading) {
      response.score = savedAttempt.score
      response.maxScore = savedAttempt.maxScore
      response.percentage = savedAttempt.percentage
      response.isPassed = savedAttempt.isPassed
    }

    if (!savedAttempt.isGraded) {
      response.message = 'ส่งแบบทดสอบสำเร็จ รอคุณครูให้คะแนน'
    }

    return createSuccessResponse(response)
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

    console.error('Submit quiz attempt error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
