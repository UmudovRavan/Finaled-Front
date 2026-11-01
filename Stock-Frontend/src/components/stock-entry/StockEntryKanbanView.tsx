import React from 'react';
import { useStockEntry } from '../../context';
import { Heart, MessageSquare, Plus } from 'lucide-react';
import type { StockEntryStatus, StockEntryRecord } from '../../types';

export const StockEntryKanbanView: React.FC = () => {
  const { filteredEntries, setSelectedEntry, toggleLike, updateStatus, setIsAddModalOpen } =
    useStockEntry();

  const columns: { status: StockEntryStatus; title: string; color: string; badge: string }[] = [
    {
      status: 'Draft',
      title: 'Draft',
      color: 'border-rose-400 dark:border-rose-500/80',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500',
    },
    {
      status: 'Submitted',
      title: 'Submitted',
      color: 'border-emerald-400 dark:border-emerald-500/80',
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500',
    },
    {
      status: 'Cancelled',
      title: 'Cancelled',
      color: 'border-slate-300 dark:border-zinc-700',
      badge: 'bg-slate-100 dark:bg-[#27272A] text-slate-500',
    },
  ];

  const getEntriesByStatus = (status: StockEntryStatus) =>
    filteredEntries.filter((e) => e.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
      {columns.map((col) => {
        const items = getEntriesByStatus(col.status);
        return (
          <div
            key={col.status}
            className="flex flex-col bg-slate-50/80 dark:bg-[#18181B] rounded-2xl border border-slate-200/80 dark:border-[#27272A] p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/70 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white text-xs">{col.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${col.badge}`}>
                  {items.length}
                </span>
              </div>
              {col.status === 'Draft' && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-600 dark:text-zinc-400 transition-colors"
                  title="Add Entry"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Column Cards */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-zinc-500">
                  No {col.title} entries
                </div>
              ) : (
                items.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1E1E22] border border-slate-200/80 dark:border-[#2E2E33] shadow-sm hover:shadow transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="font-semibold text-slate-900 dark:text-white hover:underline text-left"
                      >
                        {entry.id}
                      </button>
                      <button
                        onClick={() => toggleLike(entry.id)}
                        className={`p-0.5 hover:scale-110 transition-transform ${
                          entry.isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${entry.isLiked ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>

                    <p className="font-medium text-slate-700 dark:text-zinc-300 text-[11px] mb-2">
                      {entry.title || entry.stockEntryType}
                    </p>

                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-0.5 mb-2.5 bg-slate-50 dark:bg-[#27272B] p-2 rounded-lg">
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-200 truncate max-w-[130px]">
                          {entry.defaultTargetWarehouse || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span className="font-medium text-slate-700 dark:text-zinc-200">
                          {entry.items.length} ({entry.items.reduce((s, it) => s + it.qty, 0)} Nos)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#27272A]">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                        <MessageSquare className="w-3 h-3" />
                        <span>{entry.commentsCount}</span>
                        <span>•</span>
                        <span>{entry.timeAgoText}</span>
                      </div>

                      {/* Transition button */}
                      {entry.status === 'Draft' && (
                        <button
                          onClick={() => updateStatus(entry.id, 'Submitted')}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 transition-colors"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

