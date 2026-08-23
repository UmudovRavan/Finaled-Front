import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './authService';

const BASE_URL = import.meta.env.VITE_TMS_API_URL || 'https://api-tms.altensor.com/api';

/**
 * Enterprise-grade Axios HTTP Client for TMS API
 */
const httpClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000,
});

// Variables to handle simultaneous 401 refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Request interceptor - Add auth token and handle FormData Content-Type boundary
 */
httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = authService.getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If sending FormData, delete Content-Type so browser sets boundary automatically
        if (config.data instanceof FormData && config.headers) {
            delete config.headers['Content-Type'];
            config.timeout = 60000;
        }

        if (import.meta.env.DEV) {
            console.log(`[HTTP TMS] → ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('[HTTP TMS] Request error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle 401 with Silent Token Refresh & Retry Queue
 */
httpClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Check for 401 Unauthorized and ensure we don't loop indefinitely
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If a refresh is already in progress, queue this request until refresh finishes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return httpClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const tokenData = await authService.refreshToken();
                const newAccessToken = tokenData.accessToken;

                processQueue(null, newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return httpClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                authService.clearTokens();

                // Only redirect if not already on the login page
                if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                    window.location.href = '/login?expired=true';
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default httpClient;
