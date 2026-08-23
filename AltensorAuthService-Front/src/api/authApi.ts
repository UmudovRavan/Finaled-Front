import { apiClient } from './client';
import {
  LoginRequest,
  TokenResponse,
  RefreshRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UserInfoDto
} from '../types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient<TokenResponse>('/api/Auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true
    }),

  refresh: (data: RefreshRequest) =>
    apiClient<TokenResponse>('/api/Auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true
    }),

  getMe: () => apiClient<UserInfoDto>('/api/Auth/me'),

  logout: (refreshToken?: string) =>
    apiClient<{ message: string }>('/api/Auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshToken || '' })
    }),

  logoutAll: () =>
    apiClient<{ message: string }>('/api/Auth/logout-all', {
      method: 'POST'
    }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiClient<{ message: string }>('/api/Auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true
    }),

  resetPassword: (data: ResetPasswordRequest) =>
    apiClient<{ message: string }>('/api/Auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true
    })
};
