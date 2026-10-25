export const ProjectStatus = {
    Active: 0,
    Completed: 1,
    OnHold: 2,
    Cancelled: 3,
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export interface ProjectDTO {
    id: string | number;
    name: string;
    description?: string;
    divisionId?: string | number | null;
    divisionName?: string;
    titleId?: string | number | null;
    titleName?: string;
    managerId?: string | null;
    managerName?: string;
    startDate?: string;
    endDate?: string;
    status?: ProjectStatus | number;
    levelCount?: number;
    taskCount?: number;
    completedTaskCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
    divisionId?: string | number | null;
    titleId?: string | number | null;
    managerId?: string | null;
    startDate?: string;
    endDate?: string;
}

export interface UpdateProjectRequest {
    id: string | number;
    name: string;
    description?: string;
    divisionId?: string | number | null;
    titleId?: string | number | null;
    managerId?: string | null;
    startDate?: string;
    endDate?: string;
    status?: ProjectStatus | number;
}
