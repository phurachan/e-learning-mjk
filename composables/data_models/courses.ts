export interface Course {
  id: string
  name: string
  code: string
  description?: string
  teacher: {
    id: string
    name: string
    email: string
  }
  rooms: {
    id: string
    name: string
    code: string
    grade: number
    section: string
    academicYear: string
  }[]
  academicYear: string
  semester: number
  isActive: boolean
  createdBy?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}
