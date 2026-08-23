export enum TenantStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Terminated = 'Terminated'
}

export enum SubscriptionStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Expired = 'Expired',
  Cancelled = 'Cancelled'
}

export interface TenantResponse {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: string | number | TenantStatus;
  userCount?: number;
  usersCount?: number;
  createdAt: string;
  suspendedAt?: string;
}

export interface TenantModuleSubscriptionDto {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
  status: string | SubscriptionStatus;
  startsAt: string;
  expiresAt?: string;
  suspendedAt?: string;
  suspendReason?: string;
}

export interface TenantDetailResponse extends TenantResponse {
  subscriptions?: TenantModuleSubscriptionDto[];
  modules?: TenantModuleSubscriptionDto[];
  userCount?: number;
  usersCount?: number;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  domain?: string;
  adminEmail: string;
  adminFullName?: string;
  adminPassword: string;
  moduleIds?: string[];
  moduleCodes?: string[];
}

export interface SuspendTenantRequest {
  reason?: string;
}

export interface ModuleSubscriptionRequest {
  moduleId: string;
  expiresAt?: string;
}

export interface SuspendModuleRequest {
  reason?: string;
}

/**
 * Returns strictly one of: 'Active' | 'Suspended' | 'Terminated'
 */
export function getTenantStatusLabel(
  status: string | number | undefined,
  suspendedAt?: string | null
): 'Active' | 'Suspended' | 'Terminated' {
  if (suspendedAt) return 'Suspended';
  if (status === undefined || status === null) return 'Active';
  const s = String(status).toLowerCase();
  if (s === 'suspended' || s === '1') return 'Suspended';
  if (s === 'terminated' || s === '3' || s === 'expired') return 'Terminated';
  // Default to Active (covers 'active', 'trial', '0', '2')
  return 'Active';
}

/**
 * Returns true if tenant is Active
 */
export function isTenantActiveStatus(
  status: string | number | undefined,
  suspendedAt?: string | null
): boolean {
  return getTenantStatusLabel(status, suspendedAt) === 'Active';
}
