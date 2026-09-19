import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BellIcon,
  Squares2X2Icon,
  UserGroupIcon,
  BoltIcon,
  UserIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  CheckCircleIcon,
  PhoneIcon,
  QuestionMarkCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  FunnelIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
  ComputerDesktopIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { authApi, taskManagementApi } from '../../services/api';

const desktopApps = [
  {
    id: 'desk',
    name: 'Desk',
    route: import.meta.env.VITE_INFO_WEB_URL ? `${import.meta.env.VITE_INFO_WEB_URL}/desktop` : 'https://info.altensor.com/desktop',
    iconElement: (
      <div className="w-6 h-6 rounded-lg bg-[#475569] text-white flex items-center justify-center shrink-0">
        <ComputerDesktopIcon className="w-3.5 h-3.5" />
      </div>
    )
  },
  {
    id: 'tasks',
    name: 'Task Management',
    route: import.meta.env.VITE_TMS_WEB_URL || 'https://tms.altensor.com',
    iconElement: (
      <div className="w-6 h-6 rounded-lg bg-[#6366F1] text-white flex items-center justify-center shrink-0">
        <Squares2X2Icon className="w-3.5 h-3.5" />
      </div>
    )
  },
  {
    id: 'crm',
    name: 'Altensor CRM',
    route: '/crm/dashboard',
    iconElement: (
      <div className="w-6 h-6 rounded-lg bg-[#D946EF] text-white flex items-center justify-center shrink-0">
        <FunnelIcon className="w-3.5 h-3.5" />
      </div>
    )
  }
];

const CrmSidebar = ({ isNotificationsOpen, onToggleNotifications, onCollapseChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isAppsSubmenuOpen, setIsAppsSubmenuOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const brandMenuRef = useRef(null);
  const mobileBrandMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { hasPermission, hasRole } = useAuth();

  const isAdmin = Boolean(hasRole && (hasRole('TenantAdmin') || hasRole('PlatformSuperAdmin') || hasRole('Admin') || hasRole('SuperAdmin')));
  const canManageSettings = isAdmin || Boolean(hasPermission && hasPermission('crm.settings.manage'));

  const rawMenuItems = [
    { path: '/crm/notifications', label: t('sidebar.notifications', {}, 'Notifications'), icon: BellIcon },
    { path: '/crm/dashboard', label: t('sidebar.dashboard', {}, 'Dashboard'), icon: Squares2X2Icon },
    { path: '/crm/leads', label: t('sidebar.leads', {}, 'Leads'), icon: UserGroupIcon, permission: 'crm.leads.view' },
    { path: '/crm/deals', label: t('sidebar.deals', {}, 'Deals'), icon: BoltIcon, permission: 'crm.deals.view' },
    { path: '/crm/contacts', label: t('sidebar.contacts', {}, 'Contacts'), icon: UserIcon, permission: 'crm.contacts.view' },
    { path: '/crm/organizations', label: t('sidebar.organizations', {}, 'Organizations'), icon: BuildingOffice2Icon, permission: 'crm.organizations.view' },
    { path: '/crm/notes', label: t('sidebar.notes', {}, 'Notes'), icon: DocumentTextIcon, permission: 'crm.notes.view' },
    { path: '/crm/tasks', label: t('sidebar.tasks', {}, 'Tasks'), icon: CheckCircleIcon, permission: 'crm.tasks.view' },
    { path: '/crm/call-logs', label: t('sidebar.callLogs', {}, 'Call Logs'), icon: PhoneIcon },
  ];

  const menuItems = rawMenuItems.filter(item => {
    if (!item.permission) return true;
    if (isAdmin) return true;
    return hasPermission && hasPermission(item.permission);
  });

  // Mobile sidebar custom events listener
  useEffect(() => {
    const handleToggle = () => setIsMobileOpen(prev => !prev);
    const handleOpen = () => setIsMobileOpen(true);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('open-mobile-sidebar', handleOpen);
    window.addEventListener('close-mobile-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('open-mobile-sidebar', handleOpen);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await taskManagementApi.getNotifications();
        if (Array.isArray(data)) {
          const unread = data.filter(n => !n.isRead).length;
          setUnreadNotificationsCount(unread);
        }
      } catch (err) {
        // silent
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);
    return () => clearInterval(interval);
  }, []);

  // Close brand dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandMenuRef.current && !brandMenuRef.current.contains(event.target)) {
        setIsBrandMenuOpen(false);
        setIsAppsSubmenuOpen(false);
      }
      if (mobileBrandMenuRef.current && !mobileBrandMenuRef.current.contains(event.target)) {
        setIsBrandMenuOpen(false);
        setIsAppsSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsBrandMenuOpen(false);
    setIsMobileOpen(false);
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout notice:', err);
    }
    window.location.href = import.meta.env.VITE_INFO_WEB_URL ? `${import.meta.env.VITE_INFO_WEB_URL}/login` : 'https://info.altensor.com/login';
  };

  const handleAppSelect = (route) => {
    setIsBrandMenuOpen(false);
    setIsAppsSubmenuOpen(false);
    setIsMobileOpen(false);
    if (route.startsWith('http')) {
      window.location.href = route;
    } else {
      navigate(route);
    }
  };

  // Shared Brand and Navigation content
  const renderNavList = (isMobile = false) => (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isNotificationItem = item.path === '/crm/notifications';

        if (isNotificationItem) {
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                if (isMobile) setIsMobileOpen(false);
                onToggleNotifications();
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors relative w-full text-left cursor-pointer ${
                !isMobile && isCollapsed ? 'justify-center px-0 py-2.5' : ''
              } ${
                isNotificationsOpen
                  ? 'bg-[#27272A] text-white font-semibold shadow-xs'
                  : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
              }`}
              title={!isMobile && isCollapsed ? item.label : undefined}
            >
              <div className="relative">
                <Icon className="w-5 h-5 stroke-[1.75] shrink-0 text-[#A1A1AA]" />
                {unreadNotificationsCount > 0 && (!isMobile && isCollapsed) && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                )}
              </div>

              {(isMobile || !isCollapsed) && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate">{item.label}</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-[11px] font-bold border border-fuchsia-500/30">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (isMobile) setIsMobileOpen(false);
            }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] font-medium transition-colors relative ${
                !isMobile && isCollapsed ? 'justify-center px-0 py-2.5' : ''
              } ${
                isActive
                  ? 'bg-[#27272A] text-white font-semibold shadow-xs'
                  : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
              }`
            }
            title={!isMobile && isCollapsed ? item.label : undefined}
          >
            <div className="relative">
              <Icon className="w-5 h-5 stroke-[1.75] shrink-0 text-[#A1A1AA]" />
            </div>

            {(isMobile || !isCollapsed) && (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="truncate">{item.label}</span>
              </div>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Hidden on mobile) */}
      <aside
        className={`hidden md:flex ${
          isCollapsed ? 'w-16' : 'w-56'
        } bg-[#18181B] text-[#A1A1AA] border-r border-[#27272A] min-h-screen flex-col justify-between p-2.5 transition-all duration-200 select-none z-40 selection:bg-fuchsia-500/30 shrink-0`}
      >
        {/* Top Section */}
        <div className="flex flex-col gap-3">
          {/* Brand Card (CRM Administrator) with Dropdown */}
          <div className="relative" ref={brandMenuRef}>
            <div
              onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
              className={`flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer ${
                isBrandMenuOpen ? 'bg-white/[0.08]' : ''
              } ${isCollapsed ? 'justify-center p-1.5' : ''}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* iOS Magenta Squircle Icon */}
                <div className="w-7 h-7 rounded-lg bg-[#D946EF] text-white flex items-center justify-center shadow-md shadow-fuchsia-500/20 shrink-0">
                  <FunnelIcon className="w-4 h-4 stroke-[2.2]" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-bold text-white text-[13.5px] leading-snug tracking-tight truncate">
                      CRM
                    </span>
                    <span className="text-[11px] text-[#A1A1AA] font-normal leading-none truncate">
                      Administrator
                    </span>
                  </div>
                )}
              </div>

              {!isCollapsed && <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0 ml-1" />}
            </div>

            {/* Main Brand Dropdown Menu */}
            {isBrandMenuOpen && (
              <div className="absolute top-11 left-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-[13px] text-[#D4D4D8] animate-in fade-in slide-in-from-top-1 duration-150">
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
                      <Squares2X2Icon className="w-4 h-4 text-[#A1A1AA]" />
                      <span>Apps</span>
                    </div>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-[#71717A]" />
                  </div>

                  {isAppsSubmenuOpen && (
                    <div className="absolute top-0 left-full ml-1.5 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in slide-in-from-left-1 duration-150">
                      {desktopApps.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => handleAppSelect(app.route)}
                          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-[#2C2C2E] text-[#D4D4D8] hover:text-white transition-colors cursor-pointer text-[13px]"
                        >
                          {app.iconElement}
                          <span className="truncate">{app.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {canManageSettings && (
                  <button
                    onClick={() => {
                      setIsBrandMenuOpen(false);
                      navigate('/crm/settings');
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors text-left w-full cursor-pointer"
                  >
                    <Cog6ToothIcon className="w-4 h-4 text-[#A1A1AA]" />
                    <span>{t('sidebar.settings', {}, 'Settings')}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsBrandMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors text-left w-full cursor-pointer"
                >
                  <InformationCircleIcon className="w-4 h-4 text-[#A1A1AA]" />
                  <span>{t('sidebar.about', {}, 'About')}</span>
                </button>

                <div className="h-px bg-[#2C2C2E] my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full text-[#A1A1AA] cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>{t('sidebar.logout', {}, 'Log out')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation List */}
          {renderNavList(false)}
        </div>

        {/* Bottom Actions (Help & Collapse) */}
        <div className="flex flex-col gap-0.5 pt-2 border-t border-[#27272A]/70">
          <NavLink
            to="/crm/help"
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-colors ${
                isCollapsed ? 'justify-center px-0 py-2' : ''
              } ${
                isActive
                  ? 'bg-[#27272A] text-white font-medium'
                  : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
              }`
            }
            title={isCollapsed ? t('navbar.help', {}, 'Help') : undefined}
          >
            <QuestionMarkCircleIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
            {!isCollapsed && <span>{t('navbar.help', {}, 'Help')}</span>}
          </NavLink>

          <button
            onClick={() => {
              const nextState = !isCollapsed;
              setIsCollapsed(nextState);
              if (onCollapseChange) onCollapseChange(nextState);
            }}
            className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13px] font-normal text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-0 py-2' : ''
            }`}
            title={isCollapsed ? t('sidebar.expand', {}, 'Expand') : t('sidebar.collapse', {}, 'Collapse')}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
            ) : (
              <>
                <ChevronLeftIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
                <span>{t('sidebar.collapse', {}, 'Collapse')}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Off-Canvas Drawer (Shown on mobile when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative w-72 max-w-[85vw] bg-[#18181B] text-[#A1A1AA] border-r border-[#27272A] h-full flex flex-col justify-between p-4 z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex flex-col gap-4">
              {/* Header & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D946EF] text-white flex items-center justify-center shadow-md shadow-fuchsia-500/20 shrink-0">
                    <FunnelIcon className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white text-sm leading-tight">CRM</span>
                    <span className="text-xs text-[#A1A1AA]">Administrator</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white cursor-pointer transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              {renderNavList(true)}
            </div>

            {/* Bottom Actions for Mobile */}
            <div className="flex flex-col gap-2 pt-4 border-t border-[#27272A]">
              {canManageSettings && (
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate('/crm/settings');
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  <span>{t('sidebar.settings', {}, 'Tənzimləmələr')}</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>{t('sidebar.logout', {}, 'Çıxış')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CrmSidebar;
