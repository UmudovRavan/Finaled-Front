import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api';
import { useTheme } from '../context';
import type { AxiosError } from 'axios';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';
import crmHeroPreview from '../assets/crm_hero_preview.png';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Şifrələr uyğun gəlmir');
            return;
        }

        if (formData.password.length < 8) {
            setError('Şifrə ən azı 8 simvoldan ibarət olmalıdır');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await authService.register({
                email: formData.email,
                password: formData.password,
                phoneNumber: undefined,
            });
            navigate('/login');
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string; title?: string }>;
            const errorMessage =
                axiosError.response?.data?.message ||
                axiosError.response?.data?.title ||
                'Qeydiyyat uğursuz oldu. Zəhmət olmasa yenidən cəhd edin.';
            setError(errorMessage);
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

            {/* Left Side: Ambient Branding */}
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
                                Altensor Enterprise Suite
                            </span>
                        </div>
                        <h1
                            className={`text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-3 ${
                                isDark ? 'text-white' : 'text-slate-900'
                            }`}
                        >
                            Komandanızı Zirvəyə Birləşdirin
                        </h1>
                        <p className={`text-sm leading-relaxed max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Yüksək məhsuldarlıq, şəffaf iş bölgüsü və real-vaxt analitika ilə tapşırıqları vaxtında idarə edin.
                        </p>
                    </div>

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
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10 overflow-y-auto">
                <div className="w-full max-w-[460px] flex flex-col gap-6 my-auto">
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
                            Hesab Yarat
                        </h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Altensor platformasında yeni komanda üzvü kimi qeydiyyatdan keçin.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        {error && (
                            <div className="p-3.5 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-medium animate-slide-up">
                                {error}
                            </div>
                        )}

                        {/* Name Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label
                                    className={`text-xs uppercase tracking-wider font-semibold ${
                                        isDark ? 'text-slate-300' : 'text-slate-700'
                                    }`}
                                    htmlFor="firstName"
                                >
                                    Ad
                                </label>
                                <div
                                    className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                        isDark
                                            ? 'bg-white/[0.04] border-white/15 focus-within:border-blue-500 focus-within:bg-white/[0.07]'
                                            : 'bg-white border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100'
                                    }`}
                                >
                                    <input
                                        className={`w-full h-full px-4 bg-transparent border-none outline-none text-sm ${
                                            isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                                        }`}
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Əli"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label
                                    className={`text-xs uppercase tracking-wider font-semibold ${
                                        isDark ? 'text-slate-300' : 'text-slate-700'
                                    }`}
                                    htmlFor="lastName"
                                >
                                    Soyad
                                </label>
                                <div
                                    className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                        isDark
                                            ? 'bg-white/[0.04] border-white/15 focus-within:border-blue-500 focus-within:bg-white/[0.07]'
                                            : 'bg-white border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100'
                                    }`}
                                >
                                    <input
                                        className={`w-full h-full px-4 bg-transparent border-none outline-none text-sm ${
                                            isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                                        }`}
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Məmmədov"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
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
                            <label
                                className={`text-xs uppercase tracking-wider font-semibold ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                                htmlFor="password"
                            >
                                Şifrə
                            </label>
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
                                    placeholder="Ən azı 8 simvol"
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

                        {/* Confirm Password Input */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                className={`text-xs uppercase tracking-wider font-semibold ${
                                    isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                                htmlFor="confirmPassword"
                            >
                                Şifrənin Təkrarı
                            </label>
                            <div
                                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                                    isDark
                                        ? 'bg-white/[0.04] border-white/15 focus-within:border-blue-500 focus-within:bg-white/[0.07]'
                                        : 'bg-white border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100'
                                }`}
                            >
                                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">
                                    lock_reset
                                </span>
                                <input
                                    className={`w-full h-full pl-12 pr-12 bg-transparent border-none outline-none text-sm ${
                                        isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                                    }`}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Şifrəni təkrar daxil edin"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
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
                                    <span>Qeydiyyat edilir...</span>
                                </>
                            ) : (
                                'Hesab Yarat'
                            )}
                        </button>
                    </form>

                    {/* Footer link to Login */}
                    <div className="text-center pt-2">
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Artıq hesabınız var?{' '}
                            <Link className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors" to="/login">
                                Daxil olun
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
