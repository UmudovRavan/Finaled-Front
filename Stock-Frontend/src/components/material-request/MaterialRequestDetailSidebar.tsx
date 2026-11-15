import React, { useState } from 'react';
import { Printer, Heart, SquarePen } from 'lucide-react';
import { DocumentSidebarMeta } from '../common';

interface MaterialRequestDetailSidebarProps {
  title: string;
  documentId: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onPrint?: () => void;
  onUpdateTitle?: (newTitle: string) => void;
}

export const MaterialRequestDetailSidebar: React.FC<MaterialRequestDetailSidebarProps> = ({
  title,
  documentId,
  isLiked = false,
  onToggleLike,
  onPrint,
  onUpdateTitle,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleSave = () => {
    if (editedTitle.trim() && onUpdateTitle) {
      onUpdateTitle(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <aside className="w-full lg:w-64 space-y-5 text-xs font-sans shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-[#27272A] pt-4 lg:pt-0 lg:pl-5">
      {/* 1. Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-[#202024] text-slate-900 dark:text-white outline-none"
            />
          ) : (
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
              {title}
            </h2>
          )}
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5 break-all">
            {documentId}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
          {onUpdateTitle && (
            <button
              type="button"
              onClick={() => {
                setEditedTitle(title);
                setIsEditingTitle(true);
              }}
              className="p-1 hover:text-slate-700 dark:hover:text-white transition-colors"
              title="Edit Title"
            >
              <SquarePen className="w-3.5 h-3.5" />
            </button>
          )}
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
        <DocumentSidebarMeta docType="MaterialRequest" docId={documentId} docName={title || documentId} />
      </div>

      {/* 3. Audit Info */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#27272A] text-xs text-slate-500 dark:text-zinc-400">
        <div className="space-y-0.5">
          <span className="block text-slate-600 dark:text-zinc-300 font-normal">
            Last Edited By You
          </span>
          <span className="text-slate-500 dark:text-zinc-400">13 minutes ago</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-slate-600 dark:text-zinc-300 font-normal">
            Created By You
          </span>
          <span className="text-slate-500 dark:text-zinc-400">13 minutes ago</span>
        </div>
      </div>
    </aside>
  );
};

export default MaterialRequestDetailSidebar;
