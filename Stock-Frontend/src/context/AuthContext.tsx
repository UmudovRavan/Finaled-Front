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
  hasPermission: (permissionCode: string) => boolean;
  hasRole: (roleName: string) => boolean;
  login: (tokenOrResponse: TokenResponse | string) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    user: UserInfo | null;
    isAuthenticated: boolean;
    authChecked: boolean;
  }>(() => {
    try {
      // 1. Read token & refreshToken from URL query string if present (SSO transfer from Desktop/Info)
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

      // 2. Strict token validation
      if (activeToken && !isTokenExpired(activeToken, 0)) {
        const parsedUser = parseJwtToken(activeToken);
        if (parsedUser) {
          return {
            user: parsedUser,
            isAuthenticated: true,
            authChecked: true,
          };
        }
      }

      // If access token is expired but refreshToken exists, trigger silent refresh
      if (activeToken && isTokenExpired(activeToken, 0) && authService.getRefreshToken()) {
        return {
          user: parseJwtToken(activeToken),
          isAuthenticated: false,
          authChecked: false,
        };
      }

      if (activeToken) {
        authService.clearTokens();
      }

      return {
        user: null,
        isAuthenticated: false,
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

  // Handle silent token refresh on initial load if access token is expired but refresh token exists
  useEffect(() => {
    if (!authState.authChecked) {
      authService
        .refreshToken()
        .then((tokens) => {
          const parsed = parseJwtToken(tokens.accessToken);
          setAuthState({
            user: parsed,
            isAuthenticated: !!parsed,
            authChecked: true,
          });
        })
        .catch(() => {
          authService.clearTokens();
          setAuthState({
            user: null,
            isAuthenticated: false,
            authChecked: true,
          });
        });
    }
  }, [authState.authChecked]);

  // Listen to storage events across tabs and in-app auth-token-changed events
  useEffect(() => {
    const syncAuthState = () => {
      const newToken = authService.getAccessToken();
      if (newToken && !isTokenExpired(newToken, 0)) {
        const parsed = parseJwtToken(newToken);
        setAuthState({
          user: parsed,
          isAuthenticated: true,
          authChecked: true,
        });
      } else if (!authService.getRefreshToken()) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          authChecked: true,
        });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'authToken' || e.key === 'token') {
        syncAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-token-changed', syncAuthState);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-token-changed', syncAuthState);
    };
  }, []);

  // Proactive background auto-refresh: Check every 30 seconds if token expires within 90s
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkAndRefreshToken = async () => {
      const token = authService.getAccessToken();
      const refreshTokenVal = authService.getRefreshToken();
      if (!token || !refreshTokenVal) return;

      if (isTokenExpired(token, 90)) {
        try {
          const res = await authService.refreshToken();
          const parsed = parseJwtToken(res.accessToken);
          if (parsed) {
            setAuthState({
              user: parsed,
              isAuthenticated: true,
              authChecked: true,
            });
          }
        } catch (err) {
          console.warn('[AuthContext] Background token refresh warning:', err);
        }
      }
    };

    const intervalId = setInterval(checkAndRefreshToken, 30000);
    return () => clearInterval(intervalId);
  }, [authState.isAuthenticated]);

  const roles = authState.user?.roles || [];
  const permissions = authState.user?.permissions || [];
  const modules = authState.user?.modules || [];
  const tenantSlug = authState.user?.tenantSlug || authService.getLastTenantSlug() || undefined;

  const hasModule = useCallback(
    (moduleCode: string): boolean => {
      if (!modules || modules.length === 0) return false;
      const lower = String(moduleCode).trim().toLowerCase();
      return modules.some((m) => String(m).trim().toLowerCase() === lower || String(m).trim().toLowerCase() === 'all');
    },
    [modules]
  );

  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      if (!permissions || permissions.length === 0) return false;
      const lower = String(permissionCode).trim().toLowerCase();
      return permissions.some((p) => String(p).trim().toLowerCase() === lower);
    },
    [permissions]
  );

  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!roles || roles.length === 0) return false;
      const target = String(roleName).trim().toLowerCase();
      return roles.some((r) => {
        const cur = String(r).trim().toLowerCase();
        if (cur === target) return true;
        if (target === 'admin' && cur.includes('admin')) return true;
        if (target === 'manager' && cur.includes('manager')) return true;
        return false;
      });
    },
    [roles]
  );

  const login = useCallback((tokenOrResponse: TokenResponse | string) => {
    const token = typeof tokenOrResponse === 'string' ? tokenOrResponse : tokenOrResponse.accessToken;
    const refreshTokenVal = typeof tokenOrResponse === 'object' ? tokenOrResponse.refreshToken : undefined;
    authService.setTokens(token, refreshTokenVal);
    const parsedUser = parseJwtToken(token);
    if (parsedUser?.tenantSlug) {
      authService.setLastTenantSlug(parsedUser.tenantSlug);
    }
    setAuthState({
      user: parsedUser,
      isAuthenticated: true,
      authChecked: true,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      authService.clearTokens();
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        authChecked: true,
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const data = await authService.refreshToken();
      const parsedUser = parseJwtToken(data.accessToken);
      setAuthState({
        user: parsedUser,
        isAuthenticated: true,
        authChecked: true,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  }, [logout]);

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
        hasPermission,
        hasRole,
        login,
        logout,
        refreshToken,
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
