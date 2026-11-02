import React from 'react';
import { usePurchaseReceipt } from '../../context';
import { Download, Printer } from 'lucide-react';
import { formatCurrency } from '../../utils';

export const PurchaseReceiptReportView: React.FC = () => {
  const { filteredReceipts } = usePurchaseReceipt();

  const totalReceipts = filteredReceipts.length;
  const totalValuation = filteredReceipts.reduce((sum, r) => sum + r.grandTotal, 0);
  const totalItems = filteredReceipts.reduce(
    (sum, r) => sum + r.items.reduce((s, it) => s + it.receivedQty, 0),
    0
  );

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Supplier Name',
      'Status',
      'Date',
      'Grand Total',
      '% Amount Billed',
      '% Returned',
      'Accepted Warehouse',
    ];
    const rows = filteredReceipts.map((r) => [
      r.id,
      r.supplierName,
      r.status,
      r.date,
      r.grandTotal,
      r.perAmountBilled,
      r.perReturned,
      r.acceptedWarehouse || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_Receipts_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Total Receipts</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalReceipts}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Total Received Quantity</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalItems} Nos</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">Total Invoiced Value</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{formatCurrency(totalValuation)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">Procurement & Receipt Audit</h3>
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

      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200 dark:border-[#27272A] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024] text-slate-500 dark:text-zinc-400">
                <th className="py-2.5 px-3 font-medium">Receipt ID</th>
                <th className="py-2.5 px-3 font-medium">Supplier</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium">Warehouse</th>
                <th className="py-2.5 px-3 font-medium text-right">Items</th>
                <th className="py-2.5 px-3 font-medium text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
              {filteredReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{r.id}</td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300 font-medium">{r.supplierName}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`font-medium ${
                        r.status === 'Draft'
                          ? 'text-rose-500'
                          : r.status === 'Completed'
                          ? 'text-emerald-500'
                          : 'text-amber-500'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{r.date}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{r.acceptedWarehouse || '-'}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-zinc-200">
                    {r.items.reduce((s, it) => s + it.receivedQty, 0)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                    $ {r.grandTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReceiptReportView;

