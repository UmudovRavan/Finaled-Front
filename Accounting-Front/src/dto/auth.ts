export interface LoginRequest {
    email: string;
    password: string;
    tenantSlug: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

export type LoginResponse = TokenResponse;

export interface RefreshRequest {
    refreshToken: string;
}

export interface UserInfoDto {
    id: string;
    email: string;
    fullName?: string | null;
    tenantId: string;
    tenantName: string;
    tenantSlug: string;
    tenantStatus: 'Active' | 'Suspended' | 'Expired' | string;
    roles: string[];
    permissions: string[];
    modules: string[];
}

export interface ForgotPasswordRequest {
    email: string;
    tenantSlug: string;
}

export interface ResetPasswordRequest {
    email: string;
    tenantSlug?: string;
    otp?: string;
    token?: string;
    newPassword: string;
    confirmPassword?: string;
}

export interface AuthMessageResponse {
    message: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    tenantName: string;
    tenantSlug: string;
    fullName?: string;
}

export interface RegisterResponse {
    success: boolean;
    message?: string;
    tenantId?: string;
}

export interface UpdateProfileRequest {
    fullName?: string;
    email?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message?: string;
}
