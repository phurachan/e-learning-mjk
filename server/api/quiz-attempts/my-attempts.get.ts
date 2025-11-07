import QuizAttempt from '~/server/models/QuizAttempt'
import Student from '~/server/models/Student'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { parseQueryAndBuildFilter } from '~/server/utils/queryParser'
import { createQuizAttemptFilterConfig } from '~/server/utils/filter_config/quizAttempt'
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

    // Parse query and build MongoDB filter using filter config
    const { parsedQuery, mongoFilter } = parseQueryAndBuildFilter(
      query,
      createQuizAttemptFilterConfig()
    )

    // Always filter by current student
    mongoFilter.student = currentStudent._id

    // Filter by submitted attempts only if specified
    if (query.submitted === 'true' || query.submitted === true) {
      mongoFilter.submittedAt = { $exists: true, $ne: null }
    }

    // Get total count
    const total = await QuizAttempt.countDocuments(mongoFilter)

    // Get quiz attempts with pagination
    const attempts = await QuizAttempt.find(mongoFilter)
      .populate('quiz', 'title totalPoints passingScore showResultsImmediately course')
      .populate('student', 'studentId firstname lastname fullname')
      .populate('gradedBy', 'name email')
      .sort(parsedQuery.sort)
      .skip(parsedQuery.skip)
      .limit(parsedQuery.limit)
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
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      total,
      pages: Math.ceil(total / parsedQuery.limit)
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
