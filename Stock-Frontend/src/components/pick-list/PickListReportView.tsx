import React from 'react';
import { usePickList } from '../../context';
import { Download, Printer } from 'lucide-react';

export const PickListReportView: React.FC = () => {
  const { filteredPickLists } = usePickList();

  const totalLists = filteredPickLists.length;
  const totalPickedQty = filteredPickLists.reduce(
    (sum, p) => sum + p.items.reduce((s, it) => s + it.pickedQty, 0),
    0
  );
  const draftCount = filteredPickLists.filter((p) => p.status === 'Draft').length;

  const handleExportCSV = () => {
    const headers = ['ID', 'Status', 'Delivery Status', 'Company', 'Customer', 'Purpose'];
    const rows = filteredPickLists.map((p) => [
      p.id,
      p.status,
      p.deliveryStatus || '',
      p.company,
      p.customer,
      p.purpose,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Pick_Lists_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
            Total Pick Lists
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {totalLists}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
            Total Picked Quantity
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {totalPickedQty} Nos
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
            Draft Pick Lists
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {draftCount}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">
          Pick List Audit
        </h3>
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

      <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-[#141417] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-400">
              <th className="py-2.5 px-3 font-medium">ID</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium">Delivery Status</th>
              <th className="py-2.5 px-3 font-medium">Company</th>
              <th className="py-2.5 px-3 font-medium">Customer</th>
              <th className="py-2.5 px-3 font-medium">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
            {filteredPickLists.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-slate-50/70 dark:hover:bg-[#1E1E22] transition-colors"
              >
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                  {p.id}
                </td>
                <td className="py-2.5 px-3">{p.status}</td>
                <td className="py-2.5 px-3 text-slate-500">{p.deliveryStatus || 'Not Delivered'}</td>
                <td className="py-2.5 px-3">{p.company}</td>
                <td className="py-2.5 px-3">{p.customer}</td>
                <td className="py-2.5 px-3">{p.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PickListReportView;

