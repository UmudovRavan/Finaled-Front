import React from 'react';
import {
  Printer,
  Heart,
  Plus,
} from 'lucide-react';
import type { StockReconciliationRecord } from '../../types';

interface StockReconciliationDetailSidebarProps {
  entry: StockReconciliationRecord;
  onToggleLike?: () => void;
}

export const StockReconciliationDetailSidebar: React.FC<
  StockReconciliationDetailSidebarProps
> = ({ entry, onToggleLike }) => {
  return (
    <div className="w-full lg:w-64 shrink-0 font-sans text-xs space-y-4">
      {/* Top Header: ID + Print + Heart */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
        <div className="font-semibold text-slate-900 dark:text-white truncate pr-2">
          {entry.id}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4 stroke-[1.75]" />
          </button>
          <button
            type="button"
            onClick={onToggleLike}
            className={`p-1 transition-colors ${
              entry.isLiked
                ? 'text-rose-500 fill-rose-500'
                : 'text-slate-500 hover:text-rose-500'
            }`}
            title="Like"
          >
            <Heart
              className={`w-4 h-4 stroke-[1.75] ${
                entry.isLiked ? 'fill-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Links with + button */}
      <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-300">
        <div className="flex items-center justify-between py-1 group hover:text-slate-900 dark:hover:text-white cursor-pointer">
          <span className="text-slate-600 dark:text-zinc-400">Assign</span>
          <button type="button" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 group hover:text-slate-900 dark:hover:text-white cursor-pointer">
          <span className="text-slate-600 dark:text-zinc-400">Attachments</span>
          <button type="button" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 group hover:text-slate-900 dark:hover:text-white cursor-pointer">
          <span className="text-slate-600 dark:text-zinc-400">Tags</span>
          <button type="button" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>

        <div className="flex items-center justify-between py-1 group hover:text-slate-900 dark:hover:text-white cursor-pointer">
          <span className="text-slate-600 dark:text-zinc-400">Share</span>
          <button type="button" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Audit Info: Last Edited & Created By */}
      <div className="space-y-3 text-slate-500 dark:text-zinc-400">
        <div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500">
            Last Edited By You
          </div>
          <div className="text-slate-700 dark:text-zinc-200 mt-0.5">
            1 minute ago
          </div>
        </div>

        <div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500">
            Created By You
          </div>
          <div className="text-slate-700 dark:text-zinc-200 mt-0.5">
            1 minute ago
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockReconciliationDetailSidebar;

