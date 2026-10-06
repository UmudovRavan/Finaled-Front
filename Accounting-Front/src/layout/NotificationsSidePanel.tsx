import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BellIcon,
    XMarkIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';

interface NotificationItem {
    id: string;
    title?: string;
    message?: string;
    isRead?: boolean;
    createdAt?: string;
}

interface NotificationsSidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    sidebarWidth?: number;
}

export const NotificationsSidePanel: React.FC<NotificationsSidePanelProps> = ({
    isOpen,
    onClose,
    sidebarWidth = 224,
}) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // Attempt to load mock or real notifications
            const timer = setTimeout(() => {
                setNotifications([
                    {
                        id: '1',
                        title: 'Maliyyə Dövrləri',
                        message: 'Cari ay üzrə maliyyə əməliyyat dövrü açıqdır.',
                        isRead: false,
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: '2',
                        title: 'Jurnal Balansı',
                        message: 'Baş kitab üzrə son əməliyyatlar uğurla qeydə alındı.',
                        isRead: true,
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                    },
                ]);
                setLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleMarkAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleNotificationClick = (item: NotificationItem) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        onClose();
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="fixed inset-0 z-50 flex pointer-events-none">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Side Panel Drawer */}
            <div
                className="fixed inset-y-0 w-[360px] sm:w-[380px] bg-[#141416] border-r border-[#2C2C2E] shadow-2xl flex flex-col pointer-events-auto transition-transform duration-200 ease-out z-50 text-[#E4E4E7] font-sans selection:bg-white/20"
                style={{ left: `${sidebarWidth}px` }}
            >
                {/* Header Bar */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272A]/80 bg-[#18181B] shrink-0">
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-base font-bold text-white tracking-tight">Bildirişlər</h2>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/20">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-[#A1A1AA]">
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            title="Hamısını oxunmuş et"
                            className="p-1.5 rounded-lg hover:bg-[#2C2C2E] hover:text-white transition-colors cursor-pointer text-[#A1A1AA]"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 7 17l-5-5" />
                                <path d="m22 10-7.5 7.5L13 16" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            title="Bağla"
                            className="p-1 rounded-lg hover:bg-[#2C2C2E] hover:text-white transition-colors cursor-pointer"
                        >
                            <XMarkIcon className="w-5 h-5 stroke-[2]" />
                        </button>
                    </div>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-[#71717A] my-auto">
                            <ArrowPathIcon className="w-4 h-4 animate-spin text-white" />
                            <span>Yüklənir...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none my-auto">
                            <BellIcon className="w-12 h-12 text-[#52525B] stroke-[1.25] mb-3" />
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                Yeni bildiriş yoxdur
                            </h3>
                            <p className="text-xs text-[#71717A] mt-1">
                                Hal-hazırda heç bir bildirişiniz mövcud deyil
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2.5 w-full">
                            {notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleNotificationClick(item)}
                                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                                        item.isRead
                                            ? 'bg-[#18181B]/60 border-[#27272A]/60 text-[#A1A1AA]'
                                            : 'bg-[#1C1C1E] border-white/20 text-white shadow-lg hover:border-white/40'
                                    }`}
                                >
                                    <div
                                        className={`p-2 rounded-lg shrink-0 ${
                                            item.isRead ? 'bg-[#27272A] text-[#71717A]' : 'bg-white/10 text-white'
                                        }`}
                                    >
                                        <BellIcon className="w-4 h-4 stroke-[2]" />
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-0.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className={`text-xs font-bold truncate ${item.isRead ? 'text-[#E4E4E7]' : 'text-white'}`}>
                                                {item.title}
                                            </h4>
                                            <span className="text-[10px] text-[#71717A] shrink-0">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'İndi'}
                                            </span>
                                        </div>

                                        <p className="text-xs text-[#A1A1AA] leading-normal line-clamp-2">
                                            {item.message}
                                        </p>
                                    </div>

                                    {!item.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-white shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsSidePanel;
