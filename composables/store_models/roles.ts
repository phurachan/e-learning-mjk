export interface RolesState extends BaseState {}

export interface RoleListRequest extends BaseRequestQuery {}

export interface RoleCreateRequest extends Omit<Role, 'id' | 'createdAt' | 'updatedAt'> {}

export interface RoleUpdateRequest extends Partial<Role> {
  id: string
}

export interface RoleDeleteRequest {
  id: string
}
