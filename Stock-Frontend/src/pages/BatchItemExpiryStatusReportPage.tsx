import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table } from 'lucide-react';
import { stockService } from '../api/stockService';

interface BatchExpiryRow {
  id: string;
  item: string;
  itemName: string;
  description: string;
  batch: string;
  manufacturingDate: string;
  expiryDate: string;
  expiryInDays: number;
  availableQty: number;
  warehouse: string;
}

export const BatchItemExpiryStatusReportPage: React.FC = () => {
  const [rows, setRows] = useState<BatchExpiryRow[]>([]);
  const [fromDate, setFromDate] = useState('01-01-2026');
  const [toDate, setToDate] = useState('14-11-2026');
  const [itemFilter, setItemFilter] = useState('');

  // Inline column filters
  const [colFilters, setColFilters] = useState({
    item: '',
    itemName: '',
    description: '',
    batch: '',
    manufacturingDate: '',
    expiryDate: '',
    warehouse: '',
  });

  const fetchReport = useCallback(async () => {
    try {
      const data = await stockService.getBatchExpiryStatusReport();
      setRows(
        data.map((r: any, idx: number) => ({
          id: r.batchId || r.id || `be-${idx}`,
          item: r.itemCode ? `${r.itemCode}${r.itemName ? ': ' + r.itemName : ''}` : r.itemName || '',
          itemName: r.itemName || '',
          description: r.description || '',
          batch: r.batchNo || '',
          manufacturingDate: r.manufacturingDate ? String(r.manufacturingDate).slice(0, 10) : '',
          expiryDate: r.expiryDate ? String(r.expiryDate).slice(0, 10) : '',
          expiryInDays: Number(r.expiryInDays ?? 0),
          availableQty: Number(r.availableQty ?? r.balanceQty ?? 0),
          warehouse: r.warehouseName || '',
        }))
      );
    } catch (err) {
      console.error('Failed to fetch batch expiry status:', err);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const filteredData = useMemo(() => {
    return rows.filter((row) => {
      if (
        itemFilter &&
        !row.item.toLowerCase().includes(itemFilter.toLowerCase()) &&
        !row.itemName.toLowerCase().includes(itemFilter.toLowerCase())
      ) {
        return false;
      }

      if (colFilters.item && !row.item.toLowerCase().includes(colFilters.item.toLowerCase())) return false;
      if (colFilters.itemName && !row.itemName.toLowerCase().includes(colFilters.itemName.toLowerCase())) return false;
      if (colFilters.description && !row.description.toLowerCase().includes(colFilters.description.toLowerCase())) return false;
      if (colFilters.batch && !row.batch.toLowerCase().includes(colFilters.batch.toLowerCase())) return false;
      if (colFilters.manufacturingDate && !row.manufacturingDate.includes(colFilters.manufacturingDate)) return false;
      if (colFilters.expiryDate && !row.expiryDate.includes(colFilters.expiryDate)) return false;
      if (colFilters.warehouse && !row.warehouse.toLowerCase().includes(colFilters.warehouse.toLowerCase())) return false;

      return true;
    });
  }, [rows, itemFilter, colFilters]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      <div>
        {/* Top Filter Bar (Matching Image 5) */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-[#1E1E22]">
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
            placeholder="Item"
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none focus:border-slate-300"
          />
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
                      <th className="py-2.5 px-3 font-normal">Batch</th>
                      <th className="py-2.5 px-3 font-normal">Manufacturing Date</th>
                      <th className="py-2.5 px-3 font-normal">Expiry Date</th>
                      <th className="py-2.5 px-3 font-normal text-right">Expiry (In Days)</th>
                      <th className="py-2.5 px-3 font-normal text-right">Available Qty</th>
                      <th className="py-2.5 px-3 font-normal">Warehouse</th>
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
                          value={colFilters.batch}
                          onChange={(e) => setColFilters({ ...colFilters, batch: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.manufacturingDate}
                          onChange={(e) => setColFilters({ ...colFilters, manufacturingDate: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.expiryDate}
                          onChange={(e) => setColFilters({ ...colFilters, expiryDate: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.warehouse}
                          onChange={(e) => setColFilters({ ...colFilters, warehouse: e.target.value })}
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
                        <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400">{row.batch}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{row.manufacturingDate}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.expiryDate}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              row.expiryInDays < 0
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                                : row.expiryInDays <= 30
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                            }`}
                          >
                            {row.expiryInDays}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-zinc-200">
                          {row.availableQty.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.warehouse}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Notes (Matching Image 5) */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] border-t border-slate-100 dark:border-[#1E1E22]">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div>Execution Time: 0.002382 sec</div>
      </div>
    </div>
  );
};

