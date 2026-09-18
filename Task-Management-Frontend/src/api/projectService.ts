import httpClient from './httpClient';
import type { ProjectDTO, CreateProjectRequest, UpdateProjectRequest } from '../dto';

export function normalizeProject(raw: any): ProjectDTO {
    if (!raw || typeof raw !== 'object') return raw;
    const id = raw.id ?? raw.Id ?? raw.projectId ?? raw.ProjectId ?? '';
    const name = String(raw.name ?? raw.Name ?? raw.title ?? raw.Title ?? '');
    const description = raw.description ?? raw.Description ?? '';
    const divisionId = raw.divisionId ?? raw.DivisionId ?? '';
    const divisionName = raw.divisionName ?? raw.DivisionName ?? raw.division?.name ?? raw.Division?.Name ?? undefined;
    const managerId = raw.managerId ?? raw.ManagerId ?? null;
    const managerName = raw.managerName ?? raw.ManagerName ?? raw.manager?.userName ?? raw.Manager?.UserName ?? undefined;
    const startDate = raw.startDate ?? raw.StartDate ?? undefined;
    const endDate = raw.endDate ?? raw.EndDate ?? undefined;
    const status = Number(raw.status ?? raw.Status ?? 0);
    const levelCount = Number(raw.levelCount ?? raw.LevelCount ?? raw.levels?.length ?? 0);
    const taskCount = Number(raw.taskCount ?? raw.TaskCount ?? 0);
    const completedTaskCount = Number(raw.completedTaskCount ?? raw.CompletedTaskCount ?? 0);
    const createdAt = raw.createdAt ?? raw.CreatedAt ?? undefined;
    const updatedAt = raw.updatedAt ?? raw.UpdatedAt ?? undefined;

    return {
        id,
        name,
        description,
        divisionId,
        divisionName,
        managerId,
        managerName,
        startDate,
        endDate,
        status,
        levelCount,
        taskCount,
        completedTaskCount,
        createdAt,
        updatedAt,
    };
}

export const projectService = {
    async getAllProjects(): Promise<ProjectDTO[]> {
        const candidateEndpoints = [
            '/Project/GetAll',
            '/Project/GetAllProjects',
            '/Project',
            '/Projects',
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
                } else if (data && typeof data === 'object') {
                    const arr = Object.values(data).find((v) => Array.isArray(v));
                    if (arr) list = arr as any[];
                }

                if (list.length > 0 || Array.isArray(data)) {
                    return list.map(normalizeProject);
                }
            } catch {
                // Try next
            }
        }
        return [];
    },

    async getProjectsByDivision(divisionId: string | number): Promise<ProjectDTO[]> {
        const divId = String(divisionId || '').trim();
        const candidateEndpoints = [
            `/Project/GetByDivision/${divId}`,
            `/Project/GetByDivision?divisionId=${encodeURIComponent(divId)}`,
            `/Project?divisionId=${encodeURIComponent(divId)}`,
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
                }

                if (list.length > 0 || Array.isArray(data)) {
                    return list.map(normalizeProject);
                }
            } catch {
                // Try next
            }
        }

        // Fallback: filter from getAllProjects
        try {
            const all = await this.getAllProjects();
            return all.filter((p) => String(p.divisionId) === divId);
        } catch {
            return [];
        }
    },

    async getProjectById(id: string | number): Promise<ProjectDTO> {
        const projId = String(id || '').trim();
        const candidateEndpoints = [
            `/Project/GetById/${projId}`,
            `/Project/GetProject/${projId}`,
            `/Project/${projId}`,
            `/Project?id=${encodeURIComponent(projId)}`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const raw = response.data?.data || response.data?.project || response.data;
                if (raw && typeof raw === 'object') {
                    return normalizeProject(raw);
                }
            } catch {
                // Try next
            }
        }

        // Fallback from getAllProjects
        const all = await this.getAllProjects();
        const found = all.find((p) => String(p.id) === projId);
        if (found) return found;

        throw new Error(`Project with id ${id} not found`);
    },

    async createProject(data: CreateProjectRequest): Promise<ProjectDTO> {
        const payload = {
            Name: data.name,
            Description: data.description || '',
            DivisionId: data.divisionId || null,
            ManagerId: data.managerId || null,
        };

        const candidateEndpoints = [
            '/Project',
            '/Project/Create',
            '/Project/CreateProject',
        ];

        let lastErr: any = null;
        for (const ep of candidateEndpoints) {
            try {
                const res = await httpClient.post<any>(ep, payload);
                const raw = res.data?.data || res.data?.project || res.data;
                return normalizeProject(raw);
            } catch (err: any) {
                lastErr = err;
                if (err?.response?.status === 400 || err?.response?.status === 403 || err?.response?.status === 401) {
                    throw err;
                }
            }
        }
        throw lastErr || new Error('Failed to create project');
    },

    async updateProject(data: UpdateProjectRequest): Promise<void> {
        const projId = String(data.id || '').trim();
        const payload = {
            Name: data.name,
            Description: data.description || '',
            DivisionId: data.divisionId || null,
            ManagerId: data.managerId || null,
        };

        const candidateEndpoints = [
            `/Project/${projId}`,
            `/Project/Update/${projId}`,
            `/Project/Update`,
            '/Project',
        ];

        let lastErr: any = null;
        for (const ep of candidateEndpoints) {
            try {
                await httpClient.put(ep, payload);
                return;
            } catch (err: any) {
                lastErr = err;
                if (err?.response?.status === 400 || err?.response?.status === 403 || err?.response?.status === 401) {
                    throw err;
                }
            }
        }
        throw lastErr || new Error('Failed to update project');
    },

    async deleteProject(id: string | number): Promise<void> {
        const projId = String(id || '').trim();
        const candidateEndpoints = [
            `/Project/${projId}`,
            `/Project/Delete/${projId}`,
            `/Project/DeleteProject/${projId}`,
        ];

        let lastErr: any = null;
        for (const ep of candidateEndpoints) {
            try {
                await httpClient.delete(ep);
                return;
            } catch (err: any) {
                lastErr = err;
                if (err?.response?.status === 400 || err?.response?.status === 403 || err?.response?.status === 401) {
                    throw err;
                }
            }
        }
        throw lastErr || new Error('Failed to delete project');
    },

    getProjects(): Promise<ProjectDTO[]> {
        return this.getAllProjects();
    },
};

export default projectService;
