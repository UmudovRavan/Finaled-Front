import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';

interface BulkActionMenuProps {
  selectedCount: number;
  onBulkDelete: () => Promise<void> | void;
  disabled?: boolean;
}

export const BulkActionMenu: React.FC<BulkActionMenuProps> = ({
  selectedCount,
  onBulkDelete,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (selectedCount === 0) return null;

  const handleDelete = async () => {
    setOpen(false);
    if (!window.confirm(`Delete ${selectedCount} selected record(s)?`)) return;
    setBusy(true);
    try {
      await onBulkDelete();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled || busy}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium rounded-md bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
      >
        <span>Actions ({selectedCount})</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white dark:bg-[#1e1e22] border border-gray-200 dark:border-zinc-700 py-1 z-50">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12.5px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
