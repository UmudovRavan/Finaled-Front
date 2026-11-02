import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { usePurchaseReceipt } from '../../context';
import type { PurchaseReceiptRecord } from '../../types';

export const PurchaseReceiptListView: React.FC = () => {
  const {
    filteredReceipts,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = usePurchaseReceipt();

  const isAllSelected =
    filteredReceipts.length > 0 && selectedIds.length === filteredReceipts.length;

  const pageSizeOptions = [20, 100, 500, 2500];

  const displayedReceipts = filteredReceipts.slice(0, pageSize);

  const getStatusColor = (status: PurchaseReceiptRecord['status']) => {
    switch (status) {
      case 'Draft':
        return 'text-[#E11D48] dark:text-[#FB7185]';
      case 'To Bill':
        return 'text-amber-500 dark:text-amber-400';
      case 'Completed':
        return 'text-[#059669] dark:text-[#34D399]';
      case 'Cancelled':
        return 'text-slate-400 dark:text-zinc-500 line-through';
      default:
        return 'text-slate-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm overflow-hidden text-xs">
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          {/* Table Header from Image 1 */}
          <thead>
            <tr className="border-b border-slate-100 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal select-none">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[180px]">
                Supplier Name
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[90px]">
                Status
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[110px]">
                Date
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[110px]">
                Grand Total
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[140px]">
                % Amount Billed
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[140px]">
                % Returned
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[130px]">
                ID
              </th>
              <th className="py-2.5 px-3 font-normal text-right text-slate-400 dark:text-zinc-500 min-w-[110px]">
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {displayedReceipts.length > 0 ? `1 of ${displayedReceipts.length}` : '0 of 0'}
                  </span>
                  <Heart className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
            {displayedReceipts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                  No Purchase Receipts found
                </td>
              </tr>
            ) : (
              displayedReceipts.map((receipt) => {
                const isSelected = selectedIds.includes(receipt.id);
                return (
                  <tr
                    key={receipt.id}
                    className={`transition-colors group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] ${
                      isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(receipt.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Supplier Name (Bold, Clickable to Detail) */}
                    <td className="py-2.5 px-3">
                      <Link
                        to={`/purchase-receipt/${receipt.id}`}
                        className="text-left font-semibold text-slate-900 dark:text-zinc-100 hover:underline hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        {receipt.supplierName}
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span className={`font-medium ${getStatusColor(receipt.status)}`}>
                        {receipt.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {receipt.date}
                    </td>

                    {/* Grand Total */}
                    <td className="py-2.5 px-3 font-normal text-slate-800 dark:text-zinc-200">
                      $ {receipt.grandTotal.toFixed(2)}
                    </td>

                    {/* % Amount Billed (Capsule Progress Bar) */}
                    <td className="py-2.5 px-3">
                      <div className="w-24 sm:w-28 h-2 rounded-full bg-[#E5E7EB] dark:bg-[#27272A] overflow-hidden">
                        <div
                          className="h-full bg-slate-700 dark:bg-zinc-400 rounded-full transition-all duration-300"
                          style={{ width: `${receipt.perAmountBilled}%` }}
                        />
                      </div>
                    </td>

                    {/* % Returned (Capsule Progress Bar) */}
                    <td className="py-2.5 px-3">
                      <div className="w-24 sm:w-28 h-2 rounded-full bg-[#E5E7EB] dark:bg-[#27272A] overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-300"
                          style={{ width: `${receipt.perReturned}%` }}
                        />
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                      {receipt.id.length > 13 ? `${receipt.id.slice(0, 10)}...` : receipt.id}
                    </td>

                    {/* Right metadata: Time, Comments, Heart */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2.5 text-slate-400 dark:text-zinc-500">
                        <span className="text-[11px] font-normal">{receipt.timeAgoText}</span>

                        <div className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>{receipt.commentsCount}</span>
                        </div>

                        <button
                          onClick={() => toggleLike(receipt.id)}
                          className={`p-0.5 hover:scale-110 transition-transform ${
                            receipt.isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
                          }`}
                          title={receipt.isLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 stroke-[1.75] ${
                              receipt.isLiked ? 'fill-rose-500' : ''
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

      {/* Pagination Footer: 20 100 500 2500 */}
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
          Showing {Math.min(displayedReceipts.length, pageSize)} of {filteredReceipts.length} records
        </div>
      </div>
    </div>
  );
};

export default PurchaseReceiptListView;

