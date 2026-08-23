import httpClient from './httpClient';
import type { WorkGroupResponse, CreateWorkGroupRequest } from '../dto/WorkGroupResponse';

export const workGroupService = {
    async getAllWorkGroups(): Promise<WorkGroupResponse[]> {
        const response = await httpClient.get<WorkGroupResponse[]>('/WorkGroup');
        return response.data;
    },

    async getWorkGroupById(id: string | number): Promise<WorkGroupResponse> {
        const response = await httpClient.get<any>(`/WorkGroup/${id}`);
        return response.data?.data || response.data;
    },

    async createWorkGroup(data: CreateWorkGroupRequest): Promise<WorkGroupResponse> {
        const payload = {
            Name: data.name.trim(),
            LeaderId: data.leaderId || '',
            UserIds: Array.isArray(data.userIds) ? data.userIds : [],
            TaskIds: [],
        };
        const response = await httpClient.post<any>('/WorkGroup', payload);
        return response.data?.data || response.data;
    },

    async addUserToWorkGroup(workGroupId: string | number, userId: string): Promise<void> {
        await httpClient.post(`/WorkGroup/${workGroupId}/AddUser/${encodeURIComponent(userId)}`);
    },

    async removeUserFromWorkGroup(workGroupId: string | number, userId: string): Promise<void> {
        await httpClient.post(`/WorkGroup/${workGroupId}/RemoveUser/${encodeURIComponent(userId)}`);
    },
};

export default workGroupService;
