export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  tenantId?: string;
  permissions: string[];
  permissionIds?: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}
