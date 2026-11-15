import React from 'react';
import { Edit3, Printer, Heart } from 'lucide-react';
import { DocumentSidebarMeta } from '../common';
import type { ItemAttributeRecord } from '../../types';

interface ItemAttributeDetailSidebarProps {
  attribute: ItemAttributeRecord;
  onToggleLike?: () => void;
}

export const ItemAttributeDetailSidebar: React.FC<ItemAttributeDetailSidebarProps> = ({
  attribute,
  onToggleLike,
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(attribute.attributeName || attribute.id || 'Colour');

  return (
    <div className="w-full lg:w-64 shrink-0 font-sans text-xs space-y-5">
      {/* Top Header Action Icons */}
      <div className="flex items-center justify-end gap-2 pb-2">
        <button
          type="button"
          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
          title="Edit"
        >
          <Edit3 className="w-4 h-4 stroke-[1.75]" />
        </button>
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
            attribute.isLiked
              ? 'text-rose-500 fill-rose-500'
              : 'text-slate-400 hover:text-rose-500'
          }`}
          title="Like"
        >
          <Heart
            className={`w-4 h-4 stroke-[1.75] ${
              attribute.isLiked ? 'fill-rose-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Avatar Thumbnail */}
      <div className="space-y-3">
        <div className="relative w-16 h-16 rounded-2xl bg-[#EBECEF] dark:bg-[#202024] flex items-center justify-center text-xl font-medium text-slate-500 dark:text-zinc-400 select-none border border-slate-200/60 dark:border-zinc-800">
          <span>{initials}</span>
        </div>

        <div className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight truncate">
          {attribute.attributeName || attribute.id}
        </div>
      </div>

      {/* Action Items List */}
      <div className="pt-1 pb-4 border-b border-slate-100 dark:border-[#27272A]">
        <DocumentSidebarMeta docType="ItemAttribute" docId={attribute.id} docName={attribute.attributeName || attribute.id} />
      </div>

      {/* Timestamp Audits */}
      <div className="space-y-4 pt-1 text-[11px] text-slate-400 dark:text-zinc-400">
        <div>
          <div className="text-slate-500 dark:text-zinc-400">Last Edited By You</div>
          <div className="text-slate-400 dark:text-zinc-400">3 months ago</div>
        </div>

        <div>
          <div className="text-slate-500 dark:text-zinc-400">Created By You</div>
          <div className="text-slate-400 dark:text-zinc-400">3 months ago</div>
        </div>
      </div>
    </div>
  );
};
