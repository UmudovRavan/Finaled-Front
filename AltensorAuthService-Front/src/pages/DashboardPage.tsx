import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformApi } from '../api/platformApi';
import { tenantApi } from '../api/tenantApi';
import { permissionsApi } from '../api/permissionsApi';
import { TenantResponse, isTenantActiveStatus, getTenantStatusLabel } from '../types/tenant.types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const DashboardPage: React.FC = () => {
  const { user, isSuperAdmin, decodedToken } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalRoles, setTotalRoles] = useState<number>(0);
  const [totalPermissions, setTotalPermissions] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const tenantSlug = user?.tenantSlug || decodedToken?.payload?.tenant_slug || 'platform';
  const displayName = user?.fullName || decodedToken?.payload?.name || decodedToken?.payload?.email || 'Admin';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (isSuperAdmin) {
        const [tenantsList, rolesData, permsData, platformUsers] = await Promise.all([
          platformApi.getTenants().catch(() => []),
          tenantApi.getRoles().catch(() => []),
          permissionsApi.getPermissions().catch(() => []),
          tenantApi.getUsers().catch(() => [])
        ]);

        setTenants(tenantsList);
        setTotalRoles(rolesData.length);
        setTotalPermissions(permsData.length);

        // Fetch detail of each tenant to sum user counts across the platform
        const tenantDetails = await Promise.all(
          tenantsList.map((t) => platformApi.getTenantById(t.id).catch(() => null))
        );
        const tenantUsersCount = tenantDetails.reduce((sum, td) => sum + (td?.userCount || 0), 0);
        setTotalUsers(Math.max(tenantUsersCount, platformUsers.length));
      } else {
        const [usersData, rolesData, permsData] = await Promise.all([
          tenantApi.getUsers().catch(() => []),
          tenantApi.getRoles().catch(() => []),
          permissionsApi.getPermissions().catch(() => [])
        ]);

        setTotalUsers(usersData.length);
        setTotalRoles(rolesData.length);
        setTotalPermissions(permsData.length);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Məlumatlar yüklənərkən xəta baş verdi', 'Xəta');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, showToast]);

  useEffect(() => {
    loadData();
    const handleCreated = () => loadData();
    window.addEventListener('tenant-created', handleCreated);
    return () => window.removeEventListener('tenant-created', handleCreated);
  }, [loadData]);

  const activeTenants = tenants.filter((t) => isTenantActiveStatus(t.status, t.suspendedAt));
  const suspendedTenants = tenants.filter((t) => !isTenantActiveStatus(t.status, t.suspendedAt));
  const activeRate = tenants.length > 0 ? Math.round((activeTenants.length / tenants.length) * 100) : 100;

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      ...(isSuperAdmin
        ? {
            totalTenants: tenants.length,
            activeTenants: activeTenants.length,
            suspendedTenants: suspendedTenants.length,
            tenants: tenants.map((t) => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              domain: t.domain,
              status: getTenantStatusLabel(t.status, t.suspendedAt),
              createdAt: t.createdAt
            }))
          }
        : { tenantSlug }),
      totalUsers,
      totalRoles,
      totalPermissions
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `altensor-auth-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('success', 'Hesabat JSON faylı olaraq endirildi!', 'Hesabat');
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSuperAdmin ? t('dashboard.platformOverview', {}, 'Platform Overview') : t('dashboard.orgDashboard', {}, 'Organization Dashboard')}
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-0.5">
            {isSuperAdmin
              ? t('dashboard.platformSubtitle', {}, 'Sistem üzrə real tenant, istifadəçi və təhlükəsizlik metrikaları.')
              : `@${tenantSlug} ${t('users.subtitle', {}, 'təşkilatı üzrə istifadəçi və icazə idarəetməsi.')}`}
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="btn-secondary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {loading ? t('common.loading', {}, 'Yenilənir...') : t('common.refresh', {}, 'Refresh')}
          </button>
          <button
            onClick={handleExportReport}
            className="btn-primary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {t('common.exportCsv', {}, 'Export Report')}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {isSuperAdmin ? (
        /* SUPER ADMIN KPI CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/tenants')}
            className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-[#A1A1AA]">{t('dashboard.totalTenants', {}, 'Müştəri Şirkətlər (Tenants)')}</span>
              <div className="w-8 h-8 rounded-xl bg-[#D946EF]/15 text-[#D946EF] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">domain</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{tenants.length}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-emerald-400 font-medium">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>{activeTenants.length} {t('dashboard.activeTenantsCount', {}, 'Aktiv Təşkilat')}</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/tenants')}
            className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-[#A1A1AA]">{t('dashboard.activityRate', {}, 'Aktivlik Səviyyəsi')}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">trending_up</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activeRate}%</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-[#A1A1AA]">
                <span>{activeTenants.length} / {tenants.length} {t('common.active', {}, 'aktiv').toLowerCase()}</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/tenants')}
            className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-[#A1A1AA]">{t('dashboard.suspendedTitle', {}, 'Dondurulmuş (Suspended)')}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">block</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{suspendedTenants.length}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-400 font-medium">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>{suspendedTenants.length > 0 ? t('dashboard.suspendedBadge', {}, 'Dondurulub') : t('dashboard.allActiveBadge', {}, 'Hamısı aktivdir')}</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/users')}
            className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-[#A1A1AA]">{t('dashboard.usersAndStaff', {}, 'İstifadəçilər & Heyət')}</span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">group</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalUsers}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-sky-400 font-medium">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span>{totalRoles} {t('dashboard.activeRolesCount', {}, 'Aktiv Rol')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* REGULAR TENANT CUSTOMER KPI CARDS (NO GLOBAL TENANTS VISIBLE) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => navigate('/users')}
            className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-[#A1A1AA]">{t('dashboard.orgUsers', {}, 'Təşkilat İstifadəçiləri')}</span>
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">group</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalUsers}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-sky-400 font-medium">
                <span className="material-symbols-outlined text-sm">manage_accounts</span>
                <span>{t('dashboard.manageUsers', {}, 'İstifadəçiləri idarə et')}</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/roles')}
            className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-[#A1A1AA]">{t('dashboard.activeRoles', {}, 'Aktiv Rollar')}</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalRoles}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-purple-400 font-medium">
                <span className="material-symbols-outlined text-sm">security</span>
                <span>{t('dashboard.rolesAndPermissions', {}, 'İcazə matrisini tənzimlə')}</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('/roles')}
            className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-medium text-[#A1A1AA]">{t('dashboard.systemPermissions', {}, 'Sistem İcazələri')}</span>
              <div className="w-8 h-8 rounded-xl bg-[#D946EF]/15 text-[#D946EF] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">receipt_long</span>
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalPermissions}</div>
              <div className="flex items-center gap-1 mt-1 text-xs text-[#D946EF] font-medium">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>{t('common.status', {}, 'Təyin edilmiş icazə')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: System Health */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 shadow-lg shadow-black/20 space-y-4">
            <div className="flex justify-between items-center border-b border-[#27272A] pb-3">
              <h3 className="font-bold text-white text-sm">{t('dashboard.securityHealth', {}, 'Security & Health')}</h3>
              <span className="bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[#A1A1AA]">{t('dashboard.tenantContext', {}, 'Tenant Konteksti')}</span>
                </div>
                <span className="text-[#D946EF] font-mono font-bold">@{tenantSlug}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[#A1A1AA]">{t('dashboard.asymmetricSignature', {}, 'RS256 Asimmetrik İmza')}</span>
                </div>
                <span className="text-emerald-400 font-mono font-bold">2048-bit RSA</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[#A1A1AA]">{t('dashboard.tokenRotation', {}, 'Token Rotation')}</span>
                </div>
                <span className="text-emerald-400 font-bold">{t('common.active', {}, 'Aktiv')}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 shadow-lg shadow-black/20 space-y-3">
            <h3 className="font-bold text-white text-sm">{t('dashboard.quickLinks', {}, 'Sürətli Keçidlər')}</h3>
            <div className="space-y-2">
              {isSuperAdmin && (
                <button
                  onClick={() => navigate('/tenants')}
                  className="w-full py-2.5 px-3 bg-[#121214] hover:bg-[#27272A] border border-[#27272A] rounded-xl text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{t('dashboard.tenantsAndModules', {}, 'Müştərilər & Modul Abunəlikləri')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
              <button
                onClick={() => navigate('/users')}
                className="w-full py-2.5 px-3 bg-[#121214] hover:bg-[#27272A] border border-[#27272A] rounded-xl text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{t('dashboard.manageUsers', {}, 'İstifadəçiləri İdarə Et')} ({totalUsers})</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/roles')}
                className="w-full py-2.5 px-3 bg-[#121214] hover:bg-[#27272A] border border-[#27272A] rounded-xl text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{t('dashboard.rolesAndPermissions', {}, 'Rollar və İcazələr Matrisi')} ({totalPermissions})</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => navigate('/security')}
                  className="w-full py-2.5 px-3 bg-[#121214] hover:bg-[#27272A] border border-[#27272A] rounded-xl text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{t('security.title', {}, 'JWKS Endpoint & Açıq Açarlar')}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: SuperAdmin sees Tenants list; Tenant sees Organization Profile */}
        <div className="lg:col-span-2">
          {isSuperAdmin ? (
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg shadow-black/20">
              <div className="p-5 border-b border-[#27272A] flex justify-between items-center bg-[#141416]">
                <div>
                  <h3 className="font-bold text-white text-sm">{t('dashboard.recentTenants', {}, 'Son Qeydiyyatlı Müştərilər (Tenants)')}</h3>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">{t('dashboard.recentTenantsDesc', {}, 'Platformadakı real təşkilatların siyahısı')}</p>
                </div>
                <button
                  onClick={() => navigate('/tenants')}
                  className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {t('dashboard.allTenants', {}, 'Bütün Müştərilər')} ({tenants.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#141416] border-b border-[#27272A] text-[11px] text-[#71717A] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">{t('tenants.tenantName', {}, 'Təşkilat Adı')}</th>
                      <th className="py-3 px-4">{t('tenants.tenantSlug', {}, 'Tenant Slug')}</th>
                      <th className="py-3 px-4">{t('common.domain', {}, 'Domen')}</th>
                      <th className="py-3 px-4">{t('common.status', {}, 'Status')}</th>
                      <th className="py-3 px-4 text-right">{t('common.viewDetails', {}, 'Detallar')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]/60 text-xs">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[#A1A1AA]">
                          <span className="inline-flex items-center gap-2">
                            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                            {t('common.loading', {}, 'Məlumatlar yüklənir...')}
                          </span>
                        </td>
                      </tr>
                    ) : tenants.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[#A1A1AA]">
                          {t('tenants.title', {}, 'Sistemdə hələ heç bir müştəri təşkilatı yoxdur.')}
                        </td>
                      </tr>
                    ) : (
                      tenants.slice(0, 6).map((tItem) => {
                        const statusLabel = getTenantStatusLabel(tItem.status, tItem.suspendedAt);

                        return (
                          <tr
                            key={tItem.id}
                            onClick={() => navigate(`/tenants/${tItem.id}`)}
                            className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 font-bold text-white">{tItem.name}</td>
                            <td className="py-3 px-4 font-mono text-[#D946EF]">{tItem.slug}</td>
                            <td className="py-3 px-4 text-[#A1A1AA]">{tItem.domain || '-'}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  statusLabel === 'Active'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : statusLabel === 'Suspended'
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {statusLabel === 'Active'
                                  ? t('common.active', {}, 'Active')
                                  : statusLabel === 'Suspended'
                                  ? t('common.suspended', {}, 'Suspended')
                                  : t('common.terminated', {}, 'Terminated')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tenants/${tItem.id}`);
                                }}
                                className="p-1 text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* TENANT CUSTOMER PROFILE VIEW */
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 shadow-lg shadow-black/20 space-y-6">
              <div className="flex items-center gap-4 border-b border-[#27272A] pb-5">
                <div className="w-14 h-14 rounded-2xl bg-[#D946EF]/20 text-[#D946EF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">corporate_fare</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{displayName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-[#D946EF] bg-[#D946EF]/10 px-2 py-0.5 rounded border border-[#D946EF]/20">
                      @{tenantSlug}
                    </span>
                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {t('common.active', {}, 'Active Tenant')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#121214] border border-[#27272A] rounded-xl">
                  <span className="text-[#71717A] block mb-1">{t('common.role', {}, 'Hesab Növü')}</span>
                  <span className="font-bold text-white text-sm">Tenant Administrator</span>
                </div>
                <div className="p-4 bg-[#121214] border border-[#27272A] rounded-xl">
                  <span className="text-[#71717A] block mb-1">{t('roles.permissions', {}, 'İcazə Sahəsi')}</span>
                  <span className="font-bold text-white text-sm">Tenant-Scoped Isolation</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate('/users')}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  {t('users.createNew', {}, 'Yeni İstifadəçi Əlavə Et')}
                </button>
                <button
                  onClick={() => navigate('/roles')}
                  className="btn-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">security</span>
                  {t('roles.title', {}, 'Rolların İdarə Edilməsi')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
