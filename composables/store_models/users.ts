import type { BaseState } from './base'

export interface UsersState extends BaseState { 
  userRoles?: Role[]
}

export interface UserListRequest extends BaseRequestQuery {}

export interface UserCreateRequest extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {
  id: string
}

export interface UserDeleteRequest {
  id: string
}

export interface UserRolesUpdateRequest {
  userId: string
  roleIds: string[]
}