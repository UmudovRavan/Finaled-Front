const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TENANT_KEY = 'tenantSlug';

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
  },
};

