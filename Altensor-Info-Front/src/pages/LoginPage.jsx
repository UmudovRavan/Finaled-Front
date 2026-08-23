import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import altensorLogo from '../assets/Altensor-Logo.png';
import crmHeroPreview from '../assets/crm_hero_preview.png';

const LoginPage = () => {
  const [tenantSlug, setTenantSlug] = useState('demo-tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { isDark, toggleTheme } = useTheme();
  const isDarkMode = isDark;
  const { t, language, setLanguage, languages } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, authChecked } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryTenant = params.get('tenant') || params.get('tenantSlug');
    if (queryTenant) {
      setTenantSlug(queryTenant);
    }
  }, [location.search]);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      const from = location.state?.from?.pathname || '/desktop';
      navigate(from, { replace: true });
    }
  }, [authChecked, isAuthenticated, navigate, location]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanTenantSlug = tenantSlug.trim();
    const cleanEmail = email.trim();

    if (!cleanTenantSlug) {
      setError(t('login.tenantRequired', {}, 'Zəhmət olmasa Şirkət Kodunu (Tenant Slug) qeyd edin.'));
      return;
    }

    if (!cleanEmail) {
      setError(t('login.emailRequired', {}, 'Zəhmət olmasa E-poçt ünvanınızı qeyd edin.'));
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, password, cleanTenantSlug);
      const from = location.state?.from?.pathname || '/desktop';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || t('login.invalidCredentials', {}, 'Giriş uğursuz oldu. E-poçt, şifrə və ya şirkət kodu yanlışdır.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-screen overflow-x-hidden flex font-body-md transition-colors duration-300 ${
        isDarkMode ? 'bg-[#08090C] text-white' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Top Floating Bar for Back & Theme/Lang Toggle */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between pointer-events-auto">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-label-sm uppercase tracking-wider font-semibold backdrop-blur-md border transition-all ${
            isDarkMode
              ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              : 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm hover:bg-white'
          }`}
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span>{t('login.backHome', {}, 'Ana Səhifə')}</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase transition-all cursor-pointer ${
                  language === lang.code
                    ? 'bg-violet-600 text-white shadow-sm'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                : 'bg-white/90 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm hover:bg-white'
            }`}
            title={isDarkMode ? t('desktop.themeLight', {}, 'İşıqlı Rejim') : t('desktop.themeDark', {}, 'Qaranlıq Rejim')}
          >
            <span className="material-symbols-outlined text-lg leading-none block">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>

      {/* Left Side: Ambient Branding & Dashboard Preview */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden border-r ${
          isDarkMode
            ? 'bg-[#0C0E14] border-white/10'
            : 'bg-gradient-to-br from-slate-50 via-white to-violet-50/40 border-slate-200'
        }`}
      >
        {/* Ambient Halo Glow */}
        <div className="blob-atmosphere -top-20 -left-20 w-96 h-96 opacity-50"></div>
        <div className="blob-atmosphere -bottom-20 -right-20 w-96 h-96 opacity-40 bg-secondary/30"></div>

        <div className="z-10 w-full max-w-xl flex flex-col gap-8 pt-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 w-fit mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-xs uppercase tracking-widest text-primary font-bold">
                {t('login.heroBadge', {}, 'Altensor Enterprise Suite')}
              </span>
            </div>
            <h1
              className={`font-headline-display text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-3 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              {t('login.heroTitle', {}, 'Bütün biznesiniz üçün tək vahid platforma')}
            </h1>
            <p className={`font-body-md text-sm leading-relaxed max-w-md ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('login.heroDesc', {}, 'Task Management, CRM və gələcək bütün biznes modullarınızı tək hesab ilə mərkəzdən idarə edin.')}
            </p>
          </div>

          {/* Interactive Frost Card Mockup */}
          <div
            className={`relative w-full rounded-3xl p-3 shadow-2xl backdrop-blur-xl border transition-transform duration-500 hover:scale-[1.01] ${
              isDarkMode ? 'glass-card border-white/15 bg-white/[0.02]' : 'bg-white border-slate-200 shadow-xl'
            }`}
          >
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/20 bg-black/20">
              <img
                src={crmHeroPreview}
                alt="Altensor Preview"
                className="w-full h-auto object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-[420px] flex flex-col gap-6">
          
          {/* Branding Header */}
          <div className="flex flex-col items-start gap-3">
            <Link to="/" className="inline-block p-3 rounded-2xl border shadow-md transition-all group"
              style={{
                backgroundColor: isDarkMode ? '#11131A' : '#FFFFFF',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'
              }}
            >
              <img src={altensorLogo} alt="Altensor Logo" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
            </Link>
            
            <h2 className={`font-headline-display text-3xl font-bold tracking-tight mt-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {t('login.title', {}, 'Vahid Giriş Portalı')}
            </h2>
            <p className={`font-body-md text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('login.subtitle', {}, 'Altensor ekosisteminə daxil olmaq üçün korporativ məlumatlarınızı daxil edin.')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
            {error && (
              <div className="p-3.5 bg-red-500/10 text-red-500 text-xs rounded-xl border border-red-500/20 font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {/* Tenant Slug Input */}
            <div className="flex flex-col gap-1.5">
              <label className={`font-label-sm text-xs uppercase tracking-wider font-semibold ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`} htmlFor="tenantSlug">
                {t('login.tenantSlug', {}, 'Şirkət Kodu (Tenant)')}
              </label>
              <div
                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-white/[0.04] border-white/15 focus-within:border-primary focus-within:bg-white/[0.07]'
                    : 'bg-white border-slate-300 focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100'
                }`}
              >
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">
                  domain
                </span>
                <input
                  className={`w-full h-full pl-12 pr-4 bg-transparent border-none outline-none font-body-md text-sm font-medium ${
                    isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                  }`}
                  id="tenantSlug"
                  placeholder={t('login.tenantPlaceholder', {}, 'demo-tenant')}
                  type="text"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className={`font-label-sm text-xs uppercase tracking-wider font-semibold ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`} htmlFor="email">
                {t('login.email', {}, 'Korporativ E-poçt')}
              </label>
              <div
                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-white/[0.04] border-white/15 focus-within:border-primary focus-within:bg-white/[0.07]'
                    : 'bg-white border-slate-300 focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100'
                }`}
              >
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">
                  mail
                </span>
                <input
                  className={`w-full h-full pl-12 pr-4 bg-transparent border-none outline-none font-body-md text-sm ${
                    isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                  }`}
                  id="email"
                  placeholder={t('login.emailPlaceholder', {}, 'ad@sirket.com')}
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
                <label className={`font-label-sm text-xs uppercase tracking-wider font-semibold ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`} htmlFor="password">
                  {t('login.password', {}, 'Şifrə')}
                </label>
              </div>
              <div
                className={`relative flex items-center h-12 rounded-xl border transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-white/[0.04] border-white/15 focus-within:border-primary focus-within:bg-white/[0.07]'
                    : 'bg-white border-slate-300 focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-100'
                }`}
              >
                <span className="material-symbols-outlined absolute left-4 text-slate-400 text-xl">
                  lock
                </span>
                <input
                  className={`w-full h-full pl-12 pr-12 bg-transparent border-none outline-none font-body-md text-sm ${
                    isDarkMode ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                  }`}
                  id="password"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              className="h-12 w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-label-md text-xs uppercase tracking-widest font-bold shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              type="submit"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>{t('login.submitting', {}, 'Daxil olunur...')}</span>
                </>
              ) : (
                t('login.submit', {}, 'Daxil Ol')
              )}
            </button>
          </form>

          {/* Bottom SSL Badge */}
          <div className={`pt-4 border-t flex items-center justify-between text-xs transition-colors ${
            isDarkMode ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'
          }`}>
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

export default LoginPage;
