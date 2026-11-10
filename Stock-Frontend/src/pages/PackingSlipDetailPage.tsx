import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Edit2 } from 'lucide-react';
import { usePackingSlip } from '../context';
import type { PackingSlipItem } from '../types';
import { PackingSlipDetailSidebar } from '../components/packing-slip/PackingSlipDetailSidebar';

export const PackingSlipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { slips, toggleLike, updateStatus } = usePackingSlip();

  const entry = slips.find((s) => s.id === id) || slips[0] || {
    id: id || 'MAT-PAC-2026-00001',
    status: 'Draft',
    deliveryNote: 'MAT-DN-2026-00001',
    series: 'MAT-PAC-.YYYY.-',
    fromPackageNo: 1,
    toPackageNo: 1,
    items: [
      {
        id: 'pac-it-1',
        itemCode: 'SKU002: Laptop',
        itemName: 'Laptop',
        qty: 1,
        netWeight: 0,
        pageBreak: false,
      },
    ],
    netWeight: 0,
    grossWeight: 0.0,
    grossWeightUom: '',
    letterHead: 'Company Letterhead - Grey',
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: '31 m',
    commentsCount: 0,
    isLiked: false,
  };

  const [deliveryNote, setDeliveryNote] = useState(
    entry.deliveryNote || 'MAT-DN-2026-00001'
  );
  const [series, setSeries] = useState(entry.series || 'MAT-PAC-.YYYY.-');
  const [fromPackageNo, setFromPackageNo] = useState(
    entry.fromPackageNo ?? 1
  );
  const [toPackageNo, setToPackageNo] = useState(entry.toPackageNo ?? 1);

  const [items, setItems] = useState<PackingSlipItem[]>(
    entry.items && entry.items.length > 0
      ? entry.items
      : [
          {
            id: 'pac-it-1',
            itemCode: 'SKU002: Laptop',
            itemName: 'Laptop',
            qty: 1,
            netWeight: 0,
            pageBreak: false,
          },
        ]
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const [netWeight, setNetWeight] = useState(entry.netWeight ?? 0);
  const [grossWeight, setGrossWeight] = useState(entry.grossWeight ?? 0.0);
  const [grossWeightUom, setGrossWeightUom] = useState(
    entry.grossWeightUom || ''
  );
  const [letterHead, setLetterHead] = useState(
    entry.letterHead || 'Company Letterhead - Grey'
  );

  const [comments, setComments] = useState<
    { id: string; author: string; text: string; time: string }[]
  >([]);
  const [commentText, setCommentText] = useState('');

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `pac-it-${Date.now()}`,
        itemCode: '',
        itemName: '',
        qty: 1,
        netWeight: 0,
        pageBreak: false,
      },
    ]);
  };

  const handleItemChange = (
    itemId: string,
    field: keyof PackingSlipItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, [field]: value } : it))
    );
  };

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
          {/* MAIN LEFT CONTENT */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* Alert / Notice for Draft (Screenshot 4) */}
            {entry.status === 'Draft' && (
              <div className="px-4 py-2.5 rounded-lg bg-[#EBF5FF] dark:bg-sky-950/40 text-[#1E6091] dark:text-sky-300 text-xs font-normal">
                Submit this document to confirm
              </div>
            )}

            {/* TOP 2 COLUMNS GRID (Screenshot 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Delivery Note <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Indicates that the package is a part of this delivery (Only Draft)
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    From Package No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={fromPackageNo}
                    onChange={(e) => setFromPackageNo(Number(e.target.value))}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Identification of the package for the delivery (for print)
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Series <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    To Package No.
                  </label>
                  <input
                    type="number"
                    value={toPackageNo}
                    onChange={(e) => setToPackageNo(Number(e.target.value))}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    If more than one package of the same type (for print)
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION: ITEMS (Screenshot 4) */}
            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Items
              </h4>

              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#27272A]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-500 font-normal select-none">
                      <th className="py-2 px-2.5 w-7 text-center">
                        <input
                          type="checkbox"
                          checked={
                            items.length > 0 &&
                            selectedItemIds.length === items.length
                          }
                          onChange={() => {
                            if (selectedItemIds.length === items.length) {
                              setSelectedItemIds([]);
                            } else {
                              setSelectedItemIds(items.map((i) => i.id));
                            }
                          }}
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-2 px-2.5 w-10 text-slate-500 font-normal">
                        No.
                      </th>
                      <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[200px]">
                        Item Code <span className="text-red-500">*</span>
                      </th>
                      <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[180px]">
                        Item Name
                      </th>
                      <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[100px]">
                        Quantity <span className="text-red-500">*</span>
                      </th>
                      <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[100px]">
                        Net Weight
                      </th>
                      <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[80px]">
                        Page B...
                      </th>
                      <th className="py-2 px-2 w-7 text-center">
                        <Settings className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                    {items.map((it, idx) => (
                      <tr
                        key={it.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                      >
                        <td className="py-2 px-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(it.id)}
                            onChange={() => {
                              setSelectedItemIds((prev) =>
                                prev.includes(it.id)
                                  ? prev.filter((i) => i !== it.id)
                                  : [...prev, it.id]
                              );
                            }}
                            className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2.5 font-medium text-slate-900 dark:text-white">
                          <input
                            type="text"
                            value={it.itemCode}
                            onChange={(e) =>
                              handleItemChange(it.id, 'itemCode', e.target.value)
                            }
                            className="w-full bg-transparent border-0 outline-none p-0 text-slate-800 dark:text-zinc-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-zinc-300">
                          <input
                            type="text"
                            value={it.itemName}
                            onChange={(e) =>
                              handleItemChange(it.id, 'itemName', e.target.value)
                            }
                            className="w-full bg-transparent border-0 outline-none p-0 text-slate-800 dark:text-zinc-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-slate-800 dark:text-zinc-200">
                          <input
                            type="number"
                            value={it.qty}
                            onChange={(e) =>
                              handleItemChange(it.id, 'qty', Number(e.target.value))
                            }
                            className="w-full bg-transparent border-0 outline-none p-0 text-slate-800 dark:text-zinc-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-zinc-300">
                          <input
                            type="number"
                            value={it.netWeight}
                            onChange={(e) =>
                              handleItemChange(
                                it.id,
                                'netWeight',
                                Number(e.target.value)
                              )
                            }
                            className="w-full bg-transparent border-0 outline-none p-0 text-slate-800 dark:text-zinc-200 text-xs"
                          />
                        </td>
                        <td className="py-2 px-2.5">
                          <input
                            type="checkbox"
                            checked={it.pageBreak}
                            onChange={(e) =>
                              handleItemChange(it.id, 'pageBreak', e.target.checked)
                            }
                            className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-2 text-center text-slate-400">
                          <Edit2 className="w-3.5 h-3.5 inline cursor-pointer hover:text-slate-700" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 rounded bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 text-xs font-normal transition-colors"
              >
                Add row
              </button>
            </div>

            {/* SECTION: PACKAGE WEIGHT DETAILS (Screenshot 4 & 5) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Package Weight Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {/* Left */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Net Weight
                  </label>
                  <input
                    type="number"
                    value={netWeight}
                    onChange={(e) => setNetWeight(Number(e.target.value))}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    The net weight of this package. (calculated automatically as sum of net weight of items)
                  </p>
                </div>

                {/* Right */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Gross Weight
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(Number(e.target.value))}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                      The gross weight of the package. Usually net weight + packaging material weight. (for print)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Gross Weight UOM
                    </label>
                    <input
                      type="text"
                      value={grossWeightUom}
                      onChange={(e) => setGrossWeightUom(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION: LETTER HEAD (Screenshot 5) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Letter Head
              </h4>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Letter Head
                </label>
                <input
                  type="text"
                  value={letterHead}
                  onChange={(e) => setLetterHead(e.target.value)}
                  className="w-full md:w-1/2 bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                />
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

            {/* ACTIVITY SECTION (Screenshot 5) */}
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

              <div className="space-y-2 text-slate-500 dark:text-zinc-400 text-xs pl-2 border-l-2 border-slate-200 dark:border-[#27272A]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>You created this · 32 minutes ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>You last edited this · 32 minutes ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <PackingSlipDetailSidebar
            entry={entry}
            onToggleLike={() => toggleLike(entry.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default PackingSlipDetailPage;

