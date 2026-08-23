import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  getCurrentUser,
  setCurrentUser,
  parseJwt,
  isTokenExpired,
  authApi,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlToken = searchParams.get('token') || searchParams.get('accessToken');
      const urlRefreshToken = searchParams.get('refreshToken');

      if (urlToken) {
        setAuthToken(urlToken, urlRefreshToken);
        const parsed = parseJwt(urlToken);
        if (parsed) {
          setCurrentUser(parsed);
        }

        // Clean all SSO parameters from URL
        searchParams.delete('token');
        searchParams.delete('accessToken');
        searchParams.delete('refreshToken');
        searchParams.delete('tenant');
        searchParams.delete('tenantSlug');
        const newSearch = searchParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
        return urlToken;
      }
    }
    return getAuthToken();
  });

  const [user, setUser] = useState(() => {
    const existing = getCurrentUser();
    if (existing) return existing;
    const currentToken = getAuthToken();
    return currentToken ? parseJwt(currentToken) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const currentToken = getAuthToken();
    return Boolean(currentToken && !isTokenExpired(currentToken));
  });
  const [authChecked, setAuthChecked] = useState(false);

  // Initial load check with silent token refresh if expired
  useEffect(() => {
    const initAuth = async () => {
      const currentToken = getAuthToken();
      const currentRefreshToken = getRefreshToken();

      if (currentToken && !isTokenExpired(currentToken)) {
        const parsedUser = parseJwt(currentToken);
        setToken(currentToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setAuthChecked(true);
      } else if (currentRefreshToken) {
        try {
          const refreshed = await authApi.refreshToken();
          if (refreshed && refreshed.accessToken) {
            setToken(refreshed.accessToken);
            setUser(parseJwt(refreshed.accessToken));
            setIsAuthenticated(true);
          } else {
            setAuthToken(null);
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch {
          setAuthToken(null);
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setAuthChecked(true);
        }
      } else {
        setAuthToken(null);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    };

    initAuth();
  }, []);

  // Multi-tab synchronization via storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === 'authToken' || e.key === 'token') {
        const newToken = getAuthToken();
        if (newToken && !isTokenExpired(newToken)) {
          const parsed = parseJwt(newToken);
          setToken(newToken);
          setUser(parsed);
          setIsAuthenticated(true);
          setAuthChecked(true);
        } else if (!newToken) {
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setAuthChecked(true);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password, tenantSlug = 'demo-tenant') => {
    const data = await authApi.login(email, password, tenantSlug);
    if (data && data.accessToken) {
      setToken(data.accessToken);
      const userObj = parseJwt(data.accessToken);
      setUser(userObj);
      setIsAuthenticated(true);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setAuthToken(null);
      setCurrentUser(null);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const hasModule = (moduleCode) => {
    if (!user?.modules || user.modules.length === 0) return false;
    return user.modules.some((m) => String(m).trim().toLowerCase() === String(moduleCode).trim().toLowerCase());
  };

  const hasPermission = (permissionCode) => {
    if (!user?.permissions || user.permissions.length === 0) return false;
    return user.permissions.some((p) => String(p).trim().toLowerCase() === String(permissionCode).trim().toLowerCase());
  };

  const hasRole = (roleName) => {
    if (!user?.roles || user.roles.length === 0) return false;
    const target = String(roleName).trim().toLowerCase();
    return user.roles.some((r) => {
      const cur = String(r).trim().toLowerCase();
      if (cur === target) return true;
      if (target === 'admin' && cur.includes('admin')) return true;
      return false;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        authChecked,
        login,
        logout,
        setToken,
        setUser,
        hasModule,
        hasPermission,
        hasRole,
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

