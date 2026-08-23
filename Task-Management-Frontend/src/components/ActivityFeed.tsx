import React from 'react';
import type { NotificationResponse } from '../dto';
import {
    CheckCircleIcon,
    ChatBubbleLeftEllipsisIcon,
    DocumentPlusIcon,
    BellIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';

interface ActivityFeedProps {
    notifications: NotificationResponse[];
    onViewAll?: () => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ notifications, onViewAll }) => {
    const formatTimeAgo = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'İndi';
        if (diffMins < 60) return `${diffMins} dəq əvvəl`;
        if (diffHours < 24) return `${diffHours} saat əvvəl`;
        return `${diffDays} gün əvvəl`;
    };

    const getActivityIcon = (message: string) => {
        const lower = message.toLowerCase();
        if (lower.includes('assigned') || lower.includes('təyin')) {
            return <UserPlusIcon className="w-4 h-4 text-sky-400" />;
        }
        if (lower.includes('comment') || lower.includes('şərh')) {
            return <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-amber-400" />;
        }
        if (lower.includes('create') || lower.includes('yaradıldı')) {
            return <DocumentPlusIcon className="w-4 h-4 text-indigo-400" />;
        }
        if (lower.includes('complete') || lower.includes('tamamlandı')) {
            return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />;
        }
        return <BellIcon className="w-4 h-4 text-purple-400" />;
    };

    return (
        <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-5 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500"></span>
                    <h3 className="text-sm font-bold text-white tracking-tight">Son Fəaliyyətlər</h3>
                </div>
                <button
                    onClick={onViewAll}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                    Hamısına bax
                </button>
            </div>

            <div className="flex flex-col divide-y divide-[#27272A] overflow-y-auto max-h-80 custom-scrollbar pr-1">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-[#71717A]">
                        <BellIcon className="w-6 h-6 mb-2 text-[#52525B]" />
                        <span>Hələlik yeni fəaliyyət yoxdur</span>
                    </div>
                ) : (
                    notifications.slice(0, 6).map((notification) => (
                        <div key={notification.id} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0">
                            <div className="w-7 h-7 rounded-lg bg-[#27272A] flex items-center justify-center shrink-0 mt-0.5">
                                {getActivityIcon(notification.message)}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <p className="text-xs font-medium text-[#E4E4E7] leading-snug">
                                    {notification.message}
                                </p>
                                <span className="text-[10px] text-[#71717A]">
                                    {formatTimeAgo(notification.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
