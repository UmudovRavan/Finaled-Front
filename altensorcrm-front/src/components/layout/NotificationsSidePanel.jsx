import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { taskManagementApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const NotificationsSidePanel = ({ isOpen, onClose, sidebarWidth = 224 }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

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
    if (isOpen) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

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
      message.includes('şərh yazıldı') ||
      message.includes('mention edildin') ||
      message.includes('şərh') ||
      message.includes('comment');

    onClose();

    if (isCommentNotification) {
      navigate('/crm/leads', { state: { openTab: 'Comments', fromNotification: true } });
    } else {
      navigate('/crm/tasks', { state: { selectedTaskId: targetTaskId } });
    }
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Side Panel Drawer (Matching User Reference Image) */}
      <div
        className="fixed inset-y-0 w-[360px] sm:w-[380px] bg-[#141416] border-r border-[#2C2C2E] shadow-2xl flex flex-col pointer-events-auto transition-transform duration-200 ease-out z-50 text-[#E4E4E7] font-sans selection:bg-fuchsia-500/30"
        style={{ left: `${sidebarWidth}px` }}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272A]/80 bg-[#18181B] shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white tracking-tight">{t('nav.notifications', {}, 'Bildirişlər')}</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-bold border border-fuchsia-500/30">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[#A1A1AA]">
            <button
              type="button"
              onClick={handleMarkAllRead}
              title={t('notifications.markAllRead', {}, 'Hamısını oxunmuş et')}
              className="p-1.5 rounded-lg hover:bg-[#2C2C2E] hover:text-white transition-colors cursor-pointer text-[#A1A1AA] hover:text-[#38BDF8]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 7 17l-5-5" />
                <path d="m22 10-7.5 7.5L13 16" />
              </svg>
            </button>

            <button
              type="button"
              onClick={onClose}
              title={t('common.close', {}, 'Bağla')}
              className="p-1 rounded-lg hover:bg-[#2C2C2E] hover:text-white transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-xs text-[#71717A] my-auto">
              <ArrowPathIcon className="w-4 h-4 animate-spin text-sky-400" />
              <span>{t('common.loading', {}, 'Yüklənir...')}</span>
            </div>
          ) : notifications.length === 0 ? (
            /* EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none my-auto">
              <BellIcon className="w-12 h-12 text-[#52525B] stroke-[1.25] mb-3" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                {t('notifications.noNotifications', {}, 'Yeni bildiriş yoxdur')}
              </h3>
              <p className="text-xs text-[#71717A] mt-1">
                {t('notifications.noNotificationsDesc', {}, 'Hal-hazırda heç bir bildirişiniz mövcud deyil')}
              </p>
            </div>
          ) : (
            /* NOTIFICATIONS LIST */
            <div className="space-y-2.5 w-full">
              {notifications.map((item) => (
                <div
                  key={item.id || item.Id || Math.random()}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.isRead
                      ? 'bg-[#18181B]/60 border-[#27272A]/60 text-[#A1A1AA]'
                      : 'bg-[#1C1C1E] border-sky-500/30 text-white shadow-lg hover:border-sky-500/60'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    item.isRead ? 'bg-[#27272A] text-[#71717A]' : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    <BellIcon className="w-4 h-4 stroke-[2]" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${item.isRead ? 'text-[#E4E4E7]' : 'text-white'}`}>
                        {item.title || item.Title || t('notifications.notification', {}, 'Bildiriş')}
                      </h4>
                      <span className="text-[10px] text-[#71717A] shrink-0">
                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('common.now', {}, 'İndi')}
                      </span>
                    </div>

                    <p className="text-xs text-[#A1A1AA] leading-normal line-clamp-2">
                      {item.message || item.Message || ''}
                    </p>
                  </div>

                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1.5" />
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
