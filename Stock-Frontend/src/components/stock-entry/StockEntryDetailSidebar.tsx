import React from 'react';
import { Printer, Heart } from 'lucide-react';
import { DocumentSidebarMeta } from '../common';

interface StockEntryDetailSidebarProps {
  title: string;
  documentId: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onPrint?: () => void;
}

export const StockEntryDetailSidebar: React.FC<StockEntryDetailSidebarProps> = ({
  title,
  documentId,
  isLiked = false,
  onToggleLike,
  onPrint,
}) => {
  return (
    <aside className="w-full lg:w-64 space-y-5 text-xs font-sans shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-[#27272A] pt-4 lg:pt-0 lg:pl-5">
      {/* 1. Header: Title, Document ID, Print, Like */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-2">
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5 break-all">
            {documentId}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          <button
            type="button"
            onClick={onPrint || (() => window.print())}
            className="p-1 hover:text-slate-700 dark:hover:text-white transition-colors"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onToggleLike}
            className={`p-1 hover:scale-110 transition-transform ${
              isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
            }`}
            title="Like"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Attachments, Tags, Share */}
      <div className="pt-1">
        <DocumentSidebarMeta docType="StockEntry" docId={documentId} docName={title || documentId} />
      </div>

      {/* 3. Audit Trail */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#27272A] text-[11px] text-slate-500 dark:text-zinc-400">
        <div>
          <span className="text-slate-700 dark:text-zinc-300 font-medium block">
            Last Edited By You
          </span>
          <span className="text-slate-400">30 minutes ago</span>
        </div>

        <div>
          <span className="text-slate-700 dark:text-zinc-300 font-medium block">
            Created By You
          </span>
          <span className="text-slate-400">31 minutes ago</span>
        </div>
      </div>
    </aside>
  );
};
