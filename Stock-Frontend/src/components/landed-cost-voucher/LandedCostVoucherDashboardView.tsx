import React from 'react';
import { useLandedCostVoucher } from '../../context';
import { FileText, CheckCircle2, Clock, Ban } from 'lucide-react';

export const LandedCostVoucherDashboardView: React.FC = () => {
  const { vouchers } = useLandedCostVoucher();

  const total = vouchers.length;
  const draft = vouchers.filter((v) => v.status === 'Draft').length;
  const submitted = vouchers.filter((v) => v.status === 'Submitted').length;
  const cancelled = vouchers.filter((v) => v.status === 'Cancelled').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181B] p-4 rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Total Vouchers</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{total}</div>
          </div>
          <FileText className="w-8 h-8 text-indigo-500 opacity-80" />
        </div>

        <div className="bg-white dark:bg-[#18181B] p-4 rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Draft</div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{draft}</div>
          </div>
          <Clock className="w-8 h-8 text-rose-500 opacity-80" />
        </div>

        <div className="bg-white dark:bg-[#18181B] p-4 rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Submitted</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{submitted}</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-white dark:bg-[#18181B] p-4 rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Cancelled</div>
            <div className="text-xl font-bold text-slate-600 dark:text-zinc-400 mt-1">{cancelled}</div>
          </div>
          <Ban className="w-8 h-8 text-slate-400 opacity-80" />
        </div>
      </div>
    </div>
  );
};

