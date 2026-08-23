import { storage } from '../utils/storage';
import { HttpLogEntry } from '../types/log.types';

type LogListener = (entry: HttpLogEntry) => void;
const logListeners: Set<LogListener> = new Set();

export const registerLogListener = (listener: LogListener) => {
  logListeners.add(listener);
  return () => logListeners.delete(listener);
};

const notifyLogs = (entry: HttpLogEntry) => {
  logListeners.forEach((listener) => {
    try {
      listener(entry);
    } catch (e) {
      console.error('Error notifying log listener:', e);
    }
  });
};

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipLogs?: boolean;
  _retry?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Queue for handling simultaneous 401 refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
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
let activeRefreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    const currentRefresh = storage.getRefreshToken();
    const currentAccess = storage.getAccessToken();

    if (!currentRefresh && !currentAccess) {
      return null;
    }

    const candidatePayloads = [
      { refreshToken: currentRefresh },
      { token: currentAccess, refreshToken: currentRefresh },
      { accessToken: currentAccess, refreshToken: currentRefresh },
      { RefreshToken: currentRefresh }
    ];

    const baseUrl = storage.getApiUrl().replace(/\/+$/, '');
    const endpoints = [
      '/api/Auth/refresh',
      '/api/Auth/RefreshToken',
      '/Auth/refresh',
      '/Auth/RefreshToken',
      '/auth/refresh',
      '/auth/RefreshToken',
      '/auth/token/refresh'
    ];

    for (const ep of endpoints) {
      for (const payload of candidatePayloads) {
        try {
          const response = await fetch(`${baseUrl}${ep}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const data = await response.json();
            const raw = data?.data || data;
            const newAccess = raw?.accessToken || raw?.token || raw?.jwtToken || raw?.jwt;
            const newRefresh = raw?.refreshToken || raw?.refresh_token || currentRefresh;

            if (newAccess) {
              storage.setTokens(newAccess, newRefresh || undefined);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('auth-tokens-refreshed', {
                    detail: { accessToken: newAccess, refreshToken: newRefresh }
                  })
                );
              }
              return newAccess;
            }
          }
        } catch {
          // Continue trying next candidates
        }
      }
    }

    // Refresh completely failed on all candidates
    storage.clearAuth();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-session-expired'));
    }
    return null;
  })().finally(() => {
    activeRefreshPromise = null;
  });

  return activeRefreshPromise;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = storage.getApiUrl().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (!options.skipAuth) {
    const token = storage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const startTime = performance.now();
  const method = (options.method || 'GET').toUpperCase() as HttpLogEntry['method'];
  let reqBodyParsed: any = undefined;

  if (options.body && typeof options.body === 'string') {
    try {
      reqBodyParsed = JSON.parse(options.body);
    } catch {
      reqBodyParsed = options.body;
    }
  }

  const logId = Math.random().toString(36).substring(2, 9);
  let status = 0;
  let responseData: any = null;
  let errorMsg = '';

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers
    });

    status = response.status;
    const durationMs = Math.round(performance.now() - startTime);

    const isAuthEndpoint =
      cleanEndpoint.toLowerCase().includes('/auth/login') ||
      cleanEndpoint.toLowerCase().includes('/auth/refresh') ||
      cleanEndpoint.toLowerCase().includes('/auth/forgot-password') ||
      cleanEndpoint.toLowerCase().includes('/auth/reset-password') ||
      cleanEndpoint.toLowerCase().includes('/auth/register');

    // Handle 401 Unauthorized with Mutex & Queue Retry
    if (status === 401 && !options.skipAuth && !isAuthEndpoint && !options._retry) {
      if (isRefreshing) {
        // Enqueue request while another refresh is already in progress
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (!newToken) {
              throw new ApiError(401, 'Sessiyanın vaxtı bitdi. Zəhmət olmasa yenidən daxil olun.');
            }
            return apiClient<T>(endpoint, {
              ...options,
              _retry: true,
              headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`
              }
            });
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          processQueue(null, newAccessToken);
          return apiClient<T>(endpoint, {
            ...options,
            _retry: true,
            headers: {
              ...headers,
              Authorization: `Bearer ${newAccessToken}`
            }
          });
        } else {
          const authError = new ApiError(401, 'Sessiyanın vaxtı bitdi. Zəhmət olmasa yenidən daxil olun.');
          processQueue(authError, null);
          throw authError;
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      responseData = text ? { message: text } : null;
    }

    if (!options.skipLogs) {
      notifyLogs({
        id: logId,
        timestamp: new Date().toISOString(),
        method,
        url: cleanEndpoint,
        status,
        durationMs,
        requestHeaders: headers,
        requestBody: reqBodyParsed,
        responseBody: responseData
      });
    }

    if (!response.ok) {
      const message =
        responseData?.message ||
        responseData?.title ||
        responseData?.error ||
        (typeof responseData === 'string' ? responseData : `HTTP Xətası: ${response.status}`);
      throw new ApiError(status, message, responseData);
    }

    return responseData as T;
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    errorMsg = err.message || 'Şəbəkə xətası və ya serverə qoşulmaq mümkün olmadı.';

    if (!options.skipLogs && status === 0) {
      notifyLogs({
        id: logId,
        timestamp: new Date().toISOString(),
        method,
        url: cleanEndpoint,
        status: 0,
        durationMs,
        requestHeaders: headers,
        requestBody: reqBodyParsed,
        error: errorMsg
      });
    }

    if (err instanceof ApiError) {
      throw err;
    }

    throw new ApiError(0, errorMsg);
  }
}
