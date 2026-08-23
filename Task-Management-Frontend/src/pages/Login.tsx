import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api';
import { useAuth, useTheme } from '../context';
import { useLanguage } from '../context/LanguageContext';
import { isTokenExpired } from '../utils';
import type { AxiosError } from 'axios';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';
import crmHeroPreview from '../assets/crm_hero_preview.png';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated, authChecked, hasModule } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { t, language, setLanguage, languages } = useLanguage();

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
                setError('Auth Service ilə əlaqə qurulmadı. Zəhmət olmasa internet bağlantınızı və ya server ünvanını yoxlayın.');
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
                isDark ? 'bg-[#08090C] text-white' : 'bg-[#F8FAFC] text-slate-900'
            }`}
        >
            {/* Top Right Actions */}
            <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                {/* Language Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-white/10 rounded-xl p-0.5 border border-slate-200/60 dark:border-white/10">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => setLanguage(lang.code)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                                language === lang.code
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : isDark
                                    ? 'text-slate-400 hover:text-white'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {lang.code.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        isDark
                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                    }`}
                    title={isDark ? t('settings.lightTheme', {}, 'İşıqlı Rejimə Keç') : t('settings.darkTheme', {}, 'Qaranlıq Rejimə Keç')}
                    type="button"
                >
                    <span className="material-symbols-outlined text-lg leading-none block">
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>
            </div>

            {/* Left Side: Ambient Branding & Preview */}
            <div
                className={`hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden border-r ${
                    isDark
                        ? 'bg-[#0C0E14] border-white/10'
                        : 'bg-gradient-to-br from-slate-50 via-white to-violet-50/40 border-slate-200'
                }`}
            >
                {/* Ambient Halo Glow */}
                <div className="blob-atmosphere -top-20 -left-20 w-96 h-96 opacity-50"></div>
                <div className="blob-atmosphere -bottom-20 -right-20 w-96 h-96 opacity-40"></div>

                <div className="z-10 w-full max-w-xl flex flex-col gap-8 pt-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 w-fit mb-4">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">
                                Altensor Multi-Tenant Platform
                            </span>
                        </div>
                        <h1
                            className={`text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-3 ${
                                isDark ? 'text-white' : 'text-slate-900'
                            }`}
                        >
                            Tapşırıqlarınızı zirvəyə daşıyın
                        </h1>
                        <p className={`text-sm leading-relaxed max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Komandanızın iş axınını, hədəflərini və gündəlik layihələrini tək bir ağıllı platformada idarə edin.
                        </p>
                    </div>

                    {/* Interactive Frost Card Mockup */}
                    <div
                        className={`relative w-full rounded-3xl p-3 shadow-2xl backdrop-blur-xl border transition-transform duration-500 hover:scale-[1.01] ${
                            isDark ? 'glass-card border-white/15 bg-white/[0.02]' : 'bg-white border-slate-200 shadow-xl'
                        }`}
                    >
                        <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/20 bg-black/20">
                            <img
                                src={crmHeroPreview}
                                alt="Altensor Task Management Preview"
                                className="w-full h-auto object-cover rounded-2xl"
                            />

                            {/* Floating Stat Badges */}
                            <div
                                className={`absolute top-4 left-4 backdrop-blur-md px-4 py-2.5 rounded-xl border shadow-lg flex items-center gap-3 ${
                                    isDark ? 'bg-[#131315]/90 border-white/15 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
                                }`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
                                    ✓
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Tamamlanma</div>
                                    <div className="text-xs font-bold text-emerald-400">94.8% Məhsuldarlıq</div>
                                </div>
                            </div>

                            <div
                                className={`absolute bottom-4 right-4 backdrop-blur-md px-4 py-2.5 rounded-xl border shadow-xl flex items-center gap-3 ${
                                    isDark ? 'bg-[#131315]/90 border-white/15 text-white' : 'bg-slate-900/90 border-slate-700 text-white'
                                }`}
                            >
                                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-slate-300 font-medium">Aktiv Tapşırıqlar</div>
                                    <div className="text-xs font-bold text-white">Canlı Sinxronizasiya</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-[420px] flex flex-col gap-6">
                    {/* Branding Header */}
                    <div className="flex flex-col items-start gap-3">
                        <div
                            className="inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl border shadow-md transition-all"
                            style={{
                                backgroundColor: isDark ? '#141416' : '#FFFFFF',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                            }}
                        >
                            <img src={taskManagementLogo} alt="Altensor Task Management" className="h-8 w-8 object-contain" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400">Altensor</span>
                                <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Task Management
                                </span>
                            </div>
                        </div>

                        <h2
                            className={`text-3xl font-extrabold tracking-tight mt-2 ${
                                isDark ? 'text-white' : 'text-slate-900'
                            }`}
                        >
                            {t('auth.welcomeBack', {}, 'Xoş Gəlmisiniz')}
                        </h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {t('auth.signInToAccount', {}, 'Şirkət hesabınıza daxil olmaq üçün məlumatlarınızı qeyd edin.')}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        {infoMessage && (
                            <div className="p-3.5 bg-amber-500/10 text-amber-400 text-xs rounded-xl border border-amber-500/20 font-medium">
                                {infoMessage}
                            </div>
                        )}

                        {error && (
                            <div className="p-3.5 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-medium animate-slide-up">
                                {error}
                            </div>
                        )}

                        {/* Tenant Slug Input */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                className={`text-xs uppercase tracking-wider font-semibold ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                                htmlFor="tenantSlug"
                            >
                                {t('auth.companyCode', {}, 'Şirkət Kodu / Workspace Slug')}
                            </label>
                            <div
                                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                    isDark
                                        ? 'bg-white/[0.04] border-white/15 focus-within:border-blue-500 focus-within:bg-white/[0.07]'
                                        : 'bg-white border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100'
                                }`}
                            >
                                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">
                                    domain
                                </span>
                                <input
                                    className={`w-full h-full pl-12 pr-4 bg-transparent border-none outline-none text-sm font-medium ${
                                        isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                                    }`}
                                    id="tenantSlug"
                                    name="tenantSlug"
                                    placeholder="demo-tenant"
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
                                className={`text-xs uppercase tracking-wider font-semibold ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                                htmlFor="email"
                            >
                                {t('auth.email', {}, 'E-poçt ünvanı')}
                            </label>
                            <div
                                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                    isDark
                                        ? 'bg-white/[0.04] border-white/15 focus-within:border-blue-500 focus-within:bg-white/[0.07]'
                                        : 'bg-white border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100'
                                }`}
                            >
                                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">
                                    mail
                                </span>
                                <input
                                    className={`w-full h-full pl-12 pr-4 bg-transparent border-none outline-none text-sm ${
                                        isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                                    }`}
                                    id="email"
                                    name="email"
                                    placeholder="ad@sirket.com"
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
                                    className={`text-xs uppercase tracking-wider font-semibold ${
                                        isDark ? 'text-slate-300' : 'text-slate-700'
                                    }`}
                                    htmlFor="password"
                                >
                                    {t('auth.password', {}, 'Şifrə')}
                                </label>
                                <Link
                                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                                    to={formData.tenantSlug ? `/forgot-password?tenant=${encodeURIComponent(formData.tenantSlug)}` : '/forgot-password'}
                                >
                                    {t('auth.forgotPasswordQuestion', {}, 'Şifrəni unutmusunuz?')}
                                </Link>
                            </div>
                            <div
                                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                    isDark
                                        ? 'bg-white/[0.04] border-white/15 focus-within:border-blue-500 focus-within:bg-white/[0.07]'
                                        : 'bg-white border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100'
                                }`}
                            >
                                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">
                                    lock
                                </span>
                                <input
                                    className={`w-full h-full pl-12 pr-12 bg-transparent border-none outline-none text-sm ${
                                        isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
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
                                    className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loading}
                            className="h-12 w-full btn-primary disabled:opacity-50 text-white rounded-xl text-xs uppercase tracking-widest font-bold shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-2"
                            type="submit"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                                    <span>{t('auth.loggingIn', {}, 'Daxil olunur...')}</span>
                                </>
                            ) : (
                                t('auth.login', {}, 'Daxil Ol')
                            )}
                        </button>
                    </form>

                    {/* Bottom SSL Badge */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold">256-Bit SSL Qorunur</span>
                        </div>
                        <span>© Altensor Platform</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
