import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    XMarkIcon,
    CalendarIcon,
    PaperClipIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { DifficultyLevel } from '../dto';
import type { UserResponse } from '../dto';
import { taskService, userService, authService } from '../api';
import { parseJwtToken } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import UserSuggestionList from './UserSuggestionList';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
    isOpen,
    onClose,
    onTaskCreated,
}) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Medium);
    const [deadline, setDeadline] = useState('');
    const [assignedUser, setAssignedUser] = useState<UserResponse | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mention logic state
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [suggestionIndex, setSuggestionIndex] = useState(0);

    const [assignInputValue, setAssignInputValue] = useState('');
    const assignInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setTitle('');
            setDescription('');
            setDifficulty(DifficultyLevel.Medium);
            setDeadline('');
            setAssignedUser(null);
            setFiles([]);
            setError(null);
            setAssignInputValue('');
            setShowSuggestions(false);
            setMentionQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const assignContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (assignContainerRef.current && !assignContainerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setAllUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!allUsers || allUsers.length === 0) {
            return [];
        }
        if (!mentionQuery || mentionQuery.trim().length === 0) {
            return allUsers;
        }
        const query = mentionQuery.toLowerCase().trim();
        return allUsers.filter(
            (u) =>
                u.userName?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query) ||
                u.role?.toLowerCase().includes(query)
        );
    }, [allUsers, mentionQuery]);

    const handleAssignInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAssignInputValue(value);

        if (assignedUser && value !== assignedUser.userName) {
            setAssignedUser(null);
        }

        const query = value.startsWith('@') ? value.substring(1) : value;
        setMentionQuery(query);
        setShowSuggestions(true);
        setSuggestionIndex(0);
    };

    const handleAssignInputFocus = () => {
        setShowSuggestions(true);
        setSuggestionIndex(0);
    };

    const handleSelectUser = (user: UserResponse) => {
        setAssignedUser(user);
        setAssignInputValue(user.userName || user.email || '');
        setShowSuggestions(false);
        setMentionQuery('');
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
            setError('Tapşırığın başlığı mütləqdir');
            return;
        }

        if (!deadline) {
            setError('İcra tarixi mütləqdir');
            return;
        }

        const selectedDate = new Date(deadline);
        const now = new Date();
        if (selectedDate <= now) {
            setError('İcra tarixi gələcək bir zaman olmalıdır');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = authService.getToken();
            const user = token ? parseJwtToken(token) : null;
            const createdByUserId = user?.userId || '';

            const createdTask = await taskService.createTask({
                title: title.trim(),
                description: description.trim(),
                difficulty: typeof difficulty === 'number' ? difficulty : 1,
                status: assignedUser ? 1 : 0,
                deadline: new Date(deadline).toISOString(),
                assignedToUserId: assignedUser?.id || undefined,
                createdByUserId,
                files: files.length > 0 ? files : undefined,
            }, files.length > 0 ? files : undefined);

            if (createdTask?.id && assignedUser?.id) {
                try {
                    await taskService.assignTask(createdTask.id, assignedUser.id);
                } catch {
                    // Task already created with AssignedToUserId, assignTask is optional confirmation
                }
            }

            onTaskCreated();
            onClose();
        } catch (err: any) {
            console.error('Task creation error details:', err?.response?.data || err);
            const serverMsg = err.response?.data?.message || err.response?.data?.Message || (typeof err.response?.data === 'string' ? err.response?.data : null);
            setError(serverMsg || err.message || 'Tapşırıq yaradılarkən xəta baş verdi');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
            <div
                className="w-full max-w-lg bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#F4F4F5]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2C2E]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <h2 className="text-sm font-bold text-white tracking-tight">{t('tasks.createTask', {}, 'Yeni Tapşırıq Yarat')}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#A1A1AA]">{t('tasks.taskTitle', {}, 'Tapşırıq Başlığı')} *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('tasks.taskTitle', {}, 'Tapşırıq Başlığı...')}
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
                            placeholder={t('tasks.taskDesc', {}, 'Tapşırıq haqqında ətraflı qeydlər...')}
                            rows={3}
                            className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl p-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium resize-none"
                        />
                    </div>

                    {/* Row: Difficulty & Deadline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Difficulty */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.difficulty', {}, 'Prioritet / Çətinlik')}</label>
                            <div className="relative flex items-center">
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(Number(e.target.value) as DifficultyLevel)}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 pr-8 font-medium"
                                >
                                    <option value={DifficultyLevel.Easy}>{t('difficulties.easy', {}, 'Aşağı (Asan)')}</option>
                                    <option value={DifficultyLevel.Medium}>{t('difficulties.medium', {}, 'Orta')}</option>
                                    <option value={DifficultyLevel.Hard}>{t('difficulties.hard', {}, 'Yüksək (Çətin)')}</option>
                                </select>
                                <ChevronDownIcon className="w-3.5 h-3.5 text-[#71717A] absolute right-3 pointer-events-none" />
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#A1A1AA]">{t('common.dueDate', {}, 'İcra Tarixi')} *</label>
                            <div className="relative flex items-center">
                                <input
                                    type="datetime-local"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignee Search / Mention */}
                    <div ref={assignContainerRef} className="space-y-1.5 relative">
                        <label className="text-xs font-semibold text-[#A1A1AA]">{t('tasks.assignedUser', {}, 'Təyin Edilən Şəxs')}</label>
                        <div className="relative flex items-center">
                            <input
                                ref={assignInputRef}
                                type="text"
                                value={assignInputValue}
                                onChange={handleAssignInputChange}
                                onFocus={handleAssignInputFocus}
                                onClick={handleAssignInputFocus}
                                onKeyDown={handleAssignKeyDown}
                                placeholder={t('common.search', {}, '@ istifadəçi axtarın və ya seçin...')}
                                className="w-full bg-[#27272A]/80 border border-[#3F3F46]/60 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 font-medium"
                            />
                            <UserIcon className="w-4 h-4 text-[#71717A] absolute left-3 pointer-events-none" />
                        </div>

                        {showSuggestions && filteredUsers.length > 0 && (
                            <UserSuggestionList
                                users={filteredUsers}
                                onSelect={handleSelectUser}
                                selectedIndex={suggestionIndex}
                            />
                        )}

                        {assignedUser && (
                            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400">
                                <span>{t('tasks.assignedUser', {}, 'Təyin edildi')}: <strong>{assignedUser.userName}</strong></span>
                            </div>
                        )}
                    </div>

                    {/* Attachments */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#A1A1AA]">{t('tasks.attachments', {}, 'Qoşma Fayllar')}</label>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] border border-[#3F3F46] text-xs font-medium text-white cursor-pointer transition-colors">
                                <PaperClipIcon className="w-4 h-4 text-[#A1A1AA]" />
                                <span>{t('tasks.uploadAttachment', {}, 'Fayl seçin')}</span>
                                <input type="file" multiple onChange={handleFileChange} className="hidden" />
                            </label>
                            <span className="text-[11px] text-[#71717A]">
                                {files.length > 0 ? `${files.length} ${t('tasks.attachments', {}, 'fayl seçildi')}` : t('common.optional', {}, 'İstəyə görə')}
                            </span>
                        </div>

                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#27272A] text-xs text-[#D4D4D8]">
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button type="button" onClick={() => removeFile(idx)} className="text-[#71717A] hover:text-rose-400">
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2C2C2E]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                        >
                            {t('common.cancel', {}, 'Ləğv et')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? t('common.loading', {}, 'Yaradılır...') : t('tasks.createTask', {}, 'Tapşırığı Yarat')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskModal;
