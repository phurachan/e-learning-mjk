import type { BaseState } from './base'
import type { Student } from '~/composables/data_models/students'

export interface StudentsState extends BaseState<Student> {}

export interface StudentListRequest {
  search?: string
  'filter[studentId]'?: string
  'filter[room]'?: string
  'filter[isActive]'?: boolean
}

export interface StudentCreateRequest {
  studentId: string
  firstname: string
  lastname: string
  password?: string
  phone?: string
  avatar?: string
  room: string
  dateOfBirth?: string
  address?: string
  parentName?: string
  parentPhone?: string
  isActive?: boolean
}

export interface StudentUpdateRequest {
  id: string
  studentId?: string
  firstname?: string
  lastname?: string
  password?: string
  phone?: string
  avatar?: string
  room?: string
  dateOfBirth?: string
  address?: string
  parentName?: string
  parentPhone?: string
  isActive?: boolean
}

export interface StudentDeleteRequest {
  id: string
}

export interface StudentImportRequest {
  file: File
}
