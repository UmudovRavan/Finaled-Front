import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRepostItemValuation } from '../../context';
import type { RepostItemValuationStatus } from '../../types';

export const RepostItemValuationKanbanView: React.FC = () => {
  const navigate = useNavigate();
  const { filteredValuations } = useRepostItemValuation();

  const columns: { id: RepostItemValuationStatus; title: string; color: string }[] = [
    { id: 'Queued', title: 'Queued', color: 'border-amber-400' },
    { id: 'In Progress', title: 'In Progress', color: 'border-sky-400' },
    { id: 'Completed', title: 'Completed', color: 'border-emerald-400' },
    { id: 'Failed', title: 'Failed', color: 'border-rose-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      {columns.map((col) => {
        const colValuations = filteredValuations.filter(
          (v) => v.status === col.id
        );

        return (
          <div
            key={col.id}
            className="bg-slate-50/70 dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-3 flex flex-col"
          >
            <div
              className={`flex items-center justify-between pb-2 mb-2 border-b-2 ${col.color}`}
            >
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {col.title}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-medium">
                {colValuations.length}
              </span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {colValuations.map((v) => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/repost-item-valuation/${v.id}`)}
                  className="p-3 bg-white dark:bg-[#202024] rounded-lg border border-slate-200/70 dark:border-[#2E2E33] hover:shadow-sm cursor-pointer transition-shadow"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {v.id}
                  </div>
                  <div className="text-slate-500 dark:text-zinc-400 text-[11px] mt-1">
                    {v.basedOn}
                  </div>
                  {v.itemCode && (
                    <div className="text-slate-400 text-[10px]">
                      {v.itemCode}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RepostItemValuationKanbanView;

