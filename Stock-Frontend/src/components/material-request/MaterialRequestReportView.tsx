import React from 'react';
import { useMaterialRequest } from '../../context';
import { Download, Printer } from 'lucide-react';

export const MaterialRequestReportView: React.FC = () => {
  const { filteredRequests } = useMaterialRequest();

  const totalRequests = filteredRequests.length;
  const totalItems = filteredRequests.reduce(
    (sum, r) => sum + r.items.reduce((s, it) => s + it.qty, 0),
    0
  );
  const draftCount = filteredRequests.filter((r) => r.status === 'Draft').length;

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Status',
      'Purpose',
      'Transaction Date',
      'Required By',
      'Company',
    ];
    const rows = filteredRequests.map((r) => [
      r.id,
      r.title,
      r.status,
      r.purpose,
      r.transactionDate,
      r.requiredBy,
      r.company || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Material_Requests_Report_${new Date().toISOString().slice(0, 10)}.csv`
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
            Total Material Requests
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {totalRequests}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
            Total Requested Quantity
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {totalItems} Nos
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
            Pending / Draft Requests
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            {draftCount}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">
          Material Request Audit
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

      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200 dark:border-[#27272A] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024] text-slate-500 dark:text-zinc-400">
                <th className="py-2.5 px-3 font-medium">Request ID</th>
                <th className="py-2.5 px-3 font-medium">Title</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Purpose</th>
                <th className="py-2.5 px-3 font-medium">Transaction Date</th>
                <th className="py-2.5 px-3 font-medium">Required By</th>
                <th className="py-2.5 px-3 font-medium text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900 dark:text-white">
                    {req.id}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-zinc-200">
                    {req.title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                    {req.status}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                    {req.purpose}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                    {req.transactionDate}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                    {req.requiredBy}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">
                    {req.items.length}
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

export default MaterialRequestReportView;

