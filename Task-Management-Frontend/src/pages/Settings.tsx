import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { authService, notificationService } from '../api';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import type { NotificationResponse } from '../dto';

// ─── theme helpers ────────────────────────────────────────────────────────────
const getIsDark = () =>
    typeof window !== 'undefined' &&
    (document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark');

const applyTheme = (dark: boolean) => {
    if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
};

// ─── Section card ─────────────────────────────────────────────────────────────
const Card: React.FC<{ title: string; icon: string; children: React.ReactNode; isDark: boolean }> = ({
    title, icon, children, isDark,
}) => (
    <div
        className="rounded-2xl overflow-hidden"
        style={{
            background: isDark ? '#1F2937' : '#FFFFFF',
            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
            boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.25)' : '0 4px 24px rgba(0,0,0,0.06)',
        }}
    >
        <div
            className="flex items-center gap-3 px-6 py-4"
            style={{ borderBottom: `1px solid ${isDark ? '#374151' : '#F3F4F6'}` }}
        >
            <div
                className="rounded-xl flex items-center justify-center"
                style={{
                    width: 36, height: 36,
                    background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                }}
            >
                <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }}>{icon}</span>
            </div>
            <h2 className="font-semibold text-base" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                {title}
            </h2>
        </div>
        <div className="px-6 py-5">{children}</div>
    </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input: React.FC<{
    label: string; type?: string; value: string;
    onChange: (v: string) => void; icon?: string; placeholder?: string;
    isDark: boolean; readOnly?: boolean;
}> = ({ label, type = 'text', value, onChange, icon, placeholder, isDark, readOnly }) => {
    const [focused, setFocused] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const isPassword = type === 'password';
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-400 pl-1">
                {label}
            </label>
            <div
                className={`relative flex items-center rounded-xl px-3.5 transition-all duration-200 ${
                    focused
                        ? 'bg-white dark:bg-gray-900 border-transparent'
                        : isDark
                            ? 'bg-gray-900/70 hover:bg-gray-900 border border-gray-800'
                            : 'bg-gray-50 hover:bg-white border border-gray-200 shadow-sm'
                }`}
                style={{
                    border: `1px solid ${focused ? 'var(--color-primary, #6366F1)' : (isDark ? '#374151' : '#E5E7EB')}`,
                    boxShadow: focused ? '0 0 0 4px color-mix(in srgb, var(--color-primary, #6366F1) 15%, transparent)' : 'none',
                }}
            >
                {icon && (
                    <span
                        className="material-symbols-outlined shrink-0 text-[18px] transition-colors"
                        style={{ color: focused ? 'var(--color-primary, #6366F1)' : '#9CA3AF' }}
                    >
                        {icon}
                    </span>
                )}
                <input
                    type={isPassword && showPass ? 'text' : type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none shadow-none px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-gray-400"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPass(p => !p)}
                        className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {showPass ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
const ThemeToggle: React.FC<{ isDark: boolean; onToggle: () => void }> = ({ isDark, onToggle }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div
                className="rounded-xl flex items-center justify-center"
                style={{ width: 40, height: 40, background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(251,191,36,0.15)' }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: isDark ? '#818CF8' : '#F59E0B' }}>
                    {isDark ? 'dark_mode' : 'light_mode'}
                </span>
            </div>
            <div>
                <p className="text-sm font-medium" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                    {isDark ? 'Qaranlıq Rejim' : 'İşıqlı Rejim'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
                    {isDark ? 'Tünd rəng palitrası aktiv' : 'Açıq rəng palitrası aktiv'}
                </p>
            </div>
        </div>
        <button
            onClick={onToggle}
            className="relative rounded-full cursor-pointer shrink-0"
            style={{
                width: 52, height: 28,
                background: isDark
                    ? 'linear-gradient(135deg,#4F46E5,#7C3AED)'
                    : 'linear-gradient(135deg,#CBD5E1,#94A3B8)',
                transition: 'background 0.3s ease',
                padding: 3,
            }}
            aria-label="Toggle theme"
        >
            <div
                className="rounded-full flex items-center justify-center bg-white"
                style={{
                    width: 22, height: 22,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    transform: isDark ? 'translateX(24px)' : 'translateX(0)',
                    transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                <span style={{ fontSize: 12 }}>{isDark ? '🌙' : '☀️'}</span>
            </div>
        </button>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [isDark, setIsDark] = useState(getIsDark);

    // OTP / email reset flow
    const [otpStep, setOtpStep] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'done'>('idle');
    const [otpCode, setOtpCode] = useState('');
    const [resetNewPw, setResetNewPw] = useState('');
    const [resetConfirmPw, setResetConfirmPw] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');

    // Dynamic Profile Update
    const [profileName, setProfileName] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    // Profile Picture Upload Flow
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingPic, setIsUploadingPic] = useState(false);
    const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());

    const displayName = useMemo(() => {
        if (!userInfo) return 'User';
        return userInfo.userName
            ? userInfo.userName.charAt(0).toUpperCase() + userInfo.userName.slice(1)
            : (userInfo.email?.split('@')[0] ?? 'User');
    }, [userInfo]);

    const userRole = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return 'Employee';
        return getPrimaryRole(userInfo.roles);
    }, [userInfo]);

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.isRead).length,
        [notifications]
    );

    useEffect(() => {
        const token = authService.getToken();
        if (!token || isTokenExpired(token)) {
            authService.clearToken();
            navigate('/login');
            return;
        }
        const parsed = parseJwtToken(token);
        if (!parsed) { navigate('/login'); return; }
        setUserInfo(parsed);
        setProfileName(parsed.userName || '');
        setProfileEmail(parsed.email || '');
        notificationService.getMyNotifications().then(setNotifications).catch(() => { });
    }, [navigate]);

    // Apply theme whenever isDark changes
    useEffect(() => { applyTheme(isDark); }, [isDark]);

    const handleToggleTheme = () => setIsDark(d => !d);

    // ── Profile Picture Upload handlers ───────────────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProfileError('');
        setProfileSuccess('');
        setIsUploadingPic(true);

        try {
            const res = await authService.uploadProfilePicture(file);
            if (res?.token) {
                authService.setToken(res.token);
                const updated = parseJwtToken(res.token);
                if (updated) {
                    setUserInfo(updated);
                }
            }
            setAvatarTimestamp(Date.now());
            setProfileSuccess('Profil şəkli uğurla yüklənib yeniləndi!');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Şəkil yüklənərkən xəta baş verdi.';
            setProfileError(typeof msg === 'string' ? msg : 'Şəkil yüklənərkən xəta baş verdi.');
        } finally {
            setIsUploadingPic(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemovePicture = async () => {
        setProfileError('');
        setProfileSuccess('');
        setIsUploadingPic(true);

        try {
            const res = await authService.removeProfilePicture();
            if (res?.token) {
                authService.setToken(res.token);
                const updated = parseJwtToken(res.token);
                if (updated) {
                    setUserInfo(updated);
                }
            }
            setAvatarTimestamp(Date.now());
            setProfileSuccess('Profil şəkli silindi (default avatara keçirildi).');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Xəta baş verdi.';
            setProfileError(typeof msg === 'string' ? msg : 'Xəta baş verdi.');
        } finally {
            setIsUploadingPic(false);
        }
    };

    // ── Profile Update flow ───────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        if (!profileName.trim()) {
            setProfileError('İstifadəçi adı boş ola bilməz.');
            return;
        }
        if (!profileEmail.trim() || !profileEmail.includes('@')) {
            setProfileError('Düzgün e-poçt ünvanı daxil edin.');
            return;
        }
        setProfileError('');
        setProfileSuccess('');
        setIsSavingProfile(true);
        try {
            const res = await authService.updateProfile({
                userName: profileName.trim(),
                email: profileEmail.trim(),
            });
            authService.setToken(res.token);
            const updatedUser = parseJwtToken(res.token);
            if (updatedUser) {
                setUserInfo(updatedUser);
                setProfileName(updatedUser.userName);
                setProfileEmail(updatedUser.email);
            }
            setProfileSuccess('Profil məlumatları uğurla yeniləndi!');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Xəta baş verdi.';
            setProfileError(typeof msg === 'string' ? msg : 'Profil yenilənərkən xəta baş verdi.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    // ── Password via email OTP flow ───────────────────────────────────────────
    const handleSendOtp = async () => {
        if (!userInfo?.email) return;
        setOtpError('');
        setOtpStep('sending');
        try {
            await authService.sendResetOtp(JSON.stringify(userInfo.email));
            setOtpStep('sent');
        } catch {
            setOtpError('OTP göndərilərkən xəta baş verdi.');
            setOtpStep('idle');
        }
    };

    const handleResetWithOtp = async () => {
        if (!userInfo?.email) return;
        if (resetNewPw !== resetConfirmPw) { setOtpError('Şifrələr uyğun gəlmir.'); return; }
        if (resetNewPw.length < 6) { setOtpError('Şifrə ən az 6 simvol olmalıdır.'); return; }
        setOtpError('');
        setOtpStep('verifying');
        try {
            await authService.resetPassword({
                email: userInfo.email,
                token: otpCode,
                newPassword: resetNewPw,
            });
            setOtpStep('done');
            setOtpSuccess('Şifrəniz uğurla dəyişdirildi!');
            setOtpCode('');
            setResetNewPw('');
            setResetConfirmPw('');
        } catch {
            setOtpError('Yanlış OTP kodu və ya xəta baş verdi.');
            setOtpStep('sent');
        }
    };

    // ── Appearance accent ─────────────────────────────────────────────────────
    const ACCENTS = [
        { name: 'İndigo', value: '#6366F1' },
        { name: 'Bənövşəyi', value: '#7C3AED' },
        { name: 'Göy', value: '#2563EB' },
        { name: 'Yaşıl', value: '#10B981' },
        { name: 'Narıncı', value: '#F97316' },
        { name: 'Çəhrayı', value: '#EC4899' },
    ];
    const [accent, setAccent] = useState(() => localStorage.getItem('accent') || '#6366F1');
    const applyAccent = (color: string) => {
        setAccent(color);
        localStorage.setItem('accent', color);
        document.documentElement.style.setProperty('--color-primary', color);
        document.documentElement.style.setProperty('--accent', color);
    };

    useEffect(() => {
        applyAccent(accent);
    }, []);

    if (!userInfo) {
        return (
            <div className="flex h-screen w-full items-center justify-center" style={{ background: isDark ? '#111827' : '#F3F4F6' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full border-4 border-indigo-500 border-t-transparent animate-spin w-8 h-8" />
                    <p className="text-sm font-medium" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                        Tənzimləmələr yüklənir...
                    </p>
                </div>
            </div>
        );
    }

    const avatarSrc = getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl, avatarTimestamp);

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: isDark ? '#111827' : '#F3F4F6' }}>
            <Sidebar
                userName={displayName}
                userRole={userRole}
                userEmail={userInfo.email}
                userAvatar={avatarSrc}
                notificationCount={unreadCount}
            />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header
                    userName={displayName}
                    userRole={userRole}
                    userEmail={userInfo.email}
                    userAvatar={avatarSrc}
                    notificationCount={unreadCount}
                    notifications={notifications}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ background: isDark ? '#111827' : '#F3F4F6' }}>
                    {/* Page header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-1">
                            <div
                                className="rounded-2xl flex items-center justify-center"
                                style={{
                                    width: 48, height: 48,
                                    background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                                    boxShadow: '0 8px 20px rgba(99,102,241,0.35)',
                                }}
                            >
                                <span className="material-symbols-outlined text-white" style={{ fontSize: 24 }}>settings</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                                    Tənzimləmələr
                                </h1>
                                <p className="text-sm mt-0.5" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
                                    Hesab, görünüş və təhlükəsizlik parametrləri
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">

                        {/* ── Profile Info ── */}
                        <Card title="Profil Məlumatları" icon="person" isDark={isDark}>
                            <div className="flex flex-col items-center mb-6">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Profil şəklinizi dəyişmək üçün klikləyin"
                                >
                                    <div
                                        className="rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold mb-1 transition-transform duration-300 group-hover:scale-105"
                                        style={{
                                            width: 96, height: 96,
                                            background: 'linear-gradient(135deg,#667eea,#764ba2)',
                                            boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
                                            border: `3px solid ${isDark ? '#374151' : '#FFFFFF'}`,
                                        }}
                                    >
                                        {userInfo?.profilePictureUrl ? (
                                            <img
                                                src={avatarSrc}
                                                alt={displayName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            displayName.charAt(0).toUpperCase()
                                        )}
                                    </div>

                                    {/* Hover overlay with camera icon */}
                                    <div
                                        className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        style={{ width: 96, height: 96 }}
                                    >
                                        {isUploadingPic ? (
                                            <div className="rounded-full border-2 border-white border-t-transparent animate-spin w-6 h-6" />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>photo_camera</span>
                                                <span className="text-[10px] font-medium mt-0.5">Şəkli Dəyiş</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingPic}
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all hover:opacity-90"
                                        style={{
                                            background: isDark ? '#374151' : '#E5E7EB',
                                            color: isDark ? '#F9FAFB' : '#374151',
                                        }}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">upload</span>
                                        {isUploadingPic ? 'Yüklənir...' : 'Şəkil Yüklə'}
                                    </button>
                                    {userInfo?.profilePictureUrl && (
                                        <button
                                            type="button"
                                            onClick={handleRemovePicture}
                                            disabled={isUploadingPic}
                                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 flex items-center gap-1 transition-all hover:bg-red-500/10"
                                            style={{
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-[14px]">delete</span>
                                            Sil
                                        </button>
                                    )}
                                </div>

                                <span
                                    className="text-xs font-medium px-3 py-1 rounded-full mt-3"
                                    style={{
                                        background: userRole === 'Admin'
                                            ? 'rgba(212,160,23,0.15)'
                                            : userRole === 'Manager'
                                                ? 'rgba(59,130,246,0.15)'
                                                : 'rgba(16,185,129,0.15)',
                                        color: userRole === 'Admin' ? '#D4A017'
                                            : userRole === 'Manager' ? '#3B82F6' : '#10B981',
                                    }}
                                >
                                    {userRole}
                                </span>
                            </div>
                            <div className="space-y-4">
                                <Input
                                    label="İstifadəçi adı"
                                    value={profileName}
                                    onChange={setProfileName}
                                    icon="person"
                                    placeholder="İstifadəçi adını daxil edin"
                                    isDark={isDark}
                                />
                                <Input
                                    label="E-poçt"
                                    value={profileEmail}
                                    onChange={setProfileEmail}
                                    icon="mail"
                                    placeholder="E-poçt ünvanını daxil edin"
                                    isDark={isDark}
                                />
                                {profileError && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                        {profileError}
                                    </p>
                                )}
                                {profileSuccess && (
                                    <p className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                                        {profileSuccess}
                                    </p>
                                )}
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-md"
                                    style={{
                                        background: 'var(--color-primary, #6366F1)',
                                        opacity: isSavingProfile ? 0.7 : 1,
                                    }}
                                >
                                    {isSavingProfile ? (
                                        <div className="rounded-full border-2 border-white border-t-transparent animate-spin w-4 h-4" />
                                    ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>
                                    )}
                                    Profil Məlumatlarını Yada Saxla
                                </button>
                            </div>
                        </Card>

                        {/* ── Appearance ── */}
                        <Card title="Görünüş & Tematika" icon="palette" isDark={isDark}>
                            <div className="space-y-6">
                                <ThemeToggle isDark={isDark} onToggle={handleToggleTheme} />

                                <div style={{ height: 1, background: isDark ? '#374151' : '#F3F4F6' }} />

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
                                            Əsas Rəng Və İkon Tematikası
                                        </p>
                                        <span
                                            className="text-xs font-mono px-2.5 py-1 rounded-lg font-bold text-white shadow-sm"
                                            style={{ background: accent }}
                                        >
                                            {accent.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {ACCENTS.map(a => (
                                            <button
                                                key={a.value}
                                                type="button"
                                                onClick={() => applyAccent(a.value)}
                                                title={a.name}
                                                className="rounded-full flex items-center justify-center transition-all hover:scale-110 shrink-0"
                                                style={{
                                                    width: 36, height: 36,
                                                    background: a.value,
                                                    border: accent.toLowerCase() === a.value.toLowerCase() ? `3px solid ${isDark ? '#fff' : '#111'}` : '3px solid transparent',
                                                    boxShadow: accent.toLowerCase() === a.value.toLowerCase() ? `0 0 0 2px ${a.value}` : 'none',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {accent.toLowerCase() === a.value.toLowerCase() && (
                                                    <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>check</span>
                                                )}
                                            </button>
                                        ))}

                                        {/* Custom Color Picker Button */}
                                        <label
                                            title="Özəl Rəng Seçin (Custom Hex Color)"
                                            className="relative rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shrink-0 overflow-hidden"
                                            style={{
                                                width: 36, height: 36,
                                                background: 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                                                border: `2px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            }}
                                        >
                                            <input
                                                type="color"
                                                value={accent.length === 7 ? accent : '#6366F1'}
                                                onChange={(e) => applyAccent(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            />
                                            <span className="material-symbols-outlined text-white drop-shadow-md text-[18px]">colorize</span>
                                        </label>
                                    </div>

                                    {/* Custom HEX Code Field */}
                                    <div className="mt-4 flex items-center gap-3">
                                        <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">Özəl HEX Kod:</span>
                                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
                                            <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" style={{ background: accent }} />
                                            <input
                                                type="text"
                                                value={accent}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setAccent(val);
                                                    if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
                                                        applyAccent(val);
                                                    }
                                                }}
                                                placeholder="#HEX"
                                                className="w-24 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs font-mono font-bold text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: 1, background: isDark ? '#374151' : '#F3F4F6' }} />

                                {/* Live Preview Card */}
                                <div>
                                    <p className="text-sm font-semibold mb-3" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
                                        Canlı Önizləmə
                                    </p>
                                    <div
                                        className="rounded-xl p-4 flex items-center gap-4 transition-all"
                                        style={{
                                            background: isDark ? '#111827' : '#F8FAFC',
                                            border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`,
                                        }}
                                    >
                                        <div
                                            className="rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                                            style={{ width: 42, height: 42, background: accent }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>design_services</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>Aktiv İkon Və Düymə Rəngi</p>
                                            <p className="text-xs" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>Bütün tətbiqdə ikonlar və düymələr bu rəngdə olacaq</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span
                                                className="text-xs px-3 py-1.5 rounded-xl text-white font-bold shadow-sm"
                                                style={{ background: accent }}
                                            >
                                                Aktiv
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* ── Password Reset via OTP ── */}
                        <Card title="Şifrəni Dəyişdir" icon="lock" isDark={isDark}>
                            {otpStep === 'done' ? (
                                <div className="flex flex-col items-center py-6 text-center">
                                    <div
                                        className="rounded-full flex items-center justify-center mb-4"
                                        style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.15)' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#10B981' }}>check_circle</span>
                                    </div>
                                    <p className="font-semibold text-base mb-1" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                                        Uğurlu!
                                    </p>
                                    <p className="text-sm" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
                                        {otpSuccess}
                                    </p>
                                    <button
                                        onClick={() => { setOtpStep('idle'); setOtpSuccess(''); }}
                                        className="mt-5 px-5 py-2 rounded-xl text-sm font-medium text-white"
                                        style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)' }}
                                    >
                                        Yenidən dəyişdir
                                    </button>
                                </div>
                            ) : otpStep === 'idle' ? (
                                <div className="space-y-4">
                                    <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                                        Şifrənizi dəyişmək üçün e-poçtunuza OTP kodu göndərilir.
                                    </p>
                                    <div
                                        className="flex items-center gap-2 rounded-xl px-3 py-3"
                                        style={{
                                            background: isDark ? '#111827' : '#F9FAFB',
                                            border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9CA3AF' }}>mail</span>
                                        <span className="text-sm" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
                                            {userInfo.email}
                                        </span>
                                    </div>
                                    {otpError && (
                                        <p className="text-xs text-red-500">{otpError}</p>
                                    )}
                                    <button
                                        onClick={handleSendOtp}
                                        className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-90"
                                        style={{ background: 'var(--color-primary, #6366F1)' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>send</span>
                                        OTP Göndər
                                    </button>
                                </div>
                            ) : otpStep === 'sending' ? (
                                <div className="flex flex-col items-center py-8 gap-3">
                                    <div
                                        className="rounded-full border-4 animate-spin"
                                        style={{ width: 48, height: 48, borderColor: 'var(--color-primary, #6366F1)', borderTopColor: 'transparent' }}
                                    />
                                    <p className="text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>OTP göndərilir...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div
                                        className="flex items-center gap-2 rounded-xl px-3 py-2"
                                        style={{
                                            background: 'rgba(16,185,129,0.1)',
                                            border: '1px solid rgba(16,185,129,0.25)',
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#10B981' }}>mark_email_read</span>
                                        <p className="text-xs" style={{ color: '#10B981' }}>
                                            OTP kodu <strong>{userInfo.email}</strong> ünvanına göndərildi
                                        </p>
                                    </div>
                                    <Input
                                        label="OTP Kodu"
                                        value={otpCode}
                                        onChange={setOtpCode}
                                        icon="key"
                                        placeholder="6 rəqəmli kod"
                                        isDark={isDark}
                                    />
                                    <Input
                                        label="Yeni Şifrə"
                                        type="password"
                                        value={resetNewPw}
                                        onChange={setResetNewPw}
                                        icon="lock"
                                        placeholder="Ən az 6 simvol"
                                        isDark={isDark}
                                    />
                                    <Input
                                        label="Yeni Şifrə (Təkrar)"
                                        type="password"
                                        value={resetConfirmPw}
                                        onChange={setResetConfirmPw}
                                        icon="lock_reset"
                                        placeholder="Şifrəni təkrarlayın"
                                        isDark={isDark}
                                    />
                                    {otpError && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>error</span>
                                            {otpError}
                                        </p>
                                    )}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => { setOtpStep('idle'); setOtpError(''); }}
                                            className="flex-1 py-3 rounded-xl text-sm font-medium"
                                            style={{
                                                background: isDark ? '#374151' : '#F3F4F6',
                                                color: isDark ? '#D1D5DB' : '#374151',
                                            }}
                                        >
                                            Ləğv et
                                        </button>
                                        <button
                                            onClick={handleResetWithOtp}
                                            disabled={otpStep === 'verifying' || !otpCode || !resetNewPw}
                                            className="flex-2 flex-1 py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-90"
                                            style={{
                                                background: 'var(--color-primary, #6366F1)',
                                                opacity: (!otpCode || !resetNewPw) ? 0.6 : 1,
                                            }}
                                        >
                                            {otpStep === 'verifying' ? (
                                                <div className="rounded-full border-2 border-white border-t-transparent animate-spin w-4 h-4" />
                                            ) : (
                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_reset</span>
                                            )}
                                            Dəyiş
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* ── Danger Zone ── */}
                        <Card title="Hesab" icon="manage_accounts" isDark={isDark}>
                            <div className="space-y-4">
                                {/* Current session info */}
                                <div
                                    className="rounded-xl p-4 flex items-center gap-3"
                                    style={{
                                        background: isDark ? '#111827' : '#F8FAFC',
                                        border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`,
                                    }}
                                >
                                    <div
                                        className="rounded-lg flex items-center justify-center shrink-0"
                                        style={{ width: 36, height: 36, background: 'rgba(99,102,241,0.15)' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#6366F1' }}>security</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: isDark ? '#F9FAFB' : '#111827' }}>
                                            Aktiv Sessiya
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
                                            JWT token ilə daxil olunub
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'pulse 2s infinite' }} />
                                        <span className="text-xs text-green-500 font-medium">Aktiv</span>
                                    </div>
                                </div>

                                <div style={{ height: 1, background: isDark ? '#374151' : '#F3F4F6' }} />

                                <button
                                    onClick={() => { authService.clearToken(); window.location.href = '/login'; }}
                                    className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                                    style={{
                                        background: 'rgba(239,68,68,0.08)',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        color: '#EF4444',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                                    Hesabdan Çıx
                                </button>
                            </div>
                        </Card>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;
