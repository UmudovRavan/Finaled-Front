import httpClient from './httpClient';
import { normalizeTask } from './taskService';
import type { EmployeeWorkloadDTO, WorkloadWarningDTO } from '../dto';

export function normalizeWorkload(raw: any): EmployeeWorkloadDTO {
    if (!raw || typeof raw !== 'object') return raw;
    const userId = String(raw.userId ?? raw.UserId ?? raw.id ?? raw.Id ?? '');
    const fullName = String(raw.fullName ?? raw.FullName ?? raw.userName ?? raw.UserName ?? raw.name ?? raw.Name ?? 'İşçi');
    const email = raw.email ?? raw.Email ?? raw.userEmail ?? raw.UserEmail ?? undefined;
    const avatarUrl = raw.avatarUrl ?? raw.AvatarUrl ?? raw.avatar ?? raw.Avatar ?? undefined;

    // Çətinlik kvotaları (Asan, Orta, Çətin - hərəsinə 10 tapşırıq)
    const easyTasksCount = Number(raw.easyTasksCount ?? raw.EasyTasksCount ?? raw.easyTaskCount ?? raw.EasyTaskCount ?? 0);
    const mediumTasksCount = Number(raw.mediumTasksCount ?? raw.MediumTasksCount ?? raw.mediumTaskCount ?? raw.MediumTaskCount ?? 0);
    const hardTasksCount = Number(raw.hardTasksCount ?? raw.HardTasksCount ?? raw.hardTaskCount ?? raw.HardTaskCount ?? 0);

    const activeTaskCount = Number(
        raw.activeTaskCount ?? raw.ActiveTaskCount ?? (easyTasksCount + mediumTasksCount + hardTasksCount)
    );
    const totalTaskCount = Number(raw.totalTaskCount ?? raw.TotalTaskCount ?? activeTaskCount);
    const completedTaskCount = Number(raw.completedTaskCount ?? raw.CompletedTaskCount ?? 0);

    const tasksDueToday = Number(raw.tasksDueToday ?? raw.TasksDueToday ?? 0);
    const overdueTasks = Number(raw.overdueTasks ?? raw.OverdueTasks ?? 0);
    const urgentTasks = Number(raw.urgentTasks ?? raw.UrgentTasks ?? 0);
    const highTasks = Number(raw.highTasks ?? raw.HighTasks ?? 0);

    const workloadLevel = String(raw.workloadLevel ?? raw.WorkloadLevel ?? 'Low');
    const workloadScore = Number(raw.workloadScore ?? raw.WorkloadScore ?? (easyTasksCount * 10 + mediumTasksCount * 20 + hardTasksCount * 30));

    // Kvota 30 tapşırıq üzərindən hesablanır (10 Asan + 10 Orta + 10 Çətin)
    const workloadPercentage = Math.min(100, Math.round((activeTaskCount / 30) * 100));
    const isOverloaded = Boolean(
        raw.isOverloaded ?? raw.IsOverloaded ?? (easyTasksCount > 10 || mediumTasksCount > 10 || hardTasksCount > 10 || activeTaskCount > 30)
    );
    const hasUrgentTasks = Boolean(raw.hasUrgentTasks ?? raw.HasUrgentTasks ?? (urgentTasks > 0));

    const rawTasks = raw.tasks || raw.Tasks || [];
    const tasks = Array.isArray(rawTasks) ? rawTasks.map(normalizeTask) : undefined;

    return {
        userId,
        fullName,
        userName: fullName,
        email,
        userEmail: email,
        avatarUrl,
        activeTaskCount,
        totalTaskCount,
        completedTaskCount,
        easyTasksCount,
        mediumTasksCount,
        hardTasksCount,
        easyTaskCount: easyTasksCount,
        mediumTaskCount: mediumTasksCount,
        hardTaskCount: hardTasksCount,
        tasksDueToday,
        overdueTasks,
        urgentTasks,
        highTasks,
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
            '/Workload/GetAll',
            '/Workload/GetEmployeeWorkload',
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
                maxRecommended: 30,
                warningLevel: 'none',
                isWarning: false,
            };
        }

        const candidateEndpoints = [
            `/Workload/check-assign/${encodeURIComponent(uId)}`,
            `/Workload/CheckAssign/${encodeURIComponent(uId)}`,
            `/Workload/check/${encodeURIComponent(uId)}`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const raw = response.data?.data || response.data;
                if (raw && typeof raw === 'object') {
                    const activeCount = Number(raw.activeTaskCount ?? raw.ActiveTaskCount ?? 0);
                    const isWarning = Boolean(raw.isWarning ?? raw.IsWarning ?? false);
                    const isOverloaded = Boolean(raw.isOverloaded ?? raw.IsOverloaded ?? isWarning);
                    const warningMessage = raw.warningMessage ?? raw.WarningMessage ?? (isWarning ? 'Əməkdaş hal-hazırda həddindən artıq yüklənib!' : undefined);

                    return {
                        userId: raw.userId ?? raw.UserId ?? uId,
                        fullName: raw.fullName ?? raw.FullName,
                        activeTaskCount: activeCount,
                        easyTasksCount: Number(raw.easyTasksCount ?? raw.EasyTasksCount ?? 0),
                        mediumTasksCount: Number(raw.mediumTasksCount ?? raw.MediumTasksCount ?? 0),
                        hardTasksCount: Number(raw.hardTasksCount ?? raw.HardTasksCount ?? 0),
                        tasksDueToday: Number(raw.tasksDueToday ?? raw.TasksDueToday ?? 0),
                        workloadLevel: raw.workloadLevel ?? raw.WorkloadLevel ?? (isOverloaded ? 'Overloaded' : 'Normal'),
                        isWarning,
                        warningMessage,
                        isOverloaded,
                        maxRecommended: 30,
                        message: warningMessage,
                        warningLevel: isOverloaded ? 'danger' : isWarning ? 'warning' : 'none',
                    };
                }
            } catch {
                // Try next
            }
        }

        // Fallback: check against employee workloads list
        try {
            const all = await this.getEmployeeWorkloads();
            const user = all.find((w) => w.userId.toLowerCase() === uId.toLowerCase());
            if (user) {
                const isOverloaded = user.isOverloaded;
                return {
                    userId: user.userId,
                    fullName: user.fullName || user.userName,
                    activeTaskCount: user.activeTaskCount,
                    easyTasksCount: user.easyTasksCount,
                    mediumTasksCount: user.mediumTasksCount,
                    hardTasksCount: user.hardTasksCount,
                    tasksDueToday: user.tasksDueToday,
                    workloadLevel: user.workloadLevel,
                    isWarning: isOverloaded,
                    warningMessage: isOverloaded ? `⚠️ DİQQƏT: Əməkdaş (${user.fullName || user.userName}) üzərində ${user.activeTaskCount} aktiv tapşırıq var və kvota aşılıb.` : undefined,
                    isOverloaded,
                    maxRecommended: 30,
                    message: isOverloaded ? `Əməkdaş üzərində ${user.activeTaskCount} aktiv tapşırıq var!` : undefined,
                    warningLevel: isOverloaded ? 'danger' : 'none',
                };
            }
        } catch {
            // ignore
        }

        return {
            isOverloaded: false,
            activeTaskCount: 0,
            maxRecommended: 30,
            warningLevel: 'none',
            isWarning: false,
        };
    },

    async checkWorkloadWarning(userId: string): Promise<WorkloadWarningDTO> {
        return this.checkUserWorkload(userId);
    },
};

export default workloadService;
