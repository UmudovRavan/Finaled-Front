import type { TaskResponse } from './TaskResponse';

export interface EmployeeWorkloadDTO {
    userId: string;
    userName: string;
    userEmail?: string;
    avatarUrl?: string;
    activeTaskCount: number;
    totalTaskCount: number;
    completedTaskCount: number;
    hardTaskCount: number;
    mediumTaskCount: number;
    easyTaskCount: number;
    workloadPercentage: number;
    isOverloaded: boolean;
    hasUrgentTasks: boolean;
    tasks?: TaskResponse[];
}

export interface WorkloadWarningDTO {
    isOverloaded: boolean;
    activeTaskCount: number;
    maxRecommended?: number;
    message?: string;
    warningLevel: 'none' | 'warning' | 'danger';
}
