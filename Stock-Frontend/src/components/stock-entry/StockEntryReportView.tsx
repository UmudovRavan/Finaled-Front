import React from 'react';
import { useStockEntry } from '../../context';
import { Download, Printer } from 'lucide-react';
import { formatCurrency } from '../../utils';

export const StockEntryReportView: React.FC = () => {
  const { filteredEntries, setSelectedEntry } = useStockEntry();

  const totalEntries = filteredEntries.length;
  const totalItems = filteredEntries.reduce(
    (sum, e) => sum + e.items.reduce((s, it) => s + it.qty, 0),
    0
  );
  const totalValuation = filteredEntries.reduce(
    (sum, e) => sum + e.items.reduce((s, it) => s + it.amount, 0),
    0
  );

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Stock Entry Type',
      'Status',
      'Purpose',
      'Source Warehouse',
      'Target Warehouse',
      'Items Count',
      'Valuation (AZN)',
      'Created On',
    ];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.stockEntryType,
      e.status,
      e.purpose,
      e.defaultSourceWarehouse || '',
      e.defaultTargetWarehouse || '',
      e.items.length,
      e.items.reduce((s, it) => s + it.amount, 0),
      e.createdOn,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Entries_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Total Filtered Entries</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalEntries}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Total Transferred Units</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalItems} Nos</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Total Entry Valuation</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{formatCurrency(totalValuation)}</p>
        </div>
      </div>

      {/* Report Actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">Detailed Financial & Movement Audit</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200 dark:border-[#27272A] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024] text-slate-500 dark:text-zinc-400">
                <th className="py-2.5 px-3 font-medium">Document ID</th>
                <th className="py-2.5 px-3 font-medium">Type</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">From Warehouse</th>
                <th className="py-2.5 px-3 font-medium">To Warehouse</th>
                <th className="py-2.5 px-3 font-medium text-right">Items Qty</th>
                <th className="py-2.5 px-3 font-medium text-right">Valuation</th>
                <th className="py-2.5 px-3 font-medium text-right">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
              {filteredEntries.map((e) => {
                const totalQty = e.items.reduce((s, it) => s + it.qty, 0);
                const val = e.items.reduce((s, it) => s + it.amount, 0);
                return (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedEntry(e)}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{e.id}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{e.stockEntryType}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-medium ${
                          e.status === 'Draft'
                            ? 'text-rose-500'
                            : e.status === 'Submitted'
                            ? 'text-emerald-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{e.defaultSourceWarehouse || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{e.defaultTargetWarehouse || '-'}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-zinc-200">{totalQty}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(val)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500 dark:text-zinc-400">{new Date(e.createdOn).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

