import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import CreateTaskModal from '../components/CreateTaskModal';
import { taskService, authService, notificationService } from '../api';
import type { TaskResponse, NotificationResponse } from '../dto';
import { TaskStatus, DifficultyLevel } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
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
    const [viewMode, setViewMode] = useState<'List' | 'Kanban'>('Kanban');

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [ownershipFilter, setOwnershipFilter] = useState<string>('assigned');
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
        return userInfo.roles.some(
            (r) => r.toLowerCase().includes('manager') || r.toLowerCase().includes('admin')
        );
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

    const loadData = async () => {
        try {
            setLoading(true);
            const [tasksData, notificationsData] = await Promise.all([
                taskService.getAllTasks().catch(() => []),
                notificationService.getMyNotifications().catch(() => []),
            ]);
            setAllTasks(tasksData);
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
            setAllTasks((prev) =>
                prev.map((t) => (String(t.id) === String(taskId) ? { ...t, status: TaskStatus.UnderReview } : t))
            );
        } catch {
            alert('Tapşırıq tamamlana bilmədi');
        }
    };

    // Filter Logic
    const filteredTasks = useMemo(() => {
        let result = allTasks;

        // 1. Ownership Filter
        if (ownershipFilter === 'created') {
            result = result.filter((task) => task.createdByUserId === userInfo?.userId);
        } else if (ownershipFilter === 'assigned') {
            result = result.filter((task) => task.assignedToUserId === userInfo?.userId);
        } else {
            if (!isManager) {
                result = result.filter(
                    (task) =>
                        task.assignedToUserId === userInfo?.userId ||
                        task.createdByUserId === userInfo?.userId
                );
            }
        }

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

        // 4. Difficulty Filter
        if (difficultyFilter !== 'all') {
            result = result.filter((task) => task.difficulty === parseInt(difficultyFilter));
        }

        // 5. Date Preset Filter
        if (datePreset !== 'all') {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const tomorrow = new Date(now.getTime() + 86400000);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const nextWeek = new Date(now.getTime() + 7 * 86400000);

            if (datePreset === 'today') {
                result = result.filter((t) => t.deadline.startsWith(todayStr));
            } else if (datePreset === 'tomorrow') {
                result = result.filter((t) => t.deadline.startsWith(tomorrowStr));
            } else if (datePreset === 'nextWeek') {
                result = result.filter((t) => new Date(t.deadline) <= nextWeek && new Date(t.deadline) >= now);
            }
        }

        return result;
    }, [allTasks, userInfo, ownershipFilter, isManager, searchQuery, statusFilter, difficultyFilter, datePreset]);

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || difficultyFilter !== 'all' || ownershipFilter !== 'all' || datePreset !== 'all';

    const clearAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
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
            title: 'Gözləmədə',
            statuses: [TaskStatus.Pending, TaskStatus.Assigned],
            color: '#38BDF8',
            bgGlow: 'bg-sky-500/10',
        },
        {
            id: 'inProgress',
            title: 'İcrada',
            statuses: [TaskStatus.InProgress],
            color: '#FBBF24',
            bgGlow: 'bg-amber-500/10',
        },
        {
            id: 'underReview',
            title: 'Yoxlanışda',
            statuses: [TaskStatus.UnderReview],
            color: '#A78BFA',
            bgGlow: 'bg-purple-500/10',
        },
        {
            id: 'completed',
            title: 'Tamamlandı',
            statuses: [TaskStatus.Completed],
            color: '#34D399',
            bgGlow: 'bg-emerald-500/10',
        },
        {
            id: 'expired',
            title: 'Gecikmiş / Ləğv',
            statuses: [TaskStatus.Expired, TaskStatus.Canceled],
            color: '#F87171',
            bgGlow: 'bg-rose-500/10',
        },
    ], []);

    const getPriorityBadge = (difficultyLevel?: number) => {
        if (difficultyLevel === DifficultyLevel.Hard) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Yüksək
                </span>
            );
        }
        if (difficultyLevel === DifficultyLevel.Medium) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Orta
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                Aşağı
            </span>
        );
    };

    const getStatusPill = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.Completed:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Tamamlandı
                    </span>
                );
            case TaskStatus.InProgress:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        İcrada
                    </span>
                );
            case TaskStatus.UnderReview:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                        Yoxlanışda
                    </span>
                );
            case TaskStatus.Expired:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                        Gecikmiş
                    </span>
                );
            case TaskStatus.Canceled:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Ləğv edildi
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        Gözləmədə
                    </span>
                );
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
                            <p className="text-xs text-[#71717A] font-medium">Tapşırıqlar yüklənir...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

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

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Top Action Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                Tapşırıqlar
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15">
                                {filteredTasks.length}
                            </span>
                        </div>

                        {/* Top Actions: Refresh, View Mode Switcher, Add Task */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                                title="Yenilə"
                                type="button"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>

                            {/* View Mode Toggle: Kanban vs List */}
                            <div className="flex items-center p-1 rounded-xl bg-[#18181B] border border-[#27272A]">
                                <button
                                    onClick={() => setViewMode('Kanban')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        viewMode === 'Kanban'
                                            ? 'bg-[#27272A] text-white shadow-xs'
                                            : 'text-[#71717A] hover:text-[#D4D4D8]'
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
                                            ? 'bg-[#27272A] text-white shadow-xs'
                                            : 'text-[#71717A] hover:text-[#D4D4D8]'
                                    }`}
                                    type="button"
                                >
                                    <ListBulletIcon className="w-3.5 h-3.5" />
                                    <span>Cədvəl</span>
                                </button>
                            </div>

                            {/* Create Task Button */}
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer"
                            >
                                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                <span>Yeni Tapşırıq</span>
                            </button>
                        </div>
                    </div>

                    {/* CRM Style Unified Filter Bar */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        {/* Left Side Filters */}
                        <div className="flex items-center gap-2.5 flex-wrap flex-1">
                            {/* Search Input */}
                            <div className="relative flex items-center min-w-[200px] flex-1 sm:flex-initial">
                                <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] absolute left-3 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Tapşırıq axtar..."
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                />
                            </div>

                            {/* Ownership Pills */}
                            <div className="flex items-center p-0.5 rounded-xl bg-[#27272A]/80 border border-[#3F3F46]/60 text-xs">
                                <button
                                    onClick={() => setOwnershipFilter('assigned')}
                                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                        ownershipFilter === 'assigned' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                                    }`}
                                >
                                    Təyin Edilənlər
                                </button>
                                <button
                                    onClick={() => setOwnershipFilter('created')}
                                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                        ownershipFilter === 'created' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                                    }`}
                                >
                                    Yaratdıqlarım
                                </button>
                                <button
                                    onClick={() => setOwnershipFilter('all')}
                                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                                        ownershipFilter === 'all' ? 'bg-[#18181B] text-white shadow-xs' : 'text-[#A1A1AA] hover:text-white'
                                    }`}
                                >
                                    Hamısı
                                </button>
                            </div>

                            {/* Priority Select */}
                            <div className="relative flex items-center">
                                <select
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value)}
                                    className="bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 pr-7 font-medium"
                                >
                                    <option value="all">Bütün Prioritetlər</option>
                                    <option value={DifficultyLevel.Hard}>Yüksək (Çətin)</option>
                                    <option value={DifficultyLevel.Medium}>Orta</option>
                                    <option value={DifficultyLevel.Easy}>Aşağı (Asan)</option>
                                </select>
                                <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-2.5 pointer-events-none" />
                            </div>

                            {/* Status Select */}
                            <div className="relative flex items-center">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 pr-7 font-medium"
                                >
                                    <option value="all">Bütün Statuslar</option>
                                    <option value={TaskStatus.Pending}>Gözləmədə</option>
                                    <option value={TaskStatus.InProgress}>İcrada</option>
                                    <option value={TaskStatus.UnderReview}>Yoxlanışda</option>
                                    <option value={TaskStatus.Completed}>Tamamlandı</option>
                                    <option value={TaskStatus.Expired}>Gecikmiş</option>
                                </select>
                                <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-2.5 pointer-events-none" />
                            </div>

                            {/* Date Presets */}
                            <div className="relative flex items-center">
                                <select
                                    value={datePreset}
                                    onChange={(e) => setDatePreset(e.target.value)}
                                    className="bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3 py-1.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 pr-7 font-medium"
                                >
                                    <option value="all">Bütün Tarixlər</option>
                                    <option value="today">Bugün</option>
                                    <option value="tomorrow">Sabah</option>
                                    <option value="nextWeek">+7 Gün</option>
                                </select>
                                <CalendarIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-2.5 pointer-events-none" />
                            </div>
                        </div>

                        {/* Right: Clear Filters Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                type="button"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                            >
                                <XMarkIcon className="w-3.5 h-3.5" />
                                <span>Təmizlə</span>
                            </button>
                        )}
                    </div>

                    {/* VIEW MODE 1: KANBAN BOARD */}
                    {viewMode === 'Kanban' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                            {kanbanColumns.map((col) => {
                                const columnTasks = filteredTasks.filter((t) => col.statuses.includes(t.status));

                                return (
                                    <div
                                        key={col.id}
                                        className="flex flex-col rounded-2xl bg-[#18181B] border border-[#27272A] p-3.5 gap-3 min-h-[500px]"
                                    >
                                        {/* Column Header */}
                                        <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }}></span>
                                                <span className="text-xs font-bold text-white">{col.title}</span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#27272A] text-[#A1A1AA]">
                                                {columnTasks.length}
                                            </span>
                                        </div>

                                        {/* Column Cards */}
                                        <div className="flex flex-col gap-2.5">
                                            {columnTasks.length === 0 ? (
                                                <div className="py-8 text-center text-[11px] text-[#52525B]">
                                                    Tapşırıq yoxdur
                                                </div>
                                            ) : (
                                                columnTasks.map((t) => (
                                                    <div
                                                        key={t.id}
                                                        onClick={() => navigate(`/tasks/${t.id}`)}
                                                        className="rounded-xl border border-[#27272A] bg-[#1C1C1E] p-3.5 flex flex-col gap-2.5 hover:border-[#3F3F46] hover:bg-[#202023] transition-all cursor-pointer group shadow-xs relative"
                                                    >
                                                        {/* Top Row: Priority & Quick Menu */}
                                                        <div className="flex items-center justify-between">
                                                            {getPriorityBadge(t.difficulty)}

                                                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenActionMenuId(openActionMenuId === t.id ? null : t.id)}
                                                                    className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10 transition-colors"
                                                                >
                                                                    <EllipsisHorizontalIcon className="w-4 h-4" />
                                                                </button>

                                                                {openActionMenuId === t.id && (
                                                                    <div className="absolute right-0 top-full mt-1 w-36 bg-[#18181B] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs animate-in fade-in duration-100">
                                                                        <button
                                                                            onClick={() => navigate(`/tasks/${t.id}`)}
                                                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#D4D4D8] hover:bg-white/5 hover:text-white text-left"
                                                                        >
                                                                            <EyeIcon className="w-3.5 h-3.5" />
                                                                            <span>Bax</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => navigate(`/tasks/edit/${t.id}`)}
                                                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#D4D4D8] hover:bg-white/5 hover:text-white text-left"
                                                                        >
                                                                            <PencilSquareIcon className="w-3.5 h-3.5" />
                                                                            <span>Redaktə</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => handleQuickStatusChange(t.id, TaskStatus.Completed, e)}
                                                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 text-left"
                                                                        >
                                                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                            <span>Tamamla</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => handleDeleteTask(t.id, e)}
                                                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-left"
                                                                        >
                                                                            <TrashIcon className="w-3.5 h-3.5" />
                                                                            <span>Sil</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Card Title & Description */}
                                                        <div>
                                                            <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                                                {t.title}
                                                            </h4>
                                                            {t.description && (
                                                                <p className="text-[11px] text-[#71717A] line-clamp-2 mt-1">
                                                                    {t.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Bottom Row: Due Date & Assignee */}
                                                        <div className="flex items-center justify-between pt-2 border-t border-[#27272A] text-[10px] text-[#A1A1AA]">
                                                            <div className="flex items-center gap-1">
                                                                <ClockIcon className="w-3 h-3 text-[#71717A]" />
                                                                <span>{new Date(t.deadline).toLocaleDateString('az-AZ')}</span>
                                                            </div>

                                                            {t.assignedToUserName && (
                                                                <span className="font-semibold text-white truncate max-w-[90px]">
                                                                    {t.assignedToUserName}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Direct Workflow Actions on Card */}
                                                        {(t.status === TaskStatus.Assigned || t.status === TaskStatus.Pending) && t.assignedToUserId === userInfo?.userId && (
                                                            <div className="flex items-center gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleAcceptTask(t.id, e)}
                                                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
                                                                >
                                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                    <span>Qəbul Et</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleRejectTask(t.id, e)}
                                                                    className="flex items-center justify-center py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                                                                >
                                                                    <span>İmtina</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {t.status === TaskStatus.InProgress && t.assignedToUserId === userInfo?.userId && (
                                                            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleFinishTask(t.id, e)}
                                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors shadow-xs cursor-pointer"
                                                                >
                                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                    <span>İcranı Bitir</span>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {t.status === TaskStatus.UnderReview && (t.createdByUserId === userInfo?.userId || isManager) && t.assignedToUserId !== userInfo?.userId && (
                                                            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => navigate(`/tasks/${t.id}`)}
                                                                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-[11px] transition-colors cursor-pointer"
                                                                >
                                                                    <SparklesIcon className="w-3.5 h-3.5 text-purple-400" />
                                                                    <span>Xal ver / Yoxla</span>
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
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-[#27272A] text-[#71717A] font-semibold bg-[#141416]">
                                            <th className="py-3.5 px-4 font-medium">Tapşırıq</th>
                                            <th className="py-3.5 px-4 font-medium">Prioritet</th>
                                            <th className="py-3.5 px-4 font-medium">Təyin Edilib</th>
                                            <th className="py-3.5 px-4 font-medium">İcra Tarixi</th>
                                            <th className="py-3.5 px-4 font-medium">Status</th>
                                            <th className="py-3.5 px-4 text-right font-medium">Əməliyyatlar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]">
                                        {filteredTasks.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-xs text-[#71717A]">
                                                    Tapşırıq tapılmadı
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTasks.map((t) => (
                                                <tr
                                                    key={t.id}
                                                    onClick={() => navigate(`/tasks/${t.id}`)}
                                                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                                >
                                                    <td className="py-3.5 px-4 max-w-[280px]">
                                                        <div className="font-bold text-[#E4E4E7] group-hover:text-white truncate">
                                                            {t.title}
                                                        </div>
                                                        {t.description && (
                                                            <div className="text-[11px] text-[#71717A] truncate mt-0.5">
                                                                {t.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {getPriorityBadge(t.difficulty)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-[#D4D4D8] font-medium">
                                                        {t.assignedToUserName || 'Təyin edilməyib'}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-[#A1A1AA]">
                                                        <div className="flex items-center gap-1.5">
                                                            <ClockIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                                            <span>{new Date(t.deadline).toLocaleDateString('az-AZ')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        {getStatusPill(t.status)}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {/* Quick workflow table buttons */}
                                                            {(t.status === TaskStatus.Assigned || t.status === TaskStatus.Pending) && t.assignedToUserId === userInfo?.userId && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => handleAcceptTask(t.id, e)}
                                                                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                                                                    >
                                                                        Qəbul Et
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleRejectTask(t.id, e)}
                                                                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                                                                    >
                                                                        İmtina
                                                                    </button>
                                                                </>
                                                            )}

                                                            {t.status === TaskStatus.InProgress && t.assignedToUserId === userInfo?.userId && (
                                                                <button
                                                                    onClick={(e) => handleFinishTask(t.id, e)}
                                                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                                                                >
                                                                    İcranı Bitir
                                                                </button>
                                                            )}

                                                            {t.status === TaskStatus.UnderReview && (t.createdByUserId === userInfo?.userId || isManager) && t.assignedToUserId !== userInfo?.userId && (
                                                                <button
                                                                    onClick={() => navigate(`/tasks/${t.id}`)}
                                                                    className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold text-[11px] transition-colors cursor-pointer"
                                                                >
                                                                    Xal ver
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() => navigate(`/tasks/edit/${t.id}`)}
                                                                className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                                title="Redaktə"
                                                            >
                                                                <PencilSquareIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteTask(t.id, e)}
                                                                className="p-1.5 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                                title="Sil"
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
