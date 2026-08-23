import { apiClient } from './client';
import {
  TenantResponse,
  TenantDetailResponse,
  CreateTenantRequest,
  SuspendTenantRequest,
  ModuleSubscriptionRequest,
  SuspendModuleRequest,
  TenantStatus
} from '../types/tenant.types';

export const platformApi = {
  getTenants: (status?: TenantStatus) => {
    const query = status !== undefined ? `?status=${status}` : '';
    return apiClient<TenantResponse[]>(`/api/Platform/tenants${query}`);
  },

  getTenantById: (id: string) =>
    apiClient<TenantDetailResponse>(`/api/Platform/tenants/${id}`),

  createTenant: (data: CreateTenantRequest) =>
    apiClient<TenantResponse>('/api/Platform/tenants', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  suspendTenant: (id: string, reason?: string) =>
    apiClient<{ message: string }>(`/api/Platform/tenants/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason } as SuspendTenantRequest)
    }),

  unsuspendTenant: (id: string) =>
    apiClient<{ message: string }>(`/api/Platform/tenants/${id}/unsuspend`, {
      method: 'POST'
    }),

  addModule: (tenantId: string, data: ModuleSubscriptionRequest) =>
    apiClient<{ message: string }>(`/api/Platform/tenants/${tenantId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  removeModule: (tenantId: string, moduleId: string) =>
    apiClient<{ message: string }>(`/api/Platform/tenants/${tenantId}/modules/${moduleId}`, {
      method: 'DELETE'
    }),

  suspendModule: (tenantId: string, moduleId: string, reason?: string) =>
    apiClient<{ message: string }>(`/api/Platform/tenants/${tenantId}/modules/${moduleId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason } as SuspendModuleRequest)
    }),

  unsuspendModule: (tenantId: string, moduleId: string) =>
    apiClient<{ message: string }>(`/api/Platform/tenants/${tenantId}/modules/${moduleId}/unsuspend`, {
      method: 'POST'
    })
};
