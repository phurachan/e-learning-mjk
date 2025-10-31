import type { BaseState } from './base'

// Student info interface
export interface StudentInfo {
  id: string
  studentId: string
  firstname: string
  lastname: string
  fullname: string
  avatar?: string
  isChangePassword: boolean
  room: {
    id: string
    name: string
    code: string
    grade: number
    section: string
    academicYear: string
  } | null
}

// Student Auth State
export interface StudentAuthState extends Omit<BaseState<StudentInfo>, 'list' | 'pagination'> {
  student: StudentInfo | null
  token: string | null
  isAuthenticated: boolean
}

// Request interfaces
export interface StudentLoginRequest {
  studentId: string
  password: string
}

export interface StudentLoginResponse {
  success: boolean
  data: {
    token: string
    isChangePassword: boolean
    student: StudentInfo
  }
}

export interface StudentChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
