import httpClient from './httpClient';
import { normalizeTask } from './taskService';
import type { EmployeeWorkloadDTO, WorkloadWarningDTO } from '../dto';

export function normalizeWorkload(raw: any): EmployeeWorkloadDTO {
    if (!raw || typeof raw !== 'object') return raw;
    const userId = String(raw.userId ?? raw.UserId ?? raw.id ?? raw.Id ?? '');
    const fullName = raw.fullName ?? raw.FullName ?? undefined;
    const userName = String(raw.userName ?? raw.UserName ?? raw.name ?? raw.Name ?? fullName ?? 'İşçi');
    const userEmail = raw.userEmail ?? raw.UserEmail ?? raw.email ?? raw.Email ?? undefined;
    const avatarUrl = raw.avatarUrl ?? raw.AvatarUrl ?? raw.avatar ?? raw.Avatar ?? undefined;
    const activeTaskCount = Number(raw.activeTaskCount ?? raw.ActiveTaskCount ?? raw.activeTasks ?? raw.ActiveTasks ?? 0);
    const totalTaskCount = Number(raw.totalTaskCount ?? raw.TotalTaskCount ?? raw.totalTasks ?? raw.TotalTasks ?? 0);
    const completedTaskCount = Number(raw.completedTaskCount ?? raw.CompletedTaskCount ?? raw.completedTasks ?? raw.CompletedTasks ?? 0);
    
    const easyTasksCount = Number(raw.easyTasksCount ?? raw.EasyTasksCount ?? raw.easyTaskCount ?? raw.EasyTaskCount ?? 0);
    const mediumTasksCount = Number(raw.mediumTasksCount ?? raw.MediumTasksCount ?? raw.mediumTaskCount ?? raw.MediumTaskCount ?? 0);
    const hardTasksCount = Number(raw.hardTasksCount ?? raw.HardTasksCount ?? raw.hardTaskCount ?? raw.HardTaskCount ?? 0);
    
    const tasksDueToday = Number(raw.tasksDueToday ?? raw.TasksDueToday ?? 0);
    const overdueTasks = Number(raw.overdueTasks ?? raw.OverdueTasks ?? 0);
    const workloadScore = Number(raw.workloadScore ?? raw.WorkloadScore ?? 0);
    const workloadLevel = raw.workloadLevel ?? raw.WorkloadLevel ?? (raw.isOverloaded ? 'Overloaded' : undefined);

    const isOverloaded = Boolean(
        raw.isOverloaded ?? raw.IsOverloaded ?? (workloadLevel === 'Overloaded' || easyTasksCount > 10 || mediumTasksCount > 10 || hardTasksCount > 10 || activeTaskCount > 30)
    );
    const workloadPercentage = Number(
        raw.workloadPercentage ?? raw.WorkloadPercentage ?? Math.min(100, Math.round((activeTaskCount / 30) * 100))
    );
    const hasUrgentTasks = Boolean(raw.hasUrgentTasks ?? raw.HasUrgentTasks ?? false);

    const rawTasks = raw.tasks || raw.Tasks || [];
    const tasks = Array.isArray(rawTasks) ? rawTasks.map(normalizeTask) : undefined;

    return {
        userId,
        userName,
        fullName,
        userEmail,
        email: userEmail,
        avatarUrl,
        activeTaskCount,
        totalTaskCount,
        completedTaskCount,
        hardTaskCount: hardTasksCount,
        mediumTaskCount: mediumTasksCount,
        easyTaskCount: easyTasksCount,
        easyTasksCount,
        mediumTasksCount,
        hardTasksCount,
        tasksDueToday,
        overdueTasks,
        workloadLevel,
        workloadScore,
        workloadPercentage,
        isOverloaded,
        hasUrgentTasks,
        tasks,
    };
}

export const workloadService = {
    async getEmployeeWorkloads(): Promise<EmployeeWorkloadDTO[]> {
        const candidateEndpoints = [
            '/Workload',
            '/Workload/GetEmployeeWorkload',
            '/Workload/GetEmployeeWorkloads',
            '/Workload/GetAll',
            '/Dashboard/GetEmployeeWorkload',
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const data = response.data;
                let list: any[] = [];
                if (Array.isArray(data)) {
                    list = data;
                } else if (data && Array.isArray(data.data)) {
                    list = data.data;
                } else if (data && Array.isArray(data.items)) {
                    list = data.items;
                } else if (data && Array.isArray(data.workloads)) {
                    list = data.workloads;
                }

                if (list.length > 0 || Array.isArray(data)) {
                    return list.map(normalizeWorkload);
                }
            } catch {
                // Try next
            }
        }
        return [];
    },

    async checkUserWorkload(userId: string): Promise<WorkloadWarningDTO> {
        const uId = String(userId || '').trim();
        if (!uId) {
            return {
                isOverloaded: false,
                activeTaskCount: 0,
                isWarning: false,
                warningLevel: 'none',
            };
        }

        const candidateEndpoints = [
            `/Workload/check-assign/${encodeURIComponent(uId)}`,
            `/Workload/CheckUserWorkload?userId=${encodeURIComponent(uId)}`,
            `/Workload/CheckWorkload/${encodeURIComponent(uId)}`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const raw = response.data?.data || response.data;
                if (raw && typeof raw === 'object') {
                    const activeCount = Number(raw.activeTaskCount ?? raw.ActiveTaskCount ?? 0);
                    const easyCount = Number(raw.easyTasksCount ?? raw.EasyTasksCount ?? raw.easyTaskCount ?? 0);
                    const mediumCount = Number(raw.mediumTasksCount ?? raw.MediumTasksCount ?? raw.mediumTaskCount ?? 0);
                    const hardCount = Number(raw.hardTasksCount ?? raw.HardTasksCount ?? raw.hardTaskCount ?? 0);
                    const workloadLevel = raw.workloadLevel ?? raw.WorkloadLevel;
                    const isWarning = Boolean(raw.isWarning ?? raw.IsWarning ?? (workloadLevel === 'Overloaded' || raw.isOverloaded || activeCount > 30));
                    const isOverloaded = Boolean(workloadLevel === 'Overloaded' || raw.isOverloaded || raw.IsOverloaded || isWarning);
                    const warningMessage = raw.warningMessage ?? raw.WarningMessage ?? raw.message ?? raw.Message;

                    return {
                        userId: uId,
                        fullName: raw.fullName ?? raw.FullName,
                        activeTaskCount: activeCount,
                        easyTasksCount: easyCount,
                        mediumTasksCount: mediumCount,
                        hardTasksCount: hardCount,
                        tasksDueToday: Number(raw.tasksDueToday ?? raw.TasksDueToday ?? 0),
                        workloadLevel,
                        isWarning,
                        warningMessage,
                        isOverloaded,
                        maxRecommended: 30,
                        message: warningMessage || (isOverloaded ? 'Bu əməkdaş hal-hazırda həddindən artıq yüklənib!' : undefined),
                        warningLevel: isOverloaded ? 'danger' : isWarning ? 'warning' : 'none',
                    };
                }
            } catch {
                // Try next
            }
        }

        // Fallback: check against all workloads
        try {
            const all = await this.getEmployeeWorkloads();
            const user = all.find((w) => w.userId === uId);
            if (user) {
                return {
                    userId: user.userId,
                    fullName: user.fullName || user.userName,
                    activeTaskCount: user.activeTaskCount,
                    easyTasksCount: user.easyTasksCount,
                    mediumTasksCount: user.mediumTasksCount,
                    hardTasksCount: user.hardTasksCount,
                    tasksDueToday: user.tasksDueToday,
                    workloadLevel: user.workloadLevel,
                    isWarning: user.isOverloaded,
                    warningMessage: user.isOverloaded ? `⚠️ DİQQƏT: Əməkdaş (${user.userName}) hal-hazırda yüklənib! Aktiv tapşırıq: ${user.activeTaskCount}/30.` : undefined,
                    isOverloaded: user.isOverloaded,
                    maxRecommended: 30,
                    message: user.isOverloaded ? `İşçinin üzərində ${user.activeTaskCount} aktiv tapşırıq var!` : undefined,
                    warningLevel: user.isOverloaded ? 'danger' : 'none',
                };
            }
        } catch {
            // ignore
        }

        return {
            isOverloaded: false,
            activeTaskCount: 0,
            isWarning: false,
            maxRecommended: 30,
            warningLevel: 'none',
        };
    },

    async checkWorkloadWarning(userId: string): Promise<WorkloadWarningDTO> {
        return this.checkUserWorkload(userId);
    },
};

export default workloadService;
