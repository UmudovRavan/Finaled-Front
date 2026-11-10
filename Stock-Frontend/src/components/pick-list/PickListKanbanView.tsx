import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePickList } from '../../context';
import { Heart, MessageSquare, Plus } from 'lucide-react';
import type { PickListStatus } from '../../types';

export const PickListKanbanView: React.FC = () => {
  const navigate = useNavigate();
  const { filteredPickLists, toggleLike } = usePickList();

  const columns: { status: PickListStatus; title: string; badge: string }[] = [
    {
      status: 'Draft',
      title: 'Draft',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500',
    },
    {
      status: 'Open',
      title: 'Open',
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500',
    },
    {
      status: 'Completed',
      title: 'Completed',
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500',
    },
    {
      status: 'Cancelled',
      title: 'Cancelled',
      badge: 'bg-slate-100 dark:bg-[#27272A] text-slate-500',
    },
  ];

  const getByStatus = (status: PickListStatus) =>
    filteredPickLists.filter((p) => p.status === status);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      {columns.map((col) => {
        const items = getByStatus(col.status);
        return (
          <div
            key={col.status}
            className="flex flex-col bg-slate-50/80 dark:bg-[#18181B] rounded-2xl border border-slate-200/80 dark:border-[#27272A] p-3 min-h-[500px]"
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/70 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white text-xs">
                  {col.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${col.badge}`}
                >
                  {items.length}
                </span>
              </div>
              {col.status === 'Draft' && (
                <button
                  onClick={() => navigate('/pick-list/new')}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-600 dark:text-zinc-400 transition-colors"
                  title="Add Pick List"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-[11px]">
                  No {col.title} pick lists
                </div>
              ) : (
                items.map((pl) => (
                  <div
                    key={pl.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1E1E22] border border-slate-200/80 dark:border-[#2E2E33] shadow-sm hover:shadow transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/pick-list/${pl.id}`)}
                        className="font-semibold text-slate-900 dark:text-white text-xs truncate max-w-[160px] hover:underline text-left"
                      >
                        {pl.id}
                      </button>
                      <button
                        onClick={() => toggleLike(pl.id)}
                        className={`p-0.5 hover:scale-110 transition-transform ${
                          pl.isLiked
                            ? 'text-rose-500 fill-rose-500'
                            : 'text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${pl.isLiked ? 'fill-rose-500' : ''}`}
                        />
                      </button>
                    </div>

                    <p className="font-normal text-slate-500 dark:text-zinc-400 text-[11px] mb-2">
                      {pl.customer}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-[#27272A]">
                      <span>{pl.company}</span>
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>{pl.commentsCount}</span>
                      </div>
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

export default PickListKanbanView;

