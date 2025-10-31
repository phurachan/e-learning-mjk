import QuizAttempt from '~/server/models/QuizAttempt'
import Student from '~/server/models/Student'
import User from '~/server/models/User'
import Course from '~/server/models/Course'
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

    // Get student ID from route params
    const studentId = getRouterParam(event, 'studentId')

    if (!studentId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // If student, verify they are requesting their own report
    if (userRole === 'student' && currentStudent && currentStudent._id.toString() !== studentId) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['คุณสามารถดูรายงานของตัวเองเท่านั้น']
      })
    }

    // Find student
    const student = await Student.findById(studentId).populate('room', 'name code grade section academicYear')

    if (!student) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบนักเรียนที่ระบุ']
      })
    }

    // If teacher, verify student is in their course
    if (userRole === 'teacher' && currentUser) {
      const room = student.room as any
      const courses = await Course.find({
        teacher: currentUser._id,
        rooms: room._id
      })

      if (courses.length === 0) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['คุณไม่มีสิทธิ์ดูรายงานของนักเรียนคนนี้']
        })
      }
    }

    // Get all quiz attempts for this student
    const attempts = await QuizAttempt.find({
      student: studentId,
      submittedAt: { $exists: true },
      isGraded: true
    })
      .populate({
        path: 'quiz',
        select: 'title course totalPoints passingScore',
        populate: {
          path: 'course',
          select: 'name code'
        }
      })
      .sort({ submittedAt: -1 })
      .lean()

    // Calculate statistics
    const totalAttempts = attempts.length
    const totalScore = attempts.reduce((sum, attempt: any) => sum + attempt.score, 0)
    const totalMaxScore = attempts.reduce((sum, attempt: any) => sum + attempt.maxScore, 0)
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
    const passedAttempts = attempts.filter((attempt: any) => attempt.isPassed).length
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0

    // Group attempts by course
    const attemptsByCourse: any = {}
    for (const attempt of attempts) {
      const quiz = (attempt as any).quiz
      if (!quiz || !quiz.course) continue

      const courseId = quiz.course._id.toString()
      if (!attemptsByCourse[courseId]) {
        attemptsByCourse[courseId] = {
          course: {
            id: quiz.course._id.toString(),
            name: quiz.course.name,
            code: quiz.course.code
          },
          attempts: [],
          totalScore: 0,
          totalMaxScore: 0,
          passedCount: 0
        }
      }

      attemptsByCourse[courseId].attempts.push({
        id: (attempt as any)._id.toString(),
        quiz: {
          id: quiz._id.toString(),
          title: quiz.title,
          totalPoints: quiz.totalPoints,
          passingScore: quiz.passingScore
        },
        score: (attempt as any).score,
        maxScore: (attempt as any).maxScore,
        percentage: (attempt as any).percentage,
        isPassed: (attempt as any).isPassed,
        submittedAt: (attempt as any).submittedAt,
        attemptNumber: (attempt as any).attemptNumber
      })

      attemptsByCourse[courseId].totalScore += (attempt as any).score
      attemptsByCourse[courseId].totalMaxScore += (attempt as any).maxScore
      if ((attempt as any).isPassed) {
        attemptsByCourse[courseId].passedCount++
      }
    }

    // Calculate course averages
    const courseReports = Object.values(attemptsByCourse).map((courseData: any) => ({
      ...courseData,
      averagePercentage: courseData.totalMaxScore > 0
        ? (courseData.totalScore / courseData.totalMaxScore) * 100
        : 0,
      passRate: courseData.attempts.length > 0
        ? (courseData.passedCount / courseData.attempts.length) * 100
        : 0
    }))

    // Student report
    const reportResponse = {
      student: {
        id: student._id.toString(),
        studentId: student.studentId,
        fullname: student.fullname,
        room: student.room ? {
          id: (student.room as any)._id.toString(),
          name: (student.room as any).name,
          code: (student.room as any).code,
          grade: (student.room as any).grade,
          section: (student.room as any).section,
          academicYear: (student.room as any).academicYear
        } : null
      },
      summary: {
        totalAttempts,
        totalScore,
        totalMaxScore,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        passedAttempts,
        passRate: Math.round(passRate * 100) / 100
      },
      courseReports: courseReports.map((report: any) => ({
        course: report.course,
        totalAttempts: report.attempts.length,
        totalScore: report.totalScore,
        totalMaxScore: report.totalMaxScore,
        averagePercentage: Math.round(report.averagePercentage * 100) / 100,
        passedCount: report.passedCount,
        passRate: Math.round(report.passRate * 100) / 100,
        recentAttempts: report.attempts.slice(0, 5) // Show 5 most recent
      }))
    }

    return createSuccessResponse(reportResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get student report error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
