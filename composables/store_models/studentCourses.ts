import type { BaseState } from './base'

// Course interfaces for student
export interface StudentCourse {
  _id: string
  courseId: string // code
  name: string
  description?: string
  teacher: {
    _id: string
    name?: string
    firstname?: string
    lastname?: string
  }
  academicYear: string
  semester: number
  room: {
    id: string
    name: string
    code: string
    grade: number
    section: string
    academicYear: string
  }
  progress: number
  totalLessons: number
  completedLessons: number
}

// Lesson interface for course detail
export interface StudentLesson {
  _id: string
  title: string
  description?: string
  content?: string
  order: number
  duration?: number
  isPublished: boolean
  hasQuiz: boolean
  isCompleted: boolean
  progress?: {
    isCompleted: boolean
    startedAt?: Date
    completedAt?: Date
    timeSpent: number
  }
}

// Course detail with lessons
export interface StudentCourseDetail extends StudentCourse {
  lessons: StudentLesson[]
}

// Student Courses State
export interface StudentCoursesState extends BaseState<StudentCourse> {
  currentCourse: StudentCourseDetail | null
  currentLesson: StudentLessonDetail | null
}

// Lesson detail with full content
export interface StudentLessonDetail extends StudentLesson {
  course: {
    _id: string
    name: string
    code: string
  }
  files?: {
    _id: string
    name: string
    url: string
    type: string
    size: number
  }[]
  videoUrl?: string
  quiz?: {
    _id: string
    title: string
    description?: string
  }
  navigation?: {
    previous?: {
      _id: string
      title: string
    }
    next?: {
      _id: string
      title: string
    }
  }
}

// Request interfaces
export interface StudentCoursesRequest {
  studentId: string
}

export interface StudentCourseDetailRequest {
  studentId: string
  courseId: string
}

export interface StudentLessonDetailRequest {
  studentId: string
  lessonId: string
}
