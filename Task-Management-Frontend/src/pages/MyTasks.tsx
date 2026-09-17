import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import CreateTaskModal from '../components/CreateTaskModal';
import CustomSelect, { type SelectOption } from '../components/CustomSelect';
import { taskService, authService, notificationService } from '../api';
import { signalRService } from '../services/signalRService';
import type { TaskResponse, NotificationResponse } from '../dto';
import { TaskStatus, DifficultyLevel, Priority } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl, isUserAdmin, isUserManager, formatDateTime } from '../utils';
import type { UserInfo } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import {
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ListBulletIcon,
    Squares2X2Icon,
    ChevronDownIcon,
    CalendarIcon,
    ClockIcon,
    EllipsisHorizontalIcon,
    TrashIcon,
    PencilSquareIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    SparklesIcon,
    FunnelIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const MyTasks: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [allTasks, setAllTasks] = useState<TaskResponse[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // View Mode: 'List' | 'Kanban'
    const [viewMode, setViewMode] = useState<'List' | 'Kanban'>('List');

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [ownershipFilter, setOwnershipFilter] = useState<string>('all');
    const [datePreset, setDatePreset] = useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [openActionMenuId, setOpenActionMenuId] = useState<string | number | null>(null);

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

    const isManager = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return false;
        return isUserAdmin(userInfo.roles) || isUserManager(userInfo.roles);
    }, [userInfo]);

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
    }, [navigate]);

    // Close action dropdown on outside click
    useEffect(() => {
        const handleOutside = () => setOpenActionMenuId(null);
        document.addEventListener('click', handleOutside);
        return () => document.removeEventListener('click', handleOutside);
    }, []);

    // Live SignalR sync and focus/visibility auto-refresh for real-time task status updates
    useEffect(() => {
        const syncTasks = () => {
            taskService.getAllTasks()
                .then((tasks) => {
                    const clean = (tasks || []).filter((t: any) => !taskService.isSystemActivityTask(t));
                    setAllTasks(clean);
                })
                .catch(() => {});
        };

        const unsubscribe = signalRService.subscribe('ReceiveNotification', () => {
            syncTasks();
        });

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                syncTasks();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', handleVisibility);

        // Gentle polling interval (every 10 seconds)
        const pollInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                syncTasks();
            }
        }, 10000);

        return () => {
            unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('focus', handleVisibility);
            clearInterval(pollInterval);
        };
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksData, notificationsData] = await Promise.all([
                taskService.getAllTasks().catch(() => []),
                notificationService.getMyNotifications().catch(() => []),
            ]);
            const cleanTasks = (tasksData || []).filter((t: any) => !taskService.isSystemActivityTask(t));
            setAllTasks(cleanTasks);
            setNotifications(notificationsData);
        } catch {
            // Silent fail
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const handleDeleteTask = async (taskId: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Bu tapşırığı silmək istədiyinizə əminsiniz?')) return;

        try {
            await taskService.deleteTask(taskId);
            setAllTasks((prev) => prev.filter((t) => String(t.id) !== String(taskId)));
        } catch {
            alert('Tapşırığı silmək mümkün olmadı');
        }
    };

    const handleAcceptTask = async (taskId: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await taskService.acceptTask(taskId);
            setAllTasks((prev) =>
                prev.map((t) => (String(t.id) === String(taskId) ? { ...t, status: TaskStatus.InProgress } : t))
            );
        } catch {
            alert('Tapşırıq qəbul edilə bilmədi');
        }
    };

    const handleRejectTask = async (taskId: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        const reason = window.prompt('İmtina səbəbini daxil edin:') || 'İmtina edildi';
        try {
            await taskService.rejectTask(taskId, reason);
            setAllTasks((prev) =>
                prev.map((t) => (String(t.id) === String(taskId) ? { ...t, status: TaskStatus.Pending, assignedToUserId: undefined } : t))
            );
        } catch {
            alert('Tapşırıqdan imtina edilə bilmədi');
        }
    };

    const handleFinishTask = async (taskId: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await taskService.finishTask(taskId);
            const finishComment = '🏁 [Sistem / Bitirildi]: Tapşırıq icraçı tərəfindən bitirildi və yoxlamaya təqdim edildi.';
            await taskService.addComment(taskId, finishComment).catch(() => {});
            setAllTasks((prev) =>
                prev.map((t) => (String(t.id) === String(taskId) ? { ...t, status: TaskStatus.UnderReview } : t))
            );
        } catch {
            alert('Tapşırıq tamamlana bilmədi');
        }
    };

    // Filter Logic
    const filteredTasks = useMemo(() => {
        let result = allTasks.filter((t: any) => !taskService.isSystemActivityTask(t));

        // 1. Ownership Filter
        if (ownershipFilter === 'created') {
            result = result.filter((task) => task.createdByUserId === userInfo?.userId);
        } else if (ownershipFilter === 'assigned') {
            result = result.filter((task) => task.assignedToUserId === userInfo?.userId);
        }
        // When ownershipFilter === 'all', show all role-authorized tasks returned by backend API

        // 2. Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description?.toLowerCase().includes(query)
            );
        }

        // 3. Status Filter
        if (statusFilter !== 'all') {
            result = result.filter((task) => task.status === parseInt(statusFilter));
        }

        // 4. Priority Filter
        if (priorityFilter !== 'all') {
            result = result.filter((task) => (task.priority !== undefined ? task.priority : 1) === parseInt(priorityFilter));
        }

        // 5. Difficulty Filter
        if (difficultyFilter !== 'all') {
            result = result.filter((task) => task.difficulty === parseInt(difficultyFilter));
        }

        // 6. Date Preset Filter
        if (datePreset !== 'all') {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const tomorrow = new Date(now.getTime() + 86400000);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const nextWeek = new Date(now.getTime() + 7 * 86400000);

            if (datePreset === 'today') {
                result = result.filter((taskItem) => taskItem.deadline.startsWith(todayStr));
            } else if (datePreset === 'tomorrow') {
                result = result.filter((taskItem) => taskItem.deadline.startsWith(tomorrowStr));
            } else if (datePreset === 'nextWeek') {
                result = result.filter((taskItem) => new Date(taskItem.deadline) <= nextWeek && new Date(taskItem.deadline) >= now);
            }
        }

        return taskService.sortTasksNewestFirst(result);
    }, [allTasks, userInfo, ownershipFilter, isManager, searchQuery, statusFilter, priorityFilter, difficultyFilter, datePreset]);

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || difficultyFilter !== 'all' || ownershipFilter !== 'all' || datePreset !== 'all';

    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setDifficultyFilter('all');
        setOwnershipFilter('all');
        setDatePreset('all');
    };

    const handleQuickStatusChange = async (taskId: string | number, newStatus: TaskStatus, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const task = allTasks.find((t) => String(t.id) === String(taskId));
            if (task) {
                await taskService.updateTask({
                    id: task.id,
                    title: task.title,
                    description: task.description,
                    difficulty: task.difficulty,
                    status: newStatus,
                    deadline: task.deadline,
                    assignedToUserId: task.assignedToUserId,
                    createdByUserId: task.createdByUserId,
                    parentTaskId: task.parentTaskId,
                });
                await loadData();
            }
        } catch (err) {
            console.error('Status update failed:', err);
        }
    };

    // Kanban Columns Configuration
    const kanbanColumns = useMemo<{
        id: string;
        title: string;
        statuses: TaskStatus[];
        color: string;
        bgGlow: string;
    }[]>(() => [
        {
            id: 'pending',
            title: t('statuses.pending', {}, 'Gözləmədə'),
            statuses: [TaskStatus.Pending, TaskStatus.Assigned],
            color: '#38BDF8',
            bgGlow: 'bg-sky-500/10',
        },
        {
            id: 'inProgress',
            title: t('statuses.inProgress', {}, 'İcrada'),
            statuses: [TaskStatus.InProgress],
            color: '#FBBF24',
            bgGlow: 'bg-amber-500/10',
        },
        {
            id: 'underReview',
            title: t('statuses.review', {}, 'Yoxlanışda'),
            statuses: [TaskStatus.UnderReview],
            color: '#A78BFA',
            bgGlow: 'bg-purple-500/10',
        },
        {
            id: 'completed',
            title: t('statuses.completed', {}, 'Tamamlandı'),
            statuses: [TaskStatus.Completed],
            color: '#34D399',
            bgGlow: 'bg-emerald-500/10',
        },
        {
            id: 'expired',
            title: `${t('statuses.cancelled', {}, 'Ləğv')} / ${t('statuses.pending', {}, 'Gecikmiş')}`,
            statuses: [TaskStatus.Expired, TaskStatus.Canceled],
            color: '#F87171',
            bgGlow: 'bg-rose-500/10',
        },
    ], [t]);

    const getPriorityBadge = (difficultyLevel?: number) => {
        if (difficultyLevel === DifficultyLevel.Hard) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {t('difficulties.hard', {}, 'Yüksək')}
                </span>
            );
        }
        if (difficultyLevel === DifficultyLevel.Medium) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {t('difficulties.medium', {}, 'Orta')}
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                {t('difficulties.easy', {}, 'Aşağı')}
            </span>
        );
    };

    const getStatusPill = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.Completed:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {t('statuses.completed', {}, 'Tamamlandı')}
                    </span>
                );
            case TaskStatus.InProgress:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        {t('statuses.inProgress', {}, 'İcrada')}
                    </span>
                );
            case TaskStatus.UnderReview:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        {t('statuses.review', {}, 'Yoxlanışda')}
                    </span>
                );
            case TaskStatus.Expired:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        {t('common.overdue', {}, 'Gecikmiş')}
                    </span>
                );
            case TaskStatus.Canceled:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {t('statuses.cancelled', {}, 'Ləğv edildi')}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        {t('statuses.pending', {}, 'Gözləmədə')}
                    </span>
                );
        }
    };

    const priorityOptions = useMemo<SelectOption[]>(() => [
        { value: 'all', label: 'Bütün Prioritetlər' },
        { value: Priority.Urgent, label: 'Təcili', icon: <span className="text-xs">🔥</span> },
        { value: Priority.High, label: 'Yüksək', icon: <span className="text-xs">⚡</span> },
        { value: Priority.Normal, label: 'Normal', icon: <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> },
        { value: Priority.Low, label: 'Aşağı', icon: <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" /> },
    ], []);

    const difficultyOptions = useMemo<SelectOption[]>(() => [
        { value: 'all', label: 'Bütün Çətinliklər' },
        { value: DifficultyLevel.Hard, label: t('difficulties.hard', {}, 'Çətin (Yüksək)'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">30 bal</span> },
        { value: DifficultyLevel.Medium, label: t('difficulties.medium', {}, 'Orta'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">20 bal</span> },
        { value: DifficultyLevel.Easy, label: t('difficulties.easy', {}, 'Asan (Aşağı)'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">10 bal</span> },
    ], [t]);

    const statusOptions = useMemo<SelectOption[]>(() => [
        { value: 'all', label: t('tasks.filterByStatus', {}, 'Bütün Statuslar') },
        { value: TaskStatus.Pending, label: t('statuses.pending', {}, 'Gözləmədə'), icon: <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> },
        { value: TaskStatus.InProgress, label: t('statuses.inProgress', {}, 'İcrada'), icon: <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> },
        { value: TaskStatus.UnderReview, label: t('statuses.review', {}, 'Yoxlanışda'), icon: <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> },
        { value: TaskStatus.Completed, label: t('statuses.completed', {}, 'Tamamlandı'), icon: <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> },
        { value: TaskStatus.Expired, label: t('common.overdue', {}, 'Gecikmiş'), icon: <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> },
    ], [t]);

    const dateOptions = useMemo<SelectOption[]>(() => [
        { value: 'all', label: t('common.all', {}, 'Bütün Tarixlər') },
        { value: 'today', label: t('common.today', {}, 'Bugün') },
        { value: 'tomorrow', label: 'Sabah' },
        { value: 'nextWeek', label: '+7 Gün' },
    ], [t]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header notificationCount={0} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-[#71717A] font-medium">Tapşırıqlar yüklənir...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#121214] font-sans antialiased text-zinc-900 dark:text-[#F4F4F5] selection:bg-fuchsia-500/30">
            <Sidebar userRole={userRole} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-zinc-50 dark:bg-[#121214] scroll-smooth">
                <Header
                    userName={displayName}
                    userRole={userRole}
                    userEmail={userInfo?.email}
                    userAvatar={avatarSrc}
                    notificationCount={notifications.filter((n) => !n.isRead).length}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8 md:pb-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Top Action Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                                {t('tasks.allTasksTitle', {}, 'Tapşırıqlar')}
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-200 dark:bg-white/10 text-zinc-800 dark:text-white border border-zinc-300 dark:border-white/15">
                                {filteredTasks.length}
                            </span>
                        </div>

                        {/* Top Actions: Refresh, View Mode Switcher, Add Task */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                title={t('common.refresh', {}, 'Yenilə')}
                                type="button"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
                            </button>

                            {/* View Mode Toggle: Kanban vs List */}
                            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] shadow-xs">
                                <button
                                    onClick={() => setViewMode('Kanban')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        viewMode === 'Kanban'
                                            ? 'bg-zinc-100 dark:bg-[#27272A] text-zinc-900 dark:text-white shadow-xs'
                                            : 'text-zinc-500 dark:text-[#71717A] hover:text-zinc-900 dark:hover:text-[#D4D4D8]'
                                    }`}
                                    type="button"
                                >
                                    <Squares2X2Icon className="w-3.5 h-3.5" />
                                    <span>Kanban</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('List')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        viewMode === 'List'
                                            ? 'bg-zinc-100 dark:bg-[#27272A] text-zinc-900 dark:text-white shadow-xs'
                                            : 'text-zinc-500 dark:text-[#71717A] hover:text-zinc-900 dark:hover:text-[#D4D4D8]'
                                    }`}
                                    type="button"
                                >
                                    <ListBulletIcon className="w-3.5 h-3.5" />
                                    <span>{t('tasks.taskList', {}, 'Cədvəl')}</span>
                                </button>
                            </div>

                            {/* Create Task Button */}
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                type="button"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg border border-zinc-200/80 dark:border-transparent transition-colors cursor-pointer"
                            >
                                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                <span>{t('tasks.newTask', {}, 'Yeni Tapşırıq')}</span>
                            </button>
                        </div>
                    </div>

                    {/* CRM Style Unified Filter Bar */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        {/* Left Side Filters */}
                        <div className="flex items-center gap-2.5 flex-wrap flex-1">
                            {/* Search Input */}
                            <div className="relative flex items-center min-w-[200px] flex-1 sm:flex-initial">
                                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('tasks.searchTasks', {}, 'Tapşırıq axtar...')}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                />
                            </div>

                            {/* Ownership Pills */}
                            <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 text-xs">
                                <button
                                    onClick={() => setOwnershipFilter('assigned')}
                                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                        ownershipFilter === 'assigned' ? 'bg-white dark:bg-[#18181B] text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white'
                                    }`}
                                >
                                    {t('tasks.assignedTo', {}, 'Təyin Edilənlər')}
                                </button>
                                <button
                                    onClick={() => setOwnershipFilter('created')}
                                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                        ownershipFilter === 'created' ? 'bg-white dark:bg-[#18181B] text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white'
                                    }`}
                                >
                                    {t('tasks.assignedBy', {}, 'Yaratdıqlarım')}
                                </button>
                                <button
                                    onClick={() => setOwnershipFilter('all')}
                                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                        ownershipFilter === 'all' ? 'bg-white dark:bg-[#18181B] text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white'
                                    }`}
                                >
                                    {t('common.all', {}, 'Hamısı')}
                                </button>
                            </div>

                            {/* Priority Select */}
                            <CustomSelect
                                value={priorityFilter}
                                onChange={setPriorityFilter}
                                options={priorityOptions}
                            />

                            {/* Difficulty Select */}
                            <CustomSelect
                                value={difficultyFilter}
                                onChange={setDifficultyFilter}
                                options={difficultyOptions}
                            />

                            {/* Status Select */}
                            <CustomSelect
                                value={statusFilter}
                                onChange={setStatusFilter}
                                options={statusOptions}
                            />

                            {/* Date Presets */}
                            <CustomSelect
                                value={datePreset}
                                onChange={setDatePreset}
                                options={dateOptions}
                                icon={<CalendarIcon className="w-3.5 h-3.5" />}
                            />
                        </div>

                        {/* Right: Clear Filters Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                type="button"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                                <span>{t('common.clear', {}, 'Təmizlə')}</span>
                            </button>
                        )}
                    </div>

                    {/* VIEW MODE 1: KANBAN BOARD */}
                    {viewMode === 'Kanban' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
                            {kanbanColumns.map((col) => {
                                const columnTasks = filteredTasks.filter((t) => col.statuses.includes(t.status));

                                return (
                                    <div
                                        key={col.id}
                                        className="flex flex-col rounded-2xl bg-zinc-100/70 dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] p-3.5 gap-3 min-h-[400px] sm:min-h-[500px]"
                                    >
                                        {/* Column Header */}
                                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-[#27272A]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }}></span>
                                                <span className="text-xs font-bold text-zinc-900 dark:text-white">{col.title}</span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-200 dark:bg-[#27272A] text-zinc-700 dark:text-[#A1A1AA]">
                                                {columnTasks.length}
                                            </span>
                                        </div>

                                        {/* Column Cards */}
                                        <div className="flex flex-col gap-2.5">
                                            {columnTasks.length === 0 ? (
                                                <div className="py-8 text-center text-[11px] text-zinc-400 dark:text-[#52525B]">
                                                    {t('tasks.noTasks', {}, 'Tapşırıq yoxdur')}
                                                </div>
                                            ) : (
                                                columnTasks.map((taskItem) => (
                                                    <div
                                                        key={taskItem.id}
                                                        onClick={() => navigate(`/tasks/${taskItem.id}`)}
                                                        className="rounded-xl border border-zinc-200 dark:border-[#27272A] bg-white dark:bg-[#1C1C1E] p-3.5 flex flex-col gap-2.5 hover:border-zinc-300 dark:hover:border-[#3F3F46] hover:shadow-sm transition-all cursor-pointer group shadow-xs relative"
                                                    >
                                                        {/* Top Row: Priority & Quick Menu */}
                                                        <div className="flex items-center justify-between">
                                                            {getPriorityBadge(taskItem.difficulty)}

                                                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenActionMenuId(openActionMenuId === taskItem.id ? null : taskItem.id)}
                                                                    className="p-1 rounded-lg text-zinc-400 dark:text-[#71717A] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                                                >
                                                                    <EllipsisHorizontalIcon className="w-4 h-4" />
                                                                </button>

                                                                {openActionMenuId === taskItem.id && (
                                                                    <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs animate-in fade-in duration-100">
                                                                        <button
                                                                            onClick={() => navigate(`/tasks/${taskItem.id}`)}
                                                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-[#D4D4D8] hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white text-left cursor-pointer"
                                                                        >
                                                                            <EyeIcon className="w-3.5 h-3.5" />
                                                                            <span>{t('common.view', {}, 'Bax')}</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => navigate(`/tasks/edit/${taskItem.id}`)}
                                                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-700 dark:text-[#D4D4D8] hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white text-left cursor-pointer"
                                                                        >
                                                                            <PencilSquareIcon className="w-3.5 h-3.5" />
                                                                            <span>{t('common.edit', {}, 'Redaktə')}</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => handleQuickStatusChange(taskItem.id, TaskStatus.Completed, e)}
                                                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-left cursor-pointer"
                                                                        >
                                                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                            <span>{t('statuses.completed', {}, 'Tamamla')}</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => handleDeleteTask(taskItem.id, e)}
                                                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left cursor-pointer"
                                                                        >
                                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                                            <span>{t('common.delete', {}, 'Sil')}</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Card Title & Description */}
                                                        <div>
                                                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                                                                {taskItem.title}
                                                            </h4>
                                                            {taskItem.description && (
                                                                <p className="text-[11px] text-zinc-500 dark:text-[#71717A] line-clamp-2 mt-1">
                                                                    {taskItem.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Bottom Row: Due Date & Assignee */}
                                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#27272A] text-[10px] text-zinc-500 dark:text-[#A1A1AA]">
                                                            <div className="flex items-center gap-1">
                                                                <ClockIcon className="w-3 h-3 text-zinc-400 dark:text-[#71717A]" />
                                                                <span>{formatDateTime(taskItem.deadline)}</span>
                                                            </div>

                                                            {taskItem.assignedToUserName && (
                                                                <span className="font-semibold text-zinc-800 dark:text-white truncate max-w-[90px]">
                                                                    {taskItem.assignedToUserName}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Direct Workflow Actions on Card */}
                                                        {(taskItem.status === TaskStatus.Assigned || taskItem.status === TaskStatus.Pending) && taskItem.assignedToUserId === userInfo?.userId && (
                                                            <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleAcceptTask(taskItem.id, e)}
                                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
                                                                >
                                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                    <span>{t('tasks.accept', {}, 'Qəbul Et')}</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleRejectTask(taskItem.id, e)}
                                                                    className="flex items-center justify-center py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                                                                >
                                                                    <span>{t('common.cancel', {}, 'İmtina')}</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {taskItem.status === TaskStatus.InProgress && taskItem.assignedToUserId === userInfo?.userId && (
                                                            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleFinishTask(taskItem.id, e)}
                                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
                                                                >
                                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                    <span>{t('tasks.finishExecution', {}, 'İcranı Bitir')}</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {taskItem.status === TaskStatus.UnderReview && (taskItem.createdByUserId === userInfo?.userId || isManager) && taskItem.assignedToUserId !== userInfo?.userId && (
                                                            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => navigate(`/tasks/${taskItem.id}`)}
                                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold text-[11px] transition-colors cursor-pointer"
                                                                >
                                                                    <SparklesIcon className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                                                                    <span>{t('tasks.reviewAndScore', {}, 'Xal ver / Yoxla')}</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* VIEW MODE 2: HIGH-DENSITY LIST TABLE */
                        <div className="rounded-2xl border border-zinc-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] overflow-hidden shadow-xs">
                            <div className="overflow-x-auto -mx-1 sm:mx-0">
                                <table className="w-full text-left text-xs min-w-[640px]">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-[#27272A] text-zinc-500 dark:text-[#71717A] font-semibold bg-zinc-50 dark:bg-[#141416]">
                                            <th className="py-3.5 px-4 font-medium">{t('tasks.taskList', {}, 'Tapşırıq')}</th>
                                            <th className="py-3.5 px-4 font-medium">{t('tasks.priority', {}, 'Prioritet')}</th>
                                            <th className="py-3.5 px-4 font-medium">{t('tasks.assignedTo', {}, 'Təyin Edilib')}</th>
                                            <th className="py-3.5 px-4 font-medium">{t('tasks.deadline', {}, 'İcra Tarixi')}</th>
                                            <th className="py-3.5 px-4 font-medium">{t('tasks.status', {}, 'Status')}</th>
                                            <th className="py-3.5 px-4 text-right font-medium">{t('common.actions', {}, 'Əməliyyatlar')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-[#27272A]">
                                        {filteredTasks.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-xs text-zinc-500 dark:text-[#71717A]">
                                                    {t('tasks.noTasks', {}, 'Tapşırıq tapılmadı')}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTasks.map((taskItem) => (
                                                <tr
                                                    key={taskItem.id}
                                                    onClick={() => navigate(`/tasks/${taskItem.id}`)}
                                                    className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                                >
                                                    <td className="py-3.5 px-4 max-w-[280px]">
                                                        <div className="font-bold text-zinc-900 dark:text-[#E4E4E7] group-hover:text-primary-600 dark:group-hover:text-white truncate">
                                                            {taskItem.title}
                                                        </div>
                                                        {taskItem.description && (
                                                            <div className="text-[11px] text-zinc-500 dark:text-[#71717A] truncate mt-0.5">
                                                                {taskItem.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {getPriorityBadge(taskItem.difficulty)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-zinc-700 dark:text-[#D4D4D8] font-medium">
                                                        {taskItem.assignedToUserName || t('tasks.unassigned', {}, 'Təyin edilməyib')}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-zinc-500 dark:text-[#A1A1AA]">
                                                        <div className="flex items-center gap-1.5">
                                                            <ClockIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-[#71717A]" />
                                                            <span>{formatDateTime(taskItem.deadline)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {getStatusPill(taskItem.status)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {/* Quick workflow table buttons */}
                                                            {(taskItem.status === TaskStatus.Assigned || taskItem.status === TaskStatus.Pending) && taskItem.assignedToUserId === userInfo?.userId && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => handleAcceptTask(taskItem.id, e)}
                                                                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                                                                    >
                                                                        {t('tasks.accept', {}, 'Qəbul Et')}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleRejectTask(taskItem.id, e)}
                                                                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                                                                    >
                                                                        {t('common.cancel', {}, 'İmtina')}
                                                                    </button>
                                                                </>
                                                            )}

                                                            {taskItem.status === TaskStatus.InProgress && taskItem.assignedToUserId === userInfo?.userId && (
                                                                <button
                                                                    onClick={(e) => handleFinishTask(taskItem.id, e)}
                                                                    className="px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                                                                >
                                                                    {t('tasks.finishExecution', {}, 'İcranı Bitir')}
                                                                </button>
                                                            )}

                                                            {taskItem.status === TaskStatus.UnderReview && (taskItem.createdByUserId === userInfo?.userId || isManager) && taskItem.assignedToUserId !== userInfo?.userId && (
                                                                <button
                                                                    onClick={() => navigate(`/tasks/${taskItem.id}`)}
                                                                    className="px-2.5 py-1 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 font-bold text-[11px] transition-colors cursor-pointer"
                                                                >
                                                                    {t('tasks.score', {}, 'Xal ver')}
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => navigate(`/tasks/edit/${taskItem.id}`)}
                                                                className="p-1.5 rounded-lg text-zinc-400 dark:text-[#71717A] hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                                                title={t('common.edit', {}, 'Redaktə')}
                                                            >
                                                                <PencilSquareIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteTask(taskItem.id, e)}
                                                                className="p-1.5 rounded-lg text-zinc-400 dark:text-[#71717A] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                                title={t('common.delete', {}, 'Sil')}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onTaskCreated={loadData}
            />
        </div>
    );
};

export default MyTasks;
