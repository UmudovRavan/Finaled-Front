import React from 'react';
import { useLandedCostVoucher } from '../../context';

export const LandedCostVoucherReportView: React.FC = () => {
  const { filteredVouchers } = useLandedCostVoucher();

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm overflow-hidden p-4 text-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#27272A] text-slate-500 pb-2">
              <th className="py-2 px-3 font-semibold">ID</th>
              <th className="py-2 px-3 font-semibold">Status</th>
              <th className="py-2 px-3 font-semibold">Company</th>
              <th className="py-2 px-3 font-semibold">Posting Date</th>
              <th className="py-2 px-3 font-semibold">Vouchers Count</th>
              <th className="py-2 px-3 font-semibold">Items Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
            {filteredVouchers.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                  {v.id}
                </td>
                <td className="py-2.5 px-3">{v.status}</td>
                <td className="py-2.5 px-3">{v.company}</td>
                <td className="py-2.5 px-3">{v.postingDate}</td>
                <td className="py-2.5 px-3">{v.vouchers?.length || 0}</td>
                <td className="py-2.5 px-3">{v.items?.length || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

