import httpClient from './httpClient';
import type { TenantSettingsDTO, UpdateTenantSettingsRequest } from '../dto';

export function normalizeSettings(raw: any): TenantSettingsDTO {
    if (!raw || typeof raw !== 'object') return raw;
    return {
        id: raw.id ?? raw.Id,
        overdueTaskNotificationEmail: raw.overdueTaskNotificationEmail ?? raw.OverdueTaskNotificationEmail ?? '',
        isOverdueNotificationEnabled: raw.isOverdueNotificationEnabled ?? raw.IsOverdueNotificationEnabled ?? true,
        updatedAt: raw.updatedAt ?? raw.UpdatedAt ?? '',
    };
}

export const tenantSettingsService = {
    async getSettings(): Promise<TenantSettingsDTO> {
        const response = await httpClient.get<any>('/Settings');
        const raw = response.data?.data || response.data?.settings || response.data;
        if (raw && typeof raw === 'object') {
            return normalizeSettings(raw);
        }
        return {
            overdueTaskNotificationEmail: '',
            isOverdueNotificationEnabled: true,
        };
    },

    async updateSettings(data: UpdateTenantSettingsRequest): Promise<TenantSettingsDTO> {
        const payload = {
            OverdueTaskNotificationEmail: data.overdueTaskNotificationEmail || null,
            IsOverdueNotificationEnabled: data.isOverdueNotificationEnabled ?? true,
        };

        const res = await httpClient.put<any>('/Settings', payload);
        const raw = res.data?.data || res.data?.settings || res.data;
        return normalizeSettings(raw);
    },
};

export default tenantSettingsService;

