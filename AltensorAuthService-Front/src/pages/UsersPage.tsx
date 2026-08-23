import React, { useState, useEffect, useCallback } from 'react';
import { tenantApi } from '../api/tenantApi';
import { UserResponse } from '../types/user.types';
import { RoleResponse } from '../types/role.types';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/formatters';

export const UsersPage: React.FC = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // New User Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('User@2026!');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        tenantApi.getUsers(),
        tenantApi.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err: any) {
      showToast('error', err.message || 'Error loading users', 'Error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail || !newPassword) {
      showToast('warning', t('common.required', {}, 'Bütün məcburi sahələri doldurun'), 'Warning');
      return;
    }
    setCreating(true);
    try {
      await tenantApi.createUser({
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        roleIds: selectedRoleIds
      });
      showToast('success', t('users.userCreated', {}, 'İstifadəçi uğurla yaradıldı!'), 'Success');
      setIsCreateOpen(false);
      setNewFullName('');
      setNewEmail('');
      setSelectedRoleIds([]);
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Error creating user', 'Error');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (user: UserResponse) => {
    try {
      if (user.isActive) {
        await tenantApi.deactivateUser(user.id);
        showToast('warning', `${user.fullName} deactivated`, 'Warning');
      } else {
        await tenantApi.activateUser(user.id);
        showToast('success', `${user.fullName} activated`, 'Success');
      }
      loadData();
    } catch (err: any) {
      showToast('error', err.message || 'Error changing status', 'Error');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{t('users.title', {}, 'Users')}</h2>
          <p className="text-sm text-[#A1A1AA]">
            {t('users.subtitle', {}, 'Təşkilat daxilindəki istifadəçilər, etimadnamələr və təyin olunmuş rollar.')}
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          {t('users.createNew', {}, 'New User')}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-2.5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md shadow-black/20">
        <div className="text-xs text-[#A1A1AA] px-2 font-medium">
          {t('users.title', {}, 'İstifadəçilər')}: <strong className="text-white">{users.length}</strong>
        </div>

        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-[18px]">
            search
          </span>
          <input
            className="w-full pl-9 pr-3 py-1.5 bg-[#121214] border border-[#27272A] rounded-xl text-xs text-white placeholder-[#71717A] outline-none focus:border-white/40 transition-all"
            placeholder={t('common.searchPlaceholder', {}, 'Ad və ya email ilə axtar...')}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141416] border-b border-[#27272A] text-[11px] text-[#A1A1AA] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">{t('common.user', {}, 'İstifadəçi')}</th>
                <th className="py-3 px-4">{t('auth.email', {}, 'Email')}</th>
                <th className="py-3 px-4">{t('common.status', {}, 'Status')}</th>
                <th className="py-3 px-4">{t('users.assignedRoles', {}, 'Təyin Olunmuş Rollar')}</th>
                <th className="py-3 px-4">{t('common.createdAt', {}, 'Qeydiyyat Tarixi')}</th>
                <th className="py-3 px-4 text-right">{t('common.actions', {}, 'Əməliyyatlar')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#A1A1AA]">
                    <span className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      {t('common.loading', {}, 'İstifadəçilər yüklənir...')}
                    </span>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#A1A1AA]">
                    {t('common.none', {}, 'Axtarışa uyğun heç bir istifadəçi tapılmadı.')}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#27272A] text-white font-bold text-xs flex items-center justify-center border border-[#3F3F46]">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-white text-[13px]">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#A1A1AA] font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {u.isActive ? t('common.active', {}, 'Active') : t('common.inactive', {}, 'Deactivated')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles && u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 bg-white/[0.08] text-white rounded-md font-mono text-[10.5px] font-semibold border border-white/20"
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#71717A] text-[11px]">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#71717A]">{formatDate(u.createdAt)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            u.isActive
                              ? 'text-rose-400 hover:bg-rose-500/15 border border-rose-500/30'
                              : 'text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/30'
                          }`}
                        >
                          {u.isActive ? t('tenants.suspendTenant', {}, 'Deaktiv Et') : t('tenants.activateTenant', {}, 'Aktivləşdir')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-[#141416] border-t border-[#27272A] px-4 py-3 flex items-center justify-between">
          <span className="text-xs text-[#71717A]">
            {t('common.showing', {}, 'Göstərilir')}: {filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(currentPage * pageSize, filteredUsers.length)} / {filteredUsers.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors disabled:opacity-30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-6 h-6 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === p
                    ? 'pagination-active'
                    : 'text-[#A1A1AA] hover:bg-[#27272A] hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors disabled:opacity-30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">person_add</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('users.createNew', {}, 'Yeni İstifadəçi')}</h3>
                  <p className="text-xs text-[#71717A]">{t('users.subtitle', {}, 'İstifadəçi hesabı və rolları təyin edin')}</p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#71717A] hover:text-white p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('users.fullName', {}, 'Ad, Soyad')} *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Cavid Məmmədov"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full crm-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('auth.email', {}, 'Email Ünvanı')} *</label>
                <input
                  type="email"
                  required
                  placeholder="user@altensor.io"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full crm-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('auth.password', {}, 'İlkin Şifrə')} *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full crm-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">{t('users.assignedRoles', {}, 'Təyin Ediləcək Rollar')}</label>
                <div className="max-h-36 overflow-y-auto border border-[#27272A] rounded-xl p-2 space-y-1 bg-[#121214]">
                  {roles.map((r) => {
                    const isChecked = selectedRoleIds.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-start gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white/[0.08] text-white font-bold border border-white/20'
                            : 'text-[#A1A1AA] hover:bg-white/[0.04]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoleIds([...selectedRoleIds, r.id]);
                            } else {
                              setSelectedRoleIds(selectedRoleIds.filter((id) => id !== r.id));
                            }
                          }}
                          className="rounded h-3.5 w-3.5 mt-0.5 shrink-0 accent-white"
                        />
                        <div className="min-w-0">
                          <span className="truncate block">{r.name}</span>
                          {r.isSystemRole && (
                            <span className="text-[9px] bg-[#27272A] text-[#71717A] px-1 rounded font-mono">
                              SYSTEM
                            </span>
                          )}
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
                  className="px-4 py-2 text-xs font-semibold btn-primary rounded-xl cursor-pointer shadow-md"
                >
                  {creating ? t('common.loading', {}, 'Yaradılır...') : t('users.createNew', {}, 'İstifadəçi Yarat')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
