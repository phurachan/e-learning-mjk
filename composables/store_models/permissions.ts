export interface PermissionsState extends BaseState {
  modules?: any[] 
}

export interface PermissionListRequest extends BaseRequestQuery {}

export interface PermissionCreateRequest extends Omit<Permission, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PermissionUpdateRequest extends Partial<Permission> {
  id: string
}

export interface PermissionDeleteRequest {
  id: string
}