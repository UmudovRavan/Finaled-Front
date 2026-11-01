import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye } from 'lucide-react';

interface StockKpiCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  onViewDetails?: () => void;
}

export const StockKpiCard: React.FC<StockKpiCardProps> = ({
  title,
  value,
  subtitle,
  onViewDetails,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs relative transition-colors duration-200 flex flex-col justify-between">
      {/* Title & 3 dots */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-normal text-slate-600 dark:text-[#A1A1AA]">
          {title}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          >
            <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-6 w-32 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-30 text-xs text-slate-700 dark:text-[#D4D4D8] animate-in fade-in duration-100">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onViewDetails) onViewDetails();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-left"
              >
                <Eye className="w-3 h-3 text-slate-400" />
                <span>Details</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Big Number */}
      <div className="my-0.5">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </h3>
      </div>

      {/* Subtitle / Trend */}
      <div className="mt-1 text-[11px] text-slate-400 dark:text-[#71717A]">
        {subtitle}
      </div>
    </div>
  );
};
