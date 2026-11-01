import { jwtDecode } from 'jwt-decode';
import type { UserInfo } from '../types';

export function parseJwtToken(token: string): UserInfo | null {
  try {
    const decoded = jwtDecode<Record<string, any>>(token);
    if (!decoded) return null;

    const email =
      decoded.email ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      '';
    const name =
      decoded.name ||
      decoded.unique_name ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      email.split('@')[0] ||
      'User';

    const rawRoles =
      decoded.role ||
      decoded.roles ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      [];
    const roles: string[] = Array.isArray(rawRoles) ? rawRoles : [rawRoles].filter(Boolean);

    const rawPermissions = decoded.permission || decoded.permissions || [];
    const permissions: string[] = Array.isArray(rawPermissions)
      ? rawPermissions
      : [rawPermissions].filter(Boolean);

    const rawModules = decoded.module || decoded.modules || [];
    const modules: string[] = Array.isArray(rawModules)
      ? rawModules
      : [rawModules].filter(Boolean);

    const tenantSlug = decoded.tenantSlug || decoded.tenant || decoded.tenant_slug || '';
    const tenantName = decoded.tenantName || decoded.tenant_name || '';

    return {
      id: decoded.sub || decoded.nameid || decoded.id,
      email,
      name,
      fullName: name,
      roles,
      permissions,
      modules,
      tenantSlug,
      tenantName,
      avatarUrl: decoded.avatarUrl || null,
    };
  } catch (err) {
    console.error('Error decoding JWT token:', err);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

