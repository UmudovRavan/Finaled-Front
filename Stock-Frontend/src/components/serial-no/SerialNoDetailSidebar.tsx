import React from 'react';
import { Printer, Heart, Plus, UserPlus, Paperclip, Tag, Share2 } from 'lucide-react';
import type { SerialNoRecord } from '../../types';

interface SerialNoDetailSidebarProps {
  serialRecord: SerialNoRecord;
  onToggleLike?: () => void;
}

export const SerialNoDetailSidebar: React.FC<SerialNoDetailSidebarProps> = ({
  serialRecord,
  onToggleLike,
}) => {
  return (
    <div className="w-full lg:w-64 shrink-0 font-sans text-xs space-y-4">
      {/* Top Header Title & Icons (Printer, Heart) */}
      <div className="flex items-center justify-between pb-1">
        <div className="font-semibold text-slate-800 dark:text-zinc-200 text-sm tracking-tight truncate">
          {serialRecord.serialNo || serialRecord.id}
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
              serialRecord.isLiked
                ? 'text-rose-500 fill-rose-500'
                : 'text-slate-400 hover:text-rose-500'
            }`}
            title="Like"
          >
            <Heart
              className={`w-4 h-4 stroke-[1.75] ${
                serialRecord.isLiked ? 'fill-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5 pt-1 pb-4 border-b border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-300">
        <button
          type="button"
          className="w-full flex items-center justify-between hover:text-slate-900 dark:hover:text-white cursor-pointer py-0.5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            <span>Assign</span>
          </div>
          <Plus className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-between hover:text-slate-900 dark:hover:text-white cursor-pointer py-0.5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Paperclip className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            <span>Attachments</span>
          </div>
          <Plus className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-between hover:text-slate-900 dark:hover:text-white cursor-pointer py-0.5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            <span>Tags</span>
          </div>
          <Plus className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-between hover:text-slate-900 dark:hover:text-white cursor-pointer py-0.5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
            <span>Share</span>
          </div>
          <Plus className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Timestamp Audits */}
      <div className="space-y-3 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
        <div>
          <div className="font-normal text-slate-700 dark:text-zinc-300">Last Edited By You</div>
          <div className="text-slate-400 dark:text-zinc-500 mt-0.5">
            {serialRecord.lastEdited || '10 hours ago'}
          </div>
        </div>
        <div>
          <div className="font-normal text-slate-700 dark:text-zinc-300">Created By You</div>
          <div className="text-slate-400 dark:text-zinc-500 mt-0.5">
            {serialRecord.createdBy || '10 hours ago'}
          </div>
        </div>
      </div>
    </div>
  );
};

