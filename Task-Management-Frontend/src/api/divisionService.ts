import httpClient from './httpClient';
import type { DivisionDTO, CreateDivisionRequest, UpdateDivisionRequest } from '../dto';

export function normalizeDivision(raw: any): DivisionDTO {
    if (!raw || typeof raw !== 'object') return raw;
    const id = raw.id ?? raw.Id ?? raw.divisionId ?? raw.DivisionId ?? '';
    const name = String(raw.name ?? raw.Name ?? raw.title ?? raw.Title ?? '');
    const description = raw.description ?? raw.Description ?? '';
    const managerId = raw.managerId ?? raw.ManagerId ?? raw.headId ?? raw.HeadId ?? null;
    const managerName = raw.managerName ?? raw.ManagerName ?? raw.manager?.userName ?? raw.Manager?.UserName ?? undefined;
    const projectCount = Number(raw.projectCount ?? raw.ProjectCount ?? raw.projects?.length ?? 0);
    const taskCount = Number(raw.taskCount ?? raw.TaskCount ?? 0);
    const completedTaskCount = Number(raw.completedTaskCount ?? raw.CompletedTaskCount ?? 0);
    const createdAt = raw.createdAt ?? raw.CreatedAt ?? raw.createdDate ?? raw.CreatedDate ?? undefined;
    const updatedAt = raw.updatedAt ?? raw.UpdatedAt ?? undefined;

    return {
        id,
        name,
        description,
        managerId,
        managerName,
        projectCount,
        taskCount,
        completedTaskCount,
        createdAt,
        updatedAt,
    };
}

export const divisionService = {
    async getAllDivisions(): Promise<DivisionDTO[]> {
        const candidateEndpoints = [
            '/Division/GetAll',
            '/Division/GetAllDivisions',
            '/Division',
            '/Divisions',
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
                    return list.map(normalizeDivision);
                }
            } catch {
                // Try next endpoint
            }
        }
        return [];
    },

    async getDivisionById(id: string | number): Promise<DivisionDTO> {
        const divId = String(id || '').trim();
        const candidateEndpoints = [
            `/Division/GetById/${divId}`,
            `/Division/GetDivision/${divId}`,
            `/Division/${divId}`,
            `/Division?id=${encodeURIComponent(divId)}`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const raw = response.data?.data || response.data?.division || response.data;
                if (raw && typeof raw === 'object') {
                    return normalizeDivision(raw);
                }
            } catch {
                // Try next
            }
        }
        throw new Error(`Division with id ${id} not found`);
    },

    async createDivision(data: CreateDivisionRequest): Promise<DivisionDTO> {
        const payload = {
            Name: data.name,
            Description: data.description || '',
            ManagerId: data.managerId || null,
        };

        const candidateEndpoints = [
            '/Division/Create',
            '/Division/CreateDivision',
            '/Division',
        ];

        let lastErr: any = null;
        for (const ep of candidateEndpoints) {
            try {
                const res = await httpClient.post<any>(ep, payload);
                const raw = res.data?.data || res.data?.division || res.data;
                return normalizeDivision(raw);
            } catch (err) {
                lastErr = err;
            }
        }
        throw lastErr || new Error('Failed to create division');
    },

    async updateDivision(data: UpdateDivisionRequest): Promise<void> {
        const payload = {
            Id: data.id,
            Name: data.name,
            Description: data.description || '',
            ManagerId: data.managerId || null,
        };

        const candidateEndpoints = [
            '/Division/Update',
            '/Division/UpdateDivision',
            '/Division',
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
        throw lastErr || new Error('Failed to update division');
    },

    async deleteDivision(id: string | number): Promise<void> {
        const divId = String(id || '').trim();
        const candidateEndpoints = [
            `/Division/Delete/${divId}`,
            `/Division/DeleteDivision/${divId}`,
            `/Division/${divId}`,
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
        throw lastErr || new Error('Failed to delete division');
    },

    getDivisions(): Promise<DivisionDTO[]> {
        return this.getAllDivisions();
    },
};

export default divisionService;
