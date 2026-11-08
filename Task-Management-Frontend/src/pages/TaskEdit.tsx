import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { taskService, authService, notificationService, userService, divisionService, projectService, titleService } from '../api';
import type { TaskResponse, NotificationResponse, UserResponse, DivisionDTO, ProjectDTO, TitleDTO } from '../dto';
import { TaskStatus, DifficultyLevel, Priority } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import UserSuggestionList from '../components/UserSuggestionList';
import CustomSelect, { type SelectOption } from '../components/CustomSelect';
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    UserIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    PaperClipIcon,
    XMarkIcon,
    BuildingOfficeIcon,
    FolderIcon,
    TagIcon,
} from '@heroicons/react/24/outline';

const TaskEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [task, setTask] = useState<TaskResponse | null>(null);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isDraftTask = useMemo(() => {
        return Boolean(task && (Number(task.status) === TaskStatus.Draft || task.isDraft));
    }, [task]);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<number>(TaskStatus.Pending);
    const [difficulty, setDifficulty] = useState<number>(DifficultyLevel.Medium);
    const [priority, setPriority] = useState<number>(Priority.Normal);
    const [startDate, setStartDate] = useState('');
    const [deadline, setDeadline] = useState('');
    const [assignedUser, setAssignedUser] = useState<UserResponse | null>(null);

    // Hierarchy states: Şöbə -> Layihə -> Title
    const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [titles, setTitles] = useState<TitleDTO[]>([]);
    const [selectedTitleId, setSelectedTitleId] = useState<string>('');
    const [preservedLevelId, setPreservedLevelId] = useState<string>('');

    // File upload state
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mention state
    const [assignInputValue, setAssignInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const assignInputRef = useRef<HTMLInputElement>(null);

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

    const filteredUsers = useMemo(() => {
        const employees = allUsers.filter(u => u.role?.toLowerCase() === 'employee' || !u.role);
        const pool = employees.length > 0 ? employees : allUsers;
        if (!mentionQuery || mentionQuery.trim().length === 0) {
            return pool;
        }
        const query = mentionQuery.toLowerCase();
        return pool.filter(
            (u) =>
                u.userName?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query)
        );
    }, [allUsers, mentionQuery]);

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
    }, [navigate, id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const taskId = String(id || '').trim();
            if (!taskId) {
                navigate('/tasks');
                return;
            }

            const [taskData, notificationsData, usersData, divsData, titlesData, projsData] = await Promise.all([
                taskService.getTaskById(taskId).catch(() => null),
                notificationService.getMyNotifications().catch(() => []),
                userService.getAllUsers().catch(() => []),
                divisionService.getAllDivisions().catch(() => []),
                titleService.getAllTitles().catch(() => []),
                projectService.getAllProjects().catch(() => []),
            ]);

            if (!taskData) {
                navigate('/tasks');
                return;
            }

            setTask(taskData);
            setTitle(taskData.title);
            setDescription(taskData.description || '');
            setStatus(taskData.status);
            setDifficulty(taskData.difficulty || DifficultyLevel.Medium);
            setPriority(typeof taskData.priority === 'number' ? taskData.priority : Priority.Normal);
            setDivisions(divsData);
            setTitles(titlesData);
            setProjects(projsData);

            if (taskData.titleId) {
                setSelectedTitleId(String(taskData.titleId));
            }
            if (taskData.levelId) {
                setPreservedLevelId(String(taskData.levelId));
            }
            if (taskData.divisionId) {
                setSelectedDivisionId(String(taskData.divisionId));
            }
            if (taskData.projectId) {
                setSelectedProjectId(String(taskData.projectId));
            }

            if (taskData.startDate && !String(taskData.startDate).startsWith('0001-01-01')) {
                const sDate = new Date(taskData.startDate);
                if (!isNaN(sDate.getTime())) {
                    const sLocalISO = new Date(sDate.getTime() - sDate.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                    setStartDate(sLocalISO);
                }
            }

            if (taskData.deadline && !String(taskData.deadline).startsWith('0001-01-01')) {
                const date = new Date(taskData.deadline);
                if (!isNaN(date.getTime())) {
                    const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                    setDeadline(localISO);
                }
            }

            if (taskData.assignedToUserId && usersData.length > 0) {
                const assigned = usersData.find(
                    (u) => String(u.id).toLowerCase() === String(taskData.assignedToUserId).toLowerCase()
                );
                if (assigned) {
                    setAssignedUser(assigned);
                    setAssignInputValue(assigned.userName);
                }
            }

            setNotifications(notificationsData);
            setAllUsers(usersData);
        } catch {
            navigate('/tasks');
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = useMemo(() => {
        const matched = projects.filter((p) => {
            if (selectedProjectId && String(p.id).toLowerCase() === String(selectedProjectId).toLowerCase()) {
                return true;
            }
            if (
                selectedDivisionId &&
                p.divisionId &&
                String(p.divisionId).toLowerCase() !== String(selectedDivisionId).toLowerCase()
            ) {
                return false;
            }
            if (
                selectedTitleId &&
                p.titleId &&
                String(p.titleId).toLowerCase() !== String(selectedTitleId).toLowerCase()
            ) {
                return false;
            }
            return true;
        });
        return matched.length > 0 ? matched : projects;
    }, [projects, selectedDivisionId, selectedTitleId, selectedProjectId]);

    const handleDivisionChange = (divId: string) => {
        setSelectedDivisionId(divId);
    };

    const handleTitleChange = (titleId: string) => {
        setSelectedTitleId(titleId);
    };

    const handleProjectChange = (projId: string) => {
        setSelectedProjectId(projId);
        if (projId) {
            const foundProject = projects.find((p) => String(p.id).toLowerCase() === String(projId).toLowerCase());
            if (foundProject) {
                if (!selectedDivisionId && foundProject.divisionId) {
                    setSelectedDivisionId(String(foundProject.divisionId));
                }
                if (!selectedTitleId && foundProject.titleId) {
                    setSelectedTitleId(String(foundProject.titleId));
                }
            }
        }
    };

    const handleAssignInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAssignInputValue(value);

        if (assignedUser && value !== assignedUser.userName) {
            setAssignedUser(null);
        }

        if (value.startsWith('@')) {
            const query = value.substring(1);
            setMentionQuery(query);
            setShowSuggestions(true);
            setSuggestionIndex(0);
        } else if (value.trim().length > 0) {
            setMentionQuery(value);
            setShowSuggestions(true);
            setSuggestionIndex(0);
        } else {
            setShowSuggestions(false);
            setMentionQuery('');
        }
    };

    const handleSelectUser = (user: UserResponse) => {
        setAssignedUser(user);
        const isEmailUsername = !user.userName || user.userName.toLowerCase() === user.email?.toLowerCase();
        const displayName = isEmailUsername
            ? (user.email ? user.email.split('@')[0] : 'İstifadəçi')
            : user.userName;
        setAssignInputValue(displayName);
        setShowSuggestions(false);
        setMentionQuery('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles((prev) => {
            const existing = new Set(prev.map((f) => f.name + f.size));
            return [...prev, ...files.filter((f) => !existing.has(f.name + f.size))];
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveAsDraft = async () => {
        if (!task) return;
        setError(null);
        setSuccessMessage(null);
        setSavingDraft(true);
        try {
            await taskService.updateTask({
                id: task.id,
                title: title.trim() || 'Adsız Qaralama Tapşırıq',
                description: description.trim(),
                difficulty,
                priority,
                divisionId: selectedDivisionId || undefined,
                projectId: selectedProjectId || undefined,
                titleId: selectedTitleId || undefined,
                levelId: preservedLevelId || undefined,
                status: TaskStatus.Draft,
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
                assignedToUserId: assignedUser?.id,
                createdByUserId: task.createdByUserId || userInfo?.userId || '',
                files: selectedFiles.length > 0 ? selectedFiles : undefined,
            });
            setSuccessMessage(t('tasks.draftSavedSuccess', {}, 'Qaralama yadda saxlanıldı'));
            setTimeout(() => {
                navigate('/tasks');
            }, 800);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Qaralamanı saxlamaq mümkün olmadı');
        } finally {
            setSavingDraft(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;

        setError(null);
        setSuccessMessage(null);

        if (!title.trim()) {
            setError(t('tasks.titleRequiredError', {}, 'Tapşırıq başlığı mütləqdir'));
            return;
        }

        if (!selectedProjectId || selectedProjectId.trim() === '') {
            setError(t('tasks.projectRequired', {}, 'Tapşırıq mütləq bir layihəyə bağlanmalıdır. Layihəsiz seçim mümkün deyil.'));
            return;
        }

        if (!deadline) {
            setError(t('tasks.deadlineRequiredError', {}, 'İcra tarixi mütləqdir'));
            return;
        }

        setSaving(true);
        try {
            if (isDraftTask) {
                // Convert draft directly into an active task without user needing to touch Status
                await taskService.publishDraftTask(
                    task.id,
                    {
                        title: title.trim(),
                        description: description.trim(),
                        difficulty,
                        priority,
                        divisionId: selectedDivisionId || undefined,
                        projectId: selectedProjectId,
                        titleId: selectedTitleId || undefined,
                        levelId: preservedLevelId || undefined,
                        startDate: startDate ? new Date(startDate).toISOString() : undefined,
                        deadline: new Date(deadline).toISOString(),
                        assignedToUserId: assignedUser?.id,
                        assignedToUserIds: assignedUser?.id ? [assignedUser.id] : undefined,
                        createdByUserId: task.createdByUserId || userInfo?.userId || '',
                        files: selectedFiles.length > 0 ? selectedFiles : undefined,
                    },
                    selectedFiles.length > 0 ? selectedFiles : undefined
                );

                setSuccessMessage(t('tasks.taskCreatedSuccess', {}, 'Tapşırıq uğurla yaradıldı!'));
                setTimeout(() => {
                    navigate('/tasks');
                }, 800);
                return;
            }

            const effectiveStatus =
                status === TaskStatus.Draft
                    ? assignedUser
                        ? TaskStatus.Assigned
                        : TaskStatus.Pending
                    : assignedUser && status === TaskStatus.Pending
                      ? TaskStatus.Assigned
                      : status;

            await taskService.updateTask({
                id: task.id,
                title: title.trim(),
                description: description.trim(),
                difficulty,
                priority,
                divisionId: selectedDivisionId || undefined,
                projectId: selectedProjectId,
                titleId: selectedTitleId || undefined,
                levelId: preservedLevelId || undefined,
                status: effectiveStatus,
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
                assignedToUserId: assignedUser?.id,
                createdByUserId: task.createdByUserId || userInfo?.userId || '',
                files: selectedFiles.length > 0 ? selectedFiles : undefined,
            });

            if (assignedUser?.id && assignedUser.id !== task.assignedToUserId) {
                await taskService.assignTask(task.id, assignedUser.id).catch(() => {});
            }

            setSuccessMessage('Tapşırıq uğurla yeniləndi');
            setTimeout(() => {
                navigate(`/tasks/${task.id}`);
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Tapşırığı yeniləmək mümkün olmadı');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !task) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#121214] font-sans antialiased text-zinc-900 dark:text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header notificationCount={0} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-zinc-500 dark:text-[#71717A] font-medium">Yüklənir...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#121214] font-sans antialiased text-zinc-900 dark:text-[#F4F4F5] selection:bg-fuchsia-500/30">
            <Sidebar userRole={userRole} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-zinc-50 dark:bg-[#121214] scroll-smooth">
                <Header
                    userName={displayName}
                    userRole={userRole}
                    userEmail={userInfo?.email}
                    userAvatar={avatarSrc}
                    notificationCount={notifications.filter((n) => !n.isRead).length}
                />

                <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8 md:pb-8 space-y-6 max-w-4xl mx-auto w-full">
                    {/* Top Breadcrumb */}
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-[#27272A]">
                        <button
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#18181B] hover:bg-zinc-100 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#27272A] text-xs font-semibold text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Geri</span>
                        </button>
                        <div className="flex items-center gap-2">
                            {isDraftTask && (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    📝 Qaralama
                                </span>
                            )}
                            <h1 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                                {isDraftTask ? 'Qaralamanı Tamamla və Yarat' : 'Tapşırığı Redaktə Et'}
                            </h1>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-6 sm:p-8 shadow-xs">
                        {isDraftTask && (
                            <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 rounded-xl text-xs flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base shrink-0">📝</span>
                                    <span>
                                        Məlumatları tamamlayıb birbaşa <strong>«Tapşırığı Yarat»</strong> düyməsinə klikləyin. Status təyinata uyğun avtomatik seçiləcək.
                                    </span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                                <CheckIcon className="w-4 h-4 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">Başlıq *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                                    required
                                />
                            </div>

                            {/* Hierarchy: Division > Project > Title */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 dark:bg-[#222226] p-3.5 rounded-xl border border-zinc-200/80 dark:border-[#2C2C2E]">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                        <BuildingOfficeIcon className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                                        {t('common.department', {}, 'Şöbə')}
                                    </label>
                                    <CustomSelect
                                        value={String(selectedDivisionId)}
                                        onChange={handleDivisionChange}
                                        options={[
                                            { value: '', label: t('tasks.noDivision', {}, 'Hamısı / Avtomatik') },
                                            ...divisions.map((d) => ({
                                                value: String(d.id),
                                                label: d.name,
                                            })),
                                        ]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                        <FolderIcon className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                                        <span>{t('common.project', {}, 'Layihə')} <span className="text-rose-500">*</span></span>
                                    </label>
                                    <CustomSelect
                                        value={String(selectedProjectId)}
                                        onChange={handleProjectChange}
                                        options={[
                                            { value: '', label: t('tasks.selectProject', {}, 'Layihə seçin *') },
                                            ...filteredProjects.map((p) => ({
                                                value: String(p.id),
                                                label: p.name,
                                            })),
                                        ]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                        <TagIcon className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                                        {t('tasks.titleDimension', {}, 'Title (Holdinq / MMC)')}
                                    </label>
                                    <CustomSelect
                                        value={String(selectedTitleId)}
                                        onChange={handleTitleChange}
                                        options={[
                                            { value: '', label: t('tasks.titleAuto', {}, 'Avtomatik / Bütün Title-lar') },
                                            ...titles.map((tl) => ({
                                                value: String(tl.id),
                                                label: tl.name,
                                            })),
                                        ]}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">{t('common.description', {}, 'Təsvir')}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl p-3.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium resize-none"
                                />
                            </div>

                            {/* Row: Status (hidden for Drafts), Priority & Difficulty */}
                            <div className={`grid grid-cols-1 ${isDraftTask ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-4`}>
                                {!isDraftTask && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">{t('common.status', {}, 'Status')}</label>
                                        <CustomSelect
                                            value={String(status)}
                                            onChange={(val) => setStatus(Number(val))}
                                            options={[
                                                { value: String(TaskStatus.Pending), label: t('statuses.pending', {}, 'Gözləmədə'), icon: <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> },
                                                { value: String(TaskStatus.Assigned), label: t('statuses.assigned', {}, 'Təyin Edildi'), icon: <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> },
                                                { value: String(TaskStatus.InProgress), label: t('statuses.inProgress', {}, 'İcrada'), icon: <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> },
                                                { value: String(TaskStatus.UnderReview), label: t('statuses.review', {}, 'Nəzərdən keçirilir'), icon: <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> },
                                                { value: String(TaskStatus.Completed), label: t('statuses.completed', {}, 'Tamamlandı'), icon: <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> },
                                                { value: String(TaskStatus.Expired), label: t('common.overdue', {}, 'Gecikmiş'), icon: <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> },
                                            ]}
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">{t('common.priority', {}, 'Prioritet')}</label>
                                    <CustomSelect
                                        value={String(priority)}
                                        onChange={(val) => setPriority(Number(val))}
                                        options={[
                                            { value: String(Priority.Low), label: t('priorities.low', {}, 'Aşağı'), icon: <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" /> },
                                            { value: String(Priority.Normal), label: t('priorities.medium', {}, 'Normal'), icon: <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> },
                                            { value: String(Priority.High), label: t('priorities.high', {}, 'Yüksək'), icon: <span className="text-xs">⚡</span> },
                                            { value: String(Priority.Urgent), label: t('priorities.urgent', {}, 'Təcili'), icon: <span className="text-xs">🔥</span> },
                                        ]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">{t('tasks.difficultyLabel', {}, 'Çətinlik')}</label>
                                    <CustomSelect
                                        value={String(difficulty)}
                                        onChange={(val) => setDifficulty(Number(val))}
                                        options={[
                                            { value: String(DifficultyLevel.Easy), label: t('tasks.difficultyEasy', {}, 'Asan (10 bal)'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">10 bal</span> },
                                            { value: String(DifficultyLevel.Medium), label: t('tasks.difficultyMedium', {}, 'Orta (20 bal)'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">20 bal</span> },
                                            { value: String(DifficultyLevel.Hard), label: t('tasks.difficultyHard', {}, 'Çətin (30 bal)'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">30 bal</span> },
                                        ]}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Row: StartDate, Deadline & Assignee */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">{t('tasks.startDate', {}, 'Başlama Tarixi')}</label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">{t('tasks.deadlineRequired', {}, 'İcra Tarixi *')}</label>
                                    <input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">{t('common.assignedTo', {}, 'Təyin Edilən Şəxs')}</label>
                                    <div className="relative flex items-center">
                                        <input
                                            ref={assignInputRef}
                                            type="text"
                                            value={assignInputValue}
                                            onChange={handleAssignInputChange}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
                                            placeholder="@ istifadəçi axtarın..."
                                            className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl pl-9 pr-8 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                        />
                                        <UserIcon className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 pointer-events-none" />
                                        {assignInputValue && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAssignedUser(null);
                                                    setAssignInputValue('');
                                                    setMentionQuery('');
                                                }}
                                                className="absolute right-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
                                            >
                                                <XMarkIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {showSuggestions && filteredUsers.length > 0 && (
                                        <UserSuggestionList
                                            users={filteredUsers}
                                            onSelect={handleSelectUser}
                                            selectedIndex={suggestionIndex}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">Fayl Əlavə Et</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border border-dashed border-zinc-300 dark:border-[#3F3F46]/60 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs text-zinc-500 dark:text-[#71717A] hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors cursor-pointer"
                                >
                                    <PaperClipIcon className="w-4 h-4 shrink-0" />
                                    <span>Faylları seçin və ya bura sürükləyin</span>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileChange}
                                />

                                {selectedFiles.length > 0 && (
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        {selectedFiles.map((file, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-[#27272A]/60 border border-zinc-200 dark:border-[#3F3F46]/40"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <PaperClipIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                                                    <span className="text-xs text-zinc-800 dark:text-[#D4D4D8] truncate">{file.name}</span>
                                                    <span className="text-[10px] text-zinc-400 dark:text-[#71717A] shrink-0">
                                                        ({(file.size / 1024).toFixed(1)} KB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    className="ml-2 text-zinc-400 dark:text-[#71717A] hover:text-red-500 transition-colors cursor-pointer"
                                                >
                                                    <XMarkIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                                >
                                    Ləğv et
                                </button>
                                {isDraftTask && (
                                    <button
                                        type="button"
                                        onClick={handleSaveAsDraft}
                                        disabled={saving || savingDraft}
                                        className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {savingDraft ? 'Saxlanılır...' : t('tasks.saveAsDraft', {}, 'Qaralama kimi saxla')}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={saving || savingDraft}
                                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <CheckIcon className="w-4 h-4" />
                                    <span>
                                        {saving
                                            ? isDraftTask
                                                ? 'Tapşırıq yaradılır...'
                                                : 'Yadda saxlanılır...'
                                            : isDraftTask
                                              ? t('tasks.createTaskAction', {}, 'Tapşırığı Yarat')
                                              : 'Dəyişiklikləri Saxla'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TaskEdit;
