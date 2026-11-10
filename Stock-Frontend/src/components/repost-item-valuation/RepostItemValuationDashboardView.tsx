import React from 'react';
import { useRepostItemValuation } from '../../context';

export const RepostItemValuationDashboardView: React.FC = () => {
  const { filteredValuations } = useRepostItemValuation();

  const completedCount = filteredValuations.filter(
    (v) => v.status === 'Completed'
  ).length;
  const queuedCount = filteredValuations.filter(
    (v) => v.status === 'Queued'
  ).length;

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm text-xs space-y-6">
      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
        Valuation Repost Dashboard
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024]">
          <h4 className="font-medium text-slate-700 dark:text-zinc-200 mb-3">
            Execution Status
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Completed ({completedCount})</span>
              <span>
                {filteredValuations.length > 0
                  ? Math.round((completedCount / filteredValuations.length) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${
                    filteredValuations.length > 0
                      ? (completedCount / filteredValuations.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024]">
          <h4 className="font-medium text-slate-700 dark:text-zinc-200 mb-3">
            Queue Activity
          </h4>
          <p className="text-slate-500 dark:text-zinc-400">
            {queuedCount} items waiting to be reposted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RepostItemValuationDashboardView;

