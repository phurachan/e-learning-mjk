import mongoose, { Document, Schema } from 'mongoose'

export interface IQuizQuestion {
  question: string
  type: 'multiple_choice' | 'true_false' | 'checkboxes' | 'short_answer' | 'essay'
  options?: string[]
  correctAnswers?: string[]
  points: number
  order: number
}

export interface IQuiz extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description?: string
  course: mongoose.Types.ObjectId
  lesson?: mongoose.Types.ObjectId
  questions: IQuizQuestion[]
  totalPoints: number
  passingScore?: number
  duration?: number // minutes
  maxAttempts: number // 0 = unlimited, 1 = once, 2+ = specific number
  showResultsImmediately: boolean
  availableFrom?: Date
  availableUntil?: Date
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const QuizQuestionSchema = new Schema({
  question: {
    type: String,
    required: [true, 'คำถามจำเป็นต้องระบุ']
  },
  type: {
    type: String,
    required: [true, 'ประเภทคำถามจำเป็นต้องระบุ'],
    enum: ['multiple_choice', 'true_false', 'checkboxes', 'short_answer', 'essay']
  },
  options: [{
    type: String
  }],
  correctAnswers: [{
    type: String
  }],
  points: {
    type: Number,
    required: [true, 'คะแนนจำเป็นต้องระบุ'],
    min: [0, 'คะแนนต้องมากกว่าหรือเท่ากับ 0']
  },
  order: {
    type: Number,
    required: [true, 'ลำดับคำถามจำเป็นต้องระบุ']
  }
}, { _id: false })

const QuizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: [true, 'ชื่อแบบทดสอบจำเป็นต้องระบุ'],
    trim: true,
    maxlength: [200, 'ชื่อแบบทดสอบต้องไม่เกิน 200 ตัวอักษร']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'รายวิชาจำเป็นต้องระบุ']
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  questions: {
    type: [QuizQuestionSchema],
    required: [true, 'คำถามจำเป็นต้องมีอย่างน้อย 1 ข้อ'],
    validate: {
      validator: function(questions: IQuizQuestion[]) {
        return questions && questions.length > 0
      },
      message: 'แบบทดสอบต้องมีคำถามอย่างน้อย 1 ข้อ'
    }
  },
  totalPoints: {
    type: Number,
    required: [true, 'คะแนนรวมจำเป็นต้องระบุ'],
    min: [0, 'คะแนนรวมต้องมากกว่าหรือเท่ากับ 0']
  },
  passingScore: {
    type: Number,
    min: [0, 'คะแนนผ่านต้องมากกว่าหรือเท่ากับ 0']
  },
  duration: {
    type: Number,
    min: [1, 'ระยะเวลาต้องมากกว่า 0 นาที']
  },
  maxAttempts: {
    type: Number,
    required: [true, 'จำนวนครั้งที่ทำได้จำเป็นต้องระบุ'],
    default: 1,
    min: [0, 'จำนวนครั้งต้องมากกว่าหรือเท่ากับ 0']
  },
  showResultsImmediately: {
    type: Boolean,
    default: false
  },
  availableFrom: {
    type: Date
  },
  availableUntil: {
    type: Date
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
      const { _id, __v, ...quizData } = ret
      return {
        id: _id.toString(),
        ...quizData
      }
    }
  }
})

// Calculate total points before saving
QuizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0)
  }
  next()
})

// Indexes
QuizSchema.index({ course: 1 })
QuizSchema.index({ lesson: 1 })
QuizSchema.index({ isActive: 1 })
QuizSchema.index({ availableFrom: 1, availableUntil: 1 })
QuizSchema.index({ title: 'text', description: 'text' })

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema)
