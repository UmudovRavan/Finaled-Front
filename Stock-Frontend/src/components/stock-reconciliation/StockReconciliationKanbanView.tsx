import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockReconciliation } from '../../context';
import type { StockReconciliationStatus } from '../../types';

export const StockReconciliationKanbanView: React.FC = () => {
  const navigate = useNavigate();
  const { filteredReconciliations } = useStockReconciliation();

  const columns: { status: StockReconciliationStatus; title: string; color: string }[] = [
    { status: 'Draft', title: 'Draft', color: 'border-rose-400' },
    { status: 'Submitted', title: 'Submitted', color: 'border-emerald-400' },
    { status: 'Cancelled', title: 'Cancelled', color: 'border-slate-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
      {columns.map((col) => {
        const items = filteredReconciliations.filter((r) => r.status === col.status);
        return (
          <div
            key={col.status}
            className="bg-slate-50/70 dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-3 flex flex-col h-[calc(100vh-14rem)]"
          >
            <div className={`flex items-center justify-between pb-2 mb-2 border-b-2 ${col.color}`}>
              <span className="font-semibold text-slate-800 dark:text-white">{col.title}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#27272A] text-slate-600 dark:text-zinc-300">
                {items.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/stock-reconciliation/${item.id}`)}
                  className="p-3 rounded-lg bg-white dark:bg-[#202024] border border-slate-200/80 dark:border-[#2C2C30] hover:shadow-sm cursor-pointer transition-all space-y-1.5"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">{item.id}</div>
                  <div className="text-[11px] text-slate-500">Posting: {item.postingDate} {item.postingTime}</div>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-300">Company: {item.company}</div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-[#27272A]">
                    {item.items.length} item(s)
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

export default StockReconciliationKanbanView;

