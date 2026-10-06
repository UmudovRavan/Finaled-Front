import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api';
import { useAuth, useTheme } from '../context';
import { useLanguage } from '../context/LanguageContext';
import { isTokenExpired } from '../utils';
import type { AxiosError } from 'axios';
import accountingLogo from '../assets/Accounting-Logo.png';
import accountingHeroPreview from '../assets/accounting_hero_preview.png';
import {
    SunIcon,
    MoonIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeSlashIcon,
    BuildingOffice2Icon,
    EnvelopeIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, authChecked } = useAuth();
    const { theme, isDark, toggleTheme } = useTheme();
    const { t, language, setLanguage, languages } = useLanguage();

    const isLight = theme === 'light';
    const isMidnight = theme === 'midnight';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        tenantSlug: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    // Read initial tenantSlug from URL query string or localStorage
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryTenant = params.get('tenant') || params.get('tenantSlug');
        const savedTenant = authService.getLastTenantSlug();

        if (queryTenant) {
            setFormData((prev) => ({ ...prev, tenantSlug: queryTenant }));
        } else if (savedTenant) {
            setFormData((prev) => ({ ...prev, tenantSlug: savedTenant }));
        }

        if (params.get('expired') === 'true') {
            setInfoMessage('Sessiyanızın vaxtı bitmişdir. Zəhmət olmasa yenidən daxil olun.');
        }
    }, [location.search]);

    useEffect(() => {
        const token = authService.getAccessToken();
        if (authChecked && isAuthenticated && token && !isTokenExpired(token)) {
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [authChecked, isAuthenticated, navigate, location]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setInfoMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInfoMessage(null);

        const cleanTenantSlug = formData.tenantSlug.trim();
        const cleanEmail = formData.email.trim();

        if (!cleanTenantSlug) {
            setError('Zəhmət olmasa Şirkət Kodunu (Tenant Slug) qeyd edin.');
            setLoading(false);
            return;
        }

        if (!cleanEmail) {
            setError('Zəhmət olmasa E-poçt ünvanınızı qeyd edin.');
            setLoading(false);
            return;
        }

        try {
            const response = await authService.login({
                email: cleanEmail,
                password: formData.password,
                tenantSlug: cleanTenantSlug,
            });

            if (response.accessToken) {
                login(response);
                navigate('/dashboard', { replace: true });
            } else {
                setError('Token əldə olunmadı.');
            }
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string; title?: string; error?: string }>;
            const serverMessage =
                axiosError.response?.data?.message ||
                axiosError.response?.data?.title ||
                axiosError.response?.data?.error;

            if (axiosError.response?.status === 401) {
                setError(serverMessage || 'E-poçt, şifrə və ya şirkət kodu yanlışdır.');
            } else if (axiosError.response?.status === 403) {
                setError(serverMessage || 'Şirkətinizin hesabı dondurulub və ya bu modula icazəniz yoxdur.');
            } else if (axiosError.code === 'ERR_NETWORK') {
                setError('Auth Service ilə əlaqə qurulmadı. Zəhmət olmasa internet bağlantınızı yoxlayın.');
            } else {
                setError(serverMessage || 'Giriş zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen w-screen overflow-x-hidden flex font-sans transition-colors duration-300 ${
                isLight
                    ? 'bg-[#F8FAFC] text-[#0F172A] selection:bg-emerald-100 selection:text-emerald-900'
                    : isMidnight
                    ? 'bg-[#0B0F19] text-[#F8FAFC] selection:bg-emerald-500/30 selection:text-white'
                    : 'bg-[#08090C] text-white selection:bg-emerald-500/30 selection:text-white'
            }`}
        >
            {/* Top Right Floating Language and Theme Switcher */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-2.5">
                {/* Language Switcher */}
                <div
                    className={`flex items-center rounded-xl p-1 border backdrop-blur-md transition-colors ${
                        isLight
                            ? 'bg-white/90 border-slate-200 shadow-sm'
                            : isMidnight
                            ? 'bg-[#0E1526]/80 border-slate-800'
                            : 'bg-[#121214]/80 border-[#27272A]'
                    }`}
                >
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => setLanguage(lang.code)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                language === lang.code
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : isLight
                                    ? 'text-slate-600 hover:text-slate-900'
                                    : 'text-[#71717A] hover:text-white'
                            }`}
                        >
                            {lang.code.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Theme Toggle */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className={`p-2 rounded-xl border backdrop-blur-md transition-all cursor-pointer ${
                        isLight
                            ? 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
                            : isMidnight
                            ? 'bg-[#0E1526]/80 border-slate-800 text-slate-300 hover:text-white'
                            : 'bg-[#121214]/80 border-[#27272A] text-[#A1A1AA] hover:text-white'
                    }`}
                    title={isLight ? 'Qaranlıq Rejim' : 'İşıqlı Rejim'}
                >
                    {isDark ? (
                        <SunIcon className="w-4 h-4 text-amber-400" />
                    ) : (
                        <MoonIcon className="w-4 h-4 text-indigo-400" />
                    )}
                </button>
            </div>

            {/* Left Side: Ambient Branding & Accounting ERP Visual Preview */}
            <div
                className={`hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden border-r transition-colors duration-300 ${
                    isLight
                        ? 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 border-slate-200'
                        : isMidnight
                        ? 'bg-[#0E1526] border-slate-800'
                        : 'bg-[#0C0E14] border-white/10'
                }`}
            >
                {/* Ambient Halo Glow */}
                <div
                    className={`blob-atmosphere -top-20 -left-20 w-96 h-96 ${
                        isLight ? 'opacity-20 bg-emerald-200' : 'opacity-40'
                    }`}
                ></div>
                <div
                    className={`blob-atmosphere -bottom-20 -right-20 w-96 h-96 ${
                        isLight ? 'opacity-15 bg-teal-200' : 'opacity-30'
                    }`}
                ></div>

                <div className="z-10 w-full max-w-xl flex flex-col gap-6 pt-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 w-fit mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                                Altensor Accounting Suite
                            </span>
                        </div>
                        <h1
                            className={`text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-3 transition-colors ${
                                isLight ? 'text-slate-900' : 'text-white'
                            }`}
                        >
                            Maliyyə və Mühasibatlıq İdarəetmə Sistemi
                        </h1>
                        <p
                            className={`text-sm leading-relaxed max-w-md transition-colors ${
                                isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}
                        >
                            Baş kitab, Hesablar planı, Bank və Kassa, Jurnal qeydləri, Alış-Satış qaimələri və maliyyə hesabatlarını tək mərkəzdən şəffaf idarə edin.
                        </p>
                    </div>

                    {/* Interactive Frost Card Mockup */}
                    <div
                        className={`relative w-full rounded-3xl p-3 shadow-2xl backdrop-blur-xl border transition-all duration-500 hover:scale-[1.01] ${
                            isLight
                                ? 'bg-white/95 border-slate-200/90 shadow-slate-200/80 shadow-xl'
                                : isMidnight
                                ? 'bg-[#0F172A]/90 border-slate-700/60 shadow-2xl'
                                : 'bg-[#18181B]/80 border-white/10 shadow-2xl'
                        }`}
                    >
                        <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/20 bg-black/40">
                            <img
                                src={accountingHeroPreview}
                                alt="Altensor Accounting Preview"
                                className="w-full h-auto object-cover rounded-2xl"
                            />
                        </div>

                        {/* Feature Badges below image */}
                        <div className="grid grid-cols-3 gap-2.5 pt-3 text-xs">
                            <div
                                className={`p-2 rounded-xl border transition-colors ${
                                    isLight
                                        ? 'bg-slate-50 border-slate-200/80'
                                        : isMidnight
                                        ? 'bg-[#0B1120] border-slate-800'
                                        : 'bg-[#121214] border-[#27272A]'
                                }`}
                            >
                                <span
                                    className={`text-[9px] uppercase font-bold block mb-0.5 ${
                                        isLight ? 'text-slate-500' : 'text-[#71717A]'
                                    }`}
                                >
                                    Uçot Standartı
                                </span>
                                <span className={`font-semibold text-[11px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                    İkili Yazılış (IFRS)
                                </span>
                            </div>

                            <div
                                className={`p-2 rounded-xl border transition-colors ${
                                    isLight
                                        ? 'bg-slate-50 border-slate-200/80'
                                        : isMidnight
                                        ? 'bg-[#0B1120] border-slate-800'
                                        : 'bg-[#121214] border-[#27272A]'
                                }`}
                            >
                                <span
                                    className={`text-[9px] uppercase font-bold block mb-0.5 ${
                                        isLight ? 'text-slate-500' : 'text-[#71717A]'
                                    }`}
                                >
                                    İzolyasiya
                                </span>
                                <span className={`font-semibold text-[11px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
                                    Multi-Tenant
                                </span>
                            </div>

                            <div
                                className={`p-2 rounded-xl border transition-colors ${
                                    isLight
                                        ? 'bg-slate-50 border-slate-200/80'
                                        : isMidnight
                                        ? 'bg-[#0B1120] border-slate-800'
                                        : 'bg-[#121214] border-[#27272A]'
                                }`}
                            >
                                <span
                                    className={`text-[9px] uppercase font-bold block mb-0.5 ${
                                        isLight ? 'text-slate-500' : 'text-[#71717A]'
                                    }`}
                                >
                                    Təhlükəsizlik
                                </span>
                                <span className="text-emerald-400 font-mono font-bold text-[11px]">
                                    256-Bit RSA
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-[420px] flex flex-col gap-6">
                    {/* Branding Header */}
                    <div className="flex flex-col items-start gap-2">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center p-2.5 shadow-lg shadow-emerald-500/10 mb-1">
                            <img
                                src={accountingLogo}
                                alt="Altensor Accounting"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h2
                            className={`text-3xl font-extrabold tracking-tight transition-colors ${
                                isLight ? 'text-slate-900' : 'text-white'
                            }`}
                        >
                            Xoş Gəlmisiniz
                        </h2>
                        <p
                            className={`text-sm transition-colors ${
                                isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}
                        >
                            Accounting sisteminə daxil olmaq üçün korporativ məlumatlarınızı daxil edin.
                        </p>
                    </div>

                    {/* Alerts */}
                    {infoMessage && (
                        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs flex items-center gap-2 font-medium animate-in fade-in">
                            <CheckCircleIcon className="w-4 h-4 shrink-0" />
                            <span>{infoMessage}</span>
                        </div>
                    )}

                    {error && (
                        <div className="p-3.5 bg-red-500/10 text-red-500 text-xs rounded-xl border border-red-500/20 font-medium animate-in fade-in flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        {/* Tenant Slug Input */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
                                    isLight ? 'text-slate-700' : 'text-slate-300'
                                }`}
                                htmlFor="tenantSlug"
                            >
                                Şirkət Kodu (Tenant Slug)
                            </label>
                            <div
                                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                    isLight
                                        ? 'bg-white border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 shadow-xs'
                                        : isMidnight
                                        ? 'bg-[#0B1120] border-slate-700 focus-within:border-emerald-500 focus-within:bg-[#0E172A]'
                                        : 'bg-white/[0.04] border-white/15 focus-within:border-emerald-500 focus-within:bg-white/[0.07]'
                                }`}
                            >
                                <BuildingOffice2Icon className="w-5 h-5 absolute left-3.5 text-slate-400" />
                                <input
                                    className={`w-full h-full pl-11 pr-4 bg-transparent border-none outline-none font-mono text-sm font-medium ${
                                        isLight
                                            ? 'text-slate-900 placeholder:text-slate-400'
                                            : 'text-white placeholder:text-slate-500'
                                    }`}
                                    id="tenantSlug"
                                    name="tenantSlug"
                                    placeholder="məs. altensor və ya demo"
                                    type="text"
                                    value={formData.tenantSlug}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
                                    isLight ? 'text-slate-700' : 'text-slate-300'
                                }`}
                                htmlFor="email"
                            >
                                Korporativ E-poçt
                            </label>
                            <div
                                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                    isLight
                                        ? 'bg-white border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 shadow-xs'
                                        : isMidnight
                                        ? 'bg-[#0B1120] border-slate-700 focus-within:border-emerald-500 focus-within:bg-[#0E172A]'
                                        : 'bg-white/[0.04] border-white/15 focus-within:border-emerald-500 focus-within:bg-white/[0.07]'
                                }`}
                            >
                                <EnvelopeIcon className="w-5 h-5 absolute left-3.5 text-slate-400" />
                                <input
                                    className={`w-full h-full pl-11 pr-4 bg-transparent border-none outline-none text-sm font-medium ${
                                        isLight
                                            ? 'text-slate-900 placeholder:text-slate-400'
                                            : 'text-white placeholder:text-slate-500'
                                    }`}
                                    id="email"
                                    name="email"
                                    placeholder="ad@shirkat.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center w-full">
                                <label
                                    className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
                                        isLight ? 'text-slate-700' : 'text-slate-300'
                                    }`}
                                    htmlFor="password"
                                >
                                    Şifrə
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium hover:underline"
                                >
                                    Şifrəni unutmusunuz?
                                </Link>
                            </div>
                            <div
                                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                    isLight
                                        ? 'bg-white border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 shadow-xs'
                                        : isMidnight
                                        ? 'bg-[#0B1120] border-slate-700 focus-within:border-emerald-500 focus-within:bg-[#0E172A]'
                                        : 'bg-white/[0.04] border-white/15 focus-within:border-emerald-500 focus-within:bg-white/[0.07]'
                                }`}
                            >
                                <LockClosedIcon className="w-5 h-5 absolute left-3.5 text-slate-400" />
                                <input
                                    className={`w-full h-full pl-11 pr-11 bg-transparent border-none outline-none text-sm font-medium ${
                                        isLight
                                            ? 'text-slate-900 placeholder:text-slate-400'
                                            : 'text-white placeholder:text-slate-500'
                                    }`}
                                    id="password"
                                    name="password"
                                    placeholder="••••••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="w-4 h-4" />
                                    ) : (
                                        <EyeIcon className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs uppercase tracking-widest font-bold shadow-xl shadow-emerald-600/20 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                    <span>Daxil olunur...</span>
                                </>
                            ) : (
                                'Daxil Ol'
                            )}
                        </button>
                    </form>

                    {/* Bottom SSL Badge & Ecosystem Copyright */}
                    <div
                        className={`pt-4 border-t flex items-center justify-between text-xs transition-colors ${
                            isLight
                                ? 'border-slate-200 text-slate-500'
                                : isMidnight
                                ? 'border-slate-800 text-slate-400'
                                : 'border-[#27272A] text-[#71717A]'
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] uppercase tracking-wider font-semibold">
                                256-Bit SSL Qorunur
                            </span>
                        </div>
                        <span>© Altensor Platform</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
