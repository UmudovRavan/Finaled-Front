import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import { workloadService, userService, taskService, notificationService, authService } from '../api';
import type { EmployeeWorkloadDTO, NotificationResponse, TaskResponse, UserResponse } from '../dto';
import { TaskStatus, Priority } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl, formatDateTime } from '../utils';
import type { UserInfo } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    BoltIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserIcon,
    ClipboardDocumentListIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    FireIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

const WorkloadView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { hasPermission } = useAuth();

    const [workloads, setWorkloads] = useState<EmployeeWorkloadDTO[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [onlyOverloaded, setOnlyOverloaded] = useState(false);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

    const displayName = useMemo(() => {
        if (!userInfo) return 'İstifadəçi';
        if (userInfo.userName) return userInfo.userName.charAt(0).toUpperCase() + userInfo.userName.slice(1);
        if (userInfo.email) return userInfo.email.split('@')[0];
        return 'İstifadəçi';
    }, [userInfo]);

    const userRole = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return 'Employee';
        return getPrimaryRole(userInfo.roles);
    }, [userInfo]);

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl);
    }, [userInfo]);

    useEffect(() => {
        const token = authService.getToken();
        if (!token || isTokenExpired(token)) {
            authService.clearToken();
            navigate('/login');
            return;
        }

        const parsed = parseJwtToken(token);
        setUserInfo(parsed);
        fetchWorkloadData();
    }, [navigate]);

    const matchUserTasks = (userId: string, userName?: string, userEmail?: string, tasks: TaskResponse[] = []): TaskResponse[] => {
        const targetId = String(userId || '').trim().toLowerCase();
        const targetName = String(userName || '').trim().toLowerCase();
        const targetEmail = String(userEmail || '').trim().toLowerCase();

        return tasks.filter((t) => {
            if (!t) return false;
            const taskUserId = String(t.assignedToUserId || '').trim().toLowerCase();
            const taskUserName = String(t.assignedToUserName || '').trim().toLowerCase();

            if (targetId && taskUserId && targetId === taskUserId) return true;
            if (targetName && taskUserName && targetName === taskUserName) return true;
            if (targetEmail && (taskUserId === targetEmail || taskUserName === targetEmail)) return true;
            return false;
        });
    };

    const fetchWorkloadData = async () => {
        try {
            setRefreshing(true);
            const [serverWorkloads, users, allTasks, notifs] = await Promise.all([
                workloadService.getEmployeeWorkloads().catch(() => [] as EmployeeWorkloadDTO[]),
                userService.getAllUsers().catch(() => [] as UserResponse[]),
                taskService.getAllTasks().catch(() => [] as TaskResponse[]),
                notificationService.getMyNotifications().catch(() => [] as NotificationResponse[]),
            ]);

            setNotifications(notifs);

            const userList: { id: string; name: string; email?: string }[] = [];
            const seenIds = new Set<string>();

            // First add users from serverWorkloads
            serverWorkloads.forEach((w) => {
                const id = String(w.userId || '').trim();
                if (id && !seenIds.has(id.toLowerCase())) {
                    seenIds.add(id.toLowerCase());
                    userList.push({ id: w.userId, name: w.userName || 'İstifadəçi', email: w.userEmail });
                }
            });

            // Then add remaining from users API
            users.forEach((u) => {
                const id = String(u.id || '').trim();
                if (id && !seenIds.has(id.toLowerCase())) {
                    seenIds.add(id.toLowerCase());
                    userList.push({ id: u.id, name: u.userName || u.email || 'İstifadəçi', email: u.email });
                }
            });

            // Compute unified workload items with accurately matched tasks
            const unified: EmployeeWorkloadDTO[] = userList.map((u) => {
                const serverItem = serverWorkloads.find((sw) => String(sw.userId).toLowerCase() === String(u.id).toLowerCase());
                const serverTasks = (serverItem?.tasks && Array.isArray(serverItem.tasks) && serverItem.tasks.length > 0)
                    ? serverItem.tasks
                    : [];

                const clientMatchedTasks = matchUserTasks(u.id, u.name, u.email, allTasks as TaskResponse[]);

                // Combine tasks removing duplicates
                const taskMap = new Map<string, TaskResponse>();
                serverTasks.forEach((t) => t?.id && taskMap.set(String(t.id), t));
                clientMatchedTasks.forEach((t) => t?.id && taskMap.set(String(t.id), t));
                const uTasks = Array.from(taskMap.values());

                const activeTasks = uTasks.filter((t) =>
                    t.status === TaskStatus.InProgress ||
                    t.status === TaskStatus.Assigned ||
                    t.status === TaskStatus.Pending ||
                    t.status === TaskStatus.UnderReview
                );
                const completedTasks = uTasks.filter((t) => t.status === TaskStatus.Completed);
                const hardTasks = activeTasks.filter((t) => Number(t.difficulty) === 2);
                const mediumTasks = activeTasks.filter((t) => Number(t.difficulty) === 1);
                const easyTasks = activeTasks.filter((t) => Number(t.difficulty) === 0);
                const hasUrgent = activeTasks.some((t) => t.priority === Priority.Urgent);
                const activeCount = activeTasks.length;
                const maxActive = 5;
                const workloadPercentage = Math.min(100, Math.round((activeCount / maxActive) * 100));
                const isOverloaded = activeCount >= 5;

                return {
                    userId: u.id,
                    userName: serverItem?.userName || u.name,
                    userEmail: serverItem?.userEmail || u.email,
                    avatarUrl: serverItem?.avatarUrl,
                    activeTaskCount: activeCount,
                    totalTaskCount: uTasks.length,
                    completedTaskCount: completedTasks.length,
                    hardTaskCount: hardTasks.length,
                    mediumTaskCount: mediumTasks.length,
                    easyTaskCount: easyTasks.length,
                    workloadPercentage,
                    isOverloaded,
                    hasUrgentTasks: hasUrgent,
                    tasks: uTasks,
                };
            });

            // Sort by active task count descending
            unified.sort((a, b) => b.activeTaskCount - a.activeTaskCount);
            setWorkloads(unified);
        } catch (err) {
            console.error('Workload fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredWorkloads = useMemo(() => {
        return workloads.filter((w) => {
            if (onlyOverloaded && !w.isOverloaded) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    w.userName.toLowerCase().includes(q) ||
                    (w.userEmail && w.userEmail.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [workloads, onlyOverloaded, searchQuery]);

    const totalEmployees = workloads.length;
    const overloadedCount = workloads.filter((w) => w.isOverloaded).length;
    const urgentCount = workloads.filter((w) => w.hasUrgentTasks).length;
    const avgWorkload = totalEmployees > 0
        ? Math.round(workloads.reduce((sum, w) => sum + w.workloadPercentage, 0) / totalEmployees)
        : 0;

    const getWorkloadColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-rose-500 text-rose-400';
        if (percentage >= 60) return 'bg-amber-500 text-amber-400';
        return 'bg-emerald-500 text-emerald-400';
    };

    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.Pending:
                return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">{t('statuses.pending', {}, 'Gözləmədə')}</span>;
            case TaskStatus.Assigned:
                return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">{t('statuses.assigned', {}, 'Təyin edilib')}</span>;
            case TaskStatus.InProgress:
                return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">{t('statuses.inProgress', {}, 'İcrada')}</span>;
            case TaskStatus.UnderReview:
                return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">{t('statuses.review', {}, 'Yoxlamada')}</span>;
            case TaskStatus.Completed:
                return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{t('statuses.completed', {}, 'Tamamlandı')}</span>;
            case TaskStatus.Expired:
                return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">{t('common.overdue', {}, 'Gecikib')}</span>;
            case TaskStatus.Canceled:
                return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">{t('statuses.cancelled', {}, 'Ləğv edilib')}</span>;
            default:
                return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">{status}</span>;
        }
    };

    const getPriorityBadge = (priority?: Priority) => {
        if (priority === Priority.Urgent) {
            return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">{t('priorities.urgent', {}, 'Təcili')}</span>;
        }
        if (priority === Priority.High) {
            return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">{t('priorities.high', {}, 'Yüksək')}</span>;
        }
        if (priority === Priority.Normal || (priority as unknown as number) === 1) {
            return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400/90 border border-amber-500/20">{t('priorities.medium', {}, 'Orta')}</span>;
        }
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">{t('priorities.low', {}, 'Aşağı')}</span>;
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#121214] font-sans antialiased text-zinc-900 dark:text-[#F4F4F5]">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <Header
                    userRole={userRole}
                    userName={displayName}
                    userAvatar={avatarSrc}
                    notifications={notifications}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8 md:pb-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                                <BoltIcon className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                                {t('workload.title', {}, 'İşçilərin İş Yükü və Tapşırıq Paylanması')}
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1">
                                {t('workload.subtitle', {}, 'Əməkdaşların aktiv iş yükünü izləyin, tapşırıq sayını və sıxlığını balanslaşdırın')}
                            </p>
                        </div>

                        <button
                            onClick={fetchWorkloadData}
                            disabled={refreshing}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
                            title={t('common.refresh', {}, 'Yenilə')}
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title={t('workload.totalAssignees', {}, 'Cəmi Əməkdaşlar')}
                            value={totalEmployees}
                            badgeText={t('workload.role', {}, 'İşçilər')}
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title={t('workload.loadPercentage', {}, 'Orta İş Yükü')}
                            value={`${avgWorkload}%`}
                            badgeText="%"
                            accentColor="#FBBF24"
                        />
                        <KpiCard
                            title={t('workload.overloaded', {}, 'Yüklənmiş Əməkdaşlar')}
                            value={overloadedCount}
                            badgeText="!"
                            subtitle={overloadedCount > 0 ? t('workload.heavyLoad', {}, 'Limit aşılıb') : t('workload.optimalLoad', {}, 'Normal vəziyyət')}
                            subtitleColor={overloadedCount > 0 ? 'red' : 'green'}
                            accentColor="#F87171"
                        />
                        <KpiCard
                            title={t('dashboard.urgentTasks', {}, 'Təcili İşi Olanlar')}
                            value={urgentCount}
                            badgeText={t('priorities.urgent', {}, 'Təcili')}
                            accentColor="#A78BFA"
                        />
                    </div>

                    {/* Search & Toggle Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] rounded-2xl p-3 shadow-xs">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('workload.searchPlaceholder', {}, 'Əməkdaşın adı və ya emaili üzrə axtar...')}
                                className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-amber-500 font-medium transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setOnlyOverloaded(!onlyOverloaded)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                                    onlyOverloaded
                                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-300'
                                        : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-[#27272A]/80 border-zinc-200 dark:border-[#3F3F46]/60 text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                <FireIcon className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                                <span>{t('workload.onlyOverloaded', {}, 'Yalnız Yüklənmişlər (≥5 tapşırıq)')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Workload Cards Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-zinc-500 dark:text-[#71717A] mt-3">{t('common.loading', {}, 'İş yükləri hesablanır...')}</span>
                        </div>
                    ) : filteredWorkloads.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-12 text-center shadow-xs">
                            <BoltIcon className="w-12 h-12 text-zinc-400 dark:text-[#71717A] mx-auto mb-3 opacity-40" />
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t('workload.noWorkloadFound', {}, 'Heç bir işçi tapılmadı')}</p>
                            <p className="text-xs text-zinc-500 dark:text-[#71717A] mt-1">
                                {searchQuery || onlyOverloaded ? t('common.noData', {}, 'Axtarış parametrlərinizə uyğun nəticə yoxdur') : t('workload.noWorkloadFound', {}, 'Sistemdə heç bir istifadəçi qeydiyyatdan keçməyib')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredWorkloads.map((w) => {
                                const isExpanded = expandedUserId === w.userId;

                                return (
                                    <div
                                        key={w.userId}
                                        className={`rounded-2xl border bg-white dark:bg-[#18181B] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                                            w.isOverloaded
                                                ? 'border-rose-500/40 hover:border-rose-500/60'
                                                : 'border-zinc-200/80 dark:border-[#27272A] hover:border-zinc-300 dark:hover:border-[#3F3F46]'
                                        }`}
                                    >
                                        <div>
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46]/50 flex items-center justify-center text-zinc-900 dark:text-white font-bold text-sm">
                                                        {w.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                            {w.userName}
                                                            {w.isOverloaded && (
                                                                <span className="p-0.5 rounded-md bg-rose-500/20 text-rose-500 dark:text-rose-400" title={t('workload.overloaded', {}, 'Həddindən artıq yüklənib')}>
                                                                    <ShieldExclamationIcon className="w-3.5 h-3.5" />
                                                                </span>
                                                            )}
                                                        </h3>
                                                        {w.userEmail && (
                                                            <p className="text-[11px] text-zinc-500 dark:text-[#71717A] truncate max-w-[170px]">
                                                                {w.userEmail}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`text-base font-extrabold ${w.isOverloaded ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'}`}>
                                                        {w.activeTaskCount}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 dark:text-[#71717A] block">{t('workload.activeTasks', {}, 'aktiv tapşırıq')}</span>
                                                </div>
                                            </div>

                                            {/* Workload Progress Bar */}
                                            <div className="space-y-1.5 mb-4">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-zinc-500 dark:text-[#A1A1AA]">{t('workload.loadPercentage', {}, 'Yüklənmə Faizi')}</span>
                                                    <span className={`font-bold ${w.isOverloaded ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-700 dark:text-zinc-200'}`}>
                                                        {w.workloadPercentage}%
                                                    </span>
                                                </div>
                                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-[#27272A]">
                                                    <div
                                                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                                                            w.isOverloaded
                                                                ? 'bg-rose-500'
                                                                : w.workloadPercentage >= 60
                                                                ? 'bg-amber-500'
                                                                : 'bg-emerald-500'
                                                        }`}
                                                        style={{ width: `${Math.min(100, w.workloadPercentage)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Difficulty Distribution Chips */}
                                            <div className="grid grid-cols-3 gap-1.5 mb-4 text-center">
                                                <div className="bg-zinc-50 dark:bg-[#27272A]/60 rounded-xl p-2 border border-zinc-200/70 dark:border-[#27272A]">
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">{t('difficulties.easy', {}, 'Asan')}</span>
                                                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{w.easyTaskCount}</span>
                                                </div>
                                                <div className="bg-zinc-50 dark:bg-[#27272A]/60 rounded-xl p-2 border border-zinc-200/70 dark:border-[#27272A]">
                                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">{t('difficulties.medium', {}, 'Orta')}</span>
                                                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{w.mediumTaskCount}</span>
                                                </div>
                                                <div className="bg-zinc-50 dark:bg-[#27272A]/60 rounded-xl p-2 border border-zinc-200/70 dark:border-[#27272A]">
                                                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block">{t('difficulties.hard', {}, 'Çətin')}</span>
                                                    <span className="text-xs font-bold text-zinc-900 dark:text-white">{w.hardTaskCount}</span>
                                                </div>
                                            </div>

                                            {/* Warning Alert if overloaded */}
                                            {w.isOverloaded && (
                                                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4">
                                                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                                    <span>{t('workload.heavyLoad', {}, 'Tövsiyə olunan 5 aktiv tapşırıq limitini keçib')}</span>
                                                </div>
                                            )}

                                            {/* Expanded Tasks List */}
                                            {isExpanded && (
                                                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-[#27272A] space-y-2 max-h-60 overflow-y-auto pr-1 animate-in fade-in duration-150">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-zinc-500 dark:text-[#71717A] uppercase tracking-wider">
                                                            {t('projects.tasksCount', {}, 'Tapşırıqlar')} ({(w.tasks || []).length})
                                                        </span>
                                                        <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-medium">
                                                            {w.activeTaskCount} {t('common.active', {}, 'aktiv')}
                                                        </span>
                                                    </div>
                                                    {(!w.tasks || w.tasks.length === 0) ? (
                                                        <p className="text-xs text-zinc-400 dark:text-[#71717A] py-2 text-center">{t('common.noData', {}, 'Bu əməkdaşa təyin olunmuş tapşırıq yoxdur')}</p>
                                                    ) : (
                                                        w.tasks.map((tItem) => (
                                                            <div
                                                                key={tItem.id}
                                                                onClick={() => navigate(`/tasks/${tItem.id}`)}
                                                                className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-[#27272A]/40 dark:hover:bg-[#27272A] border border-zinc-200/80 dark:border-[#27272A] hover:border-zinc-300 dark:hover:border-[#3F3F46] text-xs text-zinc-900 dark:text-white cursor-pointer transition-all flex flex-col gap-1.5 group"
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <span className="font-medium text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                                                                        {tItem.title}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                                        {getPriorityBadge(tItem.priority)}
                                                                        {getStatusBadge(tItem.status)}
                                                                    </div>
                                                                </div>

                                                                {(tItem.projectName || tItem.deadline) && (
                                                                    <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-[#71717A]">
                                                                        {tItem.projectName ? (
                                                                            <span className="truncate max-w-[150px] text-zinc-600 dark:text-[#A1A1AA]">
                                                                                📁 {tItem.projectName}
                                                                            </span>
                                                                        ) : <span />}
                                                                        {tItem.deadline && (
                                                                            <span>
                                                                                📅 {formatDateTime(tItem.deadline)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Toggle Expand button */}
                                        <button
                                            onClick={() => setExpandedUserId(isExpanded ? null : w.userId)}
                                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A]/60 dark:hover:bg-[#27272A] border border-zinc-200/80 dark:border-[#3F3F46]/40 text-xs text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white font-medium transition-all cursor-pointer"
                                        >
                                            <span>{isExpanded ? t('workload.hideTasks', {}, 'Tapşırıqları Gizlət') : t('workload.viewTasks', {}, 'Tapşırıqlara Bax')}</span>
                                            {isExpanded ? (
                                                <ChevronUpIcon className="w-3.5 h-3.5" />
                                            ) : (
                                                <ChevronDownIcon className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WorkloadView;
