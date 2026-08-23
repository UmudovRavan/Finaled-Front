import React, { useState, useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context';
import taskManagementLogo from '../assets/Task-Management-Logo.svg';

const OtpVerification: React.FC = () => {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [timer, setTimer] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [backendError, setBackendError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const email = sessionStorage.getItem('resetEmail') || '';
    const maskedEmail = email ? `${email.charAt(0)}***@${email.split('@')[1] || 'company.com'}` : 'r***@company.com';

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
            return;
        }

        const hasOtpError = sessionStorage.getItem('resetOtpError');
        if (hasOtpError) {
            setBackendError(true);
            setError('Backend xətası: Şifrə sıfırlama servisi hazırda işləmir. Zəhmət olmasa sistemə daxil olun və ya administratorla əlaqə saxlayın.');
            sessionStorage.removeItem('resetOtpError');
        }

        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        setError(null);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }

        setOtp(newOtp);

        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = async () => {
        const otpValue = otp.join('');

        if (otpValue.length !== 6) {
            setError('Zəhmət olmasa bütün 6 rəqəmi daxil edin');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            sessionStorage.setItem('resetOtp', otpValue);
            navigate('/reset-password');
        } catch {
            setError('Yanlış təsdiq kodu. Zəhmət olmasa bir daha cəhd edin.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setTimer(59);
        setCanResend(false);
        setOtp(Array(6).fill(''));
        setError(null);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
                className={`w-full max-w-[460px] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl border relative z-10 flex flex-col gap-6 ${
                    isDark ? 'glass-card border-white/15 bg-[#141416]/90' : 'bg-white border-slate-200 shadow-xl'
                }`}
            >
                {/* Branding */}
                <div className="flex flex-col items-center text-center gap-3">
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

                    <h1 className={`text-2xl font-extrabold tracking-tight mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Kimliyi Təsdiqlə
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Təhlükəsizliyiniz üçün <strong className="text-white">{maskedEmail}</strong> ünvanına göndərilən 6 rəqəmli kodu daxil edin.
                    </p>
                </div>

                {error && (
                    <div className="p-3.5 bg-red-500/10 text-red-400 text-xs rounded-xl border border-red-500/20 font-medium text-center animate-slide-up">
                        {error}
                    </div>
                )}

                {/* OTP Inputs */}
                <div className="flex justify-center my-2">
                    <fieldset className="flex gap-2 sm:gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                aria-label={`Digit ${index + 1}`}
                                className={`w-11 h-12 sm:w-13 sm:h-14 text-center rounded-xl text-lg font-bold outline-none transition-all ${
                                    isDark
                                        ? 'bg-white/[0.05] border border-white/15 text-white focus:border-blue-500 focus:bg-white/[0.08]'
                                        : 'bg-white border border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                                }`}
                                maxLength={1}
                                type="text"
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                            />
                        ))}
                    </fieldset>
                </div>

                {/* Verify Button */}
                <button
                    className="h-12 w-full btn-primary disabled:opacity-50 text-white rounded-xl text-xs uppercase tracking-widest font-bold shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-2"
                    onClick={handleVerify}
                    disabled={loading || backendError}
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                            <span>Təsdiqlənir...</span>
                        </>
                    ) : (
                        'Kodu Təsdiqlə'
                    )}
                </button>

                {/* Resend Timer */}
                <div className="text-center">
                    {canResend ? (
                        <button
                            className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors cursor-pointer"
                            onClick={handleResend}
                        >
                            Kodu yenidən göndər
                        </button>
                    ) : (
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                            Kodu yenidən göndər: <span className="font-semibold text-slate-300 tabular-nums">{formatTime(timer)}</span>
                        </p>
                    )}
                </div>

                {/* Back Link */}
                <div className="flex justify-center pt-2 border-t border-white/10">
                    <Link
                        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        to="/login"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Girişə qayıt
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;
