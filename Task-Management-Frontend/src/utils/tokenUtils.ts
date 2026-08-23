export interface UserInfo {
    userId: string;
    userName: string;
    email: string;
    roles: string[];
    permissions: string[];
    modules: string[];
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
    tenantStatus?: string;
    profilePictureUrl?: string;
}

export const getProfilePictureUrl = (
    userId?: string,
    profilePictureUrl?: string,
    timestamp?: number
): string | undefined => {
    if (!userId || !profilePictureUrl) return undefined;
    const base = import.meta.env.VITE_TMS_API_URL || 'https://api-tms.altensor.com/api';
    return `${base}/Authorize/ProfilePicture/${userId}${timestamp ? `?t=${timestamp}` : ''}`;
};

const decodeJwtPayload = (token: string): any => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        let base64Url = parts[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        let jsonPayload: string;
        try {
            jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
        } catch {
            jsonPayload = atob(base64);
        }

        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

export const parseJwtToken = (token: string): UserInfo | null => {
    try {
        const payload = decodeJwtPayload(token);
        if (!payload) return null;

        const userId =
            payload.sub ||
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            payload.nameid ||
            payload.userId ||
            payload.UserId ||
            payload.id ||
            payload.Id ||
            payload.uid ||
            '';

        const email =
            payload.email ||
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
            '';

        const userName =
            payload.name ||
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            payload.unique_name ||
            (email ? email.split('@')[0] : '');

        const tenantId = payload.tenant_id || payload.tenantId;
        const tenantSlug = payload.tenant_slug || payload.tenantSlug;
        const tenantName = payload.tenant_name || payload.tenantName;
        const tenantStatus = payload.tenant_status !== undefined && payload.tenant_status !== null ? String(payload.tenant_status) : undefined;

        // Roles claim
        let rawRoles = payload.roles || payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
        if (typeof rawRoles === 'string') rawRoles = [rawRoles];
        else if (!Array.isArray(rawRoles)) rawRoles = [];
        const roles = rawRoles.filter(Boolean);

        // Permissions claim
        let rawPerms = payload.permissions || payload.permission || [];
        if (typeof rawPerms === 'string') rawPerms = [rawPerms];
        else if (!Array.isArray(rawPerms)) rawPerms = [];
        const permissions = rawPerms.filter(Boolean);

        // Modules claim (handles 'tms', 'crm', single string, array, 'modules', 'module')
        let rawModules = payload.modules || payload.module || [];
        if (typeof rawModules === 'string') rawModules = [rawModules];
        else if (!Array.isArray(rawModules)) rawModules = [];
        const modules = rawModules.filter(Boolean).map((m: any) => String(m).trim().toLowerCase());

        const profilePictureUrl = payload.profilePictureUrl || undefined;

        return {
            userId,
            userName,
            email,
            roles,
            permissions,
            modules,
            tenantId,
            tenantSlug,
            tenantName,
            tenantStatus,
            profilePictureUrl,
        };
    } catch {
        return null;
    }
};

export const isTokenExpired = (token: string, bufferSeconds: number = 60): boolean => {
    try {
        const payload = decodeJwtPayload(token);
        if (!payload) return true;
        const exp = payload.exp;
        if (!exp) return false;

        // Buffer to refresh token before it actually expires (default 60s)
        return Date.now() >= (exp * 1000) - (bufferSeconds * 1000);
    } catch {
        return true;
    }
};

export const isUserAdmin = (roles?: string[]): boolean => {
    if (!roles || !roles.length) return false;
    return roles.some((r) => {
        const role = r.toLowerCase().replace(/[^a-z]/g, '');
        return (
            role.includes('admin') ||
            role.includes('superadmin') ||
            role.includes('tenantadmin') ||
            role.includes('platformsuperadmin')
        );
    });
};

export const isUserManager = (roles?: string[]): boolean => {
    if (!roles || !roles.length) return false;
    return roles.some((r) => {
        const role = r.toLowerCase().replace(/[^a-z]/g, '');
        return role.includes('manager');
    });
};

export const hasWorkGroupAccess = (roles?: string[]): boolean => {
    return isUserAdmin(roles) || isUserManager(roles);
};

export const getPrimaryRole = (roles: string[]): string => {
    if (!roles || roles.length === 0) return 'Employee';

    const rolePriority: Record<string, number> = {
        'platformsuperadmin': 110,
        'superadmin': 105,
        'tenantadmin': 100,
        'tenant_admin': 100,
        'admin': 90,
        'manager': 50,
        'employee': 10,
    };

    const sortedRoles = [...roles].sort((a, b) => {
        const keyA = a.toLowerCase().replace(/[^a-z]/g, '');
        const keyB = b.toLowerCase().replace(/[^a-z]/g, '');
        const priorityA = rolePriority[keyA] || (keyA.includes('admin') ? 100 : keyA.includes('manager') ? 50 : 1);
        const priorityB = rolePriority[keyB] || (keyB.includes('admin') ? 100 : keyB.includes('manager') ? 50 : 1);
        return priorityB - priorityA;
    });

    const primaryRole = sortedRoles[0];
    const key = primaryRole.toLowerCase().replace(/[^a-z]/g, '');
    if (key.includes('admin') || key.includes('superadmin')) return 'Admin';
    if (key.includes('manager')) return 'Manager';
    return primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1).toLowerCase();
};


