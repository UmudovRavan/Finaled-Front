import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, Header } from '../layout';
import { notificationService, authService } from '../api';
import type { NotificationResponse } from '../dto';
import { parseJwtToken, isTokenExpired, getPrimaryRole, getProfilePictureUrl } from '../utils';
import type { UserInfo } from '../utils';
import {
    BellIcon,
    CheckIcon,
    CheckCircleIcon,
    XMarkIcon,
    ExclamationCircleIcon,
    AtSymbolIcon,
    InboxIcon,
    ArrowPathIcon,
    ChatBubbleLeftEllipsisIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

type FilterTab = 'all' | 'unread' | 'mentions';

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

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
        if (!userInfo || !userInfo.roles?.length) return 'Employee';
        return getPrimaryRole(userInfo.roles);
    }, [userInfo]);

    const avatarSrc = useMemo(() => {
        return getProfilePictureUrl(userInfo?.userId, userInfo?.profilePictureUrl);
    }, [userInfo]);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.isRead).length;
    }, [notifications]);

    // Filter notifications based on active tab
    const filteredNotifications = useMemo(() => {
        switch (activeTab) {
            case 'unread':
                return notifications.filter((n) => !n.isRead);
            case 'mentions':
                return notifications.filter(
                    (n) => n.message.toLowerCase().includes('mention') || n.message.includes('@')
                );
            default:
                return notifications;
        }
    }, [notifications, activeTab]);

    // Group notifications by date
    const groupedNotifications = useMemo(() => {
        const groups: { [key: string]: NotificationResponse[] } = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        filteredNotifications.forEach((notification) => {
            const date = new Date(notification.createdAt);
            date.setHours(0, 0, 0, 0);

            let groupKey: string;
            if (date.getTime() === today.getTime()) {
                groupKey = 'Bu gün';
            } else if (date.getTime() === yesterday.getTime()) {
                groupKey = 'Dünən';
            } else {
                groupKey = date.toLocaleDateString('az-AZ', { month: 'short', day: 'numeric', year: 'numeric' });
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(notification);
        });

        return groups;
    }, [filteredNotifications]);

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

        loadNotifications();
    }, [navigate]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getMyNotifications();
            const sorted = data.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(sorted);
        } catch {
            setNotifications([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
    };

    const handleNotificationClick = async (notification: NotificationResponse) => {
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
                );
            } catch {
                // silent
            }
        }

        const taskId = notification.taskId || notification.relatedTaskId;
        if (taskId) {
            navigate(`/tasks/${taskId}`);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter((n) => !n.isRead);
            await Promise.all(unreadNotifications.map((n) => notificationService.markAsRead(n.id)));
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch {
            // silent
        }
    };

    const formatRelativeTime = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'İndi';
        if (diffMins < 60) return `${diffMins} dəq əvvəl`;
        if (diffHours < 24) return `${diffHours} saat əvvəl`;
        if (diffDays === 1) return 'Dünən';
        if (diffDays < 7) return `${diffDays} gün əvvəl`;
        return date.toLocaleDateString('az-AZ', { month: 'short', day: 'numeric' });
    }, []);

    const getNotificationTypeConfig = (message: string) => {
        const msg = message.toLowerCase();
        if (msg.includes('mention') || msg.includes('@')) {
            return {
                icon: AtSymbolIcon,
                bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                badgeText: 'Mention',
            };
        }
        if (msg.includes('qəbul') || msg.includes('accept') || msg.includes('bitdi') || msg.includes('tamamlandı')) {
            return {
                icon: CheckCircleIcon,
                bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                badgeText: 'Təsdiq',
            };
        }
        if (msg.includes('rədd') || msg.includes('reject') || msg.includes('qaytarıldı')) {
            return {
                icon: ExclamationCircleIcon,
                bgColor: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                badgeText: 'Diqqət',
            };
        }
        if (msg.includes('şərh') || msg.includes('comment')) {
            return {
                icon: ChatBubbleLeftEllipsisIcon,
                bgColor: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                badgeText: 'Şərh',
            };
        }
        return {
            icon: BellIcon,
            bgColor: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
            badgeText: 'Bildiriş',
        };
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
                            <p className="text-xs text-[#71717A] font-medium">Bildirişlər yüklənir...</p>
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
                    notificationCount={unreadCount}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#27272A]">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    Bildirişlər
                                </h1>
                                {unreadCount > 0 && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                                        {unreadCount} yeni
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-[#A1A1AA] mt-1">
                                Son tapşırıq hərəkətləri, təyinatlar və rəylər.
                            </p>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                                title="Yenilə"
                                type="button"
                            >
                                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>

                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#D4D4D8] hover:text-white transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center -space-x-1 text-emerald-400">
                                        <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </div>
                                    <span>Hamısını oxunmuş et</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 border-b border-[#27272A] pb-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === 'all'
                                    ? 'bg-[#18181B] text-white border border-[#27272A] shadow-xs'
                                    : 'text-[#71717A] hover:text-[#D4D4D8]'
                            }`}
                        >
                            Hamısı ({notifications.length})
                        </button>

                        <button
                            onClick={() => setActiveTab('unread')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === 'unread'
                                    ? 'bg-[#18181B] text-white border border-[#27272A] shadow-xs'
                                    : 'text-[#71717A] hover:text-[#D4D4D8]'
                            }`}
                        >
                            <span>Oxunmamış</span>
                            {unreadCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('mentions')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                activeTab === 'mentions'
                                    ? 'bg-[#18181B] text-white border border-[#27272A] shadow-xs'
                                    : 'text-[#71717A] hover:text-[#D4D4D8]'
                            }`}
                        >
                            @ Mentionlar
                        </button>
                    </div>

                    {/* Notifications List */}
                    {filteredNotifications.length > 0 ? (
                        <div className="space-y-6">
                            {Object.entries(groupedNotifications).map(([groupName, groupItems]) => (
                                <div key={groupName} className="space-y-3">
                                    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#71717A] px-1">
                                        {groupName}
                                    </h3>

                                    <div className="rounded-2xl border border-[#27272A] bg-[#18181B] divide-y divide-[#27272A] overflow-hidden shadow-xs">
                                        {groupItems.map((notification) => {
                                            const typeConfig = getNotificationTypeConfig(notification.message);
                                            const Icon = typeConfig.icon;
                                            const taskId = notification.taskId || notification.relatedTaskId;

                                            return (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className={`p-4 transition-all cursor-pointer flex items-start gap-4 group relative ${
                                                        notification.isRead
                                                            ? 'hover:bg-white/[0.02] bg-[#18181B]'
                                                            : 'bg-blue-500/[0.04] hover:bg-blue-500/[0.07]'
                                                    }`}
                                                >
                                                    {/* Unread Left Border Highlight */}
                                                    {!notification.isRead && (
                                                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full"></div>
                                                    )}

                                                    {/* Notification Type Icon */}
                                                    <div
                                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${typeConfig.bgColor}`}
                                                    >
                                                        <Icon className="w-5 h-5 stroke-[2]" />
                                                    </div>

                                                    {/* Notification Content */}
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                    {notification.title || 'Bildiriş'}
                                                                </span>
                                                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${typeConfig.bgColor}`}>
                                                                    {typeConfig.badgeText}
                                                                </span>
                                                            </div>

                                                            <span className="text-[11px] text-[#71717A] shrink-0 font-medium">
                                                                {formatRelativeTime(notification.createdAt)}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-[#A1A1AA] leading-relaxed">
                                                            {notification.message}
                                                        </p>

                                                        {taskId && (
                                                            <div className="pt-2">
                                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300">
                                                                    <span>Tapşırığa bax</span>
                                                                    <span>→</span>
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 rounded-2xl border border-[#27272A] bg-[#18181B]">
                            <div className="w-14 h-14 rounded-2xl bg-[#27272A] flex items-center justify-center text-[#71717A] mb-1">
                                <InboxIcon className="w-7 h-7 stroke-[1.5]" />
                            </div>
                            <h3 className="text-base font-bold text-white tracking-tight">
                                {activeTab === 'unread'
                                    ? 'Oxunmamış bildiriş yoxdur'
                                    : activeTab === 'mentions'
                                    ? 'Sizdən bəhs edilməyib'
                                    : 'Yeni bildiriş yoxdur'}
                            </h3>
                            <p className="text-xs text-[#71717A] max-w-sm">
                                Bütün tapşırıqlar və fəaliyyətlər üzrə ən son yeniliklər burada göstəriləcək.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Notifications;
