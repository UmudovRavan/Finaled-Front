import React from 'react';
import { useMaterialRequest } from '../../context';

export const MaterialRequestDashboardView: React.FC = () => {
  const { filteredRequests } = useMaterialRequest();

  const totalCount = filteredRequests.length;
  const draftCount = filteredRequests.filter((r) => r.status === 'Draft').length;
  const submittedCount = filteredRequests.filter((r) => r.status === 'Submitted').length;
  const orderedCount = filteredRequests.filter((r) => r.status === 'Ordered').length;

  return (
    <div className="space-y-5 text-xs font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            Total Requests
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-rose-500 text-[11px] font-medium uppercase tracking-wider">
            Draft
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {draftCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-amber-500 text-[11px] font-medium uppercase tracking-wider">
            Submitted
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {submittedCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-emerald-500 text-[11px] font-medium uppercase tracking-wider">
            Ordered / Issued
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {orderedCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestDashboardView;

