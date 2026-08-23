import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import taskLogo from '../assets/Task-Management-Logo.svg';

/**
 * Premium Full-Screen Context-Aware Branded Loading Overlay for Task Management
 * - Runs ONLY on initial page load / full browser refresh
 * - Does NOT trigger on client-side route transitions (kecidlerde olmur)
 * - Adapts 100% to active Theme (Dark, Light, Midnight)
 * - Uses Task Management Logo with vibrant Altensor glow effects
 */
const BrandedLoader: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [isFading, setIsFading] = useState(false);
    const { theme } = useTheme();

    const isLight = theme === 'light';
    const isMidnight = theme === 'midnight';

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const minHoldDuration = 900;
        const fadeDuration = 500;
        const startTime = Date.now();

        const handleReady = () => {
            const elapsed = Date.now() - startTime;
            const remainingTime = Math.max(0, minHoldDuration - elapsed);

            setTimeout(() => {
                setIsFading(true);
                setTimeout(() => {
                    setIsVisible(false);
                    document.body.style.overflow = originalOverflow || '';
                }, fadeDuration);
            }, remainingTime);
        };

        if (document.readyState === 'complete') {
            handleReady();
        } else {
            window.addEventListener('load', handleReady, { once: true });
        }

        // Fail-safe fallback timer
        const failSafeTimer = setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
                setIsVisible(false);
                document.body.style.overflow = originalOverflow || '';
            }, fadeDuration);
        }, 3000);

        return () => {
            window.removeEventListener('load', handleReady);
            clearTimeout(failSafeTimer);
            document.body.style.overflow = originalOverflow || '';
        };
    }, []);

    if (!isVisible) return null;

    // Background color based on theme
    const getBackgroundColor = () => {
        if (isLight) return '#F8FAFC';
        if (isMidnight) return '#0F172A';
        return '#121214';
    };

    return (
        <div
            id="task-management-branded-loader"
            aria-label="Loading Task Management"
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
                className="absolute w-[500px] h-[500px] max-w-[90vw] max-h-[90vw] rounded-full pointer-events-none transition-all duration-700 animate-pulse"
                style={{
                    background: isLight
                        ? 'radial-gradient(circle, rgba(210, 43, 177, 0.16) 0%, rgba(22, 120, 232, 0.1) 45%, transparent 75%)'
                        : isMidnight
                        ? 'radial-gradient(circle, rgba(123, 72, 200, 0.28) 0%, rgba(22, 120, 232, 0.2) 50%, transparent 75%)'
                        : 'radial-gradient(circle, rgba(244, 20, 115, 0.26) 0%, rgba(123, 72, 200, 0.2) 45%, rgba(22, 120, 232, 0.12) 65%, transparent 75%)',
                    filter: 'blur(60px)',
                    animationDuration: '2.5s'
                }}
            />

            {/* Center Container */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
                
                {/* Logo Squircle with Breathing Glow */}
                <div className="relative mb-5 flex items-center justify-center">
                    <div
                        className={`absolute inset-0 rounded-3xl blur-lg scale-110 animate-pulse ${
                            isLight
                                ? 'bg-fuchsia-500/20'
                                : isMidnight
                                ? 'bg-indigo-500/25'
                                : 'bg-fuchsia-600/30'
                        }`}
                        style={{ animationDuration: '2s' }}
                    />

                    <div
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 p-3.5 rounded-2xl border flex items-center justify-center overflow-hidden transition-all duration-500 shadow-2xl ${
                            isLight
                                ? 'bg-white border-slate-200 shadow-slate-200/80'
                                : isMidnight
                                ? 'bg-[#1E293B] border-slate-700 shadow-indigo-950/50'
                                : 'bg-[#18181B] border-[#27272A] shadow-[0_0_40px_rgba(244,20,115,0.25)]'
                        }`}
                    >
                        <img
                            src={taskLogo}
                            alt="Altensor Task Management Logo"
                            className="w-full h-full object-contain drop-shadow-md select-none transform transition-transform duration-500 hover:scale-105"
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Brand Name & Subtitle */}
                <div className="space-y-1.5 flex flex-col items-center">
                    <h2
                        className={`text-lg sm:text-xl font-black tracking-tight ${
                            isLight
                                ? 'text-slate-900'
                                : isMidnight
                                ? 'text-white'
                                : 'text-white'
                        }`}
                    >
                        Altensor <span className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">Tasks</span>
                    </h2>
                    <p
                        className={`text-xs font-medium tracking-wide ${
                            isLight ? 'text-slate-500' : isMidnight ? 'text-slate-400' : 'text-[#71717A]'
                        }`}
                    >
                        Tapşırıq İdarəetmə Sistemi
                    </p>
                </div>

                {/* Sleek Gradient Loading Indicator Line */}
                <div
                    className={`mt-6 w-36 h-1 rounded-full overflow-hidden relative ${
                        isLight ? 'bg-slate-200' : isMidnight ? 'bg-slate-800' : 'bg-[#27272A]'
                    }`}
                >
                    <div
                        className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-[#f41473] via-[#7b48c8] to-[#1678e8] animate-[loaderSlide_1.4s_cubic-bezier(0.65,0,0.35,1)_infinite]"
                        style={{
                            boxShadow: '0 0 10px rgba(244,20,115,0.6)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BrandedLoader;
