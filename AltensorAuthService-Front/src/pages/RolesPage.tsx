import React, { useState, useEffect, useCallback, useRef } from 'react';
import { tenantApi } from '../api/tenantApi';
import { permissionsApi } from '../api/permissionsApi';
import { RoleResponse } from '../types/role.types';
import { PermissionResponse } from '../types/permission.types';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import ActionConfirmModal from '../components/common/ActionConfirmModal';

const moduleMap: Record<string, string> = {
  crm: 'CRM Modulu',
  inventory: 'Anbar (Inventory) Modulu',
  hr: 'İnsan Resursları (HR) Modulu',
  accounting: 'Mühasibatlıq (Accounting) Modulu',
  system: 'Sistem (Platform) İcazələri'
};

export const RolesPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'matrix' | 'settings'>('matrix');
  const [moduleSearch, setModuleSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Keep a ref to avoid stale closures in loadData
  const selectedRoleIdRef = useRef<string | null>(null);
  selectedRoleIdRef.current = selectedRole?.id || null;

  // New Custom Role Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRolePermissionIds, setNewRolePermissionIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isPermissionActive = useCallback(
    (p: PermissionResponse) => {
      return selectedPermissionIds.some(
        (idOrCode) =>
          idOrCode.toLowerCase() === p.id.toLowerCase() ||
          (p.code && idOrCode.toLowerCase() === p.code.toLowerCase()) ||
          (p.name && idOrCode.toLowerCase() === p.name.toLowerCase())
      );
    },
    [selectedPermissionIds]
  );

  const loadData = useCallback(async (targetRoleId?: string) => {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([
        tenantApi.getRoles(),
        permissionsApi.getPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permsData);

      const activeId = targetRoleId || selectedRoleIdRef.current;
      if (activeId) {
        const found = rolesData.find((r) => r.id === activeId);
        if (found) {
          setSelectedRole(found);
          const initialIds: string[] = [];
          if (found.permissions && Array.isArray(found.permissions)) {
            found.permissions.forEach((p: any) => {
              if (typeof p === 'string') initialIds.push(p);
              else if (p?.id) initialIds.push(p.id);
              else if (p?.code) initialIds.push(p.code);
            });
          }
          if (found.permissionIds && Array.isArray(found.permissionIds)) {
            found.permissionIds.forEach((id: string) => {
              if (!initialIds.includes(id)) initialIds.push(id);
            });
          }
          setSelectedPermissionIds(initialIds);
          return;
        }
      }

      if (rolesData.length > 0) {
        const first = rolesData[0];
        setSelectedRole(first);
        const initialIds: string[] = [];
        if (first.permissions && Array.isArray(first.permissions)) {
          first.permissions.forEach((p: any) => {
            if (typeof p === 'string') initialIds.push(p);
            else if (p?.id) initialIds.push(p.id);
            else if (p?.code) initialIds.push(p.code);
          });
        }
        if (first.permissionIds && Array.isArray(first.permissionIds)) {
          first.permissionIds.forEach((id: string) => {
            if (!initialIds.includes(id)) initialIds.push(id);
          });
        }
        setSelectedPermissionIds(initialIds);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error loading roles & permissions', 'Error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRoleSelect = (role: RoleResponse) => {
    setSelectedRole(role);
    const initialIds: string[] = [];
    if (role.permissions && Array.isArray(role.permissions)) {
      role.permissions.forEach((p: any) => {
        if (typeof p === 'string') initialIds.push(p);
        else if (p?.id) initialIds.push(p.id);
        else if (p?.code) initialIds.push(p.code);
      });
    }
    if (role.permissionIds && Array.isArray(role.permissionIds)) {
      role.permissionIds.forEach((id: string) => {
        if (!initialIds.includes(id)) initialIds.push(id);
      });
    }
    setSelectedPermissionIds(initialIds);
  };

  const handleTogglePermission = (p: PermissionResponse) => {
    if (selectedRole?.isSystemRole) return;
    const active = isPermissionActive(p);
    if (active) {
      setSelectedPermissionIds(
        selectedPermissionIds.filter(
          (idOrCode) =>
            idOrCode.toLowerCase() !== p.id.toLowerCase() &&
            (!p.code || idOrCode.toLowerCase() !== p.code.toLowerCase()) &&
            (!p.name || idOrCode.toLowerCase() !== p.name.toLowerCase())
        )
      );
    } else {
      setSelectedPermissionIds([...selectedPermissionIds, p.id]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    if (selectedRole.isSystemRole) {
      showToast('warning', 'System roles cannot be modified.', 'Warning');
      return;
    }

    setSaving(true);
    try {
      await tenantApi.updateRole(selectedRole.id, {
        name: selectedRole.name,
        description: selectedRole.description,
        permissionIds: selectedPermissionIds
      });
      showToast('success', t('roles.roleUpdated', {}, 'Rol məlumatları yeniləndi!'), 'Success');
      await loadData(selectedRole.id);
    } catch (err: any) {
      showToast('error', err.message || 'Error updating permissions', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const executeDeleteRole = async () => {
    if (!selectedRole || selectedRole.isSystemRole) return;
    try {
      await tenantApi.deleteRole(selectedRole.id);
      showToast('success', t('roles.roleDeleted', {}, 'Rol silindi.'), 'Success');
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      await loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting role', 'Error');
    }
  };

  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) {
      showToast('warning', t('common.required', {}, 'Rol adını daxil edin'), 'Warning');
      return;
    }
    setCreating(true);
    try {
      const created = await tenantApi.createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim() || undefined,
        permissionIds: newRolePermissionIds
      });
      const roleId =
        (created as any)?.id ||
        (created as any)?.data?.id ||
        (created as any)?.roleId ||
        (created as any)?.data?.roleId;

      showToast('success', t('roles.roleCreated', {}, 'Yeni rol uğurla əlavə edildi!'), 'Success');
      setIsCreateOpen(false);
      setNewRoleName('');
      setNewRoleDescription('');
      setNewRolePermissionIds([]);
      await loadData(roleId);
    } catch (err: any) {
      showToast('error', err.message || 'Error creating role', 'Error');
    } finally {
      setCreating(false);
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, p) => {
    const rawMod = p.moduleCode || p.module || 'system';
    const modName = moduleMap[rawMod.toLowerCase()] || rawMod.toUpperCase();
    if (!acc[modName]) acc[modName] = [];
    acc[modName].push(p);
    return acc;
  }, {} as Record<string, PermissionResponse[]>);

  const filteredModules = Object.keys(groupedPermissions).filter((mod) =>
    mod.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  const totalActiveCount = permissions.filter((p) => isPermissionActive(p)).length;

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-6 pb-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{t('roles.title', {}, 'Roles')}</h2>
          <p className="text-sm text-[#A1A1AA]">
            {t('roles.subtitle', {}, 'Sistem və xüsusi rolların icazələr matrisi üzrə təyin edilməsi.')}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {t('roles.createNew', {}, 'Create Custom Role')}
          </button>
        </div>
      </div>

      {/* Main Grid: Roles List (Left) and Permission Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Roles List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 shadow-lg shadow-black/20 space-y-3">
            <div className="flex justify-between items-center px-1 pb-2 border-b border-[#27272A]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {t('roles.title', {}, 'Rollar')} ({roles.length})
              </span>
              <span className="material-symbols-outlined text-base text-[#71717A]">admin_panel_settings</span>
            </div>

            <div className="space-y-1.5">
              {loading ? (
                <div className="py-8 text-center text-xs text-[#A1A1AA]">
                  <span className="material-symbols-outlined animate-spin text-base mr-1">progress_activity</span>
                  {t('common.loading', {}, 'Rollar yüklənir...')}
                </div>
              ) : (
                roles.map((r) => {
                  const isSelected = selectedRole?.id === r.id;
                  const rolePermCount = r.permissions?.length || r.permissionIds?.length || 0;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRoleSelect(r)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#27272A] border-white/40 text-white shadow-md'
                          : 'bg-[#121214] border-[#27272A]/70 hover:border-[#3F3F46] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs truncate">{r.name}</span>
                          {r.isSystemRole && (
                            <span className="bg-sky-500/15 text-sky-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-sky-500/20 shrink-0">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                          {r.description || 'Custom role'}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-[#71717A] shrink-0">
                        {rolePermCount} {t('roles.permissions', {}, 'icazə')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Content: Selected Role Policy Matrix (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedRole ? (
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg shadow-black/20 flex flex-col">
              {/* Header Info */}
              <div className="p-5 border-b border-[#27272A] bg-[#141416] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">{selectedRole.name}</h3>
                    {selectedRole.isSystemRole ? (
                      <span className="bg-amber-500/15 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                        Read-Only System Role
                      </span>
                    ) : (
                      <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Custom Role (Editable)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    {selectedRole.description || 'Active permissions matrix for this role'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!selectedRole.isSystemRole && (
                    <>
                      <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/15 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title={t('common.delete', {}, 'Rolu sil')}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        {t('common.delete', {}, 'Sil')}
                      </button>
                      <button
                        onClick={handleSavePermissions}
                        disabled={saving}
                        className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <span className="material-symbols-outlined text-[16px]">save</span>
                        {saving ? t('common.loading', {}, 'Yadda saxlanılır...') : t('common.save', {}, 'Dəyişiklikləri Saxla')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs and Filter */}
              <div className="p-4 border-b border-[#27272A] flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#18181B]">
                <div className="flex p-1 bg-[#121214] border border-[#27272A] rounded-xl w-full sm:w-auto">
                  <button
                    onClick={() => setActiveTab('matrix')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeTab === 'matrix' ? 'bg-[#27272A] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {t('roles.permissions', {}, 'Permissions Matrix')} ({totalActiveCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      activeTab === 'settings' ? 'bg-[#27272A] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {t('settings.general', {}, 'Role Scope & Info')}
                  </button>
                </div>

                <div className="relative w-full sm:w-56">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717A] text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder={t('common.search', {}, 'Modul axtar...')}
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#121214] border border-[#27272A] rounded-xl text-xs text-white placeholder-[#71717A] outline-none focus:border-white/40 transition-colors"
                  />
                </div>
              </div>

              {/* Tab Content: Matrix */}
              {activeTab === 'matrix' && (
                <div className="p-5 space-y-6 max-h-[600px] overflow-y-auto">
                  {filteredModules.map((modName) => {
                    const modPerms = groupedPermissions[modName];
                    const activeCount = modPerms.filter((p) => isPermissionActive(p)).length;

                    return (
                      <div key={modName} className="border border-[#27272A] rounded-xl overflow-hidden bg-[#141416]">
                        <div className="p-3 bg-[#18181B] border-b border-[#27272A] flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white uppercase tracking-wider">{modName}</span>
                            <span className="text-[10px] text-[#71717A] font-mono">
                              ({activeCount} / {modPerms.length} {t('common.active', {}, 'aktiv')})
                            </span>
                          </div>
                        </div>

                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {modPerms.map((p) => {
                            const isChecked = isPermissionActive(p);
                            return (
                              <label
                                key={p.id}
                                className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs transition-all ${
                                  selectedRole.isSystemRole
                                    ? 'cursor-not-allowed opacity-90'
                                    : 'cursor-pointer'
                                } ${
                                  isChecked
                                    ? 'bg-white/[0.08] border-white/40 text-white shadow-xs'
                                    : 'bg-[#121214] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={selectedRole.isSystemRole}
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(p)}
                                  className="rounded h-4 w-4 mt-0.5 shrink-0 accent-white"
                                />
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-[#F4F4F5] block truncate">
                                    {p.name}
                                  </span>
                                  {p.code && (
                                    <span className="font-mono text-[10px] text-sky-400 block mt-0.5">
                                      {p.code}
                                    </span>
                                  )}
                                  {p.description && (
                                    <span className="text-[10.5px] text-[#71717A] block leading-snug mt-0.5">
                                      {p.description}
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab Content: Settings */}
              {activeTab === 'settings' && (
                <div className="p-6 space-y-4 text-xs">
                  <div className="p-4 bg-[#121214] border border-[#27272A] rounded-xl space-y-2">
                    <span className="text-[#71717A] block">{t('roles.description', {}, 'Rol Təsviri')}:</span>
                    <p className="text-white font-medium">
                      {selectedRole.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-12 text-center text-[#71717A] text-xs">
              {t('common.none', {}, 'Məlumatlara baxmaq üçün sol tərəfdən bir rol seçin.')}
            </div>
          )}
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('roles.createNew', {}, 'Yeni Xüsusi Rol Yarat')}</h3>
                  <p className="text-xs text-[#71717A]">{t('roles.subtitle', {}, 'Şirkətiniz üçün unikal icazə profili')}</p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#71717A] hover:text-white p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('roles.roleName', {}, 'Rol Adı')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: SalesManager"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full crm-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('roles.description', {}, 'Təsvir (Opsional)')}</label>
                <input
                  type="text"
                  placeholder="Satış komandası rəhbərinin hüquqları..."
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full crm-input text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#27272A]">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-white">{t('roles.permissions', {}, 'İlkin İcazələr')}</label>
                  <span className="text-[10px] text-[#71717A] font-mono">
                    ({newRolePermissionIds.length} / {permissions.length} {t('common.active', {}, 'seçilib')})
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {permissions.map((p) => {
                    const isChecked = newRolePermissionIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer ${
                          isChecked
                            ? 'bg-white/[0.08] border-white/40 text-white font-semibold'
                            : 'border-[#27272A] bg-[#121214] text-[#A1A1AA]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRolePermissionIds([...newRolePermissionIds, p.id]);
                            } else {
                              setNewRolePermissionIds(newRolePermissionIds.filter((id) => id !== p.id));
                            }
                          }}
                          className="rounded h-3.5 w-3.5 mt-0.5 shrink-0 accent-white"
                        />
                        <div className="min-w-0">
                          <span className="text-[11.5px] font-bold block">{p.name}</span>
                          {p.code && <span className="font-mono text-[10px] text-sky-400 block">{p.code}</span>}
                          {p.description && <span className="text-[#71717A] text-[10px] block truncate">{p.description}</span>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold btn-secondary rounded-xl cursor-pointer"
                >
                  {t('common.cancel', {}, 'Ləğv Et')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-semibold btn-primary rounded-xl cursor-pointer"
                >
                  {creating ? t('common.loading', {}, 'Yaradılır...') : t('roles.createNew', {}, 'Rol Yarat')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Role Deletion Modal */}
      <ActionConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDeleteRole}
        title={t('common.delete', {}, 'Xüsusi Rolu Sil')}
        description={t('tenants.deleteWarning', {}, 'Bu xüsusi rolu silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarılmır.')}
        itemHighlight={selectedRole ? selectedRole.name : undefined}
        variant="danger"
        icon="delete_forever"
        confirmText={t('common.delete', {}, 'Rolu Sil')}
        showReasonInput={false}
      />
    </div>
  );
};

export default RolesPage;
