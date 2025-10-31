import type { BaseState } from './base'
import type { Lesson, LessonAttachment } from '~/composables/data_models/lessons'

export interface LessonsState extends BaseState<Lesson> {}

export interface LessonListRequest {
  search?: string
  'filter[course]'?: string
  'filter[isPublished]'?: boolean
  'filter[isActive]'?: boolean
}

export interface LessonCreateRequest {
  title: string
  description?: string
  content: string
  course: string
  order: number
  attachments?: LessonAttachment[]
  publishDate?: string
  isPublished?: boolean
  isActive?: boolean
}

export interface LessonUpdateRequest {
  id: string
  title?: string
  description?: string
  content?: string
  course?: string
  order?: number
  attachments?: LessonAttachment[]
  publishDate?: string
  isPublished?: boolean
  isActive?: boolean
}

export interface LessonPublishRequest {
  id: string
  isPublished: boolean
  publishDate?: string
}

export interface LessonDeleteRequest {
  id: string
}
