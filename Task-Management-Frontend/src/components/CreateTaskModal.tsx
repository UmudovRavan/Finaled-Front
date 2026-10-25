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
    SparklesIcon,
    TagIcon,
} from '@heroicons/react/24/outline';
import { DifficultyLevel, Priority } from '../dto';
import type { UserResponse, DivisionDTO, ProjectDTO, ProjectLevelDTO, CompanyTitleDTO, WorkloadWarningDTO } from '../dto';
import { taskService, userService, divisionService, projectService, projectLevelService, titleService, workloadService, authService } from '../api';
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
    defaultTitleId?: string | number;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    isOpen,
    onClose,
    onTaskCreated,
    defaultDivisionId,
    defaultProjectId,
    defaultLevelId,
    defaultTitleId,
}) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>(Priority.Normal);
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Medium);
    const [deadline, setDeadline] = useState('');
    const [assignedUser, setAssignedUser] = useState<UserResponse | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 3 Analitik Bölgü (Title, Division, Project) + Mərhələ (Level)
    const [titles, setTitles] = useState<CompanyTitleDTO[]>([]);
    const [selectedTitleId, setSelectedTitleId] = useState<string>('');
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
            setPriority(Priority.Normal);
            setDifficulty(DifficultyLevel.Medium);
            setDeadline('');
            setAssignedUser(null);
            setFiles([]);
            setError(null);
            setAssignInputValue('');
            setShowSuggestions(false);
            setMentionQuery('');
            setWorkloadWarning(null);

            if (defaultTitleId) setSelectedTitleId(String(defaultTitleId));
            if (defaultDivisionId) setSelectedDivisionId(String(defaultDivisionId));
            if (defaultProjectId) setSelectedProjectId(String(defaultProjectId));
            if (defaultLevelId) setSelectedLevelId(String(defaultLevelId));
        }
    }, [isOpen, defaultTitleId, defaultDivisionId, defaultProjectId, defaultLevelId]);

    const fetchInitialData = async () => {
        try {
            const [usersData, divsData, titlesData, projsData] = await Promise.all([
                userService.getAllUsers().catch(() => []),
                divisionService.getAllDivisions().catch(() => []),
                titleService.getAllTitles().catch(() => []),
                projectService.getAllProjects().catch(() => []),
            ]);
            setAllUsers(usersData);
            setDivisions(divsData);
            setTitles(titlesData);
            setProjects(projsData);

            if (defaultProjectId) {
                const lvls = await projectLevelService.getLevelsByProject(defaultProjectId).catch(() => []);
                setLevels(lvls);
            }
        } catch (err) {
            console.error('Failed to load initial data in CreateTaskModal', err);
        }
    };

    // Filter projects dynamically based on Division and Title selection
    const filteredProjects = useMemo(() => {
        return projects.filter((p) => {
            if (selectedDivisionId && String(p.divisionId) !== String(selectedDivisionId)) {
                return false;
            }
            if (selectedTitleId && String(p.titleId) !== String(selectedTitleId)) {
                return false;
            }
            return true;
        });
    }, [projects, selectedDivisionId, selectedTitleId]);

    // When division changes, reset project if it no longer belongs
    const handleDivisionChange = (divId: string) => {
        setSelectedDivisionId(divId);
        if (selectedProjectId) {
            const prj = projects.find((p) => String(p.id) === String(selectedProjectId));
            if (prj && divId && String(prj.divisionId) !== String(divId)) {
                setSelectedProjectId('');
                setSelectedLevelId('');
                setLevels([]);
            }
        }
    };

    // When title changes, reset project if it no longer belongs
    const handleTitleChange = (titleId: string) => {
        setSelectedTitleId(titleId);
        if (selectedProjectId) {
            const prj = projects.find((p) => String(p.id) === String(selectedProjectId));
            if (prj && titleId && String(prj.titleId) !== String(titleId)) {
                setSelectedProjectId('');
                setSelectedLevelId('');
                setLevels([]);
            }
        }
    };

    // When project changes, auto-inherit division and title if not already set, and load levels
    const handleProjectChange = async (projId: string) => {
        setSelectedProjectId(projId);
        setSelectedLevelId('');
        if (projId) {
            const prj = projects.find((p) => String(p.id) === String(projId));
            if (prj) {
                if (prj.divisionId && !selectedDivisionId) {
                    setSelectedDivisionId(String(prj.divisionId));
                }
                if (prj.titleId && !selectedTitleId) {
                    setSelectedTitleId(String(prj.titleId));
                }
            }

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

        // TƏLƏB 2: Layihə mütləq seçilməlidir (Layihəsiz seçim qadağandır)
        if (!selectedProjectId && !defaultProjectId) {
            setError(t('tasks.projectRequiredError', {}, 'Tapşırıq mütləq bir layihəyə bağlanmalıdır. Zəhmət olmasa layihə seçin.'));
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

            const chosenProjectId = selectedProjectId || String(defaultProjectId);

            const createdTask = await taskService.createTask(
                {
                    title: title.trim(),
                    description: description.trim(),
                    difficulty: typeof difficulty === 'number' ? difficulty : DifficultyLevel.Medium,
                    priority: typeof priority === 'number' ? priority : 1,
                    status: assignedUser ? 1 : 0,
                    deadline: new Date(deadline).toISOString(),
                    assignedToUserId: assignedUser?.id || undefined,
                    titleId: selectedTitleId || undefined,
                    divisionId: selectedDivisionId || undefined,
                    projectId: chosenProjectId,
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-full max-w-2xl bg-white dark:bg-[#1E1E20] border border-zinc-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <SparklesIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                {t('tasks.createTask', {}, 'Yeni Tapşırıq Yarat')}
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-[#A1A1AA]">
                                {t('tasks.createSubtitle', {}, 'Tapşırığı müvafiq layihə, holdinq və şöbəyə bağlayın')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#2C2C2E] transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2.5 text-xs text-rose-600 dark:text-rose-400">
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
                            placeholder={t('tasks.titlePlaceholder', {}, 'Məs: Maliyyə audit hesabatının yekunlaşdırılması')}
                            className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium transition-all"
                            autoFocus
                            required
                        />
                    </div>

                    {/* 3 Analitik Bölgü + Mərhələ: Title (Holdinq), Division (Şöbə), Project (Layihə) *, Level */}
                    <div className="bg-zinc-50 dark:bg-[#222226] p-3.5 rounded-xl border border-zinc-200/80 dark:border-[#2C2C2E] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-[#A1A1AA]">
                                {t('tasks.classification', {}, 'Analitik Bölgülər və Layihə')}
                            </span>
                            <span className="text-[10px] text-rose-500 font-medium">
                                * {t('tasks.projectMandatory', {}, 'Layihə mütləqdir')}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {/* 1. Title (Holdinq / Şirkət) */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                    <TagIcon className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                                    {t('common.titleCompany', {}, 'Holdinq / MMC')}
                                </label>
                                <CustomSelect
                                    value={String(selectedTitleId)}
                                    onChange={handleTitleChange}
                                    options={[
                                        { value: '', label: t('tasks.allOrInherit', {}, 'Avtomatik / Hamısı') },
                                        ...titles.map((tItem) => ({
                                            value: String(tItem.id),
                                            label: tItem.name,
                                        })),
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            {/* 2. Division (Bölmə / Şöbə) */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                    <BuildingOfficeIcon className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                                    {t('common.department', {}, 'Şöbə')}
                                </label>
                                <CustomSelect
                                    value={String(selectedDivisionId)}
                                    onChange={handleDivisionChange}
                                    options={[
                                        { value: '', label: t('tasks.allOrInherit', {}, 'Avtomatik / Hamısı') },
                                        ...divisions.map((d) => ({
                                            value: String(d.id),
                                            label: d.name,
                                        })),
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            {/* 3. Project (Layihə) - REQUIRED */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-zinc-700 dark:text-white flex items-center gap-1">
                                    <FolderIcon className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                                    {t('projects.title', {}, 'Layihə')} *
                                </label>
                                <CustomSelect
                                    value={String(selectedProjectId)}
                                    onChange={handleProjectChange}
                                    options={[
                                        { value: '', label: t('tasks.selectProjectRequired', {}, 'Layihə seçin *') },
                                        ...filteredProjects.map((p) => ({
                                            value: String(p.id),
                                            label: p.name,
                                        })),
                                    ]}
                                    className="w-full"
                                />
                            </div>

                            {/* 4. Level (Mərhələ) */}
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

                    {/* Row: Çətinlik (Difficulty), Prioritet (Priority) & Deadline */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Çətinlik (Kvota üçün) */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">
                                {t('common.difficulty', {}, 'Çətinlik Dərəcəsi')}
                            </label>
                            <CustomSelect
                                value={String(difficulty)}
                                onChange={(val) => setDifficulty(Number(val) as DifficultyLevel)}
                                options={[
                                    { value: String(DifficultyLevel.Easy), label: 'Asan (10 bal)', icon: <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> },
                                    { value: String(DifficultyLevel.Medium), label: 'Orta (20 bal)', icon: <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> },
                                    { value: String(DifficultyLevel.Hard), label: 'Çətin (30 bal)', icon: <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> },
                                ]}
                                className="w-full"
                            />
                        </div>

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

                        {/* Workload Warning Notification (Kvota limiti aşıldıqda canlı bildiriş) */}
                        {workloadWarning && (workloadWarning.isWarning || workloadWarning.isOverloaded) && (
                            <div className="p-3 rounded-xl border text-xs flex items-start gap-2.5 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 animate-in fade-in">
                                <ShieldExclamationIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    <p className="font-semibold">{workloadWarning.warningMessage || workloadWarning.message}</p>
                                    <p className="text-[11px] opacity-80">
                                        Limit: Asan: {workloadWarning.easyTasksCount ?? 0}/10, Orta: {workloadWarning.mediumTasksCount ?? 0}/10, Çətin: {workloadWarning.hardTasksCount ?? 0}/10 (Cəmi: {workloadWarning.activeTaskCount}/30)
                                    </p>
                                </div>
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
                            <span className="text-xs text-zinc-400 dark:text-[#71717A]">
                                {files.length > 0 ? `${files.length} fayl seçildi` : t('tasks.noFilesSelected', {}, 'Fayl seçilməyib')}
                            </span>
                        </div>

                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {files.map((f, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46] text-[11px] text-zinc-700 dark:text-[#D4D4D8]"
                                    >
                                        <span className="truncate max-w-[150px]">{f.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="text-zinc-400 hover:text-rose-500"
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer / Buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-[#2C2C2E]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-[#A1A1AA] hover:bg-zinc-100 dark:hover:bg-[#2C2C2E] transition-colors"
                        >
                            {t('common.cancel', {}, 'Ləğv et')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>{t('common.saving', {}, 'Yaradılır...')}</span>
                                </>
                            ) : (
                                <span>{t('tasks.createButton', {}, 'Tapşırıq Yarat')}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
