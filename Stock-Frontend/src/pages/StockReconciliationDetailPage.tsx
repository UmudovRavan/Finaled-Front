import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Scan,
  Plus,
  Settings,
  Edit2,
  Trash2,
  Download,
  Upload,
  ChevronsUpDown,
} from 'lucide-react';
import { useStockReconciliation } from '../context';
import { INITIAL_PRODUCTS } from '../api';
import type {
  StockReconciliationItem,
  StockReconciliationPurpose,
} from '../types';
import { StockReconciliationDetailSidebar } from '../components/stock-reconciliation/StockReconciliationDetailSidebar';

export const StockReconciliationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reconciliations, updateStatus, toggleLike } =
    useStockReconciliation();

  const entry = reconciliations.find((r) => r.id === id) || reconciliations[0];

  // Form states initialized with entry
  const [company, setCompany] = useState(entry?.company || 'Avalon (Demo)');
  const [purpose, setPurpose] = useState<StockReconciliationPurpose>(
    entry?.purpose || 'Opening Stock'
  );
  const [defaultWarehouse, setDefaultWarehouse] = useState(
    entry?.defaultWarehouse || 'Bitmiş Ürünler - AD'
  );
  const [postingDate, setPostingDate] = useState(
    entry?.postingDate || '10-11-2026'
  );
  const [postingTime, setPostingTime] = useState(
    entry?.postingTime || '00:31:35'
  );
  const [editPostingDateTime, setEditPostingDateTime] = useState(
    entry?.editPostingDateTime ?? false
  );

  // Scan states
  const [scanBarcode, setScanBarcode] = useState('');
  const [scanMode, setScanMode] = useState(entry?.scanMode ?? false);

  // Items State (Screenshot 3 & 4)
  const [items, setItems] = useState<StockReconciliationItem[]>(
    entry?.items && entry.items.length > 0
      ? entry.items
      : [
          {
            id: 'it-reco-1',
            itemCode: 'SKU001: T-shirt',
            itemName: 'SKU001: T-shirt',
            warehouse: 'Bitmiş Ürünler - AD',
            qty: 3,
            stockUom: 'Nos',
            valuationRate: 3.0,
            amount: 9.0,
          },
        ]
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Difference Account states
  const [differenceAccount, setDifferenceAccount] = useState(
    entry?.differenceAccount || '111.01 - Sermaye Ekipmanı - AD'
  );

  useEffect(() => {
    if (entry) {
      setCompany(entry.company || 'Avalon (Demo)');
      setPurpose(entry.purpose || 'Opening Stock');
      setDefaultWarehouse(entry.defaultWarehouse || 'Bitmiş Ürünler - AD');
      setPostingDate(entry.postingDate || '10-11-2026');
      setPostingTime(entry.postingTime || '00:31:35');
      setEditPostingDateTime(entry.editPostingDateTime ?? false);
      setScanMode(entry.scanMode ?? false);
      if (entry.items && entry.items.length > 0) {
        setItems(entry.items);
      }
      setDifferenceAccount(entry.differenceAccount || '111.01 - Sermaye Ekipmanı - AD');
    }
  }, [entry?.id]);

  // Comments state
  const [comments, setComments] = useState<
    { id: string; author: string; text: string; time: string }[]
  >([]);
  const [commentText, setCommentText] = useState('');

  if (!entry) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Stock Reconciliation not found.{' '}
        <button
          onClick={() => navigate('/stock-reconciliation')}
          className="text-indigo-600 underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  const totalDifferenceAmount = items.reduce(
    (acc, it) => acc + (it.amount || it.qty * it.valuationRate || 0),
    0
  );

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        itemCode: '',
        itemName: '',
        warehouse: defaultWarehouse || 'Bitmiş Ürünler - AD',
        qty: 1,
        stockUom: 'Nos',
        valuationRate: 0,
        amount: 0,
      },
    ]);
  };

  const handleItemChange = (
    rowId: string,
    field: keyof StockReconciliationItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== rowId) return item;
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'valuationRate') {
          const q = field === 'qty' ? Number(value) || 0 : item.qty;
          const r = field === 'valuationRate' ? Number(value) || 0 : item.valuationRate;
          updated.amount = q * r;
        }
        return updated;
      })
    );
  };

  const toggleSelectRow = (rowId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(rowId) ? prev.filter((i) => i !== rowId) : [...prev, rowId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
  };

  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((i) => !selectedItemIds.includes(i.id)));
    setSelectedItemIds([]);
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanBarcode.trim()) {
      e.preventDefault();
      const q = scanBarcode.trim().toLowerCase();
      const matched = INITIAL_PRODUCTS.find(
        (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      );
      const code = matched ? `${matched.sku}: ${matched.name}` : scanBarcode.trim();
      setItems((prev) => [
        ...prev,
        {
          id: `it-${Date.now()}`,
          itemCode: code,
          itemName: matched ? matched.name : code,
          warehouse: defaultWarehouse || 'Bitmiş Ürünler - AD',
          qty: scanMode ? 0 : 1,
          stockUom: 'Nos',
          valuationRate: 3.0,
          amount: 3.0,
        },
      ]);
      setScanBarcode('');
    }
  };

  const handleAddComment = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentText.trim()) {
      setComments((prev) => [
        ...prev,
        {
          id: `cm-${Date.now()}`,
          author: 'You',
          text: commentText.trim(),
          time: 'Just now',
        },
      ]);
      setCommentText('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white dark:bg-[#09090B] font-sans text-xs text-slate-800 dark:text-zinc-200">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT MAIN CONTENT AREA */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Top Blue Info Banner when Draft (Screenshot 3: "Submit this document to confirm") */}
            {entry.status === 'Draft' && (
              <div className="px-4 py-2.5 rounded-lg bg-[#EBF5FF] dark:bg-sky-950/40 text-[#1E6091] dark:text-sky-300 text-xs font-normal">
                Submit this document to confirm
              </div>
            )}

            {/* Top 2 Columns Grid from Screenshot 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Company * */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                </div>

                {/* Purpose * */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={purpose}
                      onChange={(e) =>
                        setPurpose(e.target.value as StockReconciliationPurpose)
                      }
                      className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 pr-8 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs cursor-pointer"
                    >
                      <option value="Opening Stock">Opening Stock</option>
                      <option value="Stock Reconciliation">Stock Reconciliation</option>
                    </select>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Posting Date * */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Posting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={postingDate}
                    onChange={(e) => setPostingDate(e.target.value)}
                    disabled={!editPostingDateTime}
                    className={`w-full px-3 py-1.5 rounded-lg border border-transparent outline-none text-xs ${
                      editPostingDateTime
                        ? 'bg-white dark:bg-[#202024] text-slate-800 dark:text-zinc-200 border-slate-300'
                        : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 cursor-not-allowed opacity-90'
                    }`}
                  />
                </div>

                {/* Posting Time * */}
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Posting Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={postingTime}
                    onChange={(e) => setPostingTime(e.target.value)}
                    disabled={!editPostingDateTime}
                    className={`w-full px-3 py-1.5 rounded-lg border border-transparent outline-none text-xs ${
                      editPostingDateTime
                        ? 'bg-white dark:bg-[#202024] text-slate-800 dark:text-zinc-200 border-slate-300'
                        : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 cursor-not-allowed opacity-90'
                    }`}
                  />
                </div>

                {/* Edit Posting Date and Time Checkbox */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={editPostingDateTime}
                      onChange={(e) => setEditPostingDateTime(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span>Edit Posting Date and Time</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Default Warehouse (Screenshot 3) */}
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                Default Warehouse
              </label>
              <input
                type="text"
                value={defaultWarehouse}
                onChange={(e) => setDefaultWarehouse(e.target.value)}
                className="w-full md:w-1/2 bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
              />
            </div>

            {/* Barcode & Scan Mode Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-2">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Scan Barcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={scanBarcode}
                    onChange={(e) => setScanBarcode(e.target.value)}
                    onKeyDown={handleBarcodeKeyDown}
                    placeholder="Scan Barcode and press Enter"
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 pr-8 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                  />
                  <Scan className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={scanMode}
                    onChange={(e) => setScanMode(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="font-medium">Scan Mode</span>
                </label>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 ml-5">
                  Disables auto-fetching of existing quantity
                </p>
              </div>
            </div>

            {/* Items Section (Screenshot 3 & 4) */}
            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Items
              </h4>

              {selectedItemIds.length > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                  <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                    {selectedItemIds.length} item(s) selected
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected</span>
                  </button>
                </div>
              )}

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
                          onChange={toggleSelectAll}
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
                        Warehouse <span className="text-red-500">*</span>
                      </th>
                      <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[110px] text-right">
                        Quantity
                      </th>
                      <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[90px]">
                        Stock UOM
                      </th>
                      <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[120px] text-right">
                        Valuation Rate
                      </th>
                      <th className="py-2 px-2.5 w-8 text-center text-slate-400">
                        <Settings className="w-3.5 h-3.5 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                    {items.map((it, idx) => {
                      const isSelected = selectedItemIds.includes(it.id);
                      const isEditing = editingRowId === it.id;

                      return (
                        <tr
                          key={it.id}
                          className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors ${
                            isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-2 px-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(it.id)}
                              className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* No. */}
                          <td className="py-2 px-2.5 text-slate-400 select-none">
                            {idx + 1}
                          </td>

                          {/* Item Code */}
                          <td className="py-2 px-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={it.itemCode}
                                onChange={(e) =>
                                  handleItemChange(
                                    it.id,
                                    'itemCode',
                                    e.target.value
                                  )
                                }
                                className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                              />
                            ) : (
                              <div
                                onClick={() => setEditingRowId(it.id)}
                                className="cursor-pointer font-medium text-slate-800 dark:text-zinc-200 hover:text-indigo-600"
                              >
                                {it.itemCode}
                              </div>
                            )}
                          </td>

                          {/* Warehouse */}
                          <td className="py-2 px-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={it.warehouse}
                                onChange={(e) =>
                                  handleItemChange(
                                    it.id,
                                    'warehouse',
                                    e.target.value
                                  )
                                }
                                className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                              />
                            ) : (
                              <div
                                onClick={() => setEditingRowId(it.id)}
                                className="cursor-pointer text-slate-600 dark:text-zinc-300"
                              >
                                {it.warehouse}
                              </div>
                            )}
                          </td>

                          {/* Quantity */}
                          <td className="py-2 px-2.5 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.001"
                                value={it.qty}
                                onChange={(e) =>
                                  handleItemChange(
                                    it.id,
                                    'qty',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 text-right bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                              />
                            ) : (
                              <span
                                onClick={() => setEditingRowId(it.id)}
                                className="cursor-pointer"
                              >
                                {it.qty}
                              </span>
                            )}
                          </td>

                          {/* Stock UOM */}
                          <td className="py-2 px-2.5 text-slate-600 dark:text-zinc-300">
                            {it.stockUom || 'Nos'}
                          </td>

                          {/* Valuation Rate */}
                          <td className="py-2 px-2.5 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={it.valuationRate}
                                onChange={(e) =>
                                  handleItemChange(
                                    it.id,
                                    'valuationRate',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-20 text-right bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                              />
                            ) : (
                              <span
                                onClick={() => setEditingRowId(it.id)}
                                className="cursor-pointer"
                              >
                                $ {it.valuationRate.toFixed(2)}
                              </span>
                            )}
                          </td>

                          {/* Pen icon */}
                          <td className="py-2 px-2.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingRowId(isEditing ? null : it.id)
                              }
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                              title="Edit Row"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons below Items Table */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                >
                  Add row
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert('Download template')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Upload template')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>

            {/* Difference Account and Difference Amount (Screenshot 3 & 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-2">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Difference Account
                </label>
                <input
                  type="text"
                  value={differenceAccount}
                  onChange={(e) => setDifferenceAccount(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Difference Amount
                </label>
                <div className="text-slate-800 dark:text-zinc-200 font-mono py-1.5 text-xs">
                  $ {totalDifferenceAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Comments Section (Screenshot 4) */}
            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-[#27272A]">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Comments
              </h4>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-semibold text-xs shrink-0">
                  A
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleAddComment}
                  placeholder="Type a reply / comment"
                  className="flex-1 bg-[#F3F4F6] dark:bg-[#202024] px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 placeholder-slate-400 outline-none border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-xs"
                />
              </div>

              {comments.map((cm) => (
                <div key={cm.id} className="pl-10 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-white text-xs">
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

            {/* Activity Section (Screenshot 4) */}
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
                  <span>You created this · 1 minute ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>You last edited this · 1 minute ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <StockReconciliationDetailSidebar
            entry={entry}
            onToggleLike={() => toggleLike(entry.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default StockReconciliationDetailPage;

