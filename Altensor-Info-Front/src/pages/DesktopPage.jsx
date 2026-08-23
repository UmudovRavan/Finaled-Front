import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Lock,
  AlertCircle,
  X
} from 'lucide-react';
import altensorLogo from '../assets/Altensor-Logo.png';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';
import altensorCrmLogo from '../assets/Altensor_CRM_Logo.svg';
import authLogo from '../assets/auth-logo.svg';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken, getCurrentUser, usersApi } from '../services/api';

const appsList = [
  {
    id: 'tasks',
    name: 'Task Management',
    logo: taskManagementLogo,
    externalRoute: import.meta.env.VITE_TMS_WEB_URL || 'https://tms.altensor.com',
    requiredModule: 'tms'
  },
  {
    id: 'crm',
    name: 'Altensor CRM',
    logo: altensorCrmLogo,
    externalRoute: import.meta.env.VITE_CRM_WEB_URL || 'https://info.altensor.com',
    requiredModule: 'crm'
  },
  {
    id: 'auth',
    name: 'Auth Service',
    logo: authLogo,
    externalRoute: import.meta.env.VITE_AUTH_WEB_URL || 'https://auth.altensor.com',
    requiredModule: 'auth'
  }
];

const DesktopPage = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accessDeniedModal, setAccessDeniedModal] = useState(null);
  const [userData, setUserData] = useState(() => getCurrentUser());
  const { isDark, toggleTheme } = useTheme();
  const isDarkMode = isDark;
  const { user, logout: authLogout, setUser } = useAuth();
  const { t, language, setLanguage, languages } = useLanguage();

  const [userProfile, setUserProfile] = useState({
    name: 'User',
    initial: 'U',
    avatarUrl: null
  });

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Load current user profile from /auth/me for fresh modules & header avatar
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await usersApi.getMe();
        if (me) {
          setUserData(me);
          if (setUser) setUser(me);
          const profileName = me.name || me.fullName || me.email || 'User';
          setUserProfile({
            name: profileName,
            initial: profileName.charAt(0).toUpperCase() || 'U',
            avatarUrl: me.avatarUrl || null
          });
        }
      } catch (err) {
        console.warn('Notice loading current user profile for Desktop:', err);
      }
    };
    fetchMe();
  }, [setUser]);

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeUser = userData || user || getCurrentUser();
  const userModules = (activeUser?.modules || []).map((m) => String(m).trim().toLowerCase());
  const userRoles = (activeUser?.roles || []).map((r) => String(r).trim().toLowerCase());
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin') || userRoles.includes('owner');

  const hasAccessToApp = (app) => {
    if (!app.requiredModule) return true;
    if (isAdmin) return true;

    const target = app.requiredModule.toLowerCase(); // 'tms' or 'crm' or 'auth'
    return userModules.some((m) => {
      if (m === target) return true;
      if (target === 'tms' && (m === 'task' || m === 'tasks' || m === 'task-management')) return true;
      if (target === 'crm' && m === 'crm') return true;
      if (target === 'auth' && (m === 'auth' || m === 'authorization' || m === 'identity')) return true;
      return false;
    });
  };

  const filteredApps = appsList.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (app) => {
    const hasAccess = hasAccessToApp(app);

    if (!hasAccess) {
      setAccessDeniedModal(app);
      return;
    }

    if (app.externalRoute) {
      const token = getAuthToken() || localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
      const refreshToken = localStorage.getItem('refreshToken') || '';
      const tenant = activeUser?.tenantSlug || '';

      if (!token) {
        navigate('/login');
        return;
      }

      const params = new URLSearchParams();
      params.append('token', token);
      if (refreshToken) params.append('refreshToken', refreshToken);
      if (tenant) params.append('tenant', tenant);

      const baseUrl = app.externalRoute.replace(/\/+$/, '');
      const targetUrl = `${baseUrl}/?${params.toString()}`;

      window.open(targetUrl, '_blank');
    } else if (app.route) {
      navigate(app.route);
    }
  };

  const handleLogout = async () => {
    if (authLogout) {
      await authLogout();
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col antialiased transition-colors duration-200 ${isDarkMode ? 'bg-[#0F172A] text-slate-100 selection:bg-indigo-900' : 'bg-white text-slate-800 selection:bg-indigo-100'
      }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-[#0F172A]/90 border-slate-800/80' : 'bg-white/90 border-slate-100'
        }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <img src={altensorLogo} alt="Altensor Logo" className="h-8 w-auto object-contain cursor-pointer" onClick={() => navigate('/desktop')} />
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md mx-6 relative">
            <div className="relative flex items-center w-full">
              <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={t('desktop.searchPlaceholder', {}, 'Axtar...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-sm rounded-full pl-10 pr-16 py-2 border transition-all placeholder:text-slate-400 focus:outline-none ${isDarkMode
                  ? 'bg-[#1E293B] text-white border-transparent focus:border-slate-700'
                  : 'bg-[#F3F4F6] text-slate-700 hover:bg-[#EEF2F6] focus:bg-white border-transparent focus:border-slate-200'
                  }`}
              />
              <span className={`absolute right-3 text-[11px] font-medium px-1.5 py-0.5 rounded border pointer-events-none ${isDarkMode ? 'text-slate-400 bg-slate-800/60 border-slate-700' : 'text-slate-400 bg-white/60 border-slate-200/60'
                }`}>
                Ctrl+K
              </span>
            </div>
          </div>

          {/* Right: Actions & User Avatar Dropdown */}
          <div className="flex items-center gap-3 relative" ref={menuRef}>
            <button className={`p-2 rounded-full transition-colors relative cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`} title={t('common.notifications', {}, 'Bildirişlər')}>
              <Bell className="w-5 h-5 stroke-[1.75]" />
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center cursor-pointer shadow-sm hover:ring-2 hover:ring-emerald-200 transition-all shrink-0 border border-slate-200/40"
              id="userMenuBtn"
            >
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl.startsWith('http') ? userProfile.avatarUrl : `https://api-crm.altensor.com${userProfile.avatarUrl}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#15803D] font-semibold text-sm flex items-center justify-center">
                  {userProfile.initial}
                </div>
              )}
            </button>

            {/* Clean Dropdown Menu */}
            {isUserMenuOpen && (
              <div className={`absolute top-12 right-0 w-64 rounded-2xl border shadow-xl p-3 z-50 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150 ${isDarkMode ? 'bg-[#1C1C1E] border-[#2C2C2E] text-white' : 'bg-white border-slate-100 text-slate-700'
                }`}>
                {/* Language Selection */}
                <div className="px-2 py-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {t('settings.languageTitle', {}, 'İnterfeys Dili')}
                  </span>
                  <div className="space-y-1">
                    {[
                      { code: 'az', name: 'Azərbaycan dili', flag: '🇦🇿' },
                      { code: 'en', name: 'English', flag: '🇬🇧' },
                      { code: 'ru', name: 'Русский', flag: '🇷🇺' }
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          language === l.code
                            ? isDarkMode
                              ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30'
                              : 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                            : isDarkMode
                            ? 'text-slate-300 hover:bg-[#27272A]'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.name}</span>
                        </span>
                        {language === l.code && <span className="text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} my-1`}></div>

                <button
                  onClick={() => {
                    toggleTheme();
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${isDarkMode ? 'hover:bg-[#27272A] text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                  <span>{isDarkMode ? t('desktop.themeLight', {}, 'İşıqlı Rejim') : t('desktop.themeDark', {}, 'Qaranlıq Rejim')}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${isDarkMode ? 'hover:bg-[#27272A] text-red-400' : 'hover:bg-slate-50 text-red-600'
                    }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('desktop.logout', {}, 'Çıxış')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-20 flex flex-col items-center justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 md:gap-16 w-full justify-items-center max-w-3xl">
          {filteredApps.map((app) => {
            const hasAccess = hasAccessToApp(app);

            return (
              <div
                key={app.id}
                onClick={() => handleAppClick(app)}
                className="flex flex-col items-center group cursor-pointer w-32 sm:w-40 md:w-44 relative"
              >
                {/* iOS Squircle Icon Container - Theme Aware */}
                <div
                  className={`w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-[28px] sm:rounded-[36px] flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 relative overflow-hidden ${
                    !hasAccess ? 'opacity-70 grayscale-[25%]' : ''
                  } ${isDarkMode
                    ? 'bg-[#0B0F17] border border-slate-800/90 shadow-xl shadow-black/50 hover:border-slate-700 hover:shadow-indigo-500/20'
                    : 'bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 hover:border-slate-300 hover:shadow-slate-300/80'
                    }`}
                >
                  <img src={app.logo} alt={app.name} className="w-full h-full object-contain p-2 sm:p-3" />

                  {/* Lock Badge if no access */}
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-amber-400 shadow-lg">
                        <Lock className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Icon Label */}
                <div className="flex items-center gap-1.5 mt-3.5 justify-center w-full">
                  <span className={`text-sm sm:text-base md:text-lg font-semibold text-center tracking-tight truncate transition-colors ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                    {app.id === 'tasks' ? t('desktop.tasksAppName', {}, app.name) : app.id === 'crm' ? t('desktop.crmAppName', {}, app.name) : t('desktop.authAppName', {}, app.name)}
                  </span>
                  {!hasAccess && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      {t('common.locked', {}, 'Kilidli')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Access Denied Modal on Desktop */}
      {accessDeniedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative animate-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-[#12141A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => setAccessDeniedModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {accessDeniedModal.id === 'tasks' ? t('desktop.tasksAppName', {}, accessDeniedModal.name) : accessDeniedModal.id === 'crm' ? t('desktop.crmAppName', {}, accessDeniedModal.name) : t('desktop.authAppName', {}, accessDeniedModal.name)}
                </h3>
                <p className="text-xs text-amber-400 font-semibold">{t('desktop.noAccessTitle', {}, 'Giriş Məhdudiyyəti')}</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              {t('desktop.noAccessDesc', {}, 'Bu modula daxil olmaq üçün təşkilatınızda müvafiq icazə aktiv edilməyib.')}
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>{t('desktop.contactAdmin', {}, 'Daxil olmaq üçün təşkilat administratorunuzla əlaqə saxlayın.')}</span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAccessDeniedModal(null)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                {t('common.confirm', {}, 'Anladım')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopPage;
