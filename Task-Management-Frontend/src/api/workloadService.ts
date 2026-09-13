import httpClient from './httpClient';
import { normalizeTask } from './taskService';
import type { EmployeeWorkloadDTO, WorkloadWarningDTO } from '../dto';

export function normalizeWorkload(raw: any): EmployeeWorkloadDTO {
    if (!raw || typeof raw !== 'object') return raw;
    const userId = String(raw.userId ?? raw.UserId ?? raw.id ?? raw.Id ?? '');
    const userName = String(raw.userName ?? raw.UserName ?? raw.name ?? raw.Name ?? raw.fullName ?? raw.FullName ?? 'İşçi');
    const userEmail = raw.userEmail ?? raw.UserEmail ?? raw.email ?? raw.Email ?? undefined;
    const avatarUrl = raw.avatarUrl ?? raw.AvatarUrl ?? raw.avatar ?? raw.Avatar ?? undefined;
    const activeTaskCount = Number(raw.activeTaskCount ?? raw.ActiveTaskCount ?? raw.activeTasks ?? raw.ActiveTasks ?? 0);
    const totalTaskCount = Number(raw.totalTaskCount ?? raw.TotalTaskCount ?? raw.totalTasks ?? raw.TotalTasks ?? 0);
    const completedTaskCount = Number(raw.completedTaskCount ?? raw.CompletedTaskCount ?? raw.completedTasks ?? raw.CompletedTasks ?? 0);
    const hardTaskCount = Number(raw.hardTaskCount ?? raw.HardTaskCount ?? 0);
    const mediumTaskCount = Number(raw.mediumTaskCount ?? raw.MediumTaskCount ?? 0);
    const easyTaskCount = Number(raw.easyTaskCount ?? raw.EasyTaskCount ?? 0);
    const workloadPercentage = Number(raw.workloadPercentage ?? raw.WorkloadPercentage ?? Math.min(100, Math.round((activeTaskCount / 5) * 100)));
    const isOverloaded = Boolean(raw.isOverloaded ?? raw.IsOverloaded ?? activeTaskCount >= 5);
    const hasUrgentTasks = Boolean(raw.hasUrgentTasks ?? raw.HasUrgentTasks ?? false);

    const rawTasks = raw.tasks || raw.Tasks || [];
    const tasks = Array.isArray(rawTasks) ? rawTasks.map(normalizeTask) : undefined;

    return {
        userId,
        userName,
        userEmail,
        avatarUrl,
        activeTaskCount,
        totalTaskCount,
        completedTaskCount,
        hardTaskCount,
        mediumTaskCount,
        easyTaskCount,
        workloadPercentage,
        isOverloaded,
        hasUrgentTasks,
        tasks,
    };
}

export const workloadService = {
    async getEmployeeWorkloads(): Promise<EmployeeWorkloadDTO[]> {
        const candidateEndpoints = [
            '/Workload/GetEmployeeWorkload',
            '/Workload/GetEmployeeWorkloads',
            '/Workload/GetAll',
            '/Workload',
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
        const candidateEndpoints = [
            `/Workload/CheckUserWorkload?userId=${encodeURIComponent(uId)}`,
            `/Workload/CheckWorkload/${uId}`,
            `/Workload/Check?userId=${encodeURIComponent(uId)}`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const raw = response.data?.data || response.data;
                if (raw && typeof raw === 'object') {
                    const activeCount = Number(raw.activeTaskCount ?? raw.ActiveTaskCount ?? 0);
                    const isOverloaded = Boolean(raw.isOverloaded ?? raw.IsOverloaded ?? activeCount >= 5);
                    return {
                        isOverloaded,
                        activeTaskCount: activeCount,
                        maxRecommended: raw.maxRecommended ?? 5,
                        message: raw.message ?? (isOverloaded ? 'Bu istifadəçinin üzərində həddindən artıq aktiv tapşırıq var!' : undefined),
                        warningLevel: isOverloaded ? 'danger' : activeCount >= 4 ? 'warning' : 'none',
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
                    isOverloaded: user.isOverloaded,
                    activeTaskCount: user.activeTaskCount,
                    maxRecommended: 5,
                    message: user.isOverloaded ? `İşçinin üzərində ${user.activeTaskCount} aktiv tapşırıq var (Maks: 5)!` : undefined,
                    warningLevel: user.isOverloaded ? 'danger' : user.activeTaskCount >= 4 ? 'warning' : 'none',
                };
            }
        } catch {
            // ignore
        }

        return {
            isOverloaded: false,
            activeTaskCount: 0,
            maxRecommended: 5,
            warningLevel: 'none',
        };
    },
};

export default workloadService;
