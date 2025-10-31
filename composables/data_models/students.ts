export interface Student {
  id: string
  studentId: string
  firstname: string
  lastname: string
  fullname: string
  phone?: string
  avatar?: string
  room?: {
    id: string
    name: string
    code: string
    grade: number
    section: string
    academicYear: string
  }
  dateOfBirth?: string
  address?: string
  parentName?: string
  parentPhone?: string
  isActive: boolean
  createdBy?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}
