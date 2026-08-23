export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  fullName: string;
  password: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
}

export interface AssignRoleRequest {
  roleId: string;
}
