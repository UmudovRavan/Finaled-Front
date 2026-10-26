import type { TaskResponse } from './TaskResponse';

export const WORKLOAD_QUOTA_PER_DIFFICULTY = 10;
export const WORKLOAD_QUOTA_TOTAL = 30;

export interface EmployeeWorkloadDTO {
    userId: string;
    userName: string;
    fullName?: string;
    userEmail?: string;
    email?: string;
    avatarUrl?: string;
    activeTaskCount: number;
    totalTaskCount: number;
    completedTaskCount: number;
    hardTaskCount: number;
    mediumTaskCount: number;
    easyTaskCount: number;
    easyTasksCount?: number;
    mediumTasksCount?: number;
    hardTasksCount?: number;
    tasksDueToday?: number;
    overdueTasks?: number;
    workloadLevel?: 'Low' | 'Medium' | 'High' | 'Overloaded' | string;
    workloadScore?: number;
    workloadPercentage: number;
    isOverloaded: boolean;
    hasUrgentTasks: boolean;
    tasks?: TaskResponse[];
}

export interface WorkloadWarningDTO {
    userId?: string;
    fullName?: string;
    activeTaskCount: number;
    easyTasksCount?: number;
    mediumTasksCount?: number;
    hardTasksCount?: number;
    tasksDueToday?: number;
    workloadLevel?: 'Low' | 'Medium' | 'High' | 'Overloaded' | string;
    isWarning?: boolean;
    warningMessage?: string;
    // Backward compatibility fields
    isOverloaded: boolean;
    maxRecommended?: number;
    message?: string;
    warningLevel?: 'none' | 'warning' | 'danger';
}
