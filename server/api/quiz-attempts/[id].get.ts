import QuizAttempt from '~/server/models/QuizAttempt'
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

    // Get attempt ID from route params
    const attemptId = getRouterParam(event, 'id')

    if (!attemptId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find attempt
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz', 'title questions totalPoints passingScore showResultsImmediately')
      .populate('student', 'studentId firstname lastname fullname')
      .populate('gradedBy', 'name email')
      .lean()

    if (!attempt) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบการทำแบบทดสอบที่ระบุ']
      })
    }

    // If student, verify this attempt belongs to them
    if (userRole === 'student' && attempt.student._id.toString() !== userId.toString()) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้']
      })
    }

    // Transform attempt data
    const attemptResponse: any = {
      id: attempt._id.toString(),
      quiz: attempt.quiz ? {
        id: (attempt.quiz as any)._id.toString(),
        title: (attempt.quiz as any).title,
        totalPoints: (attempt.quiz as any).totalPoints,
        passingScore: (attempt.quiz as any).passingScore
      } : null,
      student: attempt.student ? {
        id: (attempt.student as any)._id.toString(),
        studentId: (attempt.student as any).studentId,
        fullname: (attempt.student as any).fullname
      } : null,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      isPassed: attempt.isPassed,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      timeSpent: attempt.timeSpent,
      attemptNumber: attempt.attemptNumber,
      isGraded: attempt.isGraded,
      gradedBy: attempt.gradedBy ? {
        id: (attempt.gradedBy as any)._id.toString(),
        name: (attempt.gradedBy as any).name,
        email: (attempt.gradedBy as any).email
      } : null,
      gradedAt: attempt.gradedAt,
      feedback: attempt.feedback,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt
    }

    // Include answers with questions for admin/teacher or if quiz shows results immediately
    const quiz = attempt.quiz as any
    if (userRole !== 'student' || (quiz.showResultsImmediately && attempt.submittedAt)) {
      // Merge answers with questions
      const answersWithQuestions = attempt.answers.map((answer: any) => {
        const question = quiz.questions[answer.questionIndex]
        return {
          questionIndex: answer.questionIndex,
          question: question ? {
            question: question.question,
            type: question.type,
            options: question.options || [],
            points: question.points,
            correctAnswers: userRole !== 'student' ? (question.correctAnswers || []) : undefined
          } : null,
          answer: answer.answer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          teacherScore: answer.teacherScore,
          teacherFeedback: answer.teacherFeedback
        }
      })

      attemptResponse.answers = answersWithQuestions
    }

    // For students, hide some info if results are not shown immediately and not graded
    if (userRole === 'student' && !quiz.showResultsImmediately && !attempt.isGraded) {
      delete attemptResponse.score
      delete attemptResponse.percentage
      delete attemptResponse.isPassed
      delete attemptResponse.answers
      attemptResponse.message = 'รอคุณครูประกาศผล'
    }

    return createSuccessResponse(attemptResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get quiz attempt error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
