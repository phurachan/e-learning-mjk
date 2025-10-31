import QuizAttempt from '~/server/models/QuizAttempt'
import Room from '~/server/models/Room'
import Student from '~/server/models/Student'
import Course from '~/server/models/Course'
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

    // Get room ID from route params
    const roomId = getRouterParam(event, 'roomId')

    if (!roomId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS)
    }

    // Find room
    const room = await Room.findById(roomId)

    if (!room) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบห้องเรียนที่ระบุ']
      })
    }

    // If teacher, verify they teach at least one course in this room
    if (currentUser.role === 'teacher') {
      const courses = await Course.find({
        teacher: currentUser._id,
        rooms: roomId
      })

      if (courses.length === 0) {
        throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
          details: ['คุณไม่มีสิทธิ์ดูรายงานของห้องเรียนนี้']
        })
      }
    }

    // Get all students in this room
    const students = await Student.find({
      room: roomId,
      isActive: true
    }).select('_id studentId firstname lastname fullname')

    const studentIds = students.map(s => s._id)

    // Get all courses for this room
    const courses = await Course.find({
      rooms: roomId,
      isActive: true
    })
      .populate('teacher', 'name email')
      .select('_id name code teacher')

    // Get all quiz attempts for students in this room
    const attempts = await QuizAttempt.find({
      student: { $in: studentIds },
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
      .populate('student', 'studentId firstname lastname fullname')
      .sort({ submittedAt: -1 })
      .lean()

    // Calculate room statistics
    const totalAttempts = attempts.length
    const totalScore = attempts.reduce((sum, attempt: any) => sum + attempt.score, 0)
    const totalMaxScore = attempts.reduce((sum, attempt: any) => sum + attempt.maxScore, 0)
    const averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
    const passedAttempts = attempts.filter((attempt: any) => attempt.isPassed).length
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0

    // Group attempts by student
    const studentPerformance: any = {}
    for (const student of students) {
      const studentId = student._id.toString()
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

    for (const attempt of attempts) {
      const student = (attempt as any).student
      if (!student) continue

      const studentId = student._id.toString()
      if (studentPerformance[studentId]) {
        studentPerformance[studentId].totalAttempts++
        studentPerformance[studentId].totalScore += (attempt as any).score
        studentPerformance[studentId].totalMaxScore += (attempt as any).maxScore
        if ((attempt as any).isPassed) {
          studentPerformance[studentId].passedCount++
        }
      }
    }

    // Calculate student averages
    const studentReports = Object.values(studentPerformance).map((data: any) => ({
      student: data.student,
      totalAttempts: data.totalAttempts,
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

    // Group attempts by course
    const coursePerformance: any = {}
    for (const attempt of attempts) {
      const quiz = (attempt as any).quiz
      if (!quiz || !quiz.course) continue

      const courseId = quiz.course._id.toString()
      if (!coursePerformance[courseId]) {
        coursePerformance[courseId] = {
          course: {
            id: quiz.course._id.toString(),
            name: quiz.course.name,
            code: quiz.course.code
          },
          totalAttempts: 0,
          totalScore: 0,
          totalMaxScore: 0,
          passedCount: 0
        }
      }

      coursePerformance[courseId].totalAttempts++
      coursePerformance[courseId].totalScore += (attempt as any).score
      coursePerformance[courseId].totalMaxScore += (attempt as any).maxScore
      if ((attempt as any).isPassed) {
        coursePerformance[courseId].passedCount++
      }
    }

    // Calculate course averages
    const courseReports = Object.values(coursePerformance).map((data: any) => ({
      course: data.course,
      totalAttempts: data.totalAttempts,
      averagePercentage: data.totalMaxScore > 0
        ? Math.round((data.totalScore / data.totalMaxScore) * 100 * 100) / 100
        : 0,
      passedCount: data.passedCount,
      passRate: data.totalAttempts > 0
        ? Math.round((data.passedCount / data.totalAttempts) * 100 * 100) / 100
        : 0
    }))

    // Room report
    const reportResponse = {
      room: {
        id: room._id.toString(),
        name: room.name,
        code: room.code,
        grade: room.grade,
        section: room.section,
        academicYear: room.academicYear
      },
      summary: {
        totalStudents: students.length,
        totalCourses: courses.length,
        totalAttempts,
        totalScore,
        totalMaxScore,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        passedAttempts,
        passRate: Math.round(passRate * 100) / 100
      },
      courses: courses.map((course: any) => ({
        id: course._id.toString(),
        name: course.name,
        code: course.code,
        teacher: course.teacher ? {
          id: course.teacher._id.toString(),
          name: course.teacher.name,
          email: course.teacher.email
        } : null
      })),
      studentPerformance: studentReports,
      coursePerformance: courseReports
    }

    return createSuccessResponse(reportResponse)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Get class report error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
