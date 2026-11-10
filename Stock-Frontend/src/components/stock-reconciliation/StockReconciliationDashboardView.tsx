import React from 'react';
import { useStockReconciliation } from '../../context';
import { BarChart3, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export const StockReconciliationDashboardView: React.FC = () => {
  const { reconciliations } = useStockReconciliation();

  const total = reconciliations.length;
  const draftCount = reconciliations.filter((r) => r.status === 'Draft').length;
  const submittedCount = reconciliations.filter((r) => r.status === 'Submitted').length;
  const cancelledCount = reconciliations.filter((r) => r.status === 'Cancelled').length;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span>Total Reconciliations</span>
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">{total}</div>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-500">
            <span>Draft</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">{draftCount}</div>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-500">
            <span>Submitted</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">{submittedCount}</div>
        </div>

        <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span>Cancelled</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">{cancelledCount}</div>
        </div>
      </div>
    </div>
  );
};

export default StockReconciliationDashboardView;

