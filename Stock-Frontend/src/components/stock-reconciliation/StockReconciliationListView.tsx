import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { useStockReconciliation } from '../../context';
import type { StockReconciliationRecord } from '../../types';

export const StockReconciliationListView: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredReconciliations,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useStockReconciliation();

  const isAllSelected =
    filteredReconciliations.length > 0 &&
    selectedIds.length === filteredReconciliations.length;

  const pageSizeOptions = [20, 100, 500, 2500];

  const displayedReconciliations = filteredReconciliations.slice(0, pageSize);

  const getStatusBadge = (status: StockReconciliationRecord['status']) => {
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
          {/* Table Header from Screenshot 1: Checkbox | ID | Status | Posting Date | Posting Time | 1 of 1 ♡ */}
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
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[220px]">
                ID
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[120px]">
                Status
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[180px]">
                Posting Date
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[180px]">
                Posting Time
              </th>
              <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400 min-w-[110px]">
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {displayedReconciliations.length > 0
                      ? `1 of ${displayedReconciliations.length}`
                      : '0 of 0'}
                  </span>
                  <Heart className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
            {displayedReconciliations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                  No Stock Reconciliations found
                </td>
              </tr>
            ) : (
              displayedReconciliations.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] ${
                      isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* ID (Bold, Clickable) */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/stock-reconciliation/${item.id}`)}
                        className="text-left font-semibold text-slate-900 dark:text-zinc-100 hover:underline hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        {item.id}
                      </button>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Posting Date */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {item.postingDate}
                    </td>

                    {/* Posting Time */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {item.postingTime}
                    </td>

                    {/* Right metadata: Time, Comments, ·, Heart */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-zinc-500">
                        <span className="text-[11px] font-normal">{item.timeAgoText}</span>

                        <div className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>{item.commentsCount}</span>
                        </div>

                        <span className="text-slate-300 dark:text-zinc-600">·</span>

                        <button
                          onClick={() => toggleLike(item.id)}
                          className={`p-0.5 hover:scale-110 transition-transform ${
                            item.isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
                          }`}
                          title="Like"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 stroke-[1.75] ${
                              item.isLiked ? 'fill-rose-500' : ''
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

      {/* Pagination Footer: 20 | 100 | 500 | 2500 */}
      <div className="px-3 py-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between bg-slate-50/50 dark:bg-[#18181B] text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          {pageSizeOptions.map((size) => {
            const isActive = pageSize === size;
            return (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-200 dark:bg-[#2E2E33] text-slate-900 dark:text-white font-medium'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#242428]'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 dark:text-zinc-500">
          Showing {Math.min(displayedReconciliations.length, pageSize)} of{' '}
          {filteredReconciliations.length} records
        </div>
      </div>
    </div>
  );
};

export default StockReconciliationListView;

