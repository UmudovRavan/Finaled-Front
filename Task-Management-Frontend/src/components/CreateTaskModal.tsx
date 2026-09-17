import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    XMarkIcon,
    CalendarIcon,
    PaperClipIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    UserIcon,
    BuildingOfficeIcon,
    FolderIcon,
    QueueListIcon,
    ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import { DifficultyLevel, Priority } from '../dto';
import type { UserResponse, DivisionDTO, ProjectDTO, ProjectLevelDTO, WorkloadWarningDTO } from '../dto';
import { taskService, userService, divisionService, projectService, projectLevelService, workloadService, authService } from '../api';
import { parseJwtToken } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import UserSuggestionList from './UserSuggestionList';
import CustomSelect, { type SelectOption } from './CustomSelect';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
    defaultDivisionId?: string | number;
    defaultProjectId?: string | number;
    defaultLevelId?: string | number;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    isOpen,
    onClose,
    onTaskCreated,
    defaultDivisionId,
    defaultProjectId,
    defaultLevelId,
}) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Medium);
    const [priority, setPriority] = useState<Priority>(Priority.Normal);
    const [deadline, setDeadline] = useState('');
    const [assignedUser, setAssignedUser] = useState<UserResponse | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hierarchy selection states
    const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [levels, setLevels] = useState<ProjectLevelDTO[]>([]);
    const [selectedLevelId, setSelectedLevelId] = useState<string>('');

    // Workload warning state
    const [workloadWarning, setWorkloadWarning] = useState<WorkloadWarningDTO | null>(null);

    // Mention logic state
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [suggestionIndex, setSuggestionIndex] = useState(0);

    const [assignInputValue, setAssignInputValue] = useState('');
    const assignInputRef = useRef<HTMLInputElement>(null);
    const assignContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            setTitle('');
            setDescription('');
            setDifficulty(DifficultyLevel.Medium);
            setPriority(Priority.Normal);
            setDeadline('');
            setAssignedUser(null);
            setFiles([]);
            setError(null);
            setAssignInputValue('');
            setShowSuggestions(false);
            setMentionQuery('');
            setWorkloadWarning(null);

            if (defaultDivisionId) setSelectedDivisionId(String(defaultDivisionId));
            if (defaultProjectId) setSelectedProjectId(String(defaultProjectId));
            if (defaultLevelId) setSelectedLevelId(String(defaultLevelId));
        }
    }, [isOpen, defaultDivisionId, defaultProjectId, defaultLevelId]);

    const fetchInitialData = async () => {
        try {
            const [usersData, divsData] = await Promise.all([
                userService.getAllUsers().catch(() => []),
                divisionService.getAllDivisions().catch(() => []),
            ]);
            setAllUsers(usersData);
            setDivisions(divsData);

            if (defaultDivisionId) {
                const projs = await projectService.getProjectsByDivision(defaultDivisionId).catch(() => []);
                setProjects(projs);
            } else if (divsData.length > 0) {
                const projs = await projectService.getAllProjects().catch(() => []);
                setProjects(projs);
            }

            if (defaultProjectId) {
                const lvls = await projectLevelService.getLevelsByProject(defaultProjectId).catch(() => []);
                setLevels(lvls);
            }
        } catch (err) {
            console.error('Failed to load initial data in CreateTaskModal', err);
        }
    };

    // When division changes, update projects
    const handleDivisionChange = async (divId: string) => {
        setSelectedDivisionId(divId);
        setSelectedProjectId('');
        setSelectedLevelId('');
        setLevels([]);
        if (divId) {
            try {
                const projs = await projectService.getProjectsByDivision(divId);
                setProjects(projs);
            } catch {
                setProjects([]);
            }
        } else {
            const projs = await projectService.getAllProjects().catch(() => []);
            setProjects(projs);
        }
    };

    // When project changes, update levels
    const handleProjectChange = async (projId: string) => {
        setSelectedProjectId(projId);
        setSelectedLevelId('');
        if (projId) {
            try {
                const lvls = await projectLevelService.getLevelsByProject(projId);
                setLevels(lvls);
            } catch {
                setLevels([]);
            }
        } else {
            setLevels([]);
        }
    };

    // Check workload when user is assigned
    const checkUserWorkload = async (userId: string) => {
        try {
            const warning = await workloadService.checkWorkloadWarning(userId);
            setWorkloadWarning(warning);
        } catch {
            setWorkloadWarning(null);
        }
    };

    // Click outside to close mention dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                assignContainerRef.current &&
                !assignContainerRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredUsers = useMemo(() => {
        if (!mentionQuery.trim()) return allUsers;
        const q = mentionQuery.toLowerCase();
        return allUsers.filter(
            (u) =>
                (u.userName && u.userName.toLowerCase().includes(q)) ||
                (u.email && u.email.toLowerCase().includes(q))
        );
    }, [allUsers, mentionQuery]);

    const handleAssignInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAssignInputValue(val);

        if (val.startsWith('@')) {
            setMentionQuery(val.slice(1));
        } else {
            setMentionQuery(val);
        }

        setShowSuggestions(true);
        setSuggestionIndex(0);

        if (!val.trim()) {
            setAssignedUser(null);
            setWorkloadWarning(null);
        }
    };

    const handleAssignInputFocus = () => {
        setShowSuggestions(true);
        setSuggestionIndex(0);
    };

    const handleSelectUser = (user: UserResponse) => {
        setAssignedUser(user);
        const isEmailUsername = !user.userName || user.userName.toLowerCase() === user.email?.toLowerCase();
        const displayName = isEmailUsername
            ? (user.email ? user.email.split('@')[0] : 'İstifadəçi')
            : user.userName;
        setAssignInputValue(displayName);
        setShowSuggestions(false);
        checkUserWorkload(user.id);
    };

    const handleAssignKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || filteredUsers.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSuggestionIndex((prev) => (prev < filteredUsers.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSuggestionIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredUsers[suggestionIndex]) {
                handleSelectUser(filteredUsers[suggestionIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError(t('tasks.titleRequiredError', {}, 'Tapşırığın başlığı mütləqdir'));
            return;
        }

        if (!deadline) {
            setError(t('tasks.deadlineRequiredError', {}, 'İcra tarixi mütləqdir'));
            return;
        }

        const selectedDate = new Date(deadline);
        const now = new Date();
        if (selectedDate <= now) {
            setError(t('tasks.deadlineFutureError', {}, 'İcra tarixi gələcək bir zaman olmalıdır'));
            return;
        }

        setIsSubmitting(true);

        try {
            const token = authService.getToken();
            const user = token ? parseJwtToken(token) : null;
            const createdByUserId = user?.userId || '';

            const createdTask = await taskService.createTask(
                {
                    title: title.trim(),
                    description: description.trim(),
                    difficulty: typeof difficulty === 'number' ? difficulty : 1,
                    priority: typeof priority === 'number' ? priority : 1,
                    status: assignedUser ? 1 : 0,
                    deadline: new Date(deadline).toISOString(),
                    assignedToUserId: assignedUser?.id || undefined,
                    divisionId: selectedDivisionId || undefined,
                    projectId: selectedProjectId || undefined,
                    levelId: selectedLevelId || undefined,
                    createdByUserId,
                    files: files.length > 0 ? files : undefined,
                },
                files.length > 0 ? files : undefined
            );

            if (createdTask?.id && assignedUser?.id) {
                try {
                    await taskService.assignTask(createdTask.id, assignedUser.id);
                } catch {
                    // Task already created with AssignedToUserId
                }
            }

            onTaskCreated();
            onClose();
        } catch (err: any) {
            console.error('Task creation error details:', err?.response?.data || err);
            const serverMsg = err.response?.data?.message || err.response?.data?.Message || (typeof err.response?.data === 'string' ? err.response?.data : null);
            setError(serverMsg || err.message || t('tasks.createError', {}, 'Tapşırıq yaradılarkən xəta baş verdi'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
            <div
                className="w-full max-w-xl bg-white dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-zinc-900 dark:text-[#F4F4F5]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                            {t('tasks.createNewTask', {}, 'Yeni Tapşırıq Yarat')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-[#71717A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                            {t('tasks.taskTitleRequired', {}, 'Tapşırıq Başlığı *')}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('tasks.titlePlaceholder', {}, 'Məsələn: API inteqrasiyasını tamamla...')}
                            className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium transition-all"
                            required
                        />
                    </div>

                    {/* Hierarchy: Division > Project > Level */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 dark:bg-[#222226] p-3 rounded-xl border border-zinc-200/80 dark:border-[#2C2C2E]">
                        {/* Division */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                <BuildingOfficeIcon className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                                {t('common.department', {}, 'Şöbə')}
                            </label>
                            <CustomSelect
                                value={String(selectedDivisionId)}
                                onChange={handleDivisionChange}
                                options={[
                                    { value: '', label: t('tasks.noDivision', {}, 'Şöbəsiz') },
                                    ...divisions.map((d) => ({
                                        value: String(d.id),
                                        label: d.name,
                                    })),
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* Project */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                <FolderIcon className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                                {t('projects.title', {}, 'Layihə')}
                            </label>
                            <CustomSelect
                                value={String(selectedProjectId)}
                                onChange={handleProjectChange}
                                options={[
                                    { value: '', label: t('tasks.noProject', {}, 'Layihəsiz') },
                                    ...projects.map((p) => ({
                                        value: String(p.id),
                                        label: p.name,
                                    })),
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* Level */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                <QueueListIcon className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                                {t('tasks.stage', {}, 'Mərhələ')}
                            </label>
                            <CustomSelect
                                value={String(selectedLevelId)}
                                onChange={setSelectedLevelId}
                                options={[
                                    { value: '', label: t('tasks.noStage', {}, 'Mərhələsiz') },
                                    ...levels.map((lvl) => ({
                                        value: String(lvl.id),
                                        label: lvl.name,
                                    })),
                                ]}
                                disabled={!selectedProjectId && levels.length === 0}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                            {t('common.description', {}, 'Təsvir')}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('tasks.descriptionPlaceholder', {}, 'Tapşırıq haqqında ətraflı qeydlər...')}
                            rows={3}
                            className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl p-3 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium resize-none transition-all"
                        />
                    </div>

                    {/* Row: Priority & Difficulty & Deadline */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Priority */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                                {t('common.priority', {}, 'Prioritet')}
                            </label>
                            <CustomSelect
                                value={String(priority)}
                                onChange={(val) => setPriority(Number(val) as Priority)}
                                options={[
                                    { value: String(Priority.Low), label: t('tasks.priorityLow', {}, 'Aşağı'), icon: <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" /> },
                                    { value: String(Priority.Normal), label: t('tasks.priorityNormal', {}, 'Normal'), icon: <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> },
                                    { value: String(Priority.High), label: t('tasks.priorityHigh', {}, 'Yüksək'), icon: <span className="text-xs">⚡</span> },
                                    { value: String(Priority.Urgent), label: t('tasks.priorityUrgent', {}, 'Təcili'), icon: <span className="text-xs">🔥</span> },
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                                {t('common.difficulty', {}, 'Çətinlik')}
                            </label>
                            <CustomSelect
                                value={String(difficulty)}
                                onChange={(val) => setDifficulty(Number(val) as DifficultyLevel)}
                                options={[
                                    { value: String(DifficultyLevel.Easy), label: t('tasks.difficultyEasy', {}, 'Asan (10 bal)'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">{t('tasks.pointsBadge', { count: 10 }, '10 bal')}</span> },
                                    { value: String(DifficultyLevel.Medium), label: t('tasks.difficultyMedium', {}, 'Orta (20 bal)'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">{t('tasks.pointsBadge', { count: 20 }, '20 bal')}</span> },
                                    { value: String(DifficultyLevel.Hard), label: t('tasks.difficultyHard', {}, 'Çətin (30 bal)'), badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">{t('tasks.pointsBadge', { count: 30 }, '30 bal')}</span> },
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* Deadline */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                                {t('tasks.deadlineRequired', {}, 'İcra Tarixi *')}
                            </label>
                            <input
                                type="datetime-local"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-2.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Assignee Search / Mention */}
                    <div ref={assignContainerRef} className="space-y-1.5 relative">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                            {t('tasks.assignedUser', {}, 'Təyin Edilən Şəxs')}
                        </label>
                        <div className="relative flex items-center">
                            <input
                                ref={assignInputRef}
                                type="text"
                                value={assignInputValue}
                                onChange={handleAssignInputChange}
                                onFocus={handleAssignInputFocus}
                                onClick={handleAssignInputFocus}
                                onKeyDown={handleAssignKeyDown}
                                placeholder={t('tasks.assigneePlaceholder', {}, '@ istifadəçi axtarın və ya seçin...')}
                                className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium transition-all"
                            />
                            <UserIcon className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 pointer-events-none" />
                        </div>

                        {showSuggestions && filteredUsers.length > 0 && (
                            <UserSuggestionList
                                users={filteredUsers}
                                onSelect={handleSelectUser}
                                selectedIndex={suggestionIndex}
                            />
                        )}

                        {/* Workload Warning Notification */}
                        {workloadWarning && (
                            <div
                                className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                                    workloadWarning.isOverloaded
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
                                        : workloadWarning.warningLevel === 'warning'
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
                                }`}
                            >
                                {workloadWarning.isOverloaded ? (
                                    <ShieldExclamationIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                                ) : (
                                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                )}
                                <span>
                                    {assignedUser?.userName || t('tasks.thisUser', {}, 'Bu istifadəçi')} {t('tasks.activeTasksOnUser', {}, 'üzərində')}{' '}
                                    <strong>{t('tasks.activeTasksCountLabel', { count: workloadWarning.activeTaskCount }, `${workloadWarning.activeTaskCount} aktiv tapşırıq`)}</strong>.{' '}
                                    {workloadWarning.isOverloaded && t('tasks.overloadWarning', {}, '(Həddindən artıq yüklənmə tövsiyə edilmir!)')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                            {t('tasks.attachments', {}, 'Qoşma Fayllar')}
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] border border-zinc-200 dark:border-[#3F3F46] text-xs font-medium text-zinc-800 dark:text-white cursor-pointer transition-colors">
                                <PaperClipIcon className="w-4 h-4 text-zinc-500 dark:text-[#A1A1AA]" />
                                <span>{t('tasks.selectFile', {}, 'Fayl seçin')}</span>
                                <input type="file" multiple onChange={handleFileChange} className="hidden" />
                            </label>
                            <span className="text-[11px] text-zinc-500 dark:text-[#71717A]">
                                {files.length > 0
                                    ? t('tasks.filesSelected', { count: files.length }, `${files.length} fayl seçildi`)
                                    : t('tasks.optional', {}, 'İstəyə görə')}
                            </span>
                        </div>

                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#27272A] text-xs text-zinc-800 dark:text-[#D4D4D8] border border-zinc-200 dark:border-transparent">
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button type="button" onClick={() => removeFile(idx)} className="text-zinc-400 hover:text-rose-500 cursor-pointer">
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-[#2C2C2E]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-semibold text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            {t('common.cancel', {}, 'İmtina')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            <span>{isSubmitting ? t('tasks.creating', {}, 'Yaradılır...') : t('tasks.createTaskButton', {}, 'Tapşırığı Yarat')}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
