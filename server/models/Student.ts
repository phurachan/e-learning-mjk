import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId
  studentId: string
  password: string
  firstname: string
  lastname: string
  fullname: string
  phone?: string
  avatar?: string
  room?: mongoose.Types.ObjectId
  dateOfBirth?: Date
  address?: string
  parentName?: string
  parentPhone?: string
  isActive: boolean
  isChangePassword: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const StudentSchema = new Schema<IStudent>({
  studentId: {
    type: String,
    required: [true, 'รหัสนักเรียนจำเป็นต้องระบุ'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'รหัสนักเรียนต้องไม่เกิน 20 ตัวอักษร']
  },
  password: {
    type: String,
    minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร']
  },
  firstname: {
    type: String,
    required: [true, 'ชื่อจำเป็นต้องระบุ'],
    trim: true,
    maxlength: [50, 'ชื่อต้องไม่เกิน 50 ตัวอักษร']
  },
  lastname: {
    type: String,
    required: [true, 'นามสกุลจำเป็นต้องระบุ'],
    trim: true,
    maxlength: [50, 'นามสกุลต้องไม่เกิน 50 ตัวอักษร']
  },
  fullname: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'เบอร์โทรศัพท์ต้องไม่เกิน 20 ตัวอักษร']
  },
  avatar: {
    type: String,
    trim: true
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'ที่อยู่ต้องไม่เกิน 200 ตัวอักษร']
  },
  parentName: {
    type: String,
    trim: true,
    maxlength: [100, 'ชื่อผู้ปกครองต้องไม่เกิน 100 ตัวอักษร']
  },
  parentPhone: {
    type: String,
    trim: true,
    maxlength: [20, 'เบอร์โทรศัพท์ผู้ปกครองต้องไม่เกิน 20 ตัวอักษร']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isChangePassword: {
    type: Boolean,
    default: true,
    comment: 'true = ต้องเปลี่ยน password, false = เปลี่ยนแล้ว'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, password, ...studentData } = ret
      return {
        id: _id.toString(),
        ...studentData
      }
    }
  }
})

// Indexes (studentId already has unique: true, so no need to add index again)
StudentSchema.index({ room: 1 })
StudentSchema.index({ isActive: 1 })
StudentSchema.index({ firstname: 'text', lastname: 'text', studentId: 'text' })

// Auto-generate fullname before saving
StudentSchema.pre('save', function(next) {
  if (this.isModified('firstname') || this.isModified('lastname')) {
    this.fullname = `${this.firstname} ${this.lastname}`
  }
  next()
})

// Hash password before saving
StudentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()

  try {
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Instance method to check password
StudentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!candidatePassword || !this.password) return false
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema)
