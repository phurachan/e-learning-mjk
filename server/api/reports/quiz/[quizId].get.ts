import QuizAttempt from '~/server/models/QuizAttempt'
import Quiz from '~/server/models/Quiz'
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

    // Find current user (only admin and teacher)
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    if (currentUser.role !== 'admin' && currentUser.role !== 'teacher') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    // Get quiz ID from route params
    const quizId = getRouterParam(event, 'quizId')

    if (!quizId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find quiz
    const quiz = await Quiz.findById(quizId)
      .populate('course', 'name code teacher')
      .populate('lesson', 'title order')
      .populate('createdBy', 'name email')

    if (!quiz) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบแบบทดสอบที่ระบุ']
      })
    }

    // If teacher, verify they are teaching this course
    if (currentUser.role === 'teacher') {
      const course = quiz.course as any
      if (course.teacher.toString() !== currentUser._id.toString()) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['คุณไม่มีสิทธิ์ดูรายงานของแบบทดสอบนี้']
        })
      }
    }

    // Get all attempts for this quiz
    const attempts = await QuizAttempt.find({
      quiz: quizId,
      submittedAt: { $exists: true }
    })
      .populate('student', 'studentId firstname lastname fullname room')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 })
      .lean()

    // Calculate statistics
    const totalAttempts = attempts.length
    const gradedAttempts = attempts.filter((a: any) => a.isGraded)
    const ungradedAttempts = attempts.filter((a: any) => !a.isGraded)

    const totalScore = gradedAttempts.reduce((sum, attempt: any) => sum + attempt.score, 0)
    const totalMaxScore = gradedAttempts.reduce((sum, attempt: any) => sum + attempt.maxScore, 0)
    const averageScore = gradedAttempts.length > 0 ? totalScore / gradedAttempts.length : 0
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0

    const passedAttempts = gradedAttempts.filter((attempt: any) => attempt.isPassed).length
    const passRate = gradedAttempts.length > 0 ? (passedAttempts / gradedAttempts.length) * 100 : 0

    // Calculate score distribution
    const scoreRanges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    }

    gradedAttempts.forEach((attempt: any) => {
      const percentage = attempt.percentage
      if (percentage <= 20) scoreRanges['0-20']++
      else if (percentage <= 40) scoreRanges['21-40']++
      else if (percentage <= 60) scoreRanges['41-60']++
      else if (percentage <= 80) scoreRanges['61-80']++
      else scoreRanges['81-100']++
    })

    // Get unique students
    const uniqueStudents = new Set()
    attempts.forEach((attempt: any) => {
      if (attempt.student) {
        uniqueStudents.add(attempt.student._id.toString())
      }
    })

    // Group attempts by student
    const studentPerformance: any = {}
    for (const attempt of attempts) {
      const student = (attempt as any).student
      if (!student) continue

      const studentId = student._id.toString()
      if (!studentPerformance[studentId]) {
        studentPerformance[studentId] = {
          student: {
            id: student._id.toString(),
            studentId: student.studentId,
            fullname: student.fullname
          },
          attempts: []
        }
      }

      studentPerformance[studentId].attempts.push({
        id: (attempt as any)._id.toString(),
        attemptNumber: (attempt as any).attemptNumber,
        score: (attempt as any).score,
        maxScore: (attempt as any).maxScore,
        percentage: (attempt as any).percentage,
        isPassed: (attempt as any).isPassed,
        isGraded: (attempt as any).isGraded,
        submittedAt: (attempt as any).submittedAt,
        timeSpent: (attempt as any).timeSpent
      })
    }

    // Calculate best attempt for each student
    const studentBestAttempts = Object.values(studentPerformance).map((data: any) => {
      const gradedStudentAttempts = data.attempts.filter((a: any) => a.isGraded)
      const bestAttempt = gradedStudentAttempts.reduce((best: any, current: any) => {
        return (!best || current.percentage > best.percentage) ? current : best
      }, null)

      return {
        student: data.student,
        totalAttempts: data.attempts.length,
        gradedAttempts: gradedStudentAttempts.length,
        bestAttempt: bestAttempt ? {
          attemptNumber: bestAttempt.attemptNumber,
          score: bestAttempt.score,
          percentage: bestAttempt.percentage,
          isPassed: bestAttempt.isPassed
        } : null,
        allAttempts: data.attempts
      }
    })

    // Sort by best percentage descending
    studentBestAttempts.sort((a: any, b: any) => {
      const aPercentage = a.bestAttempt ? a.bestAttempt.percentage : 0
      const bPercentage = b.bestAttempt ? b.bestAttempt.percentage : 0
      return bPercentage - aPercentage
    })

    // Question analysis
    const questionAnalysis = quiz.questions.map((question: any, index: number) => {
      const questionAttempts = gradedAttempts.filter((attempt: any) => {
        return attempt.answers.some((answer: any) => answer.questionIndex === index)
      })

      const correctAnswers = questionAttempts.filter((attempt: any) => {
        const answer = attempt.answers.find((a: any) => a.questionIndex === index)
        return answer && (answer.isCorrect === true || (answer.teacherScore !== undefined && answer.teacherScore === question.points))
      }).length

      const averagePoints = questionAttempts.reduce((sum, attempt: any) => {
        const answer = attempt.answers.find((a: any) => a.questionIndex === index)
        const points = answer ? (answer.teacherScore !== undefined ? answer.teacherScore : answer.pointsEarned) : 0
        return sum + points
      }, 0) / (questionAttempts.length || 1)

      return {
        questionIndex: index,
        question: question.question,
        type: question.type,
        points: question.points,
        totalAttempts: questionAttempts.length,
        correctAnswers,
        correctRate: questionAttempts.length > 0 ? (correctAnswers / questionAttempts.length) * 100 : 0,
        averagePoints: Math.round(averagePoints * 100) / 100
      }
    })

    // Quiz report
    const reportResponse = {
      quiz: {
        id: quiz._id.toString(),
        title: quiz.title,
        description: quiz.description,
        course: quiz.course ? {
          id: (quiz.course as any)._id.toString(),
          name: (quiz.course as any).name,
          code: (quiz.course as any).code
        } : null,
        lesson: quiz.lesson ? {
          id: (quiz.lesson as any)._id.toString(),
          title: (quiz.lesson as any).title,
          order: (quiz.lesson as any).order
        } : null,
        totalPoints: quiz.totalPoints,
        passingScore: quiz.passingScore,
        questionCount: quiz.questions.length,
        maxAttempts: quiz.maxAttempts,
        duration: quiz.duration
      },
      summary: {
        totalAttempts,
        totalStudents: uniqueStudents.size,
        gradedAttempts: gradedAttempts.length,
        ungradedAttempts: ungradedAttempts.length,
        averageScore: Math.round(averageScore * 100) / 100,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        passedAttempts,
        passRate: Math.round(passRate * 100) / 100,
        scoreDistribution: scoreRanges
      },
      studentPerformance: studentBestAttempts,
      questionAnalysis
    }

    return createSuccessResponse(reportResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get quiz report error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
