import React, { useState, useMemo } from 'react';
import { Table } from 'lucide-react';

interface BatchBalanceHistoryRow {
  id: string;
  item: string;
  itemName: string;
  description: string;
  warehouseType: string;
  warehouse: string;
  batch: string;
  openingQty: number;
  inQty: number;
  outQty: number;
  balanceQty: number;
  uom: string;
}

const INITIAL_BATCH_HISTORY: BatchBalanceHistoryRow[] = [
  {
    id: 'bbh-1',
    item: 'SKU002: Laptop',
    itemName: 'Laptop',
    description: 'High performance workstation laptop',
    warehouseType: 'Transit',
    warehouse: 'Devam Eden İşler - AD',
    batch: 'BATCH-2026-001',
    openingQty: 10.0,
    inQty: 15.0,
    outQty: 5.0,
    balanceQty: 20.0,
    uom: 'Nos',
  },
  {
    id: 'bbh-2',
    item: 'SKU004: Smartphone',
    itemName: 'Smartphone',
    description: 'Enterprise 5G smartphone device',
    warehouseType: 'Retail',
    warehouse: 'Mağazalar - AD',
    batch: 'BATCH-2026-002',
    openingQty: 25.0,
    inQty: 10.0,
    outQty: 12.0,
    balanceQty: 23.0,
    uom: 'Nos',
  },
  {
    id: 'bbh-3',
    item: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    description: 'Ceramic insulated company mug',
    warehouseType: 'Finished Goods',
    warehouse: 'Bitmiş Ürünler - AD',
    batch: 'BATCH-2026-003',
    openingQty: 100.0,
    inQty: 50.0,
    outQty: 30.0,
    balanceQty: 120.0,
    uom: 'Nos',
  },
  {
    id: 'bbh-4',
    item: 'SKU009: Headphones',
    itemName: 'Headphones',
    description: 'Wireless noise-canceling headset',
    warehouseType: 'Finished Goods',
    warehouse: 'Bitmiş Ürünler - AD',
    batch: 'BATCH-2026-004',
    openingQty: 18.0,
    inQty: 12.0,
    outQty: 6.0,
    balanceQty: 24.0,
    uom: 'Nos',
  },
  {
    id: 'bbh-5',
    item: 'SKU010: Camera',
    itemName: 'Camera',
    description: '4K mirrorless digital camera',
    warehouseType: 'Retail',
    warehouse: 'Mağazalar - AD',
    batch: 'BATCH-2026-005',
    openingQty: 14.0,
    inQty: 8.0,
    outQty: 4.0,
    balanceQty: 18.0,
    uom: 'Nos',
  },
];

export const BatchWiseBalanceHistoryReportPage: React.FC = () => {
  const [company] = useState('Avalon (Demo)');
  const [fromDate, setFromDate] = useState('01-01-2026');
  const [toDate, setToDate] = useState('14-11-2026');
  const [itemCode, setItemCode] = useState('');
  const [warehouseType, setWarehouseType] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [batchNo, setBatchNo] = useState('');

  // Inline column search
  const [colFilters, setColFilters] = useState({
    item: '',
    itemName: '',
    description: '',
    warehouse: '',
    batch: '',
    uom: '',
  });

  const filteredData = useMemo(() => {
    return INITIAL_BATCH_HISTORY.filter((row) => {
      if (
        itemCode &&
        !row.item.toLowerCase().includes(itemCode.toLowerCase()) &&
        !row.itemName.toLowerCase().includes(itemCode.toLowerCase())
      ) {
        return false;
      }
      if (
        warehouseType &&
        !row.warehouseType.toLowerCase().includes(warehouseType.toLowerCase())
      ) {
        return false;
      }
      if (
        warehouse &&
        !row.warehouse.toLowerCase().includes(warehouse.toLowerCase())
      ) {
        return false;
      }
      if (batchNo && !row.batch.toLowerCase().includes(batchNo.toLowerCase())) {
        return false;
      }

      if (colFilters.item && !row.item.toLowerCase().includes(colFilters.item.toLowerCase())) return false;
      if (colFilters.itemName && !row.itemName.toLowerCase().includes(colFilters.itemName.toLowerCase())) return false;
      if (colFilters.description && !row.description.toLowerCase().includes(colFilters.description.toLowerCase())) return false;
      if (colFilters.warehouse && !row.warehouse.toLowerCase().includes(colFilters.warehouse.toLowerCase())) return false;
      if (colFilters.batch && !row.batch.toLowerCase().includes(colFilters.batch.toLowerCase())) return false;
      if (colFilters.uom && !row.uom.toLowerCase().includes(colFilters.uom.toLowerCase())) return false;

      return true;
    });
  }, [itemCode, warehouseType, warehouse, batchNo, colFilters]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, r) => ({
        openingQty: acc.openingQty + r.openingQty,
        inQty: acc.inQty + r.inQty,
        outQty: acc.outQty + r.outQty,
        balanceQty: acc.balanceQty + r.balanceQty,
      }),
      { openingQty: 0, inQty: 0, outQty: 0, balanceQty: 0 }
    );
  }, [filteredData]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      <div>
        {/* Top Filter Grid (Matching Image 4) */}
        <div className="px-6 py-4 space-y-2.5 border-b border-slate-100 dark:border-[#1E1E22]">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              readOnly
              value={company}
              className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 outline-none cursor-default"
            />
            <input
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-300"
            />
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-300"
            />
            <input
              type="text"
              placeholder="Item Code"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none focus:border-slate-300"
            />
            <input
              type="text"
              placeholder="Warehouse Type"
              value={warehouseType}
              onChange={(e) => setWarehouseType(e.target.value)}
              className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none focus:border-slate-300"
            />
            <input
              type="text"
              placeholder="Warehouse"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none focus:border-slate-300"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Batch No"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none focus:border-slate-300"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="px-6 py-4">
          {filteredData.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500">
              <Table className="w-8 h-8 mb-2 stroke-[1.5]" />
              <span className="text-xs">Nothing to show</span>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[1050px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal whitespace-nowrap">
                      <th className="py-2.5 px-3 w-10 text-center font-normal text-slate-400"></th>
                      <th className="py-2.5 px-3 font-normal">Item</th>
                      <th className="py-2.5 px-3 font-normal">Item Name</th>
                      <th className="py-2.5 px-3 font-normal">Description</th>
                      <th className="py-2.5 px-3 font-normal">Warehouse</th>
                      <th className="py-2.5 px-3 font-normal">Batch</th>
                      <th className="py-2.5 px-3 font-normal text-right">Opening Qty</th>
                      <th className="py-2.5 px-3 font-normal text-right">In Qty</th>
                      <th className="py-2.5 px-3 font-normal text-right">Out Qty</th>
                      <th className="py-2.5 px-3 font-normal text-right">Balance Qty</th>
                      <th className="py-2.5 px-3 font-normal">UOM</th>
                    </tr>

                    {/* Inline Column Filters */}
                    <tr className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A]">
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.item}
                          onChange={(e) => setColFilters({ ...colFilters, item: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.itemName}
                          onChange={(e) => setColFilters({ ...colFilters, itemName: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.description}
                          onChange={(e) => setColFilters({ ...colFilters, description: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.warehouse}
                          onChange={(e) => setColFilters({ ...colFilters, warehouse: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.batch}
                          onChange={(e) => setColFilters({ ...colFilters, batch: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.uom}
                          onChange={(e) => setColFilters({ ...colFilters, uom: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
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
                        <td className="py-2.5 px-3 text-slate-400 text-center w-10">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-zinc-100">{row.item}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.itemName}</td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">{row.description}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.warehouse}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">{row.batch}</td>
                        <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">
                          {row.openingQty.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                          {row.inQty.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-medium">
                          {row.outQty.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                          {row.balanceQty.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{row.uom}</td>
                      </tr>
                    ))}

                    {/* Total Row */}
                    <tr className="bg-slate-50/60 dark:bg-[#1E1E22]/60 font-semibold text-slate-900 dark:text-white">
                      <td className="py-2.5 px-3"></td>
                      <td className="py-2.5 px-3">Total</td>
                      <td colSpan={4}></td>
                      <td className="py-2.5 px-3 text-right">{totals.openingQty.toFixed(3)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                        {totals.inQty.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400">
                        {totals.outQty.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right">{totals.balanceQty.toFixed(3)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Notes (Matching Image 4) */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] border-t border-slate-100 dark:border-[#1E1E22]">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div>Execution Time: 0.009348 sec</div>
      </div>
    </div>
  );
};

