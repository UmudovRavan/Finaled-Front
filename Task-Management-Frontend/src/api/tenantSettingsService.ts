import httpClient from './httpClient';
import type { TenantSettingsDTO, UpdateTenantSettingsRequest } from '../dto';

export function normalizeSettings(raw: any): TenantSettingsDTO {
    if (!raw || typeof raw !== 'object') return raw;
    return {
        id: raw.id ?? raw.Id,
        tenantId: raw.tenantId ?? raw.TenantId,
        defaultTaskDeadlineDays: Number(raw.defaultTaskDeadlineDays ?? raw.DefaultTaskDeadlineDays ?? 3),
        enableEmailNotifications: Boolean(raw.enableEmailNotifications ?? raw.EnableEmailNotifications ?? true),
        notifyOnTaskAssignment: Boolean(raw.notifyOnTaskAssignment ?? raw.NotifyOnTaskAssignment ?? true),
        notifyOnTaskStatusChange: Boolean(raw.notifyOnTaskStatusChange ?? raw.NotifyOnTaskStatusChange ?? true),
        notifyOnDeadlineApproaching: Boolean(raw.notifyOnDeadlineApproaching ?? raw.NotifyOnDeadlineApproaching ?? true),
        deadlineWarningHours: Number(raw.deadlineWarningHours ?? raw.DeadlineWarningHours ?? 24),
        maxActiveTasksPerEmployee: Number(raw.maxActiveTasksPerEmployee ?? raw.MaxActiveTasksPerEmployee ?? 5),
        workingHoursStart: raw.workingHoursStart ?? raw.WorkingHoursStart ?? '09:00',
        workingHoursEnd: raw.workingHoursEnd ?? raw.WorkingHoursEnd ?? '18:00',
        timezone: raw.timezone ?? raw.Timezone ?? 'Asia/Baku',
    };
}

export const tenantSettingsService = {
    async getSettings(): Promise<TenantSettingsDTO> {
        const candidateEndpoints = [
            '/Settings/GetSettings',
            '/Settings',
            '/TenantSettings/GetSettings',
            '/TenantSettings',
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const raw = response.data?.data || response.data?.settings || response.data;
                if (raw && typeof raw === 'object') {
                    return normalizeSettings(raw);
                }
            } catch {
                // Try next
            }
        }

        // Return sensible defaults if backend endpoint not populated yet
        return {
            defaultTaskDeadlineDays: 3,
            enableEmailNotifications: true,
            notifyOnTaskAssignment: true,
            notifyOnTaskStatusChange: true,
            notifyOnDeadlineApproaching: true,
            deadlineWarningHours: 24,
            maxActiveTasksPerEmployee: 5,
            workingHoursStart: '09:00',
            workingHoursEnd: '18:00',
            timezone: 'Asia/Baku',
        };
    },

    async updateSettings(data: UpdateTenantSettingsRequest): Promise<TenantSettingsDTO> {
        const payload = {
            DefaultTaskDeadlineDays: data.defaultTaskDeadlineDays,
            EnableEmailNotifications: data.enableEmailNotifications,
            NotifyOnTaskAssignment: data.notifyOnTaskAssignment,
            NotifyOnTaskStatusChange: data.notifyOnTaskStatusChange,
            NotifyOnDeadlineApproaching: data.notifyOnDeadlineApproaching,
            DeadlineWarningHours: data.deadlineWarningHours,
            MaxActiveTasksPerEmployee: data.maxActiveTasksPerEmployee,
            WorkingHoursStart: data.workingHoursStart,
            WorkingHoursEnd: data.workingHoursEnd,
            Timezone: data.timezone,
        };

        const candidateEndpoints = [
            '/Settings/UpdateSettings',
            '/Settings/Update',
            '/Settings',
            '/TenantSettings/Update',
            '/TenantSettings',
        ];

        let lastErr: any = null;
        for (const ep of candidateEndpoints) {
            try {
                const res = await httpClient.put<any>(ep, payload);
                const raw = res.data?.data || res.data?.settings || res.data;
                return normalizeSettings(raw);
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error('Failed to update tenant settings');
    },
};

export default tenantSettingsService;
