import React from 'react';
import { usePackingSlip } from '../../context';

export const PackingSlipReportView: React.FC = () => {
  const { filteredSlips } = usePackingSlip();

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm text-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Packing Slip Summary
          </h3>
          <p className="text-slate-500 dark:text-zinc-400 text-xs">
            Overview of packed packages and shipments
          </p>
        </div>
        <div className="text-slate-500 text-xs">
          Total: {filteredSlips.length} records
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-100 dark:border-[#27272A]">
          <div className="text-slate-500 dark:text-zinc-400">Draft</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {filteredSlips.filter((s) => s.status === 'Draft').length}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-100 dark:border-[#27272A]">
          <div className="text-slate-500 dark:text-zinc-400">Submitted</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {filteredSlips.filter((s) => s.status === 'Submitted').length}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-100 dark:border-[#27272A]">
          <div className="text-slate-500 dark:text-zinc-400">Total Packages</div>
          <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            {filteredSlips.reduce((acc, s) => acc + (s.toPackageNo - s.fromPackageNo + 1), 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackingSlipReportView;

