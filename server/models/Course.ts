import mongoose, { Document, Schema } from 'mongoose'

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  code: string
  description?: string
  teacher: mongoose.Types.ObjectId
  rooms: mongoose.Types.ObjectId[]
  academicYear: string
  semester: number
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: [true, 'ชื่อรายวิชาจำเป็นต้องระบุ'],
    trim: true,
    maxlength: [100, 'ชื่อรายวิชาต้องไม่เกิน 100 ตัวอักษร']
  },
  code: {
    type: String,
    required: [true, 'รหัสวิชาจำเป็นต้องระบุ'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'รหัสวิชาต้องไม่เกิน 20 ตัวอักษร']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'รายละเอียดต้องไม่เกิน 500 ตัวอักษร']
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ครูผู้สอนจำเป็นต้องระบุ']
  },
  rooms: [{
    type: Schema.Types.ObjectId,
    ref: 'Room'
  }],
  academicYear: {
    type: String,
    required: [true, 'ปีการศึกษาจำเป็นต้องระบุ'],
    trim: true,
    match: [/^\d{4}$/, 'ปีการศึกษาต้องเป็นตัวเลข 4 หลัก เช่น 2567']
  },
  semester: {
    type: Number,
    required: [true, 'ภาคเรียนจำเป็นต้องระบุ'],
    enum: [1, 2],
    min: [1, 'ภาคเรียนต้องเป็น 1 หรือ 2'],
    max: [2, 'ภาคเรียนต้องเป็น 1 หรือ 2']
  },
  isActive: {
    type: Boolean,
    default: true
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
      const { _id, __v, ...courseData } = ret
      return {
        id: _id.toString(),
        ...courseData
      }
    }
  }
})

// Indexes (code already has unique: true, so no need to add index again)
CourseSchema.index({ teacher: 1 })
CourseSchema.index({ academicYear: 1, semester: 1 })
CourseSchema.index({ isActive: 1 })
CourseSchema.index({ name: 'text', code: 'text' })

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)
