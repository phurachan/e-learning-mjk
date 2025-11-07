import Student from '../../../models/Student'
import Course from '../../../models/Course'
import Lesson from '../../../models/Lesson'
import LessonProgress from '../../../models/LessonProgress'
import { extractTokenFromHeader, verifyToken } from '../../../utils/jwt'
import { createSuccessResponse, createPredefinedError, API_RESPONSE_CODES } from '../../../utils/responseHandler'

/**
 * GET /api/students/courses/my-courses
 * Get all courses for the authenticated student
 */
export default defineEventHandler(async (event) => {
  try {
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)

    if (!token) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Verify and decode token
    const decoded = verifyToken(token)

    if (decoded.role !== 'student') {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Find student
    const student = await Student.findById(decoded.userId)
      .populate('room')

    if (!student || !student.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Find courses for student's room
    const courses = await Course.find({
      rooms: student.room,
      isActive: true,
    })
      .populate('teacher', 'name firstname lastname')
      .populate('rooms', 'name code')
      .select('code name description teacher academicYear semester rooms')
      .sort({ code: 1 })
      .lean()

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course: any) => {
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
          courseId: course.code,
          name: course.name,
          description: course.description,
          teacher: course.teacher,
          academicYear: course.academicYear,
          semester: course.semester,
          room: student.room,
          progress,
          totalLessons,
          completedLessons
        }
      })
    )

    return createSuccessResponse(coursesWithProgress)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Get my courses error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
