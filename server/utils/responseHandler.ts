// Standardized error handler for server API responses

/**
 * Multi-language message interface
 */
export interface MultiLangMessage {
  th?: string
  en?: string
}

/**
 * Success response helper
 */
export interface APIResponse<T = any> {
  success?: boolean
  data?: T
  message?: string | MultiLangMessage
  messages?: MultiLangMessage
  statusCode: number
  statusMessage: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  },
  stack?: string
}

// Common HTTP Status Codes
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const

// Predefined error messages with multi-language support
export const API_RESPONSE_MESSAGES = {
  UNKNOWN_MESSAGE: {
    th: 'ข้อผิดพลาดที่ยังไม่ได้ระบุสาเหตุ',
    en: 'Unknown message'
  },
  // Authentication & Authorization
  INVALID_CREDENTIALS: {
    th: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    en: 'Invalid email or password'
  },
  UNAUTHORIZED: {
    th: 'จำเป็นต้องเข้าสู่ระบบ',
    en: 'Authentication required'
  },
  FORBIDDEN: {
    th: 'การเข้าถึงถูกปฏิเสธ ไม่มีสิทธิ์เพียงพอ',
    en: 'Access denied. Insufficient permissions'
  },
  TOKEN_EXPIRED: {
    th: 'โทเค็นการยืนยันตัวตนหมดอายุแล้ว',
    en: 'Authentication token has expired'
  },
  ACCOUNT_DEACTIVATED: {
    th: 'บัญชีถูกปิดการใช้งาน',
    en: 'Account has been deactivated'
  },

  // Validation
  VALIDATION_ERROR: {
    th: 'การตรวจสอบข้อมูลล้มเหลว',
    en: 'Validation failed'
  },
  MISSING_REQUIRED_FIELDS: {
    th: 'ข้อมูลจำเป็นขาดหายไป',
    en: 'Required fields are missing'
  },
  INVALID_INPUT: {
    th: 'ข้อมูลที่ป้อนไม่ถูกต้อง',
    en: 'Invalid input provided'
  },

  // Resource Management
  NOT_FOUND: {
    th: 'ไม่พบข้อมูลที่ร้องขอ',
    en: 'Resource not found'
  },
  ALREADY_EXISTS: {
    th: 'ข้อมูลมีอยู่แล้ว',
    en: 'Resource already exists'
  },

  // Server Errors
  INTERNAL_ERROR: {
    th: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    en: 'Internal server error'
  },
  DATABASE_ERROR: {
    th: 'การดำเนินการฐานข้อมูลล้มเหลว',
    en: 'Database operation failed'
  },

  // Success Messages
  SUCCESS: {
    th: 'เสำเร็จ',
    en: 'successful'
  },
  LOGIN_SUCCESS: {
    th: 'เข้าสู่ระบบสำเร็จ',
    en: 'Login successful'
  },
  LOGOUT_SUCCESS: {
    th: 'ออกจากระบบสำเร็จ',
    en: 'Logout successful'
  },
  REGISTER_SUCCESS: {
    th: 'ลงทะเบียนสำเร็จ',
    en: 'Registration successful'
  },

  // User Management
  USER_NOT_FOUND: {
    th: 'ไม่พบผู้ใช้งาน',
    en: 'User not found'
  },
  USER_ALREADY_EXISTS: {
    th: 'ผู้ใช้งานมีอยู่แล้ว',
    en: 'User already exists'
  },
  INVALID_USER_ID: {
    th: 'รหัสผู้ใช้งานไม่ถูกต้อง',
    en: 'Invalid user ID'
  },
  PASSWORD_RESET_SUCCESS: {
    th: 'รีเซ็ตรหัสผ่านสำเร็จ',
    en: 'Password reset successful'
  },

  // Role Management
  ROLE_NOT_FOUND: {
    th: 'ไม่พบบทบาท',
    en: 'Role not found'
  },
  ROLE_ALREADY_EXISTS: {
    th: 'บทบาทมีอยู่แล้ว',
    en: 'Role already exists'
  },
  INVALID_ROLE_ID: {
    th: 'รหัสบทบาทไม่ถูกต้อง',
    en: 'Invalid role ID'
  },
  ROLE_IN_USE: {
    th: 'บทบาทนี้กำลังถูกใช้งาน ไม่สามารถลบได้',
    en: 'Role is currently in use and cannot be deleted'
  },

  // Permission Management
  PERMISSION_NOT_FOUND: {
    th: 'ไม่พบสิทธิ์การใช้งาน',
    en: 'Permission not found'
  },
  PERMISSION_ALREADY_EXISTS: {
    th: 'สิทธิ์การใช้งานมีอยู่แล้ว',
    en: 'Permission already exists'
  },
  INVALID_PERMISSION_ID: {
    th: 'รหัสสิทธิ์การใช้งานไม่ถูกต้อง',
    en: 'Invalid permission ID'
  },
  PERMISSION_IN_USE: {
    th: 'สิทธิ์การใช้งานนี้กำลังถูกใช้งาน ไม่สามารถลบได้',
    en: 'Permission is currently in use and cannot be deleted'
  },

  // Operation Status
  UPDATE_SUCCESS: {
    th: 'อัพเดทข้อมูลสำเร็จ',
    en: 'Update successful'
  },
  CREATE_SUCCESS: {
    th: 'สร้างข้อมูลสำเร็จ',
    en: 'Create successful'
  },
  DELETE_SUCCESS: {
    th: 'ลบข้อมูลสำเร็จ',
    en: 'Delete successful'
  },

  DATA_USED: {
    th: 'ข้อมูลถูกใช้งาน',
    en: 'Data is used'
  }
} as const

// Validation error detail constants for i18n
export const VALIDATION_DETAILS = {
  // Field Requirements
  FIELD_NAME_REQUIRED: 'FIELD_NAME_REQUIRED',
  FIELD_EMAIL_REQUIRED: 'FIELD_EMAIL_REQUIRED',
  FIELD_PASSWORD_REQUIRED: 'FIELD_PASSWORD_REQUIRED',
  FIELD_ROLE_REQUIRED: 'FIELD_ROLE_REQUIRED',
  FIELD_MODULE_REQUIRED: 'FIELD_MODULE_REQUIRED',
  FIELD_ACTION_REQUIRED: 'FIELD_ACTION_REQUIRED',
  FIELD_RESOURCE_REQUIRED: 'FIELD_RESOURCE_REQUIRED',
  FIELD_DESCRIPTION_REQUIRED: 'FIELD_DESCRIPTION_REQUIRED',
  FIELD_PERMISSIONS_REQUIRED: 'FIELD_PERMISSIONS_REQUIRED',

  // Field Validation
  PASSWORD_MIN_6: 'PASSWORD_MIN_6',
  EMAIL_INVALID_FORMAT: 'EMAIL_INVALID_FORMAT',
  NAME_MIN_2_CHARS: 'NAME_MIN_2_CHARS',
  ROLE_INVALID_VALUE: 'ROLE_INVALID_VALUE',
  DEPARTMENT_INVALID_VALUE: 'DEPARTMENT_INVALID_VALUE',
  POSITION_INVALID_VALUE: 'POSITION_INVALID_VALUE',

  // Permission Validation
  PERMISSION_NAME_INVALID: 'PERMISSION_NAME_INVALID',
  PERMISSION_MODULE_INVALID: 'PERMISSION_MODULE_INVALID',
  PERMISSION_ACTION_INVALID: 'PERMISSION_ACTION_INVALID',
  PERMISSION_RESOURCE_INVALID: 'PERMISSION_RESOURCE_INVALID',
  PERMISSION_TYPE_INVALID: 'PERMISSION_TYPE_INVALID',

  // Role Validation
  ROLE_NAME_INVALID: 'ROLE_NAME_INVALID',
  ROLE_PERMISSIONS_INVALID: 'ROLE_PERMISSIONS_INVALID',

  // User Validation
  USER_ID_INVALID: 'USER_ID_INVALID',
  USER_EMAIL_DUPLICATE: 'USER_EMAIL_DUPLICATE',
  USER_PASSWORD_TOO_WEAK: 'USER_PASSWORD_TOO_WEAK',

  // Common Validation
  FIELD_TOO_LONG: 'FIELD_TOO_LONG',
  FIELD_TOO_SHORT: 'FIELD_TOO_SHORT',
  FIELD_INVALID_CHARACTERS: 'FIELD_INVALID_CHARACTERS',
  FIELD_INVALID_FORMAT: 'FIELD_INVALID_FORMAT',

  INVALID_PERMISSION_ID: 'INVALID_PERMISSION_ID',
  ROLE_IN_USE: 'ROLE_IN_USE',
  INVALID_ROLE_ID: 'INVALID_ROLE_ID',
} as const

// Predefined responses - Using i18n keys for statusMessage
export const API_RESPONSE_CODES = {
  SUCCESS: 'SUCCESS',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',

  // Authentication & Authorization
  INVALID_OR_EXPIRED_TOKEN: 'INVALID_OR_EXPIRED_TOKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR_EXCEPTION_NAME: 'ValidationError',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_INPUT: 'INVALID_INPUT',

  // Resource Management
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  DATA_USED: 'DATA_USED',

  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // User Management
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_USER_ID: 'INVALID_USER_ID',

  // Role Management
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  ROLE_ALREADY_EXISTS: 'ROLE_ALREADY_EXISTS',
  INVALID_ROLE_ID: 'INVALID_ROLE_ID',
  ROLE_IN_USE: 'ROLE_IN_USE',

  // Permission Management
  PERMISSION_NOT_FOUND: 'PERMISSION_NOT_FOUND',
  PERMISSION_ALREADY_EXISTS: 'PERMISSION_ALREADY_EXISTS',
  INVALID_PERMISSION_ID: 'INVALID_PERMISSION_ID',
  PERMISSION_IN_USE: 'PERMISSION_IN_USE',

  // Account Status
  ACCOUNT_DEACTIVATED: 'ACCOUNT_DEACTIVATED',
} as const

export const API_RESPONSE = {
  SUCCESS: {
    statusCode: HTTP_STATUS.OK,
    statusMessage: 'SUCCESS',
    messages: API_RESPONSE_MESSAGES.SUCCESS,
    message: API_RESPONSE_MESSAGES.SUCCESS.en,
  },
  LOGIN_SUCCESS: {
    statusCode: HTTP_STATUS.OK,
    statusMessage: 'SUCCESS',
    messages: API_RESPONSE_MESSAGES.LOGIN_SUCCESS,
    message: API_RESPONSE_MESSAGES.LOGIN_SUCCESS.en,
  },
  LOGOUT_SUCCESS: {
    statusCode: HTTP_STATUS.OK,
    statusMessage: 'SUCCESS',
    messages: API_RESPONSE_MESSAGES.LOGOUT_SUCCESS,
    message: API_RESPONSE_MESSAGES.LOGOUT_SUCCESS.en,
  },
  REGISTER_SUCCESS: {
    statusCode: HTTP_STATUS.OK,
    statusMessage: 'SUCCESS',
    messages: API_RESPONSE_MESSAGES.REGISTER_SUCCESS,
    message: API_RESPONSE_MESSAGES.REGISTER_SUCCESS.en,
  },
  // Authentication & Authorization
  INVALID_CREDENTIALS: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: 'INVALID_EMAIL_PASSWORD',
    messages: API_RESPONSE_MESSAGES.INVALID_CREDENTIALS,
    message: API_RESPONSE_MESSAGES.INVALID_CREDENTIALS.en,
  },
  UNAUTHORIZED: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: 'AUTHENTICATION_REQUIRED',
    messages: API_RESPONSE_MESSAGES.UNAUTHORIZED,
    message: API_RESPONSE_MESSAGES.UNAUTHORIZED.en,
  },
  FORBIDDEN: {
    statusCode: HTTP_STATUS.FORBIDDEN,
    statusMessage: 'ACCESS_DENIED_INSUFFICIENT_PERMISSIONS',
    messages: API_RESPONSE_MESSAGES.FORBIDDEN,
    message: API_RESPONSE_MESSAGES.FORBIDDEN.en,
  },
  TOKEN_EXPIRED: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: 'TOKEN_EXPIRED',
    messages: API_RESPONSE_MESSAGES.TOKEN_EXPIRED,
    message: API_RESPONSE_MESSAGES.TOKEN_EXPIRED.en,
  },

  // Validation
  VALIDATION_ERROR: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'VALIDATION_FAILED',
    messages: API_RESPONSE_MESSAGES.VALIDATION_ERROR,
    message: API_RESPONSE_MESSAGES.VALIDATION_ERROR.en,
  },
  MISSING_REQUIRED_FIELDS: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'REQUIRED_FIELDS_MISSING',
    messages: API_RESPONSE_MESSAGES.MISSING_REQUIRED_FIELDS,
    message: API_RESPONSE_MESSAGES.MISSING_REQUIRED_FIELDS.en,
  },
  INVALID_INPUT: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'INVALID_INPUT_PROVIDED',
    messages: API_RESPONSE_MESSAGES.INVALID_INPUT,
    message: API_RESPONSE_MESSAGES.INVALID_INPUT.en,
  },

  // Resource Management
  NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: 'RESOURCE_NOT_FOUND',
    messages: API_RESPONSE_MESSAGES.NOT_FOUND,
    message: API_RESPONSE_MESSAGES.NOT_FOUND.en,
  },
  ALREADY_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'RESOURCE_ALREADY_EXISTS',
    messages: API_RESPONSE_MESSAGES.ALREADY_EXISTS,
    message: API_RESPONSE_MESSAGES.ALREADY_EXISTS.en,
  },
  DATA_USED: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'RESOURCE_IS_USED',
    messages: API_RESPONSE_MESSAGES.DATA_USED,
    message: API_RESPONSE_MESSAGES.DATA_USED.en,
  },

  // Server Errors
  INTERNAL_ERROR: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    statusMessage: 'INTERNAL_SERVER_ERROR',
    messages: API_RESPONSE_MESSAGES.INTERNAL_ERROR,
    message: API_RESPONSE_MESSAGES.INTERNAL_ERROR.en,
  },
  DATABASE_ERROR: {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    statusMessage: 'DATABASE_OPERATION_FAILED',
    messages: API_RESPONSE_MESSAGES.DATABASE_ERROR,
    message: API_RESPONSE_MESSAGES.DATABASE_ERROR.en,
  },

  // User Management
  USER_NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: 'USER_NOT_FOUND',
    messages: API_RESPONSE_MESSAGES.USER_NOT_FOUND,
    message: API_RESPONSE_MESSAGES.USER_NOT_FOUND.en,
  },
  USER_ALREADY_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'USER_ALREADY_EXISTS',
    messages: API_RESPONSE_MESSAGES.USER_ALREADY_EXISTS,
    message: API_RESPONSE_MESSAGES.USER_ALREADY_EXISTS.en,
  },
  INVALID_USER_ID: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'INVALID_USER_ID',
    messages: API_RESPONSE_MESSAGES.INVALID_USER_ID,
    message: API_RESPONSE_MESSAGES.INVALID_USER_ID.en,
  },

  // Role Management
  ROLE_NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: 'ROLE_NOT_FOUND',
    messages: API_RESPONSE_MESSAGES.ROLE_NOT_FOUND,
    message: API_RESPONSE_MESSAGES.ROLE_NOT_FOUND.en,
  },
  ROLE_ALREADY_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'ROLE_ALREADY_EXISTS',
    messages: API_RESPONSE_MESSAGES.ROLE_ALREADY_EXISTS,
    message: API_RESPONSE_MESSAGES.ROLE_ALREADY_EXISTS.en,
  },
  INVALID_ROLE_ID: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'INVALID_ROLE_ID',
    messages: API_RESPONSE_MESSAGES.INVALID_ROLE_ID,
    message: API_RESPONSE_MESSAGES.INVALID_ROLE_ID.en,
  },
  ROLE_IN_USE: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'ROLE_IN_USE_CANNOT_DELETE',
    messages: API_RESPONSE_MESSAGES.ROLE_IN_USE,
    message: API_RESPONSE_MESSAGES.ROLE_IN_USE.en,
  },

  // Permission Management
  PERMISSION_NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    statusMessage: 'PERMISSION_NOT_FOUND',
    messages: API_RESPONSE_MESSAGES.PERMISSION_NOT_FOUND,
    message: API_RESPONSE_MESSAGES.PERMISSION_NOT_FOUND.en,
  },
  PERMISSION_ALREADY_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    statusMessage: 'PERMISSION_ALREADY_EXISTS',
    messages: API_RESPONSE_MESSAGES.PERMISSION_ALREADY_EXISTS,
    message: API_RESPONSE_MESSAGES.PERMISSION_ALREADY_EXISTS.en,
  },
  INVALID_PERMISSION_ID: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'INVALID_PERMISSION_ID',
    messages: API_RESPONSE_MESSAGES.INVALID_PERMISSION_ID,
    message: API_RESPONSE_MESSAGES.INVALID_PERMISSION_ID.en,
  },
  PERMISSION_IN_USE: {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    statusMessage: 'PERMISSION_IN_USE_CANNOT_DELETE',
    messages: API_RESPONSE_MESSAGES.PERMISSION_IN_USE,
    message: API_RESPONSE_MESSAGES.PERMISSION_IN_USE.en,
  },

  // Account Status
  ACCOUNT_DEACTIVATED: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    statusMessage: 'ACCOUNT_DEACTIVATED',
    messages: API_RESPONSE_MESSAGES.ACCOUNT_DEACTIVATED,
    message: API_RESPONSE_MESSAGES.ACCOUNT_DEACTIVATED.en,
  }
} as const


/**
 * Create a standardized API error
 */
export const createAPIError = (response: APIResponse) => {
  const { statusCode, statusMessage, messages, message, data, ...customProps } = response
  /// สร้าง error standardized response (object ของ H3)
  const msg = typeof message === 'string' ? message : message?.en
  const error = createError({
    statusCode,
    statusMessage,
    message: msg,
    data: {
      statusCode,
      statusMessage,
      messages,
      message: msg,
      ...(customProps ?? {}),
      ...(data ?? {}),
    }
  });

  return error
}

/**
 * Create error from predefined error types
 */
export function createPredefinedError(errorType: keyof typeof API_RESPONSE, additionalData: any = {}) {
  const error = API_RESPONSE[errorType]
  return createAPIError({
    ...error,
    data: {
      ...additionalData
    },
  })
}

/**
 * Create multi-language message from key
 */
export function getMultiLangMessage(messageKey: keyof typeof API_RESPONSE_MESSAGES): MultiLangMessage {
  return API_RESPONSE_MESSAGES[messageKey] || API_RESPONSE_MESSAGES.UNKNOWN_MESSAGE
}

/**
 * Create validation error with field details
 */
export function createValidationError(fields: Record<string, string[]> | string) {
  const message = typeof fields === 'string' ? fields : 'Validation failed'
  const data = typeof fields === 'object' ? { errors: fields } : undefined

  return createAPIError({
    statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    statusMessage: message,
    data
  })
}

/**
 * Create authentication error
 */
export function createAuthError(message?: string) {
  const response = API_RESPONSE.UNAUTHORIZED
  return createAPIError({
    ...response,
    message: message || response.message,
  })
}

/**
 * Create forbidden error
 */
export function createForbiddenError(message?: string) {
  const response = API_RESPONSE.FORBIDDEN
  return createAPIError({
    ...response,
    message: message || response.message,
  })
}

/**
 * Create not found error
 */
export function createNotFoundError(message?: string) {
  const response = API_RESPONSE.NOT_FOUND
  return createAPIError({
    ...response,
    message: message || response.message,
  })
}

/**
 * Create bad request error
 */
export function createBadRequestError(message?: string) {
  const response = API_RESPONSE.INVALID_INPUT
  return createAPIError({
    ...response,
    message: message || response.message,
  })
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data?: T,
  options: {
    responseType?: keyof typeof API_RESPONSE,
    additionalData?: any
  } = {
      responseType: API_RESPONSE_CODES.SUCCESS,
      additionalData: {},
    }
): APIResponse<T> {
  const success = API_RESPONSE[options.responseType || API_RESPONSE_CODES.SUCCESS]
  return {
    success: success.statusCode >= 200 && success.statusCode < 300,
    statusCode: success.statusCode ?? API_RESPONSE.SUCCESS.statusCode,
    statusMessage: success.statusMessage ?? API_RESPONSE.SUCCESS.statusMessage,
    messages: success.messages,
    message: success.messages?.en || success.statusMessage,
    data: data,
    ...(options.additionalData || {}),
  }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  },
  options: {
    responseType?: keyof typeof API_RESPONSE,
    additionalData?: any
  } = {
      responseType: API_RESPONSE_CODES.SUCCESS,
      additionalData: {},
    }
): APIResponse<T[]> {
  const success = API_RESPONSE[options.responseType || API_RESPONSE_CODES.SUCCESS]
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const response: APIResponse<T[]> = {
    success: success.statusCode >= 200 && success.statusCode < 300,
    statusCode: success.statusCode ?? API_RESPONSE.SUCCESS.statusCode,
    statusMessage: success.statusMessage ?? API_RESPONSE.SUCCESS.statusMessage,
    messages: success.messages,
    message: success.messages?.en || success.statusMessage,
    data: data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    },
    ...(options.additionalData || {}),
  }

  return response
}