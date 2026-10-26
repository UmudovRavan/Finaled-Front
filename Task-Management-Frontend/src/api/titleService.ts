import httpClient from './httpClient';
import type { TitleDTO } from '../dto';

export function normalizeTitle(raw: any): TitleDTO {
    if (!raw || typeof raw !== 'object') return raw;
    const id = String(raw.id ?? raw.Id ?? raw.titleId ?? raw.TitleId ?? '');
    const name = String(raw.name ?? raw.Name ?? raw.title ?? raw.Title ?? '');
    const description = raw.description ?? raw.Description ?? undefined;
    const voen = raw.voen ?? raw.Voen ?? undefined;
    const createdAt = raw.createdAt ?? raw.CreatedAt ?? undefined;

    return {
        id,
        name,
        description,
        voen,
        createdAt,
    };
}

export const titleService = {
    async getAllTitles(): Promise<TitleDTO[]> {
        const candidateEndpoints = [
            '/Title',
            '/Title/GetAll',
            '/Title/GetTitles',
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
                    return list.map(normalizeTitle);
                }
            } catch {
                // Try next candidate
            }
        }
        return [];
    },

    async getTitleById(id: string | number): Promise<TitleDTO> {
        const titleId = String(id || '').trim();
        const candidateEndpoints = [
            `/Title/${titleId}`,
            `/Title/GetById/${titleId}`,
        ];

        for (const ep of candidateEndpoints) {
            try {
                const response = await httpClient.get<any>(ep);
                const raw = response.data?.data || response.data;
                if (raw && typeof raw === 'object') {
                    return normalizeTitle(raw);
                }
            } catch {
                // Try next
            }
        }

        const all = await this.getAllTitles();
        const found = all.find((t) => String(t.id) === titleId);
        if (found) return found;

        throw new Error(`Title with id ${id} not found`);
    },
};

export default titleService;
