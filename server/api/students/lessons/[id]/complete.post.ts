import Student from '../../../../models/Student'
import Lesson from '../../../../models/Lesson'
import LessonProgress from '../../../../models/LessonProgress'
import { extractTokenFromHeader, verifyToken } from '../../../../utils/jwt'
import { createSuccessResponse, createPredefinedError, API_RESPONSE_CODES } from '../../../../utils/responseHandler'

/**
 * POST /api/students/lessons/:id/complete
 * Mark a lesson as complete for the authenticated student
 */
export default defineEventHandler(async (event) => {
  try {
    const lessonId = getRouterParam(event, 'id')

    if (!lessonId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['lessonId']
      })
    }

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
    const student = await Student.findById(decoded.userId).populate('room')

    if (!student || !student.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Find lesson
    const lesson = await Lesson.findById(lessonId)
      .populate({
        path: 'course',
        select: 'rooms',
        populate: {
          path: 'rooms',
          select: '_id'
        }
      })
      .lean()

    if (!lesson || !lesson.isPublished) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        message: 'ไม่พบบทเรียน'
      })
    }

    // Check if student's room is enrolled in this course
    const course = lesson.course as any
    const isEnrolled = course.rooms.some(
      (room: any) => room._id.toString() === student.room._id.toString()
    )

    if (!isEnrolled) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        message: 'คุณไม่มีสิทธิ์เข้าถึงบทเรียนนี้'
      })
    }

    // Create or update lesson progress
    const lessonProgress = await LessonProgress.findOneAndUpdate(
      {
        student: student._id,
        lesson: lesson._id
      },
      {
        student: student._id,
        lesson: lesson._id,
        course: course._id,
        isCompleted: true,
        completedAt: new Date(),
        lastAccessedAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    )

    return createSuccessResponse(
      {
        _id: lessonProgress._id,
        isCompleted: lessonProgress.isCompleted,
        completedAt: lessonProgress.completedAt,
        timeSpent: lessonProgress.timeSpent
      },
      'บันทึกความคืบหน้าสำเร็จ'
    )
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Mark lesson as complete error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
