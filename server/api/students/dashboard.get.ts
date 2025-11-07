import Student from '../../models/Student'
import Course from '../../models/Course'
import Lesson from '../../models/Lesson'
import LessonProgress from '../../models/LessonProgress'
import Quiz from '../../models/Quiz'
import QuizAttempt from '../../models/QuizAttempt'
import { extractTokenFromHeader, verifyToken } from '../../utils/jwt'

/**
 * GET /api/students/dashboard
 * Get student dashboard data
 *
 * Returns:
 * - My Courses (วิชาที่เรียน)
 * - Upcoming Quizzes (แบบทดสอบที่ต้องทำ)
 * - Recent Results (ผลคะแนนล่าสุด)
 */
export default defineEventHandler(async (event) => {
  try {
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'UNAUTHORIZED',
        message: 'Student not authenticated',
      })
    }

    // Verify and decode token
    const decoded = verifyToken(token)

    if (decoded.role !== 'student') {
      throw createError({
        statusCode: 401,
        statusMessage: 'UNAUTHORIZED',
        message: 'Invalid role',
      })
    }

    // 1. ดึงข้อมูลนักเรียน
    const student = await Student.findById(decoded.userId).populate('room')

    if (!student) {
      throw createError({
        statusCode: 404,
        statusMessage: 'STUDENT_NOT_FOUND',
        message: 'Student not found',
      })
    }

    if (!student.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: 'STUDENT_INACTIVE',
        message: 'Student account is inactive',
      })
    }

    // 2. ดึงวิชาที่เรียน (Courses ที่ห้องของนักเรียนลงทะเบียน)
    const myCourses = await Course.find({
      rooms: student.room,
      isActive: true,
    })
      .populate('teacher', 'name firstname lastname')
      .populate('rooms', 'name code')
      .select('code name description teacher academicYear semester rooms')
      .sort({ code: 1 })
      .lean()

    // Calculate real progress from LessonProgress
    const coursesWithProgress = await Promise.all(
      myCourses.map(async (course: any) => {
        // Get all published lessons for this course
        const totalLessons = await Lesson.countDocuments({
          course: course._id,
          isPublished: true
        })

        // Calculate actual completed lessons from LessonProgress
        const completedLessons = await LessonProgress.countDocuments({
          student: student._id,
          course: course._id,
          isCompleted: true
        })

        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

        return {
          _id: course._id,
          courseId: course.code, // Use code as courseId for frontend
          name: course.name,
          description: course.description,
          teacher: course.teacher,
          academicYear: course.academicYear,
          semester: course.semester,
          room: student.room, // Return student's room
          progress, // Real progress from database
          totalLessons,
          completedLessons
        }
      })
    )

    // 3. ดึงแบบทดสอบที่ต้องทำ (Upcoming Quizzes)
    const now = new Date()
    const courseIds = myCourses.map((c) => c._id)

    const upcomingQuizzes = await Quiz.find({
      course: { $in: courseIds },
      isActive: true,
      $or: [
        { availableFrom: { $lte: now }, availableUntil: { $gte: now } },
        { availableFrom: { $lte: now }, availableUntil: { $exists: false } },
      ],
    })
      .populate('course', 'name code')
      .populate('lesson', 'title')
      .select('title description course lesson maxAttempts duration availableFrom availableUntil')
      .sort({ availableUntil: 1 })
      .limit(10)
      .lean()

    // นับจำนวนครั้งที่ทำแล้ว
    const upcomingQuizzesWithAttempts = await Promise.all(
      upcomingQuizzes.map(async (quiz) => {
        const attemptCount = await QuizAttempt.countDocuments({
          quiz: quiz._id,
          student: student._id,
        })

        return {
          ...quiz,
          attemptCount,
        }
      })
    )

    // 4. ดึงผลคะแนนล่าสุด (Recent Results)
    const recentResults = await QuizAttempt.find({
      student: student._id,
    })
      .populate({
        path: 'quiz',
        select: 'title course passingScore',
        populate: {
          path: 'course',
          select: 'name code',
        },
      })
      .select('quiz score maxScore percentage isPassed isGraded submittedAt attemptNumber feedback')
      .sort({ submittedAt: -1 })
      .limit(10)
      .lean()

    return {
      success: true,
      data: {
        student: {
          id: student._id,
          studentId: student.studentId,
          firstname: student.firstname,
          lastname: student.lastname,
          fullname: student.fullname,
          avatar: student.avatar,
          room: student.room,
        },
        courses: coursesWithProgress,
        upcomingQuizzes: upcomingQuizzesWithAttempts,
        recentResults,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'Failed to get dashboard data',
    })
  }
})
