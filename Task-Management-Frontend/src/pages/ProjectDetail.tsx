import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import CreateTaskModal from '../components/CreateTaskModal';
import { projectService, projectLevelService, taskService, divisionService, notificationService, authService } from '../api';
import { normalizeProjectLevel } from '../api/projectLevelService';
import { normalizeTask } from '../api/taskService';
import type { ProjectDTO, ProjectLevelDTO, TaskResponse, NotificationResponse, DivisionDTO } from '../dto';
import { TaskStatus, Priority, DifficultyLevel } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl, isUserAdmin, isUserManager, formatDateTime } from '../utils';
import type { UserInfo } from '../utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
    FolderIcon,
    BuildingOfficeIcon,
    PlusIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    ChevronRightIcon,
    ListBulletIcon,
    Squares2X2Icon,
    QueueListIcon,
    CalendarIcon,
    UserIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    EllipsisHorizontalIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    ArrowLeftIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { hasPermission } = useAuth();

    const [project, setProject] = useState<ProjectDTO | null>(null);
    const [division, setDivision] = useState<DivisionDTO | null>(null);
    const [levels, setLevels] = useState<ProjectLevelDTO[]>([]);
    const [allTasks, setAllTasks] = useState<TaskResponse[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    // View Mode: 'Kanban' | 'List'
    const [viewMode, setViewMode] = useState<'Kanban' | 'List'>('Kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevelId, setSelectedLevelId] = useState<string>('all');

    // Create / Edit Level Modal
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [levelModalMode, setLevelModalMode] = useState<'create' | 'edit'>('create');
    const [editingLevel, setEditingLevel] = useState<ProjectLevelDTO | null>(null);
    const [levelName, setLevelName] = useState('');
    const [levelDesc, setLevelDesc] = useState('');
    const [levelOrder, setLevelOrder] = useState<number>(0);
    const [savingLevel, setSavingLevel] = useState(false);
    const [levelError, setLevelError] = useState('');

    // Task Creation Modal
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const [defaultLevelForTask, setDefaultLevelForTask] = useState<string | number | undefined>(undefined);

    // Action Menus
    const [openLevelMenuId, setOpenLevelMenuId] = useState<string | number | null>(null);
    const [openTaskMenuId, setOpenTaskMenuId] = useState<string | number | null>(null);

    const canCreateLevel = hasPermission('tms.levels.create') || isUserAdmin(userInfo?.roles) || isUserManager(userInfo?.roles);
    const canEditLevel = hasPermission('tms.levels.update') || isUserAdmin(userInfo?.roles);
    const canDeleteLevel = hasPermission('tms.levels.delete') || isUserAdmin(userInfo?.roles);
    const canCreateTask = hasPermission('tms.tasks.create') || isUserAdmin(userInfo?.roles) || isUserManager(userInfo?.roles);

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
        if (id) {
            fetchProjectData(id);
        }
    }, [id, navigate]);

    const fetchProjectData = async (projId: string) => {
        try {
            setRefreshing(true);
            const [proj, lvls, projTasksRes, allTasksRes, notifs] = await Promise.all([
                projectService.getProjectById(projId),
                projectLevelService.getLevelsByProject(projId).catch(() => [] as ProjectLevelDTO[]),
                taskService.getTasksByProject(projId).catch(() => [] as TaskResponse[]),
                taskService.getAllTasks().catch(() => [] as TaskResponse[]),
                notificationService.getMyNotifications().catch(() => [] as NotificationResponse[]),
            ]);

            setProject(proj);
            setNotifications(notifs);

            // 1. Mərhələləri təyin et
            const projectRaw = proj as any;
            const embeddedLevels: any[] = projectRaw?.levels || projectRaw?.projectLevels
                || projectRaw?.ProjectLevels || projectRaw?.Levels || [];

            let finalLevels: ProjectLevelDTO[] = [];
            if (lvls && lvls.length > 0) {
                finalLevels = lvls;
            } else if (embeddedLevels.length > 0) {
                finalLevels = embeddedLevels.map(normalizeProjectLevel).sort((a, b) => a.orderIndex - b.orderIndex);
            }
            setLevels(finalLevels);

            // 2. Bütün mənbələrdən layihə və mərhələ tapşırıqlarını aqreqasiya et
            const taskMap = new Map<string, TaskResponse>();
            const levelIdSet = new Set(finalLevels.map((l) => String(l.id)));

            // Mənbə A: Layihə obyektinin daxilindəki tapşırıqlar
            const embeddedProjTasks: any[] = projectRaw?.tasks || projectRaw?.Tasks || [];
            if (Array.isArray(embeddedProjTasks)) {
                embeddedProjTasks.forEach((rawT) => {
                    const t = normalizeTask(rawT);
                    if (t && t.id) {
                        if (!t.projectId) t.projectId = projId;
                        taskMap.set(String(t.id), t);
                    }
                });
            }

            // Mənbə B: Hər bir mərhələnin daxilindəki tapşırıqlar (lvl.tasks)
            finalLevels.forEach((lvl) => {
                if (lvl.tasks && Array.isArray(lvl.tasks)) {
                    lvl.tasks.forEach((rawT) => {
                        const t = normalizeTask(rawT);
                        if (t && t.id) {
                            if (!t.levelId) t.levelId = lvl.id;
                            if (!t.projectId) t.projectId = projId;
                            taskMap.set(String(t.id), t);
                        }
                    });
                }
            });

            // Mənbə C: Layihənin birbaşa tapşırıq sorğusundan (getTasksByProject)
            if (Array.isArray(projTasksRes)) {
                projTasksRes.forEach((t) => {
                    if (t && t.id) {
                        if (!t.projectId) t.projectId = projId;
                        taskMap.set(String(t.id), t);
                    }
                });
            }

            // Mənbə D: Ümumi tapşırıqlardan (getAllTasks) layihəyə və ya bu layihənin mərhələlərinə aid olanlar
            if (Array.isArray(allTasksRes)) {
                allTasksRes.forEach((t) => {
                    if (t && t.id) {
                        const matchesProject = String(t.projectId) === String(projId);
                        const matchesLevel = t.levelId && levelIdSet.has(String(t.levelId));
                        if (matchesProject || matchesLevel) {
                            if (!t.projectId) t.projectId = projId;
                            taskMap.set(String(t.id), t);
                        }
                    }
                });
            }

            setAllTasks(Array.from(taskMap.values()));

            if (proj.divisionId) {
                divisionService.getDivisionById(proj.divisionId)
                    .then(setDivision)
                    .catch(() => {});
            }
        } catch (err) {
            console.error('Fetch project detail error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCreateLevelClick = () => {
        setLevelModalMode('create');
        setEditingLevel(null);
        setLevelName('');
        setLevelDesc('');
        setLevelOrder(levels.length + 1);
        setLevelError('');
        setShowLevelModal(true);
    };

    const handleEditLevelClick = (lvl: ProjectLevelDTO) => {
        setLevelModalMode('edit');
        setEditingLevel(lvl);
        setLevelName(lvl.name);
        setLevelDesc(lvl.description || '');
        setLevelOrder(lvl.orderIndex);
        setLevelError('');
        setShowLevelModal(true);
    };

    const handleSaveLevel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!levelName.trim()) {
            setLevelError('Mərhələ adı mütləq daxil edilməlidir');
            return;
        }
        if (!id) return;

        try {
            setSavingLevel(true);
            setLevelError('');

            if (levelModalMode === 'create') {
                const newLevel = await projectLevelService.createLevel({
                    name: levelName.trim(),
                    description: levelDesc.trim() || undefined,
                    projectId: id,
                    orderIndex: levelOrder,
                });

                // Dərhal UI state-ə əlavə et (ekranda dərhal görünsün)
                setLevels((prev) => {
                    const exists = prev.some((l) => String(l.id) === String(newLevel.id));
                    if (exists) {
                        return prev.map((l) => String(l.id) === String(newLevel.id) ? newLevel : l);
                    }
                    return [...prev, newLevel].sort((a, b) => a.orderIndex - b.orderIndex);
                });
            } else if (editingLevel) {
                await projectLevelService.updateLevel({
                    id: editingLevel.id,
                    name: levelName.trim(),
                    description: levelDesc.trim() || undefined,
                    projectId: id,
                    orderIndex: levelOrder,
                });

                // Redaktə olunan mərhələni dərhal state-də yenilə
                setLevels((prev) =>
                    prev.map((l) =>
                        String(l.id) === String(editingLevel.id)
                            ? { ...l, name: levelName.trim(), description: levelDesc.trim() || undefined, orderIndex: levelOrder }
                            : l
                    ).sort((a, b) => a.orderIndex - b.orderIndex)
                );
            }

            setShowLevelModal(false);
            if (id) fetchProjectData(id);
        } catch (err: any) {
            setLevelError(err?.response?.data?.message || err.message || 'Xəta baş verdi');
        } finally {
            setSavingLevel(false);
        }
    };

    const handleDeleteLevel = async (lvlId: string | number) => {
        if (!confirm('Bu mərhələni silmək istədiyinizə əminsiniz?')) return;
        try {
            await projectLevelService.deleteLevel(lvlId);
            setLevels((prev) => prev.filter((l) => l.id !== lvlId));
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Mərhələni silmək mümkün olmadı');
        }
    };

    const handleDeleteTask = async (taskId: string | number) => {
        if (!confirm('Bu tapşırığı silmək istədiyinizə əminsiniz?')) return;
        try {
            await taskService.deleteTask(taskId);
            setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err: any) {
            alert('Tapşırığı silmək mümkün olmadı');
        }
    };

    const getPriorityBadge = (priority?: Priority | number) => {
        switch (priority) {
            case Priority.Urgent:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        Təcili
                    </span>
                );
            case Priority.High:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Yüksək
                    </span>
                );
            case Priority.Low:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        Aşağı
                    </span>
                );
            case Priority.Normal:
            default:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Normal
                    </span>
                );
        }
    };

    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.Completed:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Tamamlandı</span>;
            case TaskStatus.InProgress:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">İcrada</span>;
            case TaskStatus.UnderReview:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Yoxlanışda</span>;
            case TaskStatus.Assigned:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Təyin edildi</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Gözləmədə</span>;
        }
    };

    // Filter tasks based on search & level selector
    const filteredTasks = useMemo(() => {
        return allTasks.filter((t) => {
            if (selectedLevelId !== 'all' && String(t.levelId) !== selectedLevelId) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    t.title.toLowerCase().includes(q) ||
                    (t.description && t.description.toLowerCase().includes(q)) ||
                    (t.assignedToUserName && t.assignedToUserName.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [allTasks, selectedLevelId, searchQuery]);

    const totalTasksCount = allTasks.length;
    const completedTasksCount = allTasks.filter((t) => t.status === TaskStatus.Completed).length;
    const activeTasksCount = allTasks.filter((t) => t.status === TaskStatus.InProgress || t.status === TaskStatus.Assigned || t.status === TaskStatus.Pending).length;
    const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

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
                    {/* Back button & Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-[#71717A] flex-wrap">
                        <button
                            onClick={() => navigate('/projects')}
                            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                        >
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                            <span>Layihələr</span>
                        </button>
                        <span>/</span>
                        {division && (
                            <>
                                <Link
                                    to={`/projects?divisionId=${division.id}`}
                                    className="hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <BuildingOfficeIcon className="w-3 h-3 text-sky-400" />
                                    {division.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-white font-semibold flex items-center gap-1">
                            <FolderIcon className="w-3 h-3 text-purple-400" />
                            {project?.name || '...'}
                        </span>
                    </div>

                    {/* Project Header Banner */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-xs relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                        <FolderIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                            {project?.name}
                                        </h1>
                                        {division && (
                                            <p className="text-xs text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                                                <BuildingOfficeIcon className="w-3.5 h-3.5 text-sky-400" />
                                                Şöbə: <span className="text-white font-medium">{division.name}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {project?.description && (
                                    <p className="text-xs text-[#A1A1AA] leading-relaxed pt-1">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-[#71717A] pt-2 flex-wrap">
                                    {project?.managerName && (
                                        <div className="flex items-center gap-1.5">
                                            <UserIcon className="w-4 h-4 text-zinc-400" />
                                            <span>Rəhbər: <span className="text-white font-medium">{project.managerName}</span></span>
                                        </div>
                                    )}
                                    {(project?.startDate || project?.endDate) && (
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-4 h-4 text-zinc-400" />
                                            <span>
                                                {project.startDate ? new Date(project.startDate).toLocaleDateString('az-AZ') : '—'} - {project.endDate ? new Date(project.endDate).toLocaleDateString('az-AZ') : 'Müddətsiz'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions and Overall Progress */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 w-full lg:w-auto">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => id && fetchProjectData(id)}
                                        disabled={refreshing}
                                        className="p-2.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                                        title="Yenilə"
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
                                    </button>

                                    {canCreateLevel && (
                                        <button
                                            onClick={handleCreateLevelClick}
                                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] text-white font-semibold text-xs transition-colors cursor-pointer"
                                        >
                                            <QueueListIcon className="w-4 h-4 text-purple-400" />
                                            Yeni Mərhələ
                                        </button>
                                    )}

                                    {canCreateTask && (
                                        <button
                                            onClick={() => {
                                                setDefaultLevelForTask(levels[0]?.id);
                                                setIsCreateTaskOpen(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer"
                                        >
                                            <PlusIcon className="w-4 h-4 text-black stroke-[3]" />
                                            Tapşırıq Əlavə Et
                                        </button>
                                    )}
                                </div>

                                <div className="w-full sm:w-48 bg-[#27272A]/60 rounded-xl p-3 border border-[#27272A]">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-[#A1A1AA]">Ümumi İcra</span>
                                        <span className="font-bold text-white">{completionRate}%</span>
                                    </div>
                                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#18181B]">
                                        <div
                                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                                            style={{ width: `${completionRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KPI Metric Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title="Mərhələlər"
                            value={levels.length}
                            badgeText="Struktur"
                            accentColor="#A78BFA"
                        />
                        <KpiCard
                            title="Ümumi Tapşırıqlar"
                            value={totalTasksCount}
                            badgeText="Bütün"
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title="İcrada Olanlar"
                            value={activeTasksCount}
                            badgeText="Aktiv"
                            accentColor="#FBBF24"
                        />
                        <KpiCard
                            title="Tamamlanmış"
                            value={completedTasksCount}
                            badgeText="Nəticə"
                            accentColor="#34D399"
                        />
                    </div>

                    {/* Toolbar: Search, Level selector & Kanban/List View Switch */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#18181B] border border-[#27272A] rounded-2xl p-3">
                        <div className="flex items-center gap-3 flex-1 max-w-md">
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Bu layihədə tapşırıq axtar..."
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 font-medium"
                                />
                            </div>

                            <select
                                value={selectedLevelId}
                                onChange={(e) => setSelectedLevelId(e.target.value)}
                                className="bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
                            >
                                <option value="all">Bütün Mərhələlər</option>
                                {levels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id}>
                                        {lvl.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Mode Switcher */}
                        <div className="flex items-center gap-1 bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl p-1 self-end sm:self-auto">
                            <button
                                onClick={() => setViewMode('Kanban')}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                    viewMode === 'Kanban'
                                        ? 'bg-[#18181B] text-white shadow-xs'
                                        : 'text-[#A1A1AA] hover:text-white'
                                }`}
                            >
                                <Squares2X2Icon className="w-4 h-4" />
                                <span>Kanban</span>
                            </button>
                            <button
                                onClick={() => setViewMode('List')}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                    viewMode === 'List'
                                        ? 'bg-[#18181B] text-white shadow-xs'
                                        : 'text-[#A1A1AA] hover:text-white'
                                }`}
                            >
                                <ListBulletIcon className="w-4 h-4" />
                                <span>Siyahı</span>
                            </button>
                        </div>
                    </div>

                    {/* Content: Kanban vs List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-[#71717A] mt-3">Layihə məlumatları yüklənir...</span>
                        </div>
                    ) : levels.length === 0 ? (
                        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-12 text-center">
                            <QueueListIcon className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
                            <p className="text-sm font-semibold text-white">Bu layihədə hələ heç bir mərhələ yoxdur</p>
                            <p className="text-xs text-[#71717A] mt-1">
                                Tapşırıqları təşkil etmək üçün ilk mərhələni yaradın (məs: "Planlaşdırma", "Dizayn", "İcra", "Test")
                            </p>
                            {canCreateLevel && (
                                <button
                                    onClick={handleCreateLevelClick}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer"
                                >
                                    <PlusIcon className="w-4 h-4 text-black stroke-[3]" />
                                    İlk Mərhələni Əlavə Et
                                </button>
                            )}
                        </div>
                    ) : viewMode === 'Kanban' ? (
                        /* KANBAN VIEW (Levels as Columns) */
                        <div className="flex gap-4 overflow-x-auto pb-6 items-start">
                            {levels.map((lvl) => {
                                const lvlTasks = filteredTasks.filter((t) => String(t.levelId) === String(lvl.id));
                                const lvlCompleted = lvlTasks.filter((t) => t.status === TaskStatus.Completed).length;

                                return (
                                    <div
                                        key={lvl.id}
                                        className="w-80 flex-shrink-0 bg-[#18181B] border border-[#27272A] rounded-2xl p-4 flex flex-col max-h-[calc(100vh-320px)]"
                                    >
                                        {/* Column Header */}
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#27272A]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                                <h3 className="text-xs font-bold text-white truncate max-w-[170px]" title={lvl.name}>
                                                    {lvl.name}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#27272A] text-[#A1A1AA]">
                                                    {lvlTasks.length}
                                                </span>
                                            </div>

                                            {/* Column Menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenLevelMenuId(openLevelMenuId === lvl.id ? null : lvl.id)}
                                                    className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                                                >
                                                    <EllipsisHorizontalIcon className="w-4 h-4" />
                                                </button>

                                                {openLevelMenuId === lvl.id && (
                                                    <div className="absolute right-0 top-6 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl p-1 z-50 flex flex-col text-xs min-w-[130px]">
                                                        {canEditLevel && (
                                                            <button
                                                                onClick={() => {
                                                                    setOpenLevelMenuId(null);
                                                                    handleEditLevelClick(lvl);
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-zinc-300 hover:bg-[#27272A] hover:text-white cursor-pointer"
                                                            >
                                                                <PencilSquareIcon className="w-3.5 h-3.5 text-amber-400" />
                                                                Redaktə et
                                                            </button>
                                                        )}
                                                        {canDeleteLevel && (
                                                            <button
                                                                onClick={() => {
                                                                    setOpenLevelMenuId(null);
                                                                    handleDeleteLevel(lvl.id);
                                                                }}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                                            >
                                                                <TrashIcon className="w-3.5 h-3.5" />
                                                                Mərhələni sil
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Tasks inside Column */}
                                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                            {lvlTasks.length === 0 ? (
                                                <div className="text-center py-8 text-xs text-[#71717A] border border-dashed border-[#27272A] rounded-xl p-4">
                                                    Bu mərhələdə tapşırıq yoxdur
                                                </div>
                                            ) : (
                                                lvlTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                                        className="rounded-xl border border-[#27272A] bg-[#222226] p-3 hover:border-purple-500/40 transition-all cursor-pointer group shadow-xs"
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <span className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                                                                {task.title}
                                                            </span>
                                                            {getPriorityBadge(task.priority)}
                                                        </div>

                                                        {task.description && (
                                                            <p className="text-[11px] text-[#A1A1AA] line-clamp-2 mb-3">
                                                                {task.description}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center justify-between pt-2 border-t border-[#27272A] text-[10px] text-[#71717A]">
                                                            <div className="flex items-center gap-1.5">
                                                                {getStatusBadge(task.status)}
                                                            </div>
                                                            {task.assignedToUserName && (
                                                                <div className="flex items-center gap-1 text-zinc-300 font-medium">
                                                                    <UserIcon className="w-3 h-3 text-zinc-500" />
                                                                    <span className="truncate max-w-[80px]">{task.assignedToUserName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {/* Add Task to this specific Level */}
                                        {canCreateTask && (
                                            <button
                                                onClick={() => {
                                                    setDefaultLevelForTask(lvl.id);
                                                    setIsCreateTaskOpen(true);
                                                }}
                                                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#27272A]/60 hover:bg-[#27272A] border border-dashed border-[#3F3F46]/40 text-xs text-[#A1A1AA] hover:text-white font-medium transition-all cursor-pointer"
                                            >
                                                <PlusIcon className="w-3.5 h-3.5" />
                                                <span>Tapşırıq əlavə et</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* LIST VIEW (Grouped by Level) */
                        <div className="space-y-4">
                            {levels.map((lvl) => {
                                const lvlTasks = filteredTasks.filter((t) => String(t.levelId) === String(lvl.id));

                                return (
                                    <div
                                        key={lvl.id}
                                        className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs"
                                    >
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#27272A]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                                    <QueueListIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                        {lvl.name}
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#27272A] text-[#A1A1AA]">
                                                            {lvlTasks.length} tapşırıq
                                                        </span>
                                                    </h3>
                                                    {lvl.description && (
                                                        <p className="text-xs text-[#71717A] mt-0.5">{lvl.description}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {canCreateTask && (
                                                    <button
                                                        onClick={() => {
                                                            setDefaultLevelForTask(lvl.id);
                                                            setIsCreateTaskOpen(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-white transition-colors cursor-pointer"
                                                    >
                                                        <PlusIcon className="w-3.5 h-3.5" />
                                                        <span>Əlavə et</span>
                                                    </button>
                                                )}
                                                {canEditLevel && (
                                                    <button
                                                        onClick={() => handleEditLevelClick(lvl)}
                                                        className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                                                        title="Redaktə et"
                                                    >
                                                        <PencilSquareIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {canDeleteLevel && (
                                                    <button
                                                        onClick={() => handleDeleteLevel(lvl.id)}
                                                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                        title="Sil"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {lvlTasks.length === 0 ? (
                                            <div className="text-center py-6 text-xs text-[#71717A]">
                                                Bu mərhələdə heç bir tapşırıq yoxdur
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-[#27272A]">
                                                {lvlTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                                        className="py-3 flex items-center justify-between gap-4 hover:bg-[#27272A]/30 px-3 rounded-xl transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <div>{getStatusBadge(task.status)}</div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-xs font-bold text-white truncate">
                                                                    {task.title}
                                                                </h4>
                                                                {task.description && (
                                                                    <p className="text-[11px] text-[#71717A] truncate">
                                                                        {task.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-xs flex-shrink-0">
                                                            {getPriorityBadge(task.priority)}

                                                            {task.assignedToUserName && (
                                                                <span className="text-[11px] text-zinc-300 font-medium hidden sm:inline">
                                                                    {task.assignedToUserName}
                                                                </span>
                                                            )}

                                                            {task.deadline && (
                                                                <span className="text-[11px] text-[#71717A] hidden md:inline">
                                                                    {formatDateTime(task.deadline)}
                                                                </span>
                                                            )}

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteTask(task.id);
                                                                }}
                                                                className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                                title="Sil"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Create/Edit Level Modal */}
            {showLevelModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-5 border-b border-[#27272A]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    <QueueListIcon className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-white">
                                    {levelModalMode === 'create' ? 'Yeni Mərhələ Yarat' : 'Mərhələni Redaktə Et'}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowLevelModal(false)}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveLevel} className="p-5 space-y-4">
                            {levelError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                                    {levelError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Mərhələnin Adı <span className="text-rose-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={levelName}
                                    onChange={(e) => setLevelName(e.target.value)}
                                    placeholder="Məsələn: Dizayn və Prototip"
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Təsvir
                                </label>
                                <textarea
                                    value={levelDesc}
                                    onChange={(e) => setLevelDesc(e.target.value)}
                                    placeholder="Mərhələdə icra olunacaq işlərin qısa xülasəsi..."
                                    rows={2}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 font-medium resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                                    Sıra Nömrəsi (Order Index)
                                </label>
                                <input
                                    type="number"
                                    value={levelOrder}
                                    onChange={(e) => setLevelOrder(Number(e.target.value))}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowLevelModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#A1A1AA] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Ləğv et
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingLevel}
                                    className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    {savingLevel && <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                                    {levelModalMode === 'create' ? 'Yarat' : 'Yadda Saxla'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Creation Modal */}
            <CreateTaskModal
                isOpen={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                onTaskCreated={() => id && fetchProjectData(id)}
                defaultProjectId={id}
                defaultDivisionId={project?.divisionId ? String(project.divisionId) : undefined}
                defaultLevelId={defaultLevelForTask ? String(defaultLevelForTask) : undefined}
            />
        </div>
    );
};

export default ProjectDetail;
