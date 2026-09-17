import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import { dashboardService, notificationService, authService } from '../api';
import type { CompanyDashboardDTO, NotificationResponse } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    ChartBarIcon,
    BuildingOfficeIcon,
    FolderIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from 'recharts';

const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md border border-zinc-200/80 dark:border-[#27272A] p-3 rounded-xl shadow-xl text-xs space-y-1.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                <p className="font-bold text-zinc-900 dark:text-white pb-1 border-b border-zinc-100 dark:border-[#27272A] truncate">
                    {label}
                </p>
                {payload.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.fill || item.color }}
                            />
                            {item.name}:
                        </span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CompanyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { hasPermission } = useAuth();

    const [dashboardData, setDashboardData] = useState<CompanyDashboardDTO | null>(null);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

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
        fetchData();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [data, notifs] = await Promise.all([
                dashboardService.getCompanyDashboard(),
                notificationService.getMyNotifications().catch(() => []),
            ]);
            setDashboardData(data);
            setNotifications(notifs);
        } catch (err) {
            console.error('Company dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const chartData = useMemo(() => {
        if (!dashboardData?.divisionStats) return [];
        return dashboardData.divisionStats.map((d) => ({
            name: d.divisionName.length > 12 ? d.divisionName.substring(0, 12) + '...' : d.divisionName,
            fullName: d.divisionName,
            Tamamlanan: d.completedCount,
            Aktiv: d.activeCount,
            Cəmi: d.taskCount,
        }));
    }, [dashboardData]);

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
                                <ChartBarIcon className="w-7 h-7 text-sky-500 dark:text-sky-400" />
                                {t('companyDashboard.title', {}, 'Şirkət Səviyyəli İdarəetmə Paneli')}
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1">
                                {t('companyDashboard.subtitle', {}, 'Bütün şöbələr, layihələr və əməliyyatlar üzrə qlobal icmal və analitika')}
                            </p>
                        </div>

                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
                            title={t('common.refresh', {}, 'Yenilə')}
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-500' : ''}`} />
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title={t('companyDashboard.totalDivisions', {}, 'Ümumi Şöbələr')}
                            value={dashboardData?.totalDivisions || 0}
                            badgeText={t('divisions.title', {}, 'Struktur')}
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title={t('companyDashboard.totalProjects', {}, 'Ümumi Layihələr')}
                            value={dashboardData?.totalProjects || 0}
                            badgeText={t('projects.title', {}, 'Layihələr')}
                            accentColor="#A78BFA"
                        />
                        <KpiCard
                            title={t('companyDashboard.totalTasks', {}, 'Cəmi Tapşırıqlar')}
                            value={dashboardData?.totalTasks || 0}
                            badgeText={t('tasks.taskList', {}, 'Tapşırıqlar')}
                            accentColor="#34D399"
                        />
                        <KpiCard
                            title={t('companyDashboard.overdueTasks', {}, 'Gecikmişlər')}
                            value={dashboardData?.overdueTasks || 0}
                            badgeText={t('common.warning', {}, 'Diqqət')}
                            subtitle={dashboardData?.overdueTasks ? t('common.overdue', {}, 'Gecikmə var') : t('common.none', {}, 'Gecikmə yoxdur')}
                            subtitleColor={dashboardData?.overdueTasks ? 'red' : 'green'}
                            accentColor="#F87171"
                        />
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 dark:text-[#A1A1AA] font-semibold block">{t('companyDashboard.completedTasks', {}, 'Tamamlanmış')}</span>
                                    <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{dashboardData?.completedTasks || 0}</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                {dashboardData?.completionRate || 0}% {t('companyDashboard.progressRate', {}, 'icra')}
                            </span>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                                    <ClockIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 dark:text-[#A1A1AA] font-semibold block">{t('companyDashboard.inProgressTasks', {}, 'İcrada Olanlar')}</span>
                                    <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{dashboardData?.activeTasks || 0}</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                {t('statuses.inProgress', {}, 'Cari proses')}
                            </span>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                                    <ArrowTrendingUpIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 dark:text-[#A1A1AA] font-semibold block">{t('dashboard.performanceScore', {}, 'Orta Məhsuldarlıq')}</span>
                                    <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{dashboardData?.completionRate || 0}%</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                                {t('common.success', {}, 'Stabil')}
                            </span>
                        </div>
                    </div>

                    {/* Chart: Division Task Distribution */}
                    {chartData.length > 0 && (
                        <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                <ChartBarIcon className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                {t('companyDashboard.divisionsOverview', {}, 'Şöbələr üzrə Tapşırıq Paylanması')}
                            </h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-[#27272A]" vertical={false} />
                                        <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} />
                                        <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(125, 125, 125, 0.08)', radius: 6 }}
                                            content={<CustomChartTooltip />}
                                        />
                                        <Bar dataKey="Tamamlanan" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Aktiv" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Divisions Breakdown Table */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <BuildingOfficeIcon className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                {t('companyDashboard.divisionsOverview', {}, 'Şöbə Performansı və Statistikaları')}
                            </h2>
                            <button
                                onClick={() => navigate('/divisions')}
                                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>{t('divisions.viewProjects', {}, 'Bütün Şöbələrə Bax')}</span>
                                <ChevronRightIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-zinc-500 dark:text-[#71717A] mt-3">{t('companyDashboard.loading', {}, 'Statistikalar hesablanır...')}</span>
                            </div>
                        ) : !dashboardData?.divisionStats || dashboardData.divisionStats.length === 0 ? (
                            <div className="text-center py-10 text-xs text-zinc-500 dark:text-[#71717A]">
                                {t('divisions.noDivisionsFound', {}, 'Şöbə məlumatı tapılmadı')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-[#27272A] text-zinc-500 dark:text-[#71717A] uppercase text-[10px] font-bold">
                                            <th className="pb-3 font-semibold">{t('companyDashboard.divisionName', {}, 'Şöbə')}</th>
                                            <th className="pb-3 font-semibold text-center">{t('divisions.projectsCount', {}, 'Layihələr')}</th>
                                            <th className="pb-3 font-semibold text-center">{t('divisions.tasksCount', {}, 'Tapşırıqlar')}</th>
                                            <th className="pb-3 font-semibold text-center">{t('common.active', {}, 'Aktiv')}</th>
                                            <th className="pb-3 font-semibold text-center">{t('common.completed', {}, 'Tamamlanan')}</th>
                                            <th className="pb-3 font-semibold">{t('companyDashboard.progressRate', {}, 'İcra Faizi')}</th>
                                            <th className="pb-3 font-semibold text-right">{t('common.details', {}, 'Keçid')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-[#27272A]">
                                        {dashboardData.divisionStats.map((stat) => (
                                            <tr key={stat.divisionId} className="hover:bg-zinc-50/80 dark:hover:bg-[#27272A]/30 transition-colors">
                                                <td className="py-3.5 pr-4 font-bold text-zinc-900 dark:text-white">
                                                    {stat.divisionName}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-zinc-600 dark:text-zinc-300">
                                                    {stat.projectCount}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-zinc-600 dark:text-zinc-300">
                                                    {stat.taskCount}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-amber-600 dark:text-amber-400 font-semibold">
                                                    {stat.activeCount}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    {stat.completedCount}
                                                </td>
                                                <td className="py-3.5 px-2 w-36">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-[10px]">
                                                            <span className="font-bold text-zinc-900 dark:text-white">{stat.completionRate}%</span>
                                                        </div>
                                                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-[#27272A]">
                                                            <div
                                                                className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                                                                style={{ width: `${stat.completionRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 pl-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/projects?divisionId=${stat.divisionId}`)}
                                                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                                        title={t('divisions.viewProjects', {}, 'Layihələrə Bax')}
                                                    >
                                                        <ChevronRightIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CompanyDashboard;
