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
import { AddTodoModal } from '../stock-entry/AddTodoModal';

interface PurchaseReceiptDetailSidebarProps {
  title: string;
  documentId: string;
  isLiked?: boolean;
  onToggleLike?: () => void;
  onPrint?: () => void;
}

export const PurchaseReceiptDetailSidebar: React.FC<PurchaseReceiptDetailSidebarProps> = ({
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
      {/* 1. Header: Document ID, Title, Print, Like */}
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

      {/* 2. Action Links: Assign, Attachments, Tags, Share */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-[#27272A]">
        {/* Assign */}
        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
          <button
            type="button"
            onClick={() => setIsTodoModalOpen(true)}
            className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Assign</span>
          </button>
          <button
            type="button"
            onClick={() => setIsTodoModalOpen(true)}
            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {assignedUser && (
          <div className="pl-6 text-[11px] text-slate-500 dark:text-zinc-400">
            Assigned to: <span className="font-medium text-slate-700 dark:text-zinc-200">{assignedUser}</span>
          </div>
        )}

        {/* Attachments */}
        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
          <label className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            <span>Attachments</span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
          <label className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        {attachments.length > 0 && (
          <div className="pl-6 space-y-1">
            {attachments.map((file, i) => (
              <div key={i} className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                • {file}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
          <button
            type="button"
            onClick={() => setShowTagInput(true)}
            className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Tags</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTagInput(true)}
            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {showTagInput && (
          <div className="pl-6">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Tag + Enter"
              className="w-full px-2 py-1 text-[11px] rounded bg-slate-50 dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] focus:outline-none focus:ring-1 focus:ring-slate-400"
              autoFocus
            />
          </div>
        )}
        {tags.length > 0 && (
          <div className="pl-6 flex flex-wrap gap-1">
            {tags.map((t, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-zinc-300"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Link copied to clipboard');
            }}
            className="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share</span>
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert('Link copied to clipboard');
            }}
            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Audit Info */}
      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#27272A] text-[11px] text-slate-500 dark:text-zinc-400">
        <div>
          <span className="block text-slate-400">Last Edited By You</span>
          <span className="text-slate-700 dark:text-zinc-200">30 minutes ago</span>
        </div>
        <div>
          <span className="block text-slate-400">Created By You</span>
          <span className="text-slate-700 dark:text-zinc-200">31 minutes ago</span>
        </div>
      </div>

      {/* Add Todo Modal */}
      <AddTodoModal
        isOpen={isTodoModalOpen}
        onClose={() => setIsTodoModalOpen(false)}
        documentTitle={title}
        onAdd={(todo: any) => {
          setAssignedUser(todo.assignTo);
          setIsTodoModalOpen(false);
        }}
      />
    </aside>
  );
};
