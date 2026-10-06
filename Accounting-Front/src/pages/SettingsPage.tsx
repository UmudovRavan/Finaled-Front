import React, { useState, useEffect } from 'react';
import { authService } from '../api';
import { parseJwtToken } from '../utils';
import type { UserInfo } from '../utils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import CustomSelect from '../components/CustomSelect';
import {
    SwatchIcon,
    UserCircleIcon,
    BuildingOfficeIcon,
    ArrowRightOnRectangleIcon,
    KeyIcon,
    CheckIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // Password Reset
    const [showPasswordBox, setShowPasswordBox] = useState(false);
    const [passwordStep, setPasswordStep] = useState<'request' | 'verify'>('request');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        const token = authService.getAccessToken();
        if (token) {
            setUserInfo(parseJwtToken(token));
        }
    }, []);

    const handleSendOtp = async () => {
        if (!userInfo?.email) return;
        setPasswordLoading(true);
        setPasswordError('');
        try {
            await authService.sendResetOtp(userInfo.email, userInfo.tenantSlug);
            setPasswordSuccess('OTP kod e-poçtunuza göndərildi.');
            setPasswordStep('verify');
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Kod göndərilərkən xəta baş verdi.');
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
                setShowPasswordBox(false);
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
        <div className="space-y-6 font-sans max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Tənzimləmələr (Settings)</h1>
                <p className="text-xs text-[#94A3B8]">Görünüş, dil, istifadəçi profili və şirkət parametrləri</p>
            </div>

            {/* Profile Card */}
            <div className="p-6 rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {userInfo?.userName?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white">{userInfo?.userName || 'İstifadəçi'}</h2>
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

                <div className="pt-4 border-t border-[#27272A] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-white">Giriş Şifrəsi</p>
                        <p className="text-[11px] text-[#71717A]">OTP ilə təhlükəsiz şifrə sıfırlanması</p>
                    </div>
                    <button
                        onClick={() => setShowPasswordBox(!showPasswordBox)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                    >
                        {showPasswordBox ? 'Bağla' : 'Şifrəni Dəyiş'}
                    </button>
                </div>

                {/* Password reset box */}
                {showPasswordBox && (
                    <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                        {passwordError && (
                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                                {passwordError}
                            </div>
                        )}
                        {passwordSuccess && (
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                                {passwordSuccess}
                            </div>
                        )}

                        {passwordStep === 'request' ? (
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#A1A1AA]">{userInfo?.email} ünvanına kod göndəriləcək</span>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={passwordLoading}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Göndərilir...' : 'Kodu Göndər'}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="OTP Təsdiq Kodu"
                                    className="w-full px-3 py-2 rounded-xl bg-[#12141A] border border-[#27272A] text-xs text-white"
                                />
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Yeni Şifrə"
                                    className="w-full px-3 py-2 rounded-xl bg-[#12141A] border border-[#27272A] text-xs text-white"
                                />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Yeni Şifrə Təkrarı"
                                    className="w-full px-3 py-2 rounded-xl bg-[#12141A] border border-[#27272A] text-xs text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                >
                                    {passwordLoading ? 'Yenilənir...' : 'Təsdiqlə və Yenilə'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>

            {/* Appearance & 3 Themes */}
            <div className="p-6 rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl space-y-4">
                <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">Görünüş & Tema Tərcihləri</h2>
                    <p className="text-xs text-[#71717A]">
                        Açıq (Light), Qaranlıq (Dark) və Gecə Mavisi (Midnight) temaları arasında seçim edin.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                    {/* Light */}
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
                            <span className="text-xs text-[#D4D4D8] font-semibold">Açıq (Light)</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'light' ? 'border-emerald-500 bg-emerald-500' : 'border-[#52525B]'}`}>
                                {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                        </div>
                    </div>

                    {/* Dark */}
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
                            <span className="text-xs text-[#D4D4D8] font-semibold">Qaranlıq (Dark)</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'dark' ? 'border-emerald-500 bg-emerald-500' : 'border-[#52525B]'}`}>
                                {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                        </div>
                    </div>

                    {/* Midnight */}
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
                            <span className="text-xs text-[#D4D4D8] font-semibold">Gecə Mavisi (Midnight)</span>
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'midnight' ? 'border-emerald-500 bg-emerald-500' : 'border-[#52525B]'}`}>
                                {theme === 'midnight' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Language */}
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

            {/* Logout */}
            <div className="p-6 rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white">Sessiyadan Çıxış</h3>
                    <p className="text-xs text-[#71717A]">Cari cihazdan etibarlı çıxış edin</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span>Çıxış Et</span>
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
