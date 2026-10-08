import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api';
import { parseJwtToken } from '../utils';
import type { UserInfo } from '../utils';
import {
    MagnifyingGlassIcon,
    SunIcon,
    MoonIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    Bars3Icon,
    ChevronDownIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import accountingLogo from '../assets/Accounting-Logo.png';

interface HeaderProps {
    userName?: string;
    userRole?: string;
    userEmail?: string;
    onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    userName: propUserName,
    userRole: propUserRole,
    userEmail: propUserEmail,
    onMenuClick,
}) => {
    const { isDark, toggleTheme } = useTheme();
    const { t, language, setLanguage, languages } = useLanguage();
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showLangDropdown, setShowLangDropdown] = useState(false);

    const userRef = useRef<HTMLDivElement>(null);
    const langRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = authService.getAccessToken();
        if (token) {
            setUserInfo(parseJwtToken(token));
        }
    }, []);

    // Ctrl+K shortcut
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

    // Outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userRef.current && !userRef.current.contains(e.target as Node)) {
                setShowUserDropdown(false);
            }
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setShowLangDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setShowUserDropdown(false);
        await authService.logout();
        navigate('/login', { replace: true });
    };

    const openSettings = () => {
        setShowUserDropdown(false);
        window.dispatchEvent(new CustomEvent('open-settings-modal'));
    };

    const displayName = propUserName || userInfo?.userName || 'User';
    const displayEmail = propUserEmail || userInfo?.email || '';
    const displayRole = propUserRole || userInfo?.roles?.[0] || 'User';

    return (
        <header className="h-14 border-b border-[#27272A] bg-[#121214] flex items-center justify-between px-4 sticky top-0 z-30 font-sans">
            {/* Left: Mobile Toggle & Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                <button
                    onClick={() => {
                        if (onMenuClick) onMenuClick();
                        else window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
                    }}
                    className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 lg:hidden"
                >
                    <Bars3Icon className="w-5 h-5" />
                </button>

                <div className="relative w-full max-w-xs">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`${t('common.search', {}, 'Axtarış...')} (Ctrl+K)`}
                        className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#71717A] font-mono pointer-events-none hidden sm:inline">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* Language Dropdown */}
                <div ref={langRef} className="relative">
                    <button
                        onClick={() => setShowLangDropdown(!showLangDropdown)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <span>{language === 'az' ? '🇦🇿 AZ' : language === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}</span>
                        <ChevronDownIcon className="w-3 h-3" />
                    </button>

                    {showLangDropdown && (
                        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-[#18181B] border border-[#27272A] shadow-xl py-1 z-50 text-xs animate-in fade-in duration-150">
                            {languages.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => {
                                        setLanguage(l.code);
                                        setShowLangDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer ${
                                        language === l.code ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-[#D4D4D8]'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{l.flag}</span>
                                        <span>{l.name}</span>
                                    </span>
                                    {language === l.code && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Theme Toggle Button */}
                <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title={isDark ? t('settings.themeLight', {}, 'Açıq rejim') : t('settings.themeDark', {}, 'Qaranlıq rejim')}
                >
                    {isDark ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-indigo-400" />}
                </button>

                {/* User Menu */}
                <div ref={userRef} className="relative">
                    <button
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                        className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="hidden sm:block text-left text-xs leading-tight">
                            <p className="font-semibold text-white truncate max-w-[120px]">{displayName}</p>
                            <p className="text-[10px] text-[#71717A] truncate max-w-[120px]">{displayRole}</p>
                        </div>
                        <ChevronDownIcon className="w-3 h-3 text-[#71717A] hidden sm:block" />
                    </button>

                    {showUserDropdown && (
                        <div className="absolute right-0 mt-1 w-56 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl py-1 z-50 text-xs animate-in fade-in duration-150">
                            <div className="px-4 py-3 border-b border-[#27272A]">
                                <p className="font-bold text-white truncate">{displayName}</p>
                                <p className="text-[11px] text-[#71717A] truncate">{displayEmail}</p>
                            </div>

                            <div className="py-1">
                                <button
                                    onClick={openSettings}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[#D4D4D8] hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                                >
                                    <Cog6ToothIcon className="w-4 h-4 text-[#A1A1AA]" />
                                    <span>{t('nav.settings', {}, 'Tənzimləmələr')}</span>
                                </button>
                            </div>

                            <div className="pt-1 border-t border-[#27272A]">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors font-semibold cursor-pointer"
                                >
                                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                    <span>{t('nav.logout', {}, 'Çıxış')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
