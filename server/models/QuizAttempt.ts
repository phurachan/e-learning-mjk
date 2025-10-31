import mongoose, { Document, Schema } from 'mongoose'

export interface IQuizAnswer {
  questionIndex: number
  answer: string | string[]
  isCorrect?: boolean
  pointsEarned?: number
  teacherScore?: number
  teacherFeedback?: string
}

export interface IQuizAttempt extends Document {
  _id: mongoose.Types.ObjectId
  quiz: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  answers: IQuizAnswer[]
  score: number
  maxScore: number
  percentage: number
  isPassed?: boolean
  startedAt: Date
  submittedAt?: Date
  timeSpent?: number // seconds
  attemptNumber: number
  isGraded: boolean
  gradedBy?: mongoose.Types.ObjectId
  gradedAt?: Date
  feedback?: string
  createdAt: Date
  updatedAt: Date
}

const QuizAnswerSchema = new Schema({
  questionIndex: {
    type: Number,
    required: [true, 'ลำดับคำถามจำเป็นต้องระบุ']
  },
  answer: {
    type: Schema.Types.Mixed,
    required: [true, 'คำตอบจำเป็นต้องระบุ']
  },
  isCorrect: {
    type: Boolean
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  teacherScore: {
    type: Number
  },
  teacherFeedback: {
    type: String,
    maxlength: [500, 'ข้อเสนอแนะต้องไม่เกิน 500 ตัวอักษร']
  }
}, { _id: false })

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'แบบทดสอบจำเป็นต้องระบุ']
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'นักเรียนจำเป็นต้องระบุ']
  },
  answers: {
    type: [QuizAnswerSchema],
    default: []
  },
  score: {
    type: Number,
    default: 0,
    min: [0, 'คะแนนต้องมากกว่าหรือเท่ากับ 0']
  },
  maxScore: {
    type: Number,
    required: [true, 'คะแนนเต็มจำเป็นต้องระบุ']
  },
  percentage: {
    type: Number,
    default: 0,
    min: [0, 'เปอร์เซ็นต์ต้องมากกว่าหรือเท่ากับ 0'],
    max: [100, 'เปอร์เซ็นต์ต้องไม่เกิน 100']
  },
  isPassed: {
    type: Boolean
  },
  startedAt: {
    type: Date,
    required: [true, 'เวลาเริ่มทำจำเป็นต้องระบุ'],
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  timeSpent: {
    type: Number,
    min: [0, 'เวลาที่ใช้ต้องมากกว่าหรือเท่ากับ 0']
  },
  attemptNumber: {
    type: Number,
    required: [true, 'ครั้งที่ทำจำเป็นต้องระบุ'],
    min: [1, 'ครั้งที่ทำต้องมากกว่า 0']
  },
  isGraded: {
    type: Boolean,
    default: false
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  feedback: {
    type: String,
    maxlength: [1000, 'ข้อเสนอแนะต้องไม่เกิน 1000 ตัวอักษร']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { _id, __v, ...attemptData } = ret
      return {
        id: _id.toString(),
        ...attemptData
      }
    }
  }
})

// Calculate percentage and isPassed before saving
QuizAttemptSchema.pre('save', function(next) {
  if (this.isModified('score') || this.isModified('maxScore')) {
    this.percentage = this.maxScore > 0 ? (this.score / this.maxScore) * 100 : 0
  }
  next()
})

// Indexes
QuizAttemptSchema.index({ quiz: 1, student: 1, attemptNumber: 1 })
QuizAttemptSchema.index({ student: 1, createdAt: -1 })
QuizAttemptSchema.index({ quiz: 1, isGraded: 1 })
QuizAttemptSchema.index({ submittedAt: 1 })

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema)
