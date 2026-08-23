import httpClient from './httpClient';
import type { TaskResponse } from '../dto';

export interface DashboardOverviewResponse {
    activeTasks: number;
    overdueTasks: number;
    overdueNew: number;
    completedTasks: number;
    completedGrowth: number;
    workloadPercentage: number;
    totalTasks: number;
    roleScope: 'Admin' | 'Manager' | 'Employee';
    scopeName: string;
    statusDistribution: Array<{
        name: string;
        count: number;
        value: number;
        color: string;
    }>;
    weeklyTrends: Array<{
        name: string;
        Tamamlanan: number;
        DavamEdən: number;
        Ümumi: number;
    }>;
    recentTasks: TaskResponse[];
}

export const dashboardService = {
    async getDashboardOverview(period: string = '30days'): Promise<DashboardOverviewResponse> {
        const response = await httpClient.get<DashboardOverviewResponse>(`/Dashboard/GetDashboardOverview?period=${period}`);
        return response.data;
    },

    async getRoleTasks(): Promise<TaskResponse[]> {
        const response = await httpClient.get<TaskResponse[]>('/Dashboard/GetRoleTasks');
        return response.data;
    },

    async getAllTasks(): Promise<TaskResponse[]> {
        try {
            const roleTasks = await this.getRoleTasks();
            if (roleTasks && roleTasks.length >= 0) return roleTasks;
        } catch {
            // fallback
        }
        const response = await httpClient.get<TaskResponse[]>('/Task/GetAllTask');
        return response.data;
    },
};

export default dashboardService;
