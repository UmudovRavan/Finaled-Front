import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsUpDown } from 'lucide-react';
import { useRepostItemValuation } from '../../context';
import type { RepostBasedOn } from '../../types';

export const NewRepostItemValuationForm: React.FC = () => {
  const navigate = useNavigate();
  const { createValuation } = useRepostItemValuation();

  const [basedOn, setBasedOn] = useState<RepostBasedOn>('Transaction');
  const [voucherType, setVoucherType] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [postingDate, setPostingDate] = useState('10-11-2026');
  const [postingTime, setPostingTime] = useState('14:00:00');

  const [company, setCompany] = useState('Avalon (Demo)');
  const [repostOnlyAccountingLedgers, setRepostOnlyAccountingLedgers] =
    useState(false);
  const [allowNegativeStock, setAllowNegativeStock] = useState(true);
  const [viaLandedCostVoucher, setViaLandedCostVoucher] = useState(false);
  const [allowZeroRate, setAllowZeroRate] = useState(false);
  const [recreateStockLedgers, setRecreateStockLedgers] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const randomStr = Math.random().toString(36).substring(2, 12);
      const newRecord = await createValuation({
        id: randomStr,
        status: 'Queued',
        basedOn,
        voucherType: basedOn === 'Transaction' ? voucherType : '',
        voucherNo: basedOn === 'Transaction' ? voucherNo : '',
        itemCode: basedOn === 'Item and Warehouse' ? itemCode : '',
        warehouse: basedOn === 'Item and Warehouse' ? warehouse : '',
        postingDate,
        postingTime,
        company,
        repostOnlyAccountingLedgers,
        allowNegativeStock,
        viaLandedCostVoucher,
        allowZeroRate,
        recreateStockLedgers,
      });

      navigate(`/repost-item-valuation/${newRecord.id}`);
    } catch (err) {
      console.error('Failed to create valuation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="new-repost-item-valuation-form"
      onSubmit={handleSave}
      className="max-w-5xl mx-auto space-y-6 font-sans text-xs"
    >
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm space-y-6">
        {/* 2 COLUMNS GRID (Screenshot 2: Based On, Voucher Type, Voucher No on left; Status, Company, Checkboxes on right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Based On */}
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                Based On <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={basedOn}
                  onChange={(e) => setBasedOn(e.target.value as RepostBasedOn)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs appearance-none cursor-pointer"
                >
                  <option value="Transaction">Transaction</option>
                  <option value="Item and Warehouse">Item and Warehouse</option>
                </select>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {basedOn === 'Transaction' ? (
              <>
                {/* Voucher Type */}
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

                {/* Voucher No */}
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
                    placeholder="e.g. SKU002"
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
                    placeholder="e.g. Devam Eden İşlər - AD"
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
            {/* Status (Read-only / Queued) */}
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                Status
              </label>
              <input
                type="text"
                disabled
                value="Queued"
                className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-500 dark:text-zinc-400 border border-transparent cursor-not-allowed text-xs"
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

            {/* Checkboxes List (Screenshot 2) */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={repostOnlyAccountingLedgers}
                    onChange={(e) =>
                      setRepostOnlyAccountingLedgers(e.target.checked)
                    }
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-slate-700 dark:text-zinc-200 text-xs">
                    Repost Only Accounting Ledgers
                  </span>
                </label>
                <div className="text-[11px] text-slate-400 dark:text-zinc-500 ml-5 mt-0.5">
                  Stock Ledgers won't be reposted.
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allowNegativeStock}
                    onChange={(e) => setAllowNegativeStock(e.target.checked)}
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
                    onChange={(e) => setViaLandedCostVoucher(e.target.checked)}
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

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={recreateStockLedgers}
                    onChange={(e) => setRecreateStockLedgers(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-slate-700 dark:text-zinc-200 text-xs">
                    Recreate Stock Ledgers
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default NewRepostItemValuationForm;

