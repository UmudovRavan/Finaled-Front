import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ScanBarcode,
  Settings as Gear,
  Pencil,
  Plus,
  Mail,
  ChevronUp,
} from 'lucide-react';
import type { PurchaseReceiptRecord } from '../../types';
import { formatCurrency } from '../../utils';

interface PurchaseReceiptDetailContentProps {
  receipt: PurchaseReceiptRecord;
  onUpdateReceipt?: (updated: Partial<PurchaseReceiptRecord>) => void;
}

export const PurchaseReceiptDetailContent: React.FC<PurchaseReceiptDetailContentProps> = ({
  receipt,
  onUpdateReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<
    'details' | 'taxes_charges' | 'other_info' | 'connections'
  >('details');

  // Details Tab fields
  const [isDefaultWarehouseOpen, setIsDefaultWarehouseOpen] = useState(false);
  const [scanBarcode, setScanBarcode] = useState('');
  const [editPostingDateTime, setEditPostingDateTime] = useState(false);
  const [postingDate, setPostingDate] = useState(receipt.postingDate || receipt.date || '03-11-2026');
  const [postingTime, setPostingTime] = useState(receipt.postingTime || '12:17:00');

  // Taxes and Charges
  const [taxes, setTaxes] = useState([
    {
      id: 'tax-1',
      type: 'On Net Total',
      accountHead: 'VAT 18% - AD',
      rate: 18,
      amount: receipt.grandTotal * 0.18,
    },
  ]);

  // Other Info accordions
  const [isPrintingSettingsOpen, setIsPrintingSettingsOpen] = useState(false);
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);

  // Comments
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([]);

  // Activities
  const [activities, setActivities] = useState([
    { text: 'You changed the value of Status from Draft to ' + receipt.status, time: '10 minutes ago' },
    { text: 'You last edited this', time: '15 minutes ago' },
    { text: 'You created this', time: '30 minutes ago' },
  ]);

  const handleAddComment = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentText.trim()) {
      setComments((prev) => [...prev, commentText.trim()]);
      setActivities((prev) => [
        { text: `You commented: "${commentText.trim()}"`, time: 'Just now' },
        ...prev,
      ]);
      setCommentText('');
    }
  };

  const handleAddTaxRow = () => {
    setTaxes((prev) => [
      ...prev,
      {
        id: `tax-${Date.now()}`,
        type: 'Actual',
        accountHead: 'Shipping & Freight - AD',
        rate: 0,
        amount: 35.0,
      },
    ]);
  };

  const totalTaxes = taxes.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="flex-1 space-y-4 text-xs font-sans min-w-0">
      {/* Top Banner: Submit this document to confirm */}
      {receipt.status === 'Draft' && (
        <div className="text-sky-600 dark:text-sky-400 text-xs font-medium pb-1 select-none">
          Submit this document to confirm
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-6 border-b border-slate-200/90 dark:border-[#27272A] pb-0 text-xs select-none">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-2.5 font-medium transition-colors relative ${
            activeTab === 'details'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Details
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('taxes_charges')}
          className={`pb-2.5 font-medium transition-colors relative ${
            activeTab === 'taxes_charges'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Taxes and Charges
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('other_info')}
          className={`pb-2.5 font-medium transition-colors relative ${
            activeTab === 'other_info'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Other Info
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('connections')}
          className={`pb-2.5 font-medium transition-colors relative ${
            activeTab === 'connections'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Connections
        </button>
      </div>

      {/* TAB 1: DETAILS */}
      {activeTab === 'details' && (
        <div className="space-y-5 pt-1">
          {/* Grid 2 cols: Left Company, Supplier | Right Posting Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Col */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Company <span className="text-rose-500">*</span>
                </label>
                <div className="px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs font-normal">
                  {receipt.company || 'Avalon (Demo)'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Supplier Name <span className="text-rose-500">*</span>
                </label>
                <div className="px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs font-normal">
                  {receipt.supplierName}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Currency
                </label>
                <div className="px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs font-normal">
                  {receipt.currency || 'USD'}
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editDateTime"
                  checked={editPostingDateTime}
                  onChange={(e) => setEditPostingDateTime(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <label htmlFor="editDateTime" className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer">
                  Edit Posting Date and Time
                </label>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Posting Date
                </label>
                <input
                  type="text"
                  disabled={!editPostingDateTime}
                  value={postingDate}
                  onChange={(e) => setPostingDate(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-normal border transition-colors ${
                    editPostingDateTime
                      ? 'bg-white dark:bg-[#18181B] border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white'
                      : 'bg-slate-100/70 dark:bg-[#202024] border-transparent text-slate-800 dark:text-zinc-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Posting Time
                </label>
                <input
                  type="text"
                  disabled={!editPostingDateTime}
                  value={postingTime}
                  onChange={(e) => setPostingTime(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-normal border transition-colors ${
                    editPostingDateTime
                      ? 'bg-white dark:bg-[#18181B] border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white'
                      : 'bg-slate-100/70 dark:bg-[#202024] border-transparent text-slate-800 dark:text-zinc-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Accordion: Default Warehouse */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsDefaultWarehouseOpen(!isDefaultWarehouseOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Default Warehouse</span>
              {isDefaultWarehouseOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isDefaultWarehouseOpen && (
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-[#2A2A2E] text-slate-600 dark:text-zinc-400">
                <span>Accepted Warehouse: </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Stores - AD
                </span>
              </div>
            )}
          </div>

          {/* Scan Barcode */}
          <div className="pt-2 space-y-1">
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400">
              Scan Barcode
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Scan item barcode..."
                value={scanBarcode}
                onChange={(e) => setScanBarcode(e.target.value)}
                className="w-full px-3 py-1.5 pr-9 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <ScanBarcode className="w-4 h-4 text-slate-400 absolute right-3 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Items Table Section */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white text-xs">
                Items
              </span>
              <span className="text-[11px] text-slate-400">
                {receipt.items.length} items
              </span>
            </div>

            <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                    <th className="py-2.5 px-3 w-10 text-center font-normal">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                    </th>
                    <th className="py-2.5 px-3 w-12 font-normal">No.</th>
                    <th className="py-2.5 px-3 font-normal">Item Code <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-3 font-normal">Item Name</th>
                    <th className="py-2.5 px-3 text-right font-normal">Received Qty <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-3 text-right font-normal">Accepted Qty</th>
                    <th className="py-2.5 px-3 text-right font-normal">Rate</th>
                    <th className="py-2.5 px-3 text-right font-normal">Amount</th>
                    <th className="py-2.5 px-3 w-10 text-center font-normal">
                      <Gear className="w-3.5 h-3.5 mx-auto text-slate-400" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#242428]">
                  {receipt.items.map((it, idx) => (
                    <tr
                      key={it.id || idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#202024]/60 transition-colors"
                    >
                      <td className="py-2 px-3 text-center">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </td>
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                          {it.itemCode}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-300">
                        {it.itemName}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300 font-medium">
                        {it.receivedQty.toFixed(3)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300 font-medium">
                        {it.acceptedQty.toFixed(3)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                        {formatCurrency(it.rate)}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-900 dark:text-white font-semibold">
                        {formatCurrency(it.amount)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white text-slate-400">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Net Total:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(receipt.grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-[#27272A] pt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(receipt.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAXES & CHARGES */}
      {activeTab === 'taxes_charges' && (
        <div className="space-y-4 pt-2">
          <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                  <th className="py-2.5 px-3 w-10 text-center font-normal">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                  </th>
                  <th className="py-2.5 px-3 w-12 font-normal">No.</th>
                  <th className="py-2.5 px-3 font-normal">Type</th>
                  <th className="py-2.5 px-3 font-normal">Account Head</th>
                  <th className="py-2.5 px-3 text-right font-normal">Rate (%)</th>
                  <th className="py-2.5 px-3 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#242428]">
                {taxes.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-[#202024]/60">
                    <td className="py-2 px-3 text-center">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                    </td>
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">{t.type}</td>
                    <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 font-medium">{t.accountHead}</td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">{t.rate} %</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddTaxRow}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 font-normal hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
          >
            Add row
          </button>

          <div className="pt-2">
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Total Taxes and Charges
            </label>
            <div className="px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs font-semibold w-48">
              {formatCurrency(totalTaxes)}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OTHER INFO */}
      {activeTab === 'other_info' && (
        <div className="space-y-4 pt-2">
          {/* Printing Settings Accordion */}
          <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl p-3 bg-white dark:bg-[#18181B]">
            <button
              type="button"
              onClick={() => setIsPrintingSettingsOpen(!isPrintingSettingsOpen)}
              className="w-full flex items-center justify-between text-xs font-medium text-slate-900 dark:text-white"
            >
              <span>Printing Settings</span>
              {isPrintingSettingsOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {isPrintingSettingsOpen && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#27272A] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Print Heading
                  </label>
                  <input
                    type="text"
                    defaultValue="Purchase Receipt"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Letter Head
                  </label>
                  <input
                    type="text"
                    defaultValue="Avalon Group Corporate"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* More Information Accordion */}
          <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl p-3 bg-white dark:bg-[#18181B]">
            <button
              type="button"
              onClick={() => setIsMoreInfoOpen(!isMoreInfoOpen)}
              className="w-full flex items-center justify-between text-xs font-medium text-slate-900 dark:text-white"
            >
              <span>More Information</span>
              {isMoreInfoOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {isMoreInfoOpen && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#27272A] space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add optional notes or remarks here..."
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CONNECTIONS */}
      {activeTab === 'connections' && (
        <div className="pt-2">
          <div className="p-6 rounded-xl border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#18181B] text-center space-y-2">
            <span className="font-semibold text-slate-900 dark:text-white">Related Documents</span>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-zinc-300 font-mono text-[11px]">
                Purchase Order
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-zinc-300 font-mono text-[11px]">
                Purchase Invoice
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-zinc-300 font-mono text-[11px]">
                Stock Ledger
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section: Comments & Activity */}
      <div className="pt-6 space-y-4 border-t border-slate-200/90 dark:border-[#27272A]">
        {/* Comments Input */}
        <div>
          <span className="font-semibold text-slate-900 dark:text-white text-xs block mb-2">
            Comments
          </span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] flex items-center justify-center shrink-0">
              A
            </div>
            <input
              type="text"
              placeholder="Type a reply / comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleAddComment}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {comments.length > 0 && (
            <div className="mt-3 pl-8 space-y-2">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-100 dark:border-[#2A2A2E] text-slate-800 dark:text-zinc-200 text-xs"
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white text-xs">
              Activity
            </span>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 text-[11px] hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
            >
              <Mail className="w-3 h-3 text-slate-400" />
              <span>+ New Email</span>
            </button>
          </div>

          <ul className="space-y-2 text-[11px] text-slate-500 dark:text-zinc-400 pl-3">
            {activities.map((act, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-slate-300 dark:text-zinc-600 font-bold">•</span>
                <span className="flex-1 text-slate-600 dark:text-zinc-300">
                  {act.text}{' '}
                  <span className="text-slate-400 dark:text-zinc-500 font-normal ml-1">
                    {act.time}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReceiptDetailContent;

