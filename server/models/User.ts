import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import { MODEL_VALIDATION_MESSAGES } from './constants/validation'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string
  role: string
  department?: string
  position?: string
  avatar?: string
  phone?: string
  website?: string
  lastLogin?: Date
  emailVerified: boolean
  isActive: boolean
  roles?: mongoose.Types.ObjectId[]
  passwordResetToken?: string
  passwordResetExpires?: Date
  emailVerificationToken?: string
  deletedAt?: Date
  deletedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  createPasswordResetToken(): string
  fullName: string
}

export interface IUserStatics {
  findByEmail(email: string): Promise<IUser | null>
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.USER_NAME_REQUIRED],
    trim: true,
    maxlength: [100, MODEL_VALIDATION_MESSAGES.USER_NAME_MAX_LENGTH]
  },
  email: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.USER_EMAIL_REQUIRED],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, MODEL_VALIDATION_MESSAGES.USER_EMAIL_INVALID_FORMAT]
  },
  password: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.USER_PASSWORD_REQUIRED],
    minlength: [6, MODEL_VALIDATION_MESSAGES.USER_PASSWORD_MIN_LENGTH]
  },
  role: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.USER_ROLE_REQUIRED],
    enum: ['admin', 'user', 'teacher'],
    default: 'user'
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  department: {
    type: String,
    trim: true,
    maxlength: [50, MODEL_VALIDATION_MESSAGES.USER_DEPARTMENT_MAX_LENGTH]
  },
  position: {
    type: String,
    trim: true,
    maxlength: [50, MODEL_VALIDATION_MESSAGES.USER_POSITION_MAX_LENGTH]
  },
  avatar: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, MODEL_VALIDATION_MESSAGES.USER_PHONE_MAX_LENGTH]
  },
  website: {
    type: String,
    trim: true,
    maxlength: [100, MODEL_VALIDATION_MESSAGES.USER_WEBSITE_MAX_LENGTH]
  },
  lastLogin: {
    type: Date
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
  emailVerificationToken: {
    type: String
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      const { _id, __v, password, passwordResetToken, passwordResetExpires, emailVerificationToken, ...userData } = ret
      return {
        id: _id,
        ...userData
      }
    }
  },
  toObject: { virtuals: true }
})

// Indexes for efficient queries
UserSchema.index({ email: 1, isActive: 1 })
UserSchema.index({ isActive: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ name: 'text', email: 'text' })

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password') || !this.password) return next()
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Instance method to check password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!candidatePassword || !this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to generate password reset token
UserSchema.methods.createPasswordResetToken = function(): string {
  const resetToken = crypto.randomUUID()
  
  this.passwordResetToken = resetToken
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  return resetToken
}

// Static method to find user by email
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true })
}

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)