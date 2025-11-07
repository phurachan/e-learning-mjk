import type { BaseState, BaseRequestQuery } from './base'
import type { IQuiz } from '~/types/quiz'

export interface QuizState extends BaseState<QuizListRequest, IQuiz> {
  currentQuiz: IQuiz | null
  enrolledCourses: any[]
}

export interface QuizListRequest {
  page?: number
  limit?: number
  course?: string
  lesson?: string
  title?: string
  isActive?: boolean
  sort?: string
  search?: string
}

export interface QuizDetailRequest {
  quizId: string
}

export interface QuizQuestionsRequest {
  quizId: string
}
