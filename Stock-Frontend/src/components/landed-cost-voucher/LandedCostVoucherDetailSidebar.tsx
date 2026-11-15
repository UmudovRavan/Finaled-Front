import React from 'react';
import { Printer, Heart } from 'lucide-react';
import { DocumentSidebarMeta } from '../common';
import type { LandedCostVoucherRecord } from '../../types';

interface LandedCostVoucherDetailSidebarProps {
  entry: LandedCostVoucherRecord;
  onToggleLike?: () => void;
}

export const LandedCostVoucherDetailSidebar: React.FC<
  LandedCostVoucherDetailSidebarProps
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

      {/* Action Items List */}
      <div className="pt-1 pb-3 border-b border-slate-100 dark:border-[#27272A]">
        <DocumentSidebarMeta docType="LandedCostVoucher" docId={entry.id} docName={entry.id} />
      </div>

      {/* Audit Info */}
      <div className="space-y-3 pt-1 text-slate-500 dark:text-zinc-400 text-[11px]">
        <div>
          <div className="font-medium text-slate-700 dark:text-zinc-300">
            Last Edited By You
          </div>
          <div className="text-slate-400">21 minutes ago</div>
        </div>

        <div>
          <div className="font-medium text-slate-700 dark:text-zinc-300">
            Created By You
          </div>
          <div className="text-slate-400">21 minutes ago</div>
        </div>
      </div>
    </div>
  );
};

export default LandedCostVoucherDetailSidebar;

