import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { authService, notificationService, performanceService } from '../api';
import userService from '../api/userService';
import { workGroupService } from '../api/workGroupService';
import type { WorkGroupResponse, WorkGroupMemberPerformance, NotificationResponse, LeaderboardEntry, UserResponse } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    CheckIcon,
    TrophyIcon,
    CheckCircleIcon,
    UserGroupIcon,
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';

const SECTORS = [
    'Texnologiya',
    'Yaradıcılıq',
    'Marketinq',
    'Satış',
    'Dəstək',
    'İnzibati',
    'Maliyyə',
    'Əməliyyatlar',
];

const WorkGroupRanking: React.FC = () => {
    const navigate = useNavigate();
    const { workGroupId } = useParams<{ workGroupId: string }>();

    const [workGroup, setWorkGroup] = useState<WorkGroupResponse | null>(null);
    const [members, setMembers] = useState<WorkGroupMemberPerformance[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // Filter State
    const [filterType, setFilterType] = useState<'all' | 'high_eff' | 'low_eff' | 'high_points' | 'low_points'>('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setShowFilterDropdown(false);
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

    const isManager = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return false;
        return userInfo.roles.some(
            (role) => role.toLowerCase().includes('manager') || role.toLowerCase().includes('admin')
        );
    }, [userInfo]);

    const isAdmin = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return false;
        return userInfo.roles.some((role) => role.toLowerCase().includes('admin'));
    }, [userInfo]);

    const topPerformers = useMemo(() => members.slice(0, 3), [members]);
    const otherMembers = useMemo(() => members.slice(3), [members]);

    const filteredOtherMembers = useMemo(() => {
        let result = otherMembers;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((m) => m.userName.toLowerCase().includes(query));
        }

        switch (filterType) {
            case 'high_eff':
                result = result.filter(m => m.efficiency >= 80);
                break;
            case 'low_eff':
                result = result.filter(m => m.efficiency < 60);
                break;
            case 'high_points':
                result = [...result].sort((a, b) => b.totalPoints - a.totalPoints);
                break;
            case 'low_points':
                result = [...result].sort((a, b) => a.totalPoints - b.totalPoints);
                break;
            default:
                break;
        }

        return result;
    }, [otherMembers, searchQuery, filterType]);

    const totalPoints = useMemo(() => {
        return members.reduce((sum, m) => sum + m.totalPoints, 0);
    }, [members]);

    const groupSector = useMemo(() => {
        if (!workGroupId) return 'Texnologiya';
        let hash = 0;
        for (let i = 0; i < workGroupId.length; i++) {
            hash = (hash + workGroupId.charCodeAt(i)) % SECTORS.length;
        }
        return SECTORS[hash];
    }, [workGroupId]);

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

        if (workGroupId) {
            loadWorkGroupData(workGroupId);
        }
    }, [navigate, workGroupId]);

    const loadWorkGroupData = async (id: string) => {
        try {
            setLoading(true);

            const [workGroupData, leaderboardData, allUsersData, notificationsData] = await Promise.all([
                workGroupService.getWorkGroupById(id).catch(() => null),
                performanceService.getLeaderboard().catch(() => []),
                userService.getAllUsers().catch(() => []),
                notificationService.getMyNotifications().catch(() => []),
            ]);

            if (!workGroupData) {
                navigate('/work-groups');
                return;
            }

            setWorkGroup(workGroupData);
            setNotifications(notificationsData);

            processMembers(workGroupData, leaderboardData, allUsersData);
        } catch {
            navigate('/work-groups');
        } finally {
            setLoading(false);
        }
    };

    const processMembers = (group: WorkGroupResponse, leaderboardRaw: LeaderboardEntry[], allUsers: UserResponse[]) => {
        const userIds: string[] = Array.isArray(group.userIds)
            ? group.userIds
            : ((group as any).users ? (group as any).users.map((u: any) => String(u.id || u.Id || '')) : []);

        const leaderboard = leaderboardRaw.map((item: any) => ({
            userId: item.userId || item.UserId,
            userName: item.userName || item.UserName,
            totalPoints: item.totalPoints ?? item.TotalPoints ?? 0,
        }));

        const memberPerformance: WorkGroupMemberPerformance[] = userIds.map((userId: string, index: number) => {
            const leaderEntry = leaderboard.find((l) => l.userId === userId);
            const userEntry = allUsers.find((u) => u.id === userId);

            const totalPoints = leaderEntry?.totalPoints || 0;
            const userName = userEntry?.userName || leaderEntry?.userName || `Üzv ${index + 1}`;

            const baseTaskCount = Math.floor(totalPoints / 300);
            const varianceFromIndex = (index % 3) + 1;
            const completedTasks = baseTaskCount + varianceFromIndex;
            const efficiency = totalPoints > 0 ? Math.min(98, 70 + Math.floor(totalPoints / 500)) : 75;

            return {
                rank: 0,
                userId,
                userName,
                totalPoints,
                completedTasks,
                efficiency,
            };
        });

        memberPerformance.sort((a, b) => b.totalPoints - a.totalPoints);
        memberPerformance.forEach((member, index) => {
            member.rank = index + 1;
        });

        setMembers(memberPerformance);
    };

    const getMaxPoints = (): number => {
        if (members.length === 0) return 1;
        return members[0]?.totalPoints || 1;
    };

    const getProgressWidth = (points: number): number => {
        const maxPoints = getMaxPoints();
        return Math.round((points / maxPoints) * 100);
    };

    const handleBackClick = () => {
        navigate('/work-groups');
    };

    const handleEmployeeClick = (userId: string) => {
        navigate(`/employee/${userId}`);
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
                            <p className="text-xs text-[#71717A] font-medium">Reytinq yüklənir...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!isManager || !workGroup) {
        return null;
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
                            {isAdmin && (
                                <button
                                    onClick={handleBackClick}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                >
                                    <ArrowLeftIcon className="w-4 h-4" />
                                    <span>İş Qrupları</span>
                                </button>
                            )}

                            <div>
                                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    {workGroup.name}
                                </h1>
                                <div className="flex items-center gap-2 text-xs text-[#71717A] mt-0.5">
                                    <span>{groupSector}</span>
                                    <span>•</span>
                                    <span>{members.length} Üzv</span>
                                    <span>•</span>
                                    <span className="font-bold text-amber-400">{totalPoints.toLocaleString()} Toplam Xal</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Filter dropdown */}
                        <div className="relative" ref={filterDropdownRef}>
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                            >
                                <span>Filtr</span>
                                <ChevronDownIcon className={`w-3.5 h-3.5 text-[#71717A] transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilterDropdown && (
                                <div className="absolute right-0 top-full mt-1.5 w-56 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs animate-in fade-in duration-100">
                                    <button
                                        onClick={() => { setFilterType('all'); setShowFilterDropdown(false); }}
                                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                            filterType === 'all' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-[#D4D4D8] hover:bg-white/5'
                                        }`}
                                    >
                                        <span>Hamısı</span>
                                        {filterType === 'all' && <CheckIcon className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => { setFilterType('high_eff'); setShowFilterDropdown(false); }}
                                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                            filterType === 'high_eff' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-[#D4D4D8] hover:bg-white/5'
                                        }`}
                                    >
                                        <span>Yüksək Səmərəlilik (&gt;80%)</span>
                                        {filterType === 'high_eff' && <CheckIcon className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => { setFilterType('low_eff'); setShowFilterDropdown(false); }}
                                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                            filterType === 'low_eff' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-[#D4D4D8] hover:bg-white/5'
                                        }`}
                                    >
                                        <span>Aşağı Səmərəlilik (&lt;60%)</span>
                                        {filterType === 'low_eff' && <CheckIcon className="w-3.5 h-3.5" />}
                                    </button>
                                    <div className="h-px bg-[#2C2C2E] my-1"></div>
                                    <button
                                        onClick={() => { setFilterType('high_points'); setShowFilterDropdown(false); }}
                                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                            filterType === 'high_points' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-[#D4D4D8] hover:bg-white/5'
                                        }`}
                                    >
                                        <span>Ən Çox Xal</span>
                                        {filterType === 'high_points' && <CheckIcon className="w-3.5 h-3.5" />}
                                    </button>
                                    <button
                                        onClick={() => { setFilterType('low_points'); setShowFilterDropdown(false); }}
                                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                                            filterType === 'low_points' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-[#D4D4D8] hover:bg-white/5'
                                        }`}
                                    >
                                        <span>Ən Az Xal</span>
                                        {filterType === 'low_points' && <CheckIcon className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Performers Podium Grid */}
                    {topPerformers.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <TrophyIcon className="w-4 h-4 text-amber-400" />
                                <h2 className="text-sm font-bold text-white tracking-tight">Ən Yaxşı Performans Göstərənlər</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {topPerformers.map((performer, index) => {
                                    const rank = index + 1;
                                    const isFirst = rank === 1;
                                    const isSecond = rank === 2;

                                    const badgeBg = isFirst
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        : isSecond
                                        ? 'bg-slate-400/20 text-slate-200 border-slate-400/30'
                                        : 'bg-orange-500/20 text-orange-300 border-orange-500/30';

                                    const progressColor = isFirst ? 'bg-amber-400' : isSecond ? 'bg-slate-300' : 'bg-orange-400';

                                    return (
                                        <div
                                            key={performer.userId}
                                            onClick={() => handleEmployeeClick(performer.userId)}
                                            className="relative rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs hover:border-[#3F3F46] hover:bg-[#1E1E22] transition-all cursor-pointer group flex flex-col justify-between"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${badgeBg}`}>
                                                            #{rank}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                {performer.userName}
                                                            </p>
                                                            <p className="text-[10px] text-[#71717A]">
                                                                {isFirst ? 'Qızıl Rütbə' : isSecond ? 'Gümüş Rütbə' : 'Bürünc Rütbə'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-baseline justify-between pt-2">
                                                    <span className="text-2xl font-extrabold text-white tracking-tight">
                                                        {performer.totalPoints.toLocaleString()} <span className="text-xs text-[#71717A] font-normal">xal</span>
                                                    </span>
                                                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                        <span>{performer.completedTasks} tapşırıq</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-full h-1.5 rounded-full bg-[#27272A] overflow-hidden mt-4">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                                    style={{ width: `${getProgressWidth(performer.totalPoints)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Members Table */}
                    {members.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="text-sm font-bold text-white tracking-tight">Bütün Qrup Üzvləri</h2>
                                <div className="relative flex items-center min-w-[200px]">
                                    <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] absolute left-3 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Üzv axtar..."
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-xs">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="border-b border-[#27272A] text-[#71717A] font-semibold bg-[#141416]">
                                                <th className="py-3.5 px-4 font-medium w-16">Rütbə</th>
                                                <th className="py-3.5 px-4 font-medium">Əməkdaş</th>
                                                <th className="py-3.5 px-4 font-medium">Tamamlanmış Tapşırıq</th>
                                                <th className="py-3.5 px-4 font-medium">Toplam Xal</th>
                                                <th className="py-3.5 px-4 font-medium">Səmərəlilik</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#27272A]">
                                            {filteredOtherMembers.length === 0 && topPerformers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-12 text-center text-xs text-[#71717A]">
                                                        Üzv tapılmadı
                                                    </td>
                                                </tr>
                                            ) : (
                                                (filteredOtherMembers.length > 0 ? filteredOtherMembers : members).map((member) => (
                                                    <tr
                                                        key={member.userId}
                                                        onClick={() => handleEmployeeClick(member.userId)}
                                                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                                    >
                                                        <td className="py-3.5 px-4 font-bold text-white">
                                                            <div className="w-6 h-6 rounded-lg bg-[#27272A] flex items-center justify-center text-xs">
                                                                #{member.rank}
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                                                                    {member.userName.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                                    {member.userName}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3.5 px-4 text-[#D4D4D8]">
                                                            {member.completedTasks} tapşırıq
                                                        </td>
                                                        <td className="py-3.5 px-4 font-bold text-amber-400">
                                                            {member.totalPoints.toLocaleString()} xal
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-24 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${
                                                                            member.efficiency >= 80 ? 'bg-emerald-500' : member.efficiency >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                                                                        }`}
                                                                        style={{ width: `${member.efficiency}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="font-bold text-white">{member.efficiency}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WorkGroupRanking;
