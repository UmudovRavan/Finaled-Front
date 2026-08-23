export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
  tenantSlug: string;
}

export interface ResetPasswordRequest {
  email: string;
  tenantSlug: string;
  otp: string;
  newPassword: string;
}

export interface UserInfoDto {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  tenantStatus: number | string;
  roles: string[];
  permissions: string[];
  activeModules: string[];
}

export interface DecodedJwt {
  header: Record<string, any>;
  payload: {
    sub?: string;
    email?: string;
    name?: string;
    tenant_id?: string;
    tenant_slug?: string;
    role?: string | string[];
    permission?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    iss?: string;
    aud?: string;
    [key: string]: any;
  };
  signature: string;
  raw: string;
}
