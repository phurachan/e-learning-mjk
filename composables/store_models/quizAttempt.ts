import type { BaseState } from './base'
import type { IQuizAttempt } from '~/types/quizAttempt'

export interface QuizAttemptState extends BaseState<QuizAttemptListRequest, IQuizAttempt> {
  currentAttempt: IQuizAttempt | null
}

export interface QuizAttemptListRequest {
  page?: number
  limit?: number
  quiz?: string
  student?: string
  isGraded?: boolean
  submitted?: boolean
  isPassed?: boolean
  sort?: string
  order?: string
  search?: string
}

export interface StartQuizRequest {
  quizId: string
}

export interface SubmitQuizRequest {
  attemptId: string
  answers: Array<{
    questionIndex: number
    answer: string | string[] | null
  }>
}

export interface QuizAttemptDetailRequest {
  attemptId: string
}
