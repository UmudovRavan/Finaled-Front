import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    ScaleIcon,
    DocumentChartBarIcon,
    ArrowTrendingUpIcon,
    BuildingLibraryIcon,
    BanknotesIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

interface NavTab {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const TABS: NavTab[] = [
    { to: '/reports/trial-balance', label: 'Sınaq Balansı', icon: ScaleIcon },
    { to: '/reports/financial-position', label: 'Maliyyə Vəziyyəti (IFRS)', icon: DocumentChartBarIcon },
    { to: '/reports/profit-or-loss', label: 'Mənfəət və Zərər (P&L)', icon: ArrowTrendingUpIcon },
    { to: '/reports/changes-in-equity', label: 'Kapitalda Dəyişikliklər', icon: BuildingLibraryIcon },
    { to: '/reports/cash-flow', label: 'Pul Vəsaitlərinin Hərəkəti', icon: BanknotesIcon },
    { to: '/reports/aging', label: 'Borcların Yaşlanması', icon: ClockIcon },
];

export const ReportsNav: React.FC = () => {
    return (
        <div className="flex items-center justify-between gap-2 p-1.5 bg-[#121214] border border-[#27272A] rounded-2xl overflow-x-auto scrollbar-none shadow-sm mb-4">
            <div className="flex items-center gap-1 shrink-0">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white text-black font-semibold shadow-xs'
                                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                                }`
                            }
                        >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span>{tab.label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportsNav;

