import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import { divisionService, projectService, taskService, notificationService, userService, authService } from '../api';
import type { DivisionDTO, CreateDivisionRequest, NotificationResponse, UserResponse, ProjectDTO, TaskResponse } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl, isUserAdmin, isUserManager } from '../utils';
import type { UserInfo } from '../utils';
import CustomSelect from '../components/CustomSelect';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    BuildingOfficeIcon,
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    XMarkIcon,
    UserIcon,
    FolderIcon,
    ClipboardDocumentListIcon,
    PencilSquareIcon,
    TrashIcon,
    EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

const Divisions: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { hasPermission } = useAuth();

    const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [editingDivision, setEditingDivision] = useState<DivisionDTO | null>(null);
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formManagerId, setFormManagerId] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Delete confirmation
    const [deletingId, setDeletingId] = useState<string | number | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | number | null>(null);

    // Users list for manager assignment
    const [users, setUsers] = useState<UserResponse[]>([]);

    const canCreate = hasPermission('tms.divisions.create') || isUserAdmin(userInfo?.roles) || isUserManager(userInfo?.roles);
    const canEdit = hasPermission('tms.divisions.update') || isUserAdmin(userInfo?.roles);
    const canDelete = hasPermission('tms.divisions.delete') || isUserAdmin(userInfo?.roles);

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
        fetchUsers();
    }, [navigate]);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [divsData, notifsData, allProjects, allTasks] = await Promise.all([
                divisionService.getAllDivisions().catch(() => [] as DivisionDTO[]),
                notificationService.getMyNotifications().catch(() => [] as NotificationResponse[]),
                projectService.getAllProjects().catch(() => [] as ProjectDTO[]),
                taskService.getAllTasks().catch(() => [] as TaskResponse[]),
            ]);

            // Enhance division data with computed project/task stats if missing
            const enhancedDivisions = (divsData as DivisionDTO[]).map((d: DivisionDTO) => {
                const divProjects = (allProjects as ProjectDTO[]).filter((p: ProjectDTO) => String(p.divisionId) === String(d.id));
                const divTasks = (allTasks as TaskResponse[]).filter((t: TaskResponse) => String(t.divisionId) === String(d.id));
                const completedTasks = divTasks.filter((t: TaskResponse) => t.status === 4);

                return {
                    ...d,
                    projectCount: d.projectCount && d.projectCount > 0 ? d.projectCount : divProjects.length,
                    taskCount: d.taskCount && d.taskCount > 0 ? d.taskCount : divTasks.length,
                    completedTaskCount: d.completedTaskCount && d.completedTaskCount > 0 ? d.completedTaskCount : completedTasks.length,
                };
            });

            setDivisions(enhancedDivisions);
            setNotifications(notifsData);
        } catch (err) {
            console.error('Divisions fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch {
            // ignore
        }
    };

    const filteredDivisions = useMemo(() => {
        if (!searchQuery.trim()) return divisions;
        const q = searchQuery.toLowerCase();
        return divisions.filter((d) =>
            d.name.toLowerCase().includes(q) ||
            (d.description && d.description.toLowerCase().includes(q)) ||
            (d.managerName && d.managerName.toLowerCase().includes(q))
        );
    }, [divisions, searchQuery]);

    const totalProjects = useMemo(() => divisions.reduce((sum, d) => sum + (d.projectCount || 0), 0), [divisions]);
    const totalTasks = useMemo(() => divisions.reduce((sum, d) => sum + (d.taskCount || 0), 0), [divisions]);
    const totalCompleted = useMemo(() => divisions.reduce((sum, d) => sum + (d.completedTaskCount || 0), 0), [divisions]);
    const activeTasks = Math.max(0, totalTasks - totalCompleted);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingDivision(null);
        setFormName('');
        setFormDesc('');
        setFormManagerId('');
        setErrorMsg('');
        setShowModal(true);
    };

    const openEditModal = (division: DivisionDTO) => {
        setModalMode('edit');
        setEditingDivision(division);
        setFormName(division.name);
        setFormDesc(division.description || '');
        setFormManagerId(division.managerId ? String(division.managerId) : '');
        setErrorMsg('');
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim()) {
            setErrorMsg('Şöbənin adı mütləq daxil edilməlidir');
            return;
        }

        try {
            setSaving(true);
            setErrorMsg('');

            if (modalMode === 'create') {
                const req: CreateDivisionRequest = {
                    name: formName.trim(),
                    description: formDesc.trim() || undefined,
                    managerId: formManagerId || null,
                };
                await divisionService.createDivision(req);
            } else if (editingDivision) {
                await divisionService.updateDivision({
                    id: editingDivision.id,
                    name: formName.trim(),
                    description: formDesc.trim() || undefined,
                    managerId: formManagerId || null,
                });
            }

            setShowModal(false);
            fetchData();
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || err.message || 'Xəta baş verdi');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string | number) => {
        if (!confirm('Bu şöbəni silmək istədiyinizə əminsiniz?')) return;
        try {
            setDeletingId(id);
            await divisionService.deleteDivision(id);
            setDivisions((prev) => prev.filter((d) => d.id !== id));
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Şöbəni silmək mümkün olmadı');
        } finally {
            setDeletingId(null);
        }
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
                                <BuildingOfficeIcon className="w-7 h-7 text-sky-500 dark:text-sky-400" />
                                {t('divisions.title', {}, 'Şöbələr')}
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1">
                                {t('divisions.subtitle', {}, 'Şirkətin struktur bölmələri və onlara aid layihələri idarə edin.')}
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                                onClick={fetchData}
                                disabled={refreshing}
                                className="p-2.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white shadow-xs transition-colors cursor-pointer"
                                title={t('common.refresh', {}, 'Yenilə')}
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-500' : ''}`} />
                            </button>

                            {canCreate && (
                                <button
                                    onClick={openCreateModal}
                                    type="button"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg border border-zinc-200/80 dark:border-transparent transition-colors cursor-pointer ml-auto sm:ml-0"
                                >
                                    <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                    <span>{t('divisions.newDivision', {}, 'Yeni Şöbə')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title={t('companyDashboard.totalDivisions', {}, 'Ümumi Şöbələr')}
                            value={divisions.length}
                            badgeText={t('divisions.title', {}, 'Struktur')}
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title={t('companyDashboard.totalProjects', {}, 'Ümumi Layihələr')}
                            value={totalProjects}
                            badgeText={t('projects.title', {}, 'Layihələr')}
                            accentColor="#A78BFA"
                        />
                        <KpiCard
                            title={t('companyDashboard.totalTasks', {}, 'Ümumi Tapşırıqlar')}
                            value={totalTasks}
                            badgeText={t('tasks.taskList', {}, 'Tapşırıqlar')}
                            accentColor="#34D399"
                        />
                        <KpiCard
                            title={t('companyDashboard.inProgressTasks', {}, 'İcrada Olanlar')}
                            value={activeTasks}
                            badgeText={t('common.active', {}, 'Aktiv')}
                            accentColor="#FBBF24"
                        />
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] rounded-2xl p-3 shadow-xs">
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('divisions.searchPlaceholder', {}, 'Şöbələrdə axtarış...')}
                                className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 font-medium transition-all"
                            />
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-[#71717A] font-medium hidden sm:block">
                            {t('common.total', {}, 'Cəmi')}: <span className="text-zinc-900 dark:text-white font-bold">{filteredDivisions.length}</span>
                        </div>
                    </div>

                    {/* Content / Division Cards Grid */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-zinc-500 dark:text-[#71717A] mt-3">{t('common.loading', {}, 'Şöbələr yüklənir...')}</span>
                        </div>
                    ) : filteredDivisions.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-12 text-center shadow-xs">
                            <BuildingOfficeIcon className="w-12 h-12 text-zinc-400 dark:text-[#71717A] mx-auto mb-3 opacity-40" />
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t('divisions.noDivisionsFound', {}, 'Heç bir şöbə tapılmadı')}</p>
                            <p className="text-xs text-zinc-500 dark:text-[#71717A] mt-1">
                                {searchQuery ? t('divisions.noDivisionsSubtitle', {}, 'Axtarış sorğunuza uyğun nəticə yoxdur') : t('divisions.noDivisionsSubtitle', {}, 'İlk şöbəni yaratmaq üçün "Yeni Şöbə" düyməsinə klikləyin')}
                            </p>
                            {canCreate && !searchQuery && (
                                <button
                                    onClick={openCreateModal}
                                    type="button"
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition-colors cursor-pointer"
                                >
                                    <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                    <span>{t('divisions.createDivision', {}, 'Şöbə Yarat')}</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {filteredDivisions.map((div) => {
                                const total = div.taskCount || 0;
                                const completed = div.completedTaskCount || 0;
                                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                                return (
                                    <div
                                        key={div.id}
                                        className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs hover:shadow-md hover:border-sky-500/40 dark:hover:border-[#3F3F46] transition-all flex flex-col justify-between group relative"
                                    >
                                        <div>
                                            {/* Card Top */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400 group-hover:scale-105 transition-transform">
                                                        <BuildingOfficeIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3
                                                            onClick={() => navigate(`/projects?divisionId=${div.id}`)}
                                                            className="text-sm font-bold text-zinc-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors"
                                                        >
                                                            {div.name}
                                                        </h3>
                                                        {div.managerName && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-[#A1A1AA] mt-0.5">
                                                                <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                                                                <span>{div.managerName}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action menu button */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionMenuId(actionMenuId === div.id ? null : div.id);
                                                        }}
                                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                                                    >
                                                        <EllipsisHorizontalIcon className="w-4 h-4" />
                                                    </button>

                                                    {actionMenuId === div.id && (
                                                        <div
                                                            className="absolute right-0 top-8 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-xl shadow-xl p-1 z-50 flex flex-col text-xs min-w-[140px] animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setActionMenuId(null);
                                                                    navigate(`/projects?divisionId=${div.id}`);
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#27272A] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                                            >
                                                                <FolderIcon className="w-3.5 h-3.5 text-sky-500" />
                                                                {t('projects.title', {}, 'Layihələr')}
                                                            </button>
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuId(null);
                                                                        openEditModal(div);
                                                                    }}
                                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#27272A] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                                                >
                                                                    <PencilSquareIcon className="w-3.5 h-3.5 text-amber-500" />
                                                                    {t('common.edit', {}, 'Düzəliş et')}
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => {
                                                                        setActionMenuId(null);
                                                                        handleDelete(div.id);
                                                                    }}
                                                                    disabled={deletingId === div.id}
                                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                                >
                                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                                    {t('common.delete', {}, 'Sil')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {div.description && (
                                                <p className="text-xs text-zinc-600 dark:text-[#A1A1AA] line-clamp-2 mb-4">
                                                    {div.description}
                                                </p>
                                            )}

                                            {/* Metrics row */}
                                            <div className="grid grid-cols-2 gap-2 mb-4">
                                                <div className="bg-zinc-50 dark:bg-[#27272A]/50 rounded-xl p-2.5 border border-zinc-200/60 dark:border-[#27272A]">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 dark:text-[#71717A] uppercase">
                                                        <FolderIcon className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                                                        {t('divisions.projectsCount', {}, 'Layihələr')}
                                                    </div>
                                                    <div className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5">
                                                        {div.projectCount || 0}
                                                    </div>
                                                </div>
                                                <div className="bg-zinc-50 dark:bg-[#27272A]/50 rounded-xl p-2.5 border border-zinc-200/60 dark:border-[#27272A]">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 dark:text-[#71717A] uppercase">
                                                        <ClipboardDocumentListIcon className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                                                        {t('divisions.tasksCount', {}, 'Tapşırıqlar')}
                                                    </div>
                                                    <div className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5">
                                                        {div.taskCount || 0}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-1.5 mb-4">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-zinc-500 dark:text-[#71717A] font-medium">{t('divisions.completionRate', {}, 'Tamamlanma')}</span>
                                                    <span className="font-bold text-zinc-900 dark:text-white">{progress}%</span>
                                                </div>
                                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-[#27272A]">
                                                    <div
                                                        className="absolute left-0 top-0 h-full rounded-full bg-sky-500 dark:bg-sky-400 transition-all duration-500"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer Action */}
                                        <button
                                            onClick={() => navigate(`/projects?divisionId=${div.id}`)}
                                            className="w-full mt-2 py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-[#27272A]/60 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:bg-[#27272A] text-zinc-700 dark:text-zinc-300 dark:hover:text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer border border-zinc-200/60 dark:border-[#27272A]"
                                        >
                                            <span>{t('divisions.viewProjects', {}, 'Layihələrə bax')}</span>
                                            <ChevronRightIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl w-full max-w-lg shadow-2xl overflow-visible animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-[#27272A] rounded-t-2xl">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 dark:text-sky-400">
                                    <BuildingOfficeIcon className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                    {modalMode === 'create' ? t('divisions.createDivision', {}, 'Yeni Şöbə Yarat') : t('divisions.editDivision', {}, 'Şöbəni Redaktə Et')}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSave} className="p-5 space-y-4">
                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('divisions.divisionName', {}, 'Şöbənin Adı')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder={t('divisions.divisionNamePlaceholder', {}, 'Məsələn: İnformasiya Texnologiyaları')}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 font-medium transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('divisions.description', {}, 'Təsvir')}
                                </label>
                                <textarea
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder={t('divisions.descriptionPlaceholder', {}, 'Şöbənin fəaliyyət istiqaməti haqqında qısa məlumat...')}
                                    rows={3}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-sky-500 font-medium resize-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('divisions.manager', {}, 'Şöbə Rəhbəri (Menecer)')}
                                </label>
                                <CustomSelect
                                    value={formManagerId}
                                    onChange={(val) => setFormManagerId(String(val))}
                                    options={[
                                        { value: '', label: t('divisions.noManager', {}, 'Rəhbər seçilməyib') },
                                        ...users.map((u) => ({ value: u.id, label: u.userName || u.email }))
                                    ]}
                                    placeholder={t('divisions.noManager', {}, 'Rəhbər seçilməyib')}
                                    size="md"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'Ləğv et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {modalMode === 'create' ? t('common.create', {}, 'Yarat') : t('common.save', {}, 'Yadda Saxla')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Divisions;
