import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Squares2X2Icon,
    ClipboardDocumentListIcon,
    DocumentTextIcon,
    UserGroupIcon,
    ReceiptPercentIcon,
    BuildingOfficeIcon,
    ShoppingBagIcon,
    InboxArrowDownIcon,
    DocumentCheckIcon,
    BuildingStorefrontIcon,
    ArchiveBoxIcon,
    CreditCardIcon,
    BanknotesIcon,
    ChartBarIcon,
    CalendarDaysIcon,
    QuestionMarkCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    Cog6ToothIcon,
    InformationCircleIcon,
    ArrowRightOnRectangleIcon,
    ComputerDesktopIcon,
    XMarkIcon,
    ScaleIcon,
} from '@heroicons/react/24/outline';
import accountingLogo from '../assets/Accounting-Logo.png';
import { authService } from '../api';
import { useAuth } from '../context';
import { useLanguage } from '../context/LanguageContext';
import SettingsModal from '../components/SettingsModal';

interface SidebarProps {
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
        id: 'tasks',
        name: 'Task Management',
        route: import.meta.env.VITE_TMS_WEB_URL || 'https://tms.altensor.com',
        iconElement: (
            <div className="w-6 h-6 rounded-lg bg-[#6366F1] text-white flex items-center justify-center shrink-0">
                <Squares2X2Icon className="w-3.5 h-3.5" />
            </div>
        ),
    },
    {
        id: 'crm',
        name: 'Altensor CRM',
        route: import.meta.env.VITE_CRM_WEB_URL || 'https://crm.altensor.com',
        iconElement: (
            <div className="w-6 h-6 rounded-lg bg-[#D946EF] text-white flex items-center justify-center shrink-0">
                <Squares2X2Icon className="w-3.5 h-3.5" />
            </div>
        ),
    },
    {
        id: 'accounting',
        name: 'Accounting',
        route: '/dashboard',
        iconElement: (
            <div className="w-6 h-6 rounded-lg bg-[#27272A] border border-[#3F3F46] p-0.5 flex items-center justify-center shrink-0">
                <img src={accountingLogo} alt="Accounting" className="w-full h-full object-contain" />
            </div>
        ),
    },
];

export const Sidebar: React.FC<SidebarProps> = ({
    onCollapseChange,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { t } = useLanguage();

    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
    const [isAppsSubmenuOpen, setIsAppsSubmenuOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const brandMenuRef = useRef<HTMLDivElement>(null);
    const mobileBrandMenuRef = useRef<HTMLDivElement>(null);

    // Save collapse state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isCollapsed));
        if (onCollapseChange) onCollapseChange(isCollapsed);
    }, [isCollapsed, onCollapseChange]);

    // Close mobile drawer on route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    // Mobile toggle & settings listeners
    useEffect(() => {
        const handleToggle = () => setIsMobileOpen((prev) => !prev);
        const handleOpen = () => setIsMobileOpen(true);
        const handleClose = () => setIsMobileOpen(false);
        const handleOpenSettings = () => setIsSettingsModalOpen(true);

        window.addEventListener('toggle-mobile-sidebar', handleToggle);
        window.addEventListener('open-mobile-sidebar', handleOpen);
        window.addEventListener('close-mobile-sidebar', handleClose);
        window.addEventListener('open-settings-modal', handleOpenSettings);

        return () => {
            window.removeEventListener('toggle-mobile-sidebar', handleToggle);
            window.removeEventListener('open-mobile-sidebar', handleOpen);
            window.removeEventListener('close-mobile-sidebar', handleClose);
            window.removeEventListener('open-settings-modal', handleOpenSettings);
        };
    }, []);

    // Outside click for brand menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (brandMenuRef.current && !brandMenuRef.current.contains(event.target as Node)) {
                setIsBrandMenuOpen(false);
                setIsAppsSubmenuOpen(false);
            }
            if (mobileBrandMenuRef.current && !mobileBrandMenuRef.current.contains(event.target as Node)) {
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
            await logout();
        } catch {
            authService.clearTokens();
        }
        navigate('/login', { replace: true });
    };

    const handleAppSelect = (route: string) => {
        setIsBrandMenuOpen(false);
        setIsAppsSubmenuOpen(false);
        setIsMobileOpen(false);
        if (route.startsWith('http')) {
            window.location.href = route;
        } else {
            navigate(route);
        }
    };

    const menuItems = useMemo(
        () => [
            { path: '/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
            { path: '/accounts', label: 'Hesablar Planı', icon: ClipboardDocumentListIcon },
            { path: '/journal', label: 'Jurnal Qeydləri', icon: DocumentTextIcon },
            { path: '/customers', label: 'Müştərilər', icon: UserGroupIcon },
            { path: '/customer-invoices', label: 'Satış Qaimələri', icon: ReceiptPercentIcon },
            { path: '/items', label: 'Məhsul & Xidmətlər', icon: Squares2X2Icon },
            { path: '/suppliers', label: 'Təchizatçılar', icon: BuildingOfficeIcon },
            { path: '/purchase-orders', label: 'Satınalma Sifarişləri', icon: ShoppingBagIcon },
            { path: '/goods-receipts', label: 'Malların Qəbulu', icon: InboxArrowDownIcon },
            { path: '/supplier-invoices', label: 'Alış Qaimələri', icon: DocumentCheckIcon },
            { path: '/warehouses', label: 'Anbarlar', icon: BuildingStorefrontIcon },
            { path: '/stock-ledger', label: 'Ehtiyat Hərəkəti', icon: ArchiveBoxIcon },
            { path: '/bank-accounts', label: 'Bank Hesabları', icon: CreditCardIcon },
            { path: '/payments', label: 'Ödənişlər', icon: BanknotesIcon },
            { path: '/reports/trial-balance', label: 'Maliyyə Hesabatları', icon: ChartBarIcon },
            { path: '/fiscal-periods', label: 'Maliyyə Dövrləri', icon: CalendarDaysIcon },
        ],
        []
    );

    const renderNavList = (isMobile = false) => (
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-140px)] pr-0.5 custom-scrollbar">
            {menuItems.map((item) => {
                const Icon = item.icon;

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
            {/* 1. Desktop Sidebar */}
            <aside
                className={`hidden md:flex ${
                    isCollapsed ? 'w-16' : 'w-56'
                } bg-[#18181B] text-[#A1A1AA] border-r border-[#27272A] h-screen flex-col justify-between p-2.5 transition-all duration-200 select-none z-40 selection:bg-white/20 shrink-0`}
            >
                {/* Top Section */}
                <div className="flex flex-col gap-3 min-w-0">
                    {/* Brand Card (Accounting Administrator) with Dropdown */}
                    <div className="relative" ref={brandMenuRef}>
                        <div
                            onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                            className={`flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer ${
                                isBrandMenuOpen ? 'bg-white/[0.08]' : ''
                            } ${isCollapsed ? 'justify-center p-1.5' : ''}`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                {/* Sleek Neutral Squircle Icon */}
                                <div className="w-7 h-7 rounded-lg bg-[#27272A] border border-[#3F3F46] p-0.5 flex items-center justify-center shadow-md shrink-0">
                                    <img src={accountingLogo} alt="Accounting" className="w-full h-full object-contain" />
                                </div>

                                {!isCollapsed && (
                                    <div className="flex flex-col text-left min-w-0">
                                        <span className="font-bold text-white text-[13.5px] leading-snug tracking-tight truncate">
                                            Accounting
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
                            <div className="absolute top-11 left-0 w-52 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col text-[13px] text-[#D4D4D8] animate-in fade-in duration-150">
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

                                <button
                                    onClick={() => {
                                        setIsBrandMenuOpen(false);
                                        setIsSettingsModalOpen(true);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors text-left w-full cursor-pointer"
                                >
                                    <Cog6ToothIcon className="w-4 h-4 text-[#A1A1AA]" />
                                    <span>Tənzimləmələr</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsBrandMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2C2C2E] hover:text-white transition-colors text-left w-full cursor-pointer"
                                >
                                    <InformationCircleIcon className="w-4 h-4 text-[#A1A1AA]" />
                                    <span>Haqqında</span>
                                </button>

                                <div className="h-px bg-[#2C2C2E] my-1" />

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left w-full text-[#A1A1AA] cursor-pointer"
                                >
                                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                    <span>Çıxış</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation List */}
                    {renderNavList(false)}
                </div>

                {/* Bottom Actions (Kömək & Dəstək, Menyunu kiçilt) */}
                <div className="flex flex-col gap-0.5 pt-2 border-t border-[#27272A]/70 shrink-0">
                    <button
                        type="button"
                        onClick={() => window.open('https://altensor.com/support', '_blank')}
                        className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13px] font-normal text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white transition-colors text-left cursor-pointer ${
                            isCollapsed ? 'justify-center px-0 py-2' : ''
                        }`}
                        title={isCollapsed ? 'Kömək & Dəstək' : undefined}
                    >
                        <QuestionMarkCircleIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
                        {!isCollapsed && <span>Kömək & Dəstək</span>}
                    </button>

                    <button
                        onClick={() => {
                            const nextState = !isCollapsed;
                            setIsCollapsed(nextState);
                            if (onCollapseChange) onCollapseChange(nextState);
                        }}
                        className={`flex items-center gap-3 px-2.5 py-1.5 rounded-lg text-[13px] font-normal text-[#A1A1AA] hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer ${
                            isCollapsed ? 'justify-center px-0 py-2' : ''
                        }`}
                        title={isCollapsed ? 'Menyunu genişləndir' : 'Menyunu kiçilt'}
                    >
                        {isCollapsed ? (
                            <ChevronRightIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
                        ) : (
                            <>
                                <ChevronLeftIcon className="w-[18px] h-[18px] stroke-[1.75] shrink-0" />
                                <span>Menyunu kiçilt</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* 2. Mobile Off-Canvas Drawer */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                        onClick={() => setIsMobileOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative w-72 max-w-[85vw] bg-[#18181B] text-[#A1A1AA] border-r border-[#27272A] h-full flex flex-col justify-between p-4 z-50 shadow-2xl animate-in slide-in-from-left duration-200">
                        <div className="flex flex-col gap-4 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#27272A] border border-[#3F3F46] p-1 flex items-center justify-center shadow-md shrink-0">
                                        <img src={accountingLogo} alt="Accounting" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="font-bold text-white text-sm leading-tight">Accounting</span>
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

                            {/* Nav */}
                            {renderNavList(true)}
                        </div>

                        {/* Bottom */}
                        <div className="pt-3 border-t border-[#27272A]">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold w-full transition-colors cursor-pointer"
                            >
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                <span>Çıxış</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
        </>
    );
};

export default Sidebar;
