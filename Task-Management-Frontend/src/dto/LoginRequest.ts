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

// Backward compatibility alias
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
