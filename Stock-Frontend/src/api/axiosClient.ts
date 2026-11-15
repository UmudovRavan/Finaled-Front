import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from './authService';
import { notifyApiMutationSuccess, notifyApiError } from '../utils/toast';

const baseURL = import.meta.env.VITE_STOCK_API_URL || 'http://194.163.153.252:5056/api';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
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

axiosClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenant = authService.getLastTenantSlug();
    if (tenant) {
      config.headers['X-Tenant-Slug'] = tenant;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    notifyApiMutationSuccess(response.config.method, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      notifyApiError(error);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
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

        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authService.clearTokens();

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    notifyApiError(error, originalRequest.method, originalRequest.url);
    return Promise.reject(error);
  }
);
