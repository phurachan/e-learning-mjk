import QuizAttempt from '~/server/models/QuizAttempt'
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

    // Find current student
    const currentStudent = await Student.findById(decoded.userId)

    if (!currentStudent || !currentStudent.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    const query: any = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20

    let filter: any = {
      student: currentStudent._id
    }

    // Filter by quiz
    if (query.quiz) {
      try {
        filter.quiz = new (await import('mongoose')).Types.ObjectId(query.quiz as string)
      } catch (error) {
        console.warn('Invalid ObjectId for quiz filter:', query.quiz)
      }
    }

    // Filter by submitted attempts only
    if (query.submitted !== undefined && query.submitted === 'true') {
      filter.submittedAt = { $exists: true }
    }

    // Get total count
    const total = await QuizAttempt.countDocuments(filter)

    // Get quiz attempts with pagination
    const attempts = await QuizAttempt.find(filter)
      .populate('quiz', 'title totalPoints passingScore showResultsImmediately')
      .populate('student', 'studentId firstname lastname fullname')
      .populate('gradedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Transform attempts data
    const transformedAttempts = attempts.map((attempt: any) => {
      const quiz = attempt.quiz
      const baseAttempt = {
        id: attempt._id.toString(),
        quiz: quiz ? {
          id: quiz._id.toString(),
          title: quiz.title,
          totalPoints: quiz.totalPoints,
          passingScore: quiz.passingScore
        } : null,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        timeSpent: attempt.timeSpent,
        attemptNumber: attempt.attemptNumber,
        isGraded: attempt.isGraded,
        gradedAt: attempt.gradedAt,
        feedback: attempt.feedback,
        createdAt: attempt.createdAt,
        updatedAt: attempt.updatedAt
      }

      // Include scores only if quiz shows results immediately or if graded
      if ((quiz && quiz.showResultsImmediately && attempt.submittedAt) || attempt.isGraded) {
        return {
          ...baseAttempt,
          score: attempt.score,
          maxScore: attempt.maxScore,
          percentage: attempt.percentage,
          isPassed: attempt.isPassed
        }
      }

      return baseAttempt
    })

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

    console.error('Get my quiz attempts error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
