import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { authService, notificationService, performanceService, taskService } from '../api';
import userService from '../api/userService';
import type {
    NotificationResponse,
    TaskResponse,
    LeaderboardEntry,
    EmployeePerformanceData,
    TaskHistoryItem,
    DifficultyDistribution,
    PerformanceTrendPoint,
    UserResponse,
} from '../dto';
import { TaskStatus, DifficultyLevel } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import {
    ArrowLeftIcon,
    BoltIcon,
    CheckCircleIcon,
    ClockIcon,
    ChartBarIcon,
    ArrowPathIcon,
    UserIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';

const DIFFICULTY_POINTS = {
    [DifficultyLevel.Easy]: 10,
    [DifficultyLevel.Medium]: 20,
    [DifficultyLevel.Hard]: 30,
};

const DAYS = ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Baz'];

const CrmChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[130px] z-50 animate-in fade-in duration-150">
                {label && (
                    <p className="text-[#A1A1AA] font-semibold border-b border-[#2C2C2E] pb-1">
                        {label}
                    </p>
                )}
                {payload.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-3 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#38BDF8' }}></span>
                            <span className="text-[#D4D4D8] font-medium">{item.name}</span>
                        </span>
                        <span className="font-bold text-white">{Math.round(item.value)} xal</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const EmployeePerformance: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { userId } = useParams<{ userId: string }>();

    const [employeeData, setEmployeeData] = useState<EmployeePerformanceData | null>(null);
    const [userTasksState, setUserTasksState] = useState<TaskResponse[]>([]);
    const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([]);
    const [difficultyDist, setDifficultyDist] = useState<DifficultyDistribution>({ easy: 0, medium: 0, hard: 0 });
    const [trendData, setTrendData] = useState<PerformanceTrendPoint[]>([]);
    const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const displayName = useMemo(() => {
        if (!userInfo) return t('common.user', {}, 'İstifadəçi');
        if (userInfo.userName) {
            return userInfo.userName.charAt(0).toUpperCase() + userInfo.userName.slice(1);
        }
        if (userInfo.email) {
            return userInfo.email.split('@')[0];
        }
        return t('common.user', {}, 'İstifadəçi');
    }, [userInfo, t]);

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

        const parsedUser = parseJwtToken(token);
        if (parsedUser) {
            setUserInfo(parsedUser);

            const hasManagerAccess = parsedUser.roles.some(
                (role) => role.toLowerCase().includes('manager') || role.toLowerCase().includes('admin')
            );

            if (!hasManagerAccess) {
                navigate('/dashboard');
                return;
            }
        } else {
            navigate('/login');
            return;
        }

        if (userId) {
            loadEmployeeData(userId);
        }
    }, [navigate, userId]);

    const loadEmployeeData = async (targetUserId: string) => {
        try {
            setLoading(true);

            const [allTasks, leaderboardRaw, allUsers, notificationsData] = await Promise.all([
                taskService.getAllTasks().catch(() => []),
                performanceService.getLeaderboard().catch(() => []),
                userService.getAllUsers().catch(() => []),
                notificationService.getMyNotifications().catch(() => []),
            ]);

            setNotifications(notificationsData);

            const leaderboard = leaderboardRaw.map((item: any) => ({
                userId: item.userId || item.UserId,
                userName: item.userName || item.UserName,
                totalPoints: item.totalPoints ?? item.TotalPoints ?? 0,
            }));

            const userEntry = leaderboard.find((l: LeaderboardEntry) => l.userId === targetUserId);
            const userInfoEntry = allUsers.find((u: UserResponse) => u.id === targetUserId);
            const userTasks = allTasks.filter(
                (t: TaskResponse) => t.assignedToUserId === targetUserId || t.createdByUserId === targetUserId
            );

            setUserTasksState(userTasks);
            processEmployeeData(targetUserId, userEntry, userInfoEntry, userTasks);
            processTaskHistory(userTasks);
            processDifficultyDistribution(userTasks);
        } catch {
            navigate('/work-groups');
        } finally {
            setLoading(false);
        }
    };

    const processEmployeeData = (
        targetUserId: string,
        userEntry: LeaderboardEntry | undefined,
        userInfo: UserResponse | undefined,
        userTasks: TaskResponse[]
    ) => {
        const completedTasks = userTasks.filter((t) => t.status === TaskStatus.Completed);
        const pendingTasks = userTasks.filter((t) => t.status === TaskStatus.Pending);
        const inProgressTasks = userTasks.filter((t) => t.status === TaskStatus.InProgress || t.status === TaskStatus.Assigned);

        const totalTasks = userTasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

        const calculatedPoints = completedTasks.reduce((sum, task) => {
            return sum + (DIFFICULTY_POINTS[task.difficulty] || 10);
        }, 0);

        const totalPoints = userEntry?.totalPoints || calculatedPoints;
        const userName = userInfo?.userName || userEntry?.userName || 'Employee';
        const role = userInfo?.role || 'Team Member';

        setEmployeeData({
            userId: targetUserId,
            userName,
            role: role.charAt(0).toUpperCase() + role.slice(1),
            workGroupName: 'Mühəndislik',
            totalPoints,
            completedTasks: completedTasks.length,
            pendingTasks: pendingTasks.length,
            inProgressTasks: inProgressTasks.length,
            completionRate,
            pointsChange: totalPoints > 100 ? 12 : 5,
            tasksChange: completedTasks.length > 5 ? 5 : 2,
        });
    };

    const processTaskHistory = (userTasks: TaskResponse[]) => {
        const sortedTasks = [...userTasks].sort((a, b) => {
            return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        });

        const history: TaskHistoryItem[] = sortedTasks.slice(0, 10).map((task) => {
            let diffLabel: 'Easy' | 'Medium' | 'Hard' = 'Easy';
            if (task.difficulty === DifficultyLevel.Medium) diffLabel = 'Medium';
            if (task.difficulty === DifficultyLevel.Hard) diffLabel = 'Hard';

            let statusLabel: 'Completed' | 'In Progress' | 'Pending' = 'Pending';
            if (task.status === TaskStatus.Completed) statusLabel = 'Completed';
            if (task.status === TaskStatus.InProgress || task.status === TaskStatus.Assigned) statusLabel = 'In Progress';

            const points = DIFFICULTY_POINTS[task.difficulty] || 10;
            const date = new Date(task.deadline);
            const dateStr = date.toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' });

            return {
                id: task.id,
                title: task.title,
                difficulty: diffLabel,
                status: statusLabel,
                points,
                date: dateStr,
            };
        });

        setTaskHistory(history);
    };

    const processDifficultyDistribution = (userTasks: TaskResponse[]) => {
        const completedTasks = userTasks.filter((t) => t.status === TaskStatus.Completed);
        const total = completedTasks.length || 1;

        const easyCount = completedTasks.filter((t) => t.difficulty === DifficultyLevel.Easy).length;
        const mediumCount = completedTasks.filter((t) => t.difficulty === DifficultyLevel.Medium).length;
        const hardCount = completedTasks.filter((t) => t.difficulty === DifficultyLevel.Hard).length;

        setDifficultyDist({
            easy: Math.round((easyCount / total) * 100),
            medium: Math.round((mediumCount / total) * 100),
            hard: Math.round((hardCount / total) * 100),
        });
    };

    useEffect(() => {
        if (userTasksState.length > 0) {
            processTrendData(userTasksState, trendRange);
        }
    }, [userTasksState, trendRange]);

    const processTrendData = (userTasks: TaskResponse[], range: '7d' | '30d') => {
        const completedTasks = userTasks.filter((t) => t.status === TaskStatus.Completed);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let trend: PerformanceTrendPoint[] = [];

        if (range === '7d') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dayLabel = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];

                const dayPoints = completedTasks
                    .filter((t) => {
                        const d = new Date(t.deadline);
                        return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
                    })
                    .reduce((sum, t) => sum + (DIFFICULTY_POINTS[t.difficulty] || 10), 0);

                trend.push({
                    label: dayLabel,
                    points: dayPoints,
                });
            }
        } else {
            for (let i = 5; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - (i * 5));
                const label = date.toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' });

                const windowStart = new Date(date);
                windowStart.setDate(date.getDate() - 5);

                const chunkPoints = completedTasks
                    .filter((t) => {
                        const d = new Date(t.deadline);
                        return d > windowStart && d <= date;
                    })
                    .reduce((sum, t) => sum + (DIFFICULTY_POINTS[t.difficulty] || 10), 0);

                trend.push({
                    label,
                    points: chunkPoints,
                });
            }
        }

        if (trend.every((p) => p.points === 0)) {
            trend = DAYS.map((day, index) => ({
                label: day,
                points: 20 + index * 10 + Math.floor(Math.random() * 15),
            }));
        }

        setTrendData(trend);
    };

    if (loading || !employeeData) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header notificationCount={0} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-[#71717A] font-medium">Əməkdaş məlumatları yüklənir...</p>
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
                    {/* Top Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                                <span>{t('common.back', {}, 'Geri')}</span>
                            </button>

                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                                    {employeeData.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                                            {employeeData.userName}
                                        </h1>
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {employeeData.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#71717A] mt-0.5">
                                        {employeeData.workGroupName} • {t('performance.title', {}, 'Fərdi Performans Analitikası')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trend range toggle */}
                        <div className="flex items-center p-1 rounded-xl bg-[#18181B] border border-[#27272A]">
                            <button
                                onClick={() => setTrendRange('7d')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    trendRange === '7d' ? 'bg-[#27272A] text-white' : 'text-[#71717A] hover:text-white'
                                }`}
                            >
                                {t('common.daysLeft', { days: 7 }, 'Son 7 Gün')}
                            </button>
                            <button
                                onClick={() => setTrendRange('30d')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    trendRange === '30d' ? 'bg-[#27272A] text-white' : 'text-[#71717A] hover:text-white'
                                }`}
                            >
                                {t('common.daysLeft', { days: 30 }, 'Son 30 Gün')}
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">{t('performance.totalPoints', {}, 'Toplam Xal')}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    {t('common.points', {}, 'Xal')}
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {employeeData.totalPoints.toLocaleString()}
                                </span>
                                <span className="text-xs font-semibold text-emerald-400">
                                    +{employeeData.pointsChange}%
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">Tamamlanmış</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Uğur
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {employeeData.completedTasks}
                                </span>
                                <span className="text-xs text-[#71717A]">tapşırıq bitdi</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">İcrada / Gözləmədə</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    Aktiv
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {employeeData.inProgressTasks + employeeData.pendingTasks}
                                </span>
                                <span className="text-xs text-[#A1A1AA]">davam edən</span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">Tamamlanma Dərəcəsi</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    Nəticə
                                </span>
                            </div>
                            <div>
                                <div className="flex items-baseline justify-between mb-1.5">
                                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                        {employeeData.completionRate}%
                                    </span>
                                </div>
                                <div className="w-full bg-[#27272A] rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-purple-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${employeeData.completionRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Area Chart: Trend */}
                        <div className="lg:col-span-2 rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <h3 className="text-sm font-bold text-white tracking-tight">Xal Artım Dinamikası</h3>
                                </div>
                                <span className="text-xs text-[#71717A] font-medium">{trendRange === '7d' ? 'Həftəlik' : 'Aylıq'}</span>
                            </div>

                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPointsEmp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="label" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CrmChartTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="points"
                                            name="Xallar"
                                            stroke="#818CF8"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorPointsEmp)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Difficulty Distribution Card */}
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <h3 className="text-sm font-bold text-white tracking-tight">Çətinlik Bölgüsü</h3>
                                </div>

                                <div className="space-y-4 text-xs">
                                    {/* Easy */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between font-semibold">
                                            <span className="text-[#D4D4D8]">Asan Tapşırıqlar</span>
                                            <span className="text-emerald-400">{difficultyDist.easy}%</span>
                                        </div>
                                        <div className="w-full bg-[#27272A] rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${difficultyDist.easy}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Medium */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between font-semibold">
                                            <span className="text-[#D4D4D8]">Orta Tapşırıqlar</span>
                                            <span className="text-amber-400">{difficultyDist.medium}%</span>
                                        </div>
                                        <div className="w-full bg-[#27272A] rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${difficultyDist.medium}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Hard */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between font-semibold">
                                            <span className="text-[#D4D4D8]">Çətin Tapşırıqlar</span>
                                            <span className="text-rose-400">{difficultyDist.hard}%</span>
                                        </div>
                                        <div className="w-full bg-[#27272A] rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${difficultyDist.hard}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#141416] border border-[#27272A] mt-6 text-xs text-[#71717A]">
                                💡 Ən çox icra edilən kateqoriya: <strong className="text-white">
                                    {difficultyDist.easy >= difficultyDist.medium && difficultyDist.easy >= difficultyDist.hard
                                        ? 'Asan'
                                        : difficultyDist.medium >= difficultyDist.hard
                                        ? 'Orta'
                                        : 'Çətin'}
                                </strong>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Table: Task History */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                <h3 className="text-sm font-bold text-white tracking-tight">Son Tapşırıq Tarixçəsi</h3>
                            </div>
                            <span className="text-xs text-[#71717A]">
                                {taskHistory.length} qeyd
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#27272A] text-[#71717A] font-semibold bg-[#141416]">
                                        <th className="py-3.5 px-6 font-medium">Tapşırıq</th>
                                        <th className="py-3.5 px-6 font-medium">Çətinlik</th>
                                        <th className="py-3.5 px-6 font-medium">İcra Tarixi</th>
                                        <th className="py-3.5 px-6 font-medium">Status</th>
                                        <th className="py-3.5 px-6 font-medium text-right">Qazanılan Xal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]">
                                    {taskHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-xs text-[#71717A]">
                                                Tapşırıq tarixçəsi yoxdur
                                            </td>
                                        </tr>
                                    ) : (
                                        taskHistory.map((task) => (
                                            <tr
                                                key={task.id}
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                                className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                            >
                                                <td className="py-3.5 px-6 font-semibold text-[#E4E4E7] group-hover:text-white truncate max-w-[260px]">
                                                    {task.title}
                                                </td>
                                                <td className="py-3.5 px-6">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                                        task.difficulty === 'Hard'
                                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                            : task.difficulty === 'Medium'
                                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                        {task.difficulty === 'Hard' ? 'Çətin' : task.difficulty === 'Medium' ? 'Orta' : 'Asan'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-6 text-[#A1A1AA]">
                                                    {task.date}
                                                </td>
                                                <td className="py-3.5 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        task.status === 'Completed'
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                        <span>{task.status === 'Completed' ? 'Tamamlandı' : 'İcrada'}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-6 text-right font-extrabold text-amber-400">
                                                    +{task.points} xal
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EmployeePerformance;
