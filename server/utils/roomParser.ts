/**
 * Utility functions for parsing room codes
 */

interface ParsedRoomData {
  code: string
  name: string
  grade: number
  section: number
  academicYear: number
  capacity: number
  isActive: boolean
}

/**
 * Parse room code like "M1-1" into structured data
 * Format: M[grade]-[section] or [grade]-[section]
 *
 * Examples:
 * - "M1-1" → grade=1, section=1, name="ม.1/1"
 * - "M2-3" → grade=2, section=3, name="ม.2/3"
 * - "1-1" → grade=1, section=1, name="ม.1/1"
 */
export function parseRoomCode(roomCode: string): ParsedRoomData | null {
  if (!roomCode || typeof roomCode !== 'string') {
    return null
  }

  // Remove whitespace
  const cleanCode = roomCode.trim().toUpperCase()

  // Pattern 1: M[grade]-[section] (e.g., M1-1, M2-3)
  let match = cleanCode.match(/^M(\d+)-(\d+)$/)

  // Pattern 2: [grade]-[section] (e.g., 1-1, 2-3)
  if (!match) {
    match = cleanCode.match(/^(\d+)-(\d+)$/)
  }

  if (!match) {
    return null
  }

  const grade = parseInt(match[1])
  const section = parseInt(match[2])

  if (isNaN(grade) || isNaN(section) || grade < 1 || grade > 6 || section < 1) {
    return null
  }

  // Generate standardized code and name
  const standardCode = `M${grade}-${section}`
  const name = `ม.${grade}/${section}`

  // Get current academic year (Buddhist calendar)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-12
  // Academic year starts in May (month 5)
  const academicYear = currentMonth >= 5 ? currentYear + 543 + 1 : currentYear + 543

  return {
    code: standardCode,
    name: name,
    grade: grade,
    section: section,
    academicYear: academicYear,
    capacity: 40, // Default capacity
    isActive: true
  }
}

/**
 * Validate if a room code is in valid format
 */
export function isValidRoomCode(roomCode: string): boolean {
  return parseRoomCode(roomCode) !== null
}

/**
 * Generate room name from grade and section
 */
export function generateRoomName(grade: number, section: number): string {
  return `ม.${grade}/${section}`
}

/**
 * Generate room code from grade and section
 */
export function generateRoomCode(grade: number, section: number): string {
  return `M${grade}-${section}`
}
