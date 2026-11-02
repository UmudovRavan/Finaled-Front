import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronsUpDown,
  ChevronRight,
  ChevronDown,
  ScanBarcode,
  Settings as Gear,
  Pencil,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { usePurchaseReceipt } from '../../context';
import type { PurchaseReceiptItem } from '../../types';
import { formatCurrency } from '../../utils';

interface NewPurchaseReceiptFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const NewPurchaseReceiptForm: React.FC<NewPurchaseReceiptFormProps> = ({
  onSuccess,
  isModal = false,
}) => {
  const navigate = useNavigate();
  const { createReceipt } = usePurchaseReceipt();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'details' | 'taxes_charges' | 'other_info'>('details');

  // Form Fields
  const [company, setCompany] = useState('Avalon (Demo)');
  const [series, setSeries] = useState('MAT-PR-RE-.YYYY.-');
  const [supplierName, setSupplierName] = useState('Summit Traders Ltd.');
  const [currency, setCurrency] = useState('USD');

  // Posting Date & Time
  const [editPostingDateTime, setEditPostingDateTime] = useState(false);
  const [postingDate, setPostingDate] = useState('03-11-2026');
  const [postingTime, setPostingTime] = useState('12:17:00');

  // Accordions
  const [isDefaultWarehouseOpen, setIsDefaultWarehouseOpen] = useState(false);
  const [acceptedWarehouse, setAcceptedWarehouse] = useState('Stores - AD');
  const [rejectedWarehouse, setRejectedWarehouse] = useState('Rejected - AD');
  const [scanBarcode, setScanBarcode] = useState('');

  // Items
  const [items, setItems] = useState<PurchaseReceiptItem[]>([
    {
      id: 'it-1',
      itemCode: 'SKU001',
      itemName: 'Dell XPS 15 Laptop',
      receivedQty: 2,
      acceptedQty: 2,
      rejectedQty: 0,
      uom: 'Nos',
      rate: 198.0,
      amount: 396.0,
      warehouse: 'Stores - AD',
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const calculateGrandTotal = () => {
    return items.reduce((sum, it) => sum + (it.amount || 0), 0);
  };

  const handleItemChange = (index: number, field: keyof PurchaseReceiptItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      if (field === 'acceptedQty' || field === 'rate') {
        const qty = field === 'acceptedQty' ? Number(value) : target.acceptedQty;
        const rate = field === 'rate' ? Number(value) : target.rate;
        target.amount = qty * rate;
      }
      updated[index] = target;
      return updated;
    });
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        itemCode: 'SKU003',
        itemName: 'USB-C Docking Station',
        receivedQty: 1,
        acceptedQty: 1,
        rejectedQty: 0,
        uom: 'Nos',
        rate: 85.0,
        amount: 85.0,
        warehouse: 'Stores - AD',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!supplierName.trim()) {
      alert('Please select or specify a Supplier');
      return;
    }

    setIsSaving(true);
    try {
      const grandTotal = calculateGrandTotal();
      const newRec = await createReceipt({
        supplierName,
        company,
        series,
        currency,
        date: postingDate,
        postingDate,
        postingTime,
        status: 'Draft',
        grandTotal,
        netTotal: grandTotal,
        items,
        acceptedWarehouse,
        rejectedWarehouse,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/purchase-receipt/${newRec.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-5 sm:p-6 transition-colors duration-200 text-xs font-sans">
      {/* Top Header / Actions Bar if not modal */}
      {!isModal && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80 dark:border-[#27272A]">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">
              New Purchase Receipt
            </h1>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full">
              Not Saved
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/purchase-receipt')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 font-normal transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-zinc-100 font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200/90 dark:border-[#27272A] pb-0 text-xs mb-5 select-none">
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
      </div>

      {/* DETAILS TAB */}
      {activeTab === 'details' && (
        <div className="space-y-5">
          {/* 2-col Grid: Company, Series, Supplier vs Posting Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Col */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Series <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="MAT-PR-RE-.YYYY.-">MAT-PR-RE-.YYYY.-</option>
                    <option value="PR-REC-.YYYY.-">PR-REC-.YYYY.-</option>
                  </select>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Supplier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="e.g. Summit Traders Ltd."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editPostingDateTimePR"
                  checked={editPostingDateTime}
                  onChange={(e) => setEditPostingDateTime(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <label
                  htmlFor="editPostingDateTimePR"
                  className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer select-none"
                >
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

          {/* Default Warehouse Accordion */}
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
              <div className="mt-2.5 p-3 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-[#2A2A2E] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Accepted Warehouse
                  </label>
                  <input
                    type="text"
                    value={acceptedWarehouse}
                    onChange={(e) => setAcceptedWarehouse(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Rejected Warehouse
                  </label>
                  <input
                    type="text"
                    value={rejectedWarehouse}
                    onChange={(e) => setRejectedWarehouse(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
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

          {/* Items Table */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white text-xs">
                Items
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#202024] hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-normal transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                    <th className="py-2.5 px-3 w-10 text-center font-normal">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                    </th>
                    <th className="py-2.5 px-3 w-10 font-normal">No.</th>
                    <th className="py-2.5 px-3 font-normal min-w-[120px]">Item Code <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-3 font-normal min-w-[160px]">Item Name</th>
                    <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Accepted Qty</th>
                    <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Rate ($)</th>
                    <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Amount ($)</th>
                    <th className="py-2.5 px-3 w-10 text-center font-normal">
                      <Gear className="w-3.5 h-3.5 mx-auto text-slate-400" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#242428]">
                  {items.map((it, idx) => (
                    <tr
                      key={it.id || idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#202024]/60 transition-colors"
                    >
                      <td className="py-2 px-3 text-center">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </td>
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={it.itemCode}
                          onChange={(e) => handleItemChange(idx, 'itemCode', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={it.itemName}
                          onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={it.acceptedQty}
                          onChange={(e) => handleItemChange(idx, 'acceptedQty', Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={it.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                          className="w-24 px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(it.amount)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end pt-3">
              <div className="w-64 space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Net Total:</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatCurrency(calculateGrandTotal())}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-[#27272A] pt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(calculateGrandTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAXES AND CHARGES TAB */}
      {activeTab === 'taxes_charges' && (
        <div className="space-y-4 pt-2">
          <p className="text-slate-500 dark:text-zinc-400">
            Taxes and freight charges will be calculated upon document submission.
          </p>
        </div>
      )}

      {/* OTHER INFO TAB */}
      {activeTab === 'other_info' && (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Remarks
            </label>
            <textarea
              rows={3}
              placeholder="Add optional notes or remarks here..."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>
      )}

      {/* Bottom Save bar if modal */}
      {isModal && (
        <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-slate-200/80 dark:border-[#27272A]">
          <button
            type="button"
            onClick={onSuccess}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 font-normal transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-zinc-100 font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewPurchaseReceiptForm;

