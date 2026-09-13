export interface CompanyDivisionStat {
    divisionId: string | number;
    divisionName: string;
    projectCount: number;
    taskCount: number;
    completedCount: number;
    activeCount: number;
    completionRate: number;
}

export interface CompanyDashboardDTO {
    totalDivisions: number;
    totalProjects: number;
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
    divisionStats: CompanyDivisionStat[];
    weeklyTrends?: Array<{
        name: string;
        Tamamlanan: number;
        DavamEdən: number;
        Ümumi: number;
    }>;
}
