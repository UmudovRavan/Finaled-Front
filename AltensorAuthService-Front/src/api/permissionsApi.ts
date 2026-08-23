import { apiClient } from './client';
import { PermissionResponse } from '../types/permission.types';

export const permissionsApi = {
  getPermissions: (module?: string) => {
    const query = module ? `?module=${encodeURIComponent(module)}` : '';
    return apiClient<PermissionResponse[]>(`/api/Permissions${query}`, {
      skipAuth: true
    });
  }
};
