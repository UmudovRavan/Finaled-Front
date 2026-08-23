import React from 'react';
import { useNotifications } from '../context';
import { useNavigate } from 'react-router-dom';
import {
    BellAlertIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    XMarkIcon,
    ArrowRightIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';

const NotificationToast: React.FC = () => {
    const { toasts, dismissToast, dismissAllToasts } = useNotifications();
    const navigate = useNavigate();

    if (toasts.length === 0) return null;

    const handleViewTask = (taskId: string | number | undefined, toastId: number) => {
        dismissToast(toastId);
        if (taskId) {
            navigate(`/tasks/${taskId}`);
        } else {
            navigate('/notifications');
        }
    };

    const handleViewAll = () => {
        dismissAllToasts();
        navigate('/notifications');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 max-h-[80vh] overflow-visible pointer-events-auto select-none font-sans">
            {/* Show "View All" button when multiple toasts */}
            {toasts.length > 1 && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <button
                        onClick={handleViewAll}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1C1C1E] border border-blue-500/40 text-blue-400 rounded-full text-xs font-bold shadow-2xl hover:bg-blue-500/20 transition-all cursor-pointer"
                    >
                        <BellAlertIcon className="w-3.5 h-3.5" />
                        <span>{toasts.length} yeni bildiriş</span>
                        <ArrowRightIcon className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Toast stack - show max 3 at a time */}
            {toasts.slice(0, 3).map((toast, index) => (
                <div
                    key={toast.id}
                    className="animate-in fade-in slide-in-from-bottom-3 duration-200"
                    style={{
                        animationDelay: `${index * 50}ms`,
                        opacity: 1 - index * 0.08,
                        transform: `scale(${1 - index * 0.02})`,
                    }}
                >
                    <div className="flex items-start gap-3.5 bg-[#18181B]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#27272A] p-4 max-w-sm text-white">
                        {/* Icon */}
                        <div
                            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${
                                toast.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : toast.type === 'error'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}
                        >
                            {toast.type === 'success' ? (
                                <CheckCircleIcon className="w-5 h-5 stroke-[2]" />
                            ) : toast.type === 'error' ? (
                                <ExclamationCircleIcon className="w-5 h-5 stroke-[2]" />
                            ) : (
                                <BellAlertIcon className="w-5 h-5 stroke-[2]" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        toast.type === 'success'
                                            ? 'bg-emerald-400'
                                            : toast.type === 'error'
                                            ? 'bg-rose-400'
                                            : 'bg-blue-400 animate-pulse'
                                    }`}
                                ></span>
                                <p className="text-xs font-bold text-white">
                                    {toast.type === 'success'
                                        ? 'Uğurlu'
                                        : toast.type === 'error'
                                        ? 'Xəta'
                                        : 'Yeni Bildiriş'}
                                </p>
                            </div>

                            <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2">
                                {toast.message}
                            </p>

                            <button
                                onClick={() => handleViewTask(toast.taskId, toast.id)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 mt-2 transition-colors cursor-pointer"
                            >
                                <span>{toast.taskId ? 'Tapşırığa bax' : 'Hamısına bax'}</span>
                                <ArrowRightIcon className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => dismissToast(toast.id)}
                            className="shrink-0 p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}

            {/* Hidden toasts indicator */}
            {toasts.length > 3 && (
                <div className="text-center">
                    <span className="text-[10px] text-[#71717A] bg-[#18181B] border border-[#27272A] px-2.5 py-0.5 rounded-full">
                        +{toasts.length - 3} daha çox bildiriş
                    </span>
                </div>
            )}
        </div>
    );
};

export default NotificationToast;
