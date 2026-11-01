export interface UserInfo {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  roles?: string[];
  permissions?: string[];
  modules?: string[];
  tenantSlug?: string;
  tenantName?: string;
  avatarUrl?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  user?: UserInfo;
}

