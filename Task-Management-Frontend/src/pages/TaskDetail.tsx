import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { useNotifications } from '../context';
import { taskService, authService, notificationService, userService, attachmentService, performanceService } from '../api';
import { signalRService } from '../services/signalRService';
import type { TaskResponse, NotificationResponse, UserResponse, TaskCommentDto } from '../dto';
import { TaskStatus, DifficultyLevel } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import { useLanguage } from '../context/LanguageContext';
import UserSuggestionList from '../components/UserSuggestionList';
import {
    ArrowLeftIcon,
    PencilSquareIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    ClockIcon,
    UserIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    ShieldCheckIcon,
    XMarkIcon,
    AtSymbolIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';

const TaskDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useNotifications();
    const { t, language } = useLanguage();
    const [task, setTask] = useState<TaskResponse | null>(null);
    const [comments, setComments] = useState<TaskCommentDto[]>([]);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl);
    }, [userInfo]);

    // Comment state
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Performance Points state
    const [performanceReason, setPerformanceReason] = useState('');
    const [submittingPerformance, setSubmittingPerformance] = useState(false);

    // Accept/Reject state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processingAccept, setProcessingAccept] = useState(false);
    const [processingReject, setProcessingReject] = useState(false);

    // Finish Task state
    const [processingFinish, setProcessingFinish] = useState(false);

    // Return for Revision state
    const [processingReturn, setProcessingReturn] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');

    // Mention state for comments
    const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionIndex, setMentionIndex] = useState(0);
    const [mentionStartPosition, setMentionStartPosition] = useState(-1);
    const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

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

    const isManager = useMemo(() => {
        if (!userInfo || !userInfo.roles.length) return false;
        return userInfo.roles.some(
            (r) => r.toLowerCase().includes('manager') || r.toLowerCase().includes('admin')
        );
    }, [userInfo]);

    const canEdit = useMemo(() => {
        if (!task || !userInfo) return false;
        // Only the task creator or manager/admin can edit/delete the task
        return isManager || task.createdByUserId === userInfo.userId;
    }, [task, userInfo, isManager]);

    const canAddPerformance = useMemo(() => {
        if (!task || !userInfo || !userInfo.userId) return false;
        const isCreator = Boolean(task.createdByUserId && String(task.createdByUserId).toLowerCase() === String(userInfo.userId).toLowerCase());
        const isAssignee = Boolean(task.assignedToUserId && String(task.assignedToUserId).toLowerCase() === String(userInfo.userId).toLowerCase());

        // İcraçı özünə performans xalı əlavə edə bilməz, o yalnız "Nəzərdən Keçirilir" bildirişini görür
        if (isAssignee) {
            return false;
        }

        return (isCreator || isManager) && task.status === TaskStatus.UnderReview;
    }, [task, userInfo, isManager]);

    // Check if current user can accept or reject the task
    const canAcceptReject = useMemo(() => {
        if (!task || !userInfo) return false;
        // Assigned user can accept/reject when task status is Assigned or Pending
        return task.assignedToUserId === userInfo.userId && (task.status === TaskStatus.Assigned || task.status === TaskStatus.Pending);
    }, [task, userInfo]);

    // Check if current user can finish the task (mark as under review)
    const canFinishTask = useMemo(() => {
        if (!task || !userInfo) return false;
        // Only assigned user can finish when task status is InProgress
        return task.assignedToUserId === userInfo.userId && task.status === TaskStatus.InProgress;
    }, [task, userInfo]);

    const assignedUser = useMemo(() => {
        if (!task?.assignedToUserId || !allUsers.length) return null;
        return allUsers.find(u => u.id === task.assignedToUserId) || null;
    }, [task, allUsers]);

    const createdByUser = useMemo(() => {
        if (!task?.createdByUserId || !allUsers.length) return null;
        return allUsers.find(u => u.id === task.createdByUserId) || null;
    }, [task, allUsers]);

    const getUserName = (userId: string) => {
        if (!userId) return 'İstifadəçi';
        const user = allUsers.find(u => String(u.id).toLowerCase() === String(userId).toLowerCase());
        return user?.userName || (user?.email ? user.email.split('@')[0] : 'İstifadəçi');
    };

    // Filter users for mention suggestions
    const filteredMentionUsers = useMemo(() => {
        if (!mentionQuery || mentionQuery.trim().length === 0) {
            return [];
        }
        const query = mentionQuery.toLowerCase();
        return allUsers.filter(
            (u) =>
                u.userName.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query)
        ).slice(0, 5);
    }, [allUsers, mentionQuery]);

    const [taskError, setTaskError] = useState<string | null>(null);

    useEffect(() => {
        const token = authService.getToken();

        if (!token) {
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

    // Live SignalR notification / comment / status sync on TaskDetail
    useEffect(() => {
        const currentTaskId = String(id || '').trim();
        if (!currentTaskId) return;

        const syncTaskData = () => {
            taskService.getTaskById(currentTaskId)
                .then((latestTask) => {
                    setTask(latestTask);
                    const stored = taskService.getStoredTaskComments(currentTaskId);
                    const serverComments = [...(latestTask.taskComments || (latestTask as any).comments || [])];
                    const commentMap = new Map<string, TaskCommentDto>();
                    stored.forEach(c => commentMap.set(`${c.userId}_${c.content}_${(c.createdAt || '').slice(0, 16)}`, c));
                    serverComments.forEach(c => commentMap.set(`${c.userId}_${c.content}_${(c.createdAt || '').slice(0, 16)}`, c));
                    setComments(Array.from(commentMap.values()));
                })
                .catch(() => {});
        };

        const unsubscribe = signalRService.subscribe('ReceiveNotification', (msgPayload: string) => {
            try {
                let message = msgPayload;
                let notifTaskId: any = null;
                try {
                    const parsed = JSON.parse(msgPayload);
                    if (typeof parsed === 'object' && parsed !== null) {
                        message = parsed.message || '';
                        notifTaskId = parsed.taskId || parsed.relatedTaskId;
                    }
                } catch {
                    // plain string
                }

                const isForThisTask =
                    (notifTaskId && String(notifTaskId).toLowerCase() === currentTaskId.toLowerCase()) ||
                    (task && message.toLowerCase().includes(task.title.toLowerCase()));

                if (isForThisTask) {
                    if (message.includes('mention') || message.includes('şərh') || message.includes('comment') || message.includes('@') || message.includes('🔄') || message.includes('🏁')) {
                        const match = message.match(/:\s*["']?(.+?)["']?$/) || message.match(/qeyd etdi:\s*(.+)$/);
                        const commentText = match ? match[1] : message;
                        const incomingComment: TaskCommentDto = {
                            id: Date.now(),
                            content: commentText,
                            userId: '',
                            userName: 'Həmkar',
                            taskId: currentTaskId,
                            createdAt: new Date().toISOString(),
                            taskCommentMentionIDs: [],
                        };
                        const updated = taskService.saveStoredTaskComment(currentTaskId, incomingComment);
                        setComments(updated);
                    }

                    // Always sync latest task status
                    syncTaskData();
                }
            } catch (err) {
                console.warn('[TaskDetail] SignalR notification processing warning:', err);
            }
        });

        // Sync when user focuses the tab or returns to window
        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                syncTaskData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', handleVisibility);

        // Gentle polling interval (every 10 seconds) while viewing task detail
        const pollInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                syncTaskData();
            }
        }, 10000);

        return () => {
            unsubscribe();
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('focus', handleVisibility);
            clearInterval(pollInterval);
        };
    }, [id, task]);

    const loadData = async () => {
        try {
            setLoading(true);
            setTaskError(null);
            const taskId = String(id || '').trim();
            if (!taskId) {
                setTaskError('Tapşırıq ID-si düzgün deyil.');
                setLoading(false);
                return;
            }

            const [taskData, notificationsData, usersData] = await Promise.all([
                taskService.getTaskById(taskId).catch(async (err) => {
                    console.error('getTaskById primary failed, fallback to list:', err);
                    try {
                        const all = await taskService.getAllTasks();
                        return all.find((t) => String(t.id).toLowerCase() === taskId.toLowerCase()) || null;
                    } catch {
                        return null;
                    }
                }),
                notificationService.getMyNotifications().catch(() => []),
                userService.getAllUsers().catch(() => []),
            ]);

            if (!taskData) {
                setTaskError('Tapşırıq tapılmadı və ya serverdən əldə etmək mümkün olmadı.');
                return;
            }

            // Load stored comments and merge with server data and notifications
            const storedComments = taskService.getStoredTaskComments(taskId);
            const serverComments: TaskCommentDto[] = [...(taskData.taskComments || (taskData as any).comments || [])];

            const commentMap = new Map<string, TaskCommentDto>();
            storedComments.forEach((c) => {
                const key = `${c.userId}_${c.content}_${(c.createdAt || '').slice(0, 16)}`;
                commentMap.set(key, c);
            });
            serverComments.forEach((c) => {
                const key = `${c.userId}_${c.content}_${(c.createdAt || '').slice(0, 16)}`;
                commentMap.set(key, c);
            });

            // Extract mention comments from notifications if any
            if (Array.isArray(notificationsData) && notificationsData.length > 0) {
                const taskNotifs = notificationsData.filter((n) =>
                    (String(n.taskId || n.relatedTaskId || '').toLowerCase() === taskId.toLowerCase() ||
                     (taskData.title && n.message?.toLowerCase().includes(taskData.title.toLowerCase()))) &&
                    (n.message?.includes('şərh') || n.message?.includes('comment') || n.message?.includes('@') || n.message?.includes('qeyd') || n.message?.includes('mention'))
                );
                taskNotifs.forEach((n) => {
                    const match = n.message.match(/:\s*["']?(.+?)["']?$/) || n.message.match(/qeyd etdi:\s*(.+)$/);
                    const commentText = match ? match[1] : n.message;
                    const notifComment: TaskCommentDto = {
                        id: n.id,
                        content: commentText,
                        userId: n.userId || '',
                        userName: undefined,
                        taskId: taskId,
                        createdAt: n.createdAt || new Date().toISOString(),
                        taskCommentMentionIDs: [],
                    };
                    const key = `${notifComment.userId}_${notifComment.content}_${(notifComment.createdAt || '').slice(0, 16)}`;
                    if (!commentMap.has(key)) {
                        commentMap.set(key, notifComment);
                        taskService.saveStoredTaskComment(taskId, notifComment);
                    }
                });
            }

            const finalComments = Array.from(commentMap.values()).sort(
                (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            );

            taskData.taskComments = finalComments;
            setComments(finalComments);
            setTask(taskData);
            setNotifications(notificationsData);
            setAllUsers(usersData);
        } catch (err: any) {
            setTaskError(err?.message || 'Tapşırıq məlumatları yüklənərkən xəta baş verdi.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!task || !confirm('Bu tapşırığı silmək istədiyinizə əminsiniz?')) return;
        try {
            await taskService.deleteTask(task.id);
            taskService.clearStoredTaskComments(task.id);
            navigate('/tasks');
            addToast('Tapşırıq uğurla silindi', undefined, 'success');
        } catch {
            addToast('Tapşırığı silmək mümkün olmadı', undefined, 'error');
        }
    };

    const handleSubmitComment = async () => {
        if (!task || !newComment.trim()) return;

        const token = authService.getToken();
        const activeUser = userInfo || (token ? parseJwtToken(token) : null);
        const currentUserId = activeUser?.userId || '';
        const currentUserName = activeUser?.userName || displayName || 'İstifadəçi';

        setSubmittingComment(true);
        const commentContent = newComment.trim();

        // Extract mentioned users for toast notification
        const mentionMatches = commentContent.match(/@(\w+)/g) || [];
        const mentionedNames = mentionMatches.map((m) => m.slice(1).toLowerCase());

        const newCommentObj: TaskCommentDto = {
            id: Date.now(),
            content: commentContent,
            userId: currentUserId,
            userName: currentUserName,
            taskId: task.id,
            createdAt: new Date().toISOString(),
            taskCommentMentionIDs: [],
        };

        // 1. Optimistic & persistent local update
        const updatedList = taskService.saveStoredTaskComment(task.id, newCommentObj);
        setComments(updatedList);
        setNewComment('');

        // 2. Send to backend
        try {
            await taskService.addComment(task.id, commentContent, newCommentObj);
            addToast('Şərh əlavə edildi', task.id, 'success');
            if (mentionedNames.length > 0) {
                addToast(`@${mentionedNames.join(', @')} qeyd edildi`, task.id, 'info');
            }
        } catch (apiErr: any) {
            console.error('[TaskDetail] addComment error:', apiErr);
            addToast('Şərh əlavə etmək mümkün olmadı', undefined, 'error');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleSubmitPerformance = async () => {
        if (!task || !userInfo || !performanceReason.trim()) return;
        if (task.status !== TaskStatus.UnderReview) {
            addToast('Performans xalları yalnız "Nəzərdən keçirilir" statusundakı tapşırıqlara əlavə edilə bilər', undefined, 'error');
            return;
        }

        const isCreator = Boolean(
            task.createdByUserId &&
            userInfo.userId &&
            String(task.createdByUserId).trim().toLowerCase() === String(userInfo.userId).trim().toLowerCase()
        );

        if (!isCreator && !isManager) {
            addToast('Yalnız tapşırığı yaradan və ya menecer performans xalı əlavə edə bilər', undefined, 'error');
            return;
        }
        if (!task.assignedToUserId) {
            addToast('Bu tapşırığa təyin edilmiş istifadəçi yoxdur', undefined, 'error');
            return;
        }

        setSubmittingPerformance(true);
        try {
            // Add performance points
            await performanceService.addPerformancePoint({
                userId: task.assignedToUserId,
                taskId: task.id,
                reason: performanceReason.trim(),
                senderId: task.createdByUserId || userInfo.userId
            });

            // Update task status to Completed
            await taskService.updateTask({
                id: task.id,
                title: task.title,
                description: task.description,
                difficulty: task.difficulty,
                status: TaskStatus.Completed,
                deadline: task.deadline,
                assignedToUserId: task.assignedToUserId,
                createdByUserId: task.createdByUserId,
            });

            // Immediately reflect Completed status in state
            setTask((prev) => (prev ? { ...prev, status: TaskStatus.Completed } : prev));

            // Add system comment for completion and performance
            const approvalComment = `✨ [Sistem / Təsdiqləndi]: Tapşırıq rəhbər tərəfindən təsdiqləndi və tamamlandı.${performanceReason.trim() ? ` Performans qeydi: "${performanceReason.trim()}"` : ''}`;
            await taskService.addComment(task.id, approvalComment).catch(() => {});

            setPerformanceReason('');
            // Reload task to get updated status
            const updatedTask = await taskService.getTaskById(task.id).catch(() => null);
            if (updatedTask) {
                setTask({ ...updatedTask, status: TaskStatus.Completed });
            }
            const updatedComments = taskService.getStoredTaskComments(task.id);
            if (updatedComments.length > 0) {
                setComments(updatedComments);
            }
            addToast('Performans xalları uğurla əlavə edildi və tapşırıq tamamlandı!', undefined, 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data
                || 'Performans xalları əlavə etmək mümkün olmadı';
            addToast(errorMessage, undefined, 'error');
        } finally {
            setSubmittingPerformance(false);
        }
    };

    // Handle Return for Revision (reject task back to InProgress)
    const handleReturnForRevision = async () => {
        if (!task || !userInfo || !returnReason.trim()) {
            addToast('Rədd səbəbini daxil edin', undefined, 'error');
            return;
        }
        if (task.status !== TaskStatus.UnderReview) {
            addToast('Bu tapşırıq artıq nəzərdən keçirilmir', undefined, 'error');
            setShowReturnModal(false);
            return;
        }

        const isCreator = Boolean(
            task.createdByUserId &&
            userInfo.userId &&
            String(task.createdByUserId).trim().toLowerCase() === String(userInfo.userId).trim().toLowerCase()
        );

        if (!isCreator && !isManager) {
            addToast('Yalnız tapşırığı yaradan və ya menecer onu geri göndərə bilər', undefined, 'error');
            return;
        }

        setProcessingReturn(true);
        try {
            const reasonText = returnReason.trim();
            const currentUserId = userInfo.userId || '';
            const currentUserName = userInfo.userName || displayName || 'Yaradıcı';

            // 1. Send status change to backend
            await taskService.returnForRevision(task.id, currentUserId, reasonText);

            // 2. Immediately reflect InProgress status in state
            setTask((prev) => (prev ? { ...prev, status: TaskStatus.InProgress } : prev));

            // 3. Format comment with exact user-typed reason from modal
            const revisionComment = `🏁 [Sistem / Geri Qaytarıldı]: Tapşırıq rədd edildi: "${reasonText}"`;
            const newCommentObj: TaskCommentDto = {
                id: Date.now(),
                content: revisionComment,
                userId: currentUserId,
                userName: currentUserName,
                taskId: String(task.id),
                createdAt: new Date().toISOString(),
                taskCommentMentionIDs: [],
            };

            // 4. Immediately save locally & set comments state
            taskService.saveStoredTaskComment(task.id, newCommentObj);
            setComments((prev) => [...prev, newCommentObj]);

            // 5. Send to backend AddComment API
            await taskService.addComment(task.id, revisionComment, newCommentObj).catch(() => {});

            setShowReturnModal(false);
            setReturnReason('');

            // 6. Reload task to get updated status
            const updatedTask = await taskService.getTaskById(task.id).catch(() => null);
            if (updatedTask) {
                setTask({ ...updatedTask, status: TaskStatus.InProgress });
            }
            const stored = taskService.getStoredTaskComments(task.id);
            const server = updatedTask?.taskComments || [];
            const merged = new Map<string, TaskCommentDto>();
            server.forEach((c) => merged.set(c.id ? String(c.id) : `${c.content}_${c.createdAt}`, c));
            stored.forEach((c) => merged.set(c.id ? String(c.id) : `${c.content}_${c.createdAt}`, c));
            setComments(Array.from(merged.values()));

            addToast('Tapşırıq yenidən icra üçün geri göndərildi!', undefined, 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data
                || 'Tapşırığı rədd etmək mümkün olmadı';
            addToast(errorMessage, undefined, 'error');
        } finally {
            setProcessingReturn(false);
        }
    };

    // Handle Accept Task
    const handleAcceptTask = async () => {
        if (!task || !userInfo) return;
        if (task.status !== TaskStatus.Assigned && task.status !== TaskStatus.Pending) {
            addToast('Bu tapşırıq artıq qəbul edilib və ya başqa statusdadır', undefined, 'error');
            return;
        }

        setProcessingAccept(true);
        try {
            await taskService.acceptTask(task.id);
            // Immediately set InProgress
            setTask((prev) => (prev ? { ...prev, status: TaskStatus.InProgress } : prev));
            const updatedTask = await taskService.getTaskById(task.id).catch(() => null);
            if (updatedTask) {
                setTask({ ...updatedTask, status: TaskStatus.InProgress });
            }
            addToast('Tapşırıq uğurla qəbul edildi və icraya başlandı!', undefined, 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data
                || 'Tapşırığı qəbul etmək mümkün olmadı';
            addToast(errorMessage, undefined, 'error');
        } finally {
            setProcessingAccept(false);
        }
    };

    // Handle Reject Task
    const handleRejectTask = async () => {
        if (!task || !userInfo || !rejectReason.trim()) {
            addToast('Rədd səbəbini daxil edin', undefined, 'error');
            return;
        }
        if (task.status !== TaskStatus.Assigned && task.status !== TaskStatus.Pending) {
            addToast('Bu tapşırıq artıq qəbul edilib və ya başqa statusdadır', undefined, 'error');
            setShowRejectModal(false);
            return;
        }

        setProcessingReject(true);
        try {
            const rReason = rejectReason.trim();
            const currentUserId = userInfo.userId || '';
            const currentUserName = userInfo.userName || displayName || 'İcraçı';

            await taskService.rejectTask(task.id, rReason);

            // Add system comment for task rejection
            const rejectionComment = `❌ [Sistem / İmtina]: Tapşırıq icraçı tərəfindən rədd edildi: "${rReason}"`;
            const newCommentObj: TaskCommentDto = {
                id: Date.now(),
                content: rejectionComment,
                userId: currentUserId,
                userName: currentUserName,
                taskId: String(task.id),
                createdAt: new Date().toISOString(),
                taskCommentMentionIDs: [],
            };

            taskService.saveStoredTaskComment(task.id, newCommentObj);
            setComments((prev) => [...prev, newCommentObj]);
            await taskService.addComment(task.id, rejectionComment, newCommentObj).catch(() => {});

            setShowRejectModal(false);
            setRejectReason('');
            setTask((prev) => (prev ? { ...prev, status: TaskStatus.Pending } : prev));
            // Reload task to get updated status
            const updatedTask = await taskService.getTaskById(task.id).catch(() => null);
            if (updatedTask) {
                setTask({ ...updatedTask, status: TaskStatus.Pending });
            }
            const stored = taskService.getStoredTaskComments(task.id);
            const server = updatedTask?.taskComments || [];
            const merged = new Map<string, TaskCommentDto>();
            server.forEach((c) => merged.set(c.id ? String(c.id) : `${c.content}_${c.createdAt}`, c));
            stored.forEach((c) => merged.set(c.id ? String(c.id) : `${c.content}_${c.createdAt}`, c));
            setComments(Array.from(merged.values()));

            addToast('Tapşırıq rədd edildi', undefined, 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data
                || 'Tapşırığı rədd etmək mümkün olmadı';
            addToast(errorMessage, undefined, 'error');
        } finally {
            setProcessingReject(false);
        }
    };

    // Handle Finish Task (mark as Under Review)
    const handleFinishTask = async () => {
        if (!task || !userInfo) return;
        if (task.status !== TaskStatus.InProgress) {
            addToast('Bu tapşırıq yalnız "İcrada" statusunda olduqda bitiriləcək', undefined, 'error');
            return;
        }
        if (task.assignedToUserId !== userInfo.userId) {
            addToast('Yalnız tapşırığın icraçısı onu bitirə bilər', undefined, 'error');
            return;
        }

        setProcessingFinish(true);
        try {
            const currentUserId = userInfo.userId || '';
            const currentUserName = userInfo.userName || displayName || 'İcraçı';

            await taskService.finishTask(task.id);

            // Immediately set UnderReview in state
            setTask((prev) => (prev ? { ...prev, status: TaskStatus.UnderReview } : prev));

            // Add system comment for task finish
            const finishComment = '🏁 [Sistem / Bitirildi]: Tapşırıq icraçı tərəfindən tamamlandı və yoxlamaya təqdim edildi.';
            const newCommentObj: TaskCommentDto = {
                id: Date.now(),
                content: finishComment,
                userId: currentUserId,
                userName: currentUserName,
                taskId: String(task.id),
                createdAt: new Date().toISOString(),
                taskCommentMentionIDs: [],
            };

            taskService.saveStoredTaskComment(task.id, newCommentObj);
            setComments((prev) => [...prev, newCommentObj]);
            await taskService.addComment(task.id, finishComment, newCommentObj).catch(() => {});

            // Reload task to get updated status
            const updatedTask = await taskService.getTaskById(task.id).catch(() => null);
            if (updatedTask) {
                setTask({ ...updatedTask, status: TaskStatus.UnderReview });
            }
            const stored = taskService.getStoredTaskComments(task.id);
            const server = updatedTask?.taskComments || [];
            const merged = new Map<string, TaskCommentDto>();
            server.forEach((c) => merged.set(c.id ? String(c.id) : `${c.content}_${c.createdAt}`, c));
            stored.forEach((c) => merged.set(c.id ? String(c.id) : `${c.content}_${c.createdAt}`, c));
            setComments(Array.from(merged.values()));

            addToast('Tapşırıq uğurla bitirildi! Yaradan tərəfindən nəzərdən keçirilməsi gözlənilir.', undefined, 'success');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message
                || error.response?.data
                || 'Tapşırığı bitirmək mümkün olmadı';
            addToast(errorMessage, undefined, 'error');
        } finally {
            setProcessingFinish(false);
        }
    };

    const handleDownloadAttachment = async (attachmentId: string | number, fileName: string) => {
        if (!userInfo) return;

        try {
            const blob = await attachmentService.downloadAttachment(attachmentId, userInfo.userId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            addToast('Faylı yükləmək mümkün olmadı', undefined, 'error');
        }
    };

    const handlePreviewAttachment = async (attachmentId: string | number) => {
        if (!userInfo) return;

        try {
            const previewUrl = await attachmentService.getPreviewUrl(attachmentId, userInfo.userId);
            if (!previewUrl || previewUrl === 'undefined' || previewUrl === 'null') {
                addToast('Faylın önizləmə URL-i alına bilmədi', undefined, 'error');
                return;
            }

            // Create temporary link to bypass popup blocker
            const link = document.createElement('a');
            link.href = previewUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            addToast(`Faylın önizləməsi mümkün olmadı: ${error.message || 'Naməlum xəta'}`, undefined, 'error');
        }
    };

    const getFileBadgeColor = (contentType: string) => {
        if (contentType.startsWith('image/')) return 'text-blue-400 bg-blue-500/10 border border-blue-500/20';
        if (contentType === 'application/pdf') return 'text-rose-400 bg-rose-500/10 border border-rose-500/20';
        if (contentType.includes('word') || contentType.includes('document')) return 'text-sky-400 bg-sky-500/10 border border-sky-500/20';
        if (contentType.includes('spreadsheet') || contentType.includes('excel')) return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
        return 'text-zinc-400 bg-zinc-500/10 border border-zinc-500/20';
    };

    // Handle comment textarea change with @ mention detection
    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const cursorPosition = e.target.selectionStart;
        setNewComment(value);

        const textBeforeCursor = value.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            const hasSpace = textAfterAt.includes(' ');

            if (!hasSpace && textAfterAt.length > 0) {
                setShowMentionSuggestions(true);
                setMentionQuery(textAfterAt);
                setMentionStartPosition(lastAtIndex);
                setMentionIndex(0);
            } else {
                setShowMentionSuggestions(false);
                setMentionQuery('');
            }
        } else {
            setShowMentionSuggestions(false);
            setMentionQuery('');
        }
    };

    // Handle user selection from mention dropdown
    const handleMentionSelect = (user: UserResponse) => {
        if (mentionStartPosition === -1) return;

        const beforeMention = newComment.substring(0, mentionStartPosition);
        const cursorPos = commentTextareaRef.current?.selectionStart || mentionStartPosition + mentionQuery.length + 1;
        const afterMention = newComment.substring(cursorPos);

        const newText = `${beforeMention}@${user.userName} ${afterMention}`;
        setNewComment(newText);
        setShowMentionSuggestions(false);
        setMentionQuery('');
        setMentionStartPosition(-1);

        setTimeout(() => {
            if (commentTextareaRef.current) {
                const newCursorPos = beforeMention.length + user.userName.length + 2;
                commentTextareaRef.current.focus();
                commentTextareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    // Handle keyboard navigation in mention dropdown
    const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showMentionSuggestions && filteredMentionUsers.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setMentionIndex(prev => (prev + 1) % filteredMentionUsers.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setMentionIndex(prev => (prev - 1 + filteredMentionUsers.length) % filteredMentionUsers.length);
            } else if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleMentionSelect(filteredMentionUsers[mentionIndex]);
            } else if (e.key === 'Escape') {
                setShowMentionSuggestions(false);
            }
        }
    };

    // Render comment content with highlighted mentions
    const renderCommentContent = (content: string) => {
        const mentionRegex = /@(\w+)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = mentionRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }
            parts.push(
                <span key={match.index} className="text-blue-400 font-semibold">
                    @{match[1]}
                </span>
            );
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case TaskStatus.Pending:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{t('statuses.pending', {}, 'Gözləmədə')}</span>;
            case TaskStatus.Assigned:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{t('statuses.assigned', {}, 'Təyin edilib')}</span>;
            case TaskStatus.InProgress:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">{t('statuses.inProgress', {}, 'İcrada')}</span>;
            case TaskStatus.UnderReview:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">{t('statuses.review', {}, 'Nəzərdən keçirilir')}</span>;
            case TaskStatus.Completed:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('statuses.completed', {}, 'Tamamlandı')}</span>;
            case TaskStatus.Expired:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{t('common.overdue', {}, 'Vaxtı bitib')}</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#27272A] text-[#A1A1AA]">{t('common.none', {}, 'Naməlum')}</span>;
        }
    };

    const getDifficultyBadge = (diff: number) => {
        switch (diff) {
            case DifficultyLevel.Easy:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('difficulties.easy', {}, 'Asan')} (+10 {t('common.points', {}, 'xal')})</span>;
            case DifficultyLevel.Medium:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{t('difficulties.medium', {}, 'Orta')} (+20 {t('common.points', {}, 'xal')})</span>;
            case DifficultyLevel.Hard:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{t('difficulties.hard', {}, 'Çətin')} (+30 {t('common.points', {}, 'xal')})</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#27272A] text-[#A1A1AA]">Standart</span>;
        }
    };

    const formatCommentDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'İndi';
        if (diffMins < 60) return `${diffMins} dəq əvvəl`;
        if (diffHours < 24) return `${diffHours} saat əvvəl`;
        if (diffDays < 7) return `${diffDays} gün əvvəl`;
        return date.toLocaleDateString('az-AZ');
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header notificationCount={0} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-[#71717A] font-medium">Tapşırıq məlumatları yüklənir...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (taskError || !task) {
        return (
            <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5]">
                <Sidebar userRole={userRole} />
                <div className="flex flex-1 flex-col h-screen overflow-hidden relative">
                    <Header notificationCount={0} userAvatar={avatarSrc} userEmail={userInfo?.email} />
                    <main className="flex-1 flex items-center justify-center p-6">
                        <div className="flex flex-col items-center gap-4 max-w-md p-8 rounded-2xl bg-[#18181B] border border-[#27272A] text-center shadow-xl">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                                ⚠️
                            </div>
                            <h2 className="text-lg font-bold text-white">Tapşırıq Açılmadı</h2>
                            <p className="text-xs text-[#A1A1AA] leading-relaxed">
                                {taskError || 'Bu ID ilə tapşırıq tapılmadı və ya baxış üçün icazəniz yoxdur.'}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                                <button
                                    onClick={() => loadData()}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Yenidən Cəhd Et
                                </button>
                                <button
                                    onClick={() => navigate('/tasks')}
                                    className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Tapşırıqlara Qayıt
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const filesList = task.files || (task as any).attachments || [];
    const commentsList = comments.length > 0 ? comments : (task.taskComments || (task as any).comments || []);

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

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
                    {/* Top Navigation & Action Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/tasks')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            >
                                <ArrowLeftIcon className="w-4 h-4" />
                                <span>{t('common.back', {}, 'Tapşırıqlara Qayıt')}</span>
                            </button>

                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#27272A] text-[#D4D4D8]">
                                {t('tasks.taskDetails', {}, 'Tapşırıq')} #{task.id}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Edit & Delete Buttons */}
                            {canEdit && (
                                <>
                                    <button
                                        onClick={() => navigate(`/tasks/edit/${task.id}`)}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white transition-colors cursor-pointer"
                                    >
                                        <PencilSquareIcon className="w-4 h-4 text-[#A1A1AA]" />
                                        <span>{t('common.edit', {}, 'Redaktə')}</span>
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                                        title={t('common.delete', {}, 'Tapşırığı Sil')}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Main Two-Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Left Main Content (2 Cols) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Task Overview Card */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-6 sm:p-8 shadow-xs space-y-4">
                                <div className="flex items-center gap-2.5">
                                    {getStatusBadge(task.status)}
                                    {getDifficultyBadge(task.difficulty)}
                                </div>

                                <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                                    {task.title}
                                </h1>

                                <div className="pt-2 border-t border-[#27272A] space-y-2">
                                    <h3 className="text-xs uppercase tracking-wider font-bold text-[#71717A]">
                                        {t('common.description', {}, 'Təsvir')}
                                    </h3>
                                    <p className="text-sm text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">
                                        {task.description || t('tasks.noTasksFound', {}, 'Bu tapşırıq üçün ətraflı təsvir qeyd edilməyib.')}
                                    </p>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            {filesList.length > 0 && (
                                <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2">
                                        <PaperClipIcon className="w-4 h-4 text-[#A1A1AA]" />
                                        <h3 className="text-sm font-bold text-white">
                                            Əlavələr ({filesList.length})
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {filesList.map((file: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 rounded-xl bg-[#1C1C1E] border border-[#27272A] hover:border-[#3F3F46] transition-colors group"
                                            >
                                                <div
                                                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                                                    onClick={() => file.id && handlePreviewAttachment(file.id)}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getFileBadgeColor(file.contentType || '')}`}>
                                                        <PaperClipIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold text-white truncate hover:text-blue-400 transition-colors">
                                                            {file.fileName}
                                                        </p>
                                                        <p className="text-[10px] text-[#71717A] truncate">
                                                            {file.contentType}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                                    {file.id && (
                                                        <>
                                                            <button
                                                                onClick={() => handlePreviewAttachment(file.id)}
                                                                className="p-1.5 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                                                title="Önizləmə"
                                                            >
                                                                <EyeIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadAttachment(file.id, file.fileName)}
                                                                className="p-1.5 rounded-lg text-[#71717A] hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                                                                title="Yüklə"
                                                            >
                                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Activity / Comments Section */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-2">
                                    <ChatBubbleLeftRightIcon className="w-4 h-4 text-[#A1A1AA]" />
                                    <h3 className="text-sm font-bold text-white">Fəaliyyət və Müzakirə</h3>
                                </div>

                                {/* Comments List */}
                                <div className="space-y-3 pt-1">
                                    {commentsList.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-[#71717A]">
                                            Hələlik şərh yoxdur. İlk şərh yazan siz olun!
                                        </div>
                                    ) : (
                                        commentsList.map((comment: any) => {
                                            const commentUser = allUsers.find(u => String(u.id).toLowerCase() === String(comment.userId || '').toLowerCase());
                                            const commentAvatarUrl = getProfilePictureUrl(commentUser?.id, commentUser?.profilePictureUrl);
                                            const authorName = comment.userName || commentUser?.userName || getUserName(comment.userId);
                                            
                                            // Check if this is a system status event comment
                                            const isRevisionComment = comment.content?.includes('[Sistem / Geri Qaytarıldı') || comment.content?.includes('[Düzəliş Tələbi') || comment.content?.includes('Geri Qaytarıldı') || comment.content?.includes('🔄');
                                            const isFinishComment = comment.content?.includes('[Sistem / Bitirildi') || (comment.content?.includes('🏁') && !comment.content?.includes('Geri Qaytarıldı'));
                                            const isApprovalComment = comment.content?.includes('[Sistem / Təsdiqləndi') || comment.content?.includes('✨');
                                            const isRejectComment = comment.content?.includes('[Sistem / İmtina') || comment.content?.includes('❌');
                                            const isSpecialSystemComment = isRevisionComment || isFinishComment || isApprovalComment || isRejectComment;

                                            if (isSpecialSystemComment) {
                                                return (
                                                    <div
                                                        key={comment.id}
                                                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                                                            isRevisionComment
                                                                ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                                                                : isFinishComment
                                                                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                                                                : isRejectComment
                                                                ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                                                                : 'bg-purple-950/20 border-purple-500/30 text-purple-200'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                                                isRevisionComment
                                                                    ? 'bg-amber-500/20 text-amber-400'
                                                                    : isFinishComment
                                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                                    : isRejectComment
                                                                    ? 'bg-rose-500/20 text-rose-400'
                                                                    : 'bg-purple-500/20 text-purple-400'
                                                            }`}
                                                        >
                                                            {isRevisionComment ? (
                                                                <ArrowPathIcon className="w-4 h-4" />
                                                            ) : isFinishComment ? (
                                                                <CheckCircleIcon className="w-4 h-4" />
                                                            ) : isRejectComment ? (
                                                                <XCircleIcon className="w-4 h-4" />
                                                            ) : (
                                                                <SparklesIcon className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-white">
                                                                        {authorName}
                                                                    </span>
                                                                    <span
                                                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                                                            isRevisionComment
                                                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                                : isFinishComment
                                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                                : isRejectComment
                                                                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                                                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                                        }`}
                                                                    >
                                                                        {isRevisionComment ? 'Geri Qaytarıldı' : isFinishComment ? 'Bitirildi' : isRejectComment ? 'İmtina Edildi' : 'Təsdiqləndi'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-[#71717A]">
                                                                    {formatCommentDate(comment.createdAt)}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-[#E4E4E7] leading-relaxed whitespace-pre-wrap font-medium">
                                                                {renderCommentContent(comment.content)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={comment.id} className="p-3.5 rounded-xl bg-[#1C1C1E] border border-[#27272A] flex items-start gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-lg bg-cover bg-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5"
                                                        style={{
                                                            backgroundImage: commentAvatarUrl ? `url("${commentAvatarUrl}")` : undefined
                                                        }}
                                                    >
                                                        {!commentAvatarUrl && authorName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-white">
                                                                {authorName}
                                                            </span>
                                                            <span className="text-[10px] text-[#71717A]">
                                                                {formatCommentDate(comment.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">
                                                            {renderCommentContent(comment.content)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Comment Input with @mention */}
                                <div className="relative pt-2 border-t border-[#27272A]">
                                    {showMentionSuggestions && filteredMentionUsers.length > 0 && (
                                        <UserSuggestionList
                                            users={filteredMentionUsers}
                                            onSelect={handleMentionSelect}
                                            position={{ top: -filteredMentionUsers.length * 48 - 10, left: 0 }}
                                            selectedIndex={mentionIndex}
                                        />
                                    )}

                                    <div className="flex flex-col gap-2.5">
                                        <textarea
                                            ref={commentTextareaRef}
                                            value={newComment}
                                            onChange={handleCommentChange}
                                            onKeyDown={handleCommentKeyDown}
                                            onBlur={() => setTimeout(() => setShowMentionSuggestions(false), 200)}
                                            placeholder="Şərh yazın... komanda üzvlərini qeyd etmək üçün @ işarəsindən istifadə edin"
                                            rows={3}
                                            className="w-full bg-[#1C1C1E] border border-[#27272A] rounded-xl p-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-blue-500 resize-none font-sans"
                                            disabled={submittingComment}
                                        />

                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const cursorPos = commentTextareaRef.current?.selectionStart || newComment.length;
                                                    const newText = newComment.slice(0, cursorPos) + '@' + newComment.slice(cursorPos);
                                                    setNewComment(newText);
                                                    setMentionStartPosition(cursorPos);
                                                    setShowMentionSuggestions(false);
                                                    setTimeout(() => {
                                                        commentTextareaRef.current?.focus();
                                                        commentTextareaRef.current?.setSelectionRange(cursorPos + 1, cursorPos + 1);
                                                    }, 0);
                                                }}
                                                className="flex items-center gap-1 text-[11px] text-[#71717A] hover:text-blue-400 transition-colors cursor-pointer"
                                                title="Komanda üzvünü qeyd et"
                                            >
                                                <AtSymbolIcon className="w-3.5 h-3.5" />
                                                <span>Qeyd etmək üçün @ yazın</span>
                                            </button>

                                            <button
                                                onClick={handleSubmitComment}
                                                disabled={!newComment.trim() || submittingComment}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                <PaperAirplaneIcon className="w-3.5 h-3.5" />
                                                <span>{submittingComment ? 'Göndərilir...' : 'Şərh yaz'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar (1 Col) */}
                        <div className="space-y-6">
                            {/* Properties Card */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-xs space-y-4">
                                <h3 className="text-xs uppercase tracking-wider font-bold text-[#71717A]">
                                    Xüsusiyyətlər
                                </h3>

                                <div className="space-y-3.5 text-xs">
                                    <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                                        <span className="text-[#71717A]">Status</span>
                                        {getStatusBadge(task.status)}
                                    </div>

                                    <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                                        <span className="text-[#71717A]">Çətinlik</span>
                                        {getDifficultyBadge(task.difficulty)}
                                    </div>

                                    <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                                        <span className="text-[#71717A]">Son İcra Tarixi</span>
                                        <div className="flex items-center gap-1.5 text-white font-semibold">
                                            <CalendarIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                            <span>{new Date(task.deadline).toLocaleDateString('az-AZ')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Finish Task Button - Show for assigned user when status is InProgress */}
                                {canFinishTask && (
                                    <div className="pt-2">
                                        <p className="text-[11px] text-[#A1A1AA] mb-2.5">
                                            Tapşırığı bitirdinizsə, yaradanın nəzərdən keçirməsi üçün göndərin.
                                        </p>
                                        <button
                                            onClick={handleFinishTask}
                                            disabled={processingFinish}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>{processingFinish ? 'Göndərilir...' : 'Tapşırığı Bitir'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Accept/Reject Task Banner - Show for assigned user when status is Assigned */}
                            {canAcceptReject && (
                                <div className="rounded-2xl border border-blue-500/30 bg-blue-950/10 p-6 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                            Tapşırığı Cavablayın
                                        </h4>
                                    </div>
                                    <p className="text-xs text-[#A1A1AA]">
                                        Bu tapşırıq sizə təyin edilmişdir. İcraya başlamaq üçün qəbul edin və ya imtina edin.
                                    </p>

                                    <div className="flex flex-col gap-2.5 pt-1">
                                        <button
                                            onClick={handleAcceptTask}
                                            disabled={processingAccept || processingReject}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>{processingAccept ? 'Qəbul edilir...' : 'Tapşırığı Qəbul Et'}</span>
                                        </button>
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={processingAccept || processingReject}
                                            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            <XCircleIcon className="w-4 h-4" />
                                            <span>Tapşırığı Rədd Et</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Performance Points Section - For UnderReview tasks reviewable by creator/manager */}
                            {canAddPerformance && (
                                <div className="rounded-2xl border border-purple-500/30 bg-purple-950/10 p-6 shadow-xs space-y-4">
                                    <div className="flex items-center gap-2 text-purple-400">
                                        <SparklesIcon className="w-5 h-5" />
                                        <h3 className="text-xs uppercase tracking-wider font-bold text-white">
                                            Performans Xalı Əlavə et
                                        </h3>
                                    </div>

                                    <p className="text-xs text-[#A1A1AA]">
                                        Tamamlanmış tapşırıq haqqında fikirlərinizi bölüşün. Xallar çətinliyə əsasən avtomatik hesablanacaq.
                                    </p>

                                    <div className="space-y-3">
                                        <textarea
                                            value={performanceReason}
                                            onChange={(e) => setPerformanceReason(e.target.value)}
                                            placeholder="Bu tamamlanmış tapşırıq haqqında rəy və fikirlərinizi yazın..."
                                            rows={3}
                                            className="w-full bg-[#1C1C1E] border border-[#27272A] rounded-xl p-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-purple-500 resize-none font-sans"
                                            disabled={submittingPerformance}
                                        />

                                        <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                                            <span>
                                                Xallar: {task.difficulty === DifficultyLevel.Easy ? '10' : task.difficulty === DifficultyLevel.Medium ? '20' : '30'} xal
                                            </span>
                                            <span className="font-semibold text-purple-300">
                                                {task.difficulty === DifficultyLevel.Easy ? 'Asan' : task.difficulty === DifficultyLevel.Medium ? 'Orta' : 'Çətin'} Tapşırıq
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleSubmitPerformance}
                                            disabled={!performanceReason.trim() || submittingPerformance}
                                            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                            <span>{submittingPerformance ? 'Xallar əlavə edilir...' : 'Təsdiqlə və Tamamla'}</span>
                                        </button>

                                        {/* Return for Revision Button */}
                                        <button
                                            onClick={() => setShowReturnModal(true)}
                                            disabled={submittingPerformance || processingReturn}
                                            className="w-full py-2 px-4 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-600/20 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                            <span>Yenidən İşlə Göndər</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {/* Under Review Notice for Assignee */}
                            {task.status === TaskStatus.UnderReview && task.assignedToUserId && String(task.assignedToUserId).toLowerCase() === String(userInfo?.userId).toLowerCase() && (
                                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5 shadow-xs space-y-2">
                                    <div className="flex items-center gap-2 text-amber-400">
                                        <ClockIcon className="w-5 h-5" />
                                        <h3 className="text-xs uppercase tracking-wider font-bold text-white">
                                            Nəzərdən Keçirilir
                                        </h3>
                                    </div>
                                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                                        Tapşırıq üzrə işinizi tamamlamısınız. Hazırda tapşırığı yaradan və ya rəhbər tərəfindən nəzərdən keçirilməsi və təsdiqlənməsi gözlənilir.
                                    </p>
                                </div>
                            )}

                            {/* Assignee Card */}
                            <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-6 shadow-xs space-y-4">
                                <h3 className="text-xs uppercase tracking-wider font-bold text-[#71717A]">
                                    İcraçı
                                </h3>
                                {assignedUser ? (
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl bg-cover bg-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0 ring-1 ring-white/10"
                                            style={{
                                                backgroundImage: getProfilePictureUrl(assignedUser.id, assignedUser.profilePictureUrl)
                                                    ? `url("${getProfilePictureUrl(assignedUser.id, assignedUser.profilePictureUrl)}")`
                                                    : undefined
                                            }}
                                        >
                                            {!assignedUser.profilePictureUrl && assignedUser.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{assignedUser.userName}</p>
                                            <p className="text-[11px] text-[#71717A] truncate">{assignedUser.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#71717A]">Heç kim təyin edilməyib</p>
                                )}

                                {createdByUser && (
                                    <div className="mt-4 pt-4 border-t border-[#27272A]">
                                        <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider mb-2">Yaradan</h4>
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-7 h-7 rounded-lg bg-cover bg-center bg-[#27272A] text-white flex items-center justify-center font-bold text-xs"
                                                style={{
                                                    backgroundImage: getProfilePictureUrl(createdByUser.id, createdByUser.profilePictureUrl)
                                                        ? `url("${getProfilePictureUrl(createdByUser.id, createdByUser.profilePictureUrl)}")`
                                                        : undefined
                                                }}
                                            >
                                                {!createdByUser.profilePictureUrl && createdByUser.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-semibold text-white truncate">{createdByUser.userName}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowRejectModal(false)}
                >
                    <div
                        className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-rose-400">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                <h3 className="text-sm font-bold text-white">Tapşırığı Rədd Et</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-[#A1A1AA]">Rədd səbəbini qeyd edin:</p>

                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Niyə bu tapşırığı rədd edirsiniz?"
                            rows={3}
                            className="w-full bg-[#1C1C1E] border border-[#27272A] rounded-xl p-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-rose-500 resize-none font-sans"
                            disabled={processingReject}
                            autoFocus
                        />

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                disabled={processingReject}
                                className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold cursor-pointer"
                            >
                                Ləğv et
                            </button>
                            <button
                                onClick={handleRejectTask}
                                disabled={!rejectReason.trim() || processingReject}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
                            >
                                {processingReject ? 'Rədd edilir...' : 'Rədd Et'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return for Revision Modal */}
            {showReturnModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowReturnModal(false)}
                >
                    <div
                        className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-400">
                                <ArrowPathIcon className="w-5 h-5" />
                                <h3 className="text-sm font-bold text-white">Yenidən İşlə Göndər</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowReturnModal(false);
                                    setReturnReason('');
                                }}
                                className="p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-[#A1A1AA]">Niyə tapşırığı geri göndərirsiniz?</p>

                        <textarea
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            placeholder="Tapşırığın niyə yenidən işlənməli olduğunu izah edin..."
                            rows={3}
                            className="w-full bg-[#1C1C1E] border border-[#27272A] rounded-xl p-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-amber-500 resize-none font-sans"
                            disabled={processingReturn}
                            autoFocus
                        />

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                onClick={() => {
                                    setShowReturnModal(false);
                                    setReturnReason('');
                                }}
                                disabled={processingReturn}
                                className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold cursor-pointer"
                            >
                                Ləğv et
                            </button>
                            <button
                                onClick={handleReturnForRevision}
                                disabled={!returnReason.trim() || processingReturn}
                                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg cursor-pointer disabled:opacity-50"
                            >
                                {processingReturn ? 'Göndərilir...' : 'Geri Göndər'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskDetail;
