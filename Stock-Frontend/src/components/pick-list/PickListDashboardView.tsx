import React from 'react';
import { usePickList } from '../../context';

export const PickListDashboardView: React.FC = () => {
  const { filteredPickLists } = usePickList();

  const totalCount = filteredPickLists.length;
  const draftCount = filteredPickLists.filter((p) => p.status === 'Draft').length;
  const completedCount = filteredPickLists.filter((p) => p.status === 'Completed').length;

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A]">
          <span className="text-slate-500 dark:text-zinc-400">Total Pick Lists</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalCount}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A]">
          <span className="text-slate-500 dark:text-zinc-400">Draft</span>
          <p className="text-2xl font-bold text-rose-500 mt-1">{draftCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A]">
          <span className="text-slate-500 dark:text-zinc-400">Completed</span>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{completedCount}</p>
        </div>
      </div>
    </div>
  );
};

export default PickListDashboardView;

