import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAuthToken } from '../services/api';
import altensorLogo from '../assets/Altensor-Logo.png';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';
import altensorCrmLogo from '../assets/Altensor_CRM_Logo.svg';

const TopNavbar = () => {
  const auth = useAuth();
  const token = auth?.token || getAuthToken();
  const isUserLoggedIn = Boolean(token);
  const startDestination = isUserLoggedIn ? '/desktop' : '/login';
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();
  const isDarkMode = isDark;

  const langMenuRef = useRef(null);

  const appsMenuRef = useRef(null);
  const location = useLocation();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (appsMenuRef.current && !appsMenuRef.current.contains(event.target)) {
        setIsAppsOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsAppsOpen(false);
    setIsLangOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-2xl border-b transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#0b0c10]/85 border-white/10 shadow-2xl text-white'
          : 'bg-white/90 border-slate-200 shadow-sm text-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-3.5 flex justify-between items-center relative">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={altensorLogo}
            alt="Altensor Logo"
            className="h-8 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span
            className={`font-headline-display text-xl md:text-2xl font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Altensor
          </span>
        </Link>

        {/* Center Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7">
          {/* Apps Mega Menu Toggle Button */}
          <div className="relative" ref={appsMenuRef}>
            <button
              onClick={() => setIsAppsOpen(!isAppsOpen)}
              className={`inline-flex items-center gap-1.5 font-label-sm text-xs uppercase tracking-wider transition-all px-3 py-1.5 rounded-full ${
                isAppsOpen
                  ? isDarkMode
                    ? 'text-primary bg-white/10 font-semibold'
                    : 'text-violet-600 bg-slate-100 font-semibold'
                  : isDarkMode
                  ? 'text-on-surface-variant hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-base">apps</span>
              <span>Tətbiqlər</span>
              <span
                className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                  isAppsOpen ? 'rotate-180 text-primary' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {/* Mega Menu Dropdown */}
            {isAppsOpen && (
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[920px] max-w-[95vw] rounded-3xl backdrop-blur-2xl border p-8 animate-in fade-in slide-in-from-top-2 duration-200 z-50 ${
                  isDarkMode
                    ? 'bg-[#0e1017]/95 border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)]'
                    : 'bg-white border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)]'
                }`}
              >
                <div
                  className={`grid grid-cols-4 gap-8 pb-6 border-b ${
                    isDarkMode ? 'border-white/10' : 'border-slate-100'
                  }`}
                >
                  {/* Category 1: Əməliyyatlar */}
                  <div>
                    <h4 className="font-label-sm text-[11px] uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Əməliyyatlar
                    </h4>
                    <ul className="space-y-3.5">
                      <li>
                        <Link
                          to="/#product"
                          onClick={() => setIsAppsOpen(false)}
                          className={`group flex items-start gap-3 p-1.5 rounded-xl transition-all ${
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center p-1.5 border shrink-0 ${
                              isDarkMode
                                ? 'bg-surface-container border-primary/20 group-hover:border-primary'
                                : 'bg-slate-50 border-slate-200 group-hover:border-primary'
                            }`}
                          >
                            <img src={taskManagementLogo} alt="Task Management" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span
                              className={`font-headline-display text-sm font-semibold block transition-colors ${
                                isDarkMode
                                  ? 'text-white group-hover:text-primary'
                                  : 'text-slate-900 group-hover:text-primary'
                              }`}
                            >
                              Task Management
                            </span>
                            <span className="text-[11px] text-on-surface-variant/70 leading-tight block">
                              Çevik tapşırıq və kanban axını
                            </span>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#product"
                          onClick={() => setIsAppsOpen(false)}
                          className={`group block p-1.5 rounded-xl transition-all ${
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                            }`}
                          >
                            Sprint Planlama
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60">
                            Mərhələlər və hədəf izləmə
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#product"
                          onClick={() => setIsAppsOpen(false)}
                          className={`group block p-1.5 rounded-xl transition-all ${
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                            }`}
                          >
                            İş Yükü İdarəsi
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60">
                            Komanda resurs balanslaşdırma
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Category 2: Satış & CRM */}
                  <div>
                    <h4 className="font-label-sm text-[11px] uppercase tracking-widest text-secondary font-bold mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      Satış & CRM
                    </h4>
                    <ul className="space-y-3.5">
                      <li>
                        <Link
                          to="/#product"
                          onClick={() => setIsAppsOpen(false)}
                          className={`group flex items-start gap-3 p-1.5 rounded-xl transition-all ${
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center p-1.5 border shrink-0 ${
                              isDarkMode
                                ? 'bg-surface-container border-secondary/20 group-hover:border-secondary'
                                : 'bg-slate-50 border-slate-200 group-hover:border-secondary'
                            }`}
                          >
                            <img src={altensorCrmLogo} alt="Altensor CRM" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <span
                              className={`font-headline-display text-sm font-semibold block transition-colors ${
                                isDarkMode
                                  ? 'text-white group-hover:text-secondary'
                                  : 'text-slate-900 group-hover:text-violet-600'
                              }`}
                            >
                              Altensor CRM
                            </span>
                            <span className="text-[11px] text-on-surface-variant/70 leading-tight block">
                              Müştəri və sövdələşmə borusu
                            </span>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#product"
                          onClick={() => setIsAppsOpen(false)}
                          className={`group block p-1.5 rounded-xl transition-all ${
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                            }`}
                          >
                            Sövdələşmələr & Müqavilələr
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60">
                            B2B satış mərhələləri
                          </span>
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#product"
                          onClick={() => setIsAppsOpen(false)}
                          className={`group block p-1.5 rounded-xl transition-all ${
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                            }`}
                          >
                            Təşkilatlar & Əlaqələr
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60">
                            Vahid korporativ ünvanlar
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Category 3: Süni İntellekt */}
                  <div>
                    <h4 className="font-label-sm text-[11px] uppercase tracking-widest text-sky-500 font-bold mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      Süni İntellekt
                    </h4>
                    <ul className="space-y-3.5">
                      <li>
                        <div className="p-1.5 rounded-xl">
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            Editorial AI
                          </span>
                          <span className="text-[11px] text-on-surface-variant/70 block">
                            Avtomatlaşdırılmış brifinq sintezi
                          </span>
                        </div>
                      </li>
                      <li>
                        <div className="p-1.5 rounded-xl">
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200' : 'text-slate-700'
                            }`}
                          >
                            Gəlir Analitikası
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60 block">
                            Proqnozlaşdırılan artım modeli
                          </span>
                        </div>
                      </li>
                      <li>
                        <div className="p-1.5 rounded-xl">
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200' : 'text-slate-700'
                            }`}
                          >
                            Ağıllı Siqnallar
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60 block">
                            Yüksək prioritetli tələblər
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Category 4: Platforma */}
                  <div>
                    <h4 className="font-label-sm text-[11px] uppercase tracking-widest text-emerald-500 font-bold mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Platforma
                    </h4>
                    <ul className="space-y-3.5">
                      <li>
                        <Link
                          to="/login"
                          onClick={() => setIsAppsOpen(false)}
                          className={`group block p-1.5 rounded-xl transition-all ${
                            isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                            }`}
                          >
                            Desktop / Workspace
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60">
                            Vahid tətbiq mərkəzi
                          </span>
                        </Link>
                      </li>
                      <li>
                        <div className="p-1.5 rounded-xl">
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200' : 'text-slate-700'
                            }`}
                          >
                            Zəng Tarixçəsi
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60 block">
                            Danışıq qeydiyyatı
                          </span>
                        </div>
                      </li>
                      <li>
                        <div className="p-1.5 rounded-xl">
                          <span
                            className={`font-headline-display text-xs font-semibold block ${
                              isDarkMode ? 'text-slate-200' : 'text-slate-700'
                            }`}
                          >
                            Bildirişlər
                          </span>
                          <span className="text-[11px] text-on-surface-variant/60 block">
                            Mərkəzi siqnal axını
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Mega Menu Footer Banner */}
                <div className="pt-4 flex items-center justify-between text-xs text-on-surface-variant/80">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 99.9% Uptime
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">security</span> Enterprise Təhlükəsizlik
                    </span>
                  </div>
                  <Link
                    to="/login"
                    onClick={() => setIsAppsOpen(false)}
                    className="font-label-sm uppercase tracking-wider text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    Bütün Tətbiqlərə Keçid →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Standard Navigation Links */}
          <Link
            to="/#product"
            className={`font-label-sm text-xs uppercase tracking-wider transition-colors ${
              isDarkMode ? 'text-on-surface-variant hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Məhsul
          </Link>

          <Link
            to="/about"
            className={`font-label-sm text-xs uppercase tracking-wider transition-colors ${
              location.pathname === '/about'
                ? 'text-primary font-semibold border-b-2 border-primary pb-0.5'
                : isDarkMode
                ? 'text-on-surface-variant hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Haqqımızda
          </Link>
        </div>

        {/* Right CTA Actions: Language, Theme Toggle, Login & Get Started */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isDarkMode
                  ? 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                  : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={t('navbar.language', {}, 'Dil')}
            >
              <span>{language === 'az' ? '🇦🇿 AZ' : language === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}</span>
            </button>

            {isLangOpen && (
              <div
                className={`absolute right-0 mt-2 w-44 rounded-2xl border shadow-2xl p-1.5 z-50 text-xs animate-in fade-in duration-150 ${
                  isDarkMode ? 'bg-[#1C1C1E] border-[#2C2C2E] text-[#E4E4E7]' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                }`}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setIsLangOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl transition-colors text-left cursor-pointer ${
                      language === l.code
                        ? isDarkMode ? 'bg-[#2C2C2E] text-white font-bold' : 'bg-slate-100 text-slate-950 font-bold'
                        : isDarkMode ? 'hover:bg-[#2C2C2E]/60 text-[#D4D4D8]' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.name}</span>
                    </span>
                    {language === l.code && <span className="text-sky-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all cursor-pointer border ${
              isDarkMode
                ? 'border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title={isDarkMode ? 'İşıqlı Rejimə Keç' : 'Qaranlıq Rejimə Keç'}
          >
            <span className="material-symbols-outlined text-lg leading-none block">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          <Link
            to={isUserLoggedIn ? '/desktop' : '/login'}
            className={`px-5 py-2 rounded-full font-label-sm text-xs uppercase tracking-widest transition-all font-semibold border ${
              isDarkMode
                ? 'border-white/10 text-slate-300 hover:text-white hover:border-white/30 hover:bg-white/5'
                : 'border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {isUserLoggedIn ? 'Workspace' : (language === 'az' ? 'Daxil Ol' : language === 'en' ? 'Log In' : 'Войти')}
          </Link>
          <Link
            to={startDestination}
            className="btn-primary px-6 py-2.5 rounded-full font-label-sm text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-md font-semibold"
          >
            {language === 'az' ? 'Başlayın' : language === 'en' ? 'Get Started' : 'Начать'}
          </Link>
        </div>

        {/* Mobile Actions (Theme Toggle & Menu) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all border ${
              isDarkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg leading-none block">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden border-t px-6 py-6 space-y-4 ${
            isDarkMode ? 'bg-[#0d0f17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className={`space-y-3 pb-4 border-b ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
            <span className="text-[11px] font-label-sm uppercase tracking-widest text-primary font-bold block">
              Tətbiqlər
            </span>
            <Link
              to="/#product"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm"
            >
              <img src={taskManagementLogo} alt="Tasks" className="w-5 h-5 object-contain" /> Task Management
            </Link>
            <Link
              to="/#product"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 text-sm"
            >
              <img src={altensorCrmLogo} alt="CRM" className="w-5 h-5 object-contain" /> Altensor CRM
            </Link>
          </div>

          <div className={`flex flex-col gap-3 pb-4 border-b text-sm ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
            <Link to="/#product" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">
              Məhsul
            </Link>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-primary">
              Haqqımızda
            </Link>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              to={isUserLoggedIn ? '/desktop' : '/login'}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full text-center py-2.5 rounded-full border text-xs uppercase font-bold tracking-wider ${
                isDarkMode ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-700'
              }`}
            >
              {isUserLoggedIn ? 'Workspace' : 'Daxil Ol'}
            </Link>
            <Link
              to={startDestination}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full btn-primary text-white text-xs uppercase font-bold tracking-wider"
            >
              Başlayın
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default TopNavbar;
