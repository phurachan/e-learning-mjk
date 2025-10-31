/**
 * Thai Number Formatting Utilities
 * Handles conversion between Thai and Arabic numerals, number formatting, and currency
 */

export interface NumberFormatOptions {
  locale?: 'th' | 'en'
  currency?: boolean
  currencyCode?: 'THB' | 'USD' | 'EUR'
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
  useThaiDigits?: boolean
}

export const useFormatNumber = () => {
  // Thai digit mapping
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙']
  const arabicDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

  // Thai number words for read-aloud functionality
  const thaiNumberWords = {
    ones: ['', 'หนึ่ง', 'สong', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'],
    tens: ['', 'สิบ', 'ยี่สิบ', 'สามสิบ', 'สี่สิบ', 'ห้าสิบ', 'หกสิบ', 'เจ็ดสิบ', 'แปดสิบ', 'เก้าสิบ'],
    units: ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']
  }

  /**
   * Convert Arabic numerals to Thai numerals
   * @param input - Number or string with Arabic numerals
   * @returns String with Thai numerals
   */
  const numberToThai = (input: number | string): string => {
    if (typeof input === 'number') {
      input = input.toString()
    }
    
    return input.replace(/\d/g, (digit) => thaiDigits[parseInt(digit)])
  }

  /**
   * Convert Thai numerals to Arabic numerals
   * @param thaiNumber - String with Thai numerals
   * @returns String with Arabic numerals
   */
  const numberFromThai = (thaiNumber: string): string => {
    return thaiNumber.replace(/[๐-๙]/g, (thaiDigit) => {
      const index = thaiDigits.indexOf(thaiDigit)
      return index !== -1 ? arabicDigits[index] : thaiDigit
    })
  }

  /**
   * Format number with Thai locale and options
   * @param num - Number to format
   * @param options - Formatting options
   * @returns Formatted number string
   */
  const formatNumber = (num: number | string, options: NumberFormatOptions = {}): string => {
    const {
      locale = 'th',
      currency = false,
      currencyCode = 'THB',
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
      useGrouping = true,
      useThaiDigits = false
    } = options

    let numValue = typeof num === 'string' ? parseFloat(num) : num
    if (isNaN(numValue)) return ''

    let formatted = ''

    if (currency) {
      const formatter = new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping
      })
      formatted = formatter.format(numValue)
    } else {
      const formatter = new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping
      })
      formatted = formatter.format(numValue)
    }

    // Convert to Thai digits if requested
    if (useThaiDigits && locale === 'th') {
      formatted = numberToThai(formatted)
    }

    return formatted
  }

  /**
   * Format number with comma separator and customizable decimal places
   * @param input - Number or string to format
   * @param decimalPlaces - Number of decimal places (default: 2)
   * @param useThaiDigits - Use Thai numerals (default: false)
   * @returns Formatted number string with commas
   */
  const formatWithCommas = (input: number | string, decimalPlaces: number = 2, useThaiDigits: boolean = false): string => {
    let numValue = typeof input === 'string' ? parseFloat(input) : input
    if (isNaN(numValue)) return ''

    // Format with specified decimal places and comma separators
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping: true
    }).format(numValue)

    // Convert to Thai digits if requested
    if (useThaiDigits) {
      return numberToThai(formatted)
    }

    return formatted
  }

  /**
   * Format currency in Thai Baht
   * @param amount - Amount to format
   * @param options - Formatting options
   * @returns Formatted currency string
   */
  const formatCurrency = (amount: number | string, options: Omit<NumberFormatOptions, 'currency'> = {}): string => {
    return formatNumber(amount, { ...options, currency: true })
  }

  /**
   * Format percentage
   * @param value - Percentage value (0-100 or 0-1)
   * @param isDecimal - Whether input is decimal (0-1) or percentage (0-100)
   * @param options - Formatting options
   * @returns Formatted percentage string
   */
  const formatPercentage = (value: number, isDecimal: boolean = false, options: NumberFormatOptions = {}): string => {
    const percentValue = isDecimal ? value * 100 : value
    const {
      locale = 'th',
      maximumFractionDigits = 1,
      useThaiDigits = false
    } = options

    const formatter = new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      style: 'percent',
      maximumFractionDigits,
      minimumFractionDigits: 0
    })

    let formatted = formatter.format(isDecimal ? value : value / 100)
    
    if (useThaiDigits && locale === 'th') {
      formatted = numberToThai(formatted)
    }

    return formatted
  }

  /**
   * Parse formatted number string to number
   * @param formattedNumber - Formatted number string
   * @returns Parsed number or NaN if invalid
   */
  const parseFormattedNumber = (formattedNumber: string): number => {
    if (!formattedNumber) return NaN
    
    // Convert Thai digits to Arabic first
    let cleanNumber = numberFromThai(formattedNumber)
    
    // Remove currency symbols, commas, and other formatting
    cleanNumber = cleanNumber
      .replace(/[฿$€,\s]/g, '') // Remove currency symbols and commas
      .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus
    
    return parseFloat(cleanNumber)
  }

  /**
   * Check if string contains Thai numerals
   * @param str - String to check
   * @returns True if contains Thai numerals
   */
  const hasThaiDigits = (str: string): boolean => {
    return /[๐-๙]/.test(str)
  }

  /**
   * Check if string contains Arabic numerals
   * @param str - String to check
   * @returns True if contains Arabic numerals
   */
  const hasArabicDigits = (str: string): boolean => {
    return /[0-9]/.test(str)
  }

  /**
   * Format file size in Thai
   * @param bytes - File size in bytes
   * @param useThaiDigits - Use Thai numerals
   * @returns Formatted file size string
   */
  const formatFileSize = (bytes: number, useThaiDigits: boolean = false): string => {
    if (bytes === 0) return useThaiDigits ? '๐ ไบต์' : '0 ไบต์'
    
    const units = ['ไบต์', 'กิโลไบต์', 'เมกะไบต์', 'กิกะไบต์', 'เทราไบต์']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1))
    
    let formatted = `${size} ${units[i]}`
    
    if (useThaiDigits) {
      formatted = numberToThai(formatted)
    }
    
    return formatted
  }

  /**
   * Convert number to Thai text (read-aloud)
   * @param num - Number to convert
   * @returns Thai text representation
   */
  const numberToThaiText = (num: number): string => {
    if (num === 0) return 'ศูนย์'
    if (num < 0) return 'ลบ' + numberToThaiText(-num)
    
    // This is a simplified version - full implementation would be quite complex
    // For now, return a placeholder
    return `${num} (การแปลงเป็นข้อความไทยยังไม่สมบูรณ์)`
  }

  /**
   * Format ordinal numbers in Thai
   * @param num - Number to format as ordinal
   * @param useThaiDigits - Use Thai numerals
   * @returns Thai ordinal string
   */
  const formatOrdinal = (num: number, useThaiDigits: boolean = false): string => {
    const numStr = useThaiDigits ? numberToThai(num.toString()) : num.toString()
    return `ที่ ${numStr}`
  }

  return {
    // Core conversion functions
    numberToThai,
    numberFromThai,
    
    // Formatting functions
    formatNumber,
    formatWithCommas,
    formatCurrency,
    formatPercentage,
    formatFileSize,
    formatOrdinal,
    
    // Utility functions
    parseFormattedNumber,
    hasThaiDigits,
    hasArabicDigits,
    numberToThaiText,
    
    // Expose constants for advanced usage
    thaiDigits,
    arabicDigits,
    thaiNumberWords
  }
}