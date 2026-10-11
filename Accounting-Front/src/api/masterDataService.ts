import httpClient from './httpClient';
import type {
    MasterDataSummaryDto,
    MasterDataTabItemDto,
    SetInitialBalancesDto,
} from '../dto';

export const masterDataService = {
    async getSummary(): Promise<MasterDataSummaryDto> {
        const response = await httpClient.get<MasterDataSummaryDto>('/master-data/summary');
        return response.data;
    },

    async getTabs(): Promise<MasterDataTabItemDto[]> {
        const response = await httpClient.get<MasterDataTabItemDto[]>('/master-data/tabs');
        return response.data || [];
    },

    async setInitialBalances(data: SetInitialBalancesDto): Promise<{ message: string }> {
        const response = await httpClient.post<{ message: string }>('/master-data/initial-balances', data);
        return response.data;
    },
};

export default masterDataService;
