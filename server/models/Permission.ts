import mongoose, { Document, Schema } from 'mongoose'
import { MODEL_VALIDATION_MESSAGES } from './constants/validation'

export interface IPermission extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  description: string
  module: string
  action: string
  resource: string
  type: 'menu' | 'action' | 'input'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PermissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.PERMISSION_NAME_REQUIRED],
    unique: true,
    trim: true,
    maxlength: [100, MODEL_VALIDATION_MESSAGES.PERMISSION_NAME_MAX_LENGTH]
  },
  description: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.PERMISSION_DESCRIPTION_REQUIRED],
    trim: true,
    maxlength: [200, MODEL_VALIDATION_MESSAGES.PERMISSION_DESCRIPTION_MAX_LENGTH]
  },
  module: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.PERMISSION_MODULE_REQUIRED],
    trim: true,
    maxlength: [50, MODEL_VALIDATION_MESSAGES.PERMISSION_MODULE_MAX_LENGTH]
  },
  action: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.PERMISSION_ACTION_REQUIRED],
    enum: ['create', 'read', 'update', 'delete', 'access', 'hr_view', 'approve', 'reject', 'balance_manage', 'export', 'submit', 'reports'],
    trim: true
  },
  resource: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.PERMISSION_RESOURCE_REQUIRED],
    trim: true,
    maxlength: [50, MODEL_VALIDATION_MESSAGES.PERMISSION_RESOURCE_MAX_LENGTH]
  },
  type: {
    type: String,
    required: [true, MODEL_VALIDATION_MESSAGES.PERMISSION_TYPE_REQUIRED],
    enum: ['menu', 'action', 'input'],
    default: 'action'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...permissionData } = ret
      return {
        id: _id.toString(),
        ...permissionData
      }
    }
  }
})

// Add indexes for better performance (name index automatically created by unique: true)
PermissionSchema.index({ module: 1 })
PermissionSchema.index({ action: 1 })
PermissionSchema.index({ resource: 1 })
PermissionSchema.index({ type: 1 })
PermissionSchema.index({ isActive: 1 })

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema)