import React, { useState, useEffect } from 'react';
import { authService, companyService, accountsService } from '../api';
import { parseJwtToken } from '../utils';
import type { UserInfo } from '../utils';
import type { CompanyProfileDto, CompanyDefaultAccountsDto, AccountDto } from '../dto';
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
    CheckCircleIcon,
    ArrowPathIcon,
    ScaleIcon,
    CreditCardIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

export const SettingsPage: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // Active Tab
    const [activeTab, setActiveTab] = useState<'profile' | 'company'>('profile');

    // Toast
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Password Reset
    const [showPasswordBox, setShowPasswordBox] = useState(false);
    const [passwordStep, setPasswordStep] = useState<'request' | 'verify'>('request');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Company Settings State
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companySaving, setCompanySaving] = useState(false);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileDto>({
        id: '',
        name: '',
        taxNumber: '',
        baseCurrency: 'AZN',
        country: 'AZE',
        address: '',
        phone: '',
        email: '',
        legalForm: 'MMC',
        taxRegime: 'ƏDV Ödəyicisi',
        isVatPayer: true,
        vatRate: 18,
        fiscalYearStartMonth: 1,
        fiscalYearEndMonth: 12,
        logoUrl: '',
        directorName: '',
        chiefAccountantName: '',
        bankName: '',
        bankAccountNumber: '',
        iban: '',
        swiftBic: '',
        correspondentAccount: '',
    });
    const [defaultAccounts, setDefaultAccounts] = useState<CompanyDefaultAccountsDto>({
        defaultReceivableAccountId: '',
        defaultPayableAccountId: '',
        defaultStockAccountId: '',
        defaultGRNIAccountId: '',
        defaultCOGSAccountId: '',
        defaultRetainedEarningsAccountId: '',
        defaultInputVatAccountId: '',
        defaultOutputVatAccountId: '',
        defaultRevenueAccountId: '',
        defaultFXGainLossAccountId: '',
    });

    useEffect(() => {
        const token = authService.getAccessToken();
        if (token) {
            setUserInfo(parseJwtToken(token));
        }
        loadCompanyData();
    }, []);

    const loadCompanyData = async () => {
        setCompanyLoading(true);
        try {
            const [profileData, defAccData, accList] = await Promise.all([
                companyService.getCompanyProfile(),
                companyService.getDefaultAccounts(),
                accountsService.getAccounts().catch(() => []),
            ]);
            setCompanyProfile(profileData);
            setDefaultAccounts(defAccData);
            setAccounts(accList);
        } catch (err: any) {
            console.warn('Company settings load fallback:', err);
        } finally {
            setCompanyLoading(false);
        }
    };

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

    const handleSaveCompanyProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setCompanySaving(true);
        try {
            await companyService.updateCompanyProfile(companyProfile);
            await companyService.updateDefaultAccounts(defaultAccounts);
            showToast('Şirkət parametrləri və standart hesablar uğurla yadda saxlanıldı!', 'success');
        } catch (err: any) {
            const msg = err?.response?.data?.message || 'Parametrləri yadda saxlayarkən xəta baş verdi';
            showToast(msg, 'error');
        } finally {
            setCompanySaving(false);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        window.location.href = '/login';
    };

    return (
        <div className="space-y-6 font-sans max-w-5xl mx-auto animate-in fade-in duration-200">
            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border flex items-center gap-3 animate-in slide-in-from-top-2 duration-200 ${
                        toastMessage.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200 shadow-emerald-950/50'
                            : 'bg-rose-950/90 border-rose-500/30 text-rose-200 shadow-rose-950/50'
                    }`}
                >
                    {toastMessage.type === 'success' ? (
                        <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('settings.title', {}, 'Tənzimləmələr')}</h1>
                    <p className="text-xs text-[#94A3B8]">{t('settings.subtitle', {}, 'İstifadəçi profili, şirkət rekvizitləri və avtomatlaşdırılmış mühasibat hesabları')}</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141416] border border-[#27272A]">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === 'profile'
                                ? 'bg-[#27272A] text-white shadow-sm'
                                : 'text-[#A1A1AA] hover:text-white'
                        }`}
                    >
                        <UserCircleIcon className="w-4 h-4 text-emerald-400" />
                        <span>Hesab & Görünüş</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('company')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === 'company'
                                ? 'bg-[#27272A] text-white shadow-sm'
                                : 'text-[#A1A1AA] hover:text-white'
                        }`}
                    >
                        <BuildingOfficeIcon className="w-4 h-4 text-teal-400" />
                        <span>Şirkət & Hesablar</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: PROFILE & APPEARANCE */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="p-6 rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                {userInfo?.userName?.slice(0, 2).toUpperCase() || 'US'}
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white">{userInfo?.userName || 'User'}</h2>
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
                                <p className="text-xs font-bold text-white">{t('settings.loginPassword', {}, 'Giriş Şifrəsi')}</p>
                                <p className="text-[11px] text-[#71717A]">{t('settings.passwordDesc', {}, 'OTP ilə təhlükəsiz şifrə sıfırlanması')}</p>
                            </div>
                            <button
                                onClick={() => setShowPasswordBox(!showPasswordBox)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                {showPasswordBox ? t('common.close', {}, 'Bağla') : t('settings.changePassword', {}, 'Şifrəni Dəyiş')}
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
                                            {passwordLoading ? t('common.processing', {}, 'Göndərilir...') : t('auth.sendOtp', {}, 'Kodu Göndər')}
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleResetPassword} className="space-y-3">
                                        <input
                                            type="text"
                                            required
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value)}
                                            placeholder={t('auth.otpPlaceholder', {}, 'OTP Təsdiq Kodu')}
                                            className="w-full px-3 py-2 rounded-xl bg-[#12141A] border border-[#27272A] text-xs text-white"
                                        />
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={t('auth.newPasswordLabel', {}, 'Yeni Şifrə')}
                                            className="w-full px-3 py-2 rounded-xl bg-[#12141A] border border-[#27272A] text-xs text-white"
                                        />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t('auth.confirmPasswordLabel', {}, 'Yeni Şifrə Təkrarı')}
                                            className="w-full px-3 py-2 rounded-xl bg-[#12141A] border border-[#27272A] text-xs text-white"
                                        />
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                        >
                                            {passwordLoading ? t('common.saving', {}, 'Yenilənir...') : t('common.confirm', {}, 'Təsdiqlə və Yenilə')}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Appearance & 3 Themes */}
                    <div className="p-6 rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl space-y-4">
                        <div>
                            <h2 className="text-sm font-bold text-white tracking-tight">{t('settings.appearanceTitle', {}, 'Görünüş & Tema Tərcihləri')}</h2>
                            <p className="text-xs text-[#71717A]">
                                {t('settings.appearanceDesc', {}, 'Açıq (Light), Qaranlıq (Dark) və Gecə Mavisi (Midnight) temaları arasında seçim edin.')}
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
                                    <span className="text-xs text-[#D4D4D8] font-semibold">{t('settings.themeLight', {}, 'Açıq (Light)')}</span>
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
                                    <span className="text-xs text-[#D4D4D8] font-semibold">{t('settings.themeDark', {}, 'Qaranlıq (Dark)')}</span>
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
                                    <span className="text-xs text-[#D4D4D8] font-semibold">{t('settings.themeMidnight', {}, 'Gecə Mavisi (Midnight)')}</span>
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${theme === 'midnight' ? 'border-emerald-500 bg-emerald-500' : 'border-[#52525B]'}`}>
                                        {theme === 'midnight' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Language */}
                        <div className="pt-4 border-t border-[#27272A] space-y-2">
                            <label className="text-xs font-bold text-white">{t('settings.languageTitle', {}, 'İnterfeys Dili')}</label>
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
                            <h3 className="text-sm font-bold text-white">{t('nav.logout', {}, 'Sessiyadan Çıxış')}</h3>
                            <p className="text-xs text-[#71717A]">{t('auth.logoutConfirm', {}, 'Cari cihazdan etibarlı çıxış edin')}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            <span>{t('nav.logout', {}, 'Çıxış Et')}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* TAB 2: COMPANY PROFILE & DEFAULT GL ACCOUNTS */}
            {activeTab === 'company' && (
                <form onSubmit={handleSaveCompanyProfile} className="space-y-6">
                    {/* Company Legal Requisites Card */}
                    <div className="p-6 rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl space-y-5">
                        <div className="flex items-center gap-3 border-b border-[#27272A] pb-4">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <BuildingOfficeIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white tracking-tight">Şirkət Profili və Hüquqi Rekvizitlər</h2>
                                <p className="text-xs text-[#71717A]">
                                    Faktura, qaimə və maliyyə hesabatlarında çap olunacaq rəsmi rekvizitlər
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Şirkətin Rəsmi Adı *</label>
                                <input
                                    type="text"
                                    required
                                    value={companyProfile.name}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">VÖEN (Vergi Ödəyicisinin №) *</label>
                                <input
                                    type="text"
                                    required
                                    value={companyProfile.taxNumber}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, taxNumber: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white font-mono focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Hüquqi Forma</label>
                                <select
                                    value={companyProfile.legalForm}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, legalForm: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="MMC">MMC (Məhdud Məsuliyyətli Cəmiyyət)</option>
                                    <option value="ASC">ASC (Açıq Səhmdar Cəmiyyəti)</option>
                                    <option value="QSC">QSC (Qapalı Səhmdar Cəmiyyəti)</option>
                                    <option value="Fərdi Sahibkar">Fərdi Sahibkar</option>
                                    <option value="Filial">Xarici Müəssisənin Filialı</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Əsas Valyuta</label>
                                <select
                                    value={companyProfile.baseCurrency}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, baseCurrency: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none font-mono"
                                >
                                    <option value="AZN">AZN - Azərbaycan Manatı</option>
                                    <option value="USD">USD - ABŞ Dolları</option>
                                    <option value="EUR">EUR - Avro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Telefon</label>
                                <input
                                    type="text"
                                    value={companyProfile.phone || ''}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                                    placeholder="+994 12 000 00 00"
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Rəsmi E-poçt</label>
                                <input
                                    type="email"
                                    value={companyProfile.email || ''}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                                    placeholder="info@company.az"
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Hüquqi Ünvan</label>
                                <input
                                    type="text"
                                    value={companyProfile.address || ''}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                                    placeholder="Bakı ş., Nizami ray., ..."
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Direktor (Rəhbər)</label>
                                <input
                                    type="text"
                                    value={companyProfile.directorName || ''}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, directorName: e.target.value })}
                                    placeholder="Ad, Soyad"
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Baş Mühasib</label>
                                <input
                                    type="text"
                                    value={companyProfile.chiefAccountantName || ''}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, chiefAccountantName: e.target.value })}
                                    placeholder="Ad, Soyad"
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">ƏDV Dərəcəsi (%)</label>
                                <input
                                    type="number"
                                    value={companyProfile.vatRate}
                                    onChange={(e) => setCompanyProfile({ ...companyProfile, vatRate: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Bank Requisites Sub-section */}
                        <div className="pt-4 border-t border-[#27272A]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-3 flex items-center gap-2">
                                <CreditCardIcon className="w-4 h-4 text-emerald-400" />
                                <span>Bank Hesab Rekvizitləri</span>
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-[#71717A] mb-1">Xidmət Edən Bank</label>
                                    <input
                                        type="text"
                                        value={companyProfile.bankName || ''}
                                        onChange={(e) => setCompanyProfile({ ...companyProfile, bankName: e.target.value })}
                                        placeholder="Məs: Paşa Bank ASC"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#71717A] mb-1">Bank Hesab № (AZN)</label>
                                    <input
                                        type="text"
                                        value={companyProfile.bankAccountNumber || ''}
                                        onChange={(e) => setCompanyProfile({ ...companyProfile, bankAccountNumber: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white font-mono focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#71717A] mb-1">IBAN</label>
                                    <input
                                        type="text"
                                        value={companyProfile.iban || ''}
                                        onChange={(e) => setCompanyProfile({ ...companyProfile, iban: e.target.value })}
                                        placeholder="AZ00PASH0000..."
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white font-mono focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#71717A] mb-1">SWIFT / BIC</label>
                                    <input
                                        type="text"
                                        value={companyProfile.swiftBic || ''}
                                        onChange={(e) => setCompanyProfile({ ...companyProfile, swiftBic: e.target.value })}
                                        placeholder="PASHAZ22"
                                        className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white font-mono focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Standard GL Accounts Mapping Card */}
                    <div className="p-6 rounded-2xl bg-[#12141A] border border-[#27272A] shadow-xl space-y-5">
                        <div className="flex items-center gap-3 border-b border-[#27272A] pb-4">
                            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                <ScaleIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white tracking-tight">Standart Mühasibat Hesabları Şəbəkəsi</h2>
                                <p className="text-xs text-[#71717A]">
                                    Satış, anbar, vergi və alış əməliyyatlarında avtomatik jurnal yazılışları üçün tətbiq edilən standart Baş Kitab hesabları
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Receivables */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                    Debitor Borcları (Alıcılar - Məs: 211)
                                </label>
                                <select
                                    value={defaultAccounts.defaultReceivableAccountId || ''}
                                    onChange={(e) => setDefaultAccounts({ ...defaultAccounts, defaultReceivableAccountId: e.target.value || null })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Standart / Seçilməyib</option>
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Payables */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                    Kreditor Borcları (Təchizatçılar - Məs: 531)
                                </label>
                                <select
                                    value={defaultAccounts.defaultPayableAccountId || ''}
                                    onChange={(e) => setDefaultAccounts({ ...defaultAccounts, defaultPayableAccountId: e.target.value || null })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Standart / Seçilməyib</option>
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                    Mal-Material Ehtiyatları (Anbar - Məs: 201/205)
                                </label>
                                <select
                                    value={defaultAccounts.defaultStockAccountId || ''}
                                    onChange={(e) => setDefaultAccounts({ ...defaultAccounts, defaultStockAccountId: e.target.value || null })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Standart / Seçilməyib</option>
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Revenue */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                    Satış Gəlirləri Hesabı (Məs: 601)
                                </label>
                                <select
                                    value={defaultAccounts.defaultRevenueAccountId || ''}
                                    onChange={(e) => setDefaultAccounts({ ...defaultAccounts, defaultRevenueAccountId: e.target.value || null })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Standart / Seçilməyib</option>
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* COGS */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                    Satışın Maya Dəyəri Xərcləri (COGS - Məs: 701)
                                </label>
                                <select
                                    value={defaultAccounts.defaultCOGSAccountId || ''}
                                    onChange={(e) => setDefaultAccounts({ ...defaultAccounts, defaultCOGSAccountId: e.target.value || null })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Standart / Seçilməyib</option>
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Output VAT */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                    Satış üzrə Ödəniləcək ƏDV (Məs: 545)
                                </label>
                                <select
                                    value={defaultAccounts.defaultOutputVatAccountId || ''}
                                    onChange={(e) => setDefaultAccounts({ ...defaultAccounts, defaultOutputVatAccountId: e.target.value || null })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Standart / Seçilməyib</option>
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Input VAT */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                    Alış üzrə Əvəzləşdirilən ƏDV (Məs: 241)
                                </label>
                                <select
                                    value={defaultAccounts.defaultInputVatAccountId || ''}
                                    onChange={(e) => setDefaultAccounts({ ...defaultAccounts, defaultInputVatAccountId: e.target.value || null })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Standart / Seçilməyib</option>
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Retained Earnings */}
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                    Bölüşdürülməmiş Mənfəət / Zərər (Məs: 343)
                                </label>
                                <select
                                    value={defaultAccounts.defaultRetainedEarningsAccountId || ''}
                                    onChange={(e) => setDefaultAccounts({ ...defaultAccounts, defaultRetainedEarningsAccountId: e.target.value || null })}
                                    className="w-full px-3 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value="">Standart / Seçilməyib</option>
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.code} - {acc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-[#27272A] flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={companySaving}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                            >
                                {companySaving ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                        <span>Saxlanılır...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="w-4 h-4" />
                                        <span>Parametrləri Yadda Saxla</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default SettingsPage;
