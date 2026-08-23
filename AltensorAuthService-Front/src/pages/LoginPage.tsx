import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authApi } from '../api/authApi';
import authLogo from '../assets/auth-logo.svg';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { theme } = useTheme();
  const { t, language, setLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('platform');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Forgot / Reset Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'forgot' | 'reset'>('forgot');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotTenantSlug, setForgotTenantSlug] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [loadingForgot, setLoadingForgot] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const isLight = theme === 'light';
  const isMidnight = theme === 'midnight';

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !tenantSlug) {
      setError('Zəhmət olmasa bütün sahələri doldurun.');
      return;
    }

    setLoadingLogin(true);
    try {
      await login({
        email: email.trim(),
        password,
        tenantSlug: tenantSlug.trim()
      });
      showToast('success', 'Sistemə uğurla daxil oldunuz!', 'Uğurlu Giriş');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Giriş uğursuz oldu. Email və ya şifrə yanlışdır.');
      showToast('error', err.message || 'Etimadnamə yalnışdır', 'Giriş Xətası');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotTenantSlug) return;
    setLoadingForgot(true);
    try {
      const res = await authApi.forgotPassword({
        email: forgotEmail.trim(),
        tenantSlug: forgotTenantSlug.trim()
      });
      showToast('success', res.message || 'OTP təsdiq kodu email ünvanına göndərildi!', 'Uğurlu');
      setForgotStep('reset');
    } catch (err: any) {
      showToast('error', err.message || 'OTP göndərilərkən xəta baş verdi', 'Xəta');
    } finally {
      setLoadingForgot(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotTenantSlug || !resetOtp || !resetNewPassword) return;
    setLoadingReset(true);
    try {
      const res = await authApi.resetPassword({
        email: forgotEmail.trim(),
        tenantSlug: forgotTenantSlug.trim(),
        otp: resetOtp.trim(),
        newPassword: resetNewPassword
      });
      showToast('success', res.message || 'Şifrəniz uğurla yeniləndi!', 'Şifrə Yeniləndi');
      setIsForgotModalOpen(false);
      setPassword(resetNewPassword);
      setEmail(forgotEmail);
      setTenantSlug(forgotTenantSlug);
    } catch (err: any) {
      showToast('error', err.message || 'Şifrə sıfırlanarkən xəta', 'Xəta');
    } finally {
      setLoadingReset(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-screen overflow-x-hidden flex font-sans transition-colors duration-300 ${
        isLight
          ? 'bg-[#F8FAFC] text-[#0F172A] selection:bg-fuchsia-100 selection:text-fuchsia-900'
          : isMidnight
          ? 'bg-[#0B0F19] text-[#F8FAFC] selection:bg-fuchsia-500/30 selection:text-white'
          : 'bg-[#08090C] text-white selection:bg-fuchsia-500/30 selection:text-white'
      }`}
    >
      {/* Top Right Floating Language Switcher */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <div className="flex items-center bg-[#121214] rounded-xl p-0.5 border border-[#27272A] shadow-md">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                language === lang.code
                  ? 'bg-fuchsia-600 text-white shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#71717A] hover:text-white'
              }`}
            >
              {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Left Side: Ambient Branding & Enterprise Visual */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden border-r transition-colors duration-300 ${
          isLight
            ? 'bg-gradient-to-br from-slate-50 via-white to-fuchsia-50/40 border-slate-200'
            : isMidnight
            ? 'bg-[#0E1526] border-slate-800'
            : 'bg-[#0C0E14] border-white/10'
        }`}
      >
        {/* Ambient Halo Glow */}
        <div
          className={`blob-atmosphere -top-20 -left-20 w-96 h-96 ${
            isLight ? 'opacity-20 bg-fuchsia-200' : 'opacity-50'
          }`}
        ></div>
        <div
          className={`blob-atmosphere -bottom-20 -right-20 w-96 h-96 ${
            isLight ? 'opacity-15 bg-indigo-200' : 'opacity-40'
          }`}
        ></div>

        <div className="z-10 w-full max-w-xl flex flex-col gap-8 pt-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D946EF]/10 border border-[#D946EF]/25 w-fit mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D946EF] animate-pulse"></span>
              <span className="text-xs uppercase tracking-widest text-[#D946EF] font-bold">
                Altensor Enterprise Suite
              </span>
            </div>
            <h1
              className={`text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-3 transition-colors ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {t('auth.ssoLoginTitle', {}, 'Şəxsiyyət və Giriş İdarəetməsi')}
            </h1>
            <p
              className={`text-sm leading-relaxed max-w-md transition-colors ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {t('auth.ssoLoginSubtitle', {}, 'Bütün CRM, Anbar, ERP və Maliyyə mikroservisləriniz üçün mərkəzləşdirilmiş, çox-müştərili (Multi-Tenant) RS256 təhlükəsizlik şlüzü.')}
            </p>
          </div>

          {/* Frost Card Mockup */}
          <div
            className={`relative w-full rounded-3xl p-5 shadow-2xl backdrop-blur-xl border transition-all duration-300 ${
              isLight
                ? 'bg-white/95 border-slate-200/90 shadow-slate-200/80 shadow-xl'
                : isMidnight
                ? 'bg-[#0F172A]/90 border-slate-700/60 shadow-2xl'
                : 'bg-[#18181B]/80 border-white/10 shadow-2xl'
            }`}
          >
            <div className="flex flex-col gap-3">
              <div
                className={`flex items-center justify-between border-b pb-3 ${
                  isLight ? 'border-slate-100' : isMidnight ? 'border-slate-800' : 'border-[#27272A]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D946EF]/10 border border-[#D946EF]/25 flex items-center justify-center p-1 shadow-xs">
                    <img
                      src={authLogo}
                      alt="Altensor"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    Altensor Auth Gateway
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                  RS256 ONLINE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200/80'
                      : isMidnight
                      ? 'bg-[#0B1120] border-slate-800'
                      : 'bg-[#121214] border-[#27272A]'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold block mb-0.5 ${
                      isLight ? 'text-slate-500' : 'text-[#71717A]'
                    }`}
                  >
                    İzolyasiya Modeli
                  </span>
                  <span
                    className={`font-semibold ${
                      isLight ? 'text-slate-800' : 'text-white'
                    }`}
                  >
                    Multi-Tenant Schema
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200/80'
                      : isMidnight
                      ? 'bg-[#0B1120] border-slate-800'
                      : 'bg-[#121214] border-[#27272A]'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold block mb-0.5 ${
                      isLight ? 'text-slate-500' : 'text-[#71717A]'
                    }`}
                  >
                    İmzalanma Açarı
                  </span>
                  <span className="text-[#D946EF] font-mono font-bold">2048-bit RSA</span>
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
          <div className="flex flex-col items-start gap-2">
            <div className="w-12 h-12 rounded-2xl bg-[#D946EF]/10 border border-[#D946EF]/25 flex items-center justify-center p-2 shadow-lg shadow-fuchsia-500/15 mb-1">
              <img
                src={authLogo}
                alt="Altensor Auth Gateway"
                className="w-full h-full object-contain"
              />
            </div>
            <h2
              className={`text-3xl font-extrabold tracking-tight transition-colors ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {t('auth.welcomeBack', {}, 'Xoş Gəlmisiniz')}
            </h2>
            <p
              className={`text-sm transition-colors ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {t('auth.signInToAccount', {}, 'Hesabınıza daxil olmaq üçün etimadnamənizi qeyd edin.')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            {error && (
              <div className="p-3.5 bg-red-500/10 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-500/20 font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {/* Tenant Slug Input */}
            <div className="flex flex-col gap-1.5">
              <label
                className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
                htmlFor="tenantSlug"
              >
                {t('tenants.tenantSlug', {}, 'Tenant Slug (Şirkət Kodu)')}
              </label>
              <div
                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                  isLight
                    ? 'bg-white border-slate-300 focus-within:border-[#D946EF] focus-within:ring-2 focus-within:ring-fuchsia-100 shadow-xs'
                    : isMidnight
                    ? 'bg-[#0B1120] border-slate-700 focus-within:border-[#D946EF] focus-within:bg-[#0E172A]'
                    : 'bg-white/[0.04] border-white/15 focus-within:border-white/50 focus-within:bg-white/[0.07]'
                }`}
              >
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg">
                  domain
                </span>
                <input
                  className={`w-full h-full pl-11 pr-4 bg-transparent border-none outline-none font-mono text-sm font-medium ${
                    isLight
                      ? 'text-slate-900 placeholder:text-slate-400'
                      : 'text-white placeholder:text-slate-500'
                  }`}
                  id="tenantSlug"
                  placeholder="platform və ya company-slug"
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
                className={`text-xs uppercase tracking-wider font-semibold transition-colors ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
                htmlFor="email"
              >
                {t('auth.email', {}, 'Email Ünvanı')}
              </label>
              <div
                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                  isLight
                    ? 'bg-white border-slate-300 focus-within:border-[#D946EF] focus-within:ring-2 focus-within:ring-fuchsia-100 shadow-xs'
                    : isMidnight
                    ? 'bg-[#0B1120] border-slate-700 focus-within:border-[#D946EF] focus-within:bg-[#0E172A]'
                    : 'bg-white/[0.04] border-white/15 focus-within:border-white/50 focus-within:bg-white/[0.07]'
                }`}
              >
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg">
                  mail
                </span>
                <input
                  className={`w-full h-full pl-11 pr-4 bg-transparent border-none outline-none text-sm font-medium ${
                    isLight
                      ? 'text-slate-900 placeholder:text-slate-400'
                      : 'text-white placeholder:text-slate-500'
                  }`}
                  id="email"
                  placeholder="user@altensor.io"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  {t('auth.password', {}, 'Şifrə')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotTenantSlug(tenantSlug);
                    setForgotStep('forgot');
                    setIsForgotModalOpen(true);
                  }}
                  className={`text-xs font-semibold cursor-pointer transition-colors ${
                    isLight
                      ? 'text-slate-500 hover:text-slate-900 hover:underline'
                      : 'text-slate-400 hover:text-white hover:underline'
                  }`}
                >
                  {t('auth.forgotPassword', {}, 'Şifrəni unutmusunuz?')}
                </button>
              </div>
              <div
                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                  isLight
                    ? 'bg-white border-slate-300 focus-within:border-[#D946EF] focus-within:ring-2 focus-within:ring-fuchsia-100 shadow-xs'
                    : isMidnight
                    ? 'bg-[#0B1120] border-slate-700 focus-within:border-[#D946EF] focus-within:bg-[#0E172A]'
                    : 'bg-white/[0.04] border-white/15 focus-within:border-white/50 focus-within:bg-white/[0.07]'
                }`}
              >
                <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  className={`w-full h-full pl-11 pr-11 bg-transparent border-none outline-none text-sm ${
                    isLight
                      ? 'text-slate-900 placeholder:text-slate-400'
                      : 'text-white placeholder:text-slate-500'
                  }`}
                  id="password"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loadingLogin}
              className={`h-12 w-full disabled:opacity-50 rounded-xl text-xs uppercase tracking-wider font-bold shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2 ${
                isLight
                  ? 'bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-slate-300'
                  : 'bg-white hover:bg-[#E4E4E7] text-black shadow-black/40'
              }`}
              type="submit"
            >
              {loadingLogin ? (
                <>
                  <span
                    className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin ${
                      isLight ? 'border-white' : 'border-black'
                    }`}
                  ></span>
                  <span>{t('auth.loggingIn', {}, 'Daxil olunur...')}</span>
                </>
              ) : (
                <span>{t('auth.login', {}, 'Daxil Ol')}</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/25 animate-in fade-in duration-150">
          <div
            className={`border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 transition-all ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50'
                : isMidnight
                ? 'bg-[#0F172A] border-slate-700 text-white'
                : 'bg-[#1C1C1E] border-[#2C2C2E] text-white'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b mb-4 ${
                isLight ? 'border-slate-100' : isMidnight ? 'border-slate-800' : 'border-[#27272A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D946EF]/15 text-[#D946EF] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">
                    {forgotStep === 'forgot' ? 'mail' : 'key'}
                  </span>
                </div>
                <div>
                  <h3
                    className={`text-sm font-bold ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {forgotStep === 'forgot' ? 'Şifrə Bərpası (OTP)' : 'Yeni Şifrə Təyini'}
                  </h3>
                  <p
                    className={`text-xs ${
                      isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {forgotStep === 'forgot'
                      ? '6-rəqəmli OTP kod email ünvanınıza göndəriləcək'
                      : 'Kodu və yeni şifrənizi daxil edin'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {forgotStep === 'forgot' ? (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Tenant Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotTenantSlug}
                    onChange={(e) => setForgotTenantSlug(e.target.value)}
                    placeholder="platform və ya company-slug"
                    className={`w-full h-10 px-3 rounded-xl border text-sm font-mono outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#D946EF] focus:bg-white'
                        : isMidnight
                        ? 'bg-[#0B1120] border-slate-700 text-white focus:border-[#D946EF]'
                        : 'bg-[#121214] border-[#27272A] text-white focus:border-[#D946EF]'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Email Ünvanı *
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="user@altensor.io"
                    className={`w-full h-10 px-3 rounded-xl border text-sm outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#D946EF] focus:bg-white'
                        : isMidnight
                        ? 'bg-[#0B1120] border-slate-700 text-white focus:border-[#D946EF]'
                        : 'bg-[#121214] border-[#27272A] text-white focus:border-[#D946EF]'
                    }`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        : 'bg-[#27272A] hover:bg-[#3F3F46] text-white border-[#3F3F46]'
                    }`}
                  >
                    Ləğv Et
                  </button>
                  <button
                    type="submit"
                    disabled={loadingForgot}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors ${
                      isLight
                        ? 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
                        : 'bg-white hover:bg-[#E4E4E7] text-black'
                    }`}
                  >
                    {loadingForgot ? 'Göndərilir...' : 'OTP Kodu Göndər'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    6-Rəqəmli OTP Kod *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={`w-full h-10 px-3 rounded-xl border text-sm font-mono text-center tracking-widest outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#D946EF] focus:bg-white'
                        : isMidnight
                        ? 'bg-[#0B1120] border-slate-700 text-white focus:border-[#D946EF]'
                        : 'bg-[#121214] border-[#27272A] text-white focus:border-[#D946EF]'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-700' : 'text-slate-300'
                    }`}
                  >
                    Yeni Şifrə *
                  </label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full h-10 px-3 rounded-xl border text-sm outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#D946EF] focus:bg-white'
                        : isMidnight
                        ? 'bg-[#0B1120] border-slate-700 text-white focus:border-[#D946EF]'
                        : 'bg-[#121214] border-[#27272A] text-white focus:border-[#D946EF]'
                    }`}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('forgot')}
                    className="text-xs text-[#D946EF] hover:underline font-semibold cursor-pointer"
                  >
                    ← Geri
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer transition-colors ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          : 'bg-[#27272A] hover:bg-[#3F3F46] text-white border-[#3F3F46]'
                      }`}
                    >
                      Ləğv Et
                    </button>
                    <button
                      type="submit"
                      disabled={loadingReset}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors ${
                        isLight
                          ? 'bg-[#0F172A] hover:bg-[#1E293B] text-white'
                          : 'bg-white hover:bg-[#E4E4E7] text-black'
                      }`}
                    >
                      {loadingReset ? 'Yenilənir...' : 'Şifrəni Təsdiqlə'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
