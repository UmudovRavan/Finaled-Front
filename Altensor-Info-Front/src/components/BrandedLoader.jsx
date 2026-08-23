import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import altensorLogo from '../assets/Altensor-Logo.png';
import altensorCrmLogo from '../assets/Altensor_CRM_Logo.svg';

/**
 * Premium Full-Screen Context-Aware Branded Loading Overlay
 * - Differentiates between Public Site (Altensor Core) vs. CRM (Altensor CRM)
 * - Adapts 100% to active Theme (Dark, Light, Midnight Blue)
 * - 100% opaque, covers entire viewport (z-[999999])
 * - Prevents background content from flashing or showing prematurely
 * - Supports prefers-reduced-motion
 */
const BrandedLoader = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const isInitialLoad = useRef(true);
  const prevPathRef = useRef(null);
  
  const location = useLocation();
  const themeContext = useTheme();

  // Determine current active theme
  const getActiveTheme = () => {
    if (themeContext?.theme) return themeContext.theme;
    if (document.documentElement.classList.contains('light')) return 'light';
    if (document.documentElement.classList.contains('midnight')) return 'midnight';
    const local = localStorage.getItem('altensor_theme') || localStorage.getItem('desktopTheme') || localStorage.getItem('theme');
    return local || 'dark';
  };

  const activeTheme = getActiveTheme();
  const isLight = activeTheme === 'light';
  const isMidnight = activeTheme === 'midnight';

  // Determine Section Context: CRM vs Site/Desktop
  const isCrmRoute = location.pathname.startsWith('/crm');
  const isDesktopRoute = location.pathname.startsWith('/desktop') || location.pathname.startsWith('/workspace');

  // 1. Initial Full Page Load Handler
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minHoldDuration = prefersReducedMotion ? 300 : 1200;
    const fadeDuration = prefersReducedMotion ? 150 : 600;

    const startTime = Date.now();

    const handleReady = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minHoldDuration - elapsed);

      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = originalOverflow || '';
          isInitialLoad.current = false;
        }, fadeDuration);
      }, remainingTime);
    };

    if (document.readyState === 'complete') {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(handleReady).catch(handleReady);
      } else {
        handleReady();
      }
    } else {
      window.addEventListener('load', handleReady, { once: true });
    }

    const failSafeTimer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = originalOverflow || '';
        isInitialLoad.current = false;
      }, fadeDuration);
    }, 5000);

    return () => {
      window.removeEventListener('load', handleReady);
      clearTimeout(failSafeTimer);
      document.body.style.overflow = originalOverflow || '';
    };
  }, []);

  // 2. Route Transition Handler (Show ONLY when entering CRM or switching main sections)
  useEffect(() => {
    if (isInitialLoad.current) {
      prevPathRef.current = location.pathname;
      return;
    }

    const prevPath = prevPathRef.current || '';
    const currentPath = location.pathname;

    if (prevPath !== currentPath) {
      const wasInCrm = prevPath.startsWith('/crm');
      const isNowInCrm = currentPath.startsWith('/crm');

      // When navigating internally inside CRM (e.g. Leads -> Deals -> Contacts), DO NOT trigger loader
      if (wasInCrm && isNowInCrm) {
        prevPathRef.current = currentPath;
        return;
      }

      prevPathRef.current = currentPath;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const transitionHold = prefersReducedMotion ? 150 : 380;
      const fadeDuration = prefersReducedMotion ? 150 : 450;

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setIsVisible(true);
      setIsFading(false);

      const timer = setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = originalOverflow || '';
        }, fadeDuration);
      }, transitionHold);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [location.pathname]);

  if (!isVisible) return null;

  // Background Solid Colors for 100% Opacity
  const getBackgroundColor = () => {
    if (isLight) return '#F8FAFC';
    if (isMidnight) return '#0F172A';
    return '#08090C';
  };

  return (
    <div
      id="altensor-branded-loader"
      aria-label="Loading"
      role="status"
      className={`fixed inset-0 w-screen h-screen z-[999999] flex flex-col items-center justify-center select-none cursor-default transition-all duration-500 ease-out ${
        isFading ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: getBackgroundColor()
      }}
    >
      {/* Ambient Radial Radiance Glow */}
      <div
        className="absolute w-[520px] h-[520px] max-w-[90vw] max-h-[90vw] rounded-full pointer-events-none transition-all duration-700 animate-pulse"
        style={{
          background: isCrmRoute
            ? isLight
              ? 'radial-gradient(circle, rgba(123, 79, 224, 0.18) 0%, rgba(46, 95, 163, 0.09) 45%, transparent 75%)'
              : isMidnight
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(14, 165, 233, 0.18) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(208, 188, 255, 0.28) 0%, rgba(84, 30, 184, 0.2) 45%, rgba(66, 112, 181, 0.12) 65%, transparent 75%)'
            : isLight
            ? 'radial-gradient(circle, rgba(198, 49, 143, 0.15) 0%, rgba(123, 79, 224, 0.1) 40%, transparent 75%)'
            : isMidnight
            ? 'radial-gradient(circle, rgba(198, 49, 143, 0.22) 0%, rgba(99, 102, 241, 0.18) 45%, transparent 75%)'
            : 'radial-gradient(circle, rgba(198, 49, 143, 0.25) 0%, rgba(123, 79, 224, 0.16) 40%, transparent 75%)',
          filter: 'blur(60px)'
        }}
      />

      {/* Center Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        
        {/* Logo Container with Smooth Floating Breathing Effect */}
        <div className="relative mb-6 flex items-center justify-center group animate-pulse" style={{ animationDuration: '2.4s' }}>
          <div
            className={`absolute inset-0 rounded-3xl blur-md scale-110 transition-colors duration-300 ${
              isLight
                ? 'bg-violet-500/10 border border-slate-200'
                : isMidnight
                ? 'bg-indigo-500/15 border border-slate-700'
                : 'bg-primary/15 border border-white/10'
            }`}
          />

          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 p-3.5 rounded-2xl border flex items-center justify-center overflow-hidden transition-all duration-500 shadow-2xl ${
              isLight
                ? 'bg-white border-slate-200 shadow-slate-200/80'
                : isMidnight
                ? 'bg-[#1E293B] border-slate-700 shadow-indigo-950/50'
                : 'bg-[#0D0F16] border-white/15 shadow-[0_0_50px_rgba(198,49,143,0.3)]'
            }`}
          >
            {isCrmRoute ? (
              <img
                src={altensorCrmLogo}
                alt="Altensor CRM"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(208,188,255,0.4)]"
              />
            ) : (
              <img
                src={altensorLogo}
                alt="Altensor"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(255,175,214,0.35)]"
              />
            )}
          </div>
        </div>

        {/* Brand/Context Title */}
        <h1
          className={`font-headline-display text-2xl sm:text-3xl font-bold tracking-[0.2em] uppercase mb-1.5 transition-colors duration-300 ${
            isLight ? 'text-slate-900' : isMidnight ? 'text-slate-100' : 'text-white'
          }`}
          style={{ letterSpacing: '0.22em' }}
        >
          {isCrmRoute ? 'Altensor CRM' : isDesktopRoute ? 'Altensor Workspace' : 'Altensor'}
        </h1>

        {/* Minimalist Filament Divider with Progress Pulse */}
        <div className="relative w-28 sm:w-36 h-[2px] my-3 rounded-full overflow-hidden bg-slate-200/20">
          <div
            className={`absolute inset-0 rounded-full ${
              isCrmRoute
                ? 'bg-gradient-to-r from-transparent via-secondary to-transparent'
                : isLight
                ? 'bg-gradient-to-r from-transparent via-violet-600 to-transparent'
                : 'bg-gradient-to-r from-transparent via-primary to-transparent'
            } animate-pulse`}
          />
        </div>

        {/* Subtitle / Tagline */}
        <p
          className={`font-label-sm text-[11px] sm:text-xs uppercase tracking-[0.25em] font-semibold transition-colors duration-300 ${
            isLight
              ? 'text-slate-500'
              : isMidnight
              ? 'text-slate-400'
              : isCrmRoute
              ? 'text-secondary/90'
              : 'text-[#dcbfca]/80'
          }`}
        >
          {isCrmRoute
            ? 'Relationship Intelligence'
            : isDesktopRoute
            ? 'Unified Operations'
            : 'Intelligent Systems'}
        </p>

        {/* Ambient Pulse Dots */}
        <div className="mt-6 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full animate-bounce ${
              isCrmRoute
                ? 'bg-secondary'
                : isLight
                ? 'bg-violet-600'
                : 'bg-primary'
            }`}
            style={{ animationDelay: '0ms', animationDuration: '1s' }}
          />
          <span
            className={`w-2 h-2 rounded-full animate-bounce ${
              isLight ? 'bg-violet-400' : 'bg-violet-400/80'
            }`}
            style={{ animationDelay: '200ms', animationDuration: '1s' }}
          />
          <span
            className={`w-2 h-2 rounded-full animate-bounce ${
              isLight ? 'bg-sky-500' : 'bg-sky-400/80'
            }`}
            style={{ animationDelay: '400ms', animationDuration: '1s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default BrandedLoader;
