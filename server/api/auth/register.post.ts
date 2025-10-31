import User from '~/server/models/User'
import { signToken } from '~/server/utils/jwt'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {
  await connectMongoDB()

  try {
    const body = await readBody(event)
    const { name, email, password, department, position, role = 'user' } = body

    // Validate required fields
    if (!name || !email || !password) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: [VALIDATION_DETAILS.FIELD_NAME_REQUIRED, VALIDATION_DETAILS.FIELD_EMAIL_REQUIRED, VALIDATION_DETAILS.FIELD_PASSWORD_REQUIRED]
      })
    }

    // Validate password length
    if (password.length < 6) {
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_INPUT, {
        details: [VALIDATION_DETAILS.PASSWORD_MIN_6]
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })

    if (existingUser) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
        details: [VALIDATION_DETAILS.USER_EMAIL_DUPLICATE]
      })
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      department: department?.trim(),
      position: position?.trim(),
      role,
      emailVerified: false
    })

    await user.save()

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    // Return user data and token
    return createSuccessResponse({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        avatar: user.avatar
      }
    })
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS, {
        details: [VALIDATION_DETAILS.USER_EMAIL_DUPLICATE]
      })
    }

    // Handle validation errors
    if (error.name === API_RESPONSE_CODES.VALIDATION_ERROR_EXCEPTION_NAME) {
      const message = (Object.values(error.errors)[0] as any)?.message || 'Validation error'
      throw createPredefinedError(API_RESPONSE_CODES.INVALID_INPUT, {
        details: [(message || 'Validation error')]
      })
    }

    // Log unexpected errors
    console.error('Registration error:', error)

    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR, {
      details: [(error?.message || 'Internal server error')]
    })
  }
})