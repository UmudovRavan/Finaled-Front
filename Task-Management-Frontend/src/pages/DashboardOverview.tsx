import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { KpiCard, ActivityFeed } from '../components';
import { dashboardService, notificationService, authService } from '../api';
import type { DashboardOverviewResponse } from '../api/dashboardService';
import type { TaskResponse, NotificationResponse } from '../dto';
import { TaskStatus } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import {
    ArrowPathIcon,
    PlusIcon,
    ChevronDownIcon,
    CheckCircleIcon,
    CalendarIcon,
    ClockIcon,
    SparklesIcon,
    ShieldCheckIcon,
    UserGroupIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

// Translucent Tooltip matching CRM
const CrmChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[140px] z-50 animate-in fade-in duration-150">
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
                        <span className="font-bold text-white">{item.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardOverview: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [activePeriod, setActivePeriod] = useState<'30days' | '7days' | 'thisMonth'>('30days');
    const [isPeriodOpen, setIsPeriodOpen] = useState(false);
    const [activeSliceIndex, setActiveSliceIndex] = useState(0);

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
        if (!userInfo || !userInfo.roles?.length) return 'Employee';
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
        }

        loadDashboardData('30days');
    }, [navigate]);

    const loadDashboardData = async (period: '30days' | '7days' | 'thisMonth' = '30days') => {
        try {
            setLoading(true);
            const [overviewData, notificationsData] = await Promise.all([
                dashboardService.getDashboardOverview(period).catch(() => null),
                notificationService.getMyNotifications().catch(() => []),
            ]);

            setOverview(overviewData);
            setNotifications(notificationsData);
        } catch {
            // silent
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData(activePeriod);
    };

    const handlePeriodChange = async (period: '30days' | '7days' | 'thisMonth') => {
        setActivePeriod(period);
        setIsPeriodOpen(false);
        await loadDashboardData(period);
    };

    const getPeriodLabel = (period: '30days' | '7days' | 'thisMonth') => {
        if (period === '7days') return t('dashboard.last7Days', {}, 'Son 7 Gün');
        if (period === 'thisMonth') return t('dashboard.thisMonth', {}, 'Bu Ay');
        return t('dashboard.last30Days', {}, 'Son 30 Gün');
    };

    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour < 12) return t('common.goodMorning', {}, 'Sabahınız xeyir');
        if (hour < 18) return t('common.goodDay', {}, 'Hər vaxtınız xeyir');
        return t('common.goodEvening', {}, 'Axşamınız xeyir');
    };

    const dayLabels = useMemo(() => [
        t('common.mon', {}, 'B.e'),
        t('common.tue', {}, 'Ç.a'),
        t('common.wed', {}, 'Çər'),
        t('common.thu', {}, 'C.a'),
        t('common.fri', {}, 'Cüm'),
        t('common.sat', {}, 'Şən'),
        t('common.sun', {}, 'Baz'),
    ], [t]);

    // Chart Data for Task Trends
    const areaChartData = useMemo(() => {
        if (overview?.weeklyTrends && overview.weeklyTrends.length > 0) {
            return overview.weeklyTrends.map((item, idx) => ({
                ...item,
                name: dayLabels[idx] || item.name,
            }));
        }
        return dayLabels.map((name) => ({
            name,
            Tamamlanan: 0,
            DavamEdən: 0,
            Ümumi: 0,
        }));
    }, [overview, dayLabels]);

    // Donut Chart Data for Status Distribution
    const donutData = useMemo(() => {
        if (overview?.statusDistribution && overview.statusDistribution.length > 0) {
            const hasAny = overview.statusDistribution.some((d) => d.count > 0);
            if (hasAny) {
                return overview.statusDistribution.map((d) => ({
                    ...d,
                    name:
                        d.name === 'Tamamlandı'
                            ? t('statuses.completed', {}, 'Tamamlandı')
                            : d.name === 'İcrada'
                            ? t('statuses.inProgress', {}, 'İcrada')
                            : d.name === 'Gözləmədə'
                            ? t('statuses.pending', {}, 'Gözləmədə')
                            : d.name === 'Gecikmiş'
                            ? t('common.overdue', {}, 'Gecikmiş')
                            : d.name,
                }));
            }
        }
        return [
            { name: t('statuses.completed', {}, 'Tamamlandı'), value: 0, color: '#34D399', count: 0 },
            { name: t('statuses.inProgress', {}, 'İcrada'), value: 0, color: '#FBBF24', count: 0 },
            { name: t('statuses.pending', {}, 'Gözləmədə'), value: 0, color: '#38BDF8', count: 0 },
            { name: t('common.overdue', {}, 'Gecikmiş'), value: 0, color: '#F87171', count: 0 },
        ];
    }, [overview, t]);

    const activeDonutItem = donutData[activeSliceIndex] || donutData[0];

    const getPriorityBadge = (priority: number) => {
        if (priority === 3 || priority === 2) {
            return (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {t('difficulties.hard', {}, 'Yüksək')}
                </span>
            );
        }
        if (priority === 1) {
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

    const scopeNameLabel = useMemo(() => {
        if (overview?.roleScope === 'Admin') return t('dashboard.entireCompany', {}, 'Bütün Şirkət');
        if (overview?.roleScope === 'Manager') return t('dashboard.workGroup', {}, 'İş Qrupu');
        return t('dashboard.personal', {}, 'Şəxsi');
    }, [overview?.roleScope, t]);

    const getScopeIcon = (roleScope?: string) => {
        if (roleScope === 'Admin') return <ShieldCheckIcon className="w-3.5 h-3.5 text-fuchsia-400" />;
        if (roleScope === 'Manager') return <UserGroupIcon className="w-3.5 h-3.5 text-blue-400" />;
        return <UserIcon className="w-3.5 h-3.5 text-emerald-400" />;
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
                            <p className="text-xs text-[#71717A] font-medium">{t('common.loading', {}, 'Dashboard məlumatları yüklənir...')}</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const recentTasks = overview?.recentTasks || [];

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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#27272A]">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    {getGreeting()}, {displayName}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <SparklesIcon className="w-3 h-3" />
                                    <span>{userRole}</span>
                                </span>

                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                                    {getScopeIcon(overview?.roleScope)}
                                    <span>{scopeNameLabel}</span>
                                </span>
                            </div>
                            <p className="text-xs text-[#A1A1AA]">
                                {overview?.roleScope === 'Admin'
                                    ? t('dashboard.subtitle', {}, 'Bütün şirkət və qruplar üzrə qlobal tapşırıqlar və dinamika.')
                                    : overview?.roleScope === 'Manager'
                                    ? t('workgroups.subtitle', {}, 'İş qrupunuza aid olan tapşırıqlar və komanda performansı.')
                                    : t('tasks.myTasksSubtitle', {}, 'Yalnız sizə təyin olunmuş və sizin yaratdığınız şəxsi tapşırıqlar.')}
                            </p>
                        </div>

                        {/* Action Buttons: Period Filter & Create Task */}
                        <div className="flex items-center gap-2.5">
                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                                title={t('common.refresh', {}, 'Yenilə')}
                                type="button"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>

                            {/* Period Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsPeriodOpen(!isPeriodOpen)}
                                    type="button"
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                >
                                    <CalendarIcon className="w-4 h-4 text-[#A1A1AA]" />
                                    <span>{getPeriodLabel(activePeriod)}</span>
                                    <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                </button>

                                {isPeriodOpen && (
                                    <div className="absolute right-0 top-full mt-1.5 w-40 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs animate-in fade-in duration-100">
                                        {(
                                            [
                                                { code: '7days' as const, label: t('dashboard.last7Days', {}, 'Son 7 Gün') },
                                                { code: '30days' as const, label: t('dashboard.last30Days', {}, 'Son 30 Gün') },
                                                { code: 'thisMonth' as const, label: t('dashboard.thisMonth', {}, 'Bu Ay') },
                                            ] as const
                                        ).map((p) => (
                                            <button
                                                key={p.code}
                                                onClick={() => handlePeriodChange(p.code)}
                                                className={`px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                                    activePeriod === p.code ? 'bg-[#27272A] text-white font-bold' : 'text-[#A1A1AA] hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Add Task Button */}
                            <button
                                onClick={() => navigate('/tasks')}
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer"
                            >
                                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                <span>{t('tasks.newTask', {}, 'Yeni Tapşırıq')}</span>
                            </button>
                        </div>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard
                            title={t('dashboard.inProgressTasks', {}, 'Aktiv Tapşırıqlar')}
                            value={overview?.activeTasks ?? 0}
                            subtitle={t('common.inProgress', {}, 'cari iş axını')}
                            accentColor="#38BDF8"
                            badgeText={t('statuses.inProgress', {}, 'İcrada')}
                        />

                        <KpiCard
                            title={t('common.overdue', {}, 'Gecikmiş Tapşırıqlar')}
                            value={overview?.overdueTasks ?? 0}
                            subtitle={overview?.overdueNew ? `+${overview.overdueNew} ${t('common.new', {}, 'yeni')}` : undefined}
                            subtitleColor="red"
                            accentColor="#F87171"
                            badgeText={t('common.urgent', {}, 'Diqqət')}
                        />

                        <KpiCard
                            title={t('dashboard.productivityRate', {}, 'Tamamlanma Faizi')}
                            value={`${overview?.completedGrowth ?? 0}%`}
                            subtitle={`${overview?.completedTasks ?? 0} ${t('statuses.completed', {}, 'tapşırıq bitdi')}`}
                            subtitleColor="green"
                            trendIcon="↑"
                            accentColor="#34D399"
                            badgeText={t('common.success', {}, 'Uğur')}
                        />

                        <KpiCard
                            title={t('dashboard.workloadDistribution', {}, 'Komanda / Şəxsi İş Yükü')}
                            value={overview?.workloadPercentage ?? 0}
                            showProgress
                            progressValue={overview?.workloadPercentage ?? 0}
                            progressLabel={(overview?.workloadPercentage ?? 0) >= 75 ? t('common.high', {}, 'Yüksək tutum') : t('common.medium', {}, 'Normal tutum')}
                            accentColor="#818CF8"
                            badgeText={t('common.score', {}, 'Tutum')}
                        />
                    </div>

                    {/* Middle Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Area Chart: Task Volume & Progress */}
                        <div className="lg:col-span-2 rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <h3 className="text-sm font-bold text-white tracking-tight">{t('dashboard.taskDynamics', {}, 'Tapşırıq Dinamikası')}</h3>
                                </div>
                                <span className="text-xs text-[#71717A] font-medium">{t('dashboard.weeklyOverview', {}, 'Həftəlik baxış')}</span>
                            </div>

                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34D399" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                                            </linearGradient>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CrmChartTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="Tamamlanan"
                                            stroke="#34D399"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorCompleted)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Ümumi"
                                            stroke="#38BDF8"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Donut Chart: Status Distribution */}
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <h3 className="text-sm font-bold text-white tracking-tight">{t('dashboard.statusDistribution', {}, 'Status Bölgüsü')}</h3>
                                </div>
                                <span className="text-xs text-[#71717A] font-medium">{overview?.totalTasks ?? 0} {t('common.total', {}, 'Ümumi')}</span>
                            </div>

                            <div className="flex flex-col items-center justify-center relative my-auto">
                                <div className="relative w-44 h-44 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={72}
                                                paddingAngle={3}
                                                dataKey="value"
                                                onMouseEnter={(_, index) => setActiveSliceIndex(index)}
                                                cursor="pointer"
                                            >
                                                {donutData.map((entry, idx) => (
                                                    <Cell
                                                        key={`cell-${idx}`}
                                                        fill={entry.color}
                                                        stroke="#18181B"
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CrmChartTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Center Percentage */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                        <span className="text-2xl font-extrabold text-white tracking-tight leading-none">
                                            {activeDonutItem?.value ?? 0}%
                                        </span>
                                        <span className="text-[10px] text-[#A1A1AA] truncate max-w-[80px] mt-1 font-medium">
                                            {activeDonutItem?.name ?? t('common.details', {}, 'Məlumat')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Legend List */}
                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#27272A]">
                                {donutData.map((item, idx) => (
                                    <div
                                        key={item.name}
                                        onMouseEnter={() => setActiveSliceIndex(idx)}
                                        className={`flex items-center justify-between p-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                                            activeSliceIndex === idx ? 'bg-[#27272A]' : 'hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                                            <span className="text-[11px] text-[#D4D4D8] truncate">{item.name}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-white ml-1">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Recent Tasks Table & Activity Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tasks Overview Table */}
                        <div className="lg:col-span-2 rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                    <h3 className="text-sm font-bold text-white tracking-tight">
                                        {overview?.roleScope === 'Admin'
                                            ? t('dashboard.recentTasksGlobal', {}, 'Son Tapşırıqlar (Qlobal)')
                                            : overview?.roleScope === 'Manager'
                                            ? t('dashboard.recentTasksGroup', {}, 'Qrupun Son Tapşırıqları')
                                            : t('dashboard.recentTasksPersonal', {}, 'Şəxsi Son Tapşırıqlarım')}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => navigate('/tasks')}
                                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                    {t('dashboard.viewAllTasks', {}, 'Bütün tapşırıqlara bax')}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-[#27272A] text-[#71717A] font-semibold">
                                            <th className="pb-3 pl-1 font-medium">{t('common.title', {}, 'Tapşırıq')}</th>
                                            <th className="pb-3 font-medium">{t('common.priority', {}, 'Prioritet')}</th>
                                            <th className="pb-3 font-medium">{t('common.dueDate', {}, 'İcra Tarixi')}</th>
                                            <th className="pb-3 pr-1 text-right font-medium">{t('common.status', {}, 'Status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]">
                                        {recentTasks.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-xs text-[#71717A]">
                                                    {t('tasks.noTasksFound', {}, 'Tapşırıq tapılmadı')}
                                                </td>
                                            </tr>
                                        ) : (
                                            recentTasks.map((tItem: TaskResponse) => (
                                                <tr
                                                    key={tItem.id}
                                                    onClick={() => navigate(`/tasks/${tItem.id}`)}
                                                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                                >
                                                    <td className="py-3 pl-1 max-w-[220px]">
                                                        <div className="font-semibold text-[#E4E4E7] group-hover:text-white truncate">
                                                            {tItem.title}
                                                        </div>
                                                        {tItem.description && (
                                                            <div className="text-[11px] text-[#71717A] truncate">
                                                                {tItem.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3">
                                                        {getPriorityBadge(tItem.difficulty)}
                                                    </td>
                                                    <td className="py-3 text-[#A1A1AA]">
                                                        <div className="flex items-center gap-1">
                                                            <ClockIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                                            <span>{new Date(tItem.deadline).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'az-AZ')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 pr-1 text-right">
                                                        {tItem.status === TaskStatus.Completed ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                <CheckCircleIcon className="w-3 h-3" />
                                                                <span>{t('statuses.completed', {}, 'Tamamlandı')}</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                                                <span>{t('statuses.inProgress', {}, 'İcrada')}</span>
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Activity Feed */}
                        <ActivityFeed
                            notifications={notifications}
                            onViewAll={() => navigate('/notifications')}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardOverview;

