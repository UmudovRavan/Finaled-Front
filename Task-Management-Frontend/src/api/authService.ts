import axios from 'axios';
import authClient from './authClient';
import httpClient from './httpClient';
import type {
    LoginRequest,
    TokenResponse,
    UserInfoDto,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthMessageResponse,
    RegisterRequest,
    RegisterResponse,
    UpdateProfileRequest,
    UpdateProfileResponse,
} from '../dto';

// Module-level in-flight refresh promise singleton
let activeRefreshPromise: Promise<TokenResponse> | null = null;

export const authService = {
    /**
     * Authenticate with email, password, and tenantSlug
     */
    async login(data: LoginRequest): Promise<TokenResponse> {
        const response = await authClient.post<TokenResponse>('/auth/login', data);
        if (response.data.accessToken) {
            this.setTokens(response.data.accessToken, response.data.refreshToken);
            if (data.tenantSlug) {
                this.setLastTenantSlug(data.tenantSlug);
            }
        }
        return response.data;
    },

    /**
     * Register a new user/tenant
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await authClient.post<RegisterResponse>('/tenant/register', data);
        return response.data;
    },

    /**
     * Refresh access token using stored refresh token (Token Rotation & Thread-safe Singleton)
     */
    async refreshToken(): Promise<TokenResponse> {
        if (activeRefreshPromise) {
            return activeRefreshPromise;
        }

        activeRefreshPromise = (async () => {
            const refreshToken = this.getRefreshToken();
            const accessToken = this.getAccessToken();

            if (!refreshToken && !accessToken) {
                throw new Error('No refresh token available');
            }

            const candidatePayloads = [
                { refreshToken },
                { token: accessToken, refreshToken },
                { accessToken, refreshToken },
                { RefreshToken: refreshToken },
            ];

            const authBase = import.meta.env.VITE_AUTH_API_URL || 'https://api-info.altensor.com/api';
            const authEndpoints = ['/Auth/RefreshToken', '/Auth/refresh', '/auth/refresh', '/Auth/refresh-token', '/auth/token/refresh'];

            // 1. First attempt: Auth Service endpoints (clean call without expired Bearer token header)
            for (const ep of authEndpoints) {
                for (const payload of candidatePayloads) {
                    try {
                        const response = await axios.post<any>(`${authBase}${ep}`, payload, {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 10000,
                        });

                        const raw = response.data?.data || response.data;
                        const newAccess = raw?.accessToken || raw?.token || raw?.jwtToken || raw?.jwt;
                        const newRefresh = raw?.refreshToken || raw?.refresh_token || refreshToken;

                        if (newAccess) {
                            this.setTokens(newAccess, newRefresh || undefined);
                            return {
                                accessToken: newAccess,
                                refreshToken: newRefresh || '',
                                tokenType: raw?.tokenType || 'Bearer',
                                expiresIn: raw?.expiresIn || 900,
                            };
                        }
                    } catch {
                        // Try next endpoint/payload
                    }
                }
            }

            // 2. Second attempt: TMS local Authorize endpoints
            const tmsBase = import.meta.env.VITE_TMS_API_URL || 'https://api-tms.altensor.com/api';
            const tmsEndpoints = ['/Authorize/RefreshToken', '/Authorize/Refresh', '/Authorize/refresh'];
            for (const ep of tmsEndpoints) {
                for (const payload of candidatePayloads) {
                    try {
                        const response = await axios.post<any>(`${tmsBase}${ep}`, payload, {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 10000,
                        });

                        const raw = response.data?.data || response.data;
                        const newAccess = raw?.accessToken || raw?.token || raw?.jwtToken || raw?.jwt;
                        const newRefresh = raw?.refreshToken || raw?.refresh_token || refreshToken;

                        if (newAccess) {
                            this.setTokens(newAccess, newRefresh || undefined);
                            return {
                                accessToken: newAccess,
                                refreshToken: newRefresh || '',
                                tokenType: raw?.tokenType || 'Bearer',
                                expiresIn: raw?.expiresIn || 900,
                            };
                        }
                    } catch {
                        // Try next endpoint/payload
                    }
                }
            }

            throw new Error('Could not refresh token on any endpoint');
        })().finally(() => {
            activeRefreshPromise = null;
        });

        return activeRefreshPromise;
    },

    /**
     * Get current authenticated user info, permissions, and active modules
     */
    async getMe(): Promise<UserInfoDto> {
        const response = await authClient.get<UserInfoDto>('/auth/me');
        return response.data;
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

    /**
     * Logout from all devices
     */
    async logoutAll(): Promise<void> {
        try {
            await authClient.post('/auth/logout-all');
        } catch {
            // Silently proceed
        } finally {
            this.clearTokens();
        }
    },

    /**
     * Request OTP for password reset
     */
    async forgotPassword(data: ForgotPasswordRequest): Promise<AuthMessageResponse> {
        const response = await authClient.post<AuthMessageResponse>('/auth/forgot-password', data);
        return response.data;
    },

    /**
     * Helper to send reset OTP
     */
    async sendResetOtp(email: string, tenantSlug?: string): Promise<AuthMessageResponse> {
        const slug = tenantSlug || this.getLastTenantSlug() || 'demo-tenant';
        return this.forgotPassword({ email, tenantSlug: slug });
    },

    /**
     * Reset password using OTP
     */
    async resetPassword(data: ResetPasswordRequest): Promise<AuthMessageResponse> {
        const payload = {
            email: data.email,
            tenantSlug: data.tenantSlug || this.getLastTenantSlug() || 'demo-tenant',
            otp: data.otp || data.token || '',
            newPassword: data.newPassword,
        };
        const response = await authClient.post<AuthMessageResponse>('/auth/reset-password', payload);
        return response.data;
    },

    /**
     * Profile Management (TMS local profile endpoints)
     */
    async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
        const response = await httpClient.put<UpdateProfileResponse>('/Authorize/Profile', data);
        return response.data;
    },

    async uploadProfilePicture(fileOrFormData: File | FormData): Promise<{ profilePictureUrl?: string; token?: string }> {
        let formData: FormData;
        if (fileOrFormData instanceof FormData) {
            formData = fileOrFormData;
        } else {
            formData = new FormData();
            formData.append('file', fileOrFormData);
        }
        const response = await httpClient.post<{ profilePictureUrl?: string; token?: string }>('/Authorize/ProfilePicture', formData);
        return response.data;
    },

    async removeProfilePicture(): Promise<{ token?: string } | void> {
        const response = await httpClient.delete<{ token?: string }>('/Authorize/ProfilePicture');
        return response.data;
    },

    // ── Token Storage Helpers ─────────────────────────────────────

    setTokens(accessToken: string, refreshToken?: string): void {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth-token-changed', { detail: { isAuthenticated: true } }));
        }
    },

    setToken(token: string): void {
        this.setTokens(token);
    },

    getAccessToken(): string | null {
        return (
            localStorage.getItem('accessToken') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('token')
        );
    },

    getToken(): string | null {
        return this.getAccessToken();
    },

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    },

    isAuthenticated(): boolean {
        return !!this.getAccessToken();
    },

    clearTokens(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth-token-changed', { detail: { isAuthenticated: false } }));
        }
    },

    clearToken(): void {
        this.clearTokens();
    },

    setLastTenantSlug(slug: string): void {
        localStorage.setItem('lastTenantSlug', slug.trim());
    },

    getLastTenantSlug(): string {
        return localStorage.getItem('lastTenantSlug') || '';
    },
};

export default authService;
