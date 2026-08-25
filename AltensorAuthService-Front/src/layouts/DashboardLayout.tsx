import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { platformApi } from '../api/platformApi';
import { permissionsApi } from '../api/permissionsApi';
import SettingsModal from '../components/common/SettingsModal';
import authLogo from '../assets/auth-logo.svg';

const desktopApps = [
  {
    id: 'tasks',
    name: 'Task Management',
    route: import.meta.env.VITE_TMS_WEB_URL || 'https://tms.altensor.com',
    iconBg: '#3B82F6',
    icon: 'task_alt'
  },
  {
    id: 'crm',
    name: 'Altensor CRM',
    route: import.meta.env.VITE_CRM_WEB_URL || 'https://crm.altensor.com',
    iconBg: '#D946EF',
    icon: 'filter_alt'
  },
  {
    id: 'desk',
    name: 'Desktop Launchpad',
    route: import.meta.env.VITE_INFO_WEB_URL ? `${import.meta.env.VITE_INFO_WEB_URL}/desktop` : 'https://info.altensor.com/desktop',
    iconBg: '#475569',
    icon: 'desktop_windows'
  },
  {
    id: 'auth',
    name: 'Auth Gateway',
    route: '/dashboard',
    iconBg: '#8B5CF6',
    icon: 'admin_panel_settings'
  }
];

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, decodedToken, logout, isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isAppsSubmenuOpen, setIsAppsSubmenuOpen] = useState(false);
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const brandMenuRef = useRef<HTMLDivElement>(null);

  // Create Tenant Form State
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantDomain, setTenantDomain] = useState('');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('Admin@2026!');
  const [selectedModules, setSelectedModules] = useState<string[]>(['CRM', 'INVENTORY']);
  const [availableModules, setAvailableModules] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [creatingTenant, setCreatingTenant] = useState(false);

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

  // Close brand dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandMenuRef.current && !brandMenuRef.current.contains(e.target as Node)) {
        setIsBrandMenuOpen(false);
        setIsAppsSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !tenantSlug || !adminFullName || !adminEmail || !adminPassword) {
      showToast('warning', 'Bütün məcburi sahələri doldurun', 'Xəbərdarlıq');
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
      setIsCreateTenantOpen(false);
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

      // Automatically navigate to the newly created tenant's detail page
      if (resolvedId) {
        navigate(`/tenants/${resolvedId}`);
      } else {
        if (window.location.pathname === '/tenants') {
          window.location.reload();
        } else {
          navigate('/tenants');
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'Müştəri yaradılarkən xəta baş verdi', 'Xəta');
    } finally {
      setCreatingTenant(false);
    }
  };

  const displayName = user?.fullName || decodedToken?.payload?.name || decodedToken?.payload?.email || 'Platform Admin';
  const tenantSlugName = user?.tenantSlug || decodedToken?.payload?.tenant_slug || 'platform';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const menuItems = [
    { to: '/dashboard', label: t('nav.dashboard', {}, 'Dashboard'), icon: 'dashboard' },
    ...(isSuperAdmin ? [{ to: '/tenants', label: t('nav.tenants', {}, 'Tenants'), icon: 'domain' }] : []),
    { to: '/users', label: t('nav.users', {}, 'Users'), icon: 'vpn_key' },
    { to: '/roles', label: t('nav.roles', {}, 'Roles & Permissions'), icon: 'security' },
    { to: '/permissions', label: t('roles.permissions', {}, 'Permissions'), icon: 'receipt_long' },
    ...(isSuperAdmin ? [{ to: '/security', label: t('nav.security', {}, 'JWKS Endpoint'), icon: 'key' }] : [])
  ];

  const modulesToDisplay = availableModules.length > 0 ? availableModules : [
    { id: 'crm', code: 'CRM', name: 'Altensor CRM' },
    { id: 'tasks', code: 'TASK', name: 'Task Management' }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121214] text-[#F4F4F5] font-sans antialiased select-none">
      {/* 1. Left Sidebar (Altensor CRM 1:1) */}
      <aside
        className={`${
          isCollapsed ? 'w-16' : 'w-56'
        } bg-[#18181B] text-[#A1A1AA] border-r border-[#27272A] min-h-screen flex flex-col justify-between p-2.5 transition-all duration-200 shrink-0 z-40`}
      >
        {/* Top Brand Section with Dropdown */}
        <div className="flex flex-col gap-3">
          <div className="relative" ref={brandMenuRef}>
            <div
              onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
              className={`flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer ${
                isBrandMenuOpen ? 'bg-white/[0.08]' : ''
              } ${isCollapsed ? 'justify-center p-1.5' : ''}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Brand Logo Container */}
                <div className="w-7 h-7 rounded-lg bg-[#D946EF]/10 border border-[#D946EF]/25 flex items-center justify-center p-0.5 shadow-sm shadow-fuchsia-500/20 shrink-0">
                  <img
                    src={authLogo}
                    alt="Altensor Auth"
                    className="w-full h-full object-contain"
                  />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-bold text-white text-[13px] leading-snug tracking-tight truncate">
                      Altensor Auth
                    </span>
                    <span className="text-[10px] text-[#A1A1AA] font-mono leading-none truncate">
                      {isSuperAdmin ? t('nav.superAdmin', {}, 'Super Admin') : 'Tenant Admin'}
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <span className="material-symbols-outlined text-sm text-[#71717A] ml-1">
                  expand_more
                </span>
              )}
            </div>

            {/* Brand Dropdown Menu */}
            {isBrandMenuOpen && (
              <div className="absolute top-12 left-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-[13px] text-[#D4D4D8] animate-in fade-in">
                {/* Apps Submenu */}
                <div
                  className="relative"
                  onMouseEnter={() => setIsAppsSubmenuOpen(true)}
                  onMouseLeave={() => setIsAppsSubmenuOpen(false)}
                >
                  <div
                    onClick={() => setIsAppsSubmenuOpen(!isAppsSubmenuOpen)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-base text-[#A1A1AA]">apps</span>
                      <span>{t('common.applications', {}, 'Apps')}</span>
                    </div>
                    <span className="material-symbols-outlined text-xs text-[#71717A]">chevron_right</span>
                  </div>

                  {isAppsSubmenuOpen && (
                    <div className="absolute top-0 left-full ml-1.5 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in">
                      {desktopApps.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => {
                            setIsBrandMenuOpen(false);
                            if (app.route.startsWith('/')) {
                              navigate(app.route);
                            } else {
                              window.open(app.route, '_blank');
                            }
                          }}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white transition-colors cursor-pointer text-[13px]"
                        >
                          <div
                            className="w-6 h-6 rounded-lg text-white flex items-center justify-center shrink-0"
                            style={{ backgroundColor: app.iconBg }}
                          >
                            <span className="material-symbols-outlined text-xs">{app.icon}</span>
                          </div>
                          <span className="truncate">{app.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Settings Modal Trigger (Altensor CRM style) */}
                <button
                  onClick={() => {
                    setIsBrandMenuOpen(false);
                    setIsSettingsModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors text-left w-full cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-[#A1A1AA]">settings</span>
                  <span>{t('nav.settings', {}, 'Settings')}</span>
                </button>

                {/* JWKS Endpoint (SuperAdmin Only) */}
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setIsBrandMenuOpen(false);
                      navigate('/security');
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors text-left w-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base text-[#A1A1AA]">key</span>
                    <span>{t('security.jwksUrl', {}, 'JWKS Endpoint')}</span>
                  </button>
                )}

                <div className="h-px bg-[#2C2C2E] my-1"></div>

                {/* Log out */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full text-[#A1A1AA] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>{t('nav.logout', {}, 'Log out')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-0.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-normal transition-colors relative ${
                    isCollapsed ? 'justify-center px-0 py-2' : ''
                  } ${
                    isActive
                      ? 'bg-[#27272A] text-white font-medium shadow-xs'
                      : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <span className="material-symbols-outlined text-[18px] shrink-0">
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Actions (Collapse) */}
        <div className="flex flex-col gap-0.5 pt-2 border-t border-[#27272A]/70">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13px] font-normal text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0 py-2' : ''
            }`}
            title={isCollapsed ? t('common.expandMenu', {}, 'Expand') : t('common.collapseMenu', {}, 'Collapse')}
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
            {!isCollapsed && <span>{t('common.collapseMenu', {}, 'Collapse')}</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#121214]">
        {/* Top Header */}
        <header className="h-14 w-full bg-[#18181B] border-b border-[#27272A] flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-base tracking-tight">Auth Gateway</span>
            <span className="text-[#71717A] text-xs font-mono">@{tenantSlugName}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-sm">
                search
              </span>
              <input
                type="text"
                placeholder={t('nav.searchPlaceholder', {}, 'Axtarış...')}
                className="w-full pl-9 pr-3 py-1.5 bg-[#121214] border border-[#27272A] rounded-xl text-xs text-white placeholder-[#71717A] outline-none focus:border-[#D946EF] transition-colors"
              />
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setIsCreateTenantOpen(true)}
                className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                {t('nav.newTenant', {}, 'Create Tenant')}
              </button>
            )}

            {/* Profile Avatar / Settings Trigger */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-8 h-8 rounded-full bg-[#27272A] hover:bg-[#3F3F46] text-[#D946EF] font-bold text-xs flex items-center justify-center border border-[#3F3F46] transition-colors cursor-pointer"
              title={`${displayName} - ${t('nav.settings', {}, 'Tənzimləmələr')}`}
            >
              {avatarInitial}
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#121214]">
          <Outlet />
        </main>
      </div>

      {/* Quick Create Tenant Modal */}
      {isCreateTenantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D946EF]/20 text-[#D946EF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">domain_add</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Yeni Müştəri Təşkilatı (Tenant)</h3>
                  <p className="text-xs text-[#71717A]">Şirkət profili, ilk admin və aktiv modullar</p>
                </div>
              </div>
              <button onClick={() => setIsCreateTenantOpen(false)} className="text-[#71717A] hover:text-white p-1">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTenantSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Təşkilat Adı *</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tenant Slug *</label>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Domen (Opsional)</label>
                <input
                  type="text"
                  placeholder="pashaholding.az"
                  value={tenantDomain}
                  onChange={(e) => setTenantDomain(e.target.value)}
                  className="w-full crm-input text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#27272A]">
                <span className="block text-xs font-bold text-[#D946EF] mb-2">İlk İnzibatçı Hesabı</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Ad, Soyad *</label>
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
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email *</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin İlkin Şifrə *</label>
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
                <label className="block text-xs font-bold text-[#D946EF] mb-2">Aktiv Modullar</label>
                <div className="grid grid-cols-2 gap-2">
                  {modulesToDisplay.map((m) => {
                    const isChecked =
                      selectedModules.includes(m.code) ||
                      selectedModules.includes(m.id) ||
                      (m.code === 'HR' && selectedModules.includes('HRM')) ||
                      (m.code === 'ACCOUNTING' && selectedModules.includes('BILLING'));

                    return (
                      <label
                        key={m.code || m.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer ${
                          isChecked
                            ? 'bg-[#D946EF]/15 border-[#D946EF] text-[#D946EF] font-bold'
                            : 'border-[#27272A] bg-[#121214] text-[#A1A1AA]'
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
                                  (c) => c !== m.code && c !== m.id
                                )
                              );
                            }
                          }}
                          className="rounded text-[#D946EF] h-3.5 w-3.5"
                        />
                        <span className="truncate">{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setIsCreateTenantOpen(false)}
                  className="px-4 py-2 text-xs font-semibold btn-secondary rounded-xl cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  disabled={creatingTenant}
                  className="px-4 py-2 text-xs font-semibold btn-primary rounded-xl cursor-pointer"
                >
                  {creatingTenant ? 'Yaradılır...' : 'Təşkilatı Yarat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Altensor CRM-style Settings & Preferences Modal (3 Themes, Profile, Security) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
