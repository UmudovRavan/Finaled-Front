import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../api';
import accountingLogo from '../assets/Accounting-Logo.png';
import { useLanguage } from '../context/LanguageContext';
import { ExclamationTriangleIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ResetPassword: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const initialEmail = searchParams.get('email') || '';
    const initialTenant = searchParams.get('tenant') || authService.getLastTenantSlug() || '';

    const [email, setEmail] = useState(initialEmail);
    const [tenantSlug, setTenantSlug] = useState(initialTenant);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError(t('validation.passwordsDoNotMatch', {}, 'Şifrələr uyğun gəlmir!'));
            return;
        }
        if (newPassword.length < 6) {
            setError(t('validation.minCharacters', { count: 6 }, 'Şifrə minimum 6 simvol olmalıdır!'));
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            await authService.resetPassword({
                email: email.trim(),
                tenantSlug: tenantSlug.trim(),
                otp: otp.trim(),
                newPassword,
                confirmPassword,
            });
            setSuccess(t('auth.resetSuccess', {}, 'Şifrəniz uğurla yeniləndi! Giriş səhifəsinə yönləndirilirsiniz...'));
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || t('auth.resetError', {}, 'Şifrə sıfırlanarkən xəta baş verdi.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#08090C] text-[#F8FAFC] flex flex-col justify-center items-center p-4 font-sans">
            <div className="w-full max-w-md bg-[#12141A] border border-[#27272A] rounded-3xl p-8 shadow-2xl space-y-6">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-1">
                        <img src={accountingLogo} alt="Accounting" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-xl font-extrabold text-white">{t('auth.resetPasswordTitle', {}, 'Yeni Şifrə Təyin Edin')}</h1>
                    <p className="text-xs text-[#94A3B8]">{t('auth.resetPasswordSubtitle', {}, 'OTP kodu və yeni şifrənizi daxil edin.')}</p>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="text-xs font-semibold text-[#CBD5E1]">{t('auth.emailLabel', {}, 'E-poçt')}</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#1A1D24] border border-[#2D3139] text-xs text-white placeholder-[#64748B] focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[#CBD5E1]">{t('auth.otpPlaceholder', {}, 'Təsdiq Kodu (OTP)')}</label>
                        <input
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="6 rəqəmli OTP"
                            className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#1A1D24] border border-[#2D3139] text-xs text-white placeholder-[#64748B] focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[#CBD5E1]">{t('auth.newPasswordLabel', {}, 'Yeni Şifrə')}</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#1A1D24] border border-[#2D3139] text-xs text-white placeholder-[#64748B] focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[#CBD5E1]">{t('auth.confirmPasswordLabel', {}, 'Yeni Şifrə Təkrarı')}</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-[#1A1D24] border border-[#2D3139] text-xs text-white placeholder-[#64748B] focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 mt-2"
                    >
                        {loading ? t('common.saving', {}, 'Yenilənir...') : t('auth.resetPasswordTitle', {}, 'Şifrəni Yenilə')}
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-[#27272A]">
                    <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline">
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        <span>{t('auth.backToLogin', {}, 'Girişə Qayıt')}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
