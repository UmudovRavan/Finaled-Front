import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { taskService, authService, notificationService, userService } from '../api';
import type { TaskResponse, NotificationResponse, UserResponse } from '../dto';
import { TaskStatus, DifficultyLevel } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import UserSuggestionList from '../components/UserSuggestionList';
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    UserIcon,
    CheckIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const TaskEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, language } = useLanguage();

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
    const [deadline, setDeadline] = useState('');
    const [assignedUser, setAssignedUser] = useState<UserResponse | null>(null);

    // Mention state
    const [assignInputValue, setAssignInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const assignInputRef = useRef<HTMLInputElement>(null);

    const displayName = useMemo(() => {
        if (!userInfo) return t('common.user', {}, 'İstifadəçi');
        if (userInfo.userName) {
            return userInfo.userName.charAt(0).toUpperCase() + userInfo.userName.slice(1);
        }
        if (userInfo.email) {
            return userInfo.email.split('@')[0];
        }
        return t('common.user', {}, 'İstifadəçi');
    }, [userInfo, t]);

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
                u.userName.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query)
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

            const [taskData, notificationsData, usersData] = await Promise.all([
                taskService.getTaskById(taskId).catch(() => null),
                notificationService.getMyNotifications().catch(() => []),
                userService.getAllUsers().catch(() => []),
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
        setAssignInputValue(user.userName || user.email || '');
        setShowSuggestions(false);
        setMentionQuery('');
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
                status,
                deadline: new Date(deadline).toISOString(),
                assignedToUserId: assignedUser?.id,
                createdByUserId: task.createdByUserId,
            });

            setSuccessMessage('Tapşırıq uğurla yeniləndi');
            setTimeout(() => {
                navigate(`/tasks/${task.id}`);
            }, 1200);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Tapşırığı yeniləmək mümkün olmadı');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !task) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header notificationCount={0} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-[#71717A] font-medium">Yüklənir...</p>
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

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
                    {/* Top Breadcrumb */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
                        <button
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>{t('common.back', {}, 'Geri')}</span>
                        </button>
                        <h1 className="text-base font-bold text-white tracking-tight">{t('tasks.editTask', {}, 'Tapşırığı Redaktə Et')}</h1>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-6 sm:p-8 shadow-xs">
                        {error && (
                            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                                <CheckIcon className="w-4 h-4 shrink-0" />
                                <span>{successMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#A1A1AA]">{t('tasks.taskTitle', {}, 'Tapşırıq Başlığı')} *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#A1A1AA]">{t('tasks.taskDesc', {}, 'Təsvir')}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl p-3.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium resize-none"
                                />
                            </div>

                            {/* Row: Status & Priority */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.status', {}, 'Status')}</label>
                                    <div className="relative flex items-center">
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(Number(e.target.value))}
                                            className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 pr-8 font-medium"
                                        >
                                            <option value={TaskStatus.Pending}>{t('statuses.pending', {}, 'Gözləmədə')}</option>
                                            <option value={TaskStatus.Assigned}>{t('statuses.assigned', {}, 'Təyin Edildi')}</option>
                                            <option value={TaskStatus.InProgress}>{t('statuses.inProgress', {}, 'İcrada')}</option>
                                            <option value={TaskStatus.UnderReview}>{t('statuses.review', {}, 'Nəzərdən keçirilir')}</option>
                                            <option value={TaskStatus.Completed}>{t('statuses.completed', {}, 'Tamamlandı')}</option>
                                            <option value={TaskStatus.Expired}>{t('common.overdue', {}, 'Gecikmiş')}</option>
                                        </select>
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.difficulty', {}, 'Prioritet / Çətinlik')}</label>
                                    <div className="relative flex items-center">
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(Number(e.target.value))}
                                            className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 pr-8 font-medium"
                                        >
                                            <option value={DifficultyLevel.Easy}>{t('difficulties.easy', {}, 'Aşağı (Asan)')}</option>
                                            <option value={DifficultyLevel.Medium}>{t('difficulties.medium', {}, 'Orta')}</option>
                                            <option value={DifficultyLevel.Hard}>{t('difficulties.hard', {}, 'Yüksək (Çətin)')}</option>
                                        </select>
                                        <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Row: Deadline & Assignee */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.dueDate', {}, 'İcra Tarixi')} *</label>
                                    <input
                                        type="datetime-local"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5 relative">
                                    <label className="text-xs font-semibold text-[#A1A1AA]">{t('tasks.assignedUser', {}, 'Təyin Edilən Şəxs')}</label>
                                    <div className="relative flex items-center">
                                        <input
                                            ref={assignInputRef}
                                            type="text"
                                            value={assignInputValue}
                                            onChange={handleAssignInputChange}
                                            placeholder={t('common.search', {}, '@ istifadəçi axtarın...')}
                                            className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                                        />
                                        <UserIcon className="w-4 h-4 text-[#71717A] absolute left-3 pointer-events-none" />
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

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white"
                                >
                                    {t('common.cancel', {}, 'Ləğv et')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {saving ? t('common.loading', {}, 'Yadda saxlanılır...') : t('common.save', {}, 'Dəyişiklikləri Saxla')}
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
