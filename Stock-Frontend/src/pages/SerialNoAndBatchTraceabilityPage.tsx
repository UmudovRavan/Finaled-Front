import React, { useState, useMemo } from 'react';
import { ChevronsUpDown } from 'lucide-react';

interface TraceabilityRow {
  id: string;
  voucherType: string;
  voucherNo: string;
  date: string;
  itemCode: string;
  itemName: string;
  serialNo: string;
  batchNo: string;
  qty: number;
  sourceWarehouse: string;
  targetWarehouse: string;
  party: string;
}

const INITIAL_TRACEABILITY_DATA: TraceabilityRow[] = [
  {
    id: 'trace-1',
    voucherType: 'Purchase Receipt',
    voucherNo: 'MAT-PRE-2026-00001',
    date: '11-10-2026',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    serialNo: 'SN-2026-001',
    batchNo: 'BATCH-2026-001',
    qty: 1.0,
    sourceWarehouse: '-',
    targetWarehouse: 'Devam Eden İşler - AD',
    party: 'Apex Global Suppliers Ltd.',
  },
  {
    id: 'trace-2',
    voucherType: 'Stock Entry',
    voucherNo: 'MAT-STE-2026-00002',
    date: '25-10-2026',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    serialNo: 'SN-2026-001',
    batchNo: 'BATCH-2026-001',
    qty: 1.0,
    sourceWarehouse: 'Devam Eden İşler - AD',
    targetWarehouse: 'Bitmiş Ürünler - AD',
    party: 'Internal Transfer',
  },
  {
    id: 'trace-3',
    voucherType: 'Delivery Note',
    voucherNo: 'MAT-DN-2026-00001',
    date: '02-11-2026',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    serialNo: 'SN-2026-001',
    batchNo: 'BATCH-2026-001',
    qty: 1.0,
    sourceWarehouse: 'Bitmiş Ürünler - AD',
    targetWarehouse: '-',
    party: 'Acme Corporation',
  },
  {
    id: 'trace-4',
    voucherType: 'Purchase Receipt',
    voucherNo: 'MAT-PRE-2026-00002',
    date: '15-10-2026',
    itemCode: 'SKU010: Camera',
    itemName: 'Camera',
    serialNo: 'SN-2026-002',
    batchNo: 'BATCH-2026-002',
    qty: 1.0,
    sourceWarehouse: '-',
    targetWarehouse: 'Mağazalar - AD',
    party: 'Sony Global Logistics',
  },
  {
    id: 'trace-5',
    voucherType: 'Stock Entry',
    voucherNo: 'MAT-STE-2026-00004',
    date: '28-10-2026',
    itemCode: 'SKU010: Camera',
    itemName: 'Camera',
    serialNo: 'SN-2026-002',
    batchNo: 'BATCH-2026-002',
    qty: 1.0,
    sourceWarehouse: 'Mağazalar - AD',
    targetWarehouse: 'Devam Eden İşler - AD',
    party: 'Quality Repack',
  },
  {
    id: 'trace-6',
    voucherType: 'Delivery Note',
    voucherNo: 'MAT-DN-2026-00003',
    date: '05-11-2026',
    itemCode: 'SKU010: Camera',
    itemName: 'Camera',
    serialNo: 'SN-2026-002',
    batchNo: 'BATCH-2026-002',
    qty: 1.0,
    sourceWarehouse: 'Devam Eden İşler - AD',
    targetWarehouse: '-',
    party: 'Baku Media Center',
  },
];

export const SerialNoAndBatchTraceabilityPage: React.FC = () => {
  // Top filter inputs matching Image 4
  const [itemCodeFilter, setItemCodeFilter] = useState('');
  const [batchNoFilter, setBatchNoFilter] = useState('');
  const [serialNoFilter, setSerialNoFilter] = useState('');
  const [direction, setDirection] = useState<'Backward' | 'Forward'>('Backward');

  // Inline column filter inputs
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    voucherType: '',
    voucherNo: '',
    date: '',
    itemCode: '',
    serialNo: '',
    batchNo: '',
    qty: '',
    sourceWarehouse: '',
    targetWarehouse: '',
    party: '',
  });

  const handleFilterChange = (col: string, val: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [col]: val,
    }));
  };

  const filteredData = useMemo(() => {
    let list = [...INITIAL_TRACEABILITY_DATA];

    if (direction === 'Backward') {
      // In backward traceability, items are ordered from latest voucher to origin
      list.reverse();
    }

    return list.filter((row) => {
      // Top filters
      if (
        itemCodeFilter &&
        !row.itemCode.toLowerCase().includes(itemCodeFilter.toLowerCase()) &&
        !row.itemName.toLowerCase().includes(itemCodeFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        batchNoFilter &&
        !row.batchNo.toLowerCase().includes(batchNoFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        serialNoFilter &&
        !row.serialNo.toLowerCase().includes(serialNoFilter.toLowerCase())
      ) {
        return false;
      }

      // Column filters
      if (
        columnFilters.voucherType &&
        !row.voucherType.toLowerCase().includes(columnFilters.voucherType.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.voucherNo &&
        !row.voucherNo.toLowerCase().includes(columnFilters.voucherNo.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.date &&
        !row.date.toLowerCase().includes(columnFilters.date.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.itemCode &&
        !row.itemCode.toLowerCase().includes(columnFilters.itemCode.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.serialNo &&
        !row.serialNo.toLowerCase().includes(columnFilters.serialNo.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.batchNo &&
        !row.batchNo.toLowerCase().includes(columnFilters.batchNo.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.sourceWarehouse &&
        !row.sourceWarehouse.toLowerCase().includes(columnFilters.sourceWarehouse.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.targetWarehouse &&
        !row.targetWarehouse.toLowerCase().includes(columnFilters.targetWarehouse.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.party &&
        !row.party.toLowerCase().includes(columnFilters.party.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [direction, itemCodeFilter, batchNoFilter, serialNoFilter, columnFilters]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      {/* Top Red Dot Sub-banner (Image 4) */}
      <div className="px-6 pt-3 pb-1 flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 select-none">
        <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
        <span>This report was generated 1 minute ago.</span>
      </div>

      {/* Top Filter Bar (Image 4: Item Code, Batch No, Serial No, Backward ↕) */}
      <div className="px-6 py-3 flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-[#1E1E22]">
        <div className="relative">
          <input
            type="text"
            placeholder="Item Code"
            value={itemCodeFilter}
            onChange={(e) => setItemCodeFilter(e.target.value)}
            className="w-44 px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 font-normal outline-none shadow-none focus:border-slate-300 dark:focus:border-[#3E3E44] transition-colors"
          />
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Batch No"
            value={batchNoFilter}
            onChange={(e) => setBatchNoFilter(e.target.value)}
            className="w-44 px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 font-normal outline-none shadow-none focus:border-slate-300 dark:focus:border-[#3E3E44] transition-colors"
          />
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Serial No"
            value={serialNoFilter}
            onChange={(e) => setSerialNoFilter(e.target.value)}
            className="w-44 px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 font-normal outline-none shadow-none focus:border-slate-300 dark:focus:border-[#3E3E44] transition-colors"
          />
        </div>

        {/* Direction Select Dropdown (Image 4: Backward ↕) */}
        <div className="relative">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'Backward' | 'Forward')}
            className="appearance-none w-36 px-3 py-1.5 pr-8 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 font-normal outline-none shadow-none cursor-pointer focus:border-slate-300 dark:focus:border-[#3E3E44] transition-colors"
          >
            <option value="Backward">Backward</option>
            <option value="Forward">Forward</option>
          </select>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Table Section */}
      <div className="px-6 py-4">
        <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
              <thead>
                {/* Headers */}
                <tr className="bg-slate-50/80 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal whitespace-nowrap">
                  <th className="py-2.5 px-3 w-10 text-center font-normal text-slate-400"></th>
                  <th className="py-2.5 px-3 font-normal">Voucher Type</th>
                  <th className="py-2.5 px-3 font-normal">Voucher No</th>
                  <th className="py-2.5 px-3 font-normal">Date</th>
                  <th className="py-2.5 px-3 font-normal">Item Code</th>
                  <th className="py-2.5 px-3 font-normal">Serial No</th>
                  <th className="py-2.5 px-3 font-normal">Batch No</th>
                  <th className="py-2.5 px-3 font-normal text-right">Qty</th>
                  <th className="py-2.5 px-3 font-normal">Source Warehouse</th>
                  <th className="py-2.5 px-3 font-normal">Target Warehouse</th>
                  <th className="py-2.5 px-3 font-normal">Party / Supplier / Customer</th>
                </tr>

                {/* Inline Search Filter Row */}
                <tr className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A]">
                  <th className="py-1 px-2"></th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.voucherType}
                      onChange={(e) => handleFilterChange('voucherType', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.voucherNo}
                      onChange={(e) => handleFilterChange('voucherNo', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.date}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.itemCode}
                      onChange={(e) => handleFilterChange('itemCode', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.serialNo}
                      onChange={(e) => handleFilterChange('serialNo', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.batchNo}
                      onChange={(e) => handleFilterChange('batchNo', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.qty}
                      onChange={(e) => handleFilterChange('qty', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none text-right"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.sourceWarehouse}
                      onChange={(e) => handleFilterChange('sourceWarehouse', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.targetWarehouse}
                      onChange={(e) => handleFilterChange('targetWarehouse', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.party}
                      onChange={(e) => handleFilterChange('party', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {filteredData.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-[#222226] transition-colors whitespace-nowrap"
                  >
                    <td className="py-2.5 px-3 text-slate-400 text-center select-none w-10">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-normal text-slate-800 dark:text-zinc-200">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-zinc-300">
                        {row.voucherType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      {row.voucherNo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                      {row.date}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-zinc-100">
                      {row.itemCode}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-zinc-300">
                      {row.serialNo}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-zinc-300">
                      {row.batchNo}
                    </td>
                    <td className="py-2.5 px-3 text-right font-normal text-slate-800 dark:text-zinc-200">
                      {row.qty.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                      {row.sourceWarehouse}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                      {row.targetWarehouse}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                      {row.party}
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-6 text-slate-400">
                      No trace records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notes (Matching Frappe Desk) */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] mt-6 pt-4 border-t border-slate-100 dark:border-[#1E1E22]">
          <div>
            For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
          </div>
          <div>Execution Time: 0.003259 sec</div>
        </div>
      </div>
    </div>
  );
};

