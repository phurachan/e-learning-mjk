import type { BaseState } from './base'

// Dashboard data interfaces
export interface DashboardCourse {
  _id: string
  courseId: string
  name: string
  description?: string
  teacher: {
    _id: string
    firstname: string
    lastname: string
  }
  academicYear: string
  semester: string
  room: {
    _id: string
    name: string
  }
  progress: number
  totalLessons: number
}

export interface DashboardQuiz {
  _id: string
  title: string
  description?: string
  course: {
    _id: string
    courseId: string
    name: string
  }
  teacher: {
    _id: string
    firstname: string
    lastname: string
  }
  maxScore: number
  passingScore: number
  duration: number
  maxAttempts: number
  attemptsMade: number
  startDate?: Date
  endDate?: Date
  status: 'available' | 'upcoming' | 'expired' | 'completed'
}

export interface DashboardResult {
  _id: string
  quiz: {
    _id: string
    title: string
    maxScore: number
  }
  course: {
    _id: string
    courseId: string
    name: string
  }
  score: number
  maxScore: number
  percentage: number
  isPassed: boolean
  isGraded: boolean
  submittedAt: Date
  teacherFeedback?: string
  teacher?: {
    _id: string
    firstname: string
    lastname: string
  }
}

export interface DashboardData {
  courses: DashboardCourse[]
  upcomingQuizzes: DashboardQuiz[]
  recentResults: DashboardResult[]
}

// Student Dashboard State
export interface StudentDashboardState extends BaseState<DashboardData> {
  dashboardData: DashboardData | null
}

// Request interfaces
export interface StudentDashboardRequest {
  studentId: string
}
