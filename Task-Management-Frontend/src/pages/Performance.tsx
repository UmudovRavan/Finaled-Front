import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { performanceService, taskService, notificationService, authService } from '../api';
import type { NotificationResponse, TaskResponse, LeaderboardEntry } from '../dto';
import { TaskStatus, DifficultyLevel } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import {
    SparklesIcon,
    ArrowPathIcon,
    CalendarIcon,
    ChevronDownIcon,
    CheckIcon,
    ArrowDownTrayIcon,
    TrophyIcon,
    CheckCircleIcon,
    ChartBarIcon,
    BoltIcon,
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';

// CRM translucent tooltip
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
                        <span className="font-bold text-white">{item.value} xal</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Performance: React.FC = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [allTasks, setAllTasks] = useState<TaskResponse[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Date Filter State
    const [dateFilter, setDateFilter] = useState<'7d' | '30d' | 'thisMonth' | 'all'>('30d');
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const dateDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
                setShowDateDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl);
    }, [userInfo]);

    // Calculate performance metrics from tasks
    const performanceMetrics = useMemo(() => {
        if (!userInfo || !allTasks.length) {
            return {
                totalPoints,
                completionRate: 0,
                tasksCompleted: 0,
                totalAssigned: 0,
                difficultyBreakdown: [
                    { difficulty: 'Easy' as const, difficultyLevel: 0, label: 'Asan', tasksCompleted: 0, pointsEarned: 0, color: '#34D399', pointsPerTask: 10 },
                    { difficulty: 'Medium' as const, difficultyLevel: 1, label: 'Orta', tasksCompleted: 0, pointsEarned: 0, color: '#FBBF24', pointsPerTask: 20 },
                    { difficulty: 'Hard' as const, difficultyLevel: 2, label: 'Çətin', tasksCompleted: 0, pointsEarned: 0, color: '#F87171', pointsPerTask: 30 },
                ],
                trend: { direction: 'up' as const, percentage: 12 },
            };
        }

        let userTasks = allTasks.filter(
            (task) => task.assignedToUserId === userInfo.userId || task.createdByUserId === userInfo.userId
        );

        if (dateFilter !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            userTasks = userTasks.filter((task) => {
                const taskDate = new Date(task.deadline);

                if (dateFilter === '7d') {
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(today.getDate() - 7);
                    return taskDate >= sevenDaysAgo;
                }
                if (dateFilter === '30d') {
                    const thirtyDaysAgo = new Date(today);
                    thirtyDaysAgo.setDate(today.getDate() - 30);
                    return taskDate >= thirtyDaysAgo;
                }
                if (dateFilter === 'thisMonth') {
                    return taskDate.getMonth() === today.getMonth() && taskDate.getFullYear() === today.getFullYear();
                }
                return true;
            });
        }

        const completedTasks = userTasks.filter((task) => task.status === TaskStatus.Completed);
        const completionRate = userTasks.length > 0
            ? Math.round((completedTasks.length / userTasks.length) * 100)
            : 0;

        const difficultyMap: Record<number, { difficulty: 'Easy' | 'Medium' | 'Hard'; label: string; pointsPerTask: number; color: string }> = {
            [DifficultyLevel.Easy]: { difficulty: 'Easy', label: 'Asan', pointsPerTask: 10, color: '#34D399' },
            [DifficultyLevel.Medium]: { difficulty: 'Medium', label: 'Orta', pointsPerTask: 20, color: '#FBBF24' },
            [DifficultyLevel.Hard]: { difficulty: 'Hard', label: 'Çətin', pointsPerTask: 30, color: '#F87171' },
        };

        const breakdown = [0, 1, 2].map((level) => {
            const tasksAtLevel = completedTasks.filter((task) => task.difficulty === level);
            const config = difficultyMap[level];
            return {
                difficulty: config.difficulty,
                difficultyLevel: level,
                label: config.label,
                tasksCompleted: tasksAtLevel.length,
                pointsEarned: tasksAtLevel.length * config.pointsPerTask,
                color: config.color,
                pointsPerTask: config.pointsPerTask,
            };
        });

        const last30DaysTask = completedTasks.filter((task) => {
            const taskDate = new Date(task.deadline);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return taskDate >= thirtyDaysAgo;
        });

        const trendPercentage = completedTasks.length > 0
            ? Math.round((last30DaysTask.length / completedTasks.length) * 100)
            : 0;

        return {
            totalPoints,
            completionRate,
            tasksCompleted: completedTasks.length,
            totalAssigned: userTasks.length,
            difficultyBreakdown: breakdown,
            trend: {
                direction: trendPercentage >= 50 ? ('up' as const) : ('stable' as const),
                percentage: trendPercentage || 12,
            },
        };
    }, [userInfo, allTasks, totalPoints, dateFilter]);

    // Chart trend data
    const chartTrendData = useMemo(() => {
        const days = ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Baz'];
        const completed = performanceMetrics.tasksCompleted || 5;
        const pts = totalPoints || 50;

        return days.map((day, idx) => ({
            name: day,
            Xallar: Math.round((pts / 7) * (idx + 1) * (0.8 + idx * 0.05)),
            Tamamlanan: Math.round((completed / 7) * (idx + 1)),
        }));
    }, [performanceMetrics, totalPoints]);

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
            loadData(parsedUser.userId);
        }
    }, [navigate]);

    const loadData = async (userId: string) => {
        try {
            setLoading(true);
            const [leaderboardRaw, tasksData, notificationsData] = await Promise.all([
                performanceService.getLeaderboard().catch(() => []),
                taskService.getAllTasks().catch(() => []),
                notificationService.getMyNotifications().catch(() => []),
            ]);

            const leaderboardData = leaderboardRaw.map((item: any) => ({
                userId: item.userId || item.UserId,
                userName: item.userName || item.UserName,
                totalPoints: item.totalPoints ?? item.TotalPoints ?? 0,
            }));

            const userEntry = leaderboardData.find((entry: LeaderboardEntry) => entry.userId === userId);
            const points = userEntry?.totalPoints || 0;

            setTotalPoints(points);
            setAllTasks(tasksData);
            setNotifications(notificationsData);
        } catch {
            // Silent catch
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        if (!userInfo?.userId) return;
        setRefreshing(true);
        await loadData(userInfo.userId);
    };

    const getDateFilterLabel = () => {
        switch (dateFilter) {
            case '7d':
                return 'Son 7 gün';
            case '30d':
                return 'Son 30 gün';
            case 'thisMonth':
                return 'Bu ay';
            default:
                return 'Bütün vaxtlar';
        }
    };

    const totalPointsFromBreakdown = performanceMetrics.difficultyBreakdown.reduce(
        (sum, item) => sum + item.pointsEarned,
        0
    );

    if (loading) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header notificationCount={0} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-[#71717A] font-medium">Performans məlumatları yüklənir...</p>
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
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#27272A]">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    Fərdi Performans
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <SparklesIcon className="w-3 h-3" />
                                    <span>Məhsuldarlıq</span>
                                </span>
                            </div>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                                Fərdi tapşırıq icrası və toplanmış xalların dinamikası.
                            </p>
                        </div>

                        {/* Top Filters & Actions */}
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

                            {/* Date Filter Dropdown */}
                            <div className="relative" ref={dateDropdownRef}>
                                <button
                                    onClick={() => setShowDateDropdown(!showDateDropdown)}
                                    type="button"
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                >
                                    <CalendarIcon className="w-4 h-4 text-[#A1A1AA]" />
                                    <span>{getDateFilterLabel()}</span>
                                    <ChevronDownIcon className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showDateDropdown && (
                                    <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs animate-in fade-in duration-100">
                                        {[
                                            { id: '7d', label: 'Son 7 gün' },
                                            { id: '30d', label: 'Son 30 gün' },
                                            { id: 'thisMonth', label: 'Bu ay' },
                                            { id: 'all', label: 'Bütün vaxtlar' },
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setDateFilter(item.id as any);
                                                    setShowDateDropdown(false);
                                                }}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                                                    dateFilter === item.id
                                                        ? 'bg-blue-500/20 text-blue-400 font-bold'
                                                        : 'text-[#D4D4D8] hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <span>{item.label}</span>
                                                {dateFilter === item.id && <CheckIcon className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Export button */}
                            <button
                                type="button"
                                onClick={() => alert('Hesabat ixrac edilir...')}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>Hesabatı ixrac et</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Stats Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Points Card */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">Ümumi Xallar</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Top Xal
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {totalPoints.toLocaleString()}
                                </span>
                                <span className="text-xs font-semibold text-emerald-400">
                                    +{performanceMetrics.trend.percentage}% artım
                                </span>
                            </div>
                        </div>

                        {/* Completion Rate Card */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">Tamamlanma Faizi</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Nəticə
                                </span>
                            </div>
                            <div>
                                <div className="flex items-baseline justify-between mb-2">
                                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                        {performanceMetrics.completionRate}%
                                    </span>
                                    <span className="text-xs text-[#71717A] font-medium">
                                        {performanceMetrics.tasksCompleted} / {performanceMetrics.totalAssigned} tapşırıq
                                    </span>
                                </div>
                                <div className="w-full bg-[#27272A] rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${performanceMetrics.completionRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Completed Tasks Count */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">İcra Edilən</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                    Status
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {performanceMetrics.tasksCompleted}
                                </span>
                                <span className="text-xs text-[#A1A1AA]">tamamlanmış</span>
                            </div>
                        </div>

                        {/* Efficiency Status */}
                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">Səmərəlilik</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    Yüksək
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {Math.min(98, Math.max(75, 75 + Math.floor(totalPoints / 50)))}%
                                </span>
                                <span className="text-xs text-purple-400 font-semibold">optimal</span>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Performance Trend Chart */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <h3 className="text-sm font-bold text-white tracking-tight">Performans Trendi</h3>
                            </div>
                            <span className="text-xs text-[#71717A] font-medium">Həftəlik dinamika</span>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CrmChartTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="Xallar"
                                        stroke="#38BDF8"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorPoints)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom Table: Difficulty Breakdown */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-[#27272A] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                <h3 className="text-sm font-bold text-white tracking-tight">Çətinliyə görə töhfə</h3>
                            </div>
                            <span className="text-xs text-[#71717A]">
                                Toplam: <strong className="text-white">{totalPointsFromBreakdown} xal</strong>
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[#27272A] text-[#71717A] font-semibold bg-[#141416]">
                                        <th className="py-3.5 px-6 font-medium">Tapşırıq Çətinliyi</th>
                                        <th className="py-3.5 px-6 font-medium text-center">Xal / Tapşırıq</th>
                                        <th className="py-3.5 px-6 font-medium text-center">Tamamlanmış Tapşırıqlar</th>
                                        <th className="py-3.5 px-6 font-medium text-right">Qazanılan Xallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]">
                                    {performanceMetrics.difficultyBreakdown.map((item, index) => (
                                        <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-3.5 px-6">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                    <span className="font-bold text-white">{item.label} Tapşırıqlar</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-6 text-center text-[#A1A1AA]">
                                                {item.pointsPerTask} xal
                                            </td>
                                            <td className="py-3.5 px-6 text-center font-semibold text-white">
                                                {item.tasksCompleted}
                                            </td>
                                            <td className="py-3.5 px-6 text-right font-extrabold text-amber-400">
                                                {item.pointsEarned} xal
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Total Summary Row */}
                                    <tr className="bg-[#141416] font-bold">
                                        <td className="py-3.5 px-6 text-white uppercase text-[11px] tracking-wider">
                                            Ümumi Töhfə
                                        </td>
                                        <td className="py-3.5 px-6 text-center text-[#71717A]">-</td>
                                        <td className="py-3.5 px-6 text-center text-white font-extrabold">
                                            {performanceMetrics.tasksCompleted}
                                        </td>
                                        <td className="py-3.5 px-6 text-right text-amber-400 font-extrabold">
                                            {totalPointsFromBreakdown} xal
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Performance;
