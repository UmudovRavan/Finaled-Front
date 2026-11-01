import axios from 'axios';
import { authService } from './authService';

const baseURL = import.meta.env.VITE_STOCK_API_URL || 'https://api-stock.altensor.com/api';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request in Stock-Frontend.');
    }
    return Promise.reject(error);
  }
);

