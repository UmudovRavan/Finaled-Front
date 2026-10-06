import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';

export const AppLayout: React.FC = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#121214] font-sans antialiased text-[#F4F4F5] selection:bg-white/20 relative">
            {/* Sidebar (Desktop fixed / Mobile off-canvas drawer) */}
            <Sidebar
                onCollapseChange={(collapsed) => setIsSidebarCollapsed(collapsed)}
            />

            {/* Main Scrollable Workspace Container */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#121214] scroll-smooth">
                <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 md:pb-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
};

export default AppLayout;
