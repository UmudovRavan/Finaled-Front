export interface TenantSettingsDTO {
    id?: string | number;
    tenantId?: string;
    defaultTaskDeadlineDays?: number;
    enableEmailNotifications?: boolean;
    notifyOnTaskAssignment?: boolean;
    notifyOnTaskStatusChange?: boolean;
    notifyOnDeadlineApproaching?: boolean;
    deadlineWarningHours?: number;
    maxActiveTasksPerEmployee?: number;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    timezone?: string;
}

export interface UpdateTenantSettingsRequest {
    defaultTaskDeadlineDays?: number;
    enableEmailNotifications?: boolean;
    notifyOnTaskAssignment?: boolean;
    notifyOnTaskStatusChange?: boolean;
    notifyOnDeadlineApproaching?: boolean;
    deadlineWarningHours?: number;
    maxActiveTasksPerEmployee?: number;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    timezone?: string;
}
