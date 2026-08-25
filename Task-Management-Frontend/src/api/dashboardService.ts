import httpClient from './httpClient';
import taskService from './taskService';
import { authService } from './authService';
import { parseJwtToken, getPrimaryRole } from '../utils';
import type { TaskResponse } from '../dto';
import { TaskStatus } from '../dto';

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
        try {
            // Attempt server call if available
            const response = await httpClient.get<DashboardOverviewResponse>(`/Dashboard/GetDashboardOverview?period=${period}`);
            if (response.data && typeof response.data === 'object' && response.data.totalTasks !== undefined) {
                return response.data;
            }
        } catch {
            // Fallback to real-time client computation from live tasks
        }

        return this.computeDashboardOverview(period);
    },

    async computeDashboardOverview(period: string = '30days'): Promise<DashboardOverviewResponse> {
        const allTasks = await taskService.getAllTasks().catch(() => []);
        
        // Get user info and role scope
        const token = authService.getToken();
        const user = token ? parseJwtToken(token) : null;
        const rawRole = user?.roles?.length ? getPrimaryRole(user.roles) : 'Employee';
        const roleScope: 'Admin' | 'Manager' | 'Employee' =
            rawRole.toLowerCase().includes('admin') ? 'Admin' :
            rawRole.toLowerCase().includes('manager') ? 'Manager' : 'Employee';

        const userId = user?.userId || '';

        // Filter tasks based on role scope
        let scopedTasks: TaskResponse[] = allTasks;
        let scopeName = 'Qlobal';

        if (roleScope === 'Admin') {
            scopedTasks = allTasks;
            scopeName = 'Bütün Şirkət';
        } else if (roleScope === 'Manager') {
            // Manager sees tasks in their workgroups or assigned to their subordinates
            scopedTasks = allTasks.filter(t => 
                t.createdByUserId === userId || 
                t.assignedToUserId === userId ||
                (t.workGroupId && (user as any)?.workGroupIds?.includes(t.workGroupId))
            );
            scopeName = 'İş Qrupu';
        } else {
            // Employee sees tasks assigned to them or created by them
            scopedTasks = allTasks.filter(t => 
                t.assignedToUserId === userId || 
                t.createdByUserId === userId
            );
            scopeName = 'Şəxsi';
        }

        // Apply period filter if applicable
        const now = new Date();
        let periodStart = new Date(0);
        if (period === '7days') {
            periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'thisMonth') {
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === '30days') {
            periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const tasksInPeriod = scopedTasks.filter(t => {
            if (!t.deadline) return true;
            const d = new Date(t.deadline);
            return isNaN(d.getTime()) || d >= periodStart;
        });

        const activeList = tasksInPeriod.filter(t => 
            t.status === TaskStatus.InProgress || 
            t.status === TaskStatus.Assigned || 
            t.status === TaskStatus.Pending ||
            t.status === TaskStatus.UnderReview
        );
        const activeTasks = activeList.length;

        const overdueList = tasksInPeriod.filter(t => {
            if (!t.deadline || t.status === TaskStatus.Completed || t.status === TaskStatus.Canceled) return false;
            const d = new Date(t.deadline);
            return !isNaN(d.getTime()) && d.getTime() < now.getTime();
        });
        const overdueTasks = overdueList.length;
        const overdueNew = overdueList.filter(t => {
            const d = new Date(t.deadline);
            return (now.getTime() - d.getTime()) <= 3 * 24 * 60 * 60 * 1000;
        }).length;

        const completedList = tasksInPeriod.filter(t => t.status === TaskStatus.Completed);
        const completedTasks = completedList.length;
        const totalTasks = tasksInPeriod.length;

        const completedGrowth = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const workloadPercentage = Math.min(100, Math.round((activeTasks / Math.max(1, totalTasks || 5)) * 100));

        // Donut Chart: Status distribution
        const inProgressCount = tasksInPeriod.filter(t => t.status === TaskStatus.InProgress || t.status === TaskStatus.Assigned).length;
        const pendingCount = tasksInPeriod.filter(t => t.status === TaskStatus.Pending || t.status === TaskStatus.UnderReview).length;
        const otherCount = tasksInPeriod.filter(t => t.status === TaskStatus.Canceled || t.status === TaskStatus.Expired).length;

        const statusDistribution = [
            {
                name: 'Tamamlandı',
                count: completedTasks,
                value: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                color: '#34D399',
            },
            {
                name: 'İcrada',
                count: inProgressCount,
                value: totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0,
                color: '#FBBF24',
            },
            {
                name: 'Gözləmədə',
                count: pendingCount,
                value: totalTasks > 0 ? Math.round((pendingCount / totalTasks) * 100) : 0,
                color: '#38BDF8',
            },
            {
                name: 'Gecikmiş',
                count: overdueTasks + otherCount,
                value: totalTasks > 0 ? Math.round(((overdueTasks + otherCount) / totalTasks) * 100) : 0,
                color: '#F87171',
            },
        ];

        // Weekly Trends (Monday to Sunday)
        const dayNames = ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Baz'];
        const weeklyTrends = dayNames.map((name, index) => {
            // Day index: Monday = 1, Sunday = 0
            const dayOfWeek = index === 6 ? 0 : index + 1;
            const dayTasks = tasksInPeriod.filter(t => {
                const d = t.deadline ? new Date(t.deadline) : new Date();
                return d.getDay() === dayOfWeek;
            });

            return {
                name,
                Tamamlanan: dayTasks.filter(t => t.status === TaskStatus.Completed).length,
                DavamEdən: dayTasks.filter(t => t.status === TaskStatus.InProgress || t.status === TaskStatus.Assigned).length,
                Ümumi: dayTasks.length,
            };
        });

        // Recent Tasks: sorted by ID or deadline descending
        const recentTasks = [...scopedTasks]
            .sort((a, b) => {
                const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
                const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 10);

        return {
            activeTasks,
            overdueTasks,
            overdueNew,
            completedTasks,
            completedGrowth,
            workloadPercentage,
            totalTasks,
            roleScope,
            scopeName,
            statusDistribution,
            weeklyTrends,
            recentTasks,
        };
    },

    async getRoleTasks(): Promise<TaskResponse[]> {
        const response = await httpClient.get<TaskResponse[]>('/Dashboard/GetRoleTasks').catch(() => null);
        if (response?.data) return response.data;
        return taskService.getAllTasks();
    },

    async getAllTasks(): Promise<TaskResponse[]> {
        return taskService.getAllTasks();
    },
};

export default dashboardService;
