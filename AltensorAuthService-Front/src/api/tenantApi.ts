import { apiClient } from './client';
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRoleRequest
} from '../types/user.types';
import {
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest
} from '../types/role.types';

export const tenantApi = {
  // User endpoints
  getUsers: () => apiClient<UserResponse[]>('/api/Tenant/users'),

  getUserById: (id: string) => apiClient<UserResponse>(`/api/Tenant/users/${id}`),

  createUser: (data: CreateUserRequest) =>
    apiClient<UserResponse>('/api/Tenant/users', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateUser: (id: string, data: UpdateUserRequest) =>
    apiClient<UserResponse>(`/api/Tenant/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  activateUser: (id: string) =>
    apiClient<{ message: string }>(`/api/Tenant/users/${id}/activate`, {
      method: 'POST'
    }),

  deactivateUser: (id: string) =>
    apiClient<{ message: string }>(`/api/Tenant/users/${id}/deactivate`, {
      method: 'POST'
    }),

  assignRole: (userId: string, data: AssignRoleRequest) =>
    apiClient<{ message: string }>(`/api/Tenant/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  removeRole: (userId: string, roleId: string) =>
    apiClient<{ message: string }>(`/api/Tenant/users/${userId}/roles/${roleId}`, {
      method: 'DELETE'
    }),

  // Role endpoints
  getRoles: () => apiClient<RoleResponse[]>('/api/Tenant/roles'),

  getRoleById: (id: string) => apiClient<RoleResponse>(`/api/Tenant/roles/${id}`),

  createRole: (data: CreateRoleRequest) =>
    apiClient<RoleResponse>('/api/Tenant/roles', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateRole: (id: string, data: UpdateRoleRequest) =>
    apiClient<RoleResponse>(`/api/Tenant/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteRole: (id: string) =>
    apiClient<{ message: string }>(`/api/Tenant/roles/${id}`, {
      method: 'DELETE'
    })
};
