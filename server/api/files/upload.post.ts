import { writeFile } from 'fs/promises'
import { join } from 'path'
import User from '~/server/models/User'
import Student from '~/server/models/Student'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'

// Helper function to generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const ext = originalName.substring(originalName.lastIndexOf('.'))
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_')
  return `${timestamp}_${random}_${nameWithoutExt}${ext}`
}

// Helper function to validate file type
function isValidFileType(filename: string): boolean {
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', // Images
    '.pdf', '.doc', '.docx', // Documents
    '.xls', '.xlsx', // Spreadsheets
    '.ppt', '.pptx', // Presentations
    '.zip', '.rar', // Archives
    '.mp4', '.avi', '.mov', // Videos
    '.mp3', '.wav', // Audio
    '.txt', '.csv' // Text files
  ]

  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return allowedExtensions.includes(ext)
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

    // Read multipart form data
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['No file uploaded']
      })
    }

    const uploadedFiles = []
    const maxFileSize = 5 * 1024 * 1024 // 5MB

    for (const file of formData) {
      if (file.filename) {
        // Validate file size
        if (file.data.length > maxFileSize) {
          throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
            details: [`ไฟล์ ${file.filename} มีขนาดเกิน 5MB`]
          })
        }

        // Validate file type
        if (!isValidFileType(file.filename)) {
          throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
            details: [`ไฟล์ ${file.filename} ไม่รองรับ`]
          })
        }

        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.filename)

        // Save file to public/uploads directory
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        const filePath = join(uploadDir, uniqueFilename)

        await writeFile(filePath, file.data)

        uploadedFiles.push({
          originalName: file.filename,
          filename: uniqueFilename,
          url: `/uploads/${uniqueFilename}`,
          type: file.type || 'application/octet-stream',
          size: file.data.length
        })
      }
    }

    if (uploadedFiles.length === 0) {
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: ['ไม่พบไฟล์ที่อัพโหลด']
      })
    }

    return createSuccessResponse({
      files: uploadedFiles,
      message: `อัพโหลดไฟล์สำเร็จ ${uploadedFiles.length} ไฟล์`
    })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    console.error('Upload file error:', error)
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})
