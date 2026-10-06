import React, { useState, useEffect } from 'react';
import { authService } from '../api';
import { parseJwtToken } from '../utils';
import type { UserInfo } from '../utils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import CustomSelect from './CustomSelect';
import {
    XMarkIcon,
    KeyIcon,
    ArrowRightOnRectangleIcon,
    Cog6ToothIcon,
    SwatchIcon,
    BuildingOfficeIcon,
    UserCircleIcon,
    CheckIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'profile' | 'preferences' | 'general' | 'brand';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // Password Reset Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState<'request' | 'verify'>('request');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            const token = authService.getAccessToken();
            if (token) {
                const user = parseJwtToken(token);
                setUserInfo(user);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSendOtp = async () => {
        if (!userInfo?.email) return;
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess('');
        try {
            await authService.sendResetOtp(userInfo.email, userInfo.tenantSlug);
            setPasswordSuccess('Birdəfəlik təsdiq kodu (OTP) e-poçtunuza göndərildi.');
            setPasswordStep('verify');
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'OTP kodu göndərilərkən xəta baş verdi.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError('Şifrələr uyğun gəlmir!');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Şifrə minimum 6 simvol olmalıdır!');
            return;
        }
        setPasswordLoading(true);
        setPasswordError('');
        try {
            await authService.resetPassword({
                email: userInfo?.email || '',
                tenantSlug: userInfo?.tenantSlug,
                otp: otpCode,
                newPassword,
                confirmPassword,
            });
            setPasswordSuccess('Şifrəniz uğurla yeniləndi!');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordStep('request');
                setOtpCode('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordSuccess('');
            }, 2000);
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Şifrə yenilənərkən xəta baş verdi.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        window.location.href = '/login';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#121214] border border-[#27272A] w-full max-w-4xl h-[620px] rounded-2xl shadow-2xl flex overflow-hidden text-white font-sans">
                {/* ─── Left Sidebar Navigation ─── */}
                <div className="w-56 bg-[#18181B] border-r border-[#27272A] flex flex-col justify-between p-4 flex-shrink-0">
                    <div className="space-y-6">
                        {/* Header Branding */}
                        <div className="flex items-center gap-2.5 px-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                                ACC
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white tracking-wide">Accounting</h3>
                                <p className="text-[10px] text-[#A1A1AA]">Tənzimləmələr</p>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A] px-3 pb-1">
                                Hesab
                            </p>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'profile'
                                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <UserCircleIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{t('settings.profileTab', {}, 'Profil')}</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'preferences'
                                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <SwatchIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{t('settings.preferences', {}, 'Tərcihlər & Tema')}</span>
                            </button>

                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A] px-3 pt-3 pb-1">
                                Sistem
                            </p>
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'general'
                                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Cog6ToothIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{t('settings.general', {}, 'Ümumi')}</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('brand')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'brand'
                                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <BuildingOfficeIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{t('settings.brandLogo', {}, 'Brend & Şirkət')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Bottom Logout */}
                    <div className="pt-4 border-t border-[#27272A]">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            <span>{t('nav.logout', {}, 'Çıxış et')}</span>
                        </button>
                    </div>
                </div>

                {/* ─── Right Content Area ─── */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#121214] overflow-y-auto relative">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A] sticky top-0 bg-[#121214]/90 backdrop-blur-md z-20">
                        <div>
                            <h2 className="text-base font-extrabold text-white tracking-tight">
                                {activeTab === 'profile' && t('settings.profileTab', {}, 'Profil Tənzimləmələri')}
                                {activeTab === 'preferences' && t('settings.preferences', {}, 'Görünüş & Tema Tərcihləri')}
                                {activeTab === 'general' && t('settings.general', {}, 'Ümumi Parametrlər')}
                                {activeTab === 'brand' && t('settings.brandLogo', {}, 'Şirkət & Workspace')}
                            </h2>
                            <p className="text-xs text-[#71717A]">
                                {activeTab === 'profile' && 'Profil və təhlükəsizlik məlumatlarınızı idarə edin.'}
                                {activeTab === 'preferences' && 'Açıq, qaranlıq və gecə mavisi temaları arasında seçim edin.'}
                                {activeTab === 'general' && 'Sistem dili və regional parametrlər.'}
                                {activeTab === 'brand' && 'Təşkilat və cari abunəlik detalları.'}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tab Contents */}
                    <div className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 max-w-xl">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#18181B] border border-[#27272A]">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                        {userInfo?.userName?.slice(0, 2).toUpperCase() || 'US'}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">{userInfo?.userName || 'İstifadəçi'}</h3>
                                        <p className="text-xs text-[#71717A]">{userInfo?.email}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {userInfo?.roles?.[0] || 'User'}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                                                {userInfo?.tenantName || userInfo?.tenantSlug || 'Workspace'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Security / Password */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Təhlükəsizlik</h4>
                                    <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                                                <KeyIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">Giriş Şifrəsi</p>
                                                <p className="text-[11px] text-[#71717A]">Şifrənizi təhlükəsiz OTP ilə yeniləyin</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowPasswordModal(true);
                                                setPasswordStep('request');
                                                setPasswordError('');
                                                setPasswordSuccess('');
                                            }}
                                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                                        >
                                            Şifrəni Yenilə
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-tight">{t('settings.appearanceTheme', {}, 'Görünüş & Tema')}</h3>
                                    <p className="text-xs text-[#71717A]">
                                        {t('settings.appearanceSubtitle', {}, 'Açıq, qaranlıq və gecə mavisi temaları arasında seçim edin.')}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                                    {/* 1. Light Theme Card */}
                                    <div
                                        onClick={() => setTheme('light')}
                                        className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                                            theme === 'light'
                                                ? 'border-emerald-500 bg-[#1C1C1E] shadow-lg ring-1 ring-emerald-500/40'
                                                : 'border-[#27272A] bg-[#141416] hover:border-[#3F3F46]'
                                        }`}
                                    >
                                        <div className="bg-white rounded-lg p-2 h-16 border border-zinc-200 flex flex-col justify-between overflow-hidden shadow-xs">
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded bg-emerald-600 text-[6px] text-white flex items-center justify-center font-bold">ACC</span>
                                                <span className="text-[9px] font-bold text-zinc-900">Accounting</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-xs text-[#D4D4D8] font-semibold">{t('settings.lightTheme', {}, 'Açıq (Light)')}</span>
                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'light' ? 'border-emerald-500 bg-emerald-500' : 'border-[#52525B]'}`}>
                                                {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Dark Theme Card */}
                                    <div
                                        onClick={() => setTheme('dark')}
                                        className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                                            theme === 'dark'
                                                ? 'border-emerald-500 bg-[#1C1C1E] shadow-lg ring-1 ring-emerald-500/40'
                                                : 'border-[#27272A] bg-[#141416] hover:border-[#3F3F46]'
                                        }`}
                                    >
                                        <div className="bg-[#18181B] rounded-lg p-2 h-16 border border-[#27272A] flex flex-col justify-between overflow-hidden shadow-xs">
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded bg-emerald-600 text-[6px] text-white flex items-center justify-center font-bold">ACC</span>
                                                <span className="text-[9px] font-bold text-white">Accounting</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-xs text-[#D4D4D8] font-semibold">{t('settings.darkTheme', {}, 'Qaranlıq (Dark)')}</span>
                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'dark' ? 'border-emerald-500 bg-emerald-500' : 'border-[#52525B]'}`}>
                                                {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Midnight Theme Card */}
                                    <div
                                        onClick={() => setTheme('midnight')}
                                        className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                                            theme === 'midnight'
                                                ? 'border-emerald-500 bg-[#1C1C1E] shadow-lg ring-1 ring-emerald-500/40'
                                                : 'border-[#27272A] bg-[#141416] hover:border-[#3F3F46]'
                                        }`}
                                    >
                                        <div className="bg-[#0F172A] rounded-lg p-2 h-16 border border-[#334155] flex flex-col justify-between overflow-hidden shadow-xs">
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-3 h-3 rounded bg-emerald-600 text-[6px] text-white flex items-center justify-center font-bold">ACC</span>
                                                <span className="text-[9px] font-bold text-white">Accounting</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-xs text-[#D4D4D8] font-semibold">{t('settings.midnightTheme', {}, 'Gecə Mavisi (Midnight)')}</span>
                                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'midnight' ? 'border-emerald-500 bg-emerald-500' : 'border-[#52525B]'}`}>
                                                {theme === 'midnight' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Language Selector */}
                                <div className="pt-4 border-t border-[#27272A] space-y-2">
                                    <label className="text-xs font-bold text-white">İnterfeys Dili</label>
                                    <div className="w-64">
                                        <CustomSelect
                                            value={language}
                                            onChange={(val) => setLanguage(val as any)}
                                            options={[
                                                { value: 'az', label: 'Azərbaycan dili (AZ)' },
                                                { value: 'en', label: 'English (EN)' },
                                                { value: 'ru', label: 'Русский (RU)' },
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className="space-y-4 max-w-xl">
                                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-2">
                                    <p className="text-xs font-bold text-white">Accounting Modul Versiyası</p>
                                    <p className="text-xs text-[#71717A]">Altensor ERP / Accounting Enterprise v1.0.0</p>
                                    <p className="text-[11px] text-[#A1A1AA] pt-1">
                                        API Endpoint: <span className="font-mono text-emerald-400">https://api-accounting.altensor.com/api</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Brand Tab */}
                        {activeTab === 'brand' && (
                            <div className="space-y-4 max-w-xl">
                                <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-2">
                                    <p className="text-xs font-bold text-white">Workspace Detalları</p>
                                    <div className="text-xs text-[#A1A1AA] space-y-1">
                                        <div>Şirkət: <span className="text-white font-medium">{userInfo?.tenantName || 'Altensor Workspace'}</span></div>
                                        <div>Slug: <span className="text-white font-medium">{userInfo?.tenantSlug || 'default'}</span></div>
                                        <div>Status: <span className="text-emerald-400 font-medium">{userInfo?.tenantStatus || 'Active'}</span></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Password Reset Modal Overlay */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
                    <div className="bg-[#18181B] border border-[#27272A] w-full max-w-md rounded-2xl p-6 space-y-4 text-white">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold">Şifrəni Yenilə</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-[#71717A] hover:text-white"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                <span>{passwordError}</span>
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                                <CheckIcon className="w-4 h-4 flex-shrink-0" />
                                <span>{passwordSuccess}</span>
                            </div>
                        )}

                        {passwordStep === 'request' ? (
                            <div className="space-y-4">
                                <p className="text-xs text-[#A1A1AA]">
                                    <span className="text-white font-medium">{userInfo?.email}</span> ünvanına birdəfəlik təsdiq kodu göndəriləcək.
                                </p>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={passwordLoading}
                                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Göndərilir...' : 'Kodu Göndər'}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-3">
                                <div>
                                    <label className="text-xs text-[#A1A1AA]">Təsdiq Kodu (OTP)</label>
                                    <input
                                        type="text"
                                        required
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        placeholder="6 rəqəmli kod"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-white text-xs focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[#A1A1AA]">Yeni Şifrə</label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-white text-xs focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-[#A1A1AA]">Yeni Şifrənin Təkrarı</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full mt-1 px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-white text-xs focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 mt-2"
                                >
                                    {passwordLoading ? 'Yenilənir...' : 'Təsdiqlə və Yenilə'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsModal;
