import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { taskService, authService, notificationService, userService, divisionService, projectService, projectLevelService } from '../api';
import type { TaskResponse, NotificationResponse, UserResponse, DivisionDTO, ProjectDTO, ProjectLevelDTO } from '../dto';
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
    QueueListIcon,
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
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<number>(TaskStatus.Pending);
    const [difficulty, setDifficulty] = useState<number>(DifficultyLevel.Medium);
    const [priority, setPriority] = useState<number>(Priority.Normal);
    const [deadline, setDeadline] = useState('');
    const [assignedUser, setAssignedUser] = useState<UserResponse | null>(null);

    // Hierarchy states
    const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
    const [selectedDivisionId, setSelectedDivisionId] = useState<string>('');
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [levels, setLevels] = useState<ProjectLevelDTO[]>([]);
    const [selectedLevelId, setSelectedLevelId] = useState<string>('');

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
        if (!mentionQuery || mentionQuery.trim().length === 0) {
            return [];
        }
        const employees = allUsers.filter(u => u.role?.toLowerCase() === 'employee' || !u.role);
        const query = mentionQuery.toLowerCase();
        return employees.filter(
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

            const [taskData, notificationsData, usersData, divsData] = await Promise.all([
                taskService.getTaskById(taskId).catch(() => null),
                notificationService.getMyNotifications().catch(() => []),
                userService.getAllUsers().catch(() => []),
                divisionService.getAllDivisions().catch(() => []),
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

            if (taskData.divisionId) {
                setSelectedDivisionId(String(taskData.divisionId));
                const projs = await projectService.getProjectsByDivision(taskData.divisionId).catch(() => []);
                setProjects(projs);
            } else {
                const projs = await projectService.getAllProjects().catch(() => []);
                setProjects(projs);
            }

            if (taskData.projectId) {
                setSelectedProjectId(String(taskData.projectId));
                const lvls = await projectLevelService.getLevelsByProject(taskData.projectId).catch(() => []);
                setLevels(lvls);
            }

            if (taskData.levelId) {
                setSelectedLevelId(String(taskData.levelId));
            }

            if (taskData.deadline) {
                const date = new Date(taskData.deadline);
                const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                setDeadline(localISO);
            }

            if (taskData.assignedToUserId && usersData.length > 0) {
                const assigned = usersData.find((u) => u.id === taskData.assignedToUserId);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;

        setError(null);
        setSuccessMessage(null);

        if (!title.trim()) {
            setError('Tapşırıq başlığı mütləqdir');
            return;
        }

        if (!deadline) {
            setError('İcra tarixi mütləqdir');
            return;
        }

        setSaving(true);
        try {
            await taskService.updateTask({
                id: task.id,
                title: title.trim(),
                description: description.trim(),
                difficulty,
                priority,
                divisionId: selectedDivisionId || undefined,
                projectId: selectedProjectId || undefined,
                levelId: selectedLevelId || undefined,
                status,
                deadline: new Date(deadline).toISOString(),
                assignedToUserId: assignedUser?.id,
                createdByUserId: task.createdByUserId,
                files: selectedFiles.length > 0 ? selectedFiles : undefined,
            });

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
                        <h1 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">Tapşırığı Redaktə Et</h1>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-6 sm:p-8 shadow-xs">
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

                            {/* Hierarchy: Division > Project > Level */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-50 dark:bg-[#222226] p-3.5 rounded-xl border border-zinc-200/80 dark:border-[#2C2C2E]">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                        <BuildingOfficeIcon className="w-3 h-3 text-sky-500 dark:text-sky-400" />
                                        Şöbə
                                    </label>
                                    <CustomSelect
                                        value={String(selectedDivisionId)}
                                        onChange={handleDivisionChange}
                                        options={[
                                            { value: '', label: 'Şöbəsiz' },
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
                                        <FolderIcon className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                                        Layihə
                                    </label>
                                    <CustomSelect
                                        value={String(selectedProjectId)}
                                        onChange={handleProjectChange}
                                        options={[
                                            { value: '', label: 'Layihəsiz' },
                                            ...projects.map((p) => ({
                                                value: String(p.id),
                                                label: p.name,
                                            })),
                                        ]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-[#A1A1AA] flex items-center gap-1">
                                        <QueueListIcon className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                                        Mərhələ
                                    </label>
                                    <CustomSelect
                                        value={String(selectedLevelId)}
                                        onChange={setSelectedLevelId}
                                        options={[
                                            { value: '', label: 'Mərhələsiz' },
                                            ...levels.map((lvl) => ({
                                                value: String(lvl.id),
                                                label: lvl.name,
                                            })),
                                        ]}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">Təsvir</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl p-3.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium resize-none"
                                />
                            </div>

                            {/* Row: Status, Priority & Difficulty */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">Status</label>
                                    <CustomSelect
                                        value={String(status)}
                                        onChange={(val) => setStatus(Number(val))}
                                        options={[
                                            { value: String(TaskStatus.Pending), label: 'Gözləmədə', icon: <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> },
                                            { value: String(TaskStatus.Assigned), label: 'Təyin Edildi', icon: <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> },
                                            { value: String(TaskStatus.InProgress), label: 'İcrada', icon: <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> },
                                            { value: String(TaskStatus.UnderReview), label: 'Nəzərdən keçirilir', icon: <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> },
                                            { value: String(TaskStatus.Completed), label: 'Tamamlandı', icon: <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> },
                                            { value: String(TaskStatus.Expired), label: 'Gecikmiş', icon: <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> },
                                        ]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">Prioritet</label>
                                    <CustomSelect
                                        value={String(priority)}
                                        onChange={(val) => setPriority(Number(val))}
                                        options={[
                                            { value: String(Priority.Low), label: 'Aşağı', icon: <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" /> },
                                            { value: String(Priority.Normal), label: 'Normal', icon: <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> },
                                            { value: String(Priority.High), label: 'Yüksək', icon: <span className="text-xs">⚡</span> },
                                            { value: String(Priority.Urgent), label: 'Təcili', icon: <span className="text-xs">🔥</span> },
                                        ]}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">Çətinlik</label>
                                    <CustomSelect
                                        value={String(difficulty)}
                                        onChange={(val) => setDifficulty(Number(val))}
                                        options={[
                                            { value: String(DifficultyLevel.Easy), label: 'Asan (10 bal)', badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">10 bal</span> },
                                            { value: String(DifficultyLevel.Medium), label: 'Orta (20 bal)', badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">20 bal</span> },
                                            { value: String(DifficultyLevel.Hard), label: 'Çətin (30 bal)', badge: <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">30 bal</span> },
                                        ]}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Row: Deadline & Assignee */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">İcra Tarixi *</label>
                                    <input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-semibold text-zinc-700 dark:text-[#A1A1AA]">Təyin Edilən Şəxs</label>
                                    <div className="relative flex items-center">
                                        <input
                                            ref={assignInputRef}
                                            type="text"
                                            value={assignInputValue}
                                            onChange={handleAssignInputChange}
                                            placeholder="@ istifadəçi axtarın..."
                                            className="w-full bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                        />
                                        <UserIcon className="w-4 h-4 text-zinc-400 dark:text-[#71717A] absolute left-3 pointer-events-none" />
                                    </div>

                                    {showSuggestions && (
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
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-white"
                                >
                                    Ləğv et
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? 'Yadda saxlanılır...' : 'Dəyişiklikləri Saxla'}
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
