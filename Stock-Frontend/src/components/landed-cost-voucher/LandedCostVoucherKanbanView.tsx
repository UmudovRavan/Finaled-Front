import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLandedCostVoucher } from '../../context';
import type { LandedCostVoucherStatus } from '../../types';

export const LandedCostVoucherKanbanView: React.FC = () => {
  const navigate = useNavigate();
  const { filteredVouchers, updateStatus } = useLandedCostVoucher();

  const columns: { status: LandedCostVoucherStatus; title: string; color: string }[] = [
    { status: 'Draft', title: 'Draft', color: 'border-rose-400' },
    { status: 'Submitted', title: 'Submitted', color: 'border-emerald-400' },
    { status: 'Cancelled', title: 'Cancelled', color: 'border-slate-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const colVouchers = filteredVouchers.filter((v) => v.status === col.status);

        return (
          <div
            key={col.status}
            className="bg-slate-50/70 dark:bg-[#18181B] p-3 rounded-xl border border-slate-200/80 dark:border-[#27272A] space-y-3"
          >
            <div className={`flex items-center justify-between border-t-2 ${col.color} pt-2`}>
              <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                {col.title}
              </span>
              <span className="text-xs text-slate-400 bg-white dark:bg-[#202024] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#27272A]">
                {colVouchers.length}
              </span>
            </div>

            <div className="space-y-2 min-h-[300px]">
              {colVouchers.map((v) => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/landed-cost-voucher/${v.id}`)}
                  className="bg-white dark:bg-[#202024] p-3 rounded-lg border border-slate-200/90 dark:border-[#2E2E33] shadow-xs hover:shadow transition-shadow cursor-pointer space-y-1.5 text-xs"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">{v.id}</div>
                  <div className="text-slate-500 text-[11px]">{v.company}</div>
                  <div className="text-[11px] text-slate-400">{v.postingDate}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

