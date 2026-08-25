import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { authService, notificationService, userService } from '../api';
import { workGroupService } from '../api/workGroupService';
import type { WorkGroupResponse, WorkGroupStats, WorkGroupListItem, CreateWorkGroupRequest } from '../dto/WorkGroupResponse';
import type { NotificationResponse, UserResponse } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl, isUserAdmin, isUserManager, hasWorkGroupAccess } from '../utils';
import type { UserInfo } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import {
    UserGroupIcon,
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    XMarkIcon,
    SparklesIcon,
    CheckIcon,
    UserIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const SECTORS = [
    'Texnologiya Sektoru',
    'Yaradıcılıq Sektoru',
    'Marketinq Sektoru',
    'Satış Sektoru',
    'Dəstək Sektoru',
    'İnzibati Sektor',
    'Maliyyə Sektoru',
    'Əməliyyatlar Sektoru',
];

const WorkGroups: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [workGroups, setWorkGroups] = useState<WorkGroupListItem[]>([]);
    const [stats, setStats] = useState<WorkGroupStats>({
        totalWorkGroups: 0,
        totalWorkGroupsChange: 0,
        activeMembers: 0,
        activeMembersGrowth: 0,
        avgGroupPoints: 0,
        avgGroupPointsGrowth: 0,
        productivityRate: 0,
        productivityLabel: 'Aşağı',
    });
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for creating new work group
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    // Wizard states
    const [wizardStep, setWizardStep] = useState(1);
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedManagerId, setSelectedManagerId] = useState<string>('');
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
    const [managerSearch, setManagerSearch] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');

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

    const isAdmin = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return false;
        return isUserAdmin(userInfo.roles);
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

            const hasAccess = hasWorkGroupAccess(parsedUser.roles);
            if (!hasAccess) {
                navigate('/dashboard');
                return;
            }

            const userIsAdmin = isUserAdmin(parsedUser.roles);
            if (!userIsAdmin) {
                workGroupService.getAllWorkGroups().then(groups => {
                    const myGroup = groups.find(g => g.leaderId === parsedUser.userId);
                    if (myGroup) {
                        navigate(`/work-groups/${myGroup.id}`, { replace: true });
                    } else {
                        loadWorkGroupsData();
                    }
                }).catch(() => {
                    loadWorkGroupsData();
                });
                return;
            }
        } else {
            navigate('/login');
            return;
        }

        loadWorkGroupsData();
    }, [navigate]);

    const loadWorkGroupsData = async () => {
        try {
            setLoading(true);
            const [workGroupsData, notificationsData] = await Promise.all([
                workGroupService.getAllWorkGroups().catch(() => []),
                notificationService.getMyNotifications().catch(() => []),
            ]);

            setNotifications(notificationsData);

            const token = authService.getToken();
            const parsedUser = token ? parseJwtToken(token) : null;
            const isUserAdmin = parsedUser?.roles.some(r => r.toLowerCase() === 'admin') ?? false;

            const filtered = isUserAdmin
                ? workGroupsData
                : workGroupsData.filter(g => g.leaderId === parsedUser?.userId);

            processWorkGroups(filtered);
        } catch {
            setWorkGroups([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadWorkGroupsData();
    };

    const processWorkGroups = (data: WorkGroupResponse[]) => {
        const processedGroups: WorkGroupListItem[] = data.map((group, index) => {
            const memberCount = group.userIds?.length || (group as any).users?.length || (group as any).members?.length || 0;
            const taskCount = group.taskIds?.length || (group as any).tasks?.length || 0;

            let status: 'Active' | 'Inactive' | 'Review' = 'Inactive';
            if (memberCount > 0 && taskCount > 0) {
                status = 'Active';
            } else if (memberCount > 0 || taskCount > 0) {
                status = 'Review';
            }

            const baseTotalPoints = memberCount * 1200 + taskCount * 150;
            const variance = ((index % 5) - 2) * 100;
            const totalPoints = Math.max(0, baseTotalPoints + variance);

            const sectorIndex = index % SECTORS.length;

            return {
                id: group.id,
                name: group.name,
                sector: SECTORS[sectorIndex],
                status,
                memberCount,
                totalPoints,
            };
        });

        setWorkGroups(processedGroups);

        const totalWorkGroups = processedGroups.length;
        const activeMembers = processedGroups.reduce((acc, g) => acc + g.memberCount, 0);
        const totalPoints = processedGroups.reduce((acc, g) => acc + g.totalPoints, 0);
        const avgGroupPoints = totalWorkGroups > 0 ? Math.round(totalPoints / totalWorkGroups) : 0;
        const productivityRate = totalWorkGroups > 0 ? Math.min(100, Math.round((activeMembers / (totalWorkGroups * 10)) * 100)) : 0;

        let productivityLabel: 'Aşağı' | 'Orta' | 'Yüksək' = 'Aşağı';
        if (productivityRate >= 80) productivityLabel = 'Yüksək';
        else if (productivityRate >= 50) productivityLabel = 'Orta';

        setStats({
            totalWorkGroups,
            totalWorkGroupsChange: 2,
            activeMembers,
            activeMembersGrowth: 8,
            avgGroupPoints,
            avgGroupPointsGrowth: 15,
            productivityRate,
            productivityLabel,
        });
    };

    const filteredWorkGroups = useMemo(() => {
        if (!searchQuery.trim()) return workGroups;
        const q = searchQuery.toLowerCase();
        return workGroups.filter(
            (g) => g.name.toLowerCase().includes(q) || g.sector.toLowerCase().includes(q)
        );
    }, [workGroups, searchQuery]);

    // Open wizard modal
    const handleOpenCreateModal = async () => {
        setShowCreateModal(true);
        setWizardStep(1);
        setNewGroupName('');
        setSelectedManagerId('');
        setSelectedEmployeeIds([]);
        setCreateError('');

        try {
            setUsersLoading(true);
            const users = await userService.getAllUsers();
            setAllUsers(users);
        } catch {
            setAllUsers([]);
        } finally {
            setUsersLoading(false);
        }
    };

    // Filter users for step 2 (Manager) and step 3 (Employees)
    const availableManagers = useMemo(() => {
        if (!allUsers || allUsers.length === 0) return [];
        const cleanQuery = managerSearch.startsWith('@') ? managerSearch.substring(1).trim().toLowerCase() : managerSearch.trim().toLowerCase();

        let list = allUsers;
        if (cleanQuery) {
            list = list.filter(
                (u) =>
                    u.userName?.toLowerCase().includes(cleanQuery) ||
                    u.email?.toLowerCase().includes(cleanQuery) ||
                    u.role?.toLowerCase().includes(cleanQuery)
            );
        }
        return list;
    }, [allUsers, managerSearch]);

    const availableEmployees = useMemo(() => {
        if (!allUsers || allUsers.length === 0) return [];
        const cleanQuery = employeeSearch.startsWith('@') ? employeeSearch.substring(1).trim().toLowerCase() : employeeSearch.trim().toLowerCase();

        let list = allUsers.filter((u) => u.id !== selectedManagerId);
        if (cleanQuery) {
            list = list.filter(
                (u) =>
                    u.userName?.toLowerCase().includes(cleanQuery) ||
                    u.email?.toLowerCase().includes(cleanQuery) ||
                    u.role?.toLowerCase().includes(cleanQuery)
            );
        }
        return list;
    }, [allUsers, selectedManagerId, employeeSearch]);

    const handleSelectManager = (managerId: string) => {
        const nextId = managerId === selectedManagerId ? '' : managerId;
        setSelectedManagerId(nextId);
        if (nextId) {
            setSelectedEmployeeIds((prev) => prev.filter((id) => id !== nextId));
        }
    };

    const toggleEmployeeSelection = (userId: string) => {
        setSelectedEmployeeIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateWorkGroup = async () => {
        if (!newGroupName.trim()) {
            setCreateError('İş qrupunun adı mütləqdir');
            return;
        }

        if (!selectedManagerId) {
            setCreateError('Zəhmət olmasa iş qrupu üçün rəhbər (Manager) seçin');
            return;
        }

        try {
            setCreating(true);
            setCreateError('');

            const requestData: CreateWorkGroupRequest = {
                name: newGroupName.trim(),
                leaderId: selectedManagerId,
                userIds: selectedEmployeeIds.length > 0 ? selectedEmployeeIds : [],
            };

            await workGroupService.createWorkGroup(requestData);
            setShowCreateModal(false);
            await loadWorkGroupsData();
        } catch (err: any) {
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.title ||
                (typeof err.response?.data === 'string' ? err.response?.data : null) ||
                err.message ||
                'İş qrupu yaradılarkən xəta baş verdi';
            setCreateError(errorMsg);
        } finally {
            setCreating(false);
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
                            <p className="text-xs text-[#71717A] font-medium">İş qrupları yüklənir...</p>
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
                                {t('workgroups.title', {}, 'İş Qrupları')}
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15">
                                {workGroups.length}
                            </span>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                                title={t('common.refresh', {}, 'Yenilə')}
                                type="button"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={handleOpenCreateModal}
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer"
                                >
                                    <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                    <span>{t('workgroups.createGroup', {}, 'Yeni İş Qrupu')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* KPI Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">{t('workgroups.totalWorkGroups', {}, 'Ümumi İş Qrupları')}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-[#D4D4D8] border border-white/10">
                                    {t('statuses.inProgress', {}, 'Aktiv')}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {stats.totalWorkGroups}
                                </span>
                                <span className="text-xs font-semibold text-emerald-400">
                                    +{stats.totalWorkGroupsChange} {t('common.thisMonth', {}, 'bu ay')}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">{t('workgroups.activeMembers', {}, 'Aktiv Üzvlər')}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-[#D4D4D8] border border-white/10">
                                    {t('common.team', {}, 'Komanda')}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {stats.activeMembers}
                                </span>
                                <span className="text-xs font-semibold text-emerald-400">
                                    +{stats.activeMembersGrowth}%
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">{t('workgroups.avgGroupPoints', {}, 'Orta Qrup Xalı')}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-[#D4D4D8] border border-white/10">
                                    {t('common.points', {}, 'Xal')}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {stats.avgGroupPoints}
                                </span>
                                <span className="text-xs font-semibold text-amber-400">
                                    +{stats.avgGroupPointsGrowth}%
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                    <span className="text-xs font-semibold text-[#A1A1AA]">{t('workgroups.productivityRate', {}, 'Məhsuldarlıq Səviyyəsi')}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 text-[#D4D4D8] border border-white/10">
                                    {stats.productivityLabel}
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {stats.productivityRate}%
                                </span>
                                <div className="w-24 h-1.5 rounded-full bg-[#27272A] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-purple-500 transition-all duration-500"
                                        style={{ width: `${stats.productivityRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-3 shadow-xs flex items-center justify-between gap-3">
                        <div className="relative flex items-center min-w-[220px] flex-1 sm:flex-initial">
                            <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] absolute left-3 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('common.search', {}, 'İş qrupu axtar...')}
                                className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                            />
                        </div>
                        <span className="text-xs text-[#71717A] font-medium hidden sm:block">
                            {filteredWorkGroups.length} {t('common.count', {}, 'qrup göstərilir')}
                        </span>
                    </div>

                    {/* Work Groups Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredWorkGroups.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-xs text-[#71717A] rounded-2xl border border-[#27272A] bg-[#18181B]">
                                {t('common.noResults', {}, 'İş qrupu tapılmadı')}
                            </div>
                        ) : (
                            filteredWorkGroups.map((group) => (
                                <div
                                    key={group.id}
                                    onClick={() => navigate(`/work-groups/${group.id}`)}
                                    className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs hover:border-[#3F3F46] hover:bg-[#1E1E22] transition-all cursor-pointer group flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                                                    <UserGroupIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                                        {group.name}
                                                    </h3>
                                                    <p className="text-[11px] text-[#71717A]">{group.sector}</p>
                                                </div>
                                            </div>

                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {group.status === 'Active' ? 'Aktiv' : group.status === 'Review' ? 'Baxışda' : 'Qeyri-aktiv'}
                                            </span>
                                        </div>

                                        {/* Meta Counts */}
                                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#27272A] text-xs">
                                            <div className="p-2.5 rounded-xl bg-[#141416] border border-[#27272A]">
                                                <span className="text-[10px] text-[#71717A] block font-medium">Üzvlər</span>
                                                <span className="text-sm font-bold text-white">{group.memberCount} nəfər</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-[#141416] border border-[#27272A]">
                                                <span className="text-[10px] text-[#71717A] block font-medium">Toplam Xal</span>
                                                <span className="text-sm font-bold text-amber-400">{group.totalPoints} xal</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#27272A] text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                                        <span>Detallara və Reytinqə Bax</span>
                                        <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>

            {/* Create Work Group Multi-Step Wizard Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-lg bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C2E]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <h2 className="text-sm font-bold text-white tracking-tight">Yeni İş Qrupu Yarat</h2>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Step Indicators */}
                        <div className="flex items-center justify-between px-6 py-3 bg-[#18181B] border-b border-[#2C2C2E] text-xs">
                            <span className={`font-bold ${wizardStep === 1 ? 'text-blue-400' : 'text-[#71717A]'}`}>
                                1. Qrup Adı
                            </span>
                            <span className="text-[#3F3F46]">→</span>
                            <span className={`font-bold ${wizardStep === 2 ? 'text-blue-400' : 'text-[#71717A]'}`}>
                                2. Rəhbər Seçimi
                            </span>
                            <span className="text-[#3F3F46]">→</span>
                            <span className={`font-bold ${wizardStep === 3 ? 'text-blue-400' : 'text-[#71717A]'}`}>
                                3. Əməkdaşlar ({selectedEmployeeIds.length})
                            </span>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {createError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                                    {createError}
                                </div>
                            )}

                            {/* STEP 1: Name */}
                            {wizardStep === 1 && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-[#A1A1AA]">İş Qrupunun Adı *</label>
                                    <input
                                        type="text"
                                        value={newGroupName}
                                        onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="məs. Rəqəmsal İnkişaf Qrupu..."
                                        className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* STEP 2: Manager Selection */}
                            {wizardStep === 2 && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Qrup Rəhbərini (Manager) Seçin</label>
                                    <input
                                        type="text"
                                        value={managerSearch}
                                        onChange={(e) => setManagerSearch(e.target.value)}
                                        placeholder="@ istifadəçi və ya rəhbər axtar..."
                                        className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                        autoFocus
                                    />

                                    {usersLoading ? (
                                        <div className="p-6 text-center text-xs text-[#71717A] border border-[#27272A] rounded-xl bg-[#141416]">
                                            İstifadəçilər yüklənir...
                                        </div>
                                    ) : availableManagers.length === 0 ? (
                                        <div className="p-6 text-center text-xs text-[#71717A] border border-[#27272A] rounded-xl bg-[#141416]">
                                            İstifadəçi tapılmadı
                                        </div>
                                    ) : (
                                        <div className="max-h-56 overflow-y-auto divide-y divide-[#27272A] border border-[#27272A] rounded-xl bg-[#141416] custom-scrollbar">
                                            {availableManagers.map((u) => (
                                                <div
                                                    key={u.id}
                                                    onClick={() => handleSelectManager(u.id)}
                                                    className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                                        selectedManagerId === u.id ? 'bg-blue-500/20 text-white' : 'hover:bg-white/5 text-[#D4D4D8]'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                            {u.userName?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-white truncate">{u.userName}</span>
                                                                {u.role && (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 text-[#A1A1AA]">
                                                                        {u.role}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {u.email && <span className="text-[10px] text-[#71717A] truncate">{u.email}</span>}
                                                        </div>
                                                    </div>
                                                    {selectedManagerId === u.id && <CheckIcon className="w-4 h-4 text-blue-400 shrink-0" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: Employee Selection */}
                            {wizardStep === 3 && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-[#A1A1AA]">Qrupa Əməkdaşlar Əlavə Edin</label>
                                    <input
                                        type="text"
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                        placeholder="@ əməkdaş axtar..."
                                        className="w-full bg-[#27272A] border border-[#3F3F46] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                        autoFocus
                                    />

                                    {usersLoading ? (
                                        <div className="p-6 text-center text-xs text-[#71717A] border border-[#27272A] rounded-xl bg-[#141416]">
                                            İstifadəçilər yüklənir...
                                        </div>
                                    ) : availableEmployees.length === 0 ? (
                                        <div className="p-6 text-center text-xs text-[#71717A] border border-[#27272A] rounded-xl bg-[#141416]">
                                            Əməkdaş tapılmadı
                                        </div>
                                    ) : (
                                        <div className="max-h-56 overflow-y-auto divide-y divide-[#27272A] border border-[#27272A] rounded-xl bg-[#141416] custom-scrollbar">
                                            {availableEmployees.map((u) => {
                                                const isSelected = selectedEmployeeIds.includes(u.id);
                                                return (
                                                    <div
                                                        key={u.id}
                                                        onClick={() => toggleEmployeeSelection(u.id)}
                                                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                                            isSelected ? 'bg-blue-500/20 text-white' : 'hover:bg-white/5 text-[#D4D4D8]'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                                {u.userName?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-white truncate">{u.userName}</span>
                                                                    {u.role && (
                                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/10 text-[#A1A1AA]">
                                                                            {u.role}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {u.email && <span className="text-[10px] text-[#71717A] truncate">{u.email}</span>}
                                                            </div>
                                                        </div>
                                                        {isSelected && <CheckIcon className="w-4 h-4 text-blue-400 shrink-0" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2C2C2E] bg-[#18181B]">
                            {wizardStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setWizardStep(wizardStep - 1)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white"
                                >
                                    Geri
                                </button>
                            ) : (
                                <div></div>
                            )}

                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white"
                                >
                                    Ləğv et
                                </button>

                                {wizardStep < 3 ? (
                                    <button
                                        type="button"
                                        disabled={(wizardStep === 1 && !newGroupName.trim()) || (wizardStep === 2 && !selectedManagerId)}
                                        onClick={() => setWizardStep(wizardStep + 1)}
                                        className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs disabled:opacity-50"
                                    >
                                        Növbəti
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={creating || !newGroupName.trim() || !selectedManagerId}
                                        onClick={handleCreateWorkGroup}
                                        className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs disabled:opacity-50 shadow-lg"
                                    >
                                        {creating ? 'Yaradılır...' : 'Qrupu Tamamla'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkGroups;
