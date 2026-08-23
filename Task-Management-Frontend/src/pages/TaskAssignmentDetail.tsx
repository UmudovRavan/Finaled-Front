import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { useNotifications } from '../context';
import { taskService, authService, notificationService, userService, attachmentService } from '../api';
import type { TaskResponse, NotificationResponse, UserResponse } from '../dto';
import { TaskStatus, DifficultyLevel } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    ClockIcon,
    UserIcon,
    CalendarIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

type AssignmentStatus = 'pending' | 'accepted' | 'rejected';

const TaskAssignmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useNotifications();
    const [task, setTask] = useState<TaskResponse | null>(null);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // Assignment action state
    const [assignmentStatus, setAssignmentStatus] = useState<AssignmentStatus>('pending');
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl);
    }, [userInfo]);

    const displayName = useMemo(() => {
        if (!userInfo) return 'İstifadəçi';
        if (userInfo.userName) {
            return userInfo.userName.charAt(0).toUpperCase() + userInfo.userName.slice(1);
        }
        if (userInfo.email) {
            return userInfo.email.split('@')[0];
        }
        return 'İstifadəçi';
    }, [userInfo]);

    const userRole = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return 'Employee';
        return getPrimaryRole(userInfo.roles);
    }, [userInfo]);

    const assignedUser = useMemo(() => {
        if (!task?.assignedToUserId || !allUsers.length) return null;
        return allUsers.find(u => u.id === task.assignedToUserId) || null;
    }, [task, allUsers]);

    const createdByUser = useMemo(() => {
        if (!task?.createdByUserId || !allUsers.length) return null;
        return allUsers.find(u => u.id === task.createdByUserId) || null;
    }, [task, allUsers]);

    const isAssignedUser = useMemo(() => {
        if (!task || !userInfo) return false;
        return task.assignedToUserId === userInfo.userId;
    }, [task, userInfo]);

    const canAcceptReject = useMemo(() => {
        if (!task || !isAssignedUser) return false;
        return task.status === TaskStatus.Assigned;
    }, [task, isAssignedUser]);

    useEffect(() => {
        const token = authService.getToken();

        if (!token || isTokenExpired(token)) {
            authService.clearToken();
            navigate('/login');
            return;
        }

        const parsedUser = parseJwtToken(token);
        if (parsedUser) {
            setUserInfo(parsedUser);
        }

        loadData();
    }, [navigate, id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const taskId = String(id || '').trim();
            if (!taskId) {
                navigate('/tasks');
                return;
            }

            const [taskData, notificationsData, usersData] = await Promise.all([
                taskService.getTaskById(taskId).catch(() => null),
                notificationService.getMyNotifications().catch(() => []),
                userService.getAllUsers().catch(() => []),
            ]);

            if (!taskData) {
                navigate('/tasks');
                return;
            }

            setTask(taskData);
            setNotifications(notificationsData);
            setAllUsers(usersData);

            if (taskData.status === TaskStatus.InProgress) {
                setAssignmentStatus('accepted');
            } else if (taskData.status === TaskStatus.Assigned && !taskData.assignedToUserId) {
                setAssignmentStatus('rejected');
            }
        } catch {
            navigate('/tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptTask = async () => {
        if (!task || !userInfo) return;

        setIsProcessing(true);
        try {
            await taskService.acceptTask(task.id);
            setAssignmentStatus('accepted');
            const updatedTask = await taskService.getTaskById(task.id);
            setTask(updatedTask);
            addToast('Tapşırıq uğurla qəbul edildi!', undefined, 'success');
            navigate(`/tasks/${task.id}`);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data
                || 'Tapşırığı qəbul etmək mümkün olmadı';
            addToast(errorMessage, undefined, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectTask = async () => {
        if (!task || !userInfo || !rejectReason.trim()) {
            addToast('İmtina səbəbini daxil edin', undefined, 'error');
            return;
        }

        setIsProcessing(true);
        try {
            await taskService.rejectTask(task.id, rejectReason.trim());
            setAssignmentStatus('rejected');
            setShowRejectModal(false);
            const updatedTask = await taskService.getTaskById(task.id);
            setTask(updatedTask);
            addToast('Tapşırıqdan imtina edildi', undefined, 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data
                || 'Tapşırığı rədd etmək mümkün olmadı';
            addToast(errorMessage, undefined, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadAttachment = async (attachmentId: string | number, fileName: string) => {
        if (!userInfo) return;

        try {
            const blob = await attachmentService.downloadAttachment(attachmentId, userInfo.userId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            addToast('Faylı yükləmək mümkün olmadı', undefined, 'error');
        }
    };

    const handlePreviewAttachment = async (attachmentId: string | number) => {
        if (!userInfo) return;

        try {
            const previewUrl = await attachmentService.getPreviewUrl(attachmentId, userInfo.userId);
            if (!previewUrl || previewUrl === 'undefined' || previewUrl === 'null') {
                alert('Fayl önizləməsi mümkün deyil');
                return;
            }
            window.open(previewUrl, '_blank');
        } catch (error: any) {
            addToast(`Fayl önizləməsi mümkün olmadı: ${error.message || 'Naməlum xəta'}`, undefined, 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header notificationCount={0} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-[#71717A] font-medium">Tapşırıq yüklənir...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!task) return null;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5] selection:bg-fuchsia-500/30">
            <Sidebar userRole={userRole} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#121214] scroll-smooth">
                <Header
                    userName={displayName}
                    userRole={userRole}
                    userEmail={userInfo?.email}
                    userAvatar={avatarSrc}
                    notificationCount={notifications.filter((n) => !n.isRead).length}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
                    {/* Navigation Bar */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate('/tasks')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Tapşırıqlara Qayıt</span>
                        </button>

                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#27272A] text-[#D4D4D8]">
                            Tapşırıq #{task.id}
                        </span>
                    </div>

                    {/* Main Assignment Container */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
                        {/* Header Banner */}
                        <div className="p-6 sm:p-8 border-b border-[#27272A] space-y-4">
                            <div className="flex items-center gap-2.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    Təyinat Təsdiqi
                                </span>

                                {assignmentStatus === 'rejected' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                        İmtina Edildi
                                    </span>
                                )}
                            </div>

                            <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                                {task.title}
                            </h1>

                            <div className="flex items-center gap-4 text-xs text-[#A1A1AA] flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <CalendarIcon className="w-4 h-4 text-[#71717A]" />
                                    <span>İcra tarixi: {new Date(task.deadline).toLocaleDateString('az-AZ')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <UserIcon className="w-4 h-4 text-[#71717A]" />
                                    <span>Yaradan: {createdByUser?.userName || 'Menecer'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-6 sm:p-8 border-b border-[#27272A] space-y-2">
                            <h3 className="text-xs uppercase tracking-wider font-bold text-[#71717A]">
                                Tapşırıq Təsviri
                            </h3>
                            <p className="text-sm text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">
                                {task.description || 'Bu tapşırıq üçün ətraflı təsvir qeyd edilməyib.'}
                            </p>
                        </div>

                        {/* Attachments */}
                        {task.files && task.files.length > 0 && (
                            <div className="p-6 sm:p-8 border-b border-[#27272A] space-y-3">
                                <h3 className="text-xs uppercase tracking-wider font-bold text-[#71717A]">
                                    Qoşma Fayllar ({task.files.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {task.files.map((file, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-3 rounded-xl bg-[#1C1C1E] border border-[#27272A] hover:border-[#3F3F46] transition-colors group"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
                                                    <PaperClipIcon className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-white truncate">
                                                        {file.fileName}
                                                    </p>
                                                    <p className="text-[10px] text-[#71717A] truncate">
                                                        {file.contentType}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {file.id && (
                                                    <>
                                                        <button
                                                            onClick={() => handlePreviewAttachment(file.id!)}
                                                            className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                            title="Bax"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownloadAttachment(file.id!, file.fileName)}
                                                            className="p-1.5 rounded-lg text-[#71717A] hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                                                            title="Yüklə"
                                                        >
                                                            <ArrowDownTrayIcon className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Acceptance Callout Action Area */}
                        {canAcceptReject && assignmentStatus === 'pending' && (
                            <div className="p-6 sm:p-8 bg-[#141416] flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-white">Bu tapşırığı qəbul edirsiniz?</h4>
                                    <p className="text-xs text-[#71717A]">
                                        Qəbul etdikdən sonra tapşırıq icra mərhələsinə keçəcəkdir.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={handleAcceptTask}
                                        disabled={isProcessing}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        <span>{isProcessing ? 'İşlənir...' : 'Qəbul Et'}</span>
                                    </button>

                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={isProcessing}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                        <span>İmtina Et</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Rejection Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-400">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                <h3 className="text-sm font-bold text-white">İmtina Səbəbi</h3>
                            </div>
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-[#A1A1AA]">
                            Zəhmət olmasa bu tapşırıqdan imtina etmə səbəbinizi qeyd edin:
                        </p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="məs. Cari iş yüküm çoxdur / digər prioritet layihə üzərindəyəm..."
                            rows={3}
                            className="w-full bg-[#1C1C1E] border border-[#27272A] rounded-xl p-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-rose-500 resize-none font-sans"
                        />

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold cursor-pointer"
                            >
                                Bağla
                            </button>
                            <button
                                onClick={handleRejectTask}
                                disabled={isProcessing || !rejectReason.trim()}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
                            >
                                {isProcessing ? 'İmtina edilir...' : 'Təsdiqlə və İmtina Et'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskAssignmentDetail;
