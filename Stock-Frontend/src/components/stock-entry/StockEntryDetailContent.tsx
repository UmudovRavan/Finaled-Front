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
import type { StockEntryRecord } from '../../types';

interface StockEntryDetailContentProps {
  entry: StockEntryRecord;
  onUpdateEntry?: (updated: Partial<StockEntryRecord>) => void;
}

export const StockEntryDetailContent: React.FC<StockEntryDetailContentProps> = ({
  entry,
  onUpdateEntry,
}) => {
  const [activeTab, setActiveTab] = useState<
    'details' | 'additional_costs' | 'other_info' | 'connections'
  >('details');

  // Details Tab fields (Image 1)
  const [applyPutawayRule, setApplyPutawayRule] = useState(false);
  const [inspectionRequired, setInspectionRequired] = useState(false);
  const [isDefaultWarehouseOpen, setIsDefaultWarehouseOpen] = useState(false);
  const [scanBarcode, setScanBarcode] = useState('');
  const [editPostingDateTime, setEditPostingDateTime] = useState(false);
  const [postingDate, setPostingDate] = useState('01-11-2026');
  const [postingTime, setPostingTime] = useState('22:12:38');

  // Additional Costs (Image 2)
  const [additionalCosts, setAdditionalCosts] = useState<
    { id: string; expenseAccount: string; description: string; amount: number }[]
  >([]);

  // Other Info accordions (Image 3)
  const [isPrintingSettingsOpen, setIsPrintingSettingsOpen] = useState(false);
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);

  // Comments (Image 2, 3, 4)
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([]);

  // Activities (Image 2, 3, 4)
  const [activities, setActivities] = useState([
    { text: 'You changed the value of Posting Time from 22:12:37 to 22:12:38', time: '30 minutes ago' },
    { text: 'You last edited this', time: '30 minutes ago' },
    { text: 'You changed the value of Posting Time from 22:10:52 to 22:12:37', time: '30 minutes ago' },
    { text: 'You created this', time: '31 minutes ago' },
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

  const handleAddCostRow = () => {
    setAdditionalCosts((prev) => [
      ...prev,
      {
        id: `cost-${Date.now()}`,
        expenseAccount: 'Freight and Forwarding Charges - ALT',
        description: 'Standard Delivery Logistics',
        amount: 25.0,
      },
    ]);
  };

  const totalAdditionalCosts = additionalCosts.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="flex-1 space-y-4 text-xs font-sans min-w-0">
      {/* Top Banner (Image 1): Submit this document to confirm */}
      {entry.status === 'Draft' && (
        <div className="text-sky-600 dark:text-sky-400 text-xs font-medium pb-1 select-none">
          Submit this document to confirm
        </div>
      )}

      {/* 4 Tabs from Images 1, 2, 3, 4 */}
      <div className="flex items-center gap-6 border-b border-slate-100 dark:border-[#27272A] select-none overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`py-2 font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'details'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('additional_costs')}
          className={`py-2 font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'additional_costs'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          Additional Costs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('other_info')}
          className={`py-2 font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'other_info'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          Other Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('connections')}
          className={`py-2 font-medium border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'connections'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          Connections
        </button>
      </div>

      {/* Tab 1: Details (Image 1) */}
      {activeTab === 'details' && (
        <div className="space-y-4 pt-1">
          {/* Main 2-column fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={entry.company || 'Avalon (Demo)'}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Stock Entry Type <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={entry.stockEntryType || 'Material Receipt'}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none font-medium"
                />
              </div>

              {/* Checkboxes from Image 1 */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="applyPutawayRule"
                    checked={applyPutawayRule}
                    onChange={(e) => setApplyPutawayRule(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="applyPutawayRule"
                    className="text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
                  >
                    Apply Putaway Rule
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inspectionRequired"
                    checked={inspectionRequired}
                    onChange={(e) => setInspectionRequired(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="inspectionRequired"
                    className="text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
                  >
                    Inspection Required
                  </label>
                </div>
              </div>

              {/* Default Warehouse Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsDefaultWarehouseOpen(!isDefaultWarehouseOpen)}
                  className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span>Default Warehouse</span>
                  {isDefaultWarehouseOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
                {isDefaultWarehouseOpen && (
                  <div className="mt-2 pl-1 space-y-2 text-slate-600 dark:text-zinc-400">
                    <p>Default Source: {entry.defaultSourceWarehouse || 'None'}</p>
                    <p>Default Target: {entry.defaultTargetWarehouse || 'Devam Eden İşler - AD'}</p>
                  </div>
                )}
              </div>

              {/* Scan Barcode */}
              <div className="pt-1">
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Scan Barcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={scanBarcode}
                    onChange={(e) => setScanBarcode(e.target.value)}
                    placeholder="Scan barcode..."
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 pr-10 rounded-lg outline-none"
                  />
                  <ScanBarcode className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Column: Posting Date and Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editPostingDateTime"
                  checked={editPostingDateTime}
                  onChange={(e) => setEditPostingDateTime(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="editPostingDateTime"
                  className="text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
                >
                  Edit Posting Date and Time
                </label>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Posting Date
                </label>
                <input
                  type="text"
                  value={postingDate}
                  disabled={!editPostingDateTime}
                  onChange={(e) => setPostingDate(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-lg outline-none border border-transparent transition-all ${
                    editPostingDateTime
                      ? 'bg-white dark:bg-[#202024] text-slate-900 dark:text-white border-slate-300 dark:border-zinc-700'
                      : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-500 dark:text-zinc-400 opacity-90 cursor-not-allowed'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Posting Time
                </label>
                <input
                  type="text"
                  value={postingTime}
                  disabled={!editPostingDateTime}
                  onChange={(e) => setPostingTime(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-lg outline-none border border-transparent transition-all ${
                    editPostingDateTime
                      ? 'bg-white dark:bg-[#202024] text-slate-900 dark:text-white border-slate-300 dark:border-zinc-700'
                      : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-500 dark:text-zinc-400 opacity-90 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Items Section from Image 1 */}
          <div className="pt-3 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Items</h4>
            <p className="text-[11px] text-slate-500">Items</p>

            <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#202024] text-slate-500 dark:text-zinc-400 select-none">
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-2 w-10 text-slate-600 dark:text-zinc-300 font-normal">
                        No.
                      </th>
                      <th className="py-2.5 px-3 font-normal text-slate-600 dark:text-zinc-300 min-w-[180px]">
                        Target Warehouse
                      </th>
                      <th className="py-2.5 px-3 font-normal text-slate-600 dark:text-zinc-300 min-w-[200px]">
                        Item Code <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-normal text-right text-slate-600 dark:text-zinc-300 min-w-[100px]">
                        Qty <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-normal text-right text-slate-600 dark:text-zinc-300 min-w-[120px]">
                        Basic Rate (as per ...
                      </th>
                      <th className="py-2.5 px-3 w-10 text-center text-slate-400">
                        <Gear className="w-3.5 h-3.5 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
                    {entry.items.map((it, idx) => (
                      <tr key={it.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-slate-500 dark:text-zinc-400">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 text-slate-700 dark:text-zinc-300">
                          {entry.defaultTargetWarehouse || 'Devam Eden İşler - AD'}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{it.itemCode}: {it.itemName}</span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-800 dark:text-zinc-200 font-medium">
                          {it.qty}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-800 dark:text-zinc-200">
                          ${it.basicRate ? it.basicRate.toFixed(2) : '50.00'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Additional Costs (Image 2) */}
      {activeTab === 'additional_costs' && (
        <div className="space-y-4 pt-1">
          <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Additional Costs</h4>

          {/* Additional Costs Table */}
          <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#202024] text-slate-500 select-none">
                  <th className="py-2.5 px-3 w-8">
                    <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-0" />
                  </th>
                  <th className="py-2.5 px-2 w-10 text-slate-600 dark:text-zinc-300 font-normal">No.</th>
                  <th className="py-2.5 px-3 font-normal text-slate-600 dark:text-zinc-300 min-w-[200px]">Expense Account</th>
                  <th className="py-2.5 px-3 font-normal text-slate-600 dark:text-zinc-300 min-w-[200px]">Description *</th>
                  <th className="py-2.5 px-3 font-normal text-right text-slate-600 dark:text-zinc-300 min-w-[120px]">Amount *</th>
                  <th className="py-2.5 px-3 w-10 text-center text-slate-400">
                    <Gear className="w-3.5 h-3.5 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
                {additionalCosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-zinc-500">
                      No rows
                    </td>
                  </tr>
                ) : (
                  additionalCosts.map((c, i) => (
                    <tr key={c.id}>
                      <td className="py-2 px-3">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>
                      <td className="py-2 px-2 text-slate-400">{i + 1}</td>
                      <td className="py-2 px-3 text-slate-800 dark:text-zinc-200">{c.expenseAccount}</td>
                      <td className="py-2 px-3 text-slate-800 dark:text-zinc-200">{c.description}</td>
                      <td className="py-2 px-3 text-right font-medium">${c.amount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-center">
                        <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div>
            <button
              type="button"
              onClick={handleAddCostRow}
              className="bg-[#F3F4F6] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272B] text-slate-700 dark:text-zinc-300 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
            >
              Add row
            </button>
          </div>

          {/* Total Additional Costs */}
          <div className="pt-2">
            <span className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
              Total Additional Costs
            </span>
            <input
              type="text"
              readOnly
              value={`$ ${totalAdditionalCosts.toFixed(2)}`}
              className="w-48 bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none font-medium"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Other Info (Image 3) */}
      {activeTab === 'other_info' && (
        <div className="space-y-4 pt-1">
          {/* Printing Settings Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setIsPrintingSettingsOpen(!isPrintingSettingsOpen)}
              className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span>Printing Settings</span>
              {isPrintingSettingsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {isPrintingSettingsOpen && (
              <div className="mt-2 pl-2 text-slate-500">
                <p>Letter Head: Default Altensor Header</p>
                <p>Print Format: Standard Stock Voucher</p>
              </div>
            )}
          </div>

          {/* More Information Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setIsMoreInfoOpen(!isMoreInfoOpen)}
              className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span>More Information</span>
              {isMoreInfoOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {isMoreInfoOpen && (
              <div className="mt-2 pl-2 text-slate-500">
                <p>Status: {entry.status}</p>
                <p>Per Transferred: {entry.perTransferred}%</p>
                <p>Remarks: {entry.remarks || 'No remarks provided'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Connections (Image 4) */}
      {activeTab === 'connections' && (
        <div className="space-y-3 pt-1">
          <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Stock Reservation</h4>
          <div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#202024] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
            >
              Stock Reservation Entry
            </button>
          </div>
        </div>
      )}

      {/* Shared Bottom Section: Comments & Activity (Images 2, 3, 4) */}
      <div className="pt-6 border-t border-slate-100 dark:border-[#27272A] space-y-4">
        {/* Comments Section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Comments</h4>
          <div className="flex items-center gap-2.5">
            {/* Green avatar 'A' */}
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-[11px] shrink-0">
              A
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleAddComment}
              placeholder="Type a reply / comment (press Enter)..."
              className="flex-1 bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg outline-none text-xs transition-colors"
            />
          </div>

          {/* List of comments */}
          {comments.map((cm, idx) => (
            <div key={idx} className="pl-8 text-[11px] text-slate-700 dark:text-zinc-300">
              <span className="font-medium text-slate-900 dark:text-white">Administrator: </span>
              <span>{cm}</span>
            </div>
          ))}
        </div>

        {/* Activity Timeline */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Activity</h4>
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>New Email</span>
            </button>
          </div>

          <div className="space-y-2">
            {activities.map((act, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="flex-1 text-slate-600 dark:text-zinc-300">{act.text}</span>
                <span className="text-slate-400 shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

