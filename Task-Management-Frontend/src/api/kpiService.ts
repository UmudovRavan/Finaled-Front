import httpClient from './httpClient';
import type {
    DailyKpiDTO,
    EmployeeKpiSummaryDTO,
    SubordinateKpiStatusDTO,
    CreateDailyKpiDTO,
    UpdateDailyKpiDTO,
    KpiLeaderboardItemDTO,
    CompanyKpiAnalyticsDTO,
} from '../dto/KpiResponse';

/**
 * Extracts human-readable error detail from RFC 7807 ProblemDetails or Axios error
 */
export function getKpiErrorMessage(error: any, fallbackMessage: string = 'Xəta baş verdi'): string {
    if (error?.response?.data) {
        const data = error.response.data;
        if (typeof data.detail === 'string' && data.detail.trim()) {
            return data.detail;
        }
        if (typeof data.title === 'string' && data.title.trim()) {
            return data.title;
        }
        if (typeof data.message === 'string' && data.message.trim()) {
            return data.message;
        }
        if (data.errors && typeof data.errors === 'object') {
            const firstKey = Object.keys(data.errors)[0];
            if (firstKey && Array.isArray(data.errors[firstKey]) && data.errors[firstKey].length > 0) {
                return data.errors[firstKey][0];
            }
        }
    }
    if (error?.message && typeof error.message === 'string') {
        return error.message;
    }
    return fallbackMessage;
}

export const kpiService = {
    /**
     * Get current authenticated employee's KPI summary (today, week, month, penalties)
     */
    async getMyKpiSummary(): Promise<EmployeeKpiSummaryDTO> {
        const response = await httpClient.get<EmployeeKpiSummaryDTO>('/Kpi/my-summary');
        return response.data;
    },

    /**
     * Get current authenticated employee's historical daily KPI records
     */
    async getMyKpiHistory(startDate?: string, endDate?: string): Promise<DailyKpiDTO[]> {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await httpClient.get<DailyKpiDTO[]>('/Kpi/my-history', { params });
        return response.data;
    },

    /**
     * Get subordinate evaluation status for Manager (today's evaluations & pending list)
     */
    async getSubordinatesStatus(date?: string): Promise<SubordinateKpiStatusDTO[]> {
        const params: Record<string, string> = {};
        if (date) params.date = date;
        const response = await httpClient.get<SubordinateKpiStatusDTO[]>('/Kpi/subordinates-status', { params });
        return response.data;
    },

    /**
     * Submit daily KPI evaluation by Manager
     */
    async submitDailyKpi(payload: CreateDailyKpiDTO): Promise<DailyKpiDTO> {
        const response = await httpClient.post<DailyKpiDTO>('/Kpi/submit', payload);
        return response.data;
    },

    /**
     * Get Company-wide or Division KPI Analytics (Director / Admin)
     */
    async getAnalytics(year: number, month: number, divisionId?: string): Promise<CompanyKpiAnalyticsDTO> {
        const params: Record<string, string | number> = { year, month };
        if (divisionId && divisionId !== 'all') params.divisionId = divisionId;
        const response = await httpClient.get<CompanyKpiAnalyticsDTO>('/Kpi/analytics', { params });
        return response.data;
    },

    /**
     * Get Monthly KPI Leaderboard (Director / Admin)
     */
    async getKpiLeaderboard(year: number, month: number, divisionId?: string): Promise<KpiLeaderboardItemDTO[]> {
        const params: Record<string, string | number> = { year, month };
        if (divisionId && divisionId !== 'all') params.divisionId = divisionId;
        const response = await httpClient.get<KpiLeaderboardItemDTO[]>('/Kpi/leaderboard', { params });
        return response.data;
    },

    /**
     * Update daily KPI record with required audit reason (Admin only)
     */
    async updateKpi(id: string, payload: UpdateDailyKpiDTO): Promise<DailyKpiDTO> {
        const response = await httpClient.put<DailyKpiDTO>(`/Kpi/${id}`, payload);
        return response.data;
    },

    /**
     * Delete daily KPI record (Admin only)
     */
    async deleteKpi(id: string): Promise<void> {
        await httpClient.delete(`/Kpi/${id}`);
    },
};

export default kpiService;
