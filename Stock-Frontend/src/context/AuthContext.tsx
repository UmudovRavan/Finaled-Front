import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api';
import { parseJwtToken, isTokenExpired } from '../utils';
import type { UserInfo, TokenResponse } from '../types';

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  roles: string[];
  permissions: string[];
  modules: string[];
  tenantSlug?: string;
  hasModule: (moduleCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
  login: (tokenOrResponse: TokenResponse | string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    user: UserInfo | null;
    isAuthenticated: boolean;
    authChecked: boolean;
  }>(() => {
    try {
      // 1. Read token & refreshToken from URL query string if present (SSO transfer from Desktop)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token') || urlParams.get('accessToken');
      const urlRefreshToken = urlParams.get('refreshToken');
      const urlTenant = urlParams.get('tenant') || urlParams.get('tenantSlug');

      let activeToken: string | null = null;

      if (urlTenant) {
        authService.setLastTenantSlug(urlTenant);
      }

      if (urlToken) {
        authService.setTokens(urlToken, urlRefreshToken || undefined);
        activeToken = urlToken;

        // Clean params from browser bar
        urlParams.delete('token');
        urlParams.delete('accessToken');
        urlParams.delete('refreshToken');
        urlParams.delete('tenant');
        urlParams.delete('tenantSlug');
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      } else {
        activeToken = authService.getAccessToken();
      }

      if (activeToken) {
        if (!isTokenExpired(activeToken)) {
          const user = parseJwtToken(activeToken);
          return {
            user,
            isAuthenticated: true,
            authChecked: true,
          };
        } else {
          // Token expired
          authService.clearTokens();
        }
      }

      // Fallback for development if needed or unauthenticated state
      return {
        user: {
          name: 'Admin User',
          fullName: 'Admin User',
          email: 'admin@altensor.com',
          roles: ['Admin', 'Manager'],
          modules: ['stock', 'crm', 'tms', 'accounting'],
          tenantSlug: 'default',
        },
        isAuthenticated: true,
        authChecked: true,
      };
    } catch (e) {
      console.warn('Auth initialization notice:', e);
      return {
        user: null,
        isAuthenticated: false,
        authChecked: true,
      };
    }
  });

  const roles = authState.user?.roles || [];
  const permissions = authState.user?.permissions || [];
  const modules = authState.user?.modules || [];
  const tenantSlug = authState.user?.tenantSlug || authService.getLastTenantSlug() || undefined;

  const hasModule = useCallback(
    (moduleCode: string) => {
      const lower = moduleCode.toLowerCase();
      return (
        roles.map((r) => r.toLowerCase()).includes('admin') ||
        roles.map((r) => r.toLowerCase()).includes('superadmin') ||
        modules.some((m) => m.toLowerCase() === lower || m.toLowerCase() === 'all')
      );
    },
    [roles, modules]
  );

  const hasRole = useCallback(
    (roleName: string) => {
      const lower = roleName.toLowerCase();
      return roles.some((r) => r.toLowerCase() === lower || r.toLowerCase() === 'admin');
    },
    [roles]
  );

  const login = (tokenOrResponse: TokenResponse | string) => {
    const token = typeof tokenOrResponse === 'string' ? tokenOrResponse : tokenOrResponse.accessToken;
    const refreshToken = typeof tokenOrResponse === 'object' ? tokenOrResponse.refreshToken : undefined;
    authService.setTokens(token, refreshToken);
    const user = parseJwtToken(token);
    setAuthState({
      user,
      isAuthenticated: true,
      authChecked: true,
    });
  };

  const logout = () => {
    authService.clearTokens();
    setAuthState({
      user: null,
      isAuthenticated: false,
      authChecked: true,
    });
    // Redirect to Desktop or Info portal login
    const infoUrl = import.meta.env.VITE_INFO_WEB_URL || 'http://localhost:5173';
    window.location.href = `${infoUrl}/login`;
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        authChecked: authState.authChecked,
        roles,
        permissions,
        modules,
        tenantSlug,
        hasModule,
        hasRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

