import QuizAttempt from '~/server/models/QuizAttempt'
import User from '~/server/models/User'
import Student from '~/server/models/Student'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
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

    // Only admin and teacher can access this endpoint
    if (userRole === 'student') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['นักเรียนใช้ /api/quiz-attempts/my-attempts แทน']
      })
    }

    const query: any = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20

    let filter: any = {}

    // Filter by quiz
    if (query.quiz) {
      try {
        filter.quiz = new (await import('mongoose')).Types.ObjectId(query.quiz as string)
      } catch (error) {
        console.warn('Invalid ObjectId for quiz filter:', query.quiz)
      }
    }

    // Filter by student
    if (query.student) {
      try {
        filter.student = new (await import('mongoose')).Types.ObjectId(query.student as string)
      } catch (error) {
        console.warn('Invalid ObjectId for student filter:', query.student)
      }
    }

    // Filter by isGraded
    if (query.isGraded !== undefined) {
      filter.isGraded = query.isGraded === 'true'
    }

    // Filter by submitted attempts only
    if (query.submitted !== undefined && query.submitted === 'true') {
      filter.submittedAt = { $exists: true }
    }

    // Get total count
    const total = await QuizAttempt.countDocuments(filter)

    // Get quiz attempts with pagination
    const attempts = await QuizAttempt.find(filter)
      .populate('quiz', 'title totalPoints passingScore')
      .populate('student', 'studentId firstname lastname fullname')
      .populate('gradedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform attempts data
    const transformedAttempts = attempts.map((attempt: any) => ({
      id: attempt._id.toString(),
      quiz: attempt.quiz ? {
        id: attempt.quiz._id.toString(),
        title: attempt.quiz.title,
        totalPoints: attempt.quiz.totalPoints,
        passingScore: attempt.quiz.passingScore
      } : null,
      student: attempt.student ? {
        id: attempt.student._id.toString(),
        studentId: attempt.student.studentId,
        fullname: attempt.student.fullname
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
        id: attempt.gradedBy._id.toString(),
        name: attempt.gradedBy.name,
        email: attempt.gradedBy.email
      } : null,
      gradedAt: attempt.gradedAt,
      feedback: attempt.feedback,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt
    }))

    return createPaginatedResponse(transformedAttempts, {
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

    console.error('Get quiz attempts error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
