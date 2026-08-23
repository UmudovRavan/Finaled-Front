const API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'https://api-crm.altensor.com/api';
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'https://api-info.altensor.com/api';
const TASK_MGMT_API_URL = import.meta.env.VITE_TMS_API_URL || 'https://api-tms.altensor.com/api';

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
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }
};

export const parseJwt = (token) => {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
    const name = payload.name || payload.unique_name || (email ? email.split('@')[0] : 'User');
    
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
      id: payload.sub || payload.nameid,
      email,
      username: name,
      name,
      roles,
      role: roles[0] || 'User',
      permissions,
      modules,
      tenantId: payload.tenant_id,
      tenantSlug: payload.tenant_slug,
      tenantName: payload.tenant_name,
      tenantStatus: payload.tenant_status,
      avatarUrl: payload.profilePictureUrl || null,
    };
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    // 10 second buffer for clock skew
    return Date.now() >= (payload.exp * 1000) - 10000;
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

async function request(endpoint, method = 'GET', body = null, isRetry = false) {
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401 && !isRetry) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          return request(endpoint, method, body, true);
        });
      }

      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${AUTH_API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const tokenData = await refreshResponse.json();
          setAuthToken(tokenData.accessToken, tokenData.refreshToken);
          const user = parseJwt(tokenData.accessToken);
          if (user) setCurrentUser(user);

          processQueue(null, tokenData.accessToken);
          return await request(endpoint, method, body, true);
        } else {
          processQueue(new Error('Refresh failed'), null);
          setAuthToken(null);
        }
      } catch (err) {
        processQueue(err, null);
        setAuthToken(null);
      } finally {
        isRefreshing = false;
      }
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
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${AUTH_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error('Failed to refresh token');
    const data = await response.json();
    setAuthToken(data.accessToken, data.refreshToken);
    const user = parseJwt(data.accessToken);
    if (user) setCurrentUser(user);
    return data;
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

export const leadsApi = {
  getAll: () => request('/Leads'),
  getById: (id) => request(`/Leads/${id}`),
  create: (data) => request('/Leads', 'POST', data),
  update: (id, data) => request(`/Leads/${id}`, 'PUT', data),
  delete: (id) => request(`/Leads/${id}`, 'DELETE'),
  convertToDeal: (id, payload = { dealAmount: 0, assignedUserId: null }) => request(`/Leads/${id}/convert-to-deal`, 'POST', payload)
};

export const dealsApi = {
  getAll: () => request('/Deals'),
  getById: (id) => request(`/Deals/${id}`),
  create: (data) => request('/Deals', 'POST', data),
  update: (id, data) => request(`/Deals/${id}`, 'PUT', data),
  updateStage: (id, stage, lostReason = '') => request(`/Deals/${id}/stage?newStatus=${stage}${lostReason ? `&lostReason=${encodeURIComponent(lostReason)}` : ''}`, 'PATCH'),
  delete: (id) => request(`/Deals/${id}`, 'DELETE')
};

export const contactsApi = {
  getAll: () => request('/Contacts'),
  getLookup: () => request('/Contacts/lookup'),
  getById: (id) => request(`/Contacts/${id}`),
  create: (data) => request('/Contacts', 'POST', data),
  update: (id, data) => request(`/Contacts/${id}`, 'PUT', data),
  delete: (id) => request(`/Contacts/${id}`, 'DELETE')
};

export const orgsApi = {
  getAll: () => request('/Organizations'),
  getLookup: () => request('/Organizations/lookup'),
  getById: (id) => request(`/Organizations/${id}`),
  create: (data) => request('/Organizations', 'POST', data),
  update: (id, data) => request(`/Organizations/${id}`, 'PUT', data),
  delete: (id) => request(`/Organizations/${id}`, 'DELETE'),
  getContacts: (id) => request(`/Organizations/${id}/contacts`),
  getDeals: (id) => request(`/Organizations/${id}/deals`)
};

export const notesApi = {
  getAll: () => request('/Notes'),
  getById: (id) => request(`/Notes/${id}`),
  create: (data) => request('/Notes', 'POST', data),
  update: (id, data) => request(`/Notes/${id}`, 'PUT', data),
  delete: (id) => request(`/Notes/${id}`, 'DELETE')
};

export const callLogsApi = {
  getAll: () => request('/CallLogs'),
  getById: (id) => request(`/CallLogs/${id}`),
  create: (data) => request('/CallLogs', 'POST', data),
  delete: (id) => request(`/CallLogs/${id}`, 'DELETE')
};

export const usersApi = {
  getAll: () => request('/Users'),
  getMe: () => request('/Users/me'),
  getById: (id) => request(`/Users/${id}`),
  updateProfile: (id, data) => request(`/Users/${id}/profile`, 'PUT', data),
  uploadAvatar: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/Users/${id}/avatar`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload avatar image');
    return await response.json();
  },
  invite: (emailsOrDto, role) => {
    const payload = typeof emailsOrDto === 'object' ? emailsOrDto : { emails: emailsOrDto, role };
    return request('/Users/invite', 'POST', payload);
  },
  updateRole: (id, roleOrDto) => {
    const payload = typeof roleOrDto === 'object' ? roleOrDto : { role: roleOrDto };
    return request(`/Users/${id}/role`, 'PUT', payload);
  },
  delete: (id) => request(`/Users/${id}`, 'DELETE'),
  getSalesHierarchy: () => request('/Users/sales-hierarchy')
};

export const productsApi = {
  getAll: () => request('/Products'),
  getById: (id) => request(`/Products/${id}`),
  create: (data) => request('/Products', 'POST', data),
  update: (id, data) => request(`/Products/${id}`, 'PUT', data),
  delete: (id) => request(`/Products/${id}`, 'DELETE'),
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/Products/upload-image`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return await response.json();
  }
};

export const dealProductsApi = {
  getByDealId: (dealId) => request(`/DealProducts/deal/${dealId}`),
  add: (data) => request('/DealProducts', 'POST', data),
  delete: (id) => request(`/DealProducts/${id}`, 'DELETE')
};

export const dashboardApi = {
  getStats: () => request('/Dashboard/stats')
};

export const emailTemplatesApi = {
  getAll: () => request('/EmailTemplates'),
  getById: (id) => request(`/EmailTemplates/${id}`),
  create: (data) => request('/EmailTemplates', 'POST', data),
  update: (id, data) => request(`/EmailTemplates/${id}`, 'PUT', data),
  toggleEnabled: (id) => request(`/EmailTemplates/${id}/toggle`, 'PATCH'),
  delete: (id) => request(`/EmailTemplates/${id}`, 'DELETE')
};

export const emailsApi = {
  send: (dto) => request('/Emails/send', 'POST', dto),
  getByLeadId: (leadId) => request(`/Emails/lead/${leadId}`),
  getByDealId: (dealId) => request(`/Emails/deal/${dealId}`)
};

async function taskRequest(endpoint, method = 'GET', body = null) {
  const token = getAuthToken();
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${TASK_MGMT_API_URL}${endpoint}`, config);

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

export const taskManagementApi = {
  getAllTasks: () => taskRequest('/Task/GetAllTask'),
  getAllUsers: () => taskRequest('/Authorize/AllUsers'),
  getTaskById: (id) => taskRequest(`/Task/GetTask/${id}`),
  createTask: (data) => {
    const formData = new FormData();
    formData.append('Title', data.title);
    formData.append('Description', data.description || '');
    formData.append('Difficulty', String(data.difficulty ?? 0));
    formData.append('Status', String(data.status ?? 0));
    if (data.deadline) formData.append('Deadline', data.deadline);
    if (data.createdByUserId) formData.append('CreatedByUserId', data.createdByUserId);
    if (data.assignedToUserId) formData.append('AssignedToUserId', data.assignedToUserId);
    return taskRequest('/Task/CreateTask', 'POST', formData);
  },
  updateTask: (data) => taskRequest('/Task/UpdateTask', 'PUT', data),
  deleteTask: (id) => taskRequest(`/Task/DeleteTask/${id}`, 'DELETE'),
  assignTask: (taskId, userId) => taskRequest(`/Task/AssignTask?taskId=${taskId}&userId=${userId}`, 'POST'),
  addComment: (taskId, comment) => taskRequest(`/Task/AddComment?taskId=${taskId}&comment=${encodeURIComponent(comment)}`, 'POST'),
  getNotifications: () => taskRequest('/Notifications'),
  markNotificationRead: (id) => taskRequest(`/Notifications/${id}/read`, 'POST')
};
