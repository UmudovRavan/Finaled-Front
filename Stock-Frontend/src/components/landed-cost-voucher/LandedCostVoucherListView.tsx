import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { useLandedCostVoucher } from '../../context';
import type { LandedCostVoucherRecord } from '../../types';

export const LandedCostVoucherListView: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredVouchers,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useLandedCostVoucher();

  const isAllSelected =
    filteredVouchers.length > 0 &&
    selectedIds.length === filteredVouchers.length;

  const pageSizeOptions = [20, 100, 500, 2500];

  const displayedVouchers = filteredVouchers.slice(0, pageSize);

  const getStatusBadge = (status: LandedCostVoucherRecord['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-rose-50 dark:bg-rose-950/60 text-[#E11D48] dark:text-[#FB7185]';
      case 'Submitted':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399]';
      case 'Cancelled':
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-500 dark:text-zinc-400 line-through';
      default:
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm overflow-hidden text-xs">
      {/* Scrollable table container */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          {/* Table Header from Screenshot 1: Checkbox | ID | Status | Company | 1 of 1 ♡ */}
          <thead>
            <tr className="bg-[#F3F4F6]/80 dark:bg-[#202024] border-b border-slate-100 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal select-none">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[240px]">
                ID
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[140px]">
                Status
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[220px]">
                Company
              </th>
              <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400 min-w-[110px]">
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {displayedVouchers.length > 0
                      ? `1 of ${displayedVouchers.length}`
                      : '0 of 0'}
                  </span>
                  <Heart className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
            {displayedVouchers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-slate-400 dark:text-zinc-500 font-normal"
                >
                  No Landed Cost Vouchers found
                </td>
              </tr>
            ) : (
              displayedVouchers.map((entry) => {
                const isSelected = selectedIds.includes(entry.id);

                return (
                  <tr
                    key={entry.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group ${
                      isSelected ? 'bg-slate-50/90 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(entry.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/landed-cost-voucher/${entry.id}`)}
                        className="font-medium text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors"
                      >
                        {entry.id}
                      </button>
                    </td>

                    {/* Status badge (Screenshot 1: Red/pink Draft badge) */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium leading-none ${getStatusBadge(
                          entry.status
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">
                      {entry.company}
                    </td>

                    {/* Right Meta Column: now · 💬 0 · ♡ (Screenshot 1) */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400 dark:text-zinc-500 select-none">
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
                          {entry.timeAgoText || 'now'}
                        </span>

                        <div className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>{entry.commentsCount ?? 0}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(entry.id);
                          }}
                          className={`p-0.5 rounded hover:text-rose-500 transition-colors ${
                            entry.isLiked
                              ? 'text-rose-500'
                              : 'text-slate-400 dark:text-zinc-500'
                          }`}
                          title="Like"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 stroke-[1.5] ${
                              entry.isLiked ? 'fill-rose-500' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer: [20] 100 500 2500 */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-[#27272A] bg-white dark:bg-[#18181B] select-none">
        <div className="flex items-center gap-1.5">
          {pageSizeOptions.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setPageSize(sz)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                pageSize === sz
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

