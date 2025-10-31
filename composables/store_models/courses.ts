import type { BaseState } from './base'
import type { Course } from '~/composables/data_models/courses'

export interface CoursesState extends BaseState<Course> {}

export interface CourseListRequest {
  search?: string
  'filter[teacher]'?: string
  'filter[academicYear]'?: string
  'filter[semester]'?: number
  'filter[isActive]'?: boolean
}

export interface CourseCreateRequest {
  name: string
  code: string
  description?: string
  teacher: string
  rooms?: string[]
  academicYear: string
  semester: number
  isActive?: boolean
}

export interface CourseUpdateRequest {
  id: string
  name?: string
  code?: string
  description?: string
  teacher?: string
  rooms?: string[]
  academicYear?: string
  semester?: number
  isActive?: boolean
}

export interface CourseDeleteRequest {
  id: string
}
