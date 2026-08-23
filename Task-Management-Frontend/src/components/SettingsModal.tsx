import React, { useState, useEffect, useRef, useMemo } from 'react';
import { authService, userService } from '../api';
import { parseJwtToken, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import type { UserResponse } from '../dto';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
    XMarkIcon,
    PencilSquareIcon,
    KeyIcon,
    EnvelopeIcon,
    ArrowRightOnRectangleIcon,
    TrashIcon,
    CameraIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    Cog6ToothIcon,
    Squares2X2Icon,
    SwatchIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    GlobeAltIcon,
    BellAlertIcon,
    ClockIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'profile' | 'preferences' | 'general' | 'dashboard' | 'brand' | 'users';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme, isDark } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [avatarTimestamp, setAvatarTimestamp] = useState<number>(Date.now());

    // Profile Edit State
    const [isEditingName, setIsEditingName] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Password Reset Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState<'request' | 'verify'>('request');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Preferences State
    const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [desktopNotifs, setDesktopNotifs] = useState(true);
    const [taskUpdatesNotifs, setTaskUpdatesNotifs] = useState(true);

    // Users List State (for Admin)
    const [usersList, setUsersList] = useState<UserResponse[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userSearch, setUserSearch] = useState('');

    // Message Toast
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 3500);
    };

    useEffect(() => {
        if (isOpen) {
            const token = authService.getToken();
            if (token) {
                const parsed = parseJwtToken(token);
                if (parsed) {
                    setUserInfo(parsed);
                    setNewUserName(parsed.userName || '');
                }
            }
        }
    }, [isOpen]);

    // Load users if admin opens users tab
    useEffect(() => {
        if (activeTab === 'users' && isOpen) {
            setUsersLoading(true);
            userService
                .getAllUsers()
                .then((data) => setUsersList(data))
                .catch(() => setUsersList([]))
                .finally(() => setUsersLoading(false));
        }
    }, [activeTab, isOpen]);

    // Escape key listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const userRole = useMemo(() => {
        if (!userInfo || !userInfo.roles?.length) return 'Employee';
        return getPrimaryRole(userInfo.roles);
    }, [userInfo]);

    const isAdmin = useMemo(() => {
        return userInfo?.roles?.some((r) => r.toLowerCase() === 'admin') ?? false;
    }, [userInfo]);

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl, avatarTimestamp);
    }, [userInfo, avatarTimestamp]);

    const userInitial = useMemo(() => {
        return (userInfo?.userName?.charAt(0) || userInfo?.email?.charAt(0) || 'S').toUpperCase();
    }, [userInfo]);

    // Upload Profile Picture
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await authService.uploadProfilePicture(file);
            if (res?.token) {
                authService.setToken(res.token);
                const updated = parseJwtToken(res.token);
                if (updated) setUserInfo(updated);
            }
            setAvatarTimestamp(Date.now());
            showToast('Profil şəkli uğurla yeniləndi!');
        } catch {
            showToast('Şəkil yüklənərkən xəta baş verdi', 'error');
        }
    };

    // Remove Profile Picture
    const handleRemoveAvatar = async () => {
        try {
            const res = await authService.removeProfilePicture();
            if (res?.token) {
                authService.setToken(res.token);
                const updated = parseJwtToken(res.token);
                if (updated) setUserInfo(updated);
            }
            setAvatarTimestamp(Date.now());
            showToast('Profil şəkli silindi');
        } catch {
            showToast('Şəkil silinərkən xəta baş verdi', 'error');
        }
    };

    // Save Name Edit
    const handleSaveName = async () => {
        if (!newUserName.trim() || !userInfo) return;
        setSavingProfile(true);
        try {
            const res = await authService.updateProfile({
                userName: newUserName.trim(),
                email: userInfo.email,
            });
            if (res.token) {
                authService.setToken(res.token);
                const updated = parseJwtToken(res.token);
                if (updated) setUserInfo(updated);
            }
            setIsEditingName(false);
            showToast('Profil məlumatları yeniləndi!');
        } catch {
            showToast('Yeniləmə zamanı xəta baş verdi', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    // Password Reset Flow
    const handleSendResetOtp = async () => {
        if (!userInfo?.email) return;
        setPasswordLoading(true);
        setPasswordError('');
        try {
            await authService.sendResetOtp(userInfo.email);
            setPasswordStep('verify');
            setPasswordSuccess('Təsdiq kodu e-poçt ünvanınıza göndərildi!');
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Kod göndərilərkən xəta baş verdi');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleConfirmPasswordReset = async () => {
        if (!userInfo?.email || !otpCode.trim() || !newPassword || !confirmPassword) {
            setPasswordError('Bütün sahələri doldurun');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Şifrələr uyğun gəlmir');
            return;
        }

        setPasswordLoading(true);
        setPasswordError('');
        try {
            await authService.resetPassword({
                email: userInfo.email,
                otp: otpCode.trim(),
                newPassword,
                confirmPassword,
            });
            setPasswordSuccess('Şifrə uğurla dəyişdirildi!');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordStep('request');
                setOtpCode('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordSuccess('');
            }, 1500);
        } catch (err: any) {
            setPasswordError(err.response?.data?.message || 'Şifrə dəyişdirilərkən xəta baş verdi');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleLogout = () => {
        authService.clearToken();
        window.location.href = '/login';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-sans select-none">
            <div
                className="w-full max-w-4xl bg-[#121214] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] text-[#F4F4F5]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ─── Left Sidebar Navigation ─── */}
                <div className="w-full md:w-64 bg-[#18181B] border-b md:border-b-0 md:border-r border-[#27272A] p-4 flex flex-col justify-between shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="space-y-5">
                        {/* Section 1: İSTİFADƏÇİ KONFİQURASİYASI */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A] px-3 pb-1">
                                İstifadəçi Konfiqurasiyası
                            </p>

                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'profile'
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
                                    {userInitial}
                                </div>
                                <span>Profil</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'preferences'
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <SwatchIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Tərcihlər</span>
                            </button>
                        </div>

                        {/* Section 2: SİSTEM KONFİQURASİYASI */}
                        <div className="space-y-1">
                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A] px-3 pb-1">
                                Sistem Konfiqurasiyası
                            </p>

                            <button
                                onClick={() => setActiveTab('general')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'general'
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Cog6ToothIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Ümumi</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'dashboard'
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <Squares2X2Icon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Dashboard</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('brand')}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    activeTab === 'brand'
                                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <BuildingOfficeIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Brend & Loqo</span>
                            </button>
                        </div>

                        {/* Section 3: İSTİFADƏÇİ İDARƏETMƏSİ (If Admin) */}
                        {isAdmin && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A] px-3 pb-1">
                                    İstifadəçi İdarəetməsi
                                </p>

                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        activeTab === 'users'
                                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                            : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <UserGroupIcon className="w-4 h-4 text-[#A1A1AA]" />
                                    <span>İstifadəçilər</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bottom Logout Button */}
                    <div className="pt-4 mt-4 border-t border-[#27272A]">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            <span>Çıxış et</span>
                        </button>
                    </div>
                </div>

                {/* ─── Right Content Area ─── */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#121214] overflow-y-auto custom-scrollbar relative">
                    {/* Top Header Row with Close Button */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A] sticky top-0 bg-[#121214]/90 backdrop-blur-md z-20">
                        <div>
                            <h2 className="text-base font-extrabold text-white tracking-tight">
                                {activeTab === 'profile'
                                    ? 'Profil'
                                    : activeTab === 'preferences'
                                    ? 'Tərcihlər'
                                    : activeTab === 'users'
                                    ? 'İstifadəçilər'
                                    : activeTab === 'general'
                                    ? 'Ümumi Parametrlər'
                                    : activeTab === 'dashboard'
                                    ? 'Dashboard Konfiqurasiyası'
                                    : 'Brend Tənzimləmələri'}
                            </h2>
                            <p className="text-xs text-[#71717A]">
                                {activeTab === 'profile'
                                    ? 'Profil və giriş məlumatlarınızı idarə edin.'
                                    : activeTab === 'preferences'
                                    ? 'Görünüş, dil və bildiriş tərcihlərinizi fərdiləşdirin.'
                                    : 'Sistem parametrlərinin idarəsi.'}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl text-[#71717A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Bağla"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Toast Notification */}
                    {toastMessage && (
                        <div
                            className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                                toastMessage.type === 'success'
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                            }`}
                        >
                            {toastMessage.type === 'success' ? (
                                <CheckIcon className="w-4 h-4 shrink-0" />
                            ) : (
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                            )}
                            <span>{toastMessage.text}</span>
                        </div>
                    )}

                    {/* Tab Contents */}
                    <div className="p-6 space-y-6">
                        {/* ─── TAB 1: PROFIL ─── */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 max-w-2xl animate-in fade-in duration-150">
                                {/* Top User Card */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#18181B] border border-[#27272A]">
                                    <div className="relative group">
                                        <div
                                            className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-xl flex items-center justify-center bg-cover bg-center shadow-lg overflow-hidden"
                                            style={{
                                                backgroundImage: avatarSrc ? `url("${avatarSrc}")` : undefined,
                                            }}
                                        >
                                            {!avatarSrc && userInitial}
                                        </div>

                                        {/* Avatar Change Overlay */}
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white"
                                            title="Şəkli dəyiş"
                                        >
                                            <CameraIcon className="w-5 h-5" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {isEditingName ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={newUserName}
                                                    onChange={(e) => setNewUserName(e.target.value)}
                                                    className="bg-[#27272A] border border-[#3F3F46] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleSaveName}
                                                    disabled={savingProfile}
                                                    className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 cursor-pointer"
                                                >
                                                    {savingProfile ? '...' : 'Saxla'}
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingName(false)}
                                                    className="px-2 py-1 text-xs text-[#71717A] hover:text-white"
                                                >
                                                    Ləğv
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-extrabold text-white tracking-tight truncate">
                                                    {userInfo?.userName || 'İstifadəçi'}
                                                </h3>
                                                <button
                                                    onClick={() => setIsEditingName(true)}
                                                    className="text-[#71717A] hover:text-white transition-colors cursor-pointer"
                                                    title="Adı dəyiş"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        <p className="text-xs text-[#71717A] truncate mt-0.5">{userInfo?.email}</p>

                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                <ShieldCheckIcon className="w-3 h-3" />
                                                <span>{userRole}</span>
                                            </span>

                                            {avatarSrc && (
                                                <button
                                                    onClick={handleRemoveAvatar}
                                                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                                                >
                                                    <TrashIcon className="w-3 h-3" />
                                                    <span>Şəkli sil</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Hesab Məlumatları & Təhlükəsizlik */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-extrabold text-white tracking-tight uppercase">
                                        Hesab Məlumatları & Təhlükəsizlik
                                    </h4>

                                    <div className="space-y-2.5">
                                        {/* Row 1: E-poçtlar & İmza */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-white">E-poçtlar & İmza</p>
                                                <p className="text-[11px] text-[#71717A]">
                                                    Yazışmalar və bildirişlər üçün e-poçt imzanızı tənzimləyin.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => showToast('İmza tənzimləmələri aktivdir')}
                                                className="px-3.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-white transition-colors cursor-pointer"
                                            >
                                                Quraşdır
                                            </button>
                                        </div>

                                        {/* Row 2: Şifrəni Dəyiş */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-bold text-white">Şifrə</p>
                                                <p className="text-[11px] text-[#71717A]">
                                                    Təhlükəsizlik üçün hesabınızın şifrəsini dəyişin.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setShowPasswordModal(true);
                                                    setPasswordStep('request');
                                                    setPasswordError('');
                                                    setPasswordSuccess('');
                                                }}
                                                className="px-3.5 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-white transition-colors cursor-pointer"
                                            >
                                                Şifrəni Dəyiş
                                            </button>
                                        </div>

                                        {/* Row 3: Reset Password (Şifrəni Sıfırla) */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-bold text-white">Şifrəni Sıfırla (Reset Password)</p>
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        OTP Təsdiqli
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-[#71717A]">
                                                    E-poçtunuza təsdiq kodu göndərərək şifrənizi sıfırlayın.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setShowPasswordModal(true);
                                                    setPasswordStep('request');
                                                    setPasswordError('');
                                                    setPasswordSuccess('');
                                                }}
                                                className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-colors cursor-pointer"
                                            >
                                                Şifrəni Sıfırla
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 2: TƏRCİHLƏR (1:1 CRM Exact Preferences) ─── */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-7 max-w-2xl animate-in fade-in duration-150">
                                {/* Section 1: Appearance & 3 Themes */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-tight">Görünüş & Tema</h3>
                                        <p className="text-xs text-[#71717A]">
                                            Açıq, qaranlıq və gecə mavisi temaları arasında seçim edin.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                                        {/* 1. Light Theme Card */}
                                        <div
                                            onClick={() => setTheme('light')}
                                            className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                                                theme === 'light'
                                                    ? 'border-blue-500 bg-[#1C1C1E] shadow-lg ring-1 ring-blue-500/40'
                                                    : 'border-[#27272A] bg-[#141416] hover:border-[#3F3F46]'
                                            }`}
                                        >
                                            <div className="bg-white rounded-lg p-2 h-16 border border-zinc-200 flex flex-col justify-between overflow-hidden shadow-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 rounded bg-blue-600 text-[6px] text-white flex items-center justify-center font-bold">TM</span>
                                                    <span className="text-[9px] font-bold text-zinc-900">Task Management</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-xs text-[#D4D4D8] font-semibold">Açıq (Light)</span>
                                                <div
                                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                        theme === 'light' ? 'border-blue-500 bg-blue-500' : 'border-[#52525B]'
                                                    }`}
                                                >
                                                    {theme === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Dark Theme Card (Charcoal) */}
                                        <div
                                            onClick={() => setTheme('dark')}
                                            className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                                                theme === 'dark'
                                                    ? 'border-blue-500 bg-[#1C1C1E] shadow-lg ring-1 ring-blue-500/40'
                                                    : 'border-[#27272A] bg-[#141416] hover:border-[#3F3F46]'
                                            }`}
                                        >
                                            <div className="bg-[#18181B] rounded-lg p-2 h-16 border border-[#27272A] flex flex-col justify-between overflow-hidden shadow-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 rounded bg-[#D946EF] text-[6px] text-white flex items-center justify-center font-bold">TM</span>
                                                    <span className="text-[9px] font-bold text-white">Task Management</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-xs text-[#D4D4D8] font-semibold">Qaranlıq (Dark)</span>
                                                <div
                                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                        theme === 'dark' ? 'border-blue-500 bg-blue-500' : 'border-[#52525B]'
                                                    }`}
                                                >
                                                    {theme === 'dark' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Midnight Theme Card */}
                                        <div
                                            onClick={() => setTheme('midnight')}
                                            className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                                                theme === 'midnight'
                                                    ? 'border-blue-500 bg-[#1C1C1E] shadow-lg ring-1 ring-blue-500/40'
                                                    : 'border-[#27272A] bg-[#141416] hover:border-[#3F3F46]'
                                            }`}
                                        >
                                            <div className="bg-[#0F172A] rounded-lg p-2 h-16 border border-[#334155] flex flex-col justify-between overflow-hidden shadow-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-3 h-3 rounded bg-indigo-500 text-[6px] text-white flex items-center justify-center font-bold">TM</span>
                                                    <span className="text-[9px] font-bold text-[#F8FAFC]">Task Management</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-xs text-[#D4D4D8] font-semibold">Gecə Mavisi</span>
                                                <div
                                                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                        theme === 'midnight' ? 'border-blue-500 bg-blue-500' : 'border-[#52525B]'
                                                    }`}
                                                >
                                                    {theme === 'midnight' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Dil & Saat (Language & Time) */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-sm font-bold text-white tracking-tight">Dil & Saat Qurşağı</h3>

                                    <div className="space-y-3 text-xs">
                                        {/* Language Dropdown */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <GlobeAltIcon className="w-4 h-4 text-[#A1A1AA]" />
                                                    <p className="font-bold text-white">İnterfeys Dili</p>
                                                </div>
                                                <p className="text-[11px] text-[#71717A]">
                                                    {t('settings.languageSubtitle', {}, 'Tətbiqdə istifadə etmək istədiyiniz dili seçin.')}
                                                </p>
                                            </div>

                                            <select
                                                value={language}
                                                onChange={(e) => {
                                                    setLanguage(e.target.value as any);
                                                    showToast(t('settings.savedSuccess', {}, 'Dil tənzimləməsi yadda saxlanıldı!'));
                                                }}
                                                className="bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                                            >
                                                <option value="az">🇦🇿 Azərbaycan dili (AZ)</option>
                                                <option value="en">🇬🇧 English (EN)</option>
                                                <option value="ru">🇷🇺 Русский (RU)</option>
                                            </select>
                                        </div>

                                        {/* Time Format */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4 text-[#A1A1AA]" />
                                                    <p className="font-bold text-white">Vaxt Formatı</p>
                                                </div>
                                                <p className="text-[11px] text-[#71717A]">
                                                    Tapşırıq və bildiriş tarixlərinin formatı.
                                                </p>
                                            </div>

                                            <div className="flex items-center p-1 rounded-xl bg-[#27272A] border border-[#3F3F46]">
                                                <button
                                                    onClick={() => setTimeFormat('24h')}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                                        timeFormat === '24h' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#71717A] hover:text-white'
                                                    }`}
                                                >
                                                    24 saatlıq (14:30)
                                                </button>
                                                <button
                                                    onClick={() => setTimeFormat('12h')}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                                        timeFormat === '12h' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#71717A] hover:text-white'
                                                    }`}
                                                >
                                                    12 saatlıq (02:30 PM)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Bildiriş Tərcihləri (Notification Preferences) */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-sm font-bold text-white tracking-tight">Bildiriş Tərcihləri</h3>

                                    <div className="space-y-2.5 text-xs">
                                        {/* Toggle 1: Email */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-white">E-poçt Bildirişləri</p>
                                                <p className="text-[11px] text-[#71717A]">
                                                    Yeni tapşırıqlar təyin edildikdə e-poçt bildirişi alın.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setEmailNotifs(!emailNotifs)}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    emailNotifs ? 'bg-blue-600' : 'bg-[#27272A]'
                                                }`}
                                            >
                                                <span
                                                    className={`w-4 h-4 rounded-full bg-white block transition-transform absolute top-1 ${
                                                        emailNotifs ? 'left-6' : 'left-1'
                                                    }`}
                                                ></span>
                                            </button>
                                        </div>

                                        {/* Toggle 2: Desktop */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-white">Masaüstü (Brauzer) Bildirişləri</p>
                                                <p className="text-[11px] text-[#71717A]">
                                                    Ani real-vaxt pop-up bildirişləri.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setDesktopNotifs(!desktopNotifs)}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    desktopNotifs ? 'bg-blue-600' : 'bg-[#27272A]'
                                                }`}
                                            >
                                                <span
                                                    className={`w-4 h-4 rounded-full bg-white block transition-transform absolute top-1 ${
                                                        desktopNotifs ? 'left-6' : 'left-1'
                                                    }`}
                                                ></span>
                                            </button>
                                        </div>

                                        {/* Toggle 3: Task status changes */}
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-white">Tapşırıq Status Dəyişiklikləri</p>
                                                <p className="text-[11px] text-[#71717A]">
                                                    Tapşırıq təsdiqləndikdə və ya qaytarıldıqda bildiriş.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setTaskUpdatesNotifs(!taskUpdatesNotifs)}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    taskUpdatesNotifs ? 'bg-blue-600' : 'bg-[#27272A]'
                                                }`}
                                            >
                                                <span
                                                    className={`w-4 h-4 rounded-full bg-white block transition-transform absolute top-1 ${
                                                        taskUpdatesNotifs ? 'left-6' : 'left-1'
                                                    }`}
                                                ></span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 3: ÜMUMİ & SİSTEM ─── */}
                        {activeTab === 'general' && (
                            <div className="space-y-4 max-w-2xl animate-in fade-in duration-150 text-xs">
                                <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3">
                                    <h4 className="font-bold text-white">Sistem Məlumatı</h4>
                                    <div className="space-y-2 text-[#A1A1AA]">
                                        <p>Tətbiq: <strong className="text-white">Altensor Task Management</strong></p>
                                        <p>Versiya: <strong className="text-white">v2.4.0 (Enterprise)</strong></p>
                                        <p>Backend API: <strong className="text-emerald-400">Online / Connected</strong></p>
                                        <p>Real-Time SignalR: <strong className="text-emerald-400">Aktivdir</strong></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── TAB 4: DASHBOARD ─── */}
                        {activeTab === 'dashboard' && (
                            <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3 text-xs max-w-2xl animate-in fade-in duration-150">
                                <h4 className="font-bold text-white">Dashboard Konfiqurasiyası</h4>
                                <p className="text-[#A1A1AA]">
                                    KPI kartları və qrafiklərin göstərilməsi avtomatik tənzimlənir.
                                </p>
                            </div>
                        )}

                        {/* ─── TAB 5: BREND & LOQO ─── */}
                        {activeTab === 'brand' && (
                            <div className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-3 text-xs max-w-2xl animate-in fade-in duration-150">
                                <h4 className="font-bold text-white">Brend Tənzimləmələri</h4>
                                <p className="text-[#A1A1AA]">
                                    Şirkət brendi və Task Management loqosu aktivdir.
                                </p>
                            </div>
                        )}

                        {/* ─── TAB 6: İSTİFADƏÇİLƏR (Admin) ─── */}
                        {activeTab === 'users' && isAdmin && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between">
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="İstifadəçi axtar..."
                                        className="bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 w-64"
                                    />
                                    <span className="text-xs text-[#71717A]">{usersList.length} istifadəçi</span>
                                </div>

                                <div className="max-h-72 overflow-y-auto divide-y divide-[#27272A] rounded-xl border border-[#27272A] bg-[#18181B]">
                                    {usersLoading ? (
                                        <div className="p-6 text-center text-xs text-[#71717A]">Yüklənir...</div>
                                    ) : (
                                        usersList
                                            .filter((u) => u.userName?.toLowerCase().includes(userSearch.toLowerCase()))
                                            .map((u) => (
                                                <div key={u.id} className="p-3 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                                                            {u.userName?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{u.userName}</p>
                                                            <p className="text-[10px] text-[#71717A]">{u.email}</p>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#27272A] text-[#D4D4D8]">
                                                        {u.role || 'Employee'}
                                                    </span>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Inner Password Reset Modal ─── */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-md bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-6 shadow-2xl space-y-4 text-[#F4F4F5]">
                        <div className="flex items-center justify-between border-b border-[#2C2C2E] pb-3">
                            <div className="flex items-center gap-2">
                                <KeyIcon className="w-5 h-5 text-blue-400" />
                                <h3 className="text-sm font-bold text-white">Şifrəni Sıfırla / Dəyiş</h3>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-[#71717A] hover:text-white cursor-pointer"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs">
                                {passwordSuccess}
                            </div>
                        )}

                        {passwordStep === 'request' ? (
                            <div className="space-y-4 text-xs">
                                <p className="text-[#D4D4D8]">
                                    Şifrənizi sıfırlamaq üçün <strong>{userInfo?.email}</strong> ünvanına 6 rəqəmli təhlükəsizlik kodu (OTP) göndəriləcək.
                                </p>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => setShowPasswordModal(false)}
                                        className="px-3.5 py-1.5 text-xs text-[#71717A] hover:text-white cursor-pointer"
                                    >
                                        Ləğv et
                                    </button>
                                    <button
                                        onClick={handleSendResetOtp}
                                        disabled={passwordLoading}
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                                    >
                                        {passwordLoading ? 'Göndərilir...' : 'Kodu Göndər'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="text-[#A1A1AA] block mb-1">Təsdiq Kodu (OTP)</label>
                                    <input
                                        type="text"
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value)}
                                        placeholder="6 rəqəmli kod"
                                        className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#A1A1AA] block mb-1">Yeni Şifrə</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#A1A1AA] block mb-1">Yeni Şifrə Təkrarı</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => setPasswordStep('request')}
                                        className="px-3.5 py-1.5 text-xs text-[#71717A] hover:text-white cursor-pointer"
                                    >
                                        Geri
                                    </button>
                                    <button
                                        onClick={handleConfirmPasswordReset}
                                        disabled={passwordLoading}
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
                                    >
                                        {passwordLoading ? 'Dəyişdirilir...' : 'Təsdiqlə və Yadda Saxla'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsModal;
