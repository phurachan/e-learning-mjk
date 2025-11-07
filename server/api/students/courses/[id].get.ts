import Student from '../../../models/Student'
import Course from '../../../models/Course'
import Lesson from '../../../models/Lesson'
import LessonProgress from '../../../models/LessonProgress'
import Quiz from '../../../models/Quiz'
import { createSuccessResponse, createPredefinedError, API_RESPONSE_CODES } from '../../../utils/responseHandler'

/**
 * GET /api/students/courses/:id
 * Get course detail with lessons for a student
 */
export default defineEventHandler(async (event) => {
  try {
    const courseId = getRouterParam(event, 'id')
    const query = getQuery(event)
    // Support both direct query param and filter structure
    const studentId = (query['filter[studentId]'] || query.studentId) as string

    if (!studentId || !courseId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['studentId', 'courseId']
      })
    }

    // Find student
    const student = await Student.findOne({ studentId, isActive: true })
      .populate('room')

    if (!student) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Find course
    const course = await Course.findById(courseId)
      .populate('teacher', 'name firstname lastname')
      .populate('rooms', 'name code')
      .lean()

    if (!course) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        message: 'ไม่พบรายวิชา'
      })
    }

    // Check if student's room is enrolled in this course
    const isEnrolled = (course.rooms as any[]).some(
      (room: any) => room._id.toString() === student.room._id.toString()
    )

    if (!isEnrolled) {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        message: 'คุณไม่มีสิทธิ์เข้าถึงรายวิชานี้'
      })
    }

    // Get all published lessons for this course
    const lessons = await Lesson.find({
      course: course._id,
      isPublished: true
    })
      .select('title description order duration')
      .sort({ order: 1 })
      .lean()

    // Get lesson progress from LessonProgress model
    const lessonsWithProgress = await Promise.all(
      lessons.map(async (lesson: any) => {
        // Check if lesson has quiz
        const hasQuiz = await Quiz.exists({
          lesson: lesson._id,
          isActive: true
        })

        // Get lesson progress
        const lessonProgress = await LessonProgress.findOne({
          student: student._id,
          lesson: lesson._id
        })

        return {
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          duration: lesson.duration,
          isPublished: true,
          hasQuiz: !!hasQuiz,
          isCompleted: lessonProgress?.isCompleted || false,
          completedAt: lessonProgress?.completedAt,
          timeSpent: lessonProgress?.timeSpent || 0
        }
      })
    )

    // Calculate overall progress
    const totalLessons = lessons.length
    const completedLessons = await LessonProgress.countDocuments({
      student: student._id,
      course: course._id,
      isCompleted: true
    })
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    const courseDetail = {
      _id: course._id,
      courseId: (course as any).code,
      name: (course as any).name,
      description: (course as any).description,
      teacher: course.teacher,
      academicYear: (course as any).academicYear,
      semester: (course as any).semester,
      room: student.room,
      progress,
      totalLessons,
      completedLessons,
      lessons: lessonsWithProgress
    }

    return createSuccessResponse(courseDetail)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Get student course detail error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
