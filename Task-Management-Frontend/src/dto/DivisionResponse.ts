export interface DivisionDTO {
    id: string | number;
    name: string;
    description?: string;
    managerId?: string | null;
    managerName?: string;
    projectCount?: number;
    taskCount?: number;
    completedTaskCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateDivisionRequest {
    name: string;
    description?: string;
    managerId?: string | null;
}

export interface UpdateDivisionRequest {
    id: string | number;
    name: string;
    description?: string;
    managerId?: string | null;
}
