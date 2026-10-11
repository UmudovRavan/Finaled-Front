import httpClient from './httpClient';
import type {
    CompanyHeaderDto,
    CompanyProfileDto,
    UpdateCompanyProfileDto,
    CompanyDefaultAccountsDto,
} from '../dto';

export const companyService = {
    async getCompanyHeader(): Promise<CompanyHeaderDto> {
        const response = await httpClient.get<CompanyHeaderDto>('/company/header');
        return response.data;
    },

    async getCompanyProfile(): Promise<CompanyProfileDto> {
        const response = await httpClient.get<CompanyProfileDto>('/company');
        return response.data;
    },

    async updateCompanyProfile(data: UpdateCompanyProfileDto): Promise<CompanyProfileDto> {
        const response = await httpClient.put<CompanyProfileDto>('/company', data);
        return response.data;
    },

    async getDefaultAccounts(): Promise<CompanyDefaultAccountsDto> {
        const response = await httpClient.get<CompanyDefaultAccountsDto>('/company/default-accounts');
        return response.data;
    },

    async updateDefaultAccounts(data: CompanyDefaultAccountsDto): Promise<CompanyDefaultAccountsDto> {
        const response = await httpClient.put<CompanyDefaultAccountsDto>('/company/default-accounts', data);
        return response.data;
    },
};

export default companyService;
