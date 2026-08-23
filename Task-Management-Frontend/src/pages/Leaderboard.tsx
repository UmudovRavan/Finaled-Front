import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { performanceService, notificationService, taskService, userService, authService } from '../api';
import type { LeaderboardEntry, NotificationResponse, TaskResponse } from '../dto';
import { TaskStatus, DifficultyLevel } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import {
    TrophyIcon,
    BoltIcon,
    ChevronDownIcon,
    CheckIcon,
    ArrowPathIcon,
    SparklesIcon,
    ArrowDownTrayIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

const UserAvatar: React.FC<{
    userId?: string;
    userName?: string;
    profilePictureUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    borderRing?: string;
    bgGradient?: string;
}> = ({ userId, userName = 'User', profilePictureUrl, size = 'md', borderRing, bgGradient }) => {
    const [imgError, setImgError] = useState(false);
    const initials = (userName.charAt(0) || 'U').toUpperCase();
    const url = getProfilePictureUrl(userId, profilePictureUrl);

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-20 h-20 text-2xl',
    }[size];

    if (url && !imgError && !url.includes('undefined')) {
        return (
            <img
                src={url}
                alt={userName}
                onError={() => setImgError(true)}
                className={`${sizeClasses} rounded-full object-cover shadow-lg ${borderRing || ''}`}
            />
        );
    }

    const gradient = bgGradient || 'from-blue-600 to-indigo-500';

    return (
        <div
            className={`${sizeClasses} rounded-full bg-gradient-to-tr ${gradient} text-white font-extrabold flex items-center justify-center shadow-lg ${borderRing || ''}`}
        >
            {initials}
        </div>
    );
};

const Leaderboard: React.FC = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [allTasks, setAllTasks] = useState<TaskResponse[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Filter State
    const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | 'thisMonth'>('all');
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

    // Filtered Leaderboard logic
    const filteredLeaderboard = useMemo(() => {
        if (dateFilter === 'all') return leaderboard;

        const filteredTasks = allTasks.filter((task) => {
            if (task.status !== TaskStatus.Completed) return false;

            const taskDate = new Date(task.deadline);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

        const userPointsMap = new Map<string, number>();
        const DIFFICULTY_POINTS = {
            [DifficultyLevel.Easy]: 10,
            [DifficultyLevel.Medium]: 20,
            [DifficultyLevel.Hard]: 30,
        };

        filteredTasks.forEach((task) => {
            const points = DIFFICULTY_POINTS[task.difficulty] || 10;
            const userId = task.assignedToUserId;
            if (userId) {
                userPointsMap.set(userId, (userPointsMap.get(userId) || 0) + points);
            }
        });

        const newLeaderboard = leaderboard.map((user) => ({
            ...user,
            totalPoints: userPointsMap.get(user.userId) || 0,
        })).sort((a, b) => b.totalPoints - a.totalPoints);

        return newLeaderboard;
    }, [leaderboard, allTasks, dateFilter]);

    // Top 3 Podium entries
    const topThree = useMemo(() => {
        return {
            first: filteredLeaderboard[0] || null,
            second: filteredLeaderboard[1] || null,
            third: filteredLeaderboard[2] || null,
        };
    }, [filteredLeaderboard]);

    // Remaining users (4+)
    const remainingUsers = useMemo(() => {
        return filteredLeaderboard.slice(3);
    }, [filteredLeaderboard]);

    const paginatedRemainingUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return remainingUsers.slice(start, start + pageSize);
    }, [remainingUsers, currentPage]);

    const totalPages = Math.ceil(remainingUsers.length / pageSize) || 1;

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

    const loadData = async () => {
        try {
            setLoading(true);
            const [leaderboardData, notificationsData, allTasksData, allUsersData] = await Promise.all([
                performanceService.getLeaderboard().catch(() => []),
                notificationService.getMyNotifications().catch(() => []),
                taskService.getAllTasks().catch(() => []),
                userService.getAllUsers().catch(() => []),
            ]);

            const mappedData: LeaderboardEntry[] = leaderboardData.map((item: any) => {
                const userId = item.userId || item.UserId;
                const userObj = allUsersData.find((u: any) => u.id === userId);
                return {
                    userId,
                    userName: item.userName || item.UserName,
                    profilePictureUrl: item.profilePictureUrl || item.ProfilePictureUrl || userObj?.profilePictureUrl,
                    totalPoints: item.totalPoints || item.TotalPoints || 0,
                };
            });

            const sortedData = mappedData.sort((a, b) => b.totalPoints - a.totalPoints);

            setLeaderboard(sortedData);
            setAllTasks(allTasksData);
            setNotifications(notificationsData);
        } catch {
            setLeaderboard([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    const getUserInitials = (userName: string): string => {
        if (!userName) return '?';
        const parts = userName.split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return userName.substring(0, 2).toUpperCase();
    };

    const getEfficiency = (points: number): number => {
        return Math.min(98, Math.max(75, 75 + Math.floor(points / 50)));
    };

    const getDepartmentBadge = (index: number) => {
        const departments = [
            { name: 'Texnologiya', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
            { name: 'Dizayn', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
            { name: 'Marketinq', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
            { name: 'Satış', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
            { name: 'Dəstək', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
        ];
        const dept = departments[index % departments.length];
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${dept.bg}`}>
                {dept.name}
            </span>
        );
    };

    const getDateFilterLabel = () => {
        switch (dateFilter) {
            case '7d':
                return 'Bu həftə';
            case '30d':
                return 'Bu ay (30 gün)';
            case 'thisMonth':
                return 'Bu ay (Təqvim)';
            default:
                return 'Bütün vaxtlar';
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
                            <p className="text-xs text-[#71717A] font-medium">Liderlər lövhəsi yüklənir...</p>
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

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto w-full">
                    {/* Top Action Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#27272A]">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    Liderlər Lövhəsi
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <SparklesIcon className="w-3 h-3" />
                                    <span>Həftəlik Sprint</span>
                                </span>
                            </div>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                                Həftəlik Sprint • {new Date().toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' })} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Top Filters */}
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
                                    <span>{getDateFilterLabel()}</span>
                                    <ChevronDownIcon className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showDateDropdown && (
                                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs animate-in fade-in duration-100">
                                        {[
                                            { id: '7d', label: 'Bu həftə' },
                                            { id: '30d', label: 'Bu ay (30 gün)' },
                                            { id: 'thisMonth', label: 'Bu ay (Təqvim)' },
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
                                <span>İxrac et</span>
                            </button>
                        </div>
                    </div>

                    {/* Centered Top 3 Podium (Kürsü) */}
                    {topThree.first ? (
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 pt-4 pb-2 max-w-4xl mx-auto w-full">
                            {/* 2nd Place (Silver) */}
                            {topThree.second && (
                                <div
                                    onClick={() => navigate(`/employee/${topThree.second?.userId}`)}
                                    className="w-full sm:w-72 rounded-2xl border-t-4 border-t-[#94a3b8] border border-[#27272A] bg-[#18181B] p-6 shadow-md hover:border-slate-400/50 hover:bg-[#1E1E22] transition-all cursor-pointer flex flex-col items-center text-center gap-3 relative group"
                                >
                                    <div className="relative mb-2">
                                        <UserAvatar
                                            userId={topThree.second.userId}
                                            userName={topThree.second.userName}
                                            profilePictureUrl={topThree.second.profilePictureUrl}
                                            size="xl"
                                            borderRing="border-4 border-[#94a3b8]"
                                            bgGradient="from-[#64748b] to-[#94a3b8]"
                                        />
                                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#94a3b8] text-black text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                            2nd
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {topThree.second.userName}
                                        </h3>
                                        <p className="text-xs text-[#71717A]">Komanda Üzvü</p>
                                    </div>

                                    <div className="flex items-center gap-1 text-amber-400 font-extrabold text-xl pt-1">
                                        <BoltIcon className="w-5 h-5 stroke-[2.5]" />
                                        <span>{topThree.second.totalPoints.toLocaleString()}</span>
                                        <span className="text-xs text-[#71717A] font-medium">pts</span>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place (Gold / Center Podium Peak) */}
                            <div
                                onClick={() => navigate(`/employee/${topThree.first?.userId}`)}
                                className="w-full sm:w-80 rounded-2xl border-t-4 border-t-[#eab308] border border-[#27272A] bg-[#18181B] p-8 shadow-2xl shadow-amber-500/10 hover:border-amber-500/60 hover:bg-[#1E1E22] transition-all cursor-pointer flex flex-col items-center text-center gap-3.5 relative group md:-translate-y-4 z-10"
                            >
                                <div className="relative mb-2">
                                    <UserAvatar
                                        userId={topThree.first.userId}
                                        userName={topThree.first.userName}
                                        profilePictureUrl={topThree.first.profilePictureUrl}
                                        size="xl"
                                        borderRing="border-4 border-[#eab308]"
                                        bgGradient="from-[#eab308] to-[#fbbf24]"
                                    />
                                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#eab308] text-black text-xs font-black px-3 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                                        <TrophyIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>1st</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors">
                                        {topThree.first.userName}
                                    </h3>
                                    <p className="text-xs text-[#71717A]">Komanda Lideri</p>
                                </div>

                                <div className="flex items-center gap-1 text-amber-400 font-black text-3xl pt-1">
                                    <BoltIcon className="w-6 h-6 stroke-[2.5]" />
                                    <span>{topThree.first.totalPoints.toLocaleString()}</span>
                                    <span className="text-xs text-[#71717A] font-medium">pts</span>
                                </div>
                            </div>

                            {/* 3rd Place (Bronze) */}
                            {topThree.third && (
                                <div
                                    onClick={() => navigate(`/employee/${topThree.third?.userId}`)}
                                    className="w-full sm:w-72 rounded-2xl border-t-4 border-t-[#b45309] border border-[#27272A] bg-[#18181B] p-6 shadow-md hover:border-orange-500/50 hover:bg-[#1E1E22] transition-all cursor-pointer flex flex-col items-center text-center gap-3 relative group"
                                >
                                    <div className="relative mb-2">
                                        <UserAvatar
                                            userId={topThree.third.userId}
                                            userName={topThree.third.userName}
                                            profilePictureUrl={topThree.third.profilePictureUrl}
                                            size="xl"
                                            borderRing="border-4 border-[#b45309]"
                                            bgGradient="from-[#b45309] to-[#d97706]"
                                        />
                                        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#b45309] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                                            3rd
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {topThree.third.userName}
                                        </h3>
                                        <p className="text-xs text-[#71717A]">Komanda Üzvü</p>
                                    </div>

                                    <div className="flex items-center gap-1 text-amber-400 font-extrabold text-xl pt-1">
                                        <BoltIcon className="w-5 h-5 stroke-[2.5]" />
                                        <span>{topThree.third.totalPoints.toLocaleString()}</span>
                                        <span className="text-[11px] text-[#71717A] font-medium">pts</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-xs text-[#71717A] rounded-2xl border border-[#27272A] bg-[#18181B]">
                            Liderlər lövhəsi məlumatı tapılmadı
                        </div>
                    )}

                    {/* Main Leaderboard Table */}
                    {remainingUsers.length > 0 && (
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-[#27272A] text-[#71717A] font-semibold bg-[#141416]">
                                            <th className="py-3.5 px-6 text-center w-20">Rütbə</th>
                                            <th className="py-3.5 px-6">İstifadəçi</th>
                                            <th className="py-3.5 px-6">Şöbə</th>
                                            <th className="py-3.5 px-6 text-right">Səmərəlilik</th>
                                            <th className="py-3.5 px-6 text-right">Ümumi Xallar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#27272A]">
                                        {paginatedRemainingUsers.map((user, index) => {
                                            const rank = (currentPage - 1) * pageSize + index + 4;
                                            const isCurrentUser = userInfo && user.userId === userInfo.userId;
                                            const efficiency = getEfficiency(user.totalPoints);

                                            return (
                                                <tr
                                                    key={user.userId}
                                                    onClick={() => navigate(`/employee/${user.userId}`)}
                                                    className={`hover:bg-white/[0.02] transition-colors cursor-pointer group ${
                                                        isCurrentUser ? 'bg-blue-500/5 border-l-4 border-l-blue-500' : ''
                                                    }`}
                                                >
                                                    <td className="py-4 px-6 text-center">
                                                        <div className="w-6 h-6 rounded-lg bg-[#27272A] flex items-center justify-center font-bold text-xs mx-auto text-white">
                                                            #{rank}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <UserAvatar
                                                                userId={user.userId}
                                                                userName={user.userName}
                                                                profilePictureUrl={user.profilePictureUrl}
                                                                size="sm"
                                                                borderRing={isCurrentUser ? 'ring-2 ring-blue-500' : ''}
                                                            />
                                                            <div>
                                                                <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                    {user.userName} {isCurrentUser && <span className="text-blue-400 font-semibold">(Siz)</span>}
                                                                </p>
                                                                <p className="text-[10px] text-[#71717A]">Komanda Üzvü</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {getDepartmentBadge(index)}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2.5">
                                                            <div className="w-20 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${
                                                                        efficiency >= 90 ? 'bg-emerald-500' : efficiency >= 80 ? 'bg-amber-400' : 'bg-blue-500'
                                                                    }`}
                                                                    style={{ width: `${efficiency}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-bold text-white">
                                                                {Math.round(efficiency)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <p className="text-xs font-extrabold text-amber-400">
                                                            {user.totalPoints.toLocaleString()} <span className="text-[10px] text-[#71717A] font-normal">xal</span>
                                                        </p>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {remainingUsers.length > pageSize && (
                                <div className="border-t border-[#27272A] px-6 py-3.5 flex items-center justify-between bg-[#141416] text-xs">
                                    <p className="text-[#71717A]">
                                        Göstərilir: <span className="font-bold text-white">{remainingUsers.length}</span> nəticədən{' '}
                                        <span className="font-bold text-white">{(currentPage - 1) * pageSize + 1}</span> -{' '}
                                        <span className="font-bold text-white">{Math.min(currentPage * pageSize, remainingUsers.length)}</span> arası
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 rounded-lg border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors"
                                        >
                                            <ChevronLeftIcon className="w-4 h-4" />
                                        </button>
                                        <span className="text-white font-medium px-2">
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 rounded-lg border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 disabled:opacity-40 transition-colors"
                                        >
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Leaderboard;
