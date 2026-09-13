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
            Tamamlanan: d.completedCount,
            Aktiv: d.activeCount,
            Cəmi: d.taskCount,
        }));
    }, [dashboardData]);

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
                                <ChartBarIcon className="w-7 h-7 text-sky-400" />
                                Şirkət Səviyyəli İdarəetmə Paneli
                            </h1>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                                Bütün şöbələr, layihələr və əməliyyatlar üzrə qlobal icmal və analitika
                            </p>
                        </div>

                        <button
                            onClick={fetchData}
                            disabled={refreshing}
                            className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            title="Yenilə"
                        >
                            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title="Ümumi Şöbələr"
                            value={dashboardData?.totalDivisions || 0}
                            badgeText="Struktur"
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title="Ümumi Layihələr"
                            value={dashboardData?.totalProjects || 0}
                            badgeText="Layihələr"
                            accentColor="#A78BFA"
                        />
                        <KpiCard
                            title="Cəmi Tapşırıqlar"
                            value={dashboardData?.totalTasks || 0}
                            badgeText="Tapşırıqlar"
                            accentColor="#34D399"
                        />
                        <KpiCard
                            title="Gecikmişlər"
                            value={dashboardData?.overdueTasks || 0}
                            badgeText="Diqqət"
                            subtitle={dashboardData?.overdueTasks ? 'Gecikmə var' : 'Gecikmə yoxdur'}
                            subtitleColor={dashboardData?.overdueTasks ? 'red' : 'green'}
                            accentColor="#F87171"
                        />
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs text-[#A1A1AA] font-semibold block">Tamamlanmış</span>
                                    <span className="text-xl font-extrabold text-white">{dashboardData?.completedTasks || 0}</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                {dashboardData?.completionRate || 0}% icra
                            </span>
                        </div>

                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                    <ClockIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs text-[#A1A1AA] font-semibold block">İcrada Olanlar</span>
                                    <span className="text-xl font-extrabold text-white">{dashboardData?.activeTasks || 0}</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                Cari proses
                            </span>
                        </div>

                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    <ArrowTrendingUpIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-xs text-[#A1A1AA] font-semibold block">Orta Məhsuldarlıq</span>
                                    <span className="text-xl font-extrabold text-white">{dashboardData?.completionRate || 0}%</span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                                Stabil
                            </span>
                        </div>
                    </div>

                    {/* Chart: Division Task Distribution */}
                    {chartData.length > 0 && (
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <ChartBarIcon className="w-4 h-4 text-sky-400" />
                                Şöbələr üzrə Tapşırıq Paylanması
                            </h2>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                                        <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} />
                                        <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#18181B',
                                                borderColor: '#27272A',
                                                borderRadius: '0.75rem',
                                                fontSize: '12px',
                                                color: '#fff',
                                            }}
                                        />
                                        <Bar dataKey="Tamamlanan" fill="#34D399" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Aktiv" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Divisions Breakdown Table */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <BuildingOfficeIcon className="w-4 h-4 text-sky-400" />
                                Şöbə Performansı və Statistikaları
                            </h2>
                            <button
                                onClick={() => navigate('/divisions')}
                                className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>Bütün Şöbələrə Bax</span>
                                <ChevronRightIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-[#71717A] mt-3">Statistikalar hesablanır...</span>
                            </div>
                        ) : !dashboardData?.divisionStats || dashboardData.divisionStats.length === 0 ? (
                            <div className="text-center py-10 text-xs text-[#71717A]">
                                Şöbə məlumatı tapılmadı
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-[#27272A] text-[#71717A] uppercase text-[10px] font-bold">
                                            <th className="pb-3 font-semibold">Şöbə</th>
                                            <th className="pb-3 font-semibold text-center">Layihələr</th>
                                            <th className="pb-3 font-semibold text-center">Tapşırıqlar</th>
                                            <th className="pb-3 font-semibold text-center">Aktiv</th>
                                            <th className="pb-3 font-semibold text-center">Tamamlanan</th>
                                            <th className="pb-3 font-semibold">İcra Faizi</th>
                                            <th className="pb-3 font-semibold text-right">Keçid</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]">
                                        {dashboardData.divisionStats.map((stat) => (
                                            <tr key={stat.divisionId} className="hover:bg-[#27272A]/30 transition-colors">
                                                <td className="py-3.5 pr-4 font-bold text-white">
                                                    {stat.divisionName}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-zinc-300">
                                                    {stat.projectCount}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-zinc-300">
                                                    {stat.taskCount}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-amber-400 font-semibold">
                                                    {stat.activeCount}
                                                </td>
                                                <td className="py-3.5 px-2 text-center text-emerald-400 font-semibold">
                                                    {stat.completedCount}
                                                </td>
                                                <td className="py-3.5 px-2 w-36">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-[10px]">
                                                            <span className="font-bold text-white">{stat.completionRate}%</span>
                                                        </div>
                                                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#27272A]">
                                                            <div
                                                                className="absolute left-0 top-0 h-full rounded-full bg-emerald-400 transition-all duration-500"
                                                                style={{ width: `${stat.completionRate}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 pl-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/projects?divisionId=${stat.divisionId}`)}
                                                        className="p-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                                        title="Layihələrə Bax"
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
