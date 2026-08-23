const ACCESS_TOKEN_KEY = 'altensor_access_token';
const REFRESH_TOKEN_KEY = 'altensor_refresh_token';
const API_URL_KEY = 'altensor_api_url';
export const DEFAULT_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://api-info.altensor.com';

const dispatchAuthChange = (isAuthenticated: boolean) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-token-changed', { detail: { isAuthenticated } }));
  }
};

export const storage = {
  getAccessToken: (): string | null =>
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token'),

  setAccessToken: (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
    dispatchAuthChange(true);
  },

  removeAccessToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    dispatchAuthChange(false);
  },

  getRefreshToken: (): string | null =>
    localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('refreshToken'),

  setRefreshToken: (token: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    localStorage.setItem('refreshToken', token);
  },

  removeRefreshToken: () => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('refreshToken');
  },

  setTokens: (accessToken: string, refreshToken?: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    dispatchAuthChange(true);
  },

  getApiUrl: (): string => {
    const saved = localStorage.getItem(API_URL_KEY);
    if (!saved || saved.includes('localhost') || saved.includes('127.0.0.1') || saved.includes('31.57.77.199') || saved.includes(':8085')) {
      localStorage.setItem(API_URL_KEY, DEFAULT_API_URL);
      return DEFAULT_API_URL;
    }
    return saved.replace(/\/+$/, '');
  },

  setApiUrl: (url: string) => localStorage.setItem(API_URL_KEY, url.trim().replace(/\/+$/, '')),

  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    dispatchAuthChange(false);
  }
};
