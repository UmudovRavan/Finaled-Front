import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'https://api-info.altensor.com/api';

/**
 * Dedicated Axios Client for AltensorAuthService
 */
export const authClient: AxiosInstance = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

authClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const url = config.url || '';
        const isAuthEndpoint =
            url.includes('/login') ||
            url.includes('/Login') ||
            url.includes('/refresh') ||
            url.includes('/RefreshToken') ||
            url.includes('/register') ||
            url.includes('/forgot-password') ||
            url.includes('/reset-password');

        if (!isAuthEndpoint) {
            const token = authService.getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

authClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (!originalRequest) return Promise.reject(error);

        const url = originalRequest.url || '';
        const isAuthEndpoint =
            url.includes('/login') ||
            url.includes('/Login') ||
            url.includes('/refresh') ||
            url.includes('/RefreshToken') ||
            url.includes('/register') ||
            url.includes('/forgot-password') ||
            url.includes('/reset-password');

        // If 401 on authenticated endpoint and not already retried
        if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const tokenData = await authService.refreshToken();
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
                }
                return authClient(originalRequest);
            } catch (refreshError) {
                authService.clearTokens();
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login?expired=true';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default authClient;
