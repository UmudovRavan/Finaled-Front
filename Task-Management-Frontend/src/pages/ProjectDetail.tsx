import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import CreateTaskModal from '../components/CreateTaskModal';
import CustomSelect, { type SelectOption } from '../components/CustomSelect';
import { projectService, projectLevelService, taskService, divisionService, notificationService, authService, titleService } from '../api';
import { normalizeProjectLevel } from '../api/projectLevelService';
import { normalizeTask } from '../api/taskService';
import type { ProjectDTO, ProjectLevelDTO, TaskResponse, NotificationResponse, DivisionDTO, TitleDTO } from '../dto';
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
    TagIcon,
} from '@heroicons/react/24/outline';

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, language } = useLanguage();
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
    const [viewMode, setViewMode] = useState<'Kanban' | 'List'>('List');
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

    // Create Title Modal
    const [showTitleModal, setShowTitleModal] = useState(false);
    const [titleName, setTitleName] = useState('');
    const [titleVoen, setTitleVoen] = useState('');
    const [titleDesc, setTitleDesc] = useState('');
    const [savingTitle, setSavingTitle] = useState(false);
    const [titleError, setTitleError] = useState('');
    const [titleSuccess, setTitleSuccess] = useState(false);
    const [titles, setTitles] = useState<TitleDTO[]>([]);
    const [selectedTitleIdForView, setSelectedTitleIdForView] = useState<string | null>('all');

    // Action Menus
    const [openLevelMenuId, setOpenLevelMenuId] = useState<string | number | null>(null);

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
            const [proj, lvls, projTasksRes, allTasksRes, notifs, titlesRes] = await Promise.all([
                projectService.getProjectById(projId),
                projectLevelService.getLevelsByProject(projId).catch(() => [] as ProjectLevelDTO[]),
                taskService.getTasksByProject(projId).catch(() => [] as TaskResponse[]),
                taskService.getAllTasks().catch(() => [] as TaskResponse[]),
                notificationService.getMyNotifications().catch(() => [] as NotificationResponse[]),
                titleService.getAllTitles().catch(() => [] as TitleDTO[]),
            ]);

            setProject(proj);
            setNotifications(notifs);
            setTitles(titlesRes);

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
            const normProjId = String(projId || '').trim().toLowerCase();
            const levelIdSet = new Set(finalLevels.map((l) => String(l.id || '').trim().toLowerCase()));

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
                        const tProjId = String(t.projectId || '').trim().toLowerCase();
                        const tLvlId = String(t.levelId || '').trim().toLowerCase();
                        const matchesProject = Boolean(tProjId && normProjId && tProjId === normProjId);
                        const matchesLevel = Boolean(tLvlId && levelIdSet.has(tLvlId));
                        const matchesName = Boolean(t.projectName && proj?.name && t.projectName.trim().toLowerCase() === proj.name.trim().toLowerCase());
                        if (matchesProject || matchesLevel || matchesName) {
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
            setLevelError(t('projects.stageNameRequired', {}, 'Mərhələ adı mütləq daxil edilməlidir'));
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
            setLevelError(err?.response?.data?.message || err.message || t('common.error', {}, 'Xəta baş verdi'));
        } finally {
            setSavingLevel(false);
        }
    };

    const handleSaveTitle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titleName.trim()) {
            setTitleError(t('tasks.titleNameRequired', {}, 'Title adı mütləq daxil edilməlidir'));
            return;
        }

        try {
            setSavingTitle(true);
            setTitleError('');
            await titleService.createTitle({
                name: titleName.trim(),
                voen: titleVoen.trim() || undefined,
                description: titleDesc.trim() || undefined,
            });

            titleService.getAllTitles().then(setTitles).catch(() => {});

            setTitleSuccess(true);
            setTimeout(() => {
                setShowTitleModal(false);
                setTitleSuccess(false);
            }, 700);
        } catch (err: any) {
            setTitleError(err?.response?.data?.message || err.message || t('common.error', {}, 'Xəta baş verdi'));
        } finally {
            setSavingTitle(false);
        }
    };

    const handleDeleteLevel = async (lvlId: string | number) => {
        if (!confirm(t('projects.deleteStageConfirm', {}, 'Bu mərhələni silmək istədiyinizə əminsiniz?'))) return;
        try {
            await projectLevelService.deleteLevel(lvlId);
            setLevels((prev) => prev.filter((l) => l.id !== lvlId));
        } catch (err: any) {
            alert(err?.response?.data?.message || t('projects.deleteStageError', {}, 'Mərhələni silmək mümkün olmadı'));
        }
    };

    const handleDeleteTask = async (taskId: string | number) => {
        if (!confirm(t('tasks.deleteConfirm', {}, 'Bu tapşırığı silmək istədiyinizə əminsiniz?'))) return;
        try {
            await taskService.deleteTask(taskId);
            setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err: any) {
            alert(t('tasks.deleteError', {}, 'Tapşırığı silmək mümkün olmadı'));
        }
    };

    const getPriorityBadge = (priority?: Priority | number) => {
        switch (priority) {
            case Priority.Urgent:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        {t('priorities.urgent', {}, 'Təcili')}
                    </span>
                );
            case Priority.High:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {t('priorities.high', {}, 'Yüksək')}
                    </span>
                );
            case Priority.Low:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                        {t('priorities.low', {}, 'Aşağı')}
                    </span>
                );
            case Priority.Normal:
            default:
                return (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {t('priorities.medium', {}, 'Normal')}
                    </span>
                );
        }
    };

    const getStatusBadge = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.Completed:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{t('statuses.completed', {}, 'Tamamlandı')}</span>;
            case TaskStatus.InProgress:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">{t('statuses.inProgress', {}, 'İcrada')}</span>;
            case TaskStatus.UnderReview:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">{t('statuses.review', {}, 'Yoxlanışda')}</span>;
            case TaskStatus.Assigned:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">{t('statuses.assigned', {}, 'Təyin edildi')}</span>;
            default:
                return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">{t('statuses.pending', {}, 'Gözləmədə')}</span>;
        }
    };

    const activeTitle = useMemo(() => {
        if (!selectedTitleIdForView || selectedTitleIdForView === 'unassigned' || selectedTitleIdForView === 'all') return null;
        return titles.find((t) => String(t.id).toLowerCase() === String(selectedTitleIdForView).toLowerCase()) || null;
    }, [titles, selectedTitleIdForView]);

    const unassignedTasks = useMemo(() => {
        return allTasks.filter((t) => !t.titleId || !titles.some((tl) => String(tl.id).toLowerCase() === String(t.titleId).toLowerCase()));
    }, [allTasks, titles]);

    const titleTasks = useMemo(() => {
        if (!selectedTitleIdForView || selectedTitleIdForView === 'all') return allTasks;
        if (selectedTitleIdForView === 'unassigned') {
            return unassignedTasks;
        }
        return allTasks.filter((t) => String(t.titleId || '').toLowerCase() === String(selectedTitleIdForView).toLowerCase());
    }, [allTasks, selectedTitleIdForView, unassignedTasks]);

    const filteredTitles = useMemo(() => {
        if (!searchQuery.trim()) return titles;
        const q = searchQuery.toLowerCase();
        return titles.filter((tl) =>
            tl.name.toLowerCase().includes(q) ||
            (tl.description && tl.description.toLowerCase().includes(q)) ||
            (tl.voen && tl.voen.toLowerCase().includes(q))
        );
    }, [titles, searchQuery]);

    // Filter tasks based on search & level selector
    const filteredTasks = useMemo(() => {
        const source = selectedTitleIdForView && selectedTitleIdForView !== 'all' ? titleTasks : allTasks;
        const result = source.filter((taskItem) => {
            if (selectedLevelId !== 'all') {
                if (selectedLevelId === 'unassigned') {
                    if (taskItem.levelId && levels.some((l) => String(l.id).toLowerCase() === String(taskItem.levelId).toLowerCase())) {
                        return false;
                    }
                } else if (String(taskItem.levelId || '').toLowerCase() !== selectedLevelId.toLowerCase()) {
                    return false;
                }
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    taskItem.title.toLowerCase().includes(q) ||
                    (taskItem.description && taskItem.description.toLowerCase().includes(q)) ||
                    (taskItem.assignedToUserName && taskItem.assignedToUserName.toLowerCase().includes(q))
                );
            }
            return true;
        });
        return taskService.sortTasksNewestFirst(result);
    }, [allTasks, titleTasks, selectedTitleIdForView, selectedLevelId, searchQuery, levels]);

    const totalTasksCount = allTasks.length;
    const completedTasksCount = allTasks.filter((t) => t.status === TaskStatus.Completed).length;
    const activeTasksCount = allTasks.filter((t) => t.status === TaskStatus.InProgress || t.status === TaskStatus.Assigned || t.status === TaskStatus.Pending).length;
    const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

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

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Back button & Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-[#71717A] flex-wrap">
                        <button
                            onClick={() => navigate('/projects')}
                            className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                            <span>{t('projects.title', {}, 'Layihələr')}</span>
                        </button>
                        <span>/</span>
                        {division && (
                            <>
                                <Link
                                    to={`/projects?divisionId=${division.id}`}
                                    className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
                                >
                                    <BuildingOfficeIcon className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                                    {division.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-zinc-900 dark:text-white font-semibold flex items-center gap-1">
                            <FolderIcon className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                            {project?.name || '...'}
                        </span>
                        {selectedTitleIdForView && selectedTitleIdForView !== 'all' && (
                            <>
                                <span>/</span>
                                <button
                                    onClick={() => setSelectedTitleIdForView('all')}
                                    className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                    <TagIcon className="w-3 h-3" />
                                    <span>{activeTitle ? activeTitle.name : t('projects.unassignedTitle', {}, 'Təyin edilməmiş')}</span>
                                </button>
                            </>
                        )}
                        {selectedTitleIdForView === null && (
                            <>
                                <span>/</span>
                                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                    <TagIcon className="w-3 h-3" />
                                    <span>{t('projects.titlesView', {}, 'Title İcmalı')}</span>
                                </span>
                            </>
                        )}
                    </div>

                    {/* Project Header Banner */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-6 shadow-xs relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                                        <FolderIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                            {project?.name}
                                        </h1>
                                        {division && (
                                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] flex items-center gap-1 mt-0.5">
                                                <BuildingOfficeIcon className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                                                {t('projects.division', {}, 'Şöbə')}: <span className="text-zinc-900 dark:text-white font-medium">{division.name}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {project?.description && (
                                    <p className="text-xs text-zinc-600 dark:text-[#A1A1AA] leading-relaxed pt-1">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-[#71717A] pt-2 flex-wrap">
                                    {project?.managerName && (
                                        <div className="flex items-center gap-1.5">
                                            <UserIcon className="w-4 h-4 text-zinc-400" />
                                            <span>{t('projects.manager', {}, 'Rəhbər')}: <span className="text-zinc-900 dark:text-white font-medium">{project.managerName}</span></span>
                                        </div>
                                    )}
                                    {(project?.startDate || project?.endDate) && (
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-4 h-4 text-zinc-400" />
                                            <span>
                                                {project.startDate ? new Date(project.startDate).toLocaleDateString(language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US') : '—'} - {project.endDate ? new Date(project.endDate).toLocaleDateString(language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US') : t('common.all', {}, 'Müddətsiz')}
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
                                        className="p-2.5 rounded-xl bg-zinc-100 dark:bg-[#27272A] hover:bg-zinc-200 dark:hover:bg-[#3F3F46] text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                                        title={t('common.refresh', {}, 'Yenilə')}
                                    >
                                        <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-purple-500' : ''}`} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setTitleName('');
                                            setTitleVoen('');
                                            setTitleDesc('');
                                            setTitleError('');
                                            setTitleSuccess(false);
                                            setShowTitleModal(true);
                                        }}
                                        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors cursor-pointer"
                                        title={t('tasks.createTitle', {}, 'Yeni Title Yarat')}
                                    >
                                        <TagIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                                        <span>{t('tasks.newTitle', {}, 'Yeni Title')}</span>
                                    </button>

                                    {canCreateTask && (
                                        <button
                                            onClick={() => {
                                                setDefaultLevelForTask(levels[0]?.id);
                                                setIsCreateTaskOpen(true);
                                            }}
                                            type="button"
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg border border-zinc-200/80 dark:border-transparent transition-colors cursor-pointer"
                                        >
                                            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                            <span>{t('tasks.createTask', {}, 'Tapşırıq Əlavə Et')}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="w-full sm:w-48 bg-zinc-50 dark:bg-[#27272A]/60 rounded-xl p-3 border border-zinc-200/80 dark:border-[#27272A]">
                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                        <span className="text-zinc-500 dark:text-[#A1A1AA]">{t('projects.progress', {}, 'Ümumi İcra')}</span>
                                        <span className="font-bold text-zinc-900 dark:text-white">{completionRate}%</span>
                                    </div>
                                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-[#18181B]">
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
                            title={t('tasks.titleDimension', {}, 'Title (Holdinq / MMC)')}
                            value={project?.titleName || '—'}
                            badgeText={project?.divisionName || t('common.project', {}, 'Layihə')}
                            accentColor="#F59E0B"
                        />
                        <KpiCard
                            title={t('dashboard.totalTasks', {}, 'Ümumi Tapşırıqlar')}
                            value={totalTasksCount}
                            badgeText={t('common.all', {}, 'Bütün')}
                            accentColor="#38BDF8"
                        />
                        <KpiCard
                            title={t('dashboard.inProgressTasks', {}, 'İcrada Olanlar')}
                            value={activeTasksCount}
                            badgeText={t('common.active', {}, 'Aktiv')}
                            accentColor="#FBBF24"
                        />
                        <KpiCard
                            title={t('dashboard.completedTasks', {}, 'Tamamlanmış')}
                            value={completedTasksCount}
                            badgeText={t('common.success', {}, 'Nəticə')}
                            accentColor="#34D399"
                        />
                    </div>

                    {/* Toolbar: Search & View Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] rounded-2xl p-3 shadow-xs">
                        <div className="flex items-center gap-2.5 flex-1 max-w-xl flex-wrap">
                            <div className="relative flex-1 min-w-[180px]">
                                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={selectedTitleIdForView ? t('projects.searchPlaceholder', {}, 'Tapşırıq axtar...') : t('common.search', {}, 'Title üzrə axtarış...')}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-amber-500 font-medium transition-all"
                                />
                            </div>

                            {selectedTitleIdForView && levels.length > 0 && (
                                <CustomSelect
                                    value={selectedLevelId}
                                    onChange={setSelectedLevelId}
                                    options={[
                                        { value: 'all', label: t('projects.allStages', {}, 'Bütün Mərhələlər') },
                                        ...levels.map((lvl) => ({
                                            value: String(lvl.id),
                                            label: lvl.name,
                                        })),
                                        { value: 'unassigned', label: t('projects.unassignedStage', {}, 'Ümumi / Mərhələsiz') },
                                    ]}
                                />
                            )}

                            {selectedTitleIdForView && titles.length > 0 && (
                                <CustomSelect
                                    value={selectedTitleIdForView}
                                    onChange={(val) => setSelectedTitleIdForView(val)}
                                    options={[
                                        { value: 'all', label: t('tasks.allTitles', {}, 'Bütün Title-lar') },
                                        ...titles.map((tl) => ({
                                            value: String(tl.id),
                                            label: tl.name,
                                        })),
                                        ...(unassignedTasks.length > 0 ? [{ value: 'unassigned', label: t('projects.unassignedTitle', {}, 'Təyin edilməmiş') }] : []),
                                    ]}
                                />
                            )}
                        </div>

                        {/* View Switcher / Return control */}
                        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                            {!selectedTitleIdForView ? (
                                <button
                                    onClick={() => setSelectedTitleIdForView('all')}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-[#3F3F46] transition-colors cursor-pointer"
                                    title={t('projects.allTasksView', {}, 'Bütün Tapşırıqlar')}
                                >
                                    <ListBulletIcon className="w-4 h-4 text-purple-500" />
                                    <span>{t('projects.allTasksView', {}, 'Bütün Tapşırıqlara Qayıt')}</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setSelectedTitleIdForView(null)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
                                        title={t('projects.titlesView', {}, 'Title İcmalı')}
                                    >
                                        <TagIcon className="w-3.5 h-3.5" />
                                        <span>{t('projects.titlesView', {}, 'Title İcmalı')}</span>
                                    </button>

                                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl p-1">
                                        <button
                                            onClick={() => setViewMode('Kanban')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                viewMode === 'Kanban'
                                                    ? 'bg-white dark:bg-[#18181B] text-zinc-900 dark:text-white shadow-xs'
                                                    : 'text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <Squares2X2Icon className="w-4 h-4" />
                                            <span>{t('projects.kanbanView', {}, 'Kanban')}</span>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('List')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                viewMode === 'List'
                                                    ? 'bg-white dark:bg-[#18181B] text-zinc-900 dark:text-white shadow-xs'
                                                    : 'text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <ListBulletIcon className="w-4 h-4" />
                                            <span>{t('projects.listView', {}, 'Siyahı')}</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Main Content: Titles View vs Tasks Drilldown */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-zinc-500 dark:text-[#71717A] mt-3">{t('common.loading', {}, 'Məlumatlar yüklənir...')}</span>
                        </div>
                    ) : !selectedTitleIdForView ? (
                        /* TITLES VIEW (Default on entry: see all created Titles & click to view tasks) */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TagIcon className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                                        {t('projects.titlesView', {}, 'Yaranan Title-lar (Holdinq / MMC)')}
                                    </h2>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                                        {filteredTitles.length}
                                    </span>
                                </div>
                            </div>

                            {filteredTitles.length === 0 && unassignedTasks.length === 0 ? (
                                <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-12 text-center shadow-xs">
                                    <TagIcon className="w-12 h-12 text-amber-500/40 mx-auto mb-3" />
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{t('projects.noTitlesFound', {}, 'Hələ heç bir Title yaradılmayıb')}</p>
                                    <p className="text-xs text-zinc-500 dark:text-[#71717A] mt-1 max-w-md mx-auto">
                                        {t('projects.noTitlesSubtitle', {}, 'Layihə tapşırıqlarını şirkət və holdinqlər üzrə təşkil etmək üçün yuxarıdakı "Yeni Title" düyməsindən ilk Title-ı əlavə edin.')}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setTitleName('');
                                            setTitleVoen('');
                                            setTitleDesc('');
                                            setTitleError('');
                                            setTitleSuccess(false);
                                            setShowTitleModal(true);
                                        }}
                                        type="button"
                                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
                                    >
                                        <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                        <span>{t('tasks.newTitle', {}, 'Yeni Title')}</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTitles.map((tl) => {
                                        const tlTasks = allTasks.filter((t) => String(t.titleId) === String(tl.id));
                                        const completed = tlTasks.filter((t) => t.status === TaskStatus.Completed).length;
                                        const active = tlTasks.filter((t) => t.status === TaskStatus.InProgress || t.status === TaskStatus.Assigned).length;
                                        const rate = tlTasks.length > 0 ? Math.round((completed / tlTasks.length) * 100) : 0;

                                        return (
                                            <div
                                                key={tl.id}
                                                onClick={() => setSelectedTitleIdForView(String(tl.id))}
                                                className="group relative bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                                                                <TagIcon className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                                    {tl.name}
                                                                </h3>
                                                                {tl.voen && (
                                                                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                                                        VÖEN: {tl.voen}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                                                            {tlTasks.length} {t('projects.tasksInTitle', {}, 'tapşırıq')}
                                                        </span>
                                                    </div>

                                                    {tl.description && (
                                                        <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] line-clamp-2 mb-4 leading-relaxed">
                                                            {tl.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="pt-3 border-t border-zinc-100 dark:border-[#27272A] mt-auto">
                                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                                        <span className="text-zinc-500 dark:text-[#71717A] text-[11px]">
                                                            {completed} tamamlanıb / {active} icrada
                                                        </span>
                                                        <span className="font-bold text-zinc-900 dark:text-white text-[11px]">
                                                            {rate}%
                                                        </span>
                                                    </div>
                                                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-[#27272A]">
                                                        <div
                                                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                                                            style={{ width: `${rate}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                                                        <span>{t('projects.viewTasks', {}, 'Tapşırıqlara bax')}</span>
                                                        <ChevronRightIcon className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Unassigned tasks card if any */}
                                    {unassignedTasks.length > 0 && (
                                        <div
                                            onClick={() => setSelectedTitleIdForView('unassigned')}
                                            className="group relative bg-zinc-50 dark:bg-[#18181B]/60 border border-dashed border-zinc-300 dark:border-[#3F3F46] hover:border-zinc-400 dark:hover:border-zinc-500 rounded-2xl p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-10 h-10 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                                                            <FolderIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                                                {t('projects.unassignedTitle', {}, 'Təyin edilməmiş / Digər')}
                                                            </h3>
                                                            <span className="text-[10px] text-zinc-500">
                                                                {t('projects.unassignedTitleDesc', {}, 'Heç bir Title-a bağlanmamış tapşırıqlar')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-200 dark:bg-[#27272A] text-zinc-700 dark:text-[#A1A1AA]">
                                                        {unassignedTasks.length} {t('projects.tasksInTitle', {}, 'tapşırıq')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-zinc-200/60 dark:border-[#27272A] mt-auto flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                                                <span>{t('projects.viewTasks', {}, 'Tapşırıqlara bax')}</span>
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* TASKS DRILLDOWN VIEW FOR SELECTED TITLE */
                        <div className="space-y-4">
                            {/* Title Navigation Banner (Only shown when viewing a specific Title or Unassigned) */}
                            {selectedTitleIdForView !== 'all' && (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <button
                                            onClick={() => setSelectedTitleIdForView('all')}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-[#27272A] text-xs font-bold text-zinc-900 dark:text-white border border-zinc-200 dark:border-[#27272A] shadow-xs transition-colors cursor-pointer"
                                        >
                                            <ArrowLeftIcon className="w-3.5 h-3.5" />
                                            <span>{t('projects.allTasksView', {}, 'Bütün Tapşırıqlara qayıt')}</span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Title:</span>
                                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                                {activeTitle ? activeTitle.name : t('projects.unassignedTitle', {}, 'Təyin edilməmiş')}
                                            </span>
                                            {activeTitle?.voen && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                                    VÖEN: {activeTitle.voen}
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-[#27272A] text-zinc-700 dark:text-[#A1A1AA]">
                                                {filteredTasks.length} {t('projects.tasksInTitle', {}, 'tapşırıq')}
                                            </span>
                                        </div>
                                    </div>

                                    {canCreateTask && (
                                        <button
                                            onClick={() => {
                                                setDefaultLevelForTask(levels[0]?.id);
                                                setIsCreateTaskOpen(true);
                                            }}
                                            type="button"
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                                        >
                                            <PlusIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                                            <span>{t('tasks.createTask', {}, 'Tapşırıq Əlavə Et')}</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Tasks render */}
                            {filteredTasks.length === 0 ? (
                                <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-12 text-center shadow-xs">
                                    <FolderIcon className="w-12 h-12 text-zinc-400 dark:text-[#71717A] mx-auto mb-3 opacity-40" />
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                        {selectedTitleIdForView === 'all'
                                            ? t('projects.noTasksInProject', {}, 'Bu layihə üzrə hələ heç bir tapşırıq yoxdur')
                                            : t('projects.noTasksInTitle', {}, 'Bu Title üzrə hələ heç bir tapşırıq yoxdur')}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-[#71717A] mt-1">
                                        {t('projects.createFirstTask', {}, 'İşləri başlatmaq üçün ilk tapşırığı əlavə edin')}
                                    </p>
                                    {canCreateTask && (
                                        <button
                                            onClick={() => {
                                                setDefaultLevelForTask(levels[0]?.id);
                                                setIsCreateTaskOpen(true);
                                            }}
                                            type="button"
                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg border border-zinc-200/80 dark:border-transparent transition-colors cursor-pointer"
                                        >
                                            <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                                            <span>{t('tasks.createTask', {}, 'Tapşırıq Əlavə Et')}</span>
                                        </button>
                                    )}
                                </div>
                            ) : viewMode === 'Kanban' ? (
                        /* KANBAN VIEW (Levels or Statuses as Columns) */
                        <div className="flex gap-4 overflow-x-auto pb-6 items-start">
                            {levels.length > 0 ? (
                                <>
                                    {levels.map((lvl) => {
                                        const lvlTasks = filteredTasks.filter((t) => String(t.levelId || '').toLowerCase() === String(lvl.id).toLowerCase());

                                        return (
                                            <div
                                                key={lvl.id}
                                                className="w-80 flex-shrink-0 bg-zinc-100/70 dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] rounded-2xl p-4 flex flex-col max-h-[calc(100vh-320px)] shadow-xs"
                                            >
                                                {/* Column Header */}
                                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-[#27272A]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[170px]" title={lvl.name}>
                                                            {lvl.name}
                                                        </h3>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-[#27272A] text-zinc-700 dark:text-[#A1A1AA]">
                                                            {lvlTasks.length}
                                                        </span>
                                                    </div>

                                                    {/* Column Menu */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setOpenLevelMenuId(openLevelMenuId === lvl.id ? null : lvl.id)}
                                                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                                                        >
                                                            <EllipsisHorizontalIcon className="w-4 h-4" />
                                                        </button>

                                                        {openLevelMenuId === lvl.id && (
                                                            <div className="absolute right-0 top-6 bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-xl shadow-xl p-1 z-50 flex flex-col text-xs min-w-[130px] backdrop-blur-md">
                                                                {canEditLevel && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setOpenLevelMenuId(null);
                                                                            handleEditLevelClick(lvl);
                                                                        }}
                                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#27272A] hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                                                                    >
                                                                        <PencilSquareIcon className="w-3.5 h-3.5 text-amber-500" />
                                                                        {t('common.edit', {}, 'Redaktə et')}
                                                                    </button>
                                                                )}
                                                                {canDeleteLevel && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setOpenLevelMenuId(null);
                                                                            handleDeleteLevel(lvl.id);
                                                                        }}
                                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                                                                    >
                                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                                        {t('projects.deleteConfirm', {}, 'Mərhələni sil')}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Tasks inside Column */}
                                                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                                    {lvlTasks.length === 0 ? (
                                                        <div className="text-center py-8 text-xs text-zinc-400 dark:text-[#71717A] border border-dashed border-zinc-300 dark:border-[#27272A] rounded-xl p-4">
                                                            {t('common.noData', {}, 'Bu mərhələdə tapşırıq yoxdur')}
                                                        </div>
                                                    ) : (
                                                        lvlTasks.map((task) => (
                                                            <div
                                                                key={task.id}
                                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                                                className="rounded-xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#222226] p-3 hover:border-purple-500/40 transition-all cursor-pointer group shadow-2xs"
                                                            >
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                                                        {task.title}
                                                                    </span>
                                                                    {getPriorityBadge(task.priority)}
                                                                </div>

                                                                {task.description && (
                                                                    <p className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] line-clamp-2 mb-3">
                                                                        {task.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#27272A] text-[10px] text-zinc-500 dark:text-[#71717A]">
                                                                    <div className="flex items-center gap-1.5">
                                                                        {getStatusBadge(task.status)}
                                                                    </div>
                                                                    {task.assignedToUserName && (
                                                                        <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
                                                                            <UserIcon className="w-3 h-3 text-zinc-400" />
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
                                                        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white hover:bg-zinc-50 dark:bg-[#27272A]/60 dark:hover:bg-[#27272A] border border-dashed border-zinc-300 dark:border-[#3F3F46]/40 text-xs text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white font-medium transition-all cursor-pointer shadow-2xs"
                                                    >
                                                        <PlusIcon className="w-3.5 h-3.5" />
                                                        <span>{t('tasks.createTask', {}, 'Tapşırıq əlavə et')}</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Unassigned stage column for tasks without a stage */}
                                    {(() => {
                                        const unassignedBoardTasks = filteredTasks.filter(
                                            (t) => !t.levelId || !levels.some((l) => String(l.id).toLowerCase() === String(t.levelId).toLowerCase())
                                        );
                                        if (unassignedBoardTasks.length === 0) return null;
                                        return (
                                            <div
                                                key="unassigned-stage-col"
                                                className="w-80 flex-shrink-0 bg-zinc-100/70 dark:bg-[#18181B] border border-dashed border-zinc-300 dark:border-[#3F3F46] rounded-2xl p-4 flex flex-col max-h-[calc(100vh-320px)] shadow-xs"
                                            >
                                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-[#27272A]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
                                                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[170px]" title={t('projects.unassignedStage', {}, 'Ümumi / Mərhələsiz')}>
                                                            {t('projects.unassignedStage', {}, 'Ümumi / Mərhələsiz')}
                                                        </h3>
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-[#27272A] text-zinc-700 dark:text-[#A1A1AA]">
                                                            {unassignedBoardTasks.length}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                                    {unassignedBoardTasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                                            className="rounded-xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#222226] p-3 hover:border-purple-500/40 transition-all cursor-pointer group shadow-2xs"
                                                        >
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                                                    {task.title}
                                                                </span>
                                                                {getPriorityBadge(task.priority)}
                                                            </div>

                                                            {task.description && (
                                                                <p className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] line-clamp-2 mb-3">
                                                                    {task.description}
                                                                </p>
                                                            )}

                                                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#27272A] text-[10px] text-zinc-500 dark:text-[#71717A]">
                                                                <div className="flex items-center gap-1.5">
                                                                    {getStatusBadge(task.status)}
                                                                </div>
                                                                {task.assignedToUserName && (
                                                                    <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
                                                                        <UserIcon className="w-3 h-3 text-zinc-400" />
                                                                        <span className="truncate max-w-[80px]">{task.assignedToUserName}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {canCreateTask && (
                                                    <button
                                                        onClick={() => {
                                                            setDefaultLevelForTask(undefined);
                                                            setIsCreateTaskOpen(true);
                                                        }}
                                                        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white hover:bg-zinc-50 dark:bg-[#27272A]/60 dark:hover:bg-[#27272A] border border-dashed border-zinc-300 dark:border-[#3F3F46]/40 text-xs text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white font-medium transition-all cursor-pointer shadow-2xs"
                                                    >
                                                        <PlusIcon className="w-3.5 h-3.5" />
                                                        <span>{t('tasks.createTask', {}, 'Tapşırıq əlavə et')}</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </>
                            ) : (
                            [
                                { status: TaskStatus.Pending, name: t('statuses.pending', {}, 'Gözləmədə'), color: 'bg-zinc-400' },
                                { status: TaskStatus.Assigned, name: t('statuses.assigned', {}, 'Təyin edildi'), color: 'bg-sky-500' },
                                { status: TaskStatus.InProgress, name: t('statuses.inProgress', {}, 'İcrada'), color: 'bg-amber-500' },
                                { status: TaskStatus.UnderReview, name: t('statuses.review', {}, 'Yoxlanışda'), color: 'bg-purple-500' },
                                { status: TaskStatus.Completed, name: t('statuses.completed', {}, 'Tamamlandı'), color: 'bg-emerald-500' },
                            ].map((col) => {
                                const colTasks = filteredTasks.filter((t) => t.status === col.status);
                                return (
                                    <div
                                        key={col.status}
                                        className="w-80 flex-shrink-0 bg-zinc-100/70 dark:bg-[#18181B] border border-zinc-200/80 dark:border-[#27272A] rounded-2xl p-4 flex flex-col max-h-[calc(100vh-320px)] shadow-xs"
                                    >
                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200 dark:border-[#27272A]">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                                                <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                                    {col.name}
                                                </h3>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 dark:bg-[#27272A] text-zinc-700 dark:text-[#A1A1AA]">
                                                    {colTasks.length}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                            {colTasks.length === 0 ? (
                                                <div className="text-center py-8 text-xs text-zinc-400 dark:text-[#71717A] border border-dashed border-zinc-300 dark:border-[#27272A] rounded-xl p-4">
                                                    {t('common.noData', {}, 'Tapşırıq yoxdur')}
                                                </div>
                                            ) : (
                                                colTasks.map((task) => (
                                                    <div
                                                        key={task.id}
                                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                                        className="rounded-xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#222226] p-3 hover:border-purple-500/40 transition-all cursor-pointer group shadow-2xs"
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                                                {task.title}
                                                            </span>
                                                            {getPriorityBadge(task.priority)}
                                                        </div>

                                                        {task.description && (
                                                            <p className="text-[11px] text-zinc-500 dark:text-[#A1A1AA] line-clamp-2 mb-3">
                                                                {task.description}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-[#27272A] text-[10px] text-zinc-500 dark:text-[#71717A]">
                                                            <div className="flex items-center gap-1.5">
                                                                {getStatusBadge(task.status)}
                                                            </div>
                                                            {task.assignedToUserName && (
                                                                <div className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
                                                                    <UserIcon className="w-3 h-3 text-zinc-400" />
                                                                    <span className="truncate max-w-[80px]">{task.assignedToUserName}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        </div>
                    ) : (
                        /* LIST VIEW (Grouped by Level) */
                        <div className="space-y-4">
                            {levels.length > 0 ? (
                                <>
                                    {levels.map((lvl) => {
                                        const lvlTasks = filteredTasks.filter((t) => String(t.levelId || '').toLowerCase() === String(lvl.id).toLowerCase());

                                        return (
                                            <div
                                                key={lvl.id}
                                                className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs"
                                            >
                                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-[#27272A]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                                                            <QueueListIcon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                                {lvl.name}
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-[#27272A] text-zinc-700 dark:text-[#A1A1AA]">
                                                                    {lvlTasks.length} {t('projects.tasksCount', {}, 'tapşırıq')}
                                                                </span>
                                                            </h3>
                                                            {lvl.description && (
                                                                <p className="text-xs text-zinc-500 dark:text-[#71717A] mt-0.5">{lvl.description}</p>
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
                                                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-xs font-semibold text-zinc-900 dark:text-white transition-colors cursor-pointer"
                                                            >
                                                                <PlusIcon className="w-3.5 h-3.5" />
                                                                <span>{t('common.add', {}, 'Əlavə et')}</span>
                                                            </button>
                                                        )}
                                                        {canEditLevel && (
                                                            <button
                                                                onClick={() => handleEditLevelClick(lvl)}
                                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                                                                title={t('common.edit', {}, 'Redaktə et')}
                                                            >
                                                                <PencilSquareIcon className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {canDeleteLevel && (
                                                            <button
                                                                onClick={() => handleDeleteLevel(lvl.id)}
                                                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                                title={t('common.delete', {}, 'Sil')}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {lvlTasks.length === 0 ? (
                                                    <div className="text-center py-6 text-xs text-zinc-400 dark:text-[#71717A]">
                                                        {t('common.noData', {}, 'Bu mərhələdə heç bir tapşırıq yoxdur')}
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-zinc-100 dark:divide-[#27272A]">
                                                        {lvlTasks.map((task) => (
                                                            <div
                                                                key={task.id}
                                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                                                className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#27272A]/30 px-3 rounded-xl transition-colors cursor-pointer"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    <div>{getStatusBadge(task.status)}</div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                                                            {task.title}
                                                                        </h4>
                                                                        {task.description && (
                                                                            <p className="text-[11px] text-zinc-500 dark:text-[#71717A] truncate">
                                                                                {task.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-4 text-xs flex-shrink-0">
                                                                    {getPriorityBadge(task.priority)}

                                                                    {task.assignedToUserName && (
                                                                        <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium hidden sm:inline">
                                                                            {task.assignedToUserName}
                                                                        </span>
                                                                    )}

                                                                    {task.deadline && (
                                                                        <span className="text-[11px] text-zinc-500 dark:text-[#71717A] hidden md:inline">
                                                                            {formatDateTime(task.deadline)}
                                                                        </span>
                                                                    )}

                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteTask(task.id);
                                                                        }}
                                                                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                                        title={t('common.delete', {}, 'Sil')}
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

                                    {/* Unassigned stage tasks in List View */}
                                    {(() => {
                                        const unassignedListTasks = filteredTasks.filter(
                                            (t) => !t.levelId || !levels.some((l) => String(l.id).toLowerCase() === String(t.levelId).toLowerCase())
                                        );
                                        if (unassignedListTasks.length === 0) return null;
                                        return (
                                            <div
                                                key="unassigned-stage-list"
                                                className="rounded-2xl border border-dashed border-zinc-300 dark:border-[#3F3F46] bg-white dark:bg-[#18181B] p-5 shadow-xs"
                                            >
                                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-[#27272A]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                                                            <QueueListIcon className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                                                {t('projects.unassignedStage', {}, 'Ümumi / Mərhələsiz')}
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-[#27272A] text-zinc-700 dark:text-[#A1A1AA]">
                                                                    {unassignedListTasks.length} {t('projects.tasksCount', {}, 'tapşırıq')}
                                                                </span>
                                                            </h3>
                                                            <p className="text-xs text-zinc-500 dark:text-[#71717A] mt-0.5">
                                                                {t('projects.unassignedStageDesc', {}, 'Hər hansı konkret mərhələyə bağlanmamış ümumi tapşırıqlar')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {canCreateTask && (
                                                        <button
                                                            onClick={() => {
                                                                setDefaultLevelForTask(undefined);
                                                                setIsCreateTaskOpen(true);
                                                            }}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-xs font-semibold text-zinc-900 dark:text-white transition-colors cursor-pointer"
                                                        >
                                                            <PlusIcon className="w-3.5 h-3.5" />
                                                            <span>{t('common.add', {}, 'Əlavə et')}</span>
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="divide-y divide-zinc-100 dark:divide-[#27272A]">
                                                    {unassignedListTasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                                            className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#27272A]/30 px-3 rounded-xl transition-colors cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <div>{getStatusBadge(task.status)}</div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                                                        {task.title}
                                                                    </h4>
                                                                    {task.description && (
                                                                        <p className="text-[11px] text-zinc-500 dark:text-[#71717A] truncate">
                                                                            {task.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-xs flex-shrink-0">
                                                                {getPriorityBadge(task.priority)}

                                                                {task.assignedToUserName && (
                                                                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium hidden sm:inline">
                                                                        {task.assignedToUserName}
                                                                    </span>
                                                                )}

                                                                {task.deadline && (
                                                                    <span className="text-[11px] text-zinc-500 dark:text-[#71717A] hidden md:inline">
                                                                        {formatDateTime(task.deadline)}
                                                                    </span>
                                                                )}

                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteTask(task.id);
                                                                    }}
                                                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                                    title={t('common.delete', {}, 'Sil')}
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </>
                            ) : (
                            <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs">
                                <div className="divide-y divide-zinc-100 dark:divide-[#27272A]">
                                    {filteredTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                            className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-[#27272A]/30 px-3 rounded-xl transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div>{getStatusBadge(task.status)}</div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                                        {task.title}
                                                    </h4>
                                                    {task.description && (
                                                        <p className="text-[11px] text-zinc-500 dark:text-[#71717A] truncate">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs flex-shrink-0">
                                                {getPriorityBadge(task.priority)}

                                                {task.assignedToUserName && (
                                                    <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium hidden sm:inline">
                                                        {task.assignedToUserName}
                                                    </span>
                                                )}

                                                {task.deadline && (
                                                    <span className="text-[11px] text-zinc-500 dark:text-[#71717A] hidden md:inline">
                                                        {formatDateTime(task.deadline)}
                                                    </span>
                                                )}

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTask(task.id);
                                                    }}
                                                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                    title={t('common.delete', {}, 'Sil')}
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>

            {/* Create/Edit Level Modal */}
            {showLevelModal && (
                <div
                    className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowLevelModal(false); }}
                >
                    <div
                        className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] sm:max-h-[85vh] my-auto flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-[#27272A]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                                    <QueueListIcon className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                    {levelModalMode === 'create' ? t('projects.newStage', {}, 'Yeni Mərhələ Yarat') : t('common.edit', {}, 'Mərhələni Redaktə Et')}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowLevelModal(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveLevel} className="p-5 space-y-4">
                            {levelError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
                                    {levelError}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('projects.stageName', {}, 'Mərhələnin Adı')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={levelName}
                                    onChange={(e) => setLevelName(e.target.value)}
                                    placeholder={t('projects.stageNamePlaceholder', {}, 'Məsələn: Dizayn və Prototip')}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 font-medium transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('common.description', {}, 'Təsvir')}
                                </label>
                                <textarea
                                    value={levelDesc}
                                    onChange={(e) => setLevelDesc(e.target.value)}
                                    placeholder={t('common.description', {}, 'Mərhələdə icra olunacaq işlərin qısa xülasəsi...')}
                                    rows={2}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 font-medium resize-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('common.sort', {}, 'Sıra Nömrəsi (Order Index)')}
                                </label>
                                <input
                                    type="number"
                                    value={levelOrder}
                                    onChange={(e) => setLevelOrder(Number(e.target.value))}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 font-medium transition-all"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowLevelModal(false)}
                                    className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'İmtina')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingLevel}
                                    className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {savingLevel && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {levelModalMode === 'create' ? t('common.create', {}, 'Yarat') : t('common.save', {}, 'Yadda Saxla')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Title Modal */}
            {showTitleModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowTitleModal(false); }}
                >
                    <div
                        className="bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-[#27272A] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto flex flex-col text-zinc-900 dark:text-[#F4F4F5]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-[#27272A]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                                    <TagIcon className="w-4 h-4" />
                                </div>
                                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                    {t('tasks.createTitle', {}, 'Yeni Title Yarat')}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowTitleModal(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveTitle} className="p-5 space-y-4">
                            {titleError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
                                    {titleError}
                                </div>
                            )}

                            {titleSuccess && (
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                    <span>{t('tasks.titleCreatedSuccess', {}, 'Title uğurla yaradıldı')}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('tasks.titleNameLabel', {}, 'Title (Holdinq / Şirkət) Adı *')}
                                </label>
                                <input
                                    type="text"
                                    value={titleName}
                                    onChange={(e) => setTitleName(e.target.value)}
                                    placeholder={t('tasks.titleNamePlaceholder', {}, 'Məsələn: A Holdinq, X MMC...')}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-amber-500 font-medium transition-all"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('tasks.titleVoenLabel', {}, 'VÖEN')} <span className="text-[10px] text-zinc-400 font-normal">({t('tasks.optional', {}, 'İstəyə görə')})</span>
                                </label>
                                <input
                                    type="text"
                                    value={titleVoen}
                                    onChange={(e) => setTitleVoen(e.target.value)}
                                    placeholder={t('tasks.titleVoenPlaceholder', {}, 'Məs: 1234567890')}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-amber-500 font-medium transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA] mb-1.5">
                                    {t('tasks.titleDescLabel', {}, 'Təsvir')} <span className="text-[10px] text-zinc-400 font-normal">({t('tasks.optional', {}, 'İstəyə görə')})</span>
                                </label>
                                <textarea
                                    value={titleDesc}
                                    onChange={(e) => setTitleDesc(e.target.value)}
                                    placeholder={t('tasks.titleDescPlaceholder', {}, 'Holdinq, şirkət və ya MMC haqqında qeydlər...')}
                                    rows={3}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-amber-500 font-medium resize-none transition-all"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowTitleModal(false)}
                                    className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    {t('common.cancel', {}, 'İmtina')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingTitle || titleSuccess}
                                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {savingTitle && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    <span>{t('common.create', {}, 'Yarat')}</span>
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
                defaultTitleId={selectedTitleIdForView && selectedTitleIdForView !== 'unassigned' && selectedTitleIdForView !== 'all' ? selectedTitleIdForView : (project?.titleId ? String(project.titleId) : undefined)}
                defaultLevelId={defaultLevelForTask ? String(defaultLevelForTask) : undefined}
            />
        </div>
    );
};

export default ProjectDetail;
