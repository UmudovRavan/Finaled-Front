import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CrmSidebar from '../components/layout/CrmSidebar';
import CrmMobileBottomNav from '../components/layout/CrmMobileBottomNav';
import NotificationsSidePanel from '../components/layout/NotificationsSidePanel';

const CrmLayout = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarWidth = isSidebarCollapsed ? 64 : 224;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5] selection:bg-fuchsia-500/30 relative">
      {/* Sidebar (Desktop fixed / Mobile off-canvas drawer) */}
      <CrmSidebar
        isNotificationsOpen={isNotificationsOpen}
        onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)}
      />

      {/* Side Panel Drawer for notifications */}
      <NotificationsSidePanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        sidebarWidth={sidebarWidth}
      />

      {/* Main Scrollable Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#121214] scroll-smooth">
        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on mobile md:hidden) */}
      <CrmMobileBottomNav />
    </div>
  );
};

export default CrmLayout;
