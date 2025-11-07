import Student from '../../../models/Student'
import Course from '../../../models/Course'
import Lesson from '../../../models/Lesson'
import LessonProgress from '../../../models/LessonProgress'
import Quiz from '../../../models/Quiz'
import { createSuccessResponse, createPredefinedError, API_RESPONSE_CODES } from '../../../utils/responseHandler'

/**
 * GET /api/students/lessons/:id
 * Get lesson detail for a student
 */
export default defineEventHandler(async (event) => {
  try {
    const lessonId = getRouterParam(event, 'id')
    const query = getQuery(event)
    // Support both direct query param and filter structure
    const studentId = (query['filter[studentId]'] || query.studentId) as string

    if (!studentId || !lessonId) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['studentId', 'lessonId']
      })
    }

    // Find student
    const student = await Student.findOne({ studentId, isActive: true })
      .populate('room')

    if (!student) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_NOT_FOUND)
    }

    // Find lesson
    const lesson = await Lesson.findById(lessonId)
      .populate({
        path: 'course',
        select: 'name code rooms',
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

    // Get all lessons for this course to find previous/next
    const allLessons = await Lesson.find({
      course: course._id,
      isPublished: true
    })
      .select('_id title order')
      .sort({ order: 1 })
      .lean()

    // Find current lesson index
    const currentIndex = allLessons.findIndex(
      (l: any) => l._id.toString() === lessonId
    )

    const navigation = {
      previous: currentIndex > 0 ? {
        _id: allLessons[currentIndex - 1]._id,
        title: (allLessons[currentIndex - 1] as any).title
      } : undefined,
      next: currentIndex < allLessons.length - 1 ? {
        _id: allLessons[currentIndex + 1]._id,
        title: (allLessons[currentIndex + 1] as any).title
      } : undefined
    }

    // Check if lesson has quiz
    const quiz = await Quiz.findOne({
      lesson: lesson._id,
      isActive: true
    })
      .select('_id title description')
      .lean()

    // Get lesson progress from LessonProgress model
    const lessonProgress = await LessonProgress.findOne({
      student: student._id,
      lesson: lesson._id
    })

    const lessonDetail = {
      _id: lesson._id,
      title: (lesson as any).title,
      description: (lesson as any).description,
      content: (lesson as any).content,
      order: (lesson as any).order,
      duration: (lesson as any).duration,
      isPublished: lesson.isPublished,
      course: {
        _id: course._id,
        name: course.name,
        code: course.code
      },
      files: (lesson as any).attachments || [],
      hasQuiz: !!quiz,
      quiz: quiz ? {
        _id: quiz._id,
        title: (quiz as any).title,
        description: (quiz as any).description
      } : undefined,
      navigation,
      isCompleted: lessonProgress?.isCompleted || false,
      completedAt: lessonProgress?.completedAt,
      lastAccessedAt: lessonProgress?.lastAccessedAt,
      timeSpent: lessonProgress?.timeSpent || 0
    }

    return createSuccessResponse(lessonDetail)
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Get student lesson detail error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
