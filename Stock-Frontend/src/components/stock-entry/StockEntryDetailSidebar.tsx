import React, { useState } from 'react';
import {
  Printer,
  Heart,
  Plus,
  Users,
  Paperclip,
  Tag,
  Share2,
  Check,
} from 'lucide-react';
import { AddTodoModal } from './AddTodoModal';

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
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [assignedUser, setAssignedUser] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachments((prev) => [...prev, e.target.files![0].name]);
    }
  };

  return (
    <aside className="w-full lg:w-64 space-y-5 text-xs font-sans shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-[#27272A] pt-4 lg:pt-0 lg:pl-5">
      {/* 1. Header: Material Receipt, Document ID, Print, Like */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">
            {documentId}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
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

      {/* 2. Action Items from Image 1: Assign, Attachments, Tags, Share */}
      <div className="space-y-3 pt-1">
        {/* Assign + */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Assign</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTodoModalOpen(true)}
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded transition-colors"
              title="Add Assignment"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {assignedUser && (
            <div className="pl-6 text-[11px] text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Assigned to {assignedUser}</span>
            </div>
          )}
        </div>

        {/* Attachments + */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <div className="flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
              <span>Attachments</span>
            </div>
            <label className="p-0.5 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          {attachments.length > 0 && (
            <div className="pl-6 space-y-0.5">
              {attachments.map((file, i) => (
                <span
                  key={i}
                  className="block text-[11px] text-slate-500 truncate"
                  title={file}
                >
                  • {file}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tags + */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Tags</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTagInput(!showTagInput)}
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded transition-colors"
              title="Add Tag"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {showTagInput && (
            <input
              type="text"
              autoFocus
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Tag name (Enter)..."
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-2 py-1 rounded text-xs outline-none"
            />
          )}
          {tags.length > 0 && (
            <div className="pl-6 flex flex-wrap gap-1">
              {tags.map((tg, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-zinc-400 text-[10px]"
                >
                  #{tg}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Share + */}
        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <div className="flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert('Document link copied to clipboard!');
              }
            }}
            className="p-0.5 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded transition-colors"
            title="Share Document"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Audit Trail from Image 1: Last Edited By You / Created By You */}
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

      {/* Add to ToDo Modal (Image 5) */}
      <AddTodoModal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        documentTitle={title}
        onAdd={(todo) => {
          setAssignedUser(todo.assignTo);
        }}
      />
    </aside>
  );
};

