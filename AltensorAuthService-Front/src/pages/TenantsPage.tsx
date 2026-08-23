import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformApi } from '../api/platformApi';
import { permissionsApi } from '../api/permissionsApi';
import {
  TenantResponse,
  TenantStatus,
  isTenantActiveStatus,
  getTenantStatusLabel
} from '../types/tenant.types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/formatters';
import ActionConfirmModal, { ActionModalVariant } from '../components/common/ActionConfirmModal';

export const TenantsPage: React.FC = () => {
  const { isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [availableModules, setAvailableModules] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // New Tenant Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantDomain, setTenantDomain] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('Admin@2026!');
  const [selectedModules, setSelectedModules] = useState<string[]>(['CRM', 'INVENTORY']);
  const [creatingTenant, setCreatingTenant] = useState(false);

  // Actions Dropdown state
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Modern Action Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    tenant: TenantResponse | null;
    title: string;
    description: string;
    variant: ActionModalVariant;
    icon: string;
    confirmText: string;
    showReasonInput: boolean;
  }>({
    isOpen: false,
    tenant: null,
    title: '',
    description: '',
    variant: 'warning',
    icon: 'block',
    confirmText: 'Dondur',
    showReasonInput: true
  });

  // Load modules from permissions
  const loadModules = async () => {
    try {
      const perms = await permissionsApi.getPermissions();
      const map: Record<string, { id: string; code: string; name: string }> = {};
      perms.forEach((p) => {
        if (p.moduleId && p.moduleCode) {
          const codeUpper = p.moduleCode.toUpperCase();
          if (!map[codeUpper]) {
            map[codeUpper] = {
              id: p.moduleId,
              code: codeUpper,
              name: p.module ? `${codeUpper} (${p.module})` : codeUpper
            };
          }
        }
      });
      const list = Object.values(map);
      if (list.length > 0) {
        setAvailableModules(list);
        return list;
      }
    } catch (e) {
      // silent
    }
    return [];
  };

  useEffect(() => {
    loadModules();
  }, []);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      let queryStatus: TenantStatus | undefined = undefined;
      if (statusFilter === 'ACTIVE') queryStatus = TenantStatus.Active;
      if (statusFilter === 'SUSPENDED') queryStatus = TenantStatus.Suspended;
      if (statusFilter === 'TERMINATED') queryStatus = TenantStatus.Terminated;

      const data = await platformApi.getTenants(queryStatus);
      setTenants(data);
    } catch (err: any) {
      showToast('error', err.message || 'Müştəriləri yükləmək mümkün olmadı', 'Xəta');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchTenants();
    const handleTenantCreated = () => fetchTenants();
    window.addEventListener('tenant-created', handleTenantCreated);
    return () => window.removeEventListener('tenant-created', handleTenantCreated);
  }, [fetchTenants]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantSlug || !adminFullName || !adminEmail || !adminPassword) {
      showToast('warning', 'Bütün məcburi xanaları doldurun', 'Xəbərdarlıq');
      return;
    }

    const savedName = tenantName.trim();
    const savedSlug = tenantSlug.trim().toLowerCase();

    setCreatingTenant(true);
    try {
      let currentModules = availableModules;
      if (currentModules.length === 0) {
        currentModules = await loadModules();
      }

      const mappedModuleIds = currentModules
        .filter((m) =>
          selectedModules.some(
            (s) =>
              s.toUpperCase() === m.code.toUpperCase() ||
              s === m.id ||
              (s.toUpperCase() === 'HRM' && m.code.toUpperCase() === 'HR') ||
              (s.toUpperCase() === 'BILLING' && m.code.toUpperCase() === 'ACCOUNTING')
          )
        )
        .map((m) => m.id);

      const created = await platformApi.createTenant({
        name: savedName,
        slug: savedSlug,
        domain: tenantDomain.trim() || undefined,
        adminFullName: adminFullName.trim(),
        adminEmail: adminEmail.trim(),
        adminPassword: adminPassword,
        moduleIds: mappedModuleIds.length > 0 ? mappedModuleIds : undefined,
        moduleCodes: selectedModules
      });

      showToast('success', `${savedName} təşkilatı uğurla yaradıldı!`, 'Uğurlu');
      setIsCreateOpen(false);
      setTenantName('');
      setTenantSlug('');
      setTenantDomain('');
      setAdminFullName('');
      setAdminEmail('');

      let resolvedId =
        (created as any)?.id ||
        (created as any)?.data?.id ||
        (created as any)?.tenantId ||
        (created as any)?.data?.tenantId;

      // Fallback: If backend returns success without direct ID, lookup the newly created tenant
      if (!resolvedId) {
        try {
          const freshTenants = await platformApi.getTenants();
          setTenants(freshTenants);
          const newlyCreated = freshTenants.find(
            (t) =>
              t.slug?.toLowerCase() === savedSlug.toLowerCase() ||
              t.name?.toLowerCase() === savedName.toLowerCase()
          );
          if (newlyCreated?.id) {
            resolvedId = newlyCreated.id;
          }
        } catch {
          // ignore lookup error
        }
      }

      window.dispatchEvent(new CustomEvent('tenant-created'));

      // Navigate directly to the newly created tenant's detail page
      if (resolvedId) {
        navigate(`/tenants/${resolvedId}`);
      } else {
        await fetchTenants();
      }
    } catch (err: any) {
      showToast('error', err.message || 'Müştəri yaradılarkən xəta baş verdi', 'Xəta');
    } finally {
      setCreatingTenant(false);
    }
  };

  const openToggleSuspendModal = (tenant: TenantResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuOpenId(null);
    const isActive = isTenantActiveStatus(tenant.status, tenant.suspendedAt);

    if (isActive) {
      setConfirmModal({
        isOpen: true,
        tenant,
        title: 'Müştəri Hesabını Dondur',
        description:
          'Təşkilat dondurulduqda bu müştərinin istifadəçiləri sistemə giriş edə bilməyəcək və JWT tokenləri bloklanacaq.',
        variant: 'warning',
        icon: 'block',
        confirmText: 'Hesabı Dondur',
        showReasonInput: true
      });
    } else {
      setConfirmModal({
        isOpen: true,
        tenant,
        title: 'Müştəri Hesabını Aktivləşdir',
        description:
          'Təşkilat aktivləşdirildikdə bütün istifadəçilərin sistemə girişi və aktiv modulları bərpa olunacaq.',
        variant: 'success',
        icon: 'check_circle',
        confirmText: 'Aktivləşdir',
        showReasonInput: false
      });
    }
  };

  const handleExecuteSuspend = async (reason?: string) => {
    if (!confirmModal.tenant) return;
    const t = confirmModal.tenant;
    const isActive = isTenantActiveStatus(t.status, t.suspendedAt);

    try {
      if (isActive) {
        await platformApi.suspendTenant(t.id, reason || undefined);
        showToast('warning', `${t.name} hesabı donduruldu (Suspended)`, 'Donduruldu');
      } else {
        await platformApi.unsuspendTenant(t.id);
        showToast('success', `${t.name} hesabı aktivləşdirildi`, 'Aktivləşdirildi');
      }
      fetchTenants();
    } catch (err: any) {
      showToast('error', err.message || 'Əməliyyat icra olunmadı', 'Xəta');
      throw err;
    }
  };

  const handleExportCSV = () => {
    if (tenants.length === 0) {
      showToast('info', 'İxrac üçün məlumat yoxdur', 'Məlumat');
      return;
    }
    const headers = ['ID', 'Name', 'Slug', 'Domain', 'Status', 'UserCount', 'CreatedAt'];
    const rows = tenants.map((t) => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      t.slug,
      t.domain || '',
      getTenantStatusLabel(t.status, t.suspendedAt),
      t.userCount ?? t.usersCount ?? 0,
      t.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tenants-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('success', 'Müştərilər CSV faylı kimi ixrac olundu!', 'Export CSV');
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.domain && t.domain.toLowerCase().includes(searchTerm.toLowerCase()));

    const statusLabel = getTenantStatusLabel(t.status, t.suspendedAt);
    if (statusFilter === 'ACTIVE') return matchesSearch && statusLabel === 'Active';
    if (statusFilter === 'SUSPENDED') return matchesSearch && statusLabel === 'Suspended';
    if (statusFilter === 'TERMINATED') return matchesSearch && statusLabel === 'Terminated';
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredTenants.length / pageSize) || 1;
  const paginatedTenants = filteredTenants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const modulesToDisplay = availableModules.length > 0 ? availableModules : [
    { id: 'crm', code: 'CRM', name: 'Altensor CRM' },
    { id: 'tasks', code: 'TASK', name: 'Task Management' }
  ];

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">{t('tenants.title', {}, 'Tenants')}</h2>
          <p className="text-sm text-[#A1A1AA]">
            {t('tenants.subtitle', {}, 'Müştəri təşkilatları, siyasətlər və modul abunəliklərinin idarə edilməsi.')}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="btn-secondary h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            {t('common.exportCsv', {}, 'Export CSV')}
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t('tenants.createNew', {}, 'New Tenant')}
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-2.5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md shadow-black/20">
        <div className="flex p-1 bg-[#121214] border border-[#27272A] rounded-xl w-full md:w-auto">
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'tab-pill-active'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {t('common.all', {}, 'All')} ({tenants.length})
          </button>
          <button
            onClick={() => {
              setStatusFilter('ACTIVE');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'tab-pill-active'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {t('common.active', {}, 'Active')}
          </button>
          <button
            onClick={() => {
              setStatusFilter('SUSPENDED');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'SUSPENDED'
                ? 'tab-pill-active'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {t('common.suspended', {}, 'Suspended')}
          </button>
          <button
            onClick={() => {
              setStatusFilter('TERMINATED');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === 'TERMINATED'
                ? 'tab-pill-active'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            {t('common.terminated', {}, 'Terminated')}
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-[18px]">
            search
          </span>
          <input
            className="w-full pl-9 pr-3 py-1.5 bg-[#121214] border border-[#27272A] rounded-xl text-xs text-white placeholder-[#71717A] outline-none focus:border-white/40 transition-all"
            placeholder={t('common.searchPlaceholder', {}, 'Ad və ya domen ilə axtar...')}
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
                <th className="py-3 px-4">{t('common.tenant', {}, 'Təşkilat')}</th>
                <th className="py-3 px-4">{t('common.domain', {}, 'Domen')}</th>
                <th className="py-3 px-4">{t('common.status', {}, 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('common.usersCount', {}, 'İstifadəçilər')}</th>
                <th className="py-3 px-4">{t('common.registration', {}, 'Qeydiyyat')}</th>
                <th className="py-3 px-4 text-right">{t('common.actions', {}, 'Əməliyyatlar')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#A1A1AA]">
                    <span className="inline-flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                      {t('common.loading', {}, 'Müştərilər yüklənir...')}
                    </span>
                  </td>
                </tr>
              ) : paginatedTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#A1A1AA]">
                    {t('common.none', {}, 'Axtarışa uyğun heç bir müştəri təşkilatı tapılmadı.')}
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((tItem) => {
                  const isActive = isTenantActiveStatus(tItem.status, tItem.suspendedAt);
                  const statusLabel = getTenantStatusLabel(tItem.status, tItem.suspendedAt);
                  const isActionOpen = actionMenuOpenId === tItem.id;
                  const totalUsers = tItem.userCount ?? tItem.usersCount ?? 0;
                  const localizedStatus =
                    statusLabel === 'Active'
                      ? t('common.active', {}, 'Active')
                      : statusLabel === 'Suspended'
                      ? t('common.suspended', {}, 'Suspended')
                      : statusLabel;

                  return (
                    <tr
                      key={tItem.id}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                      onClick={() => navigate(`/tenants/${tItem.id}`)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-[13px]">
                            {tItem.name}
                          </span>
                          <span className="font-mono text-[#71717A] text-[11.5px] mt-0.5">
                            @{tItem.slug}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#A1A1AA] font-mono text-[11.5px]">
                        {tItem.domain || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                            statusLabel === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : statusLabel === 'Suspended'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {localizedStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#A1A1AA] text-right font-medium">
                        {totalUsers.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-[#71717A]">
                        {formatDate(tItem.createdAt)}
                      </td>
                      <td
                        className="py-3.5 px-4 text-right relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(isActionOpen ? null : tItem.id);
                          }}
                          className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>

                        {/* Action Dropdown */}
                        {isActionOpen && (
                          <div
                            className="absolute right-4 top-10 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl z-50 p-1 flex flex-col text-left text-white animate-in fade-in"
                          >
                            <button
                              onClick={() => {
                                setActionMenuOpenId(null);
                                navigate(`/tenants/${tItem.id}`);
                              }}
                              className="w-full px-3 py-2 text-xs hover:bg-[#2C2C2E] rounded-lg flex items-center gap-2 text-[#D4D4D8] hover:text-white transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              {t('common.viewDetails', {}, 'Detallara Bax')}
                            </button>
                            <div className="h-px bg-[#27272A] my-1"></div>
                            <button
                              onClick={(e) => openToggleSuspendModal(tItem, e)}
                              className={`w-full px-3 py-2 text-xs flex items-center gap-2 cursor-pointer ${
                                isActive
                                  ? 'text-amber-400 hover:bg-amber-500/10'
                                  : 'text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {isActive ? 'block' : 'check_circle'}
                              </span>
                              {isActive ? t('tenants.suspendTenant', {}, 'Müştərini Dondur') : t('tenants.activateTenant', {}, 'Aktivləşdir')}
                            </button>
                          </div>
                        )}
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
            {t('common.showing', {}, 'Göstərilir')}: {filteredTenants.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
            {Math.min(currentPage * pageSize, filteredTenants.length)} / {filteredTenants.length}
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

      {/* New Tenant Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">domain_add</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('tenants.createNew', {}, 'Yeni Müştəri Təşkilatı (Tenant)')}</h3>
                  <p className="text-xs text-[#71717A]">{t('tenants.subtitle', {}, 'Şirkət profili, ilk admin və aktiv modulları təyin edin')}</p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#71717A] hover:text-white p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('tenants.tenantName', {}, 'Təşkilat Adı')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="Məs: Pasha Holding"
                    value={tenantName}
                    onChange={(e) => {
                      setTenantName(e.target.value);
                      if (!tenantSlug) {
                        setTenantSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                      }
                    }}
                    className="w-full crm-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('tenants.tenantSlug', {}, 'Tenant Slug')} *</label>
                  <input
                    type="text"
                    required
                    placeholder="pasha-holding"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value.toLowerCase())}
                    className="w-full crm-input font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('tenants.customDomain', {}, 'Domen (Opsional)')}</label>
                <input
                  type="text"
                  placeholder="pashaholding.az"
                  value={tenantDomain}
                  onChange={(e) => setTenantDomain(e.target.value)}
                  className="w-full crm-input text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#27272A]">
                <span className="block text-xs font-bold text-white mb-2">{t('common.adminAccount', {}, 'İlk İnzibatçı (Admin) Hesabı')}</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{t('tenants.adminUser', {}, 'Admin Ad, Soyad')} *</label>
                    <input
                      type="text"
                      required
                      placeholder="Əli Əliyev"
                      value={adminFullName}
                      onChange={(e) => setAdminFullName(e.target.value)}
                      className="w-full crm-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">{t('tenants.adminEmail', {}, 'Admin Email')} *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@company.az"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full crm-input text-xs"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">{t('tenants.adminPassword', {}, 'Admin İlkin Şifrə')} *</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full crm-input text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#27272A]">
                <label className="block text-xs font-bold text-white mb-2">{t('tenants.activeModules', {}, 'Aktiv Modul Abunəlikləri')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {modulesToDisplay.map((m) => {
                    const isChecked =
                      selectedModules.includes(m.code) ||
                      selectedModules.includes(m.id) ||
                      (m.code === 'HR' && selectedModules.includes('HRM')) ||
                      (m.code === 'ACCOUNTING' && selectedModules.includes('BILLING'));

                    return (
                      <label
                        key={m.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white/[0.08] border-white/40 text-white font-semibold'
                            : 'border-[#27272A] bg-[#121214] text-[#A1A1AA] hover:border-[#3F3F46]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModules([...selectedModules, m.code]);
                            } else {
                              setSelectedModules(
                                selectedModules.filter(
                                  (s) => s !== m.code && s !== m.id && s !== 'HRM' && s !== 'BILLING'
                                )
                              );
                            }
                          }}
                          className="rounded h-3.5 w-3.5 mt-0.5 shrink-0 accent-white"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold block">{m.name}</span>
                          <span className="text-[10px] text-[#71717A] font-mono">{m.code}</span>
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
                  disabled={creatingTenant}
                  className="px-4 py-2 text-xs font-semibold btn-primary rounded-xl cursor-pointer shadow-md"
                >
                  {creatingTenant ? t('common.loading', {}, 'Yaradılır...') : t('tenants.createNew', {}, 'Təşkilatı Yarat')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Confirmation Modal */}
      <ActionConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleExecuteSuspend}
        title={confirmModal.title}
        description={confirmModal.description}
        itemHighlight={confirmModal.tenant ? `${confirmModal.tenant.name} (${confirmModal.tenant.slug})` : undefined}
        variant={confirmModal.variant}
        icon={confirmModal.icon}
        confirmText={confirmModal.confirmText}
        showReasonInput={confirmModal.showReasonInput}
        reasonPlaceholder="Məsələn: Ödəniş gecikməsi, rəsmi müraciət və ya profilaktika..."
      />
    </div>
  );
};

export default TenantsPage;
