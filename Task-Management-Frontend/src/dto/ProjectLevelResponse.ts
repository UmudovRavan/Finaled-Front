import type { TaskResponse } from './TaskResponse';

export interface ProjectLevelDTO {
    id: string | number;
    name: string;
    description?: string;
    projectId: string | number;
    projectName?: string;
    orderIndex: number;
    taskCount?: number;
    completedTaskCount?: number;
    tasks?: TaskResponse[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProjectLevelRequest {
    name: string;
    description?: string;
    projectId: string | number;
    orderIndex?: number;
}

export interface UpdateProjectLevelRequest {
    id: string | number;
    name: string;
    description?: string;
    projectId?: string | number;
    orderIndex?: number;
}

export interface ReorderProjectLevelsRequest {
    projectId: string | number;
    levelIds: (string | number)[];
}
