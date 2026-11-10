import React from 'react';
import { useRepostItemValuation } from '../../context';

export const RepostItemValuationReportView: React.FC = () => {
  const { filteredValuations } = useRepostItemValuation();

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Repost Item Valuation Summary
          </h3>
          <p className="text-slate-500 dark:text-zinc-400 text-xs">
            Overview of repost item valuation jobs and ledgers
          </p>
        </div>
        <div className="text-slate-500 text-xs">
          Total: {filteredValuations.length} records
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-100 dark:border-[#27272A]">
          <div className="text-slate-500 dark:text-zinc-400">Completed</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {filteredValuations.filter((v) => v.status === 'Completed').length}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-100 dark:border-[#27272A]">
          <div className="text-slate-500 dark:text-zinc-400">Queued</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {filteredValuations.filter((v) => v.status === 'Queued').length}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-100 dark:border-[#27272A]">
          <div className="text-slate-500 dark:text-zinc-400">In Progress / Failed</div>
          <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            {
              filteredValuations.filter(
                (v) => v.status === 'In Progress' || v.status === 'Failed'
              ).length
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepostItemValuationReportView;

