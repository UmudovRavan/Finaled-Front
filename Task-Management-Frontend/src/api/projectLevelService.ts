import httpClient from './httpClient';
import { normalizeTask } from './taskService';
import type { ProjectLevelDTO, CreateProjectLevelRequest, UpdateProjectLevelRequest } from '../dto';

export function normalizeProjectLevel(raw: any): ProjectLevelDTO {
    if (!raw || typeof raw !== 'object') return raw;
    const id = raw.id ?? raw.Id ?? raw.levelId ?? raw.LevelId ?? '';
    const name = String(raw.name ?? raw.Name ?? raw.title ?? raw.Title ?? '');
    const description = raw.description ?? raw.Description ?? '';
    const projectId = raw.projectId ?? raw.ProjectId ?? '';
    const projectName = raw.projectName ?? raw.ProjectName ?? raw.project?.name ?? raw.Project?.Name ?? undefined;
    const orderIndex = Number(raw.orderIndex ?? raw.OrderIndex ?? raw.order ?? raw.Order ?? 0);
    const taskCount = Number(raw.taskCount ?? raw.TaskCount ?? raw.tasks?.length ?? 0);
    const completedTaskCount = Number(raw.completedTaskCount ?? raw.CompletedTaskCount ?? 0);

    const rawTasks = raw.tasks || raw.Tasks || [];
    const tasks = Array.isArray(rawTasks) ? rawTasks.map(normalizeTask) : undefined;
    const createdAt = raw.createdAt ?? raw.CreatedAt ?? undefined;
    const updatedAt = raw.updatedAt ?? raw.UpdatedAt ?? undefined;

    return {
        id,
        name,
        description,
        projectId,
        projectName,
        orderIndex,
        taskCount,
        completedTaskCount,
        tasks,
        createdAt,
        updatedAt,
    };
}

export const projectLevelService = {
    async getLevelsByProject(projectId: string | number): Promise<ProjectLevelDTO[]> {
        const projId = String(projectId || '').trim();
        const candidateEndpoints = [
            `/ProjectLevel/project/${projId}`,
            `/ProjectLevel/by-project/${projId}`,
            `/ProjectLevel/ByProject/${projId}`,
            `/ProjectLevel/GetLevelsByProject/${projId}`,
            `/ProjectLevel/GetByProject/${projId}`,
            `/ProjectLevel/GetByProject?projectId=${encodeURIComponent(projId)}`,
            `/ProjectLevel?projectId=${encodeURIComponent(projId)}`,
            `/Project/${projId}/levels`,
            `/ProjectLevel/GetAll`,
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
                } else if (data && Array.isArray(data.levels)) {
                    list = data.levels;
                }

                if (list.length > 0 || Array.isArray(data)) {
                    const normalized = list.map(normalizeProjectLevel);
                    if (ep === '/ProjectLevel/GetAll') {
                        return normalized.filter((l) => String(l.projectId) === projId).sort((a, b) => a.orderIndex - b.orderIndex);
                    }
                    return normalized.sort((a, b) => a.orderIndex - b.orderIndex);
                }
            } catch {
                // Try next
            }
        }
        return [];
    },

    async getLevelById(id: string | number): Promise<ProjectLevelDTO> {
        const lvlId = String(id || '').trim();
        const candidateEndpoints = [
            `/ProjectLevel/GetById/${lvlId}`,
            `/ProjectLevel/GetLevel/${lvlId}`,
            `/ProjectLevel/${lvlId}`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const raw = response.data?.data || response.data?.level || response.data;
                if (raw && typeof raw === 'object') {
                    return normalizeProjectLevel(raw);
                }
            } catch {
                // Try next
            }
        }
        throw new Error(`ProjectLevel with id ${id} not found`);
    },

    async createLevel(data: CreateProjectLevelRequest): Promise<ProjectLevelDTO> {
        const payload = {
            Name: data.name,
            Description: data.description || '',
            ProjectId: data.projectId,
            OrderIndex: data.orderIndex ?? 0,
        };

        const candidateEndpoints = [
            '/ProjectLevel/Create',
            '/ProjectLevel/CreateLevel',
            '/ProjectLevel',
        ];

        let lastErr: any = null;
        for (const ep of candidateEndpoints) {
            try {
                const res = await httpClient.post<any>(ep, payload);
                const raw = res.data?.data
                    || res.data?.level
                    || res.data?.projectLevel
                    || res.data?.ProjectLevel
                    || (typeof res.data === 'object' && res.data?.id ? res.data : null)
                    || res.data;
                return normalizeProjectLevel(raw);
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error('Failed to create level');
    },

    async updateLevel(data: UpdateProjectLevelRequest): Promise<void> {
        const payload = {
            Id: data.id,
            Name: data.name,
            Description: data.description || '',
            ProjectId: data.projectId,
            OrderIndex: data.orderIndex,
        };

        const candidateEndpoints = [
            '/ProjectLevel/Update',
            '/ProjectLevel/UpdateLevel',
            '/ProjectLevel',
        ];

        let lastErr: any = null;
        for (const ep of candidateEndpoints) {
            try {
                await httpClient.put(ep, payload);
                return;
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error('Failed to update level');
    },

    async deleteLevel(id: string | number): Promise<void> {
        const lvlId = String(id || '').trim();
        const candidateEndpoints = [
            `/ProjectLevel/Delete/${lvlId}`,
            `/ProjectLevel/DeleteLevel/${lvlId}`,
            `/ProjectLevel/${lvlId}`,
        ];

        let lastErr: any = null;
        for (const ep of candidateEndpoints) {
            try {
                await httpClient.delete(ep);
                return;
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error('Failed to delete level');
    },

    async reorderLevels(projectId: string | number, levelIds: (string | number)[]): Promise<void> {
        const payload = {
            ProjectId: projectId,
            LevelIds: levelIds,
        };

        const candidateEndpoints = [
            '/ProjectLevel/Reorder',
            '/ProjectLevel/ReorderLevels',
            '/ProjectLevel/Sort',
        ];

        for (const ep of candidateEndpoints) {
            try {
                await httpClient.post(ep, payload);
                return;
            } catch {
                // Try next
            }
        }
    },
};

export default projectLevelService;
