import React from 'react';
import { usePurchaseReceipt } from '../../context';
import { Heart, MessageSquare, Plus } from 'lucide-react';
import type { PurchaseReceiptStatus, PurchaseReceiptRecord } from '../../types';
import { formatCurrency } from '../../utils';
import { useNavigate } from 'react-router-dom';

export const PurchaseReceiptKanbanView: React.FC = () => {
  const { filteredReceipts, setSelectedReceipt, toggleLike, updateStatus, setIsAddModalOpen } =
    usePurchaseReceipt();
  const navigate = useNavigate();

  const columns: { status: PurchaseReceiptStatus; title: string; color: string; badge: string }[] = [
    {
      status: 'Draft',
      title: 'Draft',
      color: 'border-rose-400 dark:border-rose-500/80',
      badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-500',
    },
    {
      status: 'To Bill',
      title: 'To Bill',
      color: 'border-amber-400 dark:border-amber-500/80',
      badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-500',
    },
    {
      status: 'Completed',
      title: 'Completed',
      color: 'border-emerald-400 dark:border-emerald-500/80',
      badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500',
    },
    {
      status: 'Cancelled',
      title: 'Cancelled',
      color: 'border-slate-300 dark:border-zinc-700',
      badge: 'bg-slate-100 dark:bg-[#27272A] text-slate-500',
    },
  ];

  const getReceiptsByStatus = (status: PurchaseReceiptStatus) =>
    filteredReceipts.filter((r) => r.status === status);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
      {columns.map((col) => {
        const items = getReceiptsByStatus(col.status);
        return (
          <div
            key={col.status}
            className="flex flex-col bg-slate-50/80 dark:bg-[#18181B] rounded-2xl border border-slate-200/80 dark:border-[#27272A] p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/70 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-white text-xs">{col.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${col.badge}`}>
                  {items.length}
                </span>
              </div>
              {col.status === 'Draft' && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-600 dark:text-zinc-400 transition-colors"
                  title="Add Purchase Receipt"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Column Cards */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-zinc-500 text-[11px]">
                  No {col.title} receipts
                </div>
              ) : (
                items.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#1E1E22] border border-slate-200/80 dark:border-[#2E2E33] shadow-sm hover:shadow transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        onClick={() => navigate(`/purchase-receipt/${receipt.id}`)}
                        className="font-semibold text-slate-900 dark:text-white hover:underline text-left text-xs truncate max-w-[150px]"
                      >
                        {receipt.supplierName}
                      </button>
                      <button
                        onClick={() => toggleLike(receipt.id)}
                        className={`p-0.5 hover:scale-110 transition-transform ${
                          receipt.isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${receipt.isLiked ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>

                    <p className="font-normal text-slate-500 dark:text-zinc-400 text-[11px] mb-2 font-mono">
                      {receipt.id}
                    </p>

                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-1 mb-2.5 bg-slate-50 dark:bg-[#27272B] p-2 rounded-lg">
                      <div className="flex justify-between">
                        <span>Grand Total:</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {formatCurrency(receipt.grandTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="text-slate-700 dark:text-zinc-300">{receipt.postingDate || receipt.date}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/50 dark:border-zinc-800">
                        <span>Billed:</span>
                        <div className="w-20 bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${receipt.perAmountBilled}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#27272A] text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {receipt.commentsCount || 0}
                      </span>
                      <span className="text-[10px]">{receipt.timeAgoText || 'recently'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PurchaseReceiptKanbanView;

