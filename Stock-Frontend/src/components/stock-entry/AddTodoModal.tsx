import React, { useState } from 'react';
import {
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  Code,
  Link2,
  Image,
  List,
  ListOrdered,
  AlignLeft,
  ChevronsUpDown,
} from 'lucide-react';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle?: string;
  onAdd?: (todo: any) => void;
}

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
  isOpen,
  onClose,
  documentTitle = 'Material Receipt',
  onAdd,
}) => {
  const [assignToMe, setAssignToMe] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [assignToGroup, setAssignToGroup] = useState('');
  const [completeBy, setCompleteBy] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [comment, setComment] = useState(documentTitle);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) {
      onAdd({
        assignTo: assignToMe ? 'You' : assignTo,
        assignToGroup,
        completeBy,
        priority,
        comment,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[#27272A]">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Add to ToDo
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Image 5) */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Checkbox: Assign to me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="assignToMe"
              checked={assignToMe}
              onChange={(e) => {
                setAssignToMe(e.target.checked);
                if (e.target.checked) setAssignTo('You (Administrator)');
                else setAssignTo('');
              }}
              className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="assignToMe"
              className="text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
            >
              Assign to me
            </label>
          </div>

          {/* Assign To * */}
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
              Assign To <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              placeholder="Search user or email..."
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 transition-all text-xs"
            />
          </div>

          {/* Assign To User Group */}
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
              Assign To User Group
            </label>
            <input
              type="text"
              value={assignToGroup}
              onChange={(e) => setAssignToGroup(e.target.value)}
              placeholder="Search group..."
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 transition-all text-xs"
            />
          </div>

          {/* Complete By & Priority (2 columns) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                Complete By
              </label>
              <input
                type="date"
                value={completeBy}
                onChange={(e) => setCompleteBy(e.target.value)}
                className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 pr-8 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 text-xs cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Rich Text Comment Section */}
          <div className="space-y-1.5">
            <label className="block text-slate-600 dark:text-zinc-400 text-xs">
              Comment
            </label>

            {/* Editor Container */}
            <div className="rounded-xl border border-slate-200 dark:border-[#27272A] overflow-hidden bg-white dark:bg-[#1C1C20]">
              {/* Editor Toolbar (Image 5) */}
              <div className="flex flex-wrap items-center gap-1 p-1.5 border-b border-slate-100 dark:border-[#27272A] bg-slate-50/70 dark:bg-[#202024] text-slate-600 dark:text-zinc-300">
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-[#27272B] cursor-pointer">
                  Normal ↕
                </span>
                <span className="text-slate-300 dark:text-zinc-600">|</span>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Bold"
                >
                  <Bold className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Italic"
                >
                  <Italic className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Underline"
                >
                  <Underline className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3 h-3" />
                </button>
                <span className="text-slate-300 dark:text-zinc-600">|</span>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Quote"
                >
                  <Quote className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Code"
                >
                  <Code className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Link"
                >
                  <Link2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Bullets"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-[#27272B]"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3 h-3" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2.5 bg-transparent text-slate-800 dark:text-zinc-200 outline-none resize-none text-xs"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

