import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api';
import { useTheme } from '../context';
import type { AxiosError } from 'axios';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    const [email, setEmail] = useState('');
    const [tenantSlug, setTenantSlug] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryTenant = params.get('tenant') || params.get('tenantSlug');
        const savedTenant = authService.getLastTenantSlug();

        if (queryTenant) {
            setTenantSlug(queryTenant);
        } else if (savedTenant) {
            setTenantSlug(savedTenant);
        }
    }, [location.search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cleanTenantSlug = tenantSlug.trim();
        const cleanEmail = email.trim();

        if (!cleanTenantSlug) {
            setError('Zəhmət olmasa Şirkət Kodunu (Tenant Slug) qeyd edin.');
            setLoading(false);
            return;
        }

        try {
            await authService.forgotPassword({
                email: cleanEmail,
                tenantSlug: cleanTenantSlug,
            });

            sessionStorage.setItem('resetEmail', cleanEmail);
            sessionStorage.setItem('resetTenantSlug', cleanTenantSlug);
            navigate('/otp-verification');
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string; title?: string }>;
            const errorMessage =
                axiosError.response?.data?.message ||
                axiosError.response?.data?.title ||
                'Təsdiq kodu göndərilmədi. Zəhmət olmasa məlumatları yoxlayıb bir daha cəhd edin.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen w-screen overflow-x-hidden flex items-center justify-center p-6 font-sans transition-colors duration-300 relative ${
                isDark ? 'bg-[#08090C] text-white' : 'bg-[#F8FAFC] text-slate-900'
            }`}
        >
            {/* Ambient Atmosphere */}
            <div className="blob-atmosphere -top-20 -left-20 w-96 h-96 opacity-40"></div>
            <div className="blob-atmosphere -bottom-20 -right-20 w-96 h-96 opacity-30"></div>

            {/* Top Floating Bar for Theme Toggle */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-3 pointer-events-auto">
                <button
                    onClick={toggleTheme}
                    className={`p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                        isDark
                            ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                            : 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm hover:bg-white'
                    }`}
                    title={isDark ? 'İşıqlı Rejimə Keç' : 'Qaranlıq Rejimə Keç'}
                    type="button"
                >
                    <span className="material-symbols-outlined text-lg leading-none block">
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>
            </div>

            {/* Card Container */}
            <div
                className={`w-full max-w-[440px] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl border relative z-10 flex flex-col gap-6 ${
                    isDark ? 'glass-card border-white/15 bg-[#141416]/90' : 'bg-white border-slate-200 shadow-xl'
                }`}
            >
                {/* Branding */}
                <div className="flex flex-col items-center text-center gap-3">
                    <div
                        className="inline-flex items-center gap-3 p-2.5 px-4 rounded-2xl border shadow-md transition-all"
                        style={{
                            backgroundColor: isDark ? '#1C1C1E' : '#F8FAFC',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                        }}
                    >
                        <img src={taskManagementLogo} alt="Altensor Logo" className="h-8 w-8 object-contain" />
                        <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Altensor Tasks
                        </span>
                    </div>

                    <h1 className={`text-2xl font-extrabold tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Şifrəni Sıfırla
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        6 rəqəmli təsdiq kodu almaq üçün şirkət kodunuzu və e-poçtunuzu daxil edin.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                        <div className="p-3.5 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-medium">
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
                            Şirkət Kodu
                        </label>
                        <div
                            className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                isDark
                                    ? 'bg-white/[0.04] border-white/15 focus-within:border-blue-500'
                                    : 'bg-white border-slate-300 focus-within:border-blue-600'
                            }`}
                        >
                            <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">
                                domain
                            </span>
                            <input
                                className={`w-full h-full pl-12 pr-4 bg-transparent border-none outline-none text-sm ${
                                    isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                                }`}
                                id="tenantSlug"
                                placeholder="demo-tenant"
                                type="text"
                                value={tenantSlug}
                                onChange={(e) => setTenantSlug(e.target.value)}
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
                            E-poçt ünvanı
                        </label>
                        <div
                            className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                isDark
                                    ? 'bg-white/[0.04] border-white/15 focus-within:border-blue-500'
                                    : 'bg-white border-slate-300 focus-within:border-blue-600'
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
                                placeholder="ad@sirket.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
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
                                <span>Kod Göndərilir...</span>
                            </>
                        ) : (
                            'Təsdiq Kodu Göndər'
                        )}
                    </button>
                </form>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        className="text-xs text-slate-400 hover:text-white font-semibold transition-colors inline-flex items-center gap-1.5"
                        to="/login"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Giriş səhifəsinə qayıt
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
