import { del } from '@vercel/blob'
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

    // Get URL from request body
    const body = await readBody(event)
    const url = body.url

    if (!url) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['url']
      })
    }

    // Validate URL is from Vercel Blob
    if (!url.includes('blob.vercel-storage.com') && !url.includes('public.blob.vercel-storage.com')) {
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: ['URL ไม่ถูกต้อง']
      })
    }

    try {
      // Delete file from Vercel Blob
      await del(url)

      return createSuccessResponse({
        url,
        message: 'ลบไฟล์สำเร็จ'
      })
    } catch (error: any) {
      if (error.message && error.message.includes('not found')) {
        throw createPredefinedError(API_RESPONSE_CODES.NOT_FOUND, {
          details: ['ไม่พบไฟล์ที่ระบุ']
        })
      }
      throw error
    }
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
