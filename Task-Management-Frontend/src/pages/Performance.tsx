import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import KpiCard from '../components/KpiCard';
import CustomSelect, { type SelectOption } from '../components/CustomSelect';
import TaskStatusBadge from '../components/TaskStatusBadge';
import CompletionResultBadge from '../components/CompletionResultBadge';
import {
    performanceService,
    taskService,
    notificationService,
    userService,
    authService,
} from '../api';
import { signalRService } from '../services/signalRService';
import type {
    NotificationResponse,
    TaskResponse,
    LeaderboardEntry,
    UserResponse,
} from '../dto';
import { TaskStatus, Priority } from '../dto';
import {
    parseJwtToken,
    isTokenExpired,
    getPrimaryRole,
    getProfilePictureUrl,
    formatUserDisplayName,
    formatDateTime,
} from '../utils';
import type { UserInfo } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import {
    ArrowPathIcon,
    CalendarIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ChevronRightIcon,
    XCircleIcon,
    XMarkIcon,
    FolderIcon,
    SparklesIcon,
    InboxIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts';

type TimePreset = 'all' | 'today' | '7d' | '30d' | 'thisMonth' | 'thisYear' | 'custom';
type ExecutedTabFilter = 'all' | 'active' | 'completed' | 'overdue';

interface StatusItem {
    key: string;
    name: string;
    count: number;
    percentage: number;
    color: string;
    targetTab: ExecutedTabFilter;
}

interface StatusPieTooltipProps {
    active?: boolean;
    payload?: Array<{ payload?: StatusItem }>;
}

const StatusPieTooltip: React.FC<StatusPieTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const item = payload[0]?.payload;
        if (!item) return null;
        return (
            <div className="bg-white/95 dark:bg-[#1C1C1E] border border-zinc-200 dark:border-[#2C2C2E] rounded-xl px-3 py-2 shadow-xl text-xs space-y-1 z-50">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</span>
                </div>
                <div className="text-zinc-600 dark:text-[#A1A1AA] font-bold">
                    {item.count} ({item.percentage}%)
                </div>
            </div>
        );
    }
    return null;
};

const getTaskOverdueInfo = (task: TaskResponse, nowMs: number): { isOverdue: boolean; overdueMs: number } => {
    if (task.status === TaskStatus.Completed || task.status === TaskStatus.Draft) {
        return { isOverdue: false, overdueMs: 0 };
    }
    if (task.deadline) {
        const deadlineMs = new Date(task.deadline).getTime();
        if (!isNaN(deadlineMs) && deadlineMs < nowMs) {
            return { isOverdue: true, overdueMs: nowMs - deadlineMs };
        }
    }
    if (task.status === TaskStatus.Expired) {
        return { isOverdue: true, overdueMs: 0 };
    }
    return { isOverdue: false, overdueMs: 0 };
};

const getTaskReferenceDate = (task: TaskResponse): Date | null => {
    const rawDate =
        task.status === TaskStatus.Completed
            ? task.completedAt || task.deadline || task.assignedAt || task.createdAt
            : task.deadline || task.assignedAt || task.createdAt || task.startDate;
    if (!rawDate) return null;
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? null : d;
};

const Performance: React.FC = () => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();

    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [allTasks, setAllTasks] = useState<TaskResponse[]>([]);
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Time Filter State
    const [timePreset, setTimePreset] = useState<TimePreset>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');

    // Executed Tasks Section Filters
    const [executedTab, setExecutedTab] = useState<ExecutedTabFilter>('all');
    const [taskSearchQuery, setTaskSearchQuery] = useState<string>('');
    const [activeStatusSlice, setActiveStatusSlice] = useState<number | null>(null);

    // Quick Accept / Reject state for Pending Tasks
    const [processingTaskId, setProcessingTaskId] = useState<string | number | null>(null);
    const [rejectModalTask, setRejectModalTask] = useState<TaskResponse | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Current logged-in user metadata
    const displayName = useMemo(() => {
        if (!userInfo) return t('common.user', {}, 'İstifadəçi');
        return formatUserDisplayName(userInfo.userName, userInfo.email) || t('common.user', {}, 'İstifadəçi');
    }, [userInfo, t]);

    const userRole = useMemo(() => {
        if (!userInfo || !userInfo.roles?.length) return 'Employee';
        return getPrimaryRole(userInfo.roles);
    }, [userInfo]);

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl);
    }, [userInfo]);

    // Close reject modal on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setRejectModalTask(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Load data
    const loadData = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const [tasksData, usersData, leaderboardData, notificationsData] = await Promise.all([
                taskService.getAllTasks().catch(() => [] as TaskResponse[]),
                userService.getAllUsers().catch(() => [] as UserResponse[]),
                performanceService.getLeaderboard().catch(() => [] as LeaderboardEntry[]),
                notificationService.getMyNotifications().catch(() => [] as NotificationResponse[]),
            ]);

            setAllTasks((tasksData || []).filter((item) => !taskService.isSystemActivityTask(item)));
            setAllUsers(Array.isArray(usersData) ? usersData : []);
            setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
            setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
        } catch {
            // Silent fallback
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

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

        loadData(false);
    }, [navigate, loadData]);

    // Real-time task updates via SignalR
    useEffect(() => {
        const unsubscribe = signalRService.subscribe('ReceiveNotification', () => {
            taskService
                .getAllTasks()
                .then((tasksData) => {
                    setAllTasks((tasksData || []).filter((item) => !taskService.isSystemActivityTask(item)));
                })
                .catch(() => {});
        });
        return () => unsubscribe();
    }, []);

    // Logged-in user's own profile (fixed, cannot be switched to another user)
    const ownProfile = useMemo(() => {
        const normId = String(userInfo?.userId || '').trim().toLowerCase();
        const normEmail = String(userInfo?.email || '').trim().toLowerCase();

        const found = allUsers.find(
            (u) =>
                (normId && String(u.id).trim().toLowerCase() === normId) ||
                (normEmail && u.email && u.email.trim().toLowerCase() === normEmail)
        );
        const lbEntry = leaderboard.find(
            (l) => normId && String(l.userId).trim().toLowerCase() === normId
        );

        const name = found
            ? formatUserDisplayName(found, found.email)
            : displayName;
        const email = found?.email || userInfo?.email || '';
        const avatar = getProfilePictureUrl(
            userInfo?.userId || found?.id,
            found?.profilePictureUrl || lbEntry?.profilePictureUrl || userInfo?.profilePictureUrl
        );
        const points = lbEntry?.totalPoints ?? 0;

        return {
            id: userInfo?.userId || '',
            name: name || t('common.user', {}, 'İstifadəçi'),
            email,
            role: userRole,
            avatar,
            initial: (name || 'U').charAt(0).toUpperCase(),
            points,
        };
    }, [userInfo, allUsers, leaderboard, displayName, userRole, t]);

    // Helper: resolve creator display name
    const getUserNameById = useCallback(
        (uid?: string, fallbackName?: string) => {
            if (uid) {
                const found = allUsers.find((u) => String(u.id).toLowerCase() === String(uid).toLowerCase());
                if (found) return formatUserDisplayName(found, found.email) || t('common.user', {}, 'İstifadəçi');
            }
            if (fallbackName) return formatUserDisplayName(fallbackName) || fallbackName;
            return '—';
        },
        [allUsers, t]
    );

    // Filter tasks assigned ONLY to the currently logged-in user (excluding drafts)
    const userAssignedTasks = useMemo(() => {
        const normUserId = String(userInfo?.userId || '').trim().toLowerCase();
        const normEmail = String(userInfo?.email || '').trim().toLowerCase();
        if (!normUserId && !normEmail) return [];

        return allTasks.filter((task) => {
            if (task.status === TaskStatus.Draft || task.isDraft) return false;
            const singleAssignee = String(task.assignedToUserId || '').trim().toLowerCase();
            const matchesSingle =
                Boolean(singleAssignee) &&
                ((normUserId && singleAssignee === normUserId) || (normEmail && singleAssignee === normEmail));
            const matchesMulti =
                Array.isArray(task.assignedToUserIds) &&
                task.assignedToUserIds.some((uid) => {
                    const norm = String(uid).trim().toLowerCase();
                    return (normUserId && norm === normUserId) || (normEmail && norm === normEmail);
                });
            return matchesSingle || matchesMulti;
        });
    }, [allTasks, userInfo]);

    // Apply time filter (presets + custom date range)
    const timeFilteredTasks = useMemo(() => {
        if (timePreset === 'all') return userAssignedTasks;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        let rangeStart: Date | null = null;
        let rangeEnd: Date | null = null;

        if (timePreset === 'today') {
            rangeStart = startOfToday;
            rangeEnd = endOfToday;
        } else if (timePreset === '7d') {
            rangeStart = new Date(startOfToday);
            rangeStart.setDate(rangeStart.getDate() - 6);
            rangeEnd = endOfToday;
        } else if (timePreset === '30d') {
            rangeStart = new Date(startOfToday);
            rangeStart.setDate(rangeStart.getDate() - 29);
            rangeEnd = endOfToday;
        } else if (timePreset === 'thisMonth') {
            rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (timePreset === 'thisYear') {
            rangeStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
            rangeEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else if (timePreset === 'custom') {
            if (customStartDate) {
                const s = new Date(`${customStartDate}T00:00:00`);
                if (!isNaN(s.getTime())) rangeStart = s;
            }
            if (customEndDate) {
                const e = new Date(`${customEndDate}T23:59:59.999`);
                if (!isNaN(e.getTime())) rangeEnd = e;
            }
        }

        if (!rangeStart && !rangeEnd) return userAssignedTasks;

        return userAssignedTasks.filter((task) => {
            const refDate = getTaskReferenceDate(task);
            if (!refDate) return false;
            if (rangeStart && refDate < rangeStart) return false;
            if (rangeEnd && refDate > rangeEnd) return false;
            return true;
        });
    }, [userAssignedTasks, timePreset, customStartDate, customEndDate]);

    // Core Statistics & Categorized Lists
    const analytics = useMemo(() => {
        const nowMs = Date.now();
        const total = timeFilteredTasks.length;

        const completedList: TaskResponse[] = [];
        const inProgressList: TaskResponse[] = [];
        const underReviewList: TaskResponse[] = [];
        const assignedList: TaskResponse[] = [];
        const pendingList: TaskResponse[] = [];
        const overdueList: Array<{ task: TaskResponse; overdueMs: number }> = [];

        timeFilteredTasks.forEach((task) => {
            const overdueInfo = getTaskOverdueInfo(task, nowMs);
            if (overdueInfo.isOverdue) {
                overdueList.push({ task, overdueMs: overdueInfo.overdueMs });
            }

            switch (task.status) {
                case TaskStatus.Completed:
                    completedList.push(task);
                    break;
                case TaskStatus.InProgress:
                    inProgressList.push(task);
                    break;
                case TaskStatus.UnderReview:
                    underReviewList.push(task);
                    break;
                case TaskStatus.Assigned:
                    assignedList.push(task);
                    break;
                case TaskStatus.Pending:
                    pendingList.push(task);
                    break;
                default:
                    break;
            }
        });

        // Sort overdue tasks by longest overdue first
        overdueList.sort((a, b) => b.overdueMs - a.overdueMs);

        // Pending / unaccepted tasks (Assigned or Pending)
        const pendingAcceptanceTasks = [...assignedList, ...pendingList].sort((a, b) => {
            const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
        });

        // Executed & active tasks (InProgress, UnderReview, Completed, or Overdue)
        const executedTasks = timeFilteredTasks.filter(
            (item) =>
                item.status === TaskStatus.Completed ||
                item.status === TaskStatus.InProgress ||
                item.status === TaskStatus.UnderReview ||
                item.status === TaskStatus.Expired
        );

        const completionRate = total > 0 ? Math.round((completedList.length / total) * 100) : 0;

        const statusItems: StatusItem[] = [
            {
                key: 'completed',
                name: t('statuses.completed', {}, 'Tamamlandı'),
                count: completedList.length,
                percentage: total > 0 ? Math.round((completedList.length / total) * 100) : 0,
                color: '#34D399',
                targetTab: 'completed',
            },
            {
                key: 'inProgress',
                name: t('statuses.inProgress', {}, 'İcrada'),
                count: inProgressList.length,
                percentage: total > 0 ? Math.round((inProgressList.length / total) * 100) : 0,
                color: '#38BDF8',
                targetTab: 'active',
            },
            {
                key: 'review',
                name: t('statuses.review', {}, 'Baxışda'),
                count: underReviewList.length,
                percentage: total > 0 ? Math.round((underReviewList.length / total) * 100) : 0,
                color: '#A855F7',
                targetTab: 'active',
            },
            {
                key: 'assigned',
                name: t('statuses.assigned', {}, 'Təyin edilib'),
                count: assignedList.length,
                percentage: total > 0 ? Math.round((assignedList.length / total) * 100) : 0,
                color: '#60A5FA',
                targetTab: 'all',
            },
            {
                key: 'pending',
                name: t('statuses.pending', {}, 'Gözləmədə'),
                count: pendingList.length,
                percentage: total > 0 ? Math.round((pendingList.length / total) * 100) : 0,
                color: '#FBBF24',
                targetTab: 'all',
            },
            {
                key: 'overdue',
                name: t('common.overdue', {}, 'Vaxtı keçib'),
                count: overdueList.length,
                percentage: total > 0 ? Math.round((overdueList.length / total) * 100) : 0,
                color: '#F87171',
                targetTab: 'overdue',
            },
        ];

        const chartData = statusItems.filter((s) => s.count > 0);

        return {
            total,
            completedCount: completedList.length,
            inProgressCount: inProgressList.length,
            underReviewCount: underReviewList.length,
            overdueList,
            overdueCount: overdueList.length,
            pendingAcceptanceTasks,
            pendingCount: pendingAcceptanceTasks.length,
            executedTasks,
            completionRate,
            statusItems,
            chartData,
        };
    }, [timeFilteredTasks, t]);

    // Filtered Executed Tasks list
    const filteredExecutedTasks = useMemo(() => {
        const nowMs = Date.now();
        let list = analytics.executedTasks;

        if (executedTab === 'active') {
            list = list.filter((item) => item.status === TaskStatus.InProgress || item.status === TaskStatus.UnderReview);
        } else if (executedTab === 'completed') {
            list = list.filter((item) => item.status === TaskStatus.Completed);
        } else if (executedTab === 'overdue') {
            list = timeFilteredTasks.filter((item) => getTaskOverdueInfo(item, nowMs).isOverdue);
        }

        if (taskSearchQuery.trim()) {
            const q = taskSearchQuery.trim().toLowerCase();
            list = list.filter(
                (item) =>
                    item.title.toLowerCase().includes(q) ||
                    (item.description && item.description.toLowerCase().includes(q)) ||
                    (item.projectName && item.projectName.toLowerCase().includes(q)) ||
                    (item.divisionName && item.divisionName.toLowerCase().includes(q))
            );
        }

        return list;
    }, [analytics.executedTasks, timeFilteredTasks, executedTab, taskSearchQuery]);

    // Time filter Select options
    const timeOptions = useMemo<SelectOption<TimePreset>[]>(
        () => [
            { value: 'all', label: t('performance.allTime', {}, 'Bütün vaxtlar') },
            { value: 'today', label: t('performance.today', {}, 'Bu gün') },
            { value: '7d', label: t('performance.last7Days', {}, 'Son 7 gün') },
            { value: '30d', label: t('performance.last30Days', {}, 'Son 30 gün') },
            { value: 'thisMonth', label: t('performance.thisMonth', {}, 'Bu ay') },
            { value: 'thisYear', label: t('performance.thisYear', {}, 'Bu il') },
            { value: 'custom', label: t('performance.customRange', {}, 'Xüsusi tarix aralığı') },
        ],
        [t]
    );

    const formatOverdueLabel = useCallback(
        (overdueMs: number): string => {
            if (overdueMs <= 0) return t('performance.statusExpired', {}, 'Vaxtı keçib');
            const days = Math.floor(overdueMs / 86400000);
            if (days >= 1) return t('performance.overdueDays', { count: days }, `${days} gün gecikib`);
            const hours = Math.floor(overdueMs / 3600000);
            if (hours >= 1) return t('performance.overdueHours', { count: hours }, `${hours} saat gecikib`);
            const mins = Math.max(1, Math.floor(overdueMs / 60000));
            return t('performance.overdueMinutes', { count: mins }, `${mins} dəq gecikib`);
        },
        [t]
    );

    const getPriorityBadge = useCallback(
        (priority?: Priority) => {
            switch (priority) {
                case Priority.Urgent:
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {t('priorities.urgent', {}, 'Təcili')}
                        </span>
                    );
                case Priority.High:
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                            {t('priorities.high', {}, 'Yüksək')}
                        </span>
                    );
                case Priority.Low:
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                            {t('priorities.low', {}, 'Aşağı')}
                        </span>
                    );
                case Priority.Normal:
                default:
                    return (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {t('priorities.medium', {}, 'Normal')}
                        </span>
                    );
            }
        },
        [t]
    );

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setActionFeedback({ type, message });
        setTimeout(() => setActionFeedback(null), 3500);
    };

    const handleAcceptPendingTask = async (taskId: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setProcessingTaskId(taskId);
            await taskService.acceptTask(taskId);
            setAllTasks((prev) =>
                prev.map((item) =>
                    String(item.id) === String(taskId)
                        ? { ...item, status: TaskStatus.InProgress, acceptedAt: new Date().toISOString() }
                        : item
                )
            );
            showFeedback('success', t('performance.acceptSuccess', {}, 'Tapşırıq qəbul edildi və icraya alındı.'));
        } catch {
            showFeedback('error', t('tasks.acceptFailed', {}, 'Tapşırıq qəbul edilə bilmədi.'));
        } finally {
            setProcessingTaskId(null);
        }
    };

    const handleConfirmRejectTask = async () => {
        if (!rejectModalTask) return;
        const taskId = rejectModalTask.id;
        const reason = rejectReason.trim() || t('performance.defaultRejectReason', {}, 'İmtina edildi');

        try {
            setProcessingTaskId(taskId);
            await taskService.rejectTask(taskId, reason);
            setAllTasks((prev) =>
                prev.map((item) =>
                    String(item.id) === String(taskId)
                        ? { ...item, status: TaskStatus.Pending, assignedToUserId: undefined }
                        : item
                )
            );
            setRejectModalTask(null);
            setRejectReason('');
            showFeedback('success', t('performance.rejectSuccess', {}, 'Tapşırıqdan imtina edildi.'));
        } catch {
            showFeedback('error', t('tasks.rejectFailed', {}, 'Tapşırıqdan imtina etmək mümkün olmadı.'));
        } finally {
            setProcessingTaskId(null);
        }
    };

    const handleExportCsv = () => {
        if (timeFilteredTasks.length === 0) return;

        const statusLabelMap: Record<number, string> = {
            [TaskStatus.Pending]: t('statuses.pending', {}, 'Gözləmədə'),
            [TaskStatus.Assigned]: t('statuses.assigned', {}, 'Təyin edilib'),
            [TaskStatus.InProgress]: t('statuses.inProgress', {}, 'İcrada'),
            [TaskStatus.UnderReview]: t('statuses.review', {}, 'Baxışda'),
            [TaskStatus.Completed]: t('statuses.completed', {}, 'Tamamlandı'),
            [TaskStatus.Expired]: t('common.overdue', {}, 'Vaxtı keçib'),
            [TaskStatus.Draft]: t('statuses.draft', {}, 'Qaralama'),
        };

        const headers = [
            t('performance.taskCol', {}, 'Tapşırıq'),
            t('performance.projectCol', {}, 'Layihə / Şöbə'),
            t('common.status', {}, 'Status'),
            t('performance.deadline', {}, 'Son tarix'),
            t('performance.assignedBy', {}, 'Təyin edən'),
            t('performance.resultCol', {}, 'Nəticə'),
        ];

        const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;

        const rows = timeFilteredTasks.map((task) => [
            escapeCsv(task.title),
            escapeCsv(task.projectName || task.divisionName || t('performance.noProject', {}, 'Layihəsiz')),
            escapeCsv(statusLabelMap[task.status] || String(task.status)),
            escapeCsv(task.deadline ? formatDateTime(task.deadline) : t('performance.noDeadline', {}, 'Təyin edilməyib')),
            escapeCsv(getUserNameById(task.createdByUserId, task.createdByUserName)),
            escapeCsv(
                task.isCompletedSuccessfully === true
                    ? t('tasks.successful', {}, 'Uğurlu')
                    : task.isCompletedSuccessfully === false
                    ? t('tasks.failed', {}, 'Uğursuz')
                    : '—'
            ),
        ]);

        const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = ownProfile.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        link.href = url;
        link.setAttribute('download', `Performance_${safeName}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleResetFilters = () => {
        setTimePreset('all');
        setCustomStartDate('');
        setCustomEndDate('');
        setExecutedTab('all');
        setTaskSearchQuery('');
        setActiveStatusSlice(null);
    };

    const hasActiveFilters =
        timePreset !== 'all' || Boolean(customStartDate) || Boolean(customEndDate) || executedTab !== 'all' || Boolean(taskSearchQuery.trim());

    const activeLocale = language === 'az' ? 'az-AZ' : language === 'ru' ? 'ru-RU' : 'en-US';
    const currentDateBadge = useMemo(() => {
        try {
            return new Date().toLocaleDateString(activeLocale, { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return new Date().toLocaleDateString();
        }
    }, [activeLocale]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-[#121214] font-sans antialiased text-zinc-900 dark:text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header userName={displayName} userRole={userRole} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-zinc-500 dark:text-[#71717A] font-medium">
                                {t('performance.loadingData', {}, 'İstifadəçi paneli yüklənir...')}
                            </p>
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

                <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 sm:pb-8 md:pb-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Feedback Banner */}
                    {actionFeedback && (
                        <div
                            className={`rounded-xl px-4 py-3 text-xs font-semibold border flex items-center justify-between animate-in fade-in duration-150 ${
                                actionFeedback.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                            }`}
                        >
                            <span>{actionFeedback.message}</span>
                            <button type="button" onClick={() => setActionFeedback(null)} className="cursor-pointer opacity-70 hover:opacity-100">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Top Profile Header & Controls (Logged-in user only) */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-4 sm:p-5 shadow-xs space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Logged-in User Identity */}
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-slate-50 font-extrabold text-lg sm:text-xl flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                                    {ownProfile.avatar ? (
                                        <img
                                            src={ownProfile.avatar}
                                            alt={ownProfile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        ownProfile.initial
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                                            {ownProfile.name}
                                        </h1>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                            <SparklesIcon className="w-3 h-3" />
                                            <span>{ownProfile.role}</span>
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            {ownProfile.points.toLocaleString()} {t('performance.pointsUnit', {}, 'xal')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-[#A1A1AA] mt-1">
                                        {ownProfile.email
                                            ? `${ownProfile.email} · ${t('performance.personalPanelSubtitle', {}, 'Şəxsi tapşırıq statistikası, gecikmələr və qəbul gözləyən işlər.')}`
                                            : t('performance.personalPanelSubtitle', {}, 'Şəxsi tapşırıq statistikası, gecikmələr və qəbul gözləyən işlər.')}
                                    </p>
                                </div>
                            </div>

                            {/* Top Right Controls: Time Filter, Refresh, Export */}
                            <div className="flex items-center gap-2 flex-wrap shrink-0">
                                <CustomSelect<TimePreset>
                                    value={timePreset}
                                    onChange={(val) => setTimePreset(val)}
                                    options={timeOptions}
                                    icon={<CalendarIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />}
                                    className="w-44 sm:w-48"
                                    size="md"
                                    align="right"
                                />

                                <button
                                    type="button"
                                    onClick={() => loadData(true)}
                                    disabled={refreshing}
                                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-[#27272A]/80 dark:hover:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46]/60 text-zinc-600 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer disabled:opacity-50"
                                    title={t('common.refresh', {}, 'Yenilə')}
                                >
                                    <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExportCsv}
                                    disabled={timeFilteredTasks.length === 0}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed h-[38px]"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('common.exportCsv', {}, 'CSV İxrac et')}</span>
                                </button>
                            </div>
                        </div>

                        {/* Custom Date Range Picker & Active Filter Summary */}
                        {(timePreset === 'custom' || hasActiveFilters) && (
                            <div className="pt-3 border-t border-zinc-200/80 dark:border-[#27272A] flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {timePreset === 'custom' && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#A1A1AA]">
                                                    {t('performance.startDate', {}, 'Başlanğıc tarix')}:
                                                </label>
                                                <input
                                                    type="date"
                                                    value={customStartDate}
                                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                                    className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46] text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[11px] font-semibold text-zinc-500 dark:text-[#A1A1AA]">
                                                    {t('performance.endDate', {}, 'Bitmə tarixi')}:
                                                </label>
                                                <input
                                                    type="date"
                                                    value={customEndDate}
                                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                                    className="px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46] text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <span className="text-[11px] text-zinc-500 dark:text-[#71717A] font-medium">
                                        {currentDateBadge} · {analytics.total} {t('performance.tasksCount', {}, 'tapşırıq')}
                                    </span>
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <XMarkIcon className="w-3.5 h-3.5" />
                                        <span>{t('performance.resetFilters', {}, 'Sıfırla')}</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 4 Clear KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <KpiCard
                            title={t('performance.totalAssignedTasks', {}, 'Ümumi Tapşırıqlar')}
                            value={analytics.total}
                            subtitle={t('performance.totalAssignedDesc', {}, 'təyin edilmiş iş')}
                            accentColor="#38BDF8"
                            badgeText={t('common.total', {}, 'Cəmi')}
                        />

                        <KpiCard
                            title={t('performance.executedTasks', {}, 'İcra Edilən & Bitən')}
                            value={analytics.completedCount}
                            showProgress
                            progressValue={analytics.completionRate}
                            progressLabel={`${analytics.inProgressCount} ${t('performance.inProgressCount', {}, 'icrada')} · ${analytics.underReviewCount} ${t('statuses.review', {}, 'baxışda')}`}
                            accentColor="#34D399"
                            badgeText={t('performance.completedCount', {}, 'tamamlandı')}
                        />

                        <KpiCard
                            title={t('performance.overdueTasks', {}, 'Gecikmiş Tapşırıqlar')}
                            value={analytics.overdueCount}
                            subtitle={
                                analytics.overdueCount > 0
                                    ? t('performance.overdueAttention', {}, 'Diqqət tələb edir')
                                    : t('performance.noOverdueBadge', {}, 'Gecikmə yoxdur')
                            }
                            subtitleColor={analytics.overdueCount > 0 ? 'red' : 'green'}
                            accentColor="#F87171"
                            badgeText={t('common.overdue', {}, 'Vaxtı keçib')}
                        />

                        <KpiCard
                            title={t('performance.pendingAcceptance', {}, 'Qəbul Gözləyən')}
                            value={analytics.pendingCount}
                            subtitle={t('performance.awaitingAction', {}, 'təsdiq gözləyir')}
                            accentColor="#FBBF24"
                            badgeText={t('statuses.pending', {}, 'Gözləmədə')}
                        />
                    </div>

                    {/* Middle Analytics Row: Status Distribution + Overdue Tasks List */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left: Overall Status Breakdown */}
                        <div className="lg:col-span-5 rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs flex flex-col justify-between gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                            {t('performance.statusDistribution', {}, 'Ümumi Statuslar')}
                                        </h2>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-[#71717A] mt-0.5">
                                        {t('performance.statusDistributionDesc', {}, 'Seçilmiş dövr üzrə status paylanması')}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-zinc-600 dark:text-[#A1A1AA]">
                                    {analytics.total} {t('performance.tasksCount', {}, 'tapşırıq')}
                                </span>
                            </div>

                            {analytics.total === 0 ? (
                                <div className="py-10 text-center text-xs text-zinc-500 dark:text-[#71717A]">
                                    {t('performance.noTasksInPeriod', {}, 'Bu dövr üzrə tapşırıq yoxdur.')}
                                </div>
                            ) : (
                                <>
                                    <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics.chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={48}
                                                    outerRadius={70}
                                                    paddingAngle={analytics.chartData.length > 1 ? 3 : 0}
                                                    dataKey="count"
                                                    onMouseEnter={(_, idx) => setActiveStatusSlice(idx)}
                                                    onMouseLeave={() => setActiveStatusSlice(null)}
                                                    onClick={(_, idx) => {
                                                        const clicked = analytics.chartData[idx];
                                                        if (clicked) setExecutedTab(clicked.targetTab);
                                                    }}
                                                    cursor="pointer"
                                                >
                                                    {analytics.chartData.map((entry) => (
                                                        <Cell key={entry.key} fill={entry.color} stroke="transparent" />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<StatusPieTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>

                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                                            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-none">
                                                {activeStatusSlice !== null && analytics.chartData[activeStatusSlice]
                                                    ? analytics.chartData[activeStatusSlice].count
                                                    : analytics.total}
                                            </span>
                                            <span className="text-[10px] text-zinc-500 dark:text-[#A1A1AA] font-medium mt-1 truncate max-w-[90px]">
                                                {activeStatusSlice !== null && analytics.chartData[activeStatusSlice]
                                                    ? analytics.chartData[activeStatusSlice].name
                                                    : t('common.total', {}, 'Ümumi')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-3 border-t border-zinc-200/80 dark:border-[#27272A]">
                                        {analytics.statusItems.map((item) => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => setExecutedTab(item.targetTab)}
                                                className="w-full flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-[#27272A]/60 transition-colors text-left cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                    <span className="text-xs font-medium text-zinc-700 dark:text-[#D4D4D8] truncate">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <div className="w-16 h-1.5 rounded-full bg-zinc-200 dark:bg-[#27272A] overflow-hidden hidden sm:block">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-300"
                                                            style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 min-w-[46px] text-right">
                                                        {item.count} <span className="text-[10px] font-normal text-zinc-500">({item.percentage}%)</span>
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right: Overdue Tasks List */}
                        <div className="lg:col-span-7 rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-xs flex flex-col">
                            <div className="flex items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-[#27272A]">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                            {t('performance.overdueListTitle', {}, 'Gecikmiş Tapşırıqlar')}
                                        </h2>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                            {analytics.overdueCount}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-[#71717A] mt-0.5">
                                        {t('performance.overdueListSubtitle', {}, 'Son tarixi keçmiş və ya vaxtı bitmiş tapşırıqlar')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 mt-3 overflow-y-auto max-h-[340px] space-y-2.5 pr-1">
                                {analytics.overdueList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                            <CheckCircleIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                            {t('performance.noOverdueTasks', {}, 'Gecikmiş tapşırıq yoxdur')}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-[#71717A] max-w-xs">
                                            {t('performance.noOverdueTasksDesc', {}, 'Seçilmiş zaman aralığında gecikmiş tapşırıq tapılmadı.')}
                                        </p>
                                    </div>
                                ) : (
                                    analytics.overdueList.map(({ task, overdueMs }) => (
                                        <div
                                            key={task.id}
                                            onClick={() => navigate(`/tasks/${task.id}`)}
                                            className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/[0.07] dark:bg-rose-500/[0.04] dark:hover:bg-rose-500/[0.08] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                                        >
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                        {task.title}
                                                    </h3>
                                                    <TaskStatusBadge status={task.status} />
                                                    {getPriorityBadge(task.priority)}
                                                </div>

                                                <div className="flex items-center gap-3 flex-wrap text-[11px] text-zinc-500 dark:text-[#A1A1AA]">
                                                    {(task.projectName || task.divisionName) && (
                                                        <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                                                            <FolderIcon className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="truncate">{task.projectName || task.divisionName}</span>
                                                        </span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1">
                                                        <ClockIcon className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                                                        <span>
                                                            {task.deadline
                                                                ? formatDateTime(task.deadline)
                                                                : t('performance.noDeadline', {}, 'Təyin edilməyib')}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 whitespace-nowrap">
                                                    <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                                    <span>{formatOverdueLabel(overdueMs)}</span>
                                                </span>
                                                <ChevronRightIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Executed & Active Tasks Section */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] overflow-hidden shadow-xs">
                        <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                        {t('performance.executedListTitle', {}, 'İcra Edilən Tapşırıqlar')}
                                    </h2>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-[#27272A] text-zinc-700 dark:text-[#D4D4D8]">
                                        {filteredExecutedTasks.length}
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 dark:text-[#71717A] mt-0.5">
                                    {t('performance.executedListSubtitle', {}, 'İstifadəçinin üzərində işlədiyi və tamamladığı tapşırıqlar')}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Quick Status Tabs */}
                                <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 text-xs">
                                    {(
                                        [
                                            { id: 'all' as const, label: t('performance.filterAll', {}, 'Hamısı') },
                                            { id: 'active' as const, label: t('performance.filterInProgress', {}, 'İcrada / Baxışda') },
                                            { id: 'completed' as const, label: t('performance.filterCompleted', {}, 'Tamamlananlar') },
                                            { id: 'overdue' as const, label: t('performance.filterOverdue', {}, 'Gecikənlər') },
                                        ] as const
                                    ).map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setExecutedTab(tab.id)}
                                            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                                executedTab === tab.id
                                                    ? 'bg-white dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 shadow-xs'
                                                    : 'text-zinc-500 dark:text-[#A1A1AA] hover:text-zinc-900 dark:hover:text-zinc-100'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Search Input */}
                                <div className="relative min-w-[190px] flex-1 sm:flex-initial">
                                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={taskSearchQuery}
                                        onChange={(e) => setTaskSearchQuery(e.target.value)}
                                        placeholder={t('performance.searchPlaceholder', {}, 'Tapşırıq və ya layihə axtar...')}
                                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-[#27272A]/80 border border-zinc-200 dark:border-[#3F3F46]/60 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-[#71717A] focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs min-w-[680px]">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-[#27272A] text-zinc-500 dark:text-[#71717A] font-semibold bg-zinc-50 dark:bg-[#141416]">
                                        <th className="py-3 px-5 font-medium">{t('performance.taskCol', {}, 'Tapşırıq')}</th>
                                        <th className="py-3 px-4 font-medium">{t('performance.projectCol', {}, 'Layihə / Şöbə')}</th>
                                        <th className="py-3 px-4 font-medium">{t('common.priority', {}, 'Prioritet')}</th>
                                        <th className="py-3 px-4 font-medium">{t('performance.deadline', {}, 'Son tarix')}</th>
                                        <th className="py-3 px-4 font-medium">{t('common.status', {}, 'Status')}</th>
                                        <th className="py-3 px-5 text-right font-medium">{t('common.actions', {}, 'Əməliyyatlar')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/80 dark:divide-[#27272A]">
                                    {filteredExecutedTasks.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-xs text-zinc-500 dark:text-[#71717A]">
                                                {t('performance.noExecutedTasks', {}, 'Bu filtrə uyğun tapşırıq tapılmadı')}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredExecutedTasks.map((task) => {
                                            const { isOverdue, overdueMs } = getTaskOverdueInfo(task, Date.now());
                                            return (
                                                <tr
                                                    key={task.id}
                                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                                    className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                                >
                                                    <td className="py-3.5 px-5 max-w-[270px]">
                                                        <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                            {task.title}
                                                        </div>
                                                        {task.description && (
                                                            <div className="text-[11px] text-zinc-500 dark:text-[#71717A] truncate mt-0.5">
                                                                {task.description}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-zinc-600 dark:text-[#D4D4D8]">
                                                        {task.projectName || task.divisionName || (
                                                            <span className="text-zinc-400 dark:text-[#71717A]">
                                                                {t('performance.noProject', {}, 'Layihəsiz')}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4">{getPriorityBadge(task.priority)}</td>
                                                    <td className="py-3.5 px-4 text-zinc-600 dark:text-[#A1A1AA]">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}`}>
                                                                <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                                                                <span>
                                                                    {task.deadline
                                                                        ? formatDateTime(task.deadline)
                                                                        : t('performance.noDeadline', {}, 'Təyin edilməyib')}
                                                                </span>
                                                            </span>
                                                            {isOverdue && (
                                                                <span className="text-[10px] font-bold text-rose-500">
                                                                    {formatOverdueLabel(overdueMs)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <TaskStatusBadge status={task.status} />
                                                            {task.status === TaskStatus.Completed && (
                                                                <CompletionResultBadge isSuccessful={task.isCompletedSuccessfully} />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/tasks/${task.id}`);
                                                            }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-zinc-200 text-[11px] font-semibold transition-colors cursor-pointer"
                                                        >
                                                            <span>{t('performance.viewTask', {}, 'Ətraflı bax')}</span>
                                                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Section: Pending / Unaccepted Tasks (Replaces Difficulty Table) */}
                    <div className="rounded-2xl border border-zinc-200/80 dark:border-[#27272A] bg-white dark:bg-[#18181B] overflow-hidden shadow-xs">
                        <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                        {t('performance.pendingListTitle', {}, 'Gözləmədə Olan Tapşırıqlar')}
                                    </h2>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        {analytics.pendingCount}
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 dark:text-[#71717A] mt-0.5">
                                    {t('performance.pendingListSubtitle', {}, 'İstifadəçiyə həvalə edilmiş, lakin hələ qəbul edilməmiş tapşırıqlar')}
                                </p>
                            </div>
                        </div>

                        {analytics.pendingAcceptanceTasks.length === 0 ? (
                            <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-2">
                                <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-[#27272A]/70 flex items-center justify-center text-zinc-400 dark:text-[#71717A]">
                                    <InboxIcon className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    {t('performance.noPendingTasks', {}, 'Qəbul gözləyən tapşırıq yoxdur')}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-[#71717A] max-w-md">
                                    {t('performance.noPendingTasksDesc', {}, 'Bütün təyin edilmiş tapşırıqlar qəbul edilib və ya bu aralıqda gözləyən iş yoxdur.')}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs min-w-[680px]">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-[#27272A] text-zinc-500 dark:text-[#71717A] font-semibold bg-zinc-50 dark:bg-[#141416]">
                                            <th className="py-3 px-5 font-medium">{t('performance.taskCol', {}, 'Tapşırıq')}</th>
                                            <th className="py-3 px-4 font-medium">{t('performance.assignedBy', {}, 'Təyin edən')}</th>
                                            <th className="py-3 px-4 font-medium">{t('common.priority', {}, 'Prioritet')}</th>
                                            <th className="py-3 px-4 font-medium">{t('performance.deadline', {}, 'Son tarix')}</th>
                                            <th className="py-3 px-4 font-medium">{t('common.status', {}, 'Status')}</th>
                                            <th className="py-3 px-5 text-right font-medium">{t('common.actions', {}, 'Əməliyyatlar')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80 dark:divide-[#27272A]">
                                        {analytics.pendingAcceptanceTasks.map((task) => {
                                            const { isOverdue, overdueMs } = getTaskOverdueInfo(task, Date.now());
                                            const isBusy = processingTaskId === task.id;
                                            const creatorName = getUserNameById(task.createdByUserId, task.createdByUserName);

                                            return (
                                                <tr
                                                    key={task.id}
                                                    onClick={() => navigate(`/tasks/${task.id}`)}
                                                    className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                                >
                                                    <td className="py-3.5 px-5 max-w-[260px]">
                                                        <div className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                            {task.title}
                                                        </div>
                                                        <div className="text-[11px] text-zinc-500 dark:text-[#71717A] truncate mt-0.5">
                                                            {task.projectName || task.divisionName || task.description || t('performance.noProject', {}, 'Layihəsiz')}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-zinc-700 dark:text-[#D4D4D8] font-medium">
                                                        {creatorName}
                                                    </td>
                                                    <td className="py-3.5 px-4">{getPriorityBadge(task.priority)}</td>
                                                    <td className="py-3.5 px-4 text-zinc-600 dark:text-[#A1A1AA]">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}`}>
                                                                <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                                                                <span>
                                                                    {task.deadline
                                                                        ? formatDateTime(task.deadline)
                                                                        : t('performance.noDeadline', {}, 'Təyin edilməyib')}
                                                                </span>
                                                            </span>
                                                            {isOverdue && (
                                                                <span className="text-[10px] font-bold text-rose-500">
                                                                    {formatOverdueLabel(overdueMs)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <TaskStatusBadge status={task.status} />
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                disabled={isBusy}
                                                                onClick={(e) => handleAcceptPendingTask(task.id, e)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                                                            >
                                                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                <span>{t('performance.acceptTask', {}, 'Qəbul et')}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={isBusy}
                                                                onClick={() => {
                                                                    setRejectModalTask(task);
                                                                    setRejectReason('');
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                                                            >
                                                                <XCircleIcon className="w-3.5 h-3.5" />
                                                                <span>{t('performance.rejectTask', {}, 'İmtina et')}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-zinc-700 dark:text-zinc-200 text-[11px] font-semibold transition-colors cursor-pointer"
                                                            >
                                                                <span>{t('performance.viewTask', {}, 'Ətraflı bax')}</span>
                                                                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Reject Reason Modal */}
            {rejectModalTask && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
                    onClick={() => setRejectModalTask(null)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] p-5 shadow-2xl space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {t('performance.rejectTask', {}, 'İmtina et')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setRejectModalTask(null)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-[#A1A1AA]">
                            <strong className="text-zinc-900 dark:text-zinc-100">{rejectModalTask.title}</strong>
                        </p>

                        <textarea
                            rows={3}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder={t('performance.rejectReasonPrompt', {}, 'İmtina səbəbini daxil edin (istəyə bağlı):')}
                            className="w-full rounded-xl bg-zinc-50 dark:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46] p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-rose-500"
                        />

                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setRejectModalTask(null)}
                                className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-[#27272A] dark:hover:bg-[#3F3F46] text-xs font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer"
                            >
                                {t('common.close', {}, 'Bağla')}
                            </button>
                            <button
                                type="button"
                                disabled={processingTaskId === rejectModalTask.id}
                                onClick={handleConfirmRejectTask}
                                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-50 text-xs font-bold cursor-pointer disabled:opacity-50"
                            >
                                {t('performance.rejectTask', {}, 'İmtina et')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Performance;
