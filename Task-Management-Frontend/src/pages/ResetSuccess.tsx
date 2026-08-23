import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';

const ResetSuccess: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();

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
                className={`w-full max-w-[440px] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl border relative z-10 flex flex-col items-center text-center gap-6 ${
                    isDark ? 'glass-card border-white/15 bg-[#141416]/90' : 'bg-white border-slate-200 shadow-xl'
                }`}
            >
                {/* Branding */}
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

                {/* Success Checkmark with Glow */}
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <span className="material-symbols-outlined text-4xl">check</span>
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-lg -z-10 animate-pulse"></div>
                </div>

                {/* Headline & Description */}
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Şifrə Uğurla Sıfırlandı
                    </h1>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Şifrəniz yeniləndi. Artıq yeni şifrənizlə sistemə daxil ola bilərsiniz.
                    </p>
                </div>

                {/* Return Button */}
                <Link
                    to="/login"
                    className="h-12 w-full btn-primary text-white rounded-xl text-xs uppercase tracking-widest font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <span>Girişə Qayıt</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
};

export default ResetSuccess;
