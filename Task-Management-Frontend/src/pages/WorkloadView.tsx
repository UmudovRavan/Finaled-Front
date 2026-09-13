import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import { workloadService, userService, taskService, notificationService, authService } from '../api';
import type { EmployeeWorkloadDTO, NotificationResponse, TaskResponse, UserResponse } from '../dto';
import { TaskStatus, Priority } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
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

            // If server returned workloads, use them; otherwise compute from users & tasks
            if (serverWorkloads.length > 0) {
                // Enrich server workloads with task list if not present
                const enriched = (serverWorkloads as EmployeeWorkloadDTO[]).map((w: EmployeeWorkloadDTO) => {
                    const userTasks = (allTasks as TaskResponse[]).filter((t: TaskResponse) => t.assignedToUserId === w.userId);
                    return {
                        ...w,
                        tasks: w.tasks || userTasks,
                    };
                });
                setWorkloads(enriched);
            } else {
                // Compute workloads on the client
                const computed: EmployeeWorkloadDTO[] = (users as UserResponse[]).map((u: UserResponse) => {
                    const uTasks = (allTasks as TaskResponse[]).filter((t: TaskResponse) => t.assignedToUserId === u.id);
                    const activeTasks = uTasks.filter((t: TaskResponse) =>
                        t.status === TaskStatus.InProgress ||
                        t.status === TaskStatus.Assigned ||
                        t.status === TaskStatus.Pending ||
                        t.status === TaskStatus.UnderReview
                    );
                    const completedTasks = uTasks.filter((t: TaskResponse) => t.status === TaskStatus.Completed);
                    const hardTasks = activeTasks.filter((t: TaskResponse) => t.difficulty === 2);
                    const mediumTasks = activeTasks.filter((t: TaskResponse) => t.difficulty === 1);
                    const easyTasks = activeTasks.filter((t: TaskResponse) => t.difficulty === 0);
                    const hasUrgent = activeTasks.some((t: TaskResponse) => t.priority === Priority.Urgent);
                    const activeCount = activeTasks.length;
                    const maxActive = 5;
                    const workloadPercentage = Math.min(100, Math.round((activeCount / maxActive) * 100));
                    const isOverloaded = activeCount >= 5;

                    return {
                        userId: u.id,
                        userName: u.userName || u.email || 'İstifadəçi',
                        userEmail: u.email,
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

                // Sort by active tasks descending
                computed.sort((a, b) => b.activeTaskCount - a.activeTaskCount);
                setWorkloads(computed);
            }
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

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <Header
                    userRole={userRole}
                    userName={displayName}
                    userAvatar={avatarSrc}
                    notifications={notifications}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                <BoltIcon className="w-7 h-7 text-amber-400" />
                                İşçilərin İş Yükü və Tapşırıq Paylanması
                            </h1>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                                Əməkdaşların cari aktiv tapşırıq sayını, çətinlik səviyyəsini və yüklənmə dərəcəsini izləyin
                            </p>
                        </div>

                        <button
                            onClick={fetchWorkloadData}
                            disabled={refreshing}
                            className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title="Yenilə"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title="Ümumi Əməkdaşlar"
                            value={totalEmployees}
                            badgeText="Heyət"
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title="Yüksək Yüklənmişlər"
                            value={overloadedCount}
                            badgeText="Diqqət"
                            subtitle={overloadedCount > 0 ? 'Maksimum limitdədir' : 'Normal'}
                            subtitleColor={overloadedCount > 0 ? 'red' : 'green'}
                            accentColor="#F87171"
                        />
                        <KpiCard
                            title="Orta Yüklənmə"
                            value={`${avgWorkload}%`}
                            badgeText="Kapasite"
                            showProgress={true}
                            progressValue={avgWorkload}
                            accentColor="#FBBF24"
                        />
                        <KpiCard
                            title="Təcili İşi Olanlar"
                            value={urgentCount}
                            badgeText="Təcili"
                            accentColor="#A78BFA"
                        />
                    </div>

                    {/* Search & Toggle Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#18181B] border border-[#27272A] rounded-2xl p-3">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Əməkdaşın adı və ya emaili üzrə axtar..."
                                className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-amber-500 font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setOnlyOverloaded(!onlyOverloaded)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                                    onlyOverloaded
                                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                        : 'bg-[#27272A]/80 border-[#3F3F46]/60 text-[#A1A1AA] hover:text-white'
                                }`}
                            >
                                <FireIcon className="w-4 h-4 text-rose-400" />
                                <span>Yalnız Yüklənmişlər (≥5 tapşırıq)</span>
                            </button>
                        </div>
                    </div>

                    {/* Workload Cards Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-[#71717A] mt-3">İş yükləri hesablanır...</span>
                        </div>
                    ) : filteredWorkloads.length === 0 ? (
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-12 text-center">
                            <BoltIcon className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
                            <p className="text-sm font-semibold text-white">Heç bir işçi tapılmadı</p>
                            <p className="text-xs text-[#71717A] mt-1">
                                {searchQuery || onlyOverloaded ? 'Axtarış parametrlərinizə uyğun nəticə yoxdur' : 'Sistemdə heç bir istifadəçi qeydiyyatdan keçməyib'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredWorkloads.map((w) => {
                                const isExpanded = expandedUserId === w.userId;
                                const activeTasks = (w.tasks || []).filter((t) =>
                                    t.status === TaskStatus.InProgress ||
                                    t.status === TaskStatus.Assigned ||
                                    t.status === TaskStatus.Pending ||
                                    t.status === TaskStatus.UnderReview
                                );

                                return (
                                    <div
                                        key={w.userId}
                                        className={`rounded-2xl border bg-[#18181B] p-5 shadow-xs transition-all flex flex-col justify-between ${
                                            w.isOverloaded
                                                ? 'border-rose-500/30 hover:border-rose-500/50'
                                                : 'border-[#27272A] hover:border-[#3F3F46]'
                                        }`}
                                    >
                                        <div>
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#27272A] border border-[#3F3F46]/50 flex items-center justify-center text-white font-bold text-sm">
                                                        {w.userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                            {w.userName}
                                                            {w.isOverloaded && (
                                                                <span className="p-0.5 rounded-md bg-rose-500/20 text-rose-400" title="Həddindən artıq yüklənib">
                                                                    <ShieldExclamationIcon className="w-3.5 h-3.5" />
                                                                </span>
                                                            )}
                                                        </h3>
                                                        {w.userEmail && (
                                                            <p className="text-[11px] text-[#71717A] truncate max-w-[170px]">
                                                                {w.userEmail}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`text-base font-extrabold ${w.isOverloaded ? 'text-rose-400' : 'text-white'}`}>
                                                        {w.activeTaskCount}
                                                    </span>
                                                    <span className="text-[10px] text-[#71717A] block">aktiv tapşırıq</span>
                                                </div>
                                            </div>

                                            {/* Workload Progress Bar */}
                                            <div className="space-y-1.5 mb-4">
                                                <div className="flex items-center justify-between text-[11px]">
                                                    <span className="text-[#A1A1AA]">Yüklənmə Faizi</span>
                                                    <span className={`font-bold ${w.isOverloaded ? 'text-rose-400' : 'text-zinc-200'}`}>
                                                        {w.workloadPercentage}%
                                                    </span>
                                                </div>
                                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#27272A]">
                                                    <div
                                                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                                                            w.isOverloaded
                                                                ? 'bg-rose-500'
                                                                : w.workloadPercentage >= 60
                                                                ? 'bg-amber-400'
                                                                : 'bg-emerald-400'
                                                        }`}
                                                        style={{ width: `${Math.min(100, w.workloadPercentage)}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Difficulty Distribution Chips */}
                                            <div className="grid grid-cols-3 gap-1.5 mb-4 text-center">
                                                <div className="bg-[#27272A]/60 rounded-lg p-1.5 border border-[#27272A]">
                                                    <span className="text-[10px] text-emerald-400 font-semibold block">Asan</span>
                                                    <span className="text-xs font-bold text-white">{w.easyTaskCount}</span>
                                                </div>
                                                <div className="bg-[#27272A]/60 rounded-lg p-1.5 border border-[#27272A]">
                                                    <span className="text-[10px] text-amber-400 font-semibold block">Orta</span>
                                                    <span className="text-xs font-bold text-white">{w.mediumTaskCount}</span>
                                                </div>
                                                <div className="bg-[#27272A]/60 rounded-lg p-1.5 border border-[#27272A]">
                                                    <span className="text-[10px] text-rose-400 font-semibold block">Çətin</span>
                                                    <span className="text-xs font-bold text-white">{w.hardTaskCount}</span>
                                                </div>
                                            </div>

                                            {/* Warning Alert if overloaded */}
                                            {w.isOverloaded && (
                                                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400 flex items-center gap-2 mb-4">
                                                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                                    <span>Tövsiyə olunan 5 aktiv tapşırıq limitini keçib</span>
                                                </div>
                                            )}

                                            {/* Expanded Active Tasks List */}
                                            {isExpanded && (
                                                <div className="mt-3 pt-3 border-t border-[#27272A] space-y-2 max-h-48 overflow-y-auto pr-1 animate-in fade-in duration-150">
                                                    <span className="text-[10px] font-bold text-[#71717A] uppercase block mb-1">
                                                        Aktiv Tapşırıqlar ({activeTasks.length})
                                                    </span>
                                                    {activeTasks.length === 0 ? (
                                                        <p className="text-xs text-[#71717A]">Aktiv tapşırıq yoxdur</p>
                                                    ) : (
                                                        activeTasks.map((t) => (
                                                            <div
                                                                key={t.id}
                                                                onClick={() => navigate(`/tasks/${t.id}`)}
                                                                className="p-2 rounded-lg bg-[#27272A]/50 hover:bg-[#27272A] border border-[#27272A] text-xs text-white cursor-pointer transition-colors flex items-center justify-between gap-2"
                                                            >
                                                                <span className="truncate">{t.title}</span>
                                                                {t.priority === Priority.Urgent && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 flex-shrink-0">
                                                                        Təcili
                                                                    </span>
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
                                            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] border border-[#3F3F46]/40 text-xs text-[#A1A1AA] hover:text-white font-medium transition-all cursor-pointer"
                                        >
                                            <span>{isExpanded ? 'Tapşırıqları Gizlət' : 'Tapşırıqlara Bax'}</span>
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
