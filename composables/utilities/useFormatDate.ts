/**
 * Thai Date Formatting Utilities
 * Handles conversion between Thai Buddhist Era (BE) and Gregorian dates
 */

export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full'
  includeTime?: boolean
  timeFormat?: '12h' | '24h'
}

export const useFormatDate = () => {
  // Thai months in both short and long forms
  const thaiMonths = {
    short: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
    long: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
  }

  const thaiDays = {
    short: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
    long: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  }

  /**
   * Convert Gregorian date to Thai Buddhist Era date string
   * @param date - JavaScript Date object
   * @param options - Formatting options
   * @returns Thai formatted date string
   */
  const dateToThai = (date: Date | string | null, options: DateFormatOptions = {}): string => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    if (isNaN(dateObj.getTime())) return ''

    const {
      format = 'medium',
      includeTime = false,
      timeFormat = '24h'
    } = options

    const buddhistYear = dateObj.getFullYear() + 543
    const month = dateObj.getMonth()
    const day = dateObj.getDate()
    const dayOfWeek = dateObj.getDay()

    let dateString = ''

    switch (format) {
      case 'short':
        dateString = `${day}/${month + 1}/${buddhistYear}`
        break
      case 'medium':
        dateString = `${day} ${thaiMonths.short[month]} ${buddhistYear}`
        break
      case 'long':
        dateString = `${day} ${thaiMonths.long[month]} พ.ศ. ${buddhistYear}`
        break
      case 'full':
        dateString = `วัน${thaiDays.long[dayOfWeek]}ที่ ${day} ${thaiMonths.long[month]} พ.ศ. ${buddhistYear}`
        break
    }

    if (includeTime) {
      const hours = dateObj.getHours()
      const minutes = dateObj.getMinutes().toString().padStart(2, '0')
      
      if (timeFormat === '12h') {
        const period = hours >= 12 ? 'น.' : 'ก.'
        const displayHours = hours % 12 || 12
        dateString += ` เวลา ${displayHours}:${minutes} ${period}`
      } else {
        dateString += ` เวลา ${hours.toString().padStart(2, '0')}:${minutes} น.`
      }
    }

    return dateString
  }

  /**
   * Parse Thai Buddhist Era date string to JavaScript Date
   * @param thaiDateString - Thai formatted date string
   * @returns JavaScript Date object
   */
  const dateFromThai = (thaiDateString: string): Date | null => {
    if (!thaiDateString) return null

    try {
      // Handle different Thai date formats
      let match: RegExp | null = null
      let year = 0, month = 0, day = 0

      // Format: "25/12/2567" or "25/12/67"
      match = thaiDateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
      if (match) {
        day = parseInt(match[1])
        month = parseInt(match[2]) - 1 // JavaScript months are 0-indexed
        year = parseInt(match[3])
        if (year < 100) year += 2500 // Handle 2-digit years
        year -= 543 // Convert from Buddhist Era to Gregorian
        return new Date(year, month, day)
      }

      // Format: "25 ธ.ค. 2567"
      for (let i = 0; i < thaiMonths.short.length; i++) {
        const pattern = new RegExp(`(\\d{1,2})\\s+${thaiMonths.short[i].replace('.', '\\.')}\\s+(\\d{4})`)
        match = thaiDateString.match(pattern)
        if (match) {
          day = parseInt(match[1])
          month = i
          year = parseInt(match[2]) - 543
          return new Date(year, month, day)
        }
      }

      // Format: "25 ธันวาคม 2567"
      for (let i = 0; i < thaiMonths.long.length; i++) {
        const pattern = new RegExp(`(\\d{1,2})\\s+${thaiMonths.long[i]}\\s+(\\d{4})`)
        match = thaiDateString.match(pattern)
        if (match) {
          day = parseInt(match[1])
          month = i
          year = parseInt(match[2]) - 543
          return new Date(year, month, day)
        }
      }

      return null
    } catch (error) {
      console.warn('Failed to parse Thai date string:', thaiDateString, error)
      return null
    }
  }

  /**
   * Get current date in Thai format
   * @param options - Formatting options
   * @returns Current date in Thai format
   */
  const getCurrentThaiDate = (options: DateFormatOptions = {}): string => {
    return dateToThai(new Date(), options)
  }

  /**
   * Check if a string is a valid Thai date format
   * @param dateString - Date string to validate
   * @returns True if valid Thai date format
   */
  const isValidThaiDate = (dateString: string): boolean => {
    return dateFromThai(dateString) !== null
  }

  /**
   * Convert Buddhist Era year to Gregorian year
   * @param buddhistYear - Buddhist Era year
   * @returns Gregorian year
   */
  const buddhistToGregorian = (buddhistYear: number): number => {
    return buddhistYear - 543
  }

  /**
   * Convert Gregorian year to Buddhist Era year
   * @param gregorianYear - Gregorian year
   * @returns Buddhist Era year
   */
  const gregorianToBuddhist = (gregorianYear: number): number => {
    return gregorianYear + 543
  }

  return {
    dateToThai,
    dateFromThai,
    getCurrentThaiDate,
    isValidThaiDate,
    buddhistToGregorian,
    gregorianToBuddhist,
    // Expose constants for advanced usage
    thaiMonths,
    thaiDays
  }
}