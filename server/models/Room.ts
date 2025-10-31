import mongoose, { Document, Schema } from 'mongoose'

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  code: string
  grade: number
  section: string
  academicYear: string
  capacity?: number
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const RoomSchema = new Schema<IRoom>({
  name: {
    type: String,
    required: [true, 'ชื่อห้องเรียนจำเป็นต้องระบุ'],
    trim: true,
    maxlength: [50, 'ชื่อห้องเรียนต้องไม่เกิน 50 ตัวอักษร']
  },
  code: {
    type: String,
    required: [true, 'รหัสห้องเรียนจำเป็นต้องระบุ'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'รหัสห้องเรียนต้องไม่เกิน 20 ตัวอักษร']
  },
  grade: {
    type: Number,
    required: [true, 'ระดับชั้นจำเป็นต้องระบุ'],
    min: [1, 'ระดับชั้นต้องอยู่ระหว่าง 1-6'],
    max: [6, 'ระดับชั้นต้องอยู่ระหว่าง 1-6']
  },
  section: {
    type: String,
    required: [true, 'กลุ่มเรียนจำเป็นต้องระบุ'],
    trim: true,
    maxlength: [10, 'กลุ่มเรียนต้องไม่เกิน 10 ตัวอักษร']
  },
  academicYear: {
    type: String,
    required: [true, 'ปีการศึกษาจำเป็นต้องระบุ'],
    trim: true,
    match: [/^\d{4}$/, 'ปีการศึกษาต้องเป็นตัวเลข 4 หัก เช่น 2567']
  },
  capacity: {
    type: Number,
    min: [1, 'จำนวนนักเรียนสูงสุดต้องมากกว่า 0'],
    max: [100, 'จำนวนนักเรียนสูงสุดต้องไม่เกิน 100']
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
      const { _id, __v, ...roomData } = ret
      return {
        id: _id.toString(),
        ...roomData
      }
    }
  }
})

// Indexes (code already has unique: true, so no need to add index again)
RoomSchema.index({ academicYear: 1, grade: 1 })
RoomSchema.index({ isActive: 1 })
RoomSchema.index({ name: 'text' })

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema)
