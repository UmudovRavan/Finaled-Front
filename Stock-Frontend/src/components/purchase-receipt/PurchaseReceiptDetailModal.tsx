import React, { useState } from 'react';
import {
  X,
  Printer,
  Heart,
  MessageSquare,
  CheckCircle,
  Building,
  Calendar,
} from 'lucide-react';
import { usePurchaseReceipt } from '../../context';
import { formatCurrency } from '../../utils';

export const PurchaseReceiptDetailModal: React.FC = () => {
  const { selectedReceipt, setSelectedReceipt, updateStatus, toggleLike } = usePurchaseReceipt();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    {
      id: 'c-1',
      user: 'Administrator',
      text: 'Items verified against vendor delivery note.',
      time: '15 minutes ago',
    },
  ]);

  if (!selectedReceipt) return null;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        user: 'Administrator',
        text: commentText.trim(),
        time: 'Just now',
      },
    ]);
    selectedReceipt.commentsCount = (selectedReceipt.commentsCount || 0) + 1;
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[#27272A]">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              {selectedReceipt.supplierName}
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                selectedReceipt.status === 'Draft'
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/40'
                  : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40'
              }`}
            >
              {selectedReceipt.status}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleLike(selectedReceipt.id)}
              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors ${
                selectedReceipt.isLiked ? 'text-rose-500' : 'text-slate-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${selectedReceipt.isLiked ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedReceipt(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-[#202024] rounded-xl border border-slate-200/80 dark:border-[#2A2A2E]">
            <div>
              <span className="text-[10px] text-slate-400 block">ID</span>
              <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">{selectedReceipt.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Company</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">{selectedReceipt.company}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Date</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">{selectedReceipt.postingDate || selectedReceipt.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Grand Total</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(selectedReceipt.grandTotal)}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Items</h4>
            <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-[#27272A]">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-right">Accepted Qty</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#242428]">
                  {selectedReceipt.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">
                        {it.itemName} ({it.itemCode})
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {it.acceptedQty} {it.uom}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {formatCurrency(it.rate)}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(it.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024]/50">
          <div className="flex gap-2">
            {selectedReceipt.status === 'Draft' && (
              <button
                onClick={() => updateStatus(selectedReceipt.id, 'Completed')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
              >
                Submit Receipt
              </button>
            )}
          </div>
          <button
            onClick={() => setSelectedReceipt(null)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
