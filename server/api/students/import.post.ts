import Student from '~/server/models/Student'
import Room from '~/server/models/Room'
import User from '~/server/models/User'
import { extractTokenFromHeader, verifyToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse } from '~/server/utils/responseHandler'
import { requirePermission } from '~/server/utils/permissions'
import { parseRoomCode } from '~/server/utils/roomParser'
import { parse } from 'csv-parse/sync'

interface ImportResult {
  success: number
  failed: number
  roomsCreated: number
  errors: Array<{
    row: number
    studentId: string
    error: string
  }>
}

interface StudentRow {
  studentId: string
  firstname: string
  lastname: string
  password: string
  phone?: string
  dateOfBirth?: string
  address?: string
  parentName?: string
  parentPhone?: string
  roomCode?: string
  isActive?: string
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

    // Check if user has permission to access students
    await requirePermission(decoded.userId, 'students.access')

    // Parse multipart form data
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['file is required']
      })
    }

    // Extract file and form fields
    let fileBuffer: Buffer | null = null
    let importMode: 'simple' | 'advanced' = 'simple'
    let selectedRoom: string | null = null
    let autoCreateRoom = false

    for (const part of formData) {
      if (part.name === 'file' && part.data) {
        fileBuffer = part.data
      } else if (part.name === 'importMode' && part.data) {
        importMode = part.data.toString() as 'simple' | 'advanced'
      } else if (part.name === 'selectedRoom' && part.data) {
        selectedRoom = part.data.toString()
      } else if (part.name === 'autoCreateRoom' && part.data) {
        autoCreateRoom = part.data.toString() === 'true'
      }
    }

    if (!fileBuffer) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['file is required']
      })
    }

    // Validate mode-specific requirements
    if (importMode === 'simple' && !selectedRoom) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: ['selectedRoom is required for simple mode']
      })
    }

    // Parse CSV file
    const csvString = fileBuffer.toString('utf-8')
    let records: StudentRow[]

    try {
      records = parse(csvString, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
      })
    } catch (error: any) {
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_INPUT, {
        details: ['Invalid CSV file format: ' + error.message]
      })
    }

    if (!records || records.length === 0) {
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_INPUT, {
        details: ['CSV file is empty']
      })
    }

    const result: ImportResult = {
      success: 0,
      failed: 0,
      roomsCreated: 0,
      errors: []
    }

    // Cache for rooms to avoid repeated database queries
    const roomCache = new Map<string, any>()

    // If simple mode, get the selected room
    if (importMode === 'simple' && selectedRoom) {
      const room = await Room.findById(selectedRoom)
      if (!room) {
        throw createPredefinedError(API_RESPONSE_CODES.RESOURCE_NOT_FOUND, {
          details: ['Selected room not found']
        })
      }
      roomCache.set(selectedRoom, room)
    }

    // Process each student
    for (let i = 0; i < records.length; i++) {
      const studentData = records[i]
      const rowNumber = i + 2 // +2 because row 1 is header and we're 0-indexed

      try {
        // Validate required fields
        if (!studentData.studentId || !studentData.firstname || !studentData.lastname) {
          result.failed++
          result.errors.push({
            row: rowNumber,
            studentId: studentData.studentId || 'N/A',
            error: 'ข้อมูลไม่ครบถ้วน (studentId, firstname, lastname)'
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

        // Determine room ID based on mode
        let roomId: string | null = null

        if (importMode === 'simple') {
          // Use the selected room for all students
          roomId = selectedRoom
        } else {
          // Advanced mode: use roomCode from CSV
          if (studentData.roomCode && studentData.roomCode.trim()) {
            const roomCode = studentData.roomCode.trim().toUpperCase()

            // Check cache first
            if (roomCache.has(roomCode)) {
              roomId = roomCache.get(roomCode)._id.toString()
            } else {
              // Try to find existing room by code
              let room = await Room.findOne({ code: roomCode })

              if (!room && autoCreateRoom) {
                // Parse and create new room
                const parsedRoom = parseRoomCode(roomCode)

                if (!parsedRoom) {
                  result.failed++
                  result.errors.push({
                    row: rowNumber,
                    studentId: studentData.studentId,
                    error: `รูปแบบรหัสห้องไม่ถูกต้อง: ${roomCode} (ใช้รูปแบบ M1-1 หรือ 1-1)`
                  })
                  continue
                }

                // Create new room
                room = new Room({
                  name: parsedRoom.name,
                  code: parsedRoom.code,
                  grade: parsedRoom.grade,
                  section: parsedRoom.section,
                  academicYear: parsedRoom.academicYear,
                  capacity: parsedRoom.capacity,
                  isActive: parsedRoom.isActive,
                  createdBy: currentUser._id
                })

                await room.save()
                result.roomsCreated++
              }

              if (!room) {
                result.failed++
                result.errors.push({
                  row: rowNumber,
                  studentId: studentData.studentId,
                  error: `ไม่พบห้องเรียน: ${roomCode}`
                })
                continue
              }

              roomCache.set(roomCode, room)
              roomId = room._id.toString()
            }
          }
          // If no roomCode provided in advanced mode, student will have no room
        }

        // Create student
        const newStudent = new Student({
          studentId: studentData.studentId.toUpperCase().trim(),
          password: studentData.password || studentData.studentId, // Default password to studentId if not provided
          firstname: studentData.firstname.trim(),
          lastname: studentData.lastname.trim(),
          phone: studentData.phone || undefined,
          room: roomId || undefined,
          dateOfBirth: studentData.dateOfBirth || undefined,
          address: studentData.address || undefined,
          parentName: studentData.parentName || undefined,
          parentPhone: studentData.parentPhone || undefined,
          isActive: studentData.isActive ? studentData.isActive.toLowerCase() === 'true' : true,
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

    let message = `Import เสร็จสิ้น: สำเร็จ ${result.success} คน, ล้มเหลว ${result.failed} คน`
    if (result.roomsCreated > 0) {
      message += `, สร้างห้องเรียนใหม่ ${result.roomsCreated} ห้อง`
    }

    return createSuccessResponse({
      message,
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
