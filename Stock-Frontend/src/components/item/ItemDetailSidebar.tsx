import React from 'react';
import { Camera, Edit3, Printer, Heart, Plus, UserPlus, Paperclip, Tag, Share2 } from 'lucide-react';
import type { ItemRecord } from '../../types';

interface ItemDetailSidebarProps {
  item: ItemRecord;
  onToggleLike?: () => void;
}

export const ItemDetailSidebar: React.FC<ItemDetailSidebarProps> = ({
  item,
  onToggleLike,
}) => {
  const initial = (item.itemName || item.itemCode || 'A').charAt(0).toLowerCase();

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
            item.isLiked
              ? 'text-rose-500 fill-rose-500'
              : 'text-slate-400 hover:text-rose-500'
          }`}
          title="Like"
        >
          <Heart
            className={`w-4 h-4 stroke-[1.75] ${
              item.isLiked ? 'fill-rose-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Avatar Thumbnail with Camera button */}
      <div className="space-y-3">
        <div className="relative w-16 h-16 rounded-2xl bg-[#EBECEF] dark:bg-[#202024] flex items-center justify-center text-3xl font-light text-slate-400 dark:text-zinc-400 select-none border border-slate-200/60 dark:border-zinc-800 group">
          <span>{initial}</span>
          <button
            type="button"
            title="Upload Image"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-[#27272A] shadow-sm border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
        </div>

        <div className="font-semibold text-slate-900 dark:text-white text-sm tracking-tight truncate">
          {item.itemName || item.itemCode}
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-2.5 pt-2 pb-4 border-b border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-300">
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

      {/* Audit Timestamps */}
      <div className="space-y-3.5 pt-1 text-slate-500 dark:text-zinc-400 text-[11px]">
        <div>
          <div className="font-medium text-slate-700 dark:text-zinc-300">
            Last Edited By You
          </div>
          <div className="text-slate-400 dark:text-zinc-500 mt-0.5">
            {item.timeAgoText || '10 hours ago'}
          </div>
        </div>

        <div>
          <div className="font-medium text-slate-700 dark:text-zinc-300">
            Created By You
          </div>
          <div className="text-slate-400 dark:text-zinc-500 mt-0.5">
            {item.timeAgoText || '10 hours ago'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailSidebar;

