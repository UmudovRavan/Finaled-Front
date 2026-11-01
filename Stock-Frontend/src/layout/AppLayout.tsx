import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from '../components/CommandPalette';
import { Modal } from '../components/common';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FA] dark:bg-[#121214] text-slate-800 dark:text-[#F4F4F5] font-sans antialiased transition-colors duration-200">
      {/* 1. Sidebar with Collapse / Expand (CRM Style, Fixed) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotification={() => setIsNotificationOpen(true)}
      />

      {/* 2. Main Scrollable Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto scroll-smooth">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto pb-16">
          <Outlet />
        </main>
      </div>

      {/* 3. Ctrl+K Command Palette Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 4. Notifications Drawer/Modal */}
      <Modal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        title="Notifications"
        subtitle="Stock movement alerts and transactions"
      >
        <div className="space-y-2 py-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A]">
            <p className="font-semibold text-slate-900 dark:text-white">New Stock Entry Completed</p>
            <p className="text-slate-500 mt-0.5">DOC-2026-0042 confirmed by Rəşad Əliyev</p>
            <span className="text-[10px] text-slate-400 mt-1 block">14 minutes ago</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A]">
            <p className="font-semibold text-amber-500">Low Stock Notification</p>
            <p className="text-slate-500 mt-0.5">Logitech MX Master 3S has reached reorder threshold (4 remaining)</p>
            <span className="text-[10px] text-slate-400 mt-1 block">1 hour ago</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};
