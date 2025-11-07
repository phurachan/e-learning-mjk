import mongoose, { Document, Schema } from 'mongoose'

export interface ILessonProgress extends Document {
  _id: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  isCompleted: boolean
  completedAt?: Date
  lastAccessedAt: Date
  timeSpent: number // in seconds
  createdAt: Date
  updatedAt: Date
}

const LessonProgressSchema = new Schema<ILessonProgress>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'นักเรียนจำเป็นต้องระบุ']
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'บทเรียนจำเป็นต้องระบุ']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'รายวิชาจำเป็นต้องระบุ']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: [0, 'เวลาที่ใช้ต้องไม่น้อยกว่า 0']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...progressData } = ret
      return {
        id: _id.toString(),
        ...progressData
      }
    }
  }
})

// Indexes
LessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true }) // One progress per student per lesson
LessonProgressSchema.index({ student: 1, course: 1 })
LessonProgressSchema.index({ lesson: 1 })
LessonProgressSchema.index({ isCompleted: 1 })

// Update completedAt when isCompleted changes to true
LessonProgressSchema.pre('save', function(next) {
  if (this.isModified('isCompleted') && this.isCompleted && !this.completedAt) {
    this.completedAt = new Date()
  }
  next()
})

export default mongoose.models.LessonProgress || mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema)
