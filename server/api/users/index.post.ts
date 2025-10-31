import bcrypt from 'bcryptjs'
import User from '~/server/models/User'
import { connectMongoDB } from '~/server/utils/mongodb'
import { API_RESPONSE_CODES, createPredefinedError, createSuccessResponse, VALIDATION_DETAILS } from '~/server/utils/responseHandler'

export default defineEventHandler(async (event) => {

  await connectMongoDB()

  try {
    const body = await readBody(event)

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      throw createPredefinedError(API_RESPONSE_CODES.MISSING_REQUIRED_FIELDS, {
        details: [VALIDATION_DETAILS.FIELD_NAME_REQUIRED, VALIDATION_DETAILS.FIELD_EMAIL_REQUIRED, VALIDATION_DETAILS.FIELD_PASSWORD_REQUIRED]
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email })
    if (existingUser) {
      throw createPredefinedError(API_RESPONSE_CODES.USER_ALREADY_EXISTS, {
        details: [VALIDATION_DETAILS.USER_EMAIL_DUPLICATE]
      })
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(body.password, saltRounds)

    // Create user data
    const userData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: hashedPassword,
      role: body.role || 'user', // Default to 'user' role
      department: body.department || '',
      position: body.position || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      avatar: body.avatar || null,
      roles: body.roles || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Create new user
    const newUser = new User(userData)
    const savedUser = await newUser.save()

    // Populate roles if any
    await savedUser.populate('roles', 'name code description permissions isActive')

    // Return user data without password
    const userResponse = {
      id: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      department: savedUser.department,
      position: savedUser.position,
      avatar: savedUser.avatar,
      isActive: savedUser.isActive,
      roles: savedUser.roles || [],
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt
    }

    return createSuccessResponse(userResponse)
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }

    // Handle JWT errors
    if (error.message === API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN) {
      throw createPredefinedError(API_RESPONSE_CODES.TOKEN_EXPIRED)
    }

    // Handle validation errors
    if (error.name === API_RESPONSE_CODES.VALIDATION_ERROR_EXCEPTION_NAME) {
      console.log(error);

      const fieldErrors = Object.keys(error.errors)
      throw createPredefinedError(API_RESPONSE_CODES.VALIDATION_ERROR, {
        details: fieldErrors
      })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createPredefinedError(API_RESPONSE_CODES.ALREADY_EXISTS)
    }

    // Log unexpected errors
    throw createPredefinedError(API_RESPONSE_CODES.INTERNAL_ERROR)
  }
})