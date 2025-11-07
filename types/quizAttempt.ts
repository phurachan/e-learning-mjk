import type { IQuiz } from './quiz'
import type { IStudent } from './student'

export interface IQuizAnswer {
  questionIndex: number
  answer: string | string[] | null
  isCorrect?: boolean
  pointsEarned?: number
  teacherScore?: number
  teacherFeedback?: string
}

export interface IQuizAttempt {
  _id: string
  id?: string // API returns 'id' instead of '_id'
  quiz: IQuiz
  student: IStudent | string
  answers: IQuizAnswer[]
  score: number
  maxScore: number
  percentage: number
  isPassed?: boolean
  startedAt: Date | string
  submittedAt?: Date | string
  timeSpent?: number
  attemptNumber: number
  isGraded: boolean
  gradedBy?: string
  gradedAt?: Date | string
  feedback?: string
  createdAt: Date | string
  updatedAt: Date | string
}
