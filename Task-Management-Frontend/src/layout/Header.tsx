import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api';
import {
    MagnifyingGlassIcon,
    BellIcon,
    SunIcon,
    MoonIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';

interface HeaderProps {
    userName?: string;
    userRole?: string;
    userEmail?: string;
    userAvatar?: string;
    notificationCount?: number;
    notifications?: Array<{ id: number; message: string; createdAt: string; isRead: boolean }>;
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    userName = 'User',
    userRole = 'Employee',
    userEmail = '',
    userAvatar,
    notificationCount: propsNotificationCount = 0,
    notifications: propNotifications = [],
    onMenuClick,
}) => {
    const { notifications: contextNotifications, unreadCount: contextUnreadCount, markAsRead } = useNotifications();
    const { isDark, toggleTheme } = useTheme();
    const { t, language, setLanguage, languages } = useLanguage();
    const navigate = useNavigate();

    const notifications = contextNotifications.length > 0 ? contextNotifications : propNotifications;
    const sortedNotifications = [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const notificationCount = contextUnreadCount !== undefined ? contextUnreadCount : (propsNotificationCount || 0);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut: Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchDropdown(false);
                setSearchFocused(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifDropdown(false);
            }
            if (userRef.current && !userRef.current.contains(e.target as Node)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        authService.clearToken();
        navigate('/login');
    };

    const handleSearchSubmit = (query: string) => {
        if (!query.trim()) return;
        setShowSearchDropdown(false);
        navigate(`/tasks?search=${encodeURIComponent(query.trim())}`);
    };

    return (
        <header
            className={`flex shrink-0 items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors h-14 border-b ${
                isDark
                    ? 'bg-[#121214]/90 backdrop-blur-md border-[#27272A] text-[#F4F4F5]'
                    : 'bg-white/90 backdrop-blur-md border-[#E2E8F0] text-slate-900 shadow-xs'
            }`}
        >
            {/* Left: Mobile Toggle & Global Search */}
            <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
                {/* Mobile hamburger */}
                <button
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                    onClick={() => {
                        if (onMenuClick) onMenuClick();
                        window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
                    }}
                    aria-label="Naviqasiya menyusunu açın"
                    type="button"
                >
                    <Bars3Icon className="w-5 h-5" />
                </button>

                {/* Search Bar */}
                <div ref={searchRef} className="relative w-full max-w-md">
                    <div
                        className={`flex items-center rounded-xl h-9 px-3 transition-all duration-200 ${
                            isDark
                                ? searchFocused
                                    ? 'bg-[#1C1C1E] border border-blue-500/50 shadow-sm'
                                    : 'bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46]'
                                : searchFocused
                                ? 'bg-white border border-blue-500 ring-2 ring-blue-100 shadow-sm'
                                : 'bg-[#F1F5F9] border border-transparent hover:border-slate-300'
                        }`}
                    >
                        <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] shrink-0" />
                        <input
                            ref={searchInputRef}
                            className={`flex-1 bg-transparent text-xs outline-none border-none focus:ring-0 px-2.5 ${
                                isDark ? 'text-white placeholder:text-[#71717A]' : 'text-slate-900 placeholder:text-slate-400'
                            }`}
                            placeholder={t('nav.searchPlaceholder', {}, 'Tapşırıqları, iş qruplarını axtar... (⌘K)')}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                setSearchFocused(true);
                                setShowSearchDropdown(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearchSubmit(searchQuery);
                            }}
                        />
                    </div>

                    {/* Search Dropdown */}
                    {showSearchDropdown && (
                        <div
                            className={`absolute top-full mt-1.5 left-0 right-0 rounded-2xl border overflow-hidden z-50 animate-in fade-in duration-100 ${
                                isDark ? 'bg-[#1C1C1E] border-[#2C2C2E] text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                            }`}
                        >
                            <div className={`px-3 py-2 border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? 'border-[#2C2C2E] text-[#71717A]' : 'border-slate-100 text-slate-500'}`}>
                                {t('common.quickSearches', {}, 'Qısa Axtarışlar')}
                            </div>
                            <div className="p-1">
                                {[
                                    t('tasks.allTasksTitle', {}, 'Bütün aktiv tapşırıqlar'),
                                    t('common.overdue', {}, 'Gecikmiş tapşırıqlar'),
                                    t('nav.workgroups', {}, 'İş Qrupları'),
                                    t('nav.leaderboard', {}, 'Liderlər lövhəsi')
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSearchSubmit(item)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                                            isDark ? 'text-[#D4D4D8] hover:bg-[#2C2C2E] hover:text-white' : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                    >
                                        <MagnifyingGlassIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                        <span>{item}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Theme, Notifications, User Profile */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    type="button"
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                        isDark ? 'hover:bg-white/10 text-[#A1A1AA] hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                    title={isDark ? t('settings.lightTheme', {}, 'İşıqlı Rejim') : t('settings.darkTheme', {}, 'Qaranlıq Rejim')}
                >
                    {isDark ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-slate-500" />}
                </button>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                        type="button"
                        className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                            isDark ? 'hover:bg-white/10 text-[#A1A1AA] hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        }`}
                        title={t('nav.notifications', {}, 'Bildirişlər')}
                    >
                        <BellIcon className="w-4 h-4" />
                        {notificationCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                        )}
                    </button>

                    {showNotifDropdown && (
                        <div
                            className={`absolute top-full mt-2 right-0 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in duration-100 ${
                                isDark ? 'bg-[#1C1C1E] border-[#2C2C2E] text-white' : 'bg-white border-slate-200 text-slate-900'
                            }`}
                        >
                            <div className={`p-3 border-b flex items-center justify-between ${isDark ? 'border-[#2C2C2E]' : 'border-slate-100'}`}>
                                <span className="text-xs font-bold">{t('nav.notifications', {}, 'Bildirişlər')}</span>
                                <Link
                                    to="/notifications"
                                    onClick={() => setShowNotifDropdown(false)}
                                    className="text-[11px] text-blue-400 hover:underline font-semibold"
                                >
                                    {t('common.viewAll', {}, 'Hamısına bax')}
                                </Link>
                            </div>

                            <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                                {sortedNotifications.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-slate-500">
                                        {t('notifications.noNotifications', {}, 'Yeni bildiriş yoxdur')}
                                    </div>
                                ) : (
                                    sortedNotifications.slice(0, 5).map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => {
                                                markAsRead(n.id);
                                                setShowNotifDropdown(false);
                                                navigate('/notifications');
                                            }}
                                            className={`p-3 text-xs flex flex-col gap-1 transition-colors cursor-pointer ${
                                                !n.isRead
                                                    ? isDark ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-blue-50/50 hover:bg-blue-50'
                                                    : isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <p className={`font-medium ${!n.isRead ? (isDark ? 'text-white' : 'text-slate-900 font-semibold') : 'text-slate-400'}`}>
                                                {n.message}
                                            </p>
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(n.createdAt).toLocaleDateString(language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userRef}>
                    <button
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        type="button"
                        className={`flex items-center gap-2 p-1 pl-2 rounded-xl transition-all cursor-pointer ${
                            isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        }`}
                    >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
                            {userAvatar ? (
                                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                                userName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className={`text-xs font-semibold hidden sm:inline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {userName}
                        </span>
                    </button>

                    {showUserDropdown && (
                        <div
                            className={`absolute top-full mt-2 right-0 w-52 rounded-2xl border shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 text-xs animate-in fade-in duration-100 ${
                                isDark ? 'bg-[#1C1C1E] border-[#2C2C2E] text-[#D4D4D8]' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                        >
                            <div className="px-3 py-2 border-b border-white/5 flex flex-col">
                                <span className="font-bold text-white text-xs">{userName}</span>
                                <span className="text-[10px] text-[#A1A1AA]">{userEmail || userRole}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowUserDropdown(false);
                                    window.dispatchEvent(new CustomEvent('open-settings-modal'));
                                }}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors w-full text-left cursor-pointer ${
                                    isDark ? 'hover:bg-[#2C2C2E] hover:text-white text-[#D4D4D8]' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                            >
                                <Cog6ToothIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{t('nav.settings', {}, 'Tənzimləmələr')}</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                type="button"
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-rose-500 transition-colors w-full text-left cursor-pointer`}
                            >
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                <span>{t('nav.logout', {}, 'Çıxış et')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
