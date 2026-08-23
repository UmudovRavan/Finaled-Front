import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { platformApi } from '../api/platformApi';
import { permissionsApi } from '../api/permissionsApi';
import {
  TenantDetailResponse,
  TenantModuleSubscriptionDto,
  isTenantActiveStatus,
  getTenantStatusLabel
} from '../types/tenant.types';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDate } from '../utils/formatters';
import ActionConfirmModal, { ActionModalVariant } from '../components/common/ActionConfirmModal';

export const TenantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [tenant, setTenant] = useState<TenantDetailResponse | null>(null);
  const [availableModules, setAvailableModules] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Add Module Modal State
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [addingModule, setAddingModule] = useState(false);

  // Modern Action Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemHighlight?: string;
    variant: ActionModalVariant;
    icon: string;
    confirmText: string;
    showReasonInput: boolean;
    reasonPlaceholder?: string;
    actionType: 'TOGGLE_TENANT_SUSPEND' | 'TOGGLE_MODULE_SUSPEND' | 'REMOVE_MODULE';
    targetModuleId?: string;
    targetModuleName?: string;
    isSuspendedState?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'warning',
    icon: 'block',
    confirmText: 'Dondur',
    showReasonInput: false,
    actionType: 'TOGGLE_TENANT_SUSPEND'
  });

  const fetchTenantDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [tenantData, permsData] = await Promise.all([
        platformApi.getTenantById(id),
        permissionsApi.getPermissions().catch(() => [])
      ]);
      setTenant(tenantData);

      const map: Record<string, { id: string; code: string; name: string }> = {};
      permsData.forEach((p) => {
        if (p.moduleId && p.moduleCode) {
          const codeUpper = p.moduleCode.toUpperCase();
          if (!map[codeUpper]) {
            map[codeUpper] = {
              id: p.moduleId,
              code: codeUpper,
              name: p.module ? `${codeUpper} — ${p.module}` : codeUpper
            };
          }
        }
      });
      const modules = Object.values(map).length > 0 ? Object.values(map) : [
        { id: 'crm', code: 'CRM', name: 'Altensor CRM' },
        { id: 'tasks', code: 'TASK', name: 'Task Management' },
        { id: 'inventory', code: 'INVENTORY', name: 'Inventory Management' }
      ];
      setAvailableModules(modules);
      if (modules.length > 0) {
        setSelectedModuleId(modules[0].id);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error loading tenant details', 'Error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchTenantDetail();
  }, [fetchTenantDetail]);

  const openTenantStatusModal = () => {
    if (!tenant) return;
    const isActive = isTenantActiveStatus(tenant.status, tenant.suspendedAt);

    if (isActive) {
      setConfirmModal({
        isOpen: true,
        title: t('tenants.suspendTenant', {}, 'Müştəri Hesabını Dondur'),
        description: 'Təşkilat dondurulduqda istifadəçilərin sistemə girişi və bütün aktiv modul abunəlikləri müvəqqəti bloklanacaq.',
        itemHighlight: `${tenant.name} (@${tenant.slug})`,
        variant: 'warning',
        icon: 'block',
        confirmText: t('tenants.suspendTenant', {}, 'Dondur'),
        showReasonInput: true,
        reasonPlaceholder: 'Dondurma səbəbini qeyd edin...',
        actionType: 'TOGGLE_TENANT_SUSPEND'
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: t('tenants.activateTenant', {}, 'Müştəri Hesabını Aktivləşdir'),
        description: 'Təşkilat aktivləşdirildikdə istifadəçilərin autentifikasiyası və aktiv modul abunəlikləri bərpa ediləcək.',
        itemHighlight: `${tenant.name} (@${tenant.slug})`,
        variant: 'success',
        icon: 'check_circle',
        confirmText: t('tenants.activateTenant', {}, 'Aktivləşdir'),
        showReasonInput: false,
        actionType: 'TOGGLE_TENANT_SUSPEND'
      });
    }
  };

  const openModuleStatusModal = (moduleId: string, isSuspended: boolean, moduleName: string) => {
    if (!tenant) return;

    if (!isSuspended) {
      setConfirmModal({
        isOpen: true,
        title: `${moduleName} - ${t('common.suspended', {}, 'Dondur')}`,
        description: `Bu şirkətin ${moduleName} modulu üzrə hüquqları dondurulacaq.`,
        itemHighlight: `${moduleName} (${tenant.name})`,
        variant: 'warning',
        icon: 'pause_circle',
        confirmText: t('common.suspended', {}, 'Modulu Dondur'),
        showReasonInput: true,
        reasonPlaceholder: 'Modulu dondurma səbəbini qeyd edin...',
        actionType: 'TOGGLE_MODULE_SUSPEND',
        targetModuleId: moduleId,
        targetModuleName: moduleName,
        isSuspendedState: false
      });
    } else {
      setConfirmModal({
        isOpen: true,
        title: `${moduleName} - ${t('common.active', {}, 'Aktivləşdir')}`,
        description: `Bu şirkətin ${moduleName} moduluna çıxışı dərhal bərpa olunacaq.`,
        itemHighlight: `${moduleName} (${tenant.name})`,
        variant: 'success',
        icon: 'play_circle',
        confirmText: t('common.active', {}, 'Aktivləşdir'),
        showReasonInput: false,
        actionType: 'TOGGLE_MODULE_SUSPEND',
        targetModuleId: moduleId,
        targetModuleName: moduleName,
        isSuspendedState: true
      });
    }
  };

  const openRemoveModuleModal = (moduleId: string, moduleName: string) => {
    if (!tenant) return;

    setConfirmModal({
      isOpen: true,
      title: t('common.delete', {}, 'Modul Abunəliyini Sil'),
      description: `Diqqət! Bu əməliyyat geri qaytarılmır. ${moduleName} modulu bu təşkilatın abunəliklərindən birdəfəlik çıxarılacaq.`,
      itemHighlight: `${moduleName} (${tenant.name})`,
      variant: 'danger',
      icon: 'delete_forever',
      confirmText: t('common.delete', {}, 'Abunəliyi Sil'),
      showReasonInput: false,
      actionType: 'REMOVE_MODULE',
      targetModuleId: moduleId,
      targetModuleName: moduleName
    });
  };

  const handleModalConfirm = async (reason?: string) => {
    if (!tenant) return;

    try {
      if (confirmModal.actionType === 'TOGGLE_TENANT_SUSPEND') {
        const isActive = isTenantActiveStatus(tenant.status, tenant.suspendedAt);
        if (isActive) {
          await platformApi.suspendTenant(tenant.id, reason || undefined);
          showToast('warning', `${tenant.name} suspended`, 'Warning');
        } else {
          await platformApi.unsuspendTenant(tenant.id);
          showToast('success', `${tenant.name} unsuspended`, 'Success');
        }
      } else if (confirmModal.actionType === 'TOGGLE_MODULE_SUSPEND') {
        if (!confirmModal.targetModuleId) return;
        if (!confirmModal.isSuspendedState) {
          await platformApi.suspendModule(tenant.id, confirmModal.targetModuleId, reason || undefined);
          showToast('warning', `${confirmModal.targetModuleName} suspended`, 'Warning');
        } else {
          await platformApi.unsuspendModule(tenant.id, confirmModal.targetModuleId);
          showToast('success', `${confirmModal.targetModuleName} unsuspended`, 'Success');
        }
      } else if (confirmModal.actionType === 'REMOVE_MODULE') {
        if (!confirmModal.targetModuleId) return;
        await platformApi.removeModule(tenant.id, confirmModal.targetModuleId);
        showToast('success', `${confirmModal.targetModuleName} deleted`, 'Success');
      }

      fetchTenantDetail();
    } catch (err: any) {
      showToast('error', err.message || 'Action failed', 'Error');
      throw err;
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !selectedModuleId) return;

    setAddingModule(true);
    try {
      await platformApi.addModule(tenant.id, {
        moduleId: selectedModuleId,
        expiresAt: expiryDate ? new Date(expiryDate).toISOString() : undefined
      });
      showToast('success', `Modul abunəliyi təşkilata əlavə edildi!`, 'Success');
      setIsAddModuleOpen(false);
      setExpiryDate('');
      fetchTenantDetail();
    } catch (err: any) {
      showToast('error', err.message || 'Error adding module', 'Error');
    } finally {
      setAddingModule(false);
    }
  };

  if (loading && !tenant) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="inline-flex items-center gap-2 text-[#A1A1AA] text-xs">
          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          {t('common.loading', {}, 'Müştəri detalları yüklənir...')}
        </span>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="max-w-[1280px] mx-auto text-center py-16">
        <div className="w-12 h-12 bg-rose-500/15 text-rose-400 rounded-full mx-auto flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-2xl">error</span>
        </div>
        <h3 className="text-base font-bold text-white mb-2">{t('common.none', {}, 'Müştəri Tapılmadı')}</h3>
        <p className="text-[#A1A1AA] text-xs mb-4">Axtardığınız tenant mövcud deyil və ya silinib.</p>
        <button
          onClick={() => navigate('/tenants')}
          className="px-4 py-2 btn-primary rounded-xl text-xs font-semibold cursor-pointer"
        >
          {t('common.cancel', {}, 'Müştərilər Siyahısına Qayıt')}
        </button>
      </div>
    );
  }

  const isActive = isTenantActiveStatus(tenant.status, tenant.suspendedAt);
  const statusLabel = getTenantStatusLabel(tenant.status, tenant.suspendedAt);
  const localizedStatus =
    statusLabel === 'Active'
      ? t('common.active', {}, 'Active')
      : statusLabel === 'Suspended'
      ? t('common.suspended', {}, 'Suspended')
      : statusLabel;

  const subscriptionsList =
    tenant.subscriptions ||
    (tenant as any).Subscriptions ||
    tenant.modules ||
    (tenant as any).Modules ||
    [];
  const totalUsersCount =
    tenant.userCount ??
    (tenant as any).UserCount ??
    tenant.usersCount ??
    (tenant as any).UsersCount ??
    0;

  return (
    <div className="max-w-[1280px] mx-auto w-full space-y-6 pb-8">
      {/* Breadcrumb Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tenants')}
            className="p-1.5 rounded-xl border border-[#27272A] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            title="Back"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => navigate('/tenants')}
                className="text-[#71717A] hover:text-[#D946EF] cursor-pointer text-xs font-medium"
              >
                {t('tenants.title', {}, 'Tenants')}
              </span>
              <span className="text-[#71717A] text-xs">/</span>
              <span className="text-white text-xs font-bold">{tenant.name}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-0.5">{tenant.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTenantDetail}
            disabled={loading}
            className="btn-secondary h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {t('common.refresh', {}, 'Yenilə')}
          </button>

          <button
            onClick={openTenantStatusModal}
            className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isActive ? 'block' : 'check_circle'}
            </span>
            {isActive ? t('tenants.suspendTenant', {}, 'Müştərini Dondur') : t('tenants.activateTenant', {}, 'Aktivləşdir')}
          </button>
        </div>
      </div>

      {/* Tenant Profile Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Organization Summary (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 shadow-lg shadow-black/20 space-y-4">
            <div className="flex justify-between items-start border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#D946EF]/20 text-[#D946EF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">domain</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{tenant.name}</h3>
                  <span className="font-mono text-xs text-[#D946EF]">{tenant.slug}</span>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  {t('tenants.tenantSlug', {}, 'Tenant Slug')}
                </span>
                <span className="font-mono text-xs font-bold text-[#D946EF]">{tenant.slug}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  {t('tenants.customDomain', {}, 'Custom Domain')}
                </span>
                <span className="text-xs text-white">{tenant.domain || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  {t('common.usersCount', {}, 'Active Users')}
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {totalUsersCount.toLocaleString()} {t('common.user', {}, 'user')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
                  {t('common.createdAt', {}, 'Created Date')}
                </span>
                <span className="text-xs text-[#71717A]">{formatDate(tenant.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Module Subscriptions Management Card */}
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg shadow-black/20">
            <div className="p-5 border-b border-[#27272A] flex justify-between items-center bg-[#141416]">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t('tenants.activeModules', {}, 'Subscribed Enterprise Modules')} ({subscriptionsList.length})
                </h3>
                <p className="text-xs text-[#71717A] mt-0.5">
                  {t('common.manageSubscription', {}, 'Bu şirkətin istifadə hüququ olan mikroservislər və abunəlik statusları')}
                </p>
              </div>
              <button
                onClick={() => setIsAddModuleOpen(true)}
                className="btn-primary h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                {t('common.create', {}, 'Modul Əlavə Et')}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#141416] border-b border-[#27272A] text-[11px] text-[#71717A] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-4">{t('common.name', {}, 'Module Name')}</th>
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">{t('common.status', {}, 'Status')}</th>
                    <th className="py-2.5 px-4">{t('common.createdAt', {}, 'Start Date')}</th>
                    <th className="py-2.5 px-4">Expiry</th>
                    <th className="py-2.5 px-4 text-right">{t('common.actions', {}, 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A]/60 text-xs">
                  {subscriptionsList.length > 0 ? (
                    subscriptionsList.map((m: TenantModuleSubscriptionDto) => {
                      const isModSuspended =
                        Boolean(m.suspendedAt) ||
                        String(m.status).toLowerCase() === 'suspended';

                      return (
                        <tr key={m.moduleId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 font-semibold text-white">{m.moduleName || m.moduleCode}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-[#D946EF]/15 text-[#D946EF] rounded-md font-mono text-[11px] font-bold border border-[#D946EF]/30">
                              {m.moduleCode}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                isModSuspended
                                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {isModSuspended ? t('common.suspended', {}, 'Suspended') : t('common.active', {}, 'Active')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#71717A] text-xs">{formatDate(m.startsAt)}</td>
                          <td className="py-3 px-4 text-[#71717A] text-xs">
                            {m.expiresAt ? formatDate(m.expiresAt) : 'Perpetual'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  openModuleStatusModal(m.moduleId, isModSuspended, m.moduleName || m.moduleCode)
                                }
                                className={`p-1 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer ${
                                  isModSuspended ? 'text-emerald-400' : 'text-amber-400'
                                }`}
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {isModSuspended ? 'play_circle' : 'pause_circle'}
                                </span>
                              </button>
                              <button
                                onClick={() => openRemoveModuleModal(m.moduleId, m.moduleName || m.moduleCode)}
                                className="p-1 text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#71717A] text-xs">
                        {t('common.none', {}, 'Bu təşkilata hələ heç bir modul təyin edilməyib.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Access Scope */}
        <div className="space-y-6">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 shadow-lg shadow-black/20 space-y-4">
            <h4 className="text-xs font-bold text-white border-b border-[#27272A] pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D946EF] text-base">security</span>
              {t('security.title', {}, 'Security & Policy Scope')}
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#71717A]">{t('security.algorithm', {}, 'Signature Algorithm')}:</span>
                <span className="font-mono font-bold text-[#D946EF]">RS256</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#71717A]">{t('security.tokenExpiry', {}, 'Token Lifetime')}:</span>
                <span className="font-medium text-white">60 min (Access)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 shadow-lg shadow-black/20 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#D946EF] text-base">admin_panel_settings</span>
              {t('common.actions', {}, 'Identity Actions')}
            </h4>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => navigate('/users')}
                className="w-full py-2 px-3 bg-[#121214] hover:bg-[#27272A] border border-[#27272A] text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{t('users.title', {}, 'İstifadəçiləri İdarə Et')}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <button
                onClick={() => navigate('/roles')}
                className="w-full py-2 px-3 bg-[#121214] hover:bg-[#27272A] border border-[#27272A] text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{t('roles.title', {}, 'Rollar və İcazələr')}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Module Modal */}
      {isAddModuleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D946EF]/20 text-[#D946EF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">extension</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('common.create', {}, 'Modul Abunəliyi Əlavə Et')}</h3>
                  <p className="text-xs text-[#71717A]">{tenant.name} - {t('tenants.activeModules', {}, 'yeni modul')}</p>
                </div>
              </div>
              <button onClick={() => setIsAddModuleOpen(false)} className="text-[#71717A] hover:text-white p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddModule} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('tenants.activeModules', {}, 'Əlavə Ediləcək Modul')} *</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="w-full crm-input text-xs"
                  required
                >
                  {availableModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bitmə Tarixi (Opsional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full crm-input text-xs"
                />
                <span className="text-[11px] text-[#71717A] mt-1 block">Boş saxlandıqda müddətsiz təyin edilir.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="px-4 py-2 text-xs font-semibold btn-secondary rounded-xl cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  disabled={addingModule || !selectedModuleId}
                  className="px-4 py-2 text-xs font-semibold btn-primary rounded-xl cursor-pointer"
                >
                  {addingModule ? 'Əlavə Edilir...' : 'Əlavə Et'}
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
        onConfirm={handleModalConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        itemHighlight={confirmModal.itemHighlight}
        variant={confirmModal.variant}
        icon={confirmModal.icon}
        confirmText={confirmModal.confirmText}
        showReasonInput={confirmModal.showReasonInput}
        reasonPlaceholder={confirmModal.reasonPlaceholder}
      />
    </div>
  );
};

export default TenantDetailPage;
