// Authentication related interfaces and types

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  department?: string
  position?: string
  role?: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  department?: string
  position?: string
  avatar?: string
  lastLogin?: Date
  emailVerified: boolean
  roles?: AuthRole[]
}

export interface AuthRole {
  id: string
  name: string
  description: string
  permissions: string[]
  isActive: boolean
}

export interface AuthResponse {
  success: boolean
  data: {
    token: string
    user: AuthUser
  }
  message?: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}