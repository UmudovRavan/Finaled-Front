import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    BellIcon,
    Squares2X2Icon,
    UserGroupIcon,
    BoltIcon,
    CheckCircleIcon,
    QuestionMarkCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    Cog6ToothIcon,
    InformationCircleIcon,
    ArrowRightOnRectangleIcon,
    ComputerDesktopIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { authService, workGroupService } from '../api';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context';
import { parseJwtToken, isUserAdmin, isUserManager } from '../utils';
import altensorLogo from '../assets/Altensor-Logo.png';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';
import SettingsModal from '../components/SettingsModal';

interface SidebarProps {
    userName?: string;
    userRole?: string;
    userAvatar?: string;
    userEmail?: string;
    workGroupName?: string;
    notificationCount?: number;
    activeTaskCount?: number;
    onCollapseChange?: (collapsed: boolean) => void;
}

const desktopApps = [
    {
        id: 'desk',
        name: 'Desk',
        route: import.meta.env.VITE_INFO_WEB_URL ? `${import.meta.env.VITE_INFO_WEB_URL}/desktop` : 'https://info.altensor.com/desktop',
        iconElement: (
            <div className="w-6 h-6 rounded-lg bg-[#475569] text-white flex items-center justify-center shrink-0">
                <ComputerDesktopIcon className="w-3.5 h-3.5" />
            </div>
        ),
    },
    {
        id: 'crm',
        name: 'Altensor CRM',
        route: import.meta.env.VITE_CRM_WEB_URL || 'https://info.altensor.com',
        iconElement: (
            <div className="w-6 h-6 rounded-lg bg-[#D946EF] text-white flex items-center justify-center shrink-0">
                <Squares2X2Icon className="w-3.5 h-3.5" />
            </div>
        ),
    },
    {
        id: 'tasks',
        name: 'Task Management',
        route: '/dashboard',
        iconElement: (
            <div className="w-6 h-6 rounded-lg bg-[#6366F1] text-white flex items-center justify-center shrink-0">
                <ClipboardDocumentListIcon className="w-3.5 h-3.5" />
            </div>
        ),
    },
    {
        id: 'hr',
        name: 'Frappe HR',
        route: '/dashboard',
        iconElement: (
            <div className="w-6 h-6 rounded-lg bg-[#10B981] text-white flex items-center justify-center shrink-0">
                <UserGroupIcon className="w-3.5 h-3.5" />
            </div>
        ),
    },
    {
        id: 'erp',
        name: 'Altensor ERP',
        route: '/dashboard',
        iconElement: (
            <div className="w-6 h-6 rounded-lg bg-black border border-white/20 flex items-center justify-center shrink-0">
                <img src={altensorLogo} alt="ERP" className="w-4 h-4 object-contain" />
            </div>
        ),
    },
];

const Sidebar: React.FC<SidebarProps> = ({
    userRole: propUserRole,
    workGroupName: propWorkGroupName,
    notificationCount: propNotificationCount = 0,
    onCollapseChange,
}) => {
    const navigate = useNavigate();
    const { logout, hasPermission } = useAuth();
    const { unreadCount: contextUnreadCount } = useNotifications();
    const { t } = useLanguage();
    const unreadNotificationsCount = contextUnreadCount !== undefined ? contextUnreadCount : propNotificationCount;

    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });
    const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
    const [isAppsSubmenuOpen, setIsAppsSubmenuOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [managerGroupId, setManagerGroupId] = useState<number | string | null>(null);
    const [managerGroupName, setManagerGroupName] = useState<string>(propWorkGroupName || 'İş Qrupum');
    const brandMenuRef = useRef<HTMLDivElement>(null);

    // Global listener for opening settings modal from anywhere (e.g. Header)
    useEffect(() => {
        const handleOpenSettings = () => setIsSettingsModalOpen(true);
        window.addEventListener('open-settings-modal', handleOpenSettings);
        return () => window.removeEventListener('open-settings-modal', handleOpenSettings);
    }, []);

    // Parse user info from token
    const token = authService.getToken();
    const parsedUser = useMemo(() => (token ? parseJwtToken(token) : null), [token]);

    const roles = useMemo(() => {
        if (parsedUser?.roles && parsedUser.roles.length > 0) return parsedUser.roles;
        if (propUserRole) return [propUserRole];
        return ['Employee'];
    }, [parsedUser, propUserRole]);

    const isAdmin = useMemo(() => isUserAdmin(roles), [roles]);
    const isManager = useMemo(
        () => !isAdmin && isUserManager(roles),
        [isAdmin, roles]
    );

    // If manager, fetch their specific led workgroup ID
    useEffect(() => {
        if (isManager && parsedUser?.userId) {
            workGroupService
                .getAllWorkGroups()
                .then((groups) => {
                    const myGroup = groups.find((g) => g.leaderId === parsedUser.userId);
                    if (myGroup) {
                        setManagerGroupId(myGroup.id);
                        setManagerGroupName(myGroup.name || 'İş Qrupum');
                    }
                })
                .catch(() => {});
        }
    }, [isManager, parsedUser?.userId]);

    // Save collapse state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isCollapsed));
        if (onCollapseChange) onCollapseChange(isCollapsed);
    }, [isCollapsed, onCollapseChange]);

    // Close brand dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (brandMenuRef.current && !brandMenuRef.current.contains(event.target as Node)) {
                setIsBrandMenuOpen(false);
                setIsAppsSubmenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsBrandMenuOpen(false);
        try {
            await logout();
        } catch {
            authService.clearTokens();
        }
        navigate('/login', { replace: true });
    };

    const handleAppSelect = (route: string) => {
        setIsBrandMenuOpen(false);
        setIsAppsSubmenuOpen(false);
        if (route.startsWith('http')) {
            window.location.href = route;
        } else {
            navigate(route);
        }
    };

    const formattedRole = useMemo(() => {
        if (isAdmin) return 'Admin';
        if (isManager) return 'Manager';
        return 'Employee';
    }, [isAdmin, isManager]);

    // Build permission and role-filtered navigation menu items
    const menuItems = useMemo(() => {
        const items: Array<{
            path: string;
            label: string;
            icon: React.ComponentType<{ className?: string }>;
            isNotification?: boolean;
        }> = [];

        // 1. Notifications
        if (isAdmin || hasPermission('tms.notifications.view')) {
            items.push({ path: '/notifications', label: t('nav.notifications', {}, 'Bildirişlər'), icon: BellIcon, isNotification: true });
        }

        // 2. Dashboard - universally accessible
        items.push({ path: '/dashboard', label: t('nav.dashboard', {}, 'Dashboard'), icon: Squares2X2Icon });

        // 3. Tasks
        if (isAdmin || hasPermission('tms.tasks.view')) {
            items.push({ path: '/tasks', label: t('tasks.taskList', {}, 'Tapşırıqlar'), icon: CheckCircleIcon });
        }

        // 4. Performance & Leaderboard
        if (isAdmin || hasPermission('tms.performance.view')) {
            items.push(
                { path: '/leaderboard', label: t('nav.leaderboard', {}, 'Liderlər Lövhəsi'), icon: BoltIcon },
                { path: '/performance', label: t('nav.performance', {}, 'Performans'), icon: ChartBarIcon }
            );
        }

        return items;
    }, [isAdmin, hasPermission, t]);

    return (
        <aside
            className={`${
                isCollapsed ? 'w-16' : 'w-56'
            } bg-[#18181B] text-[#A1A1AA] border-r border-[#27272A] min-h-screen h-full flex flex-col justify-between p-2.5 transition-all duration-200 select-none z-40 selection:bg-fuchsia-500/30 shrink-0 font-sans`}
        >
            {/* Top Section */}
            <div className="flex flex-col gap-3">
                {/* Brand Card with Dropdown */}
                <div className="relative" ref={brandMenuRef}>
                    <div
                        onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                        className={`flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer ${
                            isBrandMenuOpen ? 'bg-white/[0.08]' : ''
                        } ${isCollapsed ? 'justify-center p-1.5' : ''}`}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            {/* iOS Magenta / Gradient Squircle Icon with Task Management Logo */}
                            <div className="w-7 h-7 rounded-lg bg-[#D946EF] text-white flex items-center justify-center shadow-md shadow-fuchsia-500/20 shrink-0 overflow-hidden p-1">
                                <img src={taskManagementLogo} alt="Logo" className="w-full h-full object-contain filter brightness-200" />
                            </div>

                            {!isCollapsed && (
                                <div className="flex flex-col text-left min-w-0">
                                    <span className="font-bold text-white text-[13.5px] leading-snug tracking-tight truncate">
                                        Task Management
                                    </span>
                                    <span className="text-[11px] text-[#A1A1AA] font-normal leading-none truncate">
                                        {formattedRole}
                                    </span>
                                </div>
                            )}
                        </div>

                        {!isCollapsed && <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] shrink-0 ml-1" />}
                    </div>

                    {/* Main Brand Dropdown Menu */}
                    {isBrandMenuOpen && (
                        <div className="absolute top-11 left-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-[13px] text-[#D4D4D8] animate-in fade-in duration-150">
                            {/* Apps Menu Item with Flyout Submenu */}
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
                                        <span>{t('common.applications', {}, 'Tətbiqlər')}</span>
                                    </div>
                                    <ChevronRightIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                </div>

                                {/* Submenu Flyout for Desktop Apps */}
                                {isAppsSubmenuOpen && (
                                    <div className="absolute top-0 left-full ml-1.5 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in duration-150">
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

                            {/* Settings */}
                            <button
                                onClick={() => {
                                    setIsBrandMenuOpen(false);
                                    setIsSettingsModalOpen(true);
                                }}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors text-left w-full cursor-pointer"
                            >
                                <Cog6ToothIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{t('nav.settings', {}, 'Tənzimləmələr')}</span>
                            </button>

                            {/* About */}
                            <button
                                onClick={() => {
                                    setIsBrandMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors text-left w-full cursor-pointer"
                            >
                                <InformationCircleIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{t('common.about', {}, 'Haqqında')}</span>
                            </button>

                            <div className="h-px bg-[#2C2C2E] my-1"></div>

                            {/* Log out */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full text-[#A1A1AA] cursor-pointer"
                            >
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                <span>{t('nav.logout', {}, 'Çıxış et')}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation List */}
                <nav className="flex flex-col gap-0.5">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isNotificationItem = item.isNotification;

                        if (isNotificationItem) {
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13.5px] font-normal transition-colors relative w-full text-left cursor-pointer ${
                                            isCollapsed ? 'justify-center px-0 py-2' : ''
                                        } ${
                                            isActive
                                                ? 'bg-[#27272A] text-white font-medium shadow-xs'
                                                : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
                                        }`
                                    }
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <div className="relative shrink-0">
                                        <Icon className="w-[18px] h-[18px] stroke-[1.75] text-[#A1A1AA]" />
                                        {unreadNotificationsCount > 0 && isCollapsed && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                                        )}
                                    </div>

                                    {!isCollapsed && (
                                        <div className="flex items-center justify-between w-full min-w-0">
                                            <span className="truncate">{item.label}</span>
                                            {unreadNotificationsCount > 0 && (
                                                <span className="px-1.5 py-0.2 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-bold border border-fuchsia-500/30">
                                                    {unreadNotificationsCount}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </NavLink>
                            );
                        }

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13.5px] font-normal transition-colors relative ${
                                        isCollapsed ? 'justify-center px-0 py-2' : ''
                                    } ${
                                        isActive
                                            ? 'bg-[#27272A] text-white font-medium shadow-xs'
                                            : 'text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white'
                                    }`
                                }
                                title={isCollapsed ? item.label : undefined}
                            >
                                <div className="relative shrink-0">
                                    <Icon className="w-[18px] h-[18px] stroke-[1.75] text-[#A1A1AA]" />
                                </div>

                                {!isCollapsed && (
                                    <div className="flex items-center justify-between w-full min-w-0">
                                        <span className="truncate">{item.label}</span>
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Actions (Help & Collapse) */}
            <div className="flex flex-col gap-0.5 pt-2 border-t border-[#27272A]/70">
                <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(true)}
                    className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13px] font-normal text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer ${
                        isCollapsed ? 'justify-center px-0 py-2' : ''
                    }`}
                    title={isCollapsed ? t('common.helpSupport', {}, 'Kömək & Dəstək') : undefined}
                >
                    <QuestionMarkCircleIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
                    {!isCollapsed && <span>{t('common.helpSupport', {}, 'Kömək & Dəstək')}</span>}
                </button>

                <button
                    type="button"
                    onClick={() => {
                        const nextState = !isCollapsed;
                        setIsCollapsed(nextState);
                    }}
                    className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13px] font-normal text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer ${
                        isCollapsed ? 'justify-center px-0 py-2' : ''
                    }`}
                    title={isCollapsed ? t('common.expandMenu', {}, 'Menyunu genişləndir') : t('common.collapseMenu', {}, 'Menyunu kiçilt')}
                >
                    {isCollapsed ? (
                        <ChevronRightIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
                    ) : (
                        <>
                            <ChevronLeftIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
                            <span>{t('common.collapseMenu', {}, 'Menyunu kiçilt')}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Global CRM Settings Modal */}
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </aside>
    );
};

export default Sidebar;
