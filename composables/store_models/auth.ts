// Auth Store State and Action interfaces

// Request interfaces - ลงท้ายด้วย Request
export interface AuthLoginRequest {
  email: string
  password: string
}

export interface AuthRegisterRequest {
  name: string
  email: string
  password: string
  department?: string
  position?: string
  role?: string
}

// State interfaces - ลงท้ายด้วย State
export interface AuthState extends BaseState<any, BaseResponseData<User>> {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  hasInitialized: boolean
}

// Response data types สำหรับ BaseResponseData<T>
export interface AuthLoginData {
  token: string
  user: User
}

export interface AuthRegisterData {
  token: string
  user: User
}

export interface AuthMeData {
  user: User
}