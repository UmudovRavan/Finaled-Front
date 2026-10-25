import { RoleResponse } from '../types/role.types';
import { apiClient } from '../api/client';

/**
 * Normalizes role names consistently across different server cultures.
 * Handles Turkish/Azerbaijani i/I/İ/ı variations so that roles created
 * with ToUpper() and looked up with ToUpperInvariant() match identically.
 */
export function normalizeRoleKey(name: string): string {
  return (name || '')
    .trim()
    .replace(/[\s\-_]/g, '')
    .replace(/[iIİı]/g, 'i')
    .toLowerCase();
}

/**
 * Deduplicates roles by name.
 * If duplicate copies of a role exist in the backend (e.g. one created originally
 * and one generated automatically by ASP.NET Identity with 0 permissions):
 * - Merges them into a single role for UI display
 * - Retains full permissions from the original role
 * - Stores all associated IDs in `duplicateIds` so updates/deletes hit all copies
 */
export function deduplicateRoles(roles: RoleResponse[]): RoleResponse[] {
  if (!Array.isArray(roles)) return [];

  const map = new Map<string, RoleResponse>();

  for (const role of roles) {
    if (!role || !role.name) continue;
    const key = normalizeRoleKey(role.name);

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...role,
        duplicateIds: [role.id]
      });
    } else {
      const existingPermCount =
        (existing.permissionIds?.length || 0) || (existing.permissions?.length || 0);
      const currentPermCount =
        (role.permissionIds?.length || 0) || (role.permissions?.length || 0);

      const allDuplicateIds = Array.from(
        new Set([...(existing.duplicateIds || [existing.id]), role.id])
      );

      const mergedPermissions = Array.from(
        new Set([...(existing.permissions || []), ...(role.permissions || [])])
      );
      const mergedPermissionIds = Array.from(
        new Set([...(existing.permissionIds || []), ...(role.permissionIds || [])])
      );

      // Choose whichever instance has more permissions as the base
      const base = currentPermCount > existingPermCount ? role : existing;

      map.set(key, {
        ...base,
        isSystemRole: existing.isSystemRole || role.isSystemRole,
        permissions: mergedPermissions,
        permissionIds: mergedPermissionIds,
        duplicateIds: allDuplicateIds
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Auto-detects any 0-permission duplicate roles that were spawned by backend Identity
 * when assigning roles to users, and synchronizes the real permissions from the original
 * role to the duplicate in the backend database.
 */
export async function autoSyncDuplicateRoles(rolesInput?: RoleResponse[]): Promise<boolean> {
  try {
    let roles = rolesInput;
    if (!roles) {
      const raw = await apiClient<RoleResponse[]>('/api/Tenant/roles');
      roles = Array.isArray(raw) ? raw : (raw as any)?.data || [];
    }

    if (!Array.isArray(roles) || roles.length === 0) return false;

    // Group by normalized name
    const groups = new Map<string, RoleResponse[]>();
    for (const r of roles) {
      if (!r || !r.name || r.isSystemRole) continue;
      const key = normalizeRoleKey(r.name);
      const list = groups.get(key) || [];
      list.push(r);
      groups.set(key, list);
    }

    let anySynced = false;

    for (const [, list] of groups) {
      if (list.length > 1) {
        // Find role that has permissions
        const withPerms = list.find(
          (r) => (r.permissionIds?.length || 0) > 0 || (r.permissions?.length || 0) > 0
        );

        if (withPerms && withPerms.permissionIds && withPerms.permissionIds.length > 0) {
          const targetPermIds = withPerms.permissionIds;

          for (const duplicate of list) {
            // If duplicate has 0 permissions, sync the original permissions to it
            const dupCount = (duplicate.permissionIds?.length || 0) || (duplicate.permissions?.length || 0);
            if (duplicate.id !== withPerms.id && dupCount === 0) {
              try {
                await apiClient(`/api/Tenant/roles/${duplicate.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    name: withPerms.name,
                    description: withPerms.description || duplicate.description,
                    permissionIds: targetPermIds
                  })
                });
                anySynced = true;
                console.info(
                  `[roleUtils] Auto-synced permissions to duplicate role "${withPerms.name}" (ID: ${duplicate.id})`
                );
              } catch (err) {
                console.warn(
                  `[roleUtils] Failed to sync permissions to duplicate role ${duplicate.id}:`,
                  err
                );
              }
            }
          }
        }
      }
    }

    return anySynced;
  } catch (err) {
    console.warn('[roleUtils] Error in autoSyncDuplicateRoles:', err);
    return false;
  }
}
