import { useStockReconciliation } from '../../context';
import React from 'react';
import { FileText, Download } from 'lucide-react';

export const StockReconciliationReportView: React.FC = () => {
  const { filteredReconciliations } = useStockReconciliation();

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-4 font-sans text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Stock Reconciliation Report</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Audit summary of physical stock vs system stock adjustments
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert('Exporting report...')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>

      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#27272A] text-slate-500 font-medium">
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Company</th>
              <th className="py-2 px-3">Posting Date</th>
              <th className="py-2 px-3">Difference Account</th>
              <th className="py-2 px-3 text-right">Items Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
            {filteredReconciliations.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{item.id}</td>
                <td className="py-2 px-3">{item.status}</td>
                <td className="py-2 px-3 text-slate-600 dark:text-zinc-300">{item.company}</td>
                <td className="py-2 px-3 text-slate-600 dark:text-zinc-300">{item.postingDate}</td>
                <td className="py-2 px-3 text-slate-600 dark:text-zinc-300">{item.differenceAccount || '—'}</td>
                <td className="py-2 px-3 text-right font-medium">{item.items.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockReconciliationReportView;

