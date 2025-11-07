import { seedStudentData } from '../../utils/seedStudentData'

/**
 * POST /api/dev/seed-student-data
 * Seed student portal mock data
 *
 * ⚠️ Development only - ลบออกใน production
 */
export default defineEventHandler(async (event) => {
  try {
    // Environment check - only allow in development
    const config = useRuntimeConfig()
    if (process.env.NODE_ENV === 'production' || config.public.environment === 'production') {
      throw createError({
        statusCode: 403,
        statusMessage: 'FORBIDDEN',
        message: 'This endpoint is only available in development mode',
      })
    }

    const result = await seedStudentData()

    return {
      success: true,
      message: 'Student data seeded successfully',
      data: {
        teachers: result.teachers.length,
        courses: result.courses.length,
        lessons: result.lessons.length,
        quizzes: result.quizzes.length,
        attempts: result.attempts.length,
        student: {
          studentId: result.student.studentId,
          name: result.student.fullname,
          room: result.room.name,
        },
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'SEED_DATA_ERROR',
      message: error.message || 'Failed to seed student data',
    })
  }
})
