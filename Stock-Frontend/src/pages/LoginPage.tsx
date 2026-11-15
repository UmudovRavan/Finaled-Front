import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Check,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import stockLogo from '../assets/Stock-Logo.svg';
import crmHeroPreview from '../assets/crm_hero_preview.png';
import { authService } from '../api';
import { useAuth } from '../context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, type Language } from '../context/LanguageContext';
import { isTokenExpired } from '../utils';

interface LoginCopy {
  platformBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  accuracyLabel: string;
  accuracyValue: string;
  syncLabel: string;
  syncValue: string;
  brandSubtitle: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  tenantLabel: string;
  tenantPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submitBtn: string;
  submittingBtn: string;
  sslProtected: string;
  expiredMsg: string;
  missingFields: string;
  invalidCreds: string;
  noAccess: string;
  loginFailed: string;
  networkError: string;
}

const LOGIN_COPY: Record<Language, LoginCopy> = {
  az: {
    platformBadge: 'ALTENSOR MULTI-TENANT PLATFORM',
    heroTitle: 'Anbar və stokunuzu zirvəyə daşıyın',
    heroSubtitle:
      'Anbar əməliyyatlarını, stok qalıqlarını və təchizat axınını tək bir ağıllı platformada idarə edin.',
    accuracyLabel: 'STOK DƏQİQLİYİ',
    accuracyValue: '99.2% İnventar Nəzarəti',
    syncLabel: 'AKTİV ANBARLAR',
    syncValue: 'Canlı Sinxronizasiya',
    brandSubtitle: 'Stock Management',
    welcomeTitle: 'Xoş Gəlmisiniz',
    welcomeSubtitle: 'Şirkət hesabınıza daxil olmaq üçün məlumatlarınızı qeyd edin.',
    tenantLabel: 'ŞİRKƏT KODU / WORKSPACE SLUG',
    tenantPlaceholder: 'məs: bmg',
    emailLabel: 'E-POÇT ÜNVANI',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'ŞİFRƏ',
    passwordPlaceholder: '••••••••••••',
    submitBtn: 'DAXİL OL',
    submittingBtn: 'DAXİL OLUNUR...',
    sslProtected: '256-BIT SSL QORUNUR',
    expiredMsg: 'Sessiyanızın müddəti bitdi. Zəhmət olmasa yenidən daxil olun.',
    missingFields: 'Zəhmət olmasa şirkət kodu, e-poçt və şifrəni daxil edin.',
    invalidCreds: 'E-poçt, şifrə və ya şirkət kodu yanlışdır.',
    noAccess: 'Bu hesabın Stock moduluna giriş icazəsi yoxdur.',
    loginFailed: 'Daxil olmaq mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.',
    networkError: 'Serverə qoşulmaq mümkün olmadı. İnternet və ya Auth server bağlantısını yoxlayın.',
  },
  en: {
    platformBadge: 'ALTENSOR MULTI-TENANT PLATFORM',
    heroTitle: 'Elevate your inventory to the peak',
    heroSubtitle:
      'Manage warehouse operations, stock balances, and supply workflows in one intelligent platform.',
    accuracyLabel: 'STOCK ACCURACY',
    accuracyValue: '99.2% Inventory Control',
    syncLabel: 'ACTIVE WAREHOUSES',
    syncValue: 'Live Synchronization',
    brandSubtitle: 'Stock Management',
    welcomeTitle: 'Welcome Back',
    welcomeSubtitle: 'Enter your details to sign in to your company workspace.',
    tenantLabel: 'COMPANY CODE / WORKSPACE SLUG',
    tenantPlaceholder: 'e.g. bmg',
    emailLabel: 'EMAIL ADDRESS',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'PASSWORD',
    passwordPlaceholder: '••••••••••••',
    submitBtn: 'SIGN IN',
    submittingBtn: 'SIGNING IN...',
    sslProtected: '256-BIT SSL PROTECTED',
    expiredMsg: 'Your session has expired. Please sign in again.',
    missingFields: 'Please enter company code, email, and password.',
    invalidCreds: 'Invalid email, password, or company code.',
    noAccess: 'This account does not have access to the Stock module.',
    loginFailed: 'Sign in failed. Please try again.',
    networkError: 'Unable to reach the server. Please check your connection.',
  },
  ru: {
    platformBadge: 'ALTENSOR MULTI-TENANT PLATFORM',
    heroTitle: 'Поднимите ваш склад на новый уровень',
    heroSubtitle:
      'Управляйте складскими операциями, остатками и цепочками поставок на единой умной платформе.',
    accuracyLabel: 'ТОЧНОСТЬ УЧЕТА',
    accuracyValue: '99.2% Контроль запасов',
    syncLabel: 'АКТИВНЫЕ СКЛАДЫ',
    syncValue: 'Живая синхронизация',
    brandSubtitle: 'Stock Management',
    welcomeTitle: 'Добро пожаловать',
    welcomeSubtitle: 'Введите данные для входа в рабочее пространство компании.',
    tenantLabel: 'КОД КОМПАНИИ / WORKSPACE SLUG',
    tenantPlaceholder: 'напр: bmg',
    emailLabel: 'ЭЛ. ПОЧТА',
    emailPlaceholder: 'name@company.com',
    passwordLabel: 'ПАРОЛЬ',
    passwordPlaceholder: '••••••••••••',
    submitBtn: 'ВОЙТИ',
    submittingBtn: 'ВХОД...',
    sslProtected: 'ЗАЩИЩЕНО 256-BIT SSL',
    expiredMsg: 'Срок действия сессии истек. Пожалуйста, войдите снова.',
    missingFields: 'Пожалуйста, введите код компании, эл. почту и пароль.',
    invalidCreds: 'Неверная эл. почта, пароль или код компании.',
    noAccess: 'У этой учетной записи нет доступа к модулю Stock.',
    loginFailed: 'Не удалось войти. Пожалуйста, попробуйте снова.',
    networkError: 'Не удалось подключиться к серверу. Проверьте соединение.',
  },
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const copy = LOGIN_COPY[language] || LOGIN_COPY.az;

  const queryParams = new URLSearchParams(location.search);
  const isExpired = queryParams.get('expired') === 'true';
  const prefillTenant = queryParams.get('tenant') || authService.getLastTenantSlug() || '';

  const [tenantSlug, setTenantSlug] = useState(prefillTenant);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = authService.getAccessToken();
    if (isAuthenticated || (token && !isTokenExpired(token))) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password || !tenantSlug.trim()) {
      setError(copy.missingFields);
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.login({
        email: email.trim(),
        password,
        tenantSlug: tenantSlug.trim(),
      });

      if (data?.accessToken) {
        login(data);
      }

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr?.response?.status === 401) {
        setError(copy.invalidCreds);
      } else if (axiosErr?.response?.status === 403) {
        setError(copy.noAccess);
      } else if (axiosErr?.response?.data?.message) {
        setError(axiosErr.response.data.message);
      } else {
        setError(copy.networkError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex transition-colors duration-300 ${
        isDark ? 'bg-[#080A0F] text-white' : 'bg-white text-slate-900'
      }`}
    >
      {/* Top-right controls: Language Switcher & Theme Toggle */}
      <div className="fixed top-5 right-6 z-50 flex items-center gap-2.5">
        <div
          className={`flex items-center p-1 rounded-full border backdrop-blur-md transition-colors ${
            isDark
              ? 'bg-white/[0.04] border-white/[0.08]'
              : 'bg-slate-100/90 border-slate-200'
          }`}
        >
          {(['az', 'en', 'ru'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all ${
                language === lang
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`w-9 h-9 rounded-full flex items-center justify-center border backdrop-blur-md transition-colors ${
            isDark
              ? 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]'
              : 'bg-slate-100/90 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Left Panel: Branding & Hero Preview */}
      <div
        className={`hidden lg:flex lg:w-[46%] xl:w-[44%] relative overflow-hidden p-11 xl:p-14 flex-col justify-between border-r transition-colors duration-300 ${
          isDark
            ? 'bg-[#0C0E14] border-white/[0.06]'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={`absolute -top-32 -left-24 w-[460px] h-[460px] rounded-full blur-[130px] ${
              isDark ? 'bg-indigo-600/20' : 'bg-blue-400/15'
            }`}
          />
          <div
            className={`absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full blur-[130px] ${
              isDark ? 'bg-blue-600/15' : 'bg-indigo-400/15'
            }`}
          />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 max-w-md pt-2">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[10px] font-semibold tracking-[0.14em] uppercase mb-6 ${
              isDark
                ? 'bg-blue-500/10 border-blue-500/25 text-blue-400'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            {copy.platformBadge}
          </div>

          <h1
            className={`text-3xl xl:text-[34px] font-bold leading-[1.2] tracking-tight mb-4 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {copy.heroTitle}
          </h1>

          <p
            className={`text-sm leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {copy.heroSubtitle}
          </p>
        </div>

        {/* Preview Card + Floating Badges */}
        <div className="relative z-10 my-auto pt-8 pb-4">
          <div
            className={`relative rounded-[26px] p-4 border shadow-2xl transition-colors ${
              isDark
                ? 'bg-[#12151F]/90 border-white/[0.08] shadow-black/60'
                : 'bg-white/95 border-slate-200 shadow-slate-200/80'
            }`}
          >
            {/* Top-left floating stat badge */}
            <div
              className={`absolute -top-5 left-5 z-20 px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center gap-3 ${
                isDark
                  ? 'bg-[#161A25]/95 border-white/[0.1] shadow-black/50'
                  : 'bg-white/95 border-slate-200 shadow-slate-300/50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <div
                  className={`text-[9px] font-semibold tracking-[0.12em] uppercase ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {copy.accuracyLabel}
                </div>
                <div className="text-xs font-bold text-emerald-500">
                  {copy.accuracyValue}
                </div>
              </div>
            </div>

            {/* Dashboard Preview Image */}
            <div className="pt-4 pb-2">
              <img
                src={crmHeroPreview}
                alt="Altensor Stock Preview"
                className={`w-full h-auto rounded-2xl object-cover border ${
                  isDark ? 'border-white/[0.06]' : 'border-slate-200'
                }`}
              />
            </div>

            {/* Bottom-right floating stat badge */}
            <div
              className={`absolute -bottom-5 right-5 z-20 px-4 py-2.5 rounded-2xl border backdrop-blur-xl shadow-xl flex items-center gap-3 ${
                isDark
                  ? 'bg-[#161A25]/95 border-white/[0.1] shadow-black/50'
                  : 'bg-white/95 border-slate-200 shadow-slate-300/50'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <div>
                <div
                  className={`text-[9px] font-semibold tracking-[0.12em] uppercase ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {copy.syncLabel}
                </div>
                <div
                  className={`text-xs font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {copy.syncValue}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative">
        <div className="w-full max-w-[400px]">
          {/* Brand Pill */}
          <div
            className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border mb-7 ${
              isDark
                ? 'bg-white/[0.03] border-white/[0.08]'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center overflow-hidden p-1">
              <img src={stockLogo} alt="Altensor Stock" className="w-full h-full object-contain" />
            </div>
            <div>
              <div
                className={`text-[10px] font-bold tracking-[0.14em] uppercase leading-tight ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                ALTENSOR
              </div>
              <div
                className={`text-sm font-bold leading-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {copy.brandSubtitle}
              </div>
            </div>
          </div>

          {/* Heading */}
          <h2
            className={`text-3xl font-bold tracking-tight mb-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {copy.welcomeTitle}
          </h2>
          <p
            className={`text-sm mb-7 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {copy.welcomeSubtitle}
          </p>

          {/* Session Expired Notice */}
          {isExpired && !error && (
            <div
              className={`mb-5 px-4 py-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{copy.expiredMsg}</span>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div
              className={`mb-5 px-4 py-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                isDark
                  ? 'bg-red-500/10 border-red-500/25 text-red-300'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tenant Slug */}
            <div>
              <label
                htmlFor="tenantSlug"
                className={`block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {copy.tenantLabel}
              </label>
              <div className="relative">
                <Building2
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                />
                <input
                  id="tenantSlug"
                  type="text"
                  autoComplete="organization"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  placeholder={copy.tenantPlaceholder}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isDark
                      ? 'bg-[#12151E] border-white/[0.08] text-white placeholder:text-slate-500 focus:border-blue-500/60'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {copy.emailLabel}
              </label>
              <div className="relative">
                <Mail
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={copy.emailPlaceholder}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 pr-4 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isDark
                      ? 'bg-[#12151E] border-white/[0.08] text-white placeholder:text-slate-500 focus:border-blue-500/60'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className={`block text-[11px] font-semibold tracking-[0.08em] uppercase mb-2 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {copy.passwordLabel}
              </label>
              <div className="relative">
                <Lock
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={copy.passwordPlaceholder}
                  disabled={isLoading}
                  className={`w-full h-11 pl-10 pr-11 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    isDark
                      ? 'bg-[#12151E] border-white/[0.08] text-white placeholder:text-slate-500 focus:border-blue-500/60'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-11 mt-2 rounded-xl font-bold text-xs tracking-[0.12em] uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-[#0F1219] hover:bg-[#171C27] text-white border border-white/[0.12] shadow-lg shadow-black/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/15'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{copy.submittingBtn}</span>
                </>
              ) : (
                <span>{copy.submitBtn}</span>
              )}
            </button>
          </form>

          {/* Bottom Security Footer */}
          <div
            className={`mt-8 pt-5 border-t flex items-center justify-between text-[11px] ${
              isDark
                ? 'border-white/[0.06] text-slate-500'
                : 'border-slate-200 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{copy.sslProtected}</span>
            </div>
            <span>© Altensor Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
