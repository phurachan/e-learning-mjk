import Student from '~/server/models/Student'
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

    // Check if logged in as student
    if (decoded.role !== 'student') {
      throw createPredefinedError(API_RESPONSE_CODES.FORBIDDEN, {
        details: ['เฉพาะนักเรียนเท่านั้นที่สามารถใช้ API นี้ได้']
      })
    }

    const body = await readBody(event)

    // Validate required fields
    if (!body.currentPassword || !body.newPassword) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['currentPassword', 'newPassword']
      })
    }

    // Validate new password length
    if (body.newPassword.length < 6) {
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: ['รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร']
      })
    }

    // Find student by ID
    const student = await Student.findById(decoded.userId)

    if (!student || !student.isActive) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบนักเรียน']
      })
    }

    // Check current password
    const isPasswordValid = await student.comparePassword(body.currentPassword)

    if (!isPasswordValid) {
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_CREDENTIALS, {
        details: ['รหัสผ่านปัจจุบันไม่ถูกต้อง']
      })
    }

    // Update password and set isChangePassword to false
    student.password = body.newPassword
    student.isChangePassword = false
    await student.save()

    return createSuccessResponse({
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
      isChangePassword: false
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Change password error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
