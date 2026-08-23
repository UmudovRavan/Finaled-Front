import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { storage } from '../utils/storage';
import { decodeJwt, isTokenExpired } from '../utils/jwt';
import { authApi } from '../api/authApi';
import { refreshAccessToken } from '../api/client';
import {
  TokenResponse,
  LoginRequest,
  UserInfoDto,
  DecodedJwt
} from '../types/auth.types';
import { useToast } from './ToastContext';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  decodedToken: DecodedJwt | null;
  user: UserInfoDto | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  expiresInSeconds: number;
  progressPercent: number;
  loading: boolean;
  login: (data: LoginRequest) => Promise<TokenResponse>;
  refreshTokens: () => Promise<TokenResponse | null>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  fetchMe: () => Promise<UserInfoDto | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    authChecked: boolean;
  }>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token') || urlParams.get('accessToken');
        const urlRefreshToken = urlParams.get('refreshToken');

        if (urlToken) {
          storage.setTokens(urlToken, urlRefreshToken || undefined);
          urlParams.delete('token');
          urlParams.delete('accessToken');
          urlParams.delete('refreshToken');
          urlParams.delete('tenant');
          urlParams.delete('tenantSlug');
          const newSearch = urlParams.toString();
          const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);

          return {
            accessToken: urlToken,
            refreshToken: urlRefreshToken || storage.getRefreshToken(),
            isAuthenticated: !isTokenExpired(urlToken, 0),
            authChecked: true
          };
        }
      }

      const activeToken = storage.getAccessToken();
      const activeRefresh = storage.getRefreshToken();

      if (activeToken && !isTokenExpired(activeToken, 0)) {
        return {
          accessToken: activeToken,
          refreshToken: activeRefresh,
          isAuthenticated: true,
          authChecked: true
        };
      }

      // If access token is expired but we have a refresh token, defer authChecked to trigger silent refresh
      if (activeToken && isTokenExpired(activeToken, 0) && activeRefresh) {
        return {
          accessToken: activeToken,
          refreshToken: activeRefresh,
          isAuthenticated: false,
          authChecked: false
        };
      }

      if (activeToken && !activeRefresh) {
        storage.clearAuth();
      }

      return {
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        authChecked: true
      };
    } catch {
      return {
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        authChecked: true
      };
    }
  });

  const [user, setUser] = useState<UserInfoDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [expiresInSeconds, setExpiresInSeconds] = useState<number>(0);
  const [initialDuration, setInitialDuration] = useState<number>(900);
  const isRefreshingRef = useRef<boolean>(false);

  const { showToast } = useToast();

  const decodedToken = useMemo(() => {
    return authState.accessToken ? decodeJwt(authState.accessToken) : null;
  }, [authState.accessToken]);

  const isSuperAdmin = useMemo(() => {
    if (!decodedToken?.payload) return false;
    const roles = decodedToken.payload.role || decodedToken.payload.roles;
    if (Array.isArray(roles)) return roles.some(r => String(r).toLowerCase().includes('superadmin'));
    return String(roles || '').toLowerCase().includes('superadmin');
  }, [decodedToken]);

  const isTenantAdmin = useMemo(() => {
    if (!decodedToken?.payload) return false;
    const roles = decodedToken.payload.role || decodedToken.payload.roles;
    if (Array.isArray(roles)) {
      return roles.some(r => String(r).toLowerCase().includes('admin'));
    }
    return String(roles || '').toLowerCase().includes('admin');
  }, [decodedToken]);

  // Handle silent token refresh on initial load if access token is expired but refresh token exists
  useEffect(() => {
    if (!authState.authChecked) {
      refreshAccessToken()
        .then((newAccess) => {
          if (newAccess) {
            setAuthState({
              accessToken: newAccess,
              refreshToken: storage.getRefreshToken(),
              isAuthenticated: true,
              authChecked: true
            });
          } else {
            setAuthState({
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              authChecked: true
            });
          }
        })
        .catch(() => {
          setAuthState({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            authChecked: true
          });
        });
    }
  }, [authState.authChecked]);

  // Refresh token helper
  const refreshTokens = useCallback(async (): Promise<TokenResponse | null> => {
    if (isRefreshingRef.current) return null;
    isRefreshingRef.current = true;
    try {
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        const newRefresh = storage.getRefreshToken() || '';
        setAuthState({
          accessToken: newAccess,
          refreshToken: newRefresh,
          isAuthenticated: true,
          authChecked: true
        });
        return {
          accessToken: newAccess,
          refreshToken: newRefresh,
          expiresIn: 900,
          tokenType: 'Bearer'
        };
      }
      return null;
    } catch (err: any) {
      console.warn('Auto-refresh error:', err.message);
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Sync token countdown timer
  useEffect(() => {
    if (!decodedToken?.payload?.exp) {
      setExpiresInSeconds(0);
      return;
    }

    const exp = decodedToken.payload.exp;
    const iat = decodedToken.payload.iat || (exp - 900);
    const duration = Math.max(exp - iat, 60);
    setInitialDuration(duration);

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, exp - now);
      setExpiresInSeconds(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [decodedToken]);

  // Proactive background auto-refresh: Check every 30 seconds if token expires soon (90s buffer)
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkAndRefreshToken = async () => {
      const token = storage.getAccessToken();
      const refreshTokenVal = storage.getRefreshToken();
      if (!token || !refreshTokenVal) return;

      if (isTokenExpired(token, 90) && !isRefreshingRef.current) {
        try {
          await refreshTokens();
        } catch (err) {
          console.warn('[AuthContext] Background token refresh warning:', err);
        }
      }
    };

    const intervalId = setInterval(checkAndRefreshToken, 30000);
    return () => clearInterval(intervalId);
  }, [authState.isAuthenticated, refreshTokens]);

  const progressPercent = useMemo(() => {
    if (initialDuration <= 0 || expiresInSeconds <= 0) return 0;
    const pct = (expiresInSeconds / initialDuration) * 100;
    return Math.min(100, Math.max(0, pct));
  }, [expiresInSeconds, initialDuration]);

  // Listen to background token events and cross-tab storage changes
  useEffect(() => {
    const handleTokensRefreshed = (e: any) => {
      const tokens = e.detail;
      if (tokens?.accessToken) {
        setAuthState({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || storage.getRefreshToken(),
          isAuthenticated: true,
          authChecked: true
        });
      }
    };

    const handleSessionExpired = () => {
      storage.clearAuth();
      setAuthState({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        authChecked: true
      });
      setUser(null);
      showToast('error', 'Sessiyanın vaxtı bitdi. Zəhmət olmasa yenidən daxil olun.', 'Sessiya Bitdi');
    };

    const syncAuthState = () => {
      const newToken = storage.getAccessToken();
      const newRefresh = storage.getRefreshToken();
      if (newToken && !isTokenExpired(newToken, 0)) {
        setAuthState({
          accessToken: newToken,
          refreshToken: newRefresh,
          isAuthenticated: true,
          authChecked: true
        });
      } else if (!newRefresh) {
        setAuthState({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          authChecked: true
        });
        setUser(null);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'altensor_access_token' ||
        e.key === 'accessToken' ||
        e.key === 'authToken' ||
        e.key === 'token' ||
        e.key === 'refreshToken'
      ) {
        syncAuthState();
      }
    };

    window.addEventListener('auth-tokens-refreshed', handleTokensRefreshed);
    window.addEventListener('auth-token-changed', syncAuthState);
    window.addEventListener('auth-session-expired', handleSessionExpired);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth-tokens-refreshed', handleTokensRefreshed);
      window.removeEventListener('auth-token-changed', syncAuthState);
      window.removeEventListener('auth-session-expired', handleSessionExpired);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [showToast]);

  // Fetch current user info
  const fetchMe = useCallback(async (): Promise<UserInfoDto | null> => {
    if (!storage.getAccessToken()) return null;
    try {
      const info = await authApi.getMe();
      setUser(info);
      return info;
    } catch (err: any) {
      console.warn('Failed to fetch /me:', err.message);
      return null;
    }
  }, []);

  // Login
  const login = useCallback(
    async (data: LoginRequest): Promise<TokenResponse> => {
      setLoading(true);
      try {
        const response = await authApi.login(data);
        storage.setTokens(response.accessToken, response.refreshToken);
        setAuthState({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          authChecked: true
        });
        showToast('success', 'Uğurla daxil oldunuz!', 'Giriş Tamamlandı');
        setTimeout(() => {
          fetchMe();
        }, 100);
        return response;
      } catch (err: any) {
        showToast('error', err.message || 'Giriş zamanı xəta baş verdi', 'Giriş Xətası');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchMe, showToast]
  );

  // Logout
  const logout = useCallback(async () => {
    const rToken = storage.getRefreshToken();
    try {
      await authApi.logout(rToken || undefined);
    } catch {
      // ignore network failure on logout
    } finally {
      storage.clearAuth();
      setAuthState({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        authChecked: true
      });
      setUser(null);
      showToast('info', 'Sistemdən çıxış edildi', 'Çıxış');
    }
  }, [showToast]);

  // Logout all devices
  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
      showToast('success', 'Bütün cihazlardakı aktiv sessiyalar ləğv edildi.', 'Tam Çıxış');
    } catch (err: any) {
      showToast('error', err.message || 'Xəta baş verdi', 'Çıxış Xətası');
    } finally {
      storage.clearAuth();
      setAuthState({
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        authChecked: true
      });
      setUser(null);
    }
  }, [showToast]);

  // Initial load user profile
  useEffect(() => {
    if (authState.accessToken && authState.isAuthenticated) {
      fetchMe();
    }
  }, [authState.accessToken, authState.isAuthenticated, fetchMe]);

  return (
    <AuthContext.Provider
      value={{
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        decodedToken,
        user,
        isAuthenticated: authState.isAuthenticated,
        authChecked: authState.authChecked,
        isSuperAdmin,
        isTenantAdmin,
        expiresInSeconds,
        progressPercent,
        loading,
        login,
        refreshTokens,
        logout,
        logoutAll,
        fetchMe
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

export default AuthContext;
