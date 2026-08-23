import httpClient from './httpClient';
import { authService } from './authService';
import type { UserResponse } from '../dto';

const CRM_API_URL = import.meta.env.VITE_CRM_API_URL || 'https://api-crm.altensor.com/api';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://api-info.altensor.com/api';

const userService = {
    getAllUsers: async (): Promise<UserResponse[]> => {
        // 1. Primary: TMS /Authorize/AllUsers (returns exact TMS AppUser GUIDs)
        try {
            const response = await httpClient.get<any>('/Authorize/AllUsers');
            const rawList = Array.isArray(response.data) ? response.data : (response.data?.data || response.data?.users || []);
            if (Array.isArray(rawList) && rawList.length > 0) {
                return rawList.map((u: any) => ({
                    id: String(u.id || u.Id || u.userId || u.UserId || ''),
                    userName: u.userName || u.UserName || u.name || u.email?.split('@')[0] || 'İstifadəçi',
                    email: u.email || u.Email || '',
                    role: u.role || u.Role || (Array.isArray(u.roles) ? u.roles[0] : '') || 'Employee',
                    profilePictureUrl: u.profilePictureUrl || u.ProfilePictureUrl || undefined,
                }));
            }
        } catch {
            // Fallback to CRM if Authorize is not available for this role
        }

        const token = authService.getAccessToken() || localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 2. Secondary: CRM /Users endpoint
        try {
            const res = await fetch(`${CRM_API_URL}/Users`, { headers });
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data?.data || data?.users || data?.items || []);
                if (Array.isArray(list) && list.length > 0) {
                    return list.map((u: any) => ({
                        id: String(u.id || u.userId || u.Id || ''),
                        userName: u.name || u.userName || u.username || u.email?.split('@')[0] || 'İstifadəçi',
                        email: u.email || '',
                        role: u.role || (Array.isArray(u.roles) ? u.roles[0] : 'Employee'),
                        profilePictureUrl: u.avatarUrl || u.profilePictureUrl || undefined,
                    }));
                }
            }
        } catch (crmError) {
            console.warn('[userService] CRM /Users error:', crmError);
        }

        // 2. Secondary fallback: Auth API /Users or /tenant/users
        try {
            const res = await fetch(`${AUTH_API_URL}/Users`, { headers });
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : (data?.data || data?.users || []);
                if (Array.isArray(list) && list.length > 0) {
                    return list.map((u: any) => ({
                        id: String(u.id || u.userId || u.Id || ''),
                        userName: u.name || u.userName || u.username || u.email?.split('@')[0] || 'İstifadəçi',
                        email: u.email || '',
                        role: u.role || (Array.isArray(u.roles) ? u.roles[0] : 'Employee'),
                        profilePictureUrl: u.avatarUrl || u.profilePictureUrl || undefined,
                    }));
                }
            }
        } catch {
            // ignore
        }

        return [];
    },
};

export default userService;

