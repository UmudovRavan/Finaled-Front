export interface TenantSettingsDTO {
    id?: string;
    overdueTaskNotificationEmail?: string;
    isOverdueNotificationEnabled?: boolean;
    updatedAt?: string;
}

export interface UpdateTenantSettingsRequest {
    overdueTaskNotificationEmail?: string;
    isOverdueNotificationEnabled?: boolean;
}

