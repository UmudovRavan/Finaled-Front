import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Squares2X2Icon,
    ClipboardDocumentListIcon,
    UserGroupIcon,
    BanknotesIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';

export const MobileBottomNav: React.FC = () => {
    const location = useLocation();

    const handleOpenMenu = () => {
        window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
    };

    const tabs = [
        {
            path: '/dashboard',
            label: 'Panel',
            icon: Squares2X2Icon,
        },
        {
            path: '/accounts',
            label: 'Hesablar',
            icon: ClipboardDocumentListIcon,
        },
        {
            path: '/customers',
            label: 'Müştərilər',
            icon: UserGroupIcon,
        },
        {
            path: '/payments',
            label: 'Ödənişlər',
            icon: BanknotesIcon,
        },
    ];

    return (
        <nav
            aria-label="Mobil alt naviqasiya"
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#18181B]/95 backdrop-blur-xl border-t border-[#27272A] px-2 py-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-2xl select-none"
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname.startsWith(tab.path);

                return (
                    <NavLink
                        key={tab.path}
                        to={tab.path}
                        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[56px] ${
                            isActive
                                ? 'text-white font-semibold'
                                : 'text-[#A1A1AA] hover:text-white'
                        }`}
                    >
                        <div className="relative">
                            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'}`} />
                        </div>
                        <span className="text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-[64px]">
                            {tab.label}
                        </span>
                    </NavLink>
                );
            })}

            {/* Menu Trigger Button */}
            <button
                type="button"
                onClick={handleOpenMenu}
                className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#A1A1AA] hover:text-white transition-all min-w-[56px] cursor-pointer"
                aria-label="Menyu"
            >
                <div className="relative">
                    <Bars3Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight leading-none">
                    Menyu
                </span>
            </button>
        </nav>
    );
};

export default MobileBottomNav;
