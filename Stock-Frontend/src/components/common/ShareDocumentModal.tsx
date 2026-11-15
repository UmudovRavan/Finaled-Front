import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { stockService } from '../../api/stockService';

export interface DocumentShareEntry {
  id: string;
  userId?: string | null;
  userName: string;
  isEveryone?: boolean;
  canRead: boolean;
  canWrite: boolean;
  canSubmit: boolean;
  canShare: boolean;
}

interface ShareDocumentModalProps {
  isOpen: boolean;
  docTitle: string;
  shares: DocumentShareEntry[];
  onClose: () => void;
  onUpsertShare: (entry: Omit<DocumentShareEntry, 'id'> & { id?: string }) => Promise<void>;
  onDeleteShare: (shareId: string) => Promise<void>;
}

export const ShareDocumentModal: React.FC<ShareDocumentModalProps> = ({
  isOpen,
  docTitle,
  shares,
  onClose,
  onUpsertShare,
  onDeleteShare,
}) => {
  const [userInput, setUserInput] = useState('');
  const [canRead, setCanRead] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; fullName: string; email: string }>>([]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    stockService
      .getDocumentUsers(undefined, 20)
      .then((list) => {
        if (active) setUsers(list);
      })
      .catch(() => {
        if (active) setUsers([]);
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const everyoneShare = shares.find((s) => s.isEveryone || s.userName === 'Everyone') || {
    id: undefined,
    userName: 'Everyone',
    isEveryone: true,
    canRead: false,
    canWrite: false,
    canSubmit: false,
    canShare: false,
  };

  const userShares = shares.filter((s) => !s.isEveryone && s.userName !== 'Everyone');

  const handleToggleEveryone = async (
    field: 'canRead' | 'canWrite' | 'canSubmit' | 'canShare',
    val: boolean
  ) => {
    try {
      setIsBusy(true);
      await onUpsertShare({
        id: everyoneShare.id,
        userName: 'Everyone',
        isEveryone: true,
        canRead: everyoneShare.canRead,
        canWrite: everyoneShare.canWrite,
        canSubmit: everyoneShare.canSubmit,
        canShare: everyoneShare.canShare,
        [field]: val,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleToggleUser = async (
    entry: DocumentShareEntry,
    field: 'canRead' | 'canWrite' | 'canSubmit' | 'canShare',
    val: boolean
  ) => {
    try {
      setIsBusy(true);
      await onUpsertShare({
        ...entry,
        [field]: val,
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = userInput.trim();
    if (!trimmed) return;
    const matchedUser = users.find(
      (u) =>
        u.email?.toLowerCase() === trimmed.toLowerCase() ||
        u.fullName?.toLowerCase() === trimmed.toLowerCase()
    );
    try {
      setIsBusy(true);
      await onUpsertShare({
        userId: matchedUser?.id ?? null,
        userName: matchedUser ? matchedUser.fullName || matchedUser.email : trimmed,
        isEveryone: false,
        canRead,
        canWrite,
        canSubmit,
        canShare,
      });
      setUserInput('');
      setCanRead(false);
      setCanWrite(false);
      setCanSubmit(false);
      setCanShare(false);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-2xl overflow-hidden font-sans text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[#27272A]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate pr-4">
            Share {docTitle} with
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-[1.8fr_repeat(4,1fr)] items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            <div>User</div>
            <div className="text-center">Read</div>
            <div className="text-center">Write</div>
            <div className="text-center">Submit</div>
            <div className="text-center">Share</div>
          </div>

          {/* Everyone Row */}
          <div className="grid grid-cols-[1.8fr_repeat(4,1fr)] items-center gap-2 py-1">
            <div className="font-semibold text-slate-800 dark:text-zinc-200">Everyone</div>
            {(['canRead', 'canWrite', 'canSubmit', 'canShare'] as const).map((field) => (
              <div key={field} className="flex justify-center">
                <input
                  type="checkbox"
                  disabled={isBusy}
                  checked={everyoneShare[field]}
                  onChange={(e) => handleToggleEveryone(field, e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-600 cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* Shared User Rows */}
          {userShares.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-[1.8fr_repeat(4,1fr)] items-center gap-2 py-1"
            >
              <div className="flex items-center justify-between gap-2 pr-2 min-w-0">
                <span className="text-slate-700 dark:text-zinc-200 truncate">{s.userName}</span>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onDeleteShare(s.id)}
                  className="text-slate-400 hover:text-red-500 shrink-0"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {(['canRead', 'canWrite', 'canSubmit', 'canShare'] as const).map((field) => (
                <div key={field} className="flex justify-center">
                  <input
                    type="checkbox"
                    disabled={isBusy}
                    checked={s[field]}
                    onChange={(e) => handleToggleUser(s, field, e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          ))}

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Add New Share */}
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-[1.8fr_repeat(4,1fr)] items-center gap-2 text-[11px] text-slate-600 dark:text-zinc-300">
              <div>Share this document with</div>
              <div className="text-center">Read</div>
              <div className="text-center">Write</div>
              <div className="text-center">Submit</div>
              <div className="text-center">Share</div>
            </div>

            <div className="grid grid-cols-[1.8fr_repeat(4,1fr)] items-center gap-2">
              <input
                type="text"
                list="share-document-users-list"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="User email or name..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none text-xs"
              />
              <datalist id="share-document-users-list">
                {users.map((u) => (
                  <option key={u.id} value={u.email || u.fullName}>
                    {u.fullName}
                  </option>
                ))}
              </datalist>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={canRead}
                  onChange={(e) => setCanRead(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-600 cursor-pointer"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={canWrite}
                  onChange={(e) => setCanWrite(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-600 cursor-pointer"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={canSubmit}
                  onChange={(e) => setCanSubmit(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-600 cursor-pointer"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={canShare}
                  onChange={(e) => setCanShare(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-600 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isBusy || !userInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
