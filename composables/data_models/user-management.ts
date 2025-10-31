// User Management related interfaces and types

export interface User {
  id: string
  name: string
  email: string
  role: string
  department?: string
  position?: string
  avatar?: string
  phone?: string
  website?: string
  lastLogin?: Date
  emailVerified: boolean
  isActive: boolean
  roles?: Role[]
  createdAt: Date
  updatedAt: Date
}

export interface Role {
  id?: string
  name?: string
  description?: string
  permissions?: string[]
  isActive?: boolean
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Permission {
  id: string
  name: string
  description: string
  module: string
  action: string
  resource: string
  type: 'menu' | 'action' | 'input'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserCreateData {
  name: string
  email: string
  password: string
  role?: string
  department?: string
  position?: string
  avatar?: string
  phone?: string
  website?: string
  roles?: string[]
}

export interface UserUpdateData {
  name?: string
  email?: string
  role?: string
  department?: string
  position?: string
  avatar?: string
  phone?: string
  website?: string
  isActive?: boolean
  roles?: string[]
}

export interface RoleCreateData {
  name: string
  description: string
  permissions: string[]
  createdBy: string
}

export interface RoleUpdateData {
  name?: string
  description?: string
  permissions?: string[]
  isActive?: boolean
}

export interface PermissionCreateData {
  name: string
  description: string
  module: string
  action: string
  resource: string
  type: 'menu' | 'action' | 'input'
}

export interface PermissionUpdateData {
  name?: string
  description?: string
  module?: string
  action?: string
  resource?: string
  type?: 'menu' | 'action' | 'input'
  isActive?: boolean
}

export interface UserListQuery {
  page?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean | string
  department?: string
}

export interface RoleListQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean | string
}

export interface PermissionListQuery {
  page?: number
  limit?: number
  search?: string
  module?: string
  action?: string
  isActive?: boolean | string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface UserManagementResponse<T = any> {
  success: boolean
  data: T
  message?: string
  pagination?: PaginationInfo
}