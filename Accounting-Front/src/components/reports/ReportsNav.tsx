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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar border-b border-[#27272A] mb-4">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-[#27272A] text-white border border-white/10 shadow-sm'
                                    : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                            }`
                        }
                    >
                        <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{tab.label}</span>
                    </NavLink>
                );
            })}
        </div>
    );
};

export default ReportsNav;
