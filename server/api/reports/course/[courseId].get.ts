import QuizAttempt from '~/server/models/QuizAttempt'
import Course from '~/server/models/Course'
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

    // Get course ID from route params
    const courseId = getRouterParam(event, 'courseId')

    if (!courseId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find course
    const course = await Course.findById(courseId)
      .populate('teacher', 'name email')
      .populate('rooms', 'name code grade section')

    if (!course) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบรายวิชาที่ระบุ']
      })
    }

    // If teacher, verify they are teaching this course
    if (currentUser.role === 'teacher' && course.teacher._id.toString() !== currentUser._id.toString()) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['คุณไม่มีสิทธิ์ดูรายงานของรายวิชานี้']
      })
    }

    // Get all quizzes for this course
    const quizzes = await Quiz.find({ course: courseId }).select('_id title totalPoints passingScore')

    const quizIds = quizzes.map(q => q._id)

    // Get all quiz attempts for quizzes in this course
    const attempts = await QuizAttempt.find({
      quiz: { $in: quizIds },
      submittedAt: { $exists: true },
      isGraded: true
    })
      .populate('quiz', 'title totalPoints passingScore')
      .populate('student', 'studentId firstname lastname fullname room')
      .sort({ submittedAt: -1 })
      .lean()

    // Calculate course statistics
    const totalAttempts = attempts.length
    const totalScore = attempts.reduce((sum, attempt: any) => sum + attempt.score, 0)
    const totalMaxScore = attempts.reduce((sum, attempt: any) => sum + attempt.maxScore, 0)
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
    const passedAttempts = attempts.filter((attempt: any) => attempt.isPassed).length
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0

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
          totalAttempts: 0,
          totalScore: 0,
          totalMaxScore: 0,
          passedCount: 0
        }
      }

      studentPerformance[studentId].totalAttempts++
      studentPerformance[studentId].totalScore += (attempt as any).score
      studentPerformance[studentId].totalMaxScore += (attempt as any).maxScore
      if ((attempt as any).isPassed) {
        studentPerformance[studentId].passedCount++
      }
    }

    // Calculate student averages
    const studentReports = Object.values(studentPerformance).map((data: any) => ({
      student: data.student,
      totalAttempts: data.totalAttempts,
      totalScore: data.totalScore,
      totalMaxScore: data.totalMaxScore,
      averagePercentage: data.totalMaxScore > 0
        ? Math.round((data.totalScore / data.totalMaxScore) * 100 * 100) / 100
        : 0,
      passedCount: data.passedCount,
      passRate: data.totalAttempts > 0
        ? Math.round((data.passedCount / data.totalAttempts) * 100 * 100) / 100
        : 0
    }))

    // Sort by average percentage descending
    studentReports.sort((a: any, b: any) => b.averagePercentage - a.averagePercentage)

    // Group attempts by quiz
    const quizPerformance: any = {}
    for (const attempt of attempts) {
      const quiz = (attempt as any).quiz
      if (!quiz) continue

      const quizId = quiz._id.toString()
      if (!quizPerformance[quizId]) {
        quizPerformance[quizId] = {
          quiz: {
            id: quiz._id.toString(),
            title: quiz.title,
            totalPoints: quiz.totalPoints,
            passingScore: quiz.passingScore
          },
          totalAttempts: 0,
          totalScore: 0,
          totalMaxScore: 0,
          passedCount: 0
        }
      }

      quizPerformance[quizId].totalAttempts++
      quizPerformance[quizId].totalScore += (attempt as any).score
      quizPerformance[quizId].totalMaxScore += (attempt as any).maxScore
      if ((attempt as any).isPassed) {
        quizPerformance[quizId].passedCount++
      }
    }

    // Calculate quiz averages
    const quizReports = Object.values(quizPerformance).map((data: any) => ({
      quiz: data.quiz,
      totalAttempts: data.totalAttempts,
      averageScore: data.totalAttempts > 0
        ? Math.round((data.totalScore / data.totalAttempts) * 100) / 100
        : 0,
      averagePercentage: data.totalMaxScore > 0
        ? Math.round((data.totalScore / data.totalMaxScore) * 100 * 100) / 100
        : 0,
      passedCount: data.passedCount,
      passRate: data.totalAttempts > 0
        ? Math.round((data.passedCount / data.totalAttempts) * 100 * 100) / 100
        : 0
    }))

    // Course report
    const reportResponse = {
      course: {
        id: course._id.toString(),
        name: course.name,
        code: course.code,
        teacher: course.teacher ? {
          id: (course.teacher as any)._id.toString(),
          name: (course.teacher as any).name,
          email: (course.teacher as any).email
        } : null,
        academicYear: course.academicYear,
        semester: course.semester
      },
      summary: {
        totalQuizzes: quizzes.length,
        totalAttempts,
        totalStudents: uniqueStudents.size,
        totalScore,
        totalMaxScore,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        passedAttempts,
        passRate: Math.round(passRate * 100) / 100
      },
      studentPerformance: studentReports,
      quizPerformance: quizReports
    }

    return createSuccessResponse(reportResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get course report error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
