import React, { useState, useMemo } from 'react';

interface TrendRow {
  id: string;
  item: string;
  itemName: string;
  currency: string;
  janQty: number;
  janAmt: number;
  febQty: number;
  febAmt: number;
  marQty: number;
  marAmt: number;
  aprQty: number;
  aprAmt: number;
  mayQty: number;
  mayAmt: number;
  junQty: number;
  junAmt: number;
  julQty: number;
  julAmt: number;
  augQty: number;
  augAmt: number;
  sepQty: number;
  sepAmt: number;
  octQty: number;
  octAmt: number;
  novQty: number;
  novAmt: number;
  decQty: number;
  decAmt: number;
}

const INITIAL_PURCHASE_TREND_ROWS: TrendRow[] = [
  {
    id: 'row-1',
    item: 'SKU001: T-shirt',
    itemName: 'T-shirt',
    currency: 'USD',
    janQty: 0.0,
    janAmt: 0.0,
    febQty: 0.0,
    febAmt: 0.0,
    marQty: 0.0,
    marAmt: 0.0,
    aprQty: 0.0,
    aprAmt: 0.0,
    mayQty: 0.0,
    mayAmt: 0.0,
    junQty: 0.0,
    junAmt: 0.0,
    julQty: 0.0,
    julAmt: 0.0,
    augQty: 0.0,
    augAmt: 0.0,
    sepQty: 0.0,
    sepAmt: 0.0,
    octQty: 0.0,
    octAmt: 0.0,
    novQty: 0.0,
    novAmt: 0.0,
    decQty: 0.0,
    decAmt: 0.0,
  },
  {
    id: 'row-2',
    item: 'SKU002: Laptop',
    itemName: 'Laptop',
    currency: 'USD',
    janQty: 0.0,
    janAmt: 0.0,
    febQty: 0.0,
    febAmt: 0.0,
    marQty: 0.0,
    marAmt: 0.0,
    aprQty: 0.0,
    aprAmt: 0.0,
    mayQty: 0.0,
    mayAmt: 0.0,
    junQty: 0.0,
    junAmt: 0.0,
    julQty: 0.0,
    julAmt: 0.0,
    augQty: 0.0,
    augAmt: 0.0,
    sepQty: 0.0,
    sepAmt: 0.0,
    octQty: 0.0,
    octAmt: 0.0,
    novQty: 10.0,
    novAmt: 500.0,
    decQty: 0.0,
    decAmt: 0.0,
  },
  {
    id: 'row-3',
    item: 'SKU003: Book',
    itemName: 'Book',
    currency: 'USD',
    janQty: 0.0,
    janAmt: 0.0,
    febQty: 0.0,
    febAmt: 0.0,
    marQty: 0.0,
    marAmt: 0.0,
    aprQty: 0.0,
    aprAmt: 0.0,
    mayQty: 0.0,
    mayAmt: 0.0,
    junQty: 0.0,
    junAmt: 0.0,
    julQty: 0.0,
    julAmt: 0.0,
    augQty: 0.0,
    augAmt: 0.0,
    sepQty: 0.0,
    sepAmt: 0.0,
    octQty: 0.0,
    octAmt: 0.0,
    novQty: 0.0,
    novAmt: 0.0,
    decQty: 0.0,
    decAmt: 0.0,
  },
  {
    id: 'row-4',
    item: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    currency: 'USD',
    janQty: 0.0,
    janAmt: 0.0,
    febQty: 0.0,
    febAmt: 0.0,
    marQty: 0.0,
    marAmt: 0.0,
    aprQty: 0.0,
    aprAmt: 0.0,
    mayQty: 0.0,
    mayAmt: 0.0,
    junQty: 0.0,
    junAmt: 0.0,
    julQty: 0.0,
    julAmt: 0.0,
    augQty: 0.0,
    augAmt: 0.0,
    sepQty: 0.0,
    sepAmt: 0.0,
    octQty: 0.0,
    octAmt: 0.0,
    novQty: 0.0,
    novAmt: 0.0,
    decQty: 0.0,
    decAmt: 0.0,
  },
  {
    id: 'row-5',
    item: 'SKU007: Television',
    itemName: 'Television',
    currency: 'USD',
    janQty: 0.0,
    janAmt: 0.0,
    febQty: 0.0,
    febAmt: 0.0,
    marQty: 0.0,
    marAmt: 0.0,
    aprQty: 0.0,
    aprAmt: 0.0,
    mayQty: 0.0,
    mayAmt: 0.0,
    junQty: 0.0,
    junAmt: 0.0,
    julQty: 0.0,
    julAmt: 0.0,
    augQty: 0.0,
    augAmt: 0.0,
    sepQty: 0.0,
    sepAmt: 0.0,
    octQty: 0.0,
    octAmt: 0.0,
    novQty: 0.0,
    novAmt: 0.0,
    decQty: 0.0,
    decAmt: 0.0,
  },
];

export const PurchaseReceiptTrendsPage: React.FC = () => {
  // Top Filter state matching Image 1
  const [company, setCompany] = useState('Avalon (Demo)');
  const [period, setPeriod] = useState('Monthly');
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [periodBasedOn, setPeriodBasedOn] = useState('Posting Date');
  const [basedOn, setBasedOn] = useState('Item');
  const [groupBy, setGroupBy] = useState('');

  // Column inline filter search (matching Item Price Stock behavior requested)
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [executionTime, setExecutionTime] = useState('0.004324');

  const handleColFilterChange = (colKey: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [colKey]: val }));
  };

  const filteredRows = useMemo(() => {
    return INITIAL_PURCHASE_TREND_ROWS.filter((row) => {
      for (const [k, v] of Object.entries(colFilters)) {
        if (!v.trim()) continue;
        const fieldVal = String((row as any)[k] ?? '').toLowerCase();
        if (!fieldVal.includes(v.toLowerCase().trim())) return false;
      }
      return true;
    });
  }, [colFilters]);

  // Totals
  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        acc.janQty += r.janQty;
        acc.janAmt += r.janAmt;
        acc.febQty += r.febQty;
        acc.febAmt += r.febAmt;
        acc.marQty += r.marQty;
        acc.marAmt += r.marAmt;
        acc.aprQty += r.aprQty;
        acc.aprAmt += r.aprAmt;
        acc.mayQty += r.mayQty;
        acc.mayAmt += r.mayAmt;
        acc.junQty += r.junQty;
        acc.junAmt += r.junAmt;
        acc.julQty += r.julQty;
        acc.julAmt += r.julAmt;
        acc.augQty += r.augQty;
        acc.augAmt += r.augAmt;
        acc.sepQty += r.sepQty;
        acc.sepAmt += r.sepAmt;
        acc.octQty += r.octQty;
        acc.octAmt += r.octAmt;
        acc.novQty += r.novQty;
        acc.novAmt += r.novAmt;
        acc.decQty += r.decQty;
        acc.decAmt += r.decAmt;
        return acc;
      },
      {
        janQty: 0,
        janAmt: 0,
        febQty: 0,
        febAmt: 0,
        marQty: 0,
        marAmt: 0,
        aprQty: 0,
        aprAmt: 0,
        mayQty: 0,
        mayAmt: 0,
        junQty: 0,
        junAmt: 0,
        julQty: 0,
        julAmt: 0,
        augQty: 0,
        augAmt: 0,
        sepQty: 0,
        sepAmt: 0,
        octQty: 0,
        octAmt: 0,
        novQty: 0,
        novAmt: 0,
        decQty: 0,
        decAmt: 0,
      }
    );
  }, [filteredRows]);

  const totalQtyAll = useMemo(() => {
    return Object.keys(totals)
      .filter((k) => k.endsWith('Qty'))
      .reduce((sum, k) => sum + (totals as any)[k], 0);
  }, [totals]);

  const totalAmtAll = useMemo(() => {
    return Object.keys(totals)
      .filter((k) => k.endsWith('Amt'))
      .reduce((sum, k) => sum + (totals as any)[k], 0);
  }, [totals]);

  const formatQty = (val: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  const formatAmt = (val: number) => {
    return `$ ${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getRowTotalQty = (r: TrendRow) =>
    r.janQty + r.febQty + r.marQty + r.aprQty + r.mayQty + r.junQty + r.julQty + r.augQty + r.sepQty + r.octQty + r.novQty + r.decQty;

  const getRowTotalAmt = (r: TrendRow) =>
    r.janAmt + r.febAmt + r.marAmt + r.aprAmt + r.mayAmt + r.junAmt + r.julAmt + r.augAmt + r.sepAmt + r.octAmt + r.novAmt + r.decAmt;

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Top Filter Form (Image 1: 1 row with 6 inputs) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Company */}
          <div>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Avalon (Demo)"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          {/* Period */}
          <div>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none cursor-pointer pr-6 transition-all"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
              <span className="absolute right-2 top-2 pointer-events-none text-slate-400 text-[10px]">
                ↕
              </span>
            </div>
          </div>

          {/* Fiscal Year */}
          <div>
            <input
              type="text"
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              placeholder="2026"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          {/* Period Based On */}
          <div>
            <div className="relative">
              <select
                value={periodBasedOn}
                onChange={(e) => setPeriodBasedOn(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none cursor-pointer pr-6 transition-all"
              >
                <option value="Posting Date">Posting Date</option>
                <option value="Transaction Date">Transaction Date</option>
              </select>
              <span className="absolute right-2 top-2 pointer-events-none text-slate-400 text-[10px]">
                ↕
              </span>
            </div>
          </div>

          {/* Based On */}
          <div>
            <div className="relative">
              <select
                value={basedOn}
                onChange={(e) => setBasedOn(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none cursor-pointer pr-6 transition-all"
              >
                <option value="Item">Item</option>
                <option value="Item Group">Item Group</option>
                <option value="Supplier">Supplier</option>
                <option value="Supplier Group">Supplier Group</option>
              </select>
              <span className="absolute right-2 top-2 pointer-events-none text-slate-400 text-[10px]">
                ↕
              </span>
            </div>
          </div>

          {/* Group By */}
          <div>
            <div className="relative">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none cursor-pointer pr-6 transition-all"
              >
                <option value="">Group By</option>
                <option value="Item Group">Item Group</option>
                <option value="Supplier">Supplier</option>
              </select>
              <span className="absolute right-2 top-2 pointer-events-none text-slate-400 text-[10px]">
                ↕
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Table (Images 1, 2, 3) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Row 1: Header Titles */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] text-slate-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                <th className="px-3 py-2 w-10 text-center text-slate-400 border-r border-slate-200/60 dark:border-[#27272A]/60"></th>
                <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item</th>
                <th className="px-3 py-2 min-w-[120px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Name</th>
                <th className="px-3 py-2 min-w-[80px] border-r border-slate-200/60 dark:border-[#27272A]/60">Currency</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Jan (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Jan (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Feb (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Feb (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Mar (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Mar (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Apr (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Apr (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">May (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">May (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Jun (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Jun (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Jul (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Jul (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Aug (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Aug (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Sep (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Sep (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Oct (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Oct (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Nov (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Nov (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Dec (Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Dec (Amt)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Total(Qty)</th>
                <th className="px-3 py-2 min-w-[90px] text-right">Total(Amt)</th>
              </tr>

              {/* Row 2: Secondary Inline Filter Row (Image 1, 2, 3) */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B]">
                <td className="px-2 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.item || ''}
                    onChange={(e) => handleColFilterChange('item', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.itemName || ''}
                    onChange={(e) => handleColFilterChange('itemName', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.currency || ''}
                    onChange={(e) => handleColFilterChange('currency', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                {[
                  'janQty', 'janAmt', 'febQty', 'febAmt', 'marQty', 'marAmt',
                  'aprQty', 'aprAmt', 'mayQty', 'mayAmt', 'junQty', 'junAmt',
                  'julQty', 'julAmt', 'augQty', 'augAmt', 'sepQty', 'sepAmt',
                  'octQty', 'octAmt', 'novQty', 'novAmt', 'decQty', 'decAmt',
                  'totalQty', 'totalAmt',
                ].map((col) => (
                  <td key={col} className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60 last:border-r-0">
                    <input
                      type="text"
                      value={colFilters[col] || ''}
                      onChange={(e) => handleColFilterChange(col, e.target.value)}
                      className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                    />
                  </td>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] text-slate-700 dark:text-zinc-200 whitespace-nowrap">
              {/* Row 1 matching Image 1: Total Row displayed at top/first in Frappe ERP trends */}
              <tr className="bg-[#FAFBFD] dark:bg-[#1C1C20] font-semibold text-slate-900 dark:text-white">
                <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-[#27272A]">
                  1
                </td>
                <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                  Total
                </td>
                <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]"></td>
                <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]"></td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.janQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.janAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.febQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.febAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.marQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.marAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.aprQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.aprAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.mayQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.mayAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.junQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.junAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.julQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.julAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.augQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.augAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.sepQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.sepAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.octQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.octAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.novQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.novAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totals.decQty)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(totals.decAmt)}</td>
                <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(totalQtyAll)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatAmt(totalAmtAll)}</td>
              </tr>

              {/* Data Rows */}
              {filteredRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-[#1E1E22]/60 transition-colors"
                >
                  <td className="px-3 py-2 text-center text-slate-400 dark:text-zinc-500 font-normal border-r border-slate-100 dark:border-[#27272A]">
                    {idx + 2}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] font-medium text-slate-800 dark:text-zinc-100">
                    <span title={row.item}>
                      {row.item.length > 15 ? `${row.item.slice(0, 13)}...` : row.item}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                    {row.itemName}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-500">
                    {row.currency}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.janQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.janAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.febQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.febAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.marQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.marAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.aprQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.aprAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.mayQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.mayAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.junQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.junAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.julQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.julAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.augQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.augAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.sepQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.sepAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.octQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.octAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.novQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.novAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(row.decQty)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatAmt(row.decAmt)}</td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">{formatQty(getRowTotalQty(row))}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatAmt(getRowTotalAmt(row))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 gap-2 px-1">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div>Execution Time: {executionTime} sec</div>
      </div>
    </div>
  );
};

