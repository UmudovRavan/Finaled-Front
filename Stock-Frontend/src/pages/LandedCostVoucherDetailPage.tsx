// Landed Cost Voucher Detail Page (Frappe ERP 1:1)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Settings,
  Edit2,
  Trash2,
  ChevronsUpDown,
} from 'lucide-react';
import { useLandedCostVoucher } from '../context';
import type {
  LandedCostVoucherReceipt,
  LandedCostVoucherItem,
  LandedCostVendorInvoice,
  LandedCostExpense,
  DistributeChargesBasedOn,
  ReceiptDocumentType,
} from '../types';
import { LandedCostVoucherDetailSidebar } from '../components/landed-cost-voucher/LandedCostVoucherDetailSidebar';

export const LandedCostVoucherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vouchers: allVouchers, toggleLike } = useLandedCostVoucher();

  const entry = allVouchers.find((v) => v.id === id) || allVouchers[0];

  // Form states
  const [series, setSeries] = useState(entry?.series || 'MAT-LCV-.YYYY.-');
  const [company, setCompany] = useState(entry?.company || 'Avalon (Demo)');
  const [postingDate, setPostingDate] = useState(entry?.postingDate || '10-11-2026');

  // Vouchers Table (Screenshot 1: Purchase Invoice / ACC-PINV-2026-00001 / Zuckerman Securit... / $ 39,000.00)
  const [vouchers, setVouchers] = useState<LandedCostVoucherReceipt[]>(
    entry?.vouchers && entry.vouchers.length > 0
      ? entry.vouchers
      : [
          {
            id: 'lcv-v-1',
            receiptDocumentType: 'Purchase Invoice',
            receiptDocument: 'ACC-PINV-2026-00001',
            supplier: 'Zuckerman Securit...',
            grandTotal: 39000.0,
          },
        ]
  );
  const [selectedVoucherIds, setSelectedVoucherIds] = useState<string[]>([]);
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);

  // Items Table (Screenshot 1: SKU010 / qty 78 / $ 39,000.00 / $ 112.00)
  const [items, setItems] = useState<LandedCostVoucherItem[]>(
    entry?.items && entry.items.length > 0
      ? entry.items
      : [
          {
            id: 'lcv-it-1',
            itemCode: 'SKU010',
            description: '',
            qty: 78,
            amount: 39000.0,
            applicableCharges: 112.0,
          },
        ]
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Vendor Invoices (Screenshot 2: Row 1 with empty invoice and $ 0.00)
  const [vendorInvoices, setVendorInvoices] = useState<LandedCostVendorInvoice[]>(
    entry?.vendorInvoices && entry.vendorInvoices.length > 0
      ? entry.vendorInvoices
      : [
          {
            id: 'lcv-vi-1',
            vendorInvoice: '',
            amount: 0,
          },
        ]
  );

  // Landed Cost (Screenshot 2: 113 - Torpaq, tikili və avadanlıqlarla bağlı ... / fafa / $ 112.00)
  const [landedCosts, setLandedCosts] = useState<LandedCostExpense[]>(
    entry?.landedCosts && entry.landedCosts.length > 0
      ? entry.landedCosts
      : [
          {
            id: 'lcv-exp-1',
            expenseAccount: '113 - Torpaq, tikili və avadanlıqlarla bağlı ...',
            description: 'fafa',
            amount: 112.0,
          },
        ]
  );
  const [selectedLandedCostIds, setSelectedLandedCostIds] = useState<string[]>([]);
  const [editingLandedCostId, setEditingLandedCostId] = useState<string | null>(null);

  // Distribute Charges Based On (Screenshot 2)
  const [distributeChargesBasedOn, setDistributeChargesBasedOn] =
    useState<DistributeChargesBasedOn>(entry?.distributeChargesBasedOn || 'Qty');

  // Totals (Screenshot 2)
  const totalVendorInvoicesCost = vendorInvoices.reduce(
    (sum, vi) => sum + (Number(vi.amount) || 0),
    0
  );
  const totalLandedCost = landedCosts.reduce(
    (sum, lc) => sum + (Number(lc.amount) || 0),
    0
  );

  // Comments state
  const [comments, setComments] = useState<
    { id: string; author: string; text: string; time: string }[]
  >([]);
  const [commentText, setCommentText] = useState('');

  // Sync on entry change
  useEffect(() => {
    if (entry) {
      setSeries(entry.series || 'MAT-LCV-.YYYY.-');
      setCompany(entry.company || 'Avalon (Demo)');
      setPostingDate(entry.postingDate || '10-11-2026');
      if (entry.vouchers && entry.vouchers.length > 0) setVouchers(entry.vouchers);
      if (entry.items && entry.items.length > 0) setItems(entry.items);
      if (entry.vendorInvoices) setVendorInvoices(entry.vendorInvoices);
      if (entry.landedCosts && entry.landedCosts.length > 0) setLandedCosts(entry.landedCosts);
      setDistributeChargesBasedOn(entry.distributeChargesBasedOn || 'Qty');
    }
  }, [entry?.id]);

  if (!entry) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Landed Cost Voucher not found.{' '}
        <button
          onClick={() => navigate('/landed-cost-voucher')}
          className="text-indigo-600 underline"
        >
          Back to list
        </button>
      </div>
    );
  }

  // Handlers
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
          {/* LEFT MAIN CONTENT */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Top Blue Info Banner when Draft */}
            {entry.status === 'Draft' && (
              <div className="px-4 py-2.5 rounded-lg bg-[#EBF5FF] dark:bg-sky-950/40 text-[#1E6091] dark:text-sky-300 text-xs font-normal">
                Submit this document to confirm
              </div>
            )}

            {/* Top 2 Columns Grid (Screenshot 1: Company on left, Posting Date on right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
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
            </div>

            <div className="border-t border-slate-100 dark:border-[#27272A] pt-4" />

            {/* VOUCHERS */}
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
                          onChange={() => {
                            if (selectedVoucherIds.length === vouchers.length) {
                              setSelectedVoucherIds([]);
                            } else {
                              setSelectedVoucherIds(vouchers.map((v) => v.id));
                            }
                          }}
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
                    {vouchers.map((v, idx) => (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                      >
                        <td className="py-2 px-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedVoucherIds.includes(v.id)}
                            onChange={() =>
                              setSelectedVoucherIds((prev) =>
                                prev.includes(v.id)
                                  ? prev.filter((i) => i !== v.id)
                                  : [...prev, v.id]
                              )
                            }
                            className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2.5">
                          {editingVoucherId === v.id ? (
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
                          {editingVoucherId === v.id ? (
                            <input
                              type="text"
                              value={v.receiptDocument}
                              onChange={(e) =>
                                handleVoucherChange(v.id, 'receiptDocument', e.target.value)
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
                          {editingVoucherId === v.id ? (
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
                              setEditingVoucherId(
                                editingVoucherId === v.id ? null : v.id
                              )
                            }
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
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

            {/* ITEMS */}
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
                    {items.map((it, idx) => (
                      <tr
                        key={it.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]"
                      >
                        <td className="py-2 px-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={selectedItemIds.includes(it.id)}
                            onChange={() =>
                              setSelectedItemIds((prev) =>
                                prev.includes(it.id)
                                  ? prev.filter((i) => i !== it.id)
                                  : [...prev, it.id]
                              )
                            }
                            className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-2.5">
                          {editingItemId === it.id ? (
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
                          {editingItemId === it.id ? (
                            <input
                              type="text"
                              value={it.description}
                              onChange={(e) =>
                                handleItemChange(it.id, 'description', e.target.value)
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
                          {Number(it.qty || 0).toFixed(3)}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono">
                          $ {Number(it.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono">
                          $ {Number(it.applicableCharges || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingItemId(editingItemId === it.id ? null : it.id)
                            }
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
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

            {/* APPLICABLE CHARGES */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Applicable Charges
              </h4>

              {/* Vendor Invoices */}
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
                          <tr key={vi.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02]">
                            <td className="py-2 px-2.5 text-center">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0"
                              />
                            </td>
                            <td className="py-2 px-2.5 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-2.5">{vi.vendorInvoice}</td>
                            <td className="py-2 px-2.5 text-right font-mono">
                              $ {Number(vi.amount || 0).toFixed(2)}
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

              {/* Landed Cost */}
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
                      {landedCosts.map((lc, idx) => (
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
                            {editingLandedCostId === lc.id ? (
                              <input
                                type="text"
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
                                {lc.expenseAccount || ''}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2.5">
                            {editingLandedCostId === lc.id ? (
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
                                {lc.description || ''}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono">
                            $ {Number(lc.amount || 0).toFixed(2)}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingLandedCostId(
                                  editingLandedCostId === lc.id ? null : lc.id
                                )
                              }
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
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

              {/* Totals & Distribution Section (Screenshot 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-3">
                {/* Left Column: Totals */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Total Vendor Invoices Cost (Company Currency) (USD)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`$ ${totalVendorInvoicesCost.toFixed(2)}`}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent outline-none text-xs cursor-not-allowed opacity-90 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Total Landed Cost (Company Currency) (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`$ ${totalLandedCost.toFixed(2)}`}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent outline-none text-xs cursor-not-allowed opacity-90 font-mono"
                    />
                  </div>
                </div>

                {/* Right Column: Distribute Charges Based On */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
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
            </div>

            {/* NOTES */}
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

            {/* Comments */}
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

            {/* Activity */}
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
                  <span>You created this · 21 minutes ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>You last edited this · 21 minutes ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <LandedCostVoucherDetailSidebar
            entry={entry}
            onToggleLike={() => toggleLike(entry.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default LandedCostVoucherDetailPage;

