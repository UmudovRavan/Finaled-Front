import React from 'react';
import { Printer, Heart } from 'lucide-react';
import { DocumentSidebarMeta } from '../common';
import type { ItemAlternativeRecord } from '../../types';

interface ItemAlternativeDetailSidebarProps {
  alternative: ItemAlternativeRecord;
  onToggleLike?: () => void;
}

export const ItemAlternativeDetailSidebar: React.FC<ItemAlternativeDetailSidebarProps> = ({
  alternative,
  onToggleLike,
}) => {
  return (
    <div className="w-full lg:w-64 shrink-0 font-sans text-xs space-y-4">
      {/* Top Header Title & Icons (Printer, Heart) */}
      <div className="flex items-center justify-between pb-1">
        <div className="font-semibold text-slate-800 dark:text-zinc-200 text-sm tracking-tight truncate">
          {alternative.itemCode} - {alternative.alternativeItemCode}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
            title="Print"
          >
            <Printer className="w-4 h-4 stroke-[1.75]" />
          </button>
          <button
            type="button"
            onClick={onToggleLike}
            className={`p-1 transition-colors ${
              alternative.isLiked
                ? 'text-rose-500 fill-rose-500'
                : 'text-slate-400 hover:text-rose-500'
            }`}
            title="Like"
          >
            <Heart
              className={`w-4 h-4 stroke-[1.75] ${
                alternative.isLiked ? 'fill-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Items List */}
      <div className="pt-1 pb-4 border-b border-slate-100 dark:border-[#27272A]">
        <DocumentSidebarMeta docType="ItemAlternative" docId={alternative.id} docName={alternative.id} />
      </div>

      {/* Audit Timestamps */}
      <div className="space-y-3 pt-2 text-slate-500 dark:text-zinc-400">
        <div>
          <div className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
            Last Edited By You
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
            {alternative.lastEdited || 'yesterday'}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
            Created By You
          </div>
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
            {alternative.createdOn || 'yesterday'}
          </div>
        </div>
      </div>
    </div>
  );
};
