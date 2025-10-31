export interface LessonAttachment {
  name: string
  url: string
  type: string
  size: number
}

export interface Lesson {
  id: string
  title: string
  description?: string
  content: string
  course: {
    id: string
    name: string
    code: string
  }
  order: number
  attachments?: LessonAttachment[]
  publishDate?: string
  isPublished: boolean
  isActive: boolean
  createdBy?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}
