const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'https://api-crm.altensor.com/api';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://api-info.altensor.com/api';
const TASK_MGMT_API_URL = import.meta.env.VITE_TMS_API_URL || 'https://api-tms.altensor.com/api';

const dispatchAuthChange = (isAuthenticated) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth-token-changed', { detail: { isAuthenticated } }));
  }
};

export const getAuthToken = () =>
  localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('authToken');

export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setAuthToken = (accessToken, refreshToken = null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('authToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    dispatchAuthChange(true);
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    dispatchAuthChange(false);
  }
};

export const parseJwt = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
    const name = payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.unique_name || (email ? email.split('@')[0] : 'User');
    
    // Roles
    let rawRoles = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
    if (typeof rawRoles === 'string') rawRoles = [rawRoles];
    else if (!Array.isArray(rawRoles)) rawRoles = [];
    const roles = rawRoles.filter(Boolean);

    // Permissions
    let rawPerms = payload.permissions || payload.permission || [];
    if (typeof rawPerms === 'string') rawPerms = [rawPerms];
    else if (!Array.isArray(rawPerms)) rawPerms = [];
    const permissions = rawPerms.filter(Boolean);

    // Modules (can be 'modules', 'module', single string or array, e.g. 'tms', 'crm')
    let rawModules = payload.modules || payload.module || [];
    if (typeof rawModules === 'string') rawModules = [rawModules];
    else if (!Array.isArray(rawModules)) rawModules = [];
    const modules = rawModules.filter(Boolean).map(m => String(m).trim().toLowerCase());

    return {
      id: payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || payload.userId || payload.id,
      email,
      username: name,
      name,
      roles,
      role: roles[0] || 'User',
      permissions,
      modules,
      tenantId: payload.tenant_id || payload.tenantId,
      tenantSlug: payload.tenant_slug || payload.tenantSlug,
      tenantName: payload.tenant_name || payload.tenantName,
      tenantStatus: payload.tenant_status !== undefined && payload.tenant_status !== null ? String(payload.tenant_status) : undefined,
      avatarUrl: payload.profilePictureUrl || null,
    };
  } catch {
    return null;
  }
};

export const isTokenExpired = (token, bufferSeconds = 60) => {
  try {
    if (!token) return true;
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return Date.now() >= (payload.exp * 1000) - (bufferSeconds * 1000);
  } catch {
    return true;
  }
};

export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    try {
      return JSON.parse(user);
    } catch {}
  }
  const token = getAuthToken();
  return token ? parseJwt(token) : null;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Thread-safe singleton in-flight refresh promise
let activeRefreshPromise = null;

async function executeRefreshToken() {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    const accessToken = getAuthToken();

    if (!refreshToken && !accessToken) {
      throw new Error('No refresh token available');
    }

    const candidatePayloads = [
      { refreshToken },
      { token: accessToken, refreshToken },
      { accessToken, refreshToken },
      { RefreshToken: refreshToken },
    ];

    const authBase = AUTH_API_URL.replace(/\/+$/, '');
    const authEndpoints = [
      '/auth/refresh',
      '/Auth/RefreshToken',
      '/Auth/refresh',
      '/auth/RefreshToken',
      '/api/Auth/refresh',
      '/api/Auth/RefreshToken',
      '/auth/token/refresh'
    ];

    for (const ep of authEndpoints) {
      for (const payload of candidatePayloads) {
        try {
          const endpointUrl = ep.startsWith('/api') && authBase.endsWith('/api')
            ? `${authBase.replace(/\/api$/, '')}${ep}`
            : `${authBase}${ep}`;

          const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            const data = await response.json();
            const raw = data?.data || data;
            const newAccess = raw?.accessToken || raw?.token || raw?.jwtToken || raw?.jwt;
            const newRefresh = raw?.refreshToken || raw?.refresh_token || refreshToken;

            if (newAccess) {
              setAuthToken(newAccess, newRefresh);
              const user = parseJwt(newAccess);
              if (user) setCurrentUser(user);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth-tokens-refreshed', { detail: { accessToken: newAccess, refreshToken: newRefresh } }));
              }
              return {
                accessToken: newAccess,
                refreshToken: newRefresh || '',
                tokenType: raw?.tokenType || 'Bearer',
                expiresIn: raw?.expiresIn || 900,
              };
            }
          }
        } catch {
          // Continue trying next
        }
      }
    }

    setAuthToken(null);
    throw new Error('Could not refresh token on any endpoint');
  })().finally(() => {
    activeRefreshPromise = null;
  });

  return activeRefreshPromise;
}

export async function request(endpoint, method = 'GET', body = null, isRetry = false) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config);

  const isAuthEndpoint =
    cleanEndpoint.toLowerCase().includes('/auth/login') ||
    cleanEndpoint.toLowerCase().includes('/auth/refresh');

  if (response.status === 401 && !isRetry && !isAuthEndpoint) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => {
        return request(endpoint, method, body, true);
      });
    }

    isRefreshing = true;
    try {
      const refreshed = await executeRefreshToken();
      if (refreshed && refreshed.accessToken) {
        processQueue(null, refreshed.accessToken);
        return await request(endpoint, method, body, true);
      } else {
        const authErr = new Error('Session expired');
        processQueue(authErr, null);
        throw authErr;
      }
    } catch (err) {
      processQueue(err, null);
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Xəta baş verdi';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.title || errorText;
    } catch {
      errorMessage = errorText || `Xəta kodu: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
}

export const authApi = {
  login: async (email, password, tenantSlug = 'demo-tenant') => {
    const response = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, tenantSlug }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let msg = 'Giriş uğursuz oldu';
      try {
        const errJson = JSON.parse(errorText);
        msg = errJson.message || errJson.title || errorText;
      } catch {}
      throw new Error(msg);
    }

    const data = await response.json();
    if (data && data.accessToken) {
      setAuthToken(data.accessToken, data.refreshToken);
      const user = parseJwt(data.accessToken);
      if (user) setCurrentUser(user);
    }
    return data;
  },

  refreshToken: async () => {
    return executeRefreshToken();
  },

  getMe: async () => {
    const token = getAuthToken();
    const response = await fetch(`${AUTH_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get user profile');
    return await response.json();
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    const token = getAuthToken();
    try {
      if (refreshToken) {
        await fetch(`${AUTH_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {}
    setAuthToken(null);
  },
};

export const usersApi = {
  getMe: async () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const existing = getCurrentUser() || {};
        const rawModules = data.modules || data.Modules || existing.modules || [];
        const modules = (Array.isArray(rawModules) ? rawModules : [rawModules])
          .filter(Boolean)
          .map((m) => String(m).trim().toLowerCase());

        const updated = {
          ...existing,
          id: data.id || existing.id,
          email: data.email || existing.email,
          name: data.fullName || data.name || existing.name,
          username: data.fullName || data.name || existing.username,
          tenantId: data.tenantId || existing.tenantId,
          tenantSlug: data.tenantSlug || existing.tenantSlug,
          tenantName: data.tenantName || existing.tenantName,
          tenantStatus: data.tenantStatus || existing.tenantStatus,
          roles: data.roles || existing.roles || [],
          permissions: data.permissions || existing.permissions || [],
          modules,
        };
        setCurrentUser(updated);
        return updated;
      }
    } catch (err) {
      console.warn('getMe fetch warning:', err);
    }
    return getCurrentUser();
  },
};
