import mongoose, { Document, Schema } from 'mongoose'

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description?: string
  content: string
  course: mongoose.Types.ObjectId
  order: number
  attachments?: Array<{
    name: string
    url: string
    type: string
    size: number
  }>
  publishDate?: Date
  isPublished: boolean
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const LessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: [true, 'ชื่อบทเรียนจำเป็นต้องระบุ'],
    trim: true,
    maxlength: [200, 'ชื่อบทเรียนต้องไม่เกิน 200 ตัวอักษร']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร']
  },
  content: {
    type: String,
    required: [true, 'เนื้อหาบทเรียนจำเป็นต้องระบุ']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'รายวิชาจำเป็นต้องระบุ']
  },
  order: {
    type: Number,
    required: [true, 'ลำดับบทเรียนจำเป็นต้องระบุ'],
    min: [1, 'ลำดับบทเรียนต้องมากกว่า 0']
  },
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  }],
  publishDate: {
    type: Date
  },
  isPublished: {
    type: Boolean,
    default: false
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
      const { _id, __v, ...lessonData } = ret
      return {
        id: _id.toString(),
        ...lessonData
      }
    }
  }
})

// Indexes
LessonSchema.index({ course: 1, order: 1 })
LessonSchema.index({ isPublished: 1, publishDate: 1 })
LessonSchema.index({ isActive: 1 })
LessonSchema.index({ title: 'text', description: 'text' })

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema)
