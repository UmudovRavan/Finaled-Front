import React from 'react';
import { usePackingSlip } from '../../context';

export const PackingSlipDashboardView: React.FC = () => {
  const { filteredSlips } = usePackingSlip();

  const draftCount = filteredSlips.filter((s) => s.status === 'Draft').length;
  const submittedCount = filteredSlips.filter((s) => s.status === 'Submitted').length;

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm text-xs space-y-6">
      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
        Packing Slip Dashboard
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024]">
          <h4 className="font-medium text-slate-700 dark:text-zinc-200 mb-3">
            Status Breakdown
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Submitted ({submittedCount})</span>
              <span>Draft ({draftCount})</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${
                    filteredSlips.length > 0
                      ? (submittedCount / filteredSlips.length) * 100
                      : 0
                  }%`,
                }}
              />
              <div
                className="h-full bg-rose-500"
                style={{
                  width: `${
                    filteredSlips.length > 0
                      ? (draftCount / filteredSlips.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024]">
          <h4 className="font-medium text-slate-700 dark:text-zinc-200 mb-3">
            Delivery Summary
          </h4>
          <p className="text-slate-500 dark:text-zinc-400">
            {filteredSlips.length} total packing slips registered.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PackingSlipDashboardView;

