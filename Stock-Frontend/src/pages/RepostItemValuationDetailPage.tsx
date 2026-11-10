import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Paperclip, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { useRepostItemValuation } from '../context';
import { RepostItemValuationDetailSidebar } from '../components/repost-item-valuation/RepostItemValuationDetailSidebar';

export const RepostItemValuationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { valuations, toggleLike, updateStatus } = useRepostItemValuation();

  const entry = valuations.find((v) => v.id === id) || valuations[0] || {
    id: id || 'c3nehrpeg3',
    status: 'Completed',
    basedOn: 'Item and Warehouse',
    voucherType: '',
    voucherNo: '',
    itemCode: 'SKU002',
    warehouse: 'Devam Eden İşlər - AD',
    postingDate: '01-11-2026',
    postingTime: '23:08:58',
    company: 'Avalon (Demo)',
    repostOnlyAccountingLedgers: false,
    allowNegativeStock: true,
    viaLandedCostVoucher: false,
    allowZeroRate: false,
    recreateStockLedgers: false,
    noOfItemsToRepost: 1,
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: '1 w',
    commentsCount: 0,
    isLiked: false,
  };

  const [basedOn, setBasedOn] = useState(entry.basedOn || 'Item and Warehouse');
  const [itemCode, setItemCode] = useState(entry.itemCode || 'SKU002');
  const [warehouse, setWarehouse] = useState(
    entry.warehouse || 'Devam Eden İşlər - AD'
  );
  const [postingDate, setPostingDate] = useState(
    entry.postingDate || '01-11-2026'
  );
  const [postingTime, setPostingTime] = useState(
    entry.postingTime || '23:08:58'
  );

  const [voucherType, setVoucherType] = useState(entry.voucherType || '');
  const [voucherNo, setVoucherNo] = useState(entry.voucherNo || '');

  const [company, setCompany] = useState(entry.company || 'Avalon (Demo)');
  const [allowNegativeStock, setAllowNegativeStock] = useState(
    entry.allowNegativeStock ?? true
  );
  const [viaLandedCostVoucher, setViaLandedCostVoucher] = useState(
    entry.viaLandedCostVoucher ?? false
  );
  const [allowZeroRate, setAllowZeroRate] = useState(
    entry.allowZeroRate ?? false
  );
  const [noOfItemsToRepost, setNoOfItemsToRepost] = useState(
    entry.noOfItemsToRepost ?? 1
  );

  const [comments, setComments] = useState<
    { id: string; author: string; text: string; time: string }[]
  >([]);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentText.trim()) {
      setComments((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          author: 'Administrator',
          text: commentText.trim(),
          time: 'Just now',
        },
      ]);
      setCommentText('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-xs">
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* MAIN LEFT COLUMN */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Top 2 Columns Grid (Screenshot 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* Based On */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Based On <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={basedOn}
                    onChange={(e) => setBasedOn(e.target.value as any)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                </div>

                {basedOn === 'Transaction' ? (
                  <>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                        Voucher Type <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={voucherType}
                        onChange={(e) => setVoucherType(e.target.value)}
                        className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                        Voucher No <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={voucherNo}
                        onChange={(e) => setVoucherNo(e.target.value)}
                        className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Item Code */}
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                        Item Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={itemCode}
                        onChange={(e) => setItemCode(e.target.value)}
                        className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                      />
                    </div>

                    {/* Warehouse */}
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                        Warehouse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={warehouse}
                        onChange={(e) => setWarehouse(e.target.value)}
                        className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                      />
                    </div>

                    {/* Posting Date */}
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                        Posting Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={postingDate}
                        onChange={(e) => setPostingDate(e.target.value)}
                        className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                      />
                    </div>

                    {/* Posting Time */}
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                        Posting Time
                      </label>
                      <input
                        type="text"
                        value={postingTime}
                        onChange={(e) => setPostingTime(e.target.value)}
                        className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Status
                  </label>
                  <input
                    type="text"
                    disabled
                    value={entry.status}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-700 dark:text-zinc-200 border border-transparent cursor-not-allowed text-xs"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                </div>

                {/* Checkboxes List (Screenshot 3) */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowNegativeStock}
                        onChange={(e) =>
                          setAllowNegativeStock(e.target.checked)
                        }
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-slate-700 dark:text-zinc-200 text-xs">
                        Allow Negative Stock
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={viaLandedCostVoucher}
                        onChange={(e) =>
                          setViaLandedCostVoucher(e.target.checked)
                        }
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-slate-700 dark:text-zinc-200 text-xs">
                        Via Landed Cost Voucher
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowZeroRate}
                        onChange={(e) => setAllowZeroRate(e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-slate-700 dark:text-zinc-200 text-xs">
                        Allow Zero Rate
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Reposting Item and Warehouse Section (Screenshot 3) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Reposting Item and Warehouse
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                <div className="hidden md:block" />
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    No of Items to Repost
                  </label>
                  <input
                    type="number"
                    value={noOfItemsToRepost}
                    onChange={(e) =>
                      setNoOfItemsToRepost(Number(e.target.value))
                    }
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* COMMENTS SECTION */}
            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-[#27272A]">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Comments
              </h4>

              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#D1FAE5] dark:bg-emerald-950/80 text-[#059669] dark:text-emerald-400 flex items-center justify-center font-medium text-[11px] shrink-0">
                  A
                </div>
                <input
                  type="text"
                  placeholder="Type a reply / comment"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleAddComment}
                  className="flex-1 bg-[#F4F5F7] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                />
              </div>

              {comments.map((cm) => (
                <div
                  key={cm.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-[#202024] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-white text-xs">
                      {cm.author}
                    </span>
                    <span className="text-[10px] text-slate-400">{cm.time}</span>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-300 text-xs">
                    {cm.text}
                  </p>
                </div>
              ))}
            </div>

            {/* ACTIVITY SECTION (Screenshot 4) */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                  Activity
                </h4>
                <button
                  type="button"
                  onClick={() => alert('New Email')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#202024] hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-normal transition-colors"
                >
                  + New Email
                </button>
              </div>

              <div className="relative pl-3 border-l-2 border-slate-200 dark:border-[#27272A] space-y-3.5 text-slate-500 dark:text-zinc-400 text-xs">
                {/* 1. Attachment removed */}
                <div className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    You removed attachment repost_item_valuation-{entry.id}
                    .json.gz · 1 week ago
                  </span>
                </div>

                {/* 2. Last edited */}
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>You last edited this · 1 week ago</span>
                </div>

                {/* 3. Attachment added */}
                <div className="flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    You attached repost_item_valuation-{entry.id}.json.gz 🔒 · 1
                    week ago
                  </span>
                </div>

                {/* 4. Created */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    <span>You created this · 1 week ago</span>
                  </div>
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <RepostItemValuationDetailSidebar
            entry={entry}
            onToggleLike={() => toggleLike(entry.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default RepostItemValuationDetailPage;

