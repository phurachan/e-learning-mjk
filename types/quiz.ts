import type { ICourse } from './course'
import type { ILesson } from './lesson'

export interface IQuizQuestion {
  question: string
  type: 'multiple_choice' | 'true_false' | 'checkboxes' | 'short_answer' | 'essay'
  options?: string[]
  correctAnswers?: string[]
  points: number
  order: number
}

export interface IQuiz {
  _id: string
  id?: string // API returns 'id' instead of '_id'
  title: string
  description?: string
  course: ICourse | string
  lesson?: ILesson | string
  questions: IQuizQuestion[]
  totalPoints: number
  passingScore?: number
  duration?: number
  maxAttempts: number
  showResultsImmediately: boolean
  availableFrom?: Date | string
  availableUntil?: Date | string
  isActive: boolean
  createdBy: string
  createdAt: Date | string
  updatedAt: Date | string
  // Client-side computed fields
  attemptInfo?: {
    attemptCount: number
    bestScore: number | null
    bestPercentage: number | null
    isPassed: boolean
  }
}
