import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePackingSlip } from '../../context';
import type { PackingSlipStatus } from '../../types';

export const PackingSlipKanbanView: React.FC = () => {
  const navigate = useNavigate();
  const { filteredSlips } = usePackingSlip();

  const columns: { id: PackingSlipStatus; title: string; color: string }[] = [
    { id: 'Draft', title: 'Draft', color: 'border-rose-400' },
    { id: 'Submitted', title: 'Submitted', color: 'border-emerald-400' },
    { id: 'Cancelled', title: 'Cancelled', color: 'border-slate-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
      {columns.map((col) => {
        const colSlips = filteredSlips.filter((s) => s.status === col.id);

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
                {colSlips.length}
              </span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {colSlips.map((s) => (
                <div
                  key={s.id}
                  onClick={() => navigate(`/packing-slip/${s.id}`)}
                  className="p-3 bg-white dark:bg-[#202024] rounded-lg border border-slate-200/70 dark:border-[#2E2E33] hover:shadow-sm cursor-pointer transition-shadow"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {s.id}
                  </div>
                  <div className="text-slate-500 dark:text-zinc-400 text-[11px] mt-1">
                    {s.deliveryNote}
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    Package: {s.fromPackageNo} - {s.toPackageNo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PackingSlipKanbanView;

