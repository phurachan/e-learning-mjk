import Student from '~/server/models/Student'
import Room from '~/server/models/Room'
import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

interface ImportResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    studentId: string
    error: string
  }>
}

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

    // Find current user
    const currentUser = await User.findById(decoded.userId)

    if (!currentUser || !currentUser.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
    }

    // Check if user has permission (admin or teacher)
    if (currentUser.role !== 'admin' && currentUser.role !== 'teacher') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN)
    }

    const body = await readBody(event)

    // Validate input
    if (!body.students || !Array.isArray(body.students) || body.students.length === 0) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['students array is required']
      })
    }

    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    }

    // Process each student
    for (let i = 0; i < body.students.length; i++) {
      const studentData = body.students[i]
      const rowNumber = i + 1

      try {
        // Validate required fields
        if (!studentData.studentId || !studentData.password || !studentData.firstname || !studentData.lastname || !studentData.room) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            studentId: studentData.studentId || 'N/A',
            error: 'ข้อมูลไม่ครบถ้วน (studentId, password, firstname, lastname, room)'
          })
          continue
        }

        // Check if studentId already exists
        const existingStudent = await Student.findOne({
          studentId: studentData.studentId.toUpperCase()
        })

        if (existingStudent) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            studentId: studentData.studentId,
            error: 'รหัสนักเรียนนี้มีอยู่ในระบบแล้ว'
          })
          continue
        }

        // Check if room exists
        const room = await Room.findById(studentData.room)
        if (!room) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            studentId: studentData.studentId,
            error: 'ไม่พบห้องเรียนที่ระบุ'
          })
          continue
        }

        // Create student
        const newStudent = new Student({
          studentId: studentData.studentId.toUpperCase().trim(),
          password: studentData.password,
          firstname: studentData.firstname.trim(),
          lastname: studentData.lastname.trim(),
          phone: studentData.phone,
          avatar: studentData.avatar,
          room: studentData.room,
          dateOfBirth: studentData.dateOfBirth,
          address: studentData.address,
          parentName: studentData.parentName,
          parentPhone: studentData.parentPhone,
          isActive: studentData.isActive !== undefined ? studentData.isActive : true,
          createdBy: currentUser._id
        })

        await newStudent.save()
        result.success++

      } catch (error: any) {
        result.failed++
        result.errors.push({
          row: rowNumber,
          studentId: studentData.studentId || 'N/A',
          error: error.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
        })
      }
    }

    return createSuccessResponse({
      message: `Import เสร็จสิ้น: สำเร็จ ${result.success} คน, ล้มเหลว ${result.failed} คน`,
      result
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Import students error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
