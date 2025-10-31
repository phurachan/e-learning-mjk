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

    // Get attempt ID from route params
    const attemptId = getRouterParam(event, 'id')

    if (!attemptId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    const body = await readBody(event)

    // Find attempt
    const attempt = await QuizAttempt.findById(attemptId).populate('quiz')

    if (!attempt) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบการทำแบบทดสอบที่ระบุ']
      })
    }

    // Check if attempt has been submitted
    if (!attempt.submittedAt) {
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: ['ไม่สามารถให้คะแนนแบบทดสอบที่ยังไม่ได้ส่ง']
      })
    }

    // If teacher, verify they are teaching this course
    if (currentUser.role === 'teacher') {
      const quiz = attempt.quiz as any
      await quiz.populate('course')
      const course = quiz.course as any
      if (course.teacher.toString() !== currentUser._id.toString()) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['คุณไม่มีสิทธิ์ให้คะแนนแบบทดสอบนี้']
        })
      }
    }

    const quiz = attempt.quiz as any

    // Update teacher scores for answers
    if (body.answers && Array.isArray(body.answers)) {
      let totalScore = 0

      // Update each answer with teacher score
      for (const answerUpdate of body.answers) {
        const answerIndex = attempt.answers.findIndex(
          (a: any) => a.questionIndex === answerUpdate.questionIndex
        )

        if (answerIndex !== -1) {
          const question = quiz.questions[answerUpdate.questionIndex]

          // Validate teacher score
          if (answerUpdate.teacherScore !== undefined) {
            if (answerUpdate.teacherScore < 0 || answerUpdate.teacherScore > question.points) {
              throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
                details: [`คะแนนคำถามข้อ ${answerUpdate.questionIndex + 1} ต้องอยู่ระหว่าง 0-${question.points}`]
              })
            }

            attempt.answers[answerIndex].teacherScore = answerUpdate.teacherScore
            attempt.answers[answerIndex].teacherFeedback = answerUpdate.teacherFeedback
          }
        }
      }

      // Recalculate total score
      for (const answer of attempt.answers) {
        // Use teacher score if available, otherwise use auto-graded score
        const score = answer.teacherScore !== undefined ? answer.teacherScore : answer.pointsEarned
        totalScore += score || 0
      }

      attempt.score = totalScore
    }

    // Update overall feedback
    if (body.feedback !== undefined) {
      attempt.feedback = body.feedback
    }

    // Mark as graded
    attempt.isGraded = true
    attempt.gradedBy = currentUser._id
    attempt.gradedAt = new Date()

    // Calculate isPassed if passing score is set
    if (quiz.passingScore !== undefined) {
      attempt.isPassed = attempt.score >= quiz.passingScore
    }

    // Save updated attempt
    const savedAttempt = await attempt.save()

    // Populate relations
    await savedAttempt.populate([
      { path: 'quiz', select: 'title questions totalPoints passingScore' },
      { path: 'student', select: 'studentId firstname lastname fullname' },
      { path: 'gradedBy', select: 'name email' }
    ])

    // Transform response
    const attemptResponse = {
      id: savedAttempt._id.toString(),
      quiz: {
        id: (savedAttempt.quiz as any)._id.toString(),
        title: (savedAttempt.quiz as any).title,
        totalPoints: (savedAttempt.quiz as any).totalPoints,
        passingScore: (savedAttempt.quiz as any).passingScore
      },
      student: {
        id: (savedAttempt.student as any)._id.toString(),
        studentId: (savedAttempt.student as any).studentId,
        fullname: (savedAttempt.student as any).fullname
      },
      score: savedAttempt.score,
      maxScore: savedAttempt.maxScore,
      percentage: savedAttempt.percentage,
      isPassed: savedAttempt.isPassed,
      isGraded: savedAttempt.isGraded,
      gradedBy: {
        id: (savedAttempt.gradedBy as any)._id.toString(),
        name: (savedAttempt.gradedBy as any).name,
        email: (savedAttempt.gradedBy as any).email
      },
      gradedAt: savedAttempt.gradedAt,
      feedback: savedAttempt.feedback,
      answers: savedAttempt.answers.map((answer: any) => {
        const question = (savedAttempt.quiz as any).questions[answer.questionIndex]
        return {
          questionIndex: answer.questionIndex,
          question: question ? {
            question: question.question,
            type: question.type,
            points: question.points
          } : null,
          answer: answer.answer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          teacherScore: answer.teacherScore,
          teacherFeedback: answer.teacherFeedback
        }
      }),
      message: 'ให้คะแนนสำเร็จ'
    }

    return createSuccessResponse(attemptResponse)
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

    console.error('Grade quiz attempt error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
