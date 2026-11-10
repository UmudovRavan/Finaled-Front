import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Edit2,
  Trash2,
  ChevronsUpDown,
} from 'lucide-react';
import { useLandedCostVoucher } from '../../context';
import type {
  LandedCostVoucherReceipt,
  LandedCostVoucherItem,
  LandedCostVendorInvoice,
  LandedCostExpense,
  DistributeChargesBasedOn,
  ReceiptDocumentType,
} from '../../types';

export const NewLandedCostVoucherForm: React.FC = () => {
  const navigate = useNavigate();
  const { createVoucher } = useLandedCostVoucher();

  // Top Section States (Screenshot 2)
  const [series, setSeries] = useState('MAT-LCV-.YYYY.-');
  const [company, setCompany] = useState('Avalon (Demo)');
  const [postingDate, setPostingDate] = useState('10-11-2026');

  // Vouchers Table States (Screenshot 2)
  const [vouchers, setVouchers] = useState<LandedCostVoucherReceipt[]>([
    {
      id: 'lcv-v-1',
      receiptDocumentType: 'Purchase Receipt',
      receiptDocument: '',
      supplier: '',
      grandTotal: 0,
    },
  ]);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);

  // Items Table States (Screenshot 2)
  const [items, setItems] = useState<LandedCostVoucherItem[]>([
    {
      id: 'lcv-it-1',
      itemCode: '',
      description: '',
      qty: 0,
      amount: 0,
      applicableCharges: 0,
    },
  ]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Applicable Charges -> Vendor Invoices (Screenshot 3 - starts empty "No rows")
  const [vendorInvoices, setVendorInvoices] = useState<LandedCostVendorInvoice[]>([]);
  const [selectedVendorInvoiceIds, setSelectedVendorInvoiceIds] = useState<string[]>([]);
  const [editingVendorInvoiceId, setEditingVendorInvoiceId] = useState<string | null>(null);

  // Applicable Charges -> Landed Cost (Screenshot 3)
  const [landedCosts, setLandedCosts] = useState<LandedCostExpense[]>([
    {
      id: 'lcv-exp-1',
      expenseAccount: '',
      description: '',
      amount: 0,
    },
  ]);
  const [selectedLandedCostIds, setSelectedLandedCostIds] = useState<string[]>([]);
  const [editingLandedCostId, setEditingLandedCostId] = useState<string | null>(null);

  // Distribute Charges Based On (Screenshot 3)
  const [distributeChargesBasedOn, setDistributeChargesBasedOn] =
    useState<DistributeChargesBasedOn>('Qty');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vouchers Handlers
  const handleAddVoucherRow = () => {
    setVouchers((prev) => [
      ...prev,
      {
        id: `lcv-v-${Date.now()}`,
        receiptDocumentType: 'Purchase Receipt',
        receiptDocument: '',
        supplier: '',
        grandTotal: 0,
      },
    ]);
  };

  const handleVoucherChange = (
    id: string,
    field: keyof LandedCostVoucherReceipt,
    value: any
  ) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const toggleSelectVoucher = (id: string) => {
    setSelectedVoucherIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVouchers = () => {
    if (selectedVoucherIds.length === vouchers.length) {
      setSelectedVoucherIds([]);
    } else {
      setSelectedVoucherIds(vouchers.map((v) => v.id));
    }
  };

  // Get Items Handler
  const handleGetItems = () => {
    setItems([
      {
        id: `lcv-it-${Date.now()}-1`,
        itemCode: 'SKU001: T-shirt',
        description: 'Cotton T-shirt - White',
        qty: 10,
        amount: 50.0,
        applicableCharges: 0,
      },
      {
        id: `lcv-it-${Date.now()}-2`,
        itemCode: 'SKU002: Laptop',
        description: 'ThinkPad Laptop',
        qty: 2,
        amount: 1800.0,
        applicableCharges: 0,
      },
    ]);
  };

  // Items Handlers
  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `lcv-it-${Date.now()}`,
        itemCode: '',
        description: '',
        qty: 0,
        amount: 0,
        applicableCharges: 0,
      },
    ]);
  };

  const handleItemChange = (
    id: string,
    field: keyof LandedCostVoucherItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllItems = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
  };

  // Vendor Invoices Handlers
  const handleAddVendorInvoiceRow = () => {
    setVendorInvoices((prev) => [
      ...prev,
      {
        id: `lcv-vi-${Date.now()}`,
        vendorInvoice: '',
        amount: 0,
      },
    ]);
  };

  const handleVendorInvoiceChange = (
    id: string,
    field: keyof LandedCostVendorInvoice,
    value: any
  ) => {
    setVendorInvoices((prev) =>
      prev.map((vi) => (vi.id === id ? { ...vi, [field]: value } : vi))
    );
  };

  // Landed Cost Handlers
  const handleAddLandedCostRow = () => {
    setLandedCosts((prev) => [
      ...prev,
      {
        id: `lcv-exp-${Date.now()}`,
        expenseAccount: '',
        description: '',
        amount: 0,
      },
    ]);
  };

  const handleLandedCostChange = (
    id: string,
    field: keyof LandedCostExpense,
    value: any
  ) => {
    setLandedCosts((prev) =>
      prev.map((lc) => (lc.id === id ? { ...lc, [field]: value } : lc))
    );
  };

  // Submit Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await createVoucher({
        series,
        company,
        postingDate,
        vouchers,
        items,
        vendorInvoices,
        landedCosts,
        distributeChargesBasedOn,
      });
      navigate(`/landed-cost-voucher/${created.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="new-landed-cost-voucher-form"
      onSubmit={handleSave}
      className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm space-y-6 text-xs font-sans text-slate-800 dark:text-zinc-200"
    >
      {/* Top 2 Columns Grid from Screenshot 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Series * */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Series <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 pr-8 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs cursor-pointer"
              >
                <option value="MAT-LCV-.YYYY.-">MAT-LCV-.YYYY.-</option>
              </select>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

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
              required
            />
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
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-[#27272A] pt-4" />

      {/* SECTION: VOUCHERS (Screenshot 2) */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
          Vouchers
        </h4>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#27272A]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-500 font-normal select-none">
                <th className="py-2 px-2.5 w-7 text-center">
                  <input
                    type="checkbox"
                    checked={
                      vouchers.length > 0 &&
                      selectedVoucherIds.length === vouchers.length
                    }
                    onChange={toggleSelectAllVouchers}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2 px-2.5 w-10 text-slate-500 font-normal">
                  No.
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[200px]">
                  Receipt Document Type <span className="text-red-500">*</span>
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[220px]">
                  Receipt Document <span className="text-red-500">*</span>
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[180px]">
                  Supplier
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[120px] text-right">
                  Grand Total
                </th>
                <th className="py-2 px-2.5 w-8 text-center text-slate-400">
                  <Settings className="w-3.5 h-3.5 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {vouchers.map((v, idx) => {
                const isSelected = selectedVoucherIds.includes(v.id);
                const isEditing = editingVoucherId === v.id;

                return (
                  <tr
                    key={v.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors ${
                      isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    <td className="py-2 px-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectVoucher(v.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2.5 text-slate-400 select-none">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2.5">
                      {isEditing ? (
                        <select
                          value={v.receiptDocumentType}
                          onChange={(e) =>
                            handleVoucherChange(
                              v.id,
                              'receiptDocumentType',
                              e.target.value as ReceiptDocumentType
                            )
                          }
                          className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        >
                          <option value="Purchase Receipt">Purchase Receipt</option>
                          <option value="Purchase Invoice">Purchase Invoice</option>
                        </select>
                      ) : (
                        <div
                          onClick={() => setEditingVoucherId(v.id)}
                          className="cursor-pointer text-slate-700 dark:text-zinc-300"
                        >
                          {v.receiptDocumentType || 'Purchase Receipt'}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          placeholder="e.g. MAT-PRE-2026-00001"
                          value={v.receiptDocument}
                          onChange={(e) =>
                            handleVoucherChange(
                              v.id,
                              'receiptDocument',
                              e.target.value
                            )
                          }
                          className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingVoucherId(v.id)}
                          className="cursor-pointer text-slate-700 dark:text-zinc-300 min-h-[18px]"
                        >
                          {v.receiptDocument || ''}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={v.supplier}
                          onChange={(e) =>
                            handleVoucherChange(v.id, 'supplier', e.target.value)
                          }
                          className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingVoucherId(v.id)}
                          className="cursor-pointer text-slate-600 dark:text-zinc-400 min-h-[18px]"
                        >
                          {v.supplier || ''}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono">
                      $ {Number(v.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingVoucherId(isEditing ? null : v.id)
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

        <button
          type="button"
          onClick={handleAddVoucherRow}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
        >
          Add row
        </button>
      </div>

      <div className="border-t border-slate-100 dark:border-[#27272A] pt-2" />

      {/* SECTION: ITEMS (Screenshot 2) */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
          Items
        </h4>

        <div>
          <button
            type="button"
            onClick={handleGetItems}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-normal transition-colors"
          >
            Get Items
          </button>
        </div>

        <h5 className="font-normal text-slate-700 dark:text-zinc-300 text-xs pt-1">
          Receipt Items
        </h5>

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
                    onChange={toggleSelectAllItems}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2 px-2.5 w-10 text-slate-500 font-normal">
                  No.
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[180px]">
                  Item Code <span className="text-red-500">*</span>
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[200px]">
                  Description
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[90px] text-right">
                  Qty
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[110px] text-right">
                  Amount <span className="text-red-500">*</span>
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[140px] text-right">
                  Applicable Charges
                </th>
                <th className="py-2 px-2.5 w-8 text-center text-slate-400">
                  <Settings className="w-3.5 h-3.5 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {items.map((it, idx) => {
                const isSelected = selectedItemIds.includes(it.id);
                const isEditing = editingItemId === it.id;

                return (
                  <tr
                    key={it.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors ${
                      isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    <td className="py-2 px-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(it.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2.5 text-slate-400 select-none">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={it.itemCode}
                          onChange={(e) =>
                            handleItemChange(it.id, 'itemCode', e.target.value)
                          }
                          className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingItemId(it.id)}
                          className="cursor-pointer font-medium text-slate-800 dark:text-zinc-200 min-h-[18px]"
                        >
                          {it.itemCode}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={it.description}
                          onChange={(e) =>
                            handleItemChange(
                              it.id,
                              'description',
                              e.target.value
                            )
                          }
                          className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingItemId(it.id)}
                          className="cursor-pointer text-slate-600 dark:text-zinc-400 min-h-[18px]"
                        >
                          {it.description}
                        </div>
                      )}
                    </td>
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
                          onClick={() => setEditingItemId(it.id)}
                          className="cursor-pointer"
                        >
                          {Number(it.qty || 0).toFixed(3)}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={it.amount}
                          onChange={(e) =>
                            handleItemChange(
                              it.id,
                              'amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 text-right bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <span
                          onClick={() => setEditingItemId(it.id)}
                          className="cursor-pointer"
                        >
                          $ {Number(it.amount || 0).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono">
                      $ {Number(it.applicableCharges || 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-2.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingItemId(isEditing ? null : it.id)
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

        <button
          type="button"
          onClick={handleAddItemRow}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
        >
          Add row
        </button>
      </div>

      <div className="border-t border-slate-100 dark:border-[#27272A] pt-2" />

      {/* SECTION: APPLICABLE CHARGES (Screenshot 2 & 3) */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
          Applicable Charges
        </h4>

        {/* Subsection: Vendor Invoices (Screenshot 3) */}
        <div className="space-y-2">
          <h5 className="font-normal text-slate-700 dark:text-zinc-300 text-xs">
            Vendor Invoices
          </h5>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#27272A]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-500 font-normal select-none">
                  <th className="py-2 px-2.5 w-7 text-center">
                    <input
                      type="checkbox"
                      disabled={vendorInvoices.length === 0}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2 px-2.5 w-10 text-slate-500 font-normal">
                    No.
                  </th>
                  <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[260px]">
                    Vendor Invoice
                  </th>
                  <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[180px] text-right">
                    Amount (Company Currency)
                  </th>
                  <th className="py-2 px-2.5 w-8 text-center text-slate-400">
                    <Settings className="w-3.5 h-3.5 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {vendorInvoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-slate-400 dark:text-zinc-500 text-xs select-none"
                    >
                      No rows
                    </td>
                  </tr>
                ) : (
                  vendorInvoices.map((vi, idx) => (
                    <tr
                      key={vi.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                    >
                      <td className="py-2 px-2.5 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0"
                        />
                      </td>
                      <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2.5">
                        <input
                          type="text"
                          value={vi.vendorInvoice}
                          onChange={(e) =>
                            handleVendorInvoiceChange(
                              vi.id,
                              'vendorInvoice',
                              e.target.value
                            )
                          }
                          className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono">
                        <input
                          type="number"
                          step="0.01"
                          value={vi.amount}
                          onChange={(e) =>
                            handleVendorInvoiceChange(
                              vi.id,
                              'amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 text-right bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setVendorInvoices((prev) =>
                              prev.filter((i) => i.id !== vi.id)
                            )
                          }
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddVendorInvoiceRow}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
          >
            Add row
          </button>
        </div>

        {/* Subsection: Landed Cost (Screenshot 3) */}
        <div className="space-y-2 pt-2">
          <h5 className="font-normal text-slate-700 dark:text-zinc-300 text-xs">
            Landed Cost
          </h5>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#27272A]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-500 font-normal select-none">
                  <th className="py-2 px-2.5 w-7 text-center">
                    <input
                      type="checkbox"
                      checked={
                        landedCosts.length > 0 &&
                        selectedLandedCostIds.length === landedCosts.length
                      }
                      onChange={() => {
                        if (
                          selectedLandedCostIds.length === landedCosts.length
                        ) {
                          setSelectedLandedCostIds([]);
                        } else {
                          setSelectedLandedCostIds(
                            landedCosts.map((lc) => lc.id)
                          );
                        }
                      }}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2 px-2.5 w-10 text-slate-500 font-normal">
                    No.
                  </th>
                  <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[240px]">
                    Expense Account
                  </th>
                  <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[240px]">
                    Description <span className="text-red-500">*</span>
                  </th>
                  <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[120px] text-right">
                    Amount <span className="text-red-500">*</span>
                  </th>
                  <th className="py-2 px-2.5 w-8 text-center text-slate-400">
                    <Settings className="w-3.5 h-3.5 mx-auto" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {landedCosts.map((lc, idx) => {
                  const isEditing = editingLandedCostId === lc.id;

                  return (
                    <tr
                      key={lc.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                    >
                      <td className="py-2 px-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedLandedCostIds.includes(lc.id)}
                          onChange={() =>
                            setSelectedLandedCostIds((prev) =>
                              prev.includes(lc.id)
                                ? prev.filter((i) => i !== lc.id)
                                : [...prev, lc.id]
                            )
                          }
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="e.g. 5111 - Freight & Forwarding - AD"
                            value={lc.expenseAccount}
                            onChange={(e) =>
                              handleLandedCostChange(
                                lc.id,
                                'expenseAccount',
                                e.target.value
                              )
                            }
                            className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingLandedCostId(lc.id)}
                            className="cursor-pointer text-slate-700 dark:text-zinc-300 min-h-[18px]"
                          >
                            {lc.expenseAccount}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={lc.description}
                            onChange={(e) =>
                              handleLandedCostChange(
                                lc.id,
                                'description',
                                e.target.value
                              )
                            }
                            className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                          />
                        ) : (
                          <div
                            onClick={() => setEditingLandedCostId(lc.id)}
                            className="cursor-pointer text-slate-700 dark:text-zinc-300 min-h-[18px]"
                          >
                            {lc.description}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={lc.amount}
                            onChange={(e) =>
                              handleLandedCostChange(
                                lc.id,
                                'amount',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-24 text-right bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => setEditingLandedCostId(lc.id)}
                            className="cursor-pointer"
                          >
                            $ {Number(lc.amount || 0).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setEditingLandedCostId(isEditing ? null : lc.id)
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

          <button
            type="button"
            onClick={handleAddLandedCostRow}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
          >
            Add row
          </button>
        </div>

        {/* Distribute Charges Based On * (Screenshot 3) */}
        <div className="pt-2 flex flex-col md:items-end">
          <div className="w-full md:w-80 space-y-1">
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400">
              Distribute Charges Based On <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={distributeChargesBasedOn}
                onChange={(e) =>
                  setDistributeChargesBasedOn(
                    e.target.value as DistributeChargesBasedOn
                  )
                }
                className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 pr-8 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs cursor-pointer"
              >
                <option value="Qty">Qty</option>
                <option value="Amount">Amount</option>
                <option value="Distribute Manually">Distribute Manually</option>
              </select>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: NOTES (Screenshot 3 callout box) */}
      <div className="rounded-xl bg-[#F8F9FA] dark:bg-[#202024] p-4 text-xs space-y-2 border border-slate-100 dark:border-[#27272A]">
        <h5 className="font-semibold text-slate-900 dark:text-white">
          Notes:
        </h5>
        <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-zinc-300 text-[11.5px] leading-relaxed">
          <li>
            Charges will be distributed proportionately based on item qty or amount, as per your selection
          </li>
          <li>Remove item if charges is not applicable to that item</li>
          <li>Charges are updated in Purchase Receipt against each item</li>
          <li>Item valuation rate is recalculated considering landed cost voucher amount</li>
          <li>Stock Ledger Entries and GL Entries are reposted for the selected Purchase Receipts</li>
        </ul>
      </div>
    </form>
  );
};

export default NewLandedCostVoucherForm;

