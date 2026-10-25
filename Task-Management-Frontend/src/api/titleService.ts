import httpClient from './httpClient';
import type { CompanyTitleDTO, CreateCompanyTitleDTO, UpdateCompanyTitleDTO } from '../dto';

export function normalizeTitle(raw: any): CompanyTitleDTO {
    if (!raw || typeof raw !== 'object') return raw;
    const id = String(raw.id ?? raw.Id ?? '');
    const name = String(raw.name ?? raw.Name ?? '');
    const description = raw.description ?? raw.Description ?? '';
    const voen = raw.voen ?? raw.Voen ?? '';
    const isActive = Boolean(raw.isActive ?? raw.IsActive ?? true);
    const createdAt = raw.createdAt ?? raw.CreatedAt ?? undefined;
    const totalTasksCount = Number(raw.totalTasksCount ?? raw.TotalTasksCount ?? 0);
    const totalProjectsCount = Number(raw.totalProjectsCount ?? raw.TotalProjectsCount ?? 0);

    return {
        id,
        name,
        description,
        voen,
        isActive,
        createdAt,
        totalTasksCount,
        totalProjectsCount,
    };
}

export const titleService = {
    async getAllTitles(): Promise<CompanyTitleDTO[]> {
        const candidateEndpoints = ['/Title', '/title', '/Title/GetAll'];
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
                    return list.map(normalizeTitle);
                }
            } catch {
                // Try next
            }
        }
        return [];
    },

    async getTitleById(id: string): Promise<CompanyTitleDTO | null> {
        try {
            const response = await httpClient.get<any>(`/Title/${id}`);
            const data = response.data?.data || response.data;
            return data ? normalizeTitle(data) : null;
        } catch {
            return null;
        }
    },

    async createTitle(dto: CreateCompanyTitleDTO): Promise<CompanyTitleDTO> {
        const response = await httpClient.post<any>('/Title', dto);
        const data = response.data?.data || response.data;
        return normalizeTitle(data);
    },

    async updateTitle(id: string, dto: UpdateCompanyTitleDTO): Promise<CompanyTitleDTO> {
        const response = await httpClient.put<any>(`/Title/${id}`, dto);
        const data = response.data?.data || response.data;
        return normalizeTitle(data);
    },

    async deleteTitle(id: string): Promise<boolean> {
        try {
            await httpClient.delete(`/Title/${id}`);
            return true;
        } catch {
            return false;
        }
    },
};

export default titleService;
