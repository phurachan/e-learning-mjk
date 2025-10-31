import mongoose, { Document, Schema } from 'mongoose'
import { MODEL_VALIDATION_MESSAGES } from './constants/validation'

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  code: string
  description: string
  permissions: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.ROLE_NAME_REQUIRED],
    unique: true,
    trim: true,
    maxlength: [50, MODEL_VALIDATION_MESSAGES.ROLE_NAME_MAX_LENGTH]
  },
  code: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.ROLE_CODE_REQUIRED],
    unique: true,
    trim: true,
    maxlength: [50, MODEL_VALIDATION_MESSAGES.ROLE_CODE_MAX_LENGTH]
  },
  description: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.ROLE_DESCRIPTION_REQUIRED],
    trim: true,
    maxlength: [200, MODEL_VALIDATION_MESSAGES.ROLE_DESCRIPTION_MAX_LENGTH]
  },
  permissions: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...roleData } = ret
      return {
        id: _id.toString(),
        ...roleData
      }
    }
  }
})

// Add indexes for better performance (name index automatically created by unique: true)
RoleSchema.index({ isActive: 1 })
RoleSchema.index({ createdAt: -1 })

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema)