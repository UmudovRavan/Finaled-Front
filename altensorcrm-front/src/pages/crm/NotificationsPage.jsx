import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../context/LanguageContext';
import { taskManagementApi } from '../../services/api';

const NotificationsPage = () => {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const data = await taskManagementApi.getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn('Notifications fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Real-time polling every 4 seconds
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(
        notifications.filter(n => !n.isRead && n.id).map(n => taskManagementApi.markNotificationRead(n.id))
      );
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn('Mark read error:', err);
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await taskManagementApi.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.warn('Mark one read error:', err);
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.isRead && item.id) {
      try {
        await taskManagementApi.markNotificationRead(item.id);
      } catch (err) {
        console.warn('Mark read error:', err);
      }
    }

    const message = item.message || item.Message || '';
    const targetTaskId = item.taskId || item.TaskId;

    const isCommentNotification =
      message.includes('şərh') ||
      message.includes('comment') ||
      message.includes('комментарий');

    if (isCommentNotification) {
      navigate('/crm/leads', { state: { openTab: 'Comments', fromNotification: true } });
    } else {
      navigate('/crm/tasks', { state: { selectedTaskId: targetTaskId } });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-full w-full flex flex-col font-sans select-none overflow-hidden relative">
      
      {/* HEADER BAR (Matching Reference Screenshot) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]/70 bg-[#141416]/60 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white tracking-tight">{t('notifications.pageTitle', {}, 'Notifications')}</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-xs font-bold border border-fuchsia-500/30">
              {unreadCount} {language === 'az' ? 'yeni' : language === 'en' ? 'new' : 'новых'}
            </span>
          )}
        </div>

        {/* Action Icons (Check All + Close) */}
        <div className="flex items-center gap-3 text-[#A1A1AA]">
          <button
            onClick={handleMarkAllRead}
            title={t('notifications.markAllRead', {}, 'Mark all as read')}
            className="p-1.5 rounded-xl hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
          >
            <div className="flex items-center -space-x-1">
              <CheckIcon className="w-4 h-4 stroke-[2.5]" />
              <CheckIcon className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>

          <button
            onClick={() => navigate('/crm/dashboard')}
            title={t('common.close', {}, 'Close')}
            className="p-1.5 rounded-xl hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer"
          >
            <XMarkIcon className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <ArrowPathIcon className="w-4 h-4 animate-spin text-sky-400" />
            <span>{t('common.loading', {}, 'Notifications loading...')}</span>
          </div>
        ) : notifications.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-sm animate-in fade-in duration-200">
            <div className="p-4 rounded-full bg-[#1C1C1E] border border-[#2C2C2E] text-[#71717A] mb-1 shadow-inner">
              <BellIcon className="w-10 h-10 stroke-[1.5]" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              {t('notifications.noNotifications', {}, 'No New Notifications')}
            </h3>

            <p className="text-xs text-[#71717A] leading-relaxed">
              {language === 'az' ? 'Sizdə yeni bildiriş yoxdur' : language === 'en' ? 'You have no new notifications' : 'У вас нет новых уведомлений'}
            </p>
          </div>
        ) : (
          /* NOTIFICATIONS LIST STATE */
          <div className="w-full max-w-2xl h-full overflow-auto space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id || item.Id || Math.random()}
                onClick={() => handleNotificationClick(item)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  item.isRead
                    ? 'bg-[#141416]/40 border-[#27272A]/50 text-[#A1A1AA]'
                    : 'bg-[#1C1C1E] border-sky-500/30 text-white shadow-xl hover:border-sky-500/50'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  item.isRead ? 'bg-[#27272A] text-[#71717A]' : 'bg-sky-500/20 text-sky-400'
                }`}>
                  <BellIcon className="w-5 h-5 stroke-[2]" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold truncate ${item.isRead ? 'text-[#E4E4E7]' : 'text-white'}`}>
                      {item.title || item.Title || 'Tapşırıq Təyinatı'}
                    </h4>
                    <span className="text-[10px] text-[#71717A] shrink-0">
                      {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                    </span>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-normal line-clamp-2">
                    {item.message || item.Message || 'Sizə yeni tapşırıq təyin edildi.'}
                  </p>
                </div>

                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-2"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationsPage;
