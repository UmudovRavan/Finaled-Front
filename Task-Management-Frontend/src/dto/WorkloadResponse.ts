import type { TaskResponse } from './TaskResponse';

export interface EmployeeWorkloadDTO {
    userId: string;
    fullName?: string;
    userName?: string;
    email?: string;
    userEmail?: string;
    avatarUrl?: string;
    activeTaskCount: number;
    totalTaskCount?: number;
    completedTaskCount?: number;
    
    // Çətinlik üzrə kvotalar (Asan, Orta, Çətin - hərəsinə 10 tapşırıq)
    easyTasksCount: number;
    mediumTasksCount: number;
    hardTasksCount: number;
    
    // Backwards-compatible aliases
    easyTaskCount?: number;
    mediumTaskCount?: number;
    hardTaskCount?: number;

    tasksDueToday?: number;
    overdueTasks?: number;
    urgentTasks?: number;
    highTasks?: number;
    workloadLevel?: string; // "Low", "Medium", "High", "Overloaded"
    workloadScore?: number;
    workloadPercentage?: number;
    isOverloaded: boolean;
    hasUrgentTasks?: boolean;
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
    workloadLevel?: string;
    isWarning?: boolean;
    warningMessage?: string;
    
    // Backwards-compatible aliases
    isOverloaded?: boolean;
    maxRecommended?: number;
    message?: string;
    warningLevel?: 'none' | 'warning' | 'danger';
}
