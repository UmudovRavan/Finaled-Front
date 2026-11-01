import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string; // e.g. 'indigo', 'rose', 'emerald', 'amber', 'cyan'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'indigo',
}) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-400',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-400',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
    },
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-400',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-400',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
    },
    cyan: {
      bg: 'bg-cyan-500/10 text-cyan-400',
      text: 'text-cyan-400',
      border: 'border-cyan-500/20',
    },
    neon: {
      bg: 'bg-gradient-to-r from-pink-500/20 to-indigo-500/20 text-pink-400',
      text: 'text-pink-400',
      border: 'border-pink-500/30',
    },
  };

  const scheme = colorMap[accentColor] || colorMap.indigo;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${scheme.bg} ${scheme.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </h3>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
};

