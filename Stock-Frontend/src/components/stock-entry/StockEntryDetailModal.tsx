import React, { useState } from 'react';
import {
  X,
  Printer,
  Heart,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Send,
  Building,
  Calendar,
} from 'lucide-react';
import { useStockEntry } from '../../context';
import { formatCurrency } from '../../utils';

export const StockEntryDetailModal: React.FC = () => {
  const { selectedEntry, setSelectedEntry, updateStatus, toggleLike } = useStockEntry();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    {
      id: 'c-1',
      user: 'Rəşad Əliyev',
      text: 'Production team verified item quantities against physical warehouse receipt.',
      time: '15 minutes ago',
    },
  ]);

  if (!selectedEntry) return null;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        user: 'Current User',
        text: commentText.trim(),
        time: 'Just now',
      },
    ]);
    selectedEntry.commentsCount += 1;
    setCommentText('');
  };

  const totalQty = selectedEntry.items.reduce((s, it) => s + it.qty, 0);
  const totalAmount = selectedEntry.items.reduce((s, it) => s + it.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 dark:border-[#27272A]">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {selectedEntry.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-medium text-[11px] ${
                selectedEntry.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500'
                  : selectedEntry.status === 'Submitted'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500'
                  : 'bg-slate-100 dark:bg-[#27272A] text-slate-400'
              }`}
            >
              {selectedEntry.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleLike(selectedEntry.id)}
              className={`p-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors ${
                selectedEntry.isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
              }`}
              title="Like"
            >
              <Heart className={`w-3.5 h-3.5 ${selectedEntry.isLiked ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-600 dark:text-zinc-400 transition-colors"
              title="Print Voucher"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setSelectedEntry(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#202024] p-3.5 rounded-xl border border-slate-200/80 dark:border-[#27272A]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Entry Type</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedEntry.stockEntryType}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Purpose</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedEntry.purpose}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">From Warehouse</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedEntry.defaultSourceWarehouse || '-'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">To Warehouse</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedEntry.defaultTargetWarehouse || '-'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Stock Items Details</h4>
            <div className="rounded-xl border border-slate-200 dark:border-[#27272A] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#202024] text-slate-500">
                    <th className="py-2 px-3 font-medium">Item Code</th>
                    <th className="py-2 px-3 font-medium">Item Name</th>
                    <th className="py-2 px-3 font-medium text-right">Qty</th>
                    <th className="py-2 px-3 font-medium text-right">Basic Rate</th>
                    <th className="py-2 px-3 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
                  {selectedEntry.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{it.itemCode}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">{it.itemName}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-800 dark:text-zinc-200">{it.qty} {it.uom}</td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">{formatCurrency(it.basicRate)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 dark:border-[#2E2E33] bg-slate-50/70 dark:bg-[#202024] font-semibold text-slate-900 dark:text-white">
                    <td colSpan={2} className="py-2 px-3">Total Valuation</td>
                    <td className="py-2 px-3 text-right">{totalQty} Nos</td>
                    <td className="py-2 px-3" />
                    <td className="py-2 px-3 text-right">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Remarks */}
          {selectedEntry.remarks && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-[#27272A]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Remarks / Notes</span>
              <p className="text-slate-700 dark:text-zinc-300 mt-0.5">{selectedEntry.remarks}</p>
            </div>
          )}

          {/* Comments Timeline */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#27272A]">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 font-semibold text-xs">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Activity & Comments ({comments.length})</span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#202024] text-[11px]">
                  <div className="flex justify-between font-medium text-slate-700 dark:text-zinc-300">
                    <span>{c.user}</span>
                    <span className="text-[10px] text-slate-400">{c.time}</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-400 mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment or note..."
                className="flex-1 bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none text-xs"
              />
              <button
                onClick={handleAddComment}
                className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Workflow Action buttons */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200/80 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#18181B]">
          <button
            onClick={() => setSelectedEntry(null)}
            className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {selectedEntry.status === 'Draft' && (
              <button
                onClick={() => updateStatus(selectedEntry.id, 'Submitted')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Submit Entry</span>
              </button>
            )}

            {selectedEntry.status === 'Submitted' && (
              <button
                onClick={() => updateStatus(selectedEntry.id, 'Cancelled')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Cancel Document</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

