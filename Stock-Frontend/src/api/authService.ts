import axios from 'axios';
import authClient from './authClient';
import type { TokenResponse, UserInfo } from '../types';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TENANT_KEY = 'tenantSlug';

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug: string;
}

// Module-level in-flight refresh promise singleton
let activeRefreshPromise: Promise<TokenResponse> | null = null;

export const authService = {
  getAccessToken(): string | null {
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken')
    );
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getLastTenantSlug(): string | null {
    return localStorage.getItem(TENANT_KEY);
  },

  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-token-changed'));
    }
  },

  setLastTenantSlug(slug: string): void {
    localStorage.setItem(TENANT_KEY, slug);
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('currentUser');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-token-changed'));
    }
  },

  /**
   * Authenticate with email, password, and tenantSlug via AltensorAuthService
   */
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await authClient.post<any>('/auth/login', data);
    const raw = response.data?.data || response.data;
    const accessToken = raw?.accessToken || raw?.token;
    const refreshToken = raw?.refreshToken;

    if (accessToken) {
      this.setTokens(accessToken, refreshToken);
      if (data.tenantSlug) {
        this.setLastTenantSlug(data.tenantSlug);
      }
    }

    return {
      accessToken,
      refreshToken,
      tokenType: raw?.tokenType || 'Bearer',
      expiresIn: raw?.expiresIn || 900,
      user: raw?.user,
    };
  },

  /**
   * Refresh access token using stored refresh token (Singleton)
   */
  async refreshToken(): Promise<TokenResponse> {
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    activeRefreshPromise = (async () => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const authBase = import.meta.env.VITE_AUTH_API_URL || 'https://api-info.altensor.com/api';
      const response = await axios.post<any>(
        `${authBase}/auth/refresh`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const raw = response.data?.data || response.data;
      const newAccess = raw?.accessToken || raw?.token;
      const newRefresh = raw?.refreshToken || refreshToken;

      if (!newAccess) {
        throw new Error('Token refresh failed');
      }

      this.setTokens(newAccess, newRefresh);
      return {
        accessToken: newAccess,
        refreshToken: newRefresh,
        tokenType: raw?.tokenType || 'Bearer',
        expiresIn: raw?.expiresIn || 900,
      };
    })().finally(() => {
      activeRefreshPromise = null;
    });

    return activeRefreshPromise;
  },

  /**
   * Get current authenticated user info, permissions, and active modules
   */
  async getMe(): Promise<UserInfo> {
    const response = await authClient.get<any>('/auth/me');
    return response.data?.data || response.data;
  },

  /**
   * Logout from current device
   */
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    try {
      if (refreshToken) {
        await authClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Silently proceed with local cleanup
    } finally {
      this.clearTokens();
    }
  },
};
