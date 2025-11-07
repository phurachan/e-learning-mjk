import Student from '../../../../models/Student'
import Lesson from '../../../../models/Lesson'
import LessonProgress from '../../../../models/LessonProgress'
import { extractTokenFromHeader, verifyToken } from '../../../../utils/jwt'
import { createSuccessResponse, createPredefinedError, API_RESPONSE_CODES } from '../../../../utils/responseHandler'

/**
 * POST /api/students/lessons/:id/uncomplete
 * Mark a lesson as incomplete for the authenticated student
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
    const student = await Student.findById(decoded.userId)

    if (!student || !student.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Update lesson progress to incomplete
    const lessonProgress = await LessonProgress.findOneAndUpdate(
      {
        student: student._id,
        lesson: lessonId
      },
      {
        isCompleted: false,
        completedAt: undefined,
        lastAccessedAt: new Date()
      },
      {
        new: true
      }
    )

    if (!lessonProgress) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        message: 'ไม่พบบันทึกความคืบหน้า'
      })
    }

    return createSuccessResponse(
      {
        _id: lessonProgress._id,
        isCompleted: lessonProgress.isCompleted,
        completedAt: lessonProgress.completedAt,
        timeSpent: lessonProgress.timeSpent
      },
      'อัปเดตความคืบหน้าสำเร็จ'
    )
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Mark lesson as incomplete error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
