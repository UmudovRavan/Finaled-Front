import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api';
import { parseJwtToken, isTokenExpired } from '../utils';
import type { UserInfo } from '../utils';
import type { TokenResponse } from '../dto';

interface AuthContextType {
    user: UserInfo | null;
    isAuthenticated: boolean;
    authChecked: boolean;
    roles: string[];
    permissions: string[];
    modules: string[];
    tenantSlug?: string;
    tenantName?: string;
    tenantStatus?: string;
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
            // 1. Read token & refreshToken from URL query string if present (SSO transfer)
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

                // Strip token parameters from URL cleanly
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

            // 2. Validate token (strict check with 0s buffer on initial load)
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

            // If token is expired but we have a refreshToken, keep authChecked false to trigger silent refresh
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
        } catch (error) {
            console.error('Error during auth initialization:', error);
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

    // Listen to storage events across multiple browser tabs and in-app auth-token-changed events
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

    // Proactive background auto-refresh: Check every 30 seconds if token will expire soon (90s buffer)
    useEffect(() => {
        if (!authState.isAuthenticated) return;

        const checkAndRefreshToken = async () => {
            const token = authService.getAccessToken();
            const refreshTokenVal = authService.getRefreshToken();
            if (!token || !refreshTokenVal) return;

            // Proactively refresh if token expires within 90 seconds
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

    const login = useCallback((tokenOrResponse: TokenResponse | string) => {
        const token = typeof tokenOrResponse === 'string' ? tokenOrResponse : tokenOrResponse.accessToken;
        const refreshToken = typeof tokenOrResponse === 'object' ? tokenOrResponse.refreshToken : undefined;

        authService.setTokens(token, refreshToken);
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

    const hasModule = useCallback(
        (moduleCode: string): boolean => {
            if (!authState.user?.modules || !Array.isArray(authState.user.modules) || authState.user.modules.length === 0) return false;
            return authState.user.modules.some((m) => String(m).trim().toLowerCase() === String(moduleCode).trim().toLowerCase());
        },
        [authState.user]
    );

    const hasPermission = useCallback(
        (permissionCode: string): boolean => {
            if (!authState.user?.permissions || !Array.isArray(authState.user.permissions) || authState.user.permissions.length === 0) return false;
            return authState.user.permissions.some((p) => String(p).trim().toLowerCase() === String(permissionCode).trim().toLowerCase());
        },
        [authState.user]
    );

    const hasRole = useCallback(
        (roleName: string): boolean => {
            if (!authState.user?.roles || !Array.isArray(authState.user.roles) || authState.user.roles.length === 0) return false;
            const target = String(roleName).trim().toLowerCase();
            return authState.user.roles.some((r) => {
                const cur = String(r).trim().toLowerCase();
                if (cur === target) return true;
                if (target === 'admin' && cur.includes('admin')) return true;
                if (target === 'manager' && cur.includes('manager')) return true;
                return false;
            });
        },
        [authState.user]
    );

    return (
        <AuthContext.Provider
            value={{
                user: authState.user,
                isAuthenticated: authState.isAuthenticated,
                authChecked: authState.authChecked,
                roles: authState.user?.roles || [],
                permissions: authState.user?.permissions || [],
                modules: authState.user?.modules || [],
                tenantSlug: authState.user?.tenantSlug,
                tenantName: authState.user?.tenantName,
                tenantStatus: authState.user?.tenantStatus,
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

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
