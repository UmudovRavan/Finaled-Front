import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { useRepostItemValuation } from '../../context';
import type { RepostItemValuationRecord } from '../../types';

export const RepostItemValuationListView: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredValuations,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useRepostItemValuation();

  const isAllSelected =
    filteredValuations.length > 0 &&
    selectedIds.length === filteredValuations.length;

  const pageSizeOptions = [20, 100, 500, 2500];
  const displayedValuations = filteredValuations.slice(0, pageSize);

  const getStatusBadge = (status: RepostItemValuationRecord['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399] border border-emerald-200/50';
      case 'Queued':
        return 'bg-amber-50 dark:bg-amber-950/60 text-[#D97706] dark:text-[#FBBF24] border border-amber-200/50';
      case 'In Progress':
        return 'bg-sky-50 dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8] border border-sky-200/50';
      case 'Failed':
        return 'bg-rose-50 dark:bg-rose-950/60 text-[#E11D48] dark:text-[#FB7185] border border-rose-200/50';
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
          {/* Table Header from Screenshot 1: Checkbox | ID | Status | Voucher Type | Voucher No | 1 of 1 ♡ */}
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
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[200px]">
                ID
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[130px]">
                Status
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[180px]">
                Voucher Type
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[180px]">
                Voucher No
              </th>
              <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400 min-w-[110px]">
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {displayedValuations.length > 0
                      ? `1 of ${displayedValuations.length}`
                      : '0 of 0'}
                  </span>
                  <Heart className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
            {displayedValuations.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-slate-400 dark:text-zinc-500 font-normal"
                >
                  No Repost Item Valuations found
                </td>
              </tr>
            ) : (
              displayedValuations.map((entry) => {
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
                    <td className="py-3 px-3 font-medium">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/repost-item-valuation/${entry.id}`)
                        }
                        className="text-slate-900 dark:text-white hover:underline text-left font-semibold"
                      >
                        {entry.id}
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-normal ${getStatusBadge(
                          entry.status
                        )}`}
                      >
                        {entry.status}
                      </span>
                    </td>

                    {/* Voucher Type */}
                    <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">
                      {entry.voucherType || ''}
                    </td>

                    {/* Voucher No */}
                    <td className="py-3 px-3 text-slate-600 dark:text-zinc-300">
                      {entry.voucherNo || ''}
                    </td>

                    {/* Meta: timeAgo · comments · like */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2.5 text-slate-400 dark:text-zinc-500">
                        <span className="text-[11px] whitespace-nowrap">
                          {entry.timeAgoText || '1 w'}
                        </span>

                        <div className="flex items-center gap-0.5 text-[11px]">
                          <MessageSquare className="w-3 h-3 stroke-[1.75]" />
                          <span>{entry.commentsCount ?? 0}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleLike(entry.id)}
                          className={`p-0.5 transition-colors ${
                            entry.isLiked
                              ? 'text-rose-500 fill-rose-500'
                              : 'hover:text-rose-500'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 stroke-[1.75] ${
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

      {/* Pagination Footer */}
      <div className="py-3 px-4 flex items-center justify-between border-t border-slate-100 dark:border-[#27272A] bg-white dark:bg-[#18181B] select-none">
        <div className="flex items-center gap-1.5">
          {pageSizeOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setPageSize(opt)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                pageSize === opt
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepostItemValuationListView;

