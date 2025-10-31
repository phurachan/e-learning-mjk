import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import User from '~/server/models/User'
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

    // Check if it's a student or user
    let currentUser = null
    let currentStudent = null

    // Try to find as User first
    currentUser = await User.findById(decoded.userId)
    if (currentUser && currentUser.isActive) {
      // User found
    } else {
      // Try to find as Student
      currentStudent = await Student.findById(decoded.userId)
      if (!currentStudent || !currentStudent.isActive) {
        throw createPredefinedError(API_RESPONSE_CODES.UNAUTHORIZED)
      }
    }

    // Get filename from route params
    const filename = getRouterParam(event, 'filename')

    if (!filename) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['filename']
      })
    }

    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: ['ชื่อไฟล์ไม่ถูกต้อง']
      })
    }

    // Build file path
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, filename)

    // Check if file exists
    if (!existsSync(filePath)) {
      throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
        details: ['ไม่พบไฟล์ที่ระบุ']
      })
    }

    // Delete file
    await unlink(filePath)

    return createSuccessResponse({
      filename,
      message: 'ลบไฟล์สำเร็จ'
    })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Delete file error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
