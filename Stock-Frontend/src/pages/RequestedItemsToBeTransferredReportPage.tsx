import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table } from 'lucide-react';
import { stockService } from '../api/stockService';

interface RequestedTransferRow {
  id: string;
  materialRequest: string;
  date: string;
  requiredBy: string;
  itemCode: string;
  itemName: string;
  description: string;
  warehouse: string;
  qty: number;
  transferredQty: number;
  qtyToTransfer: number;
  company: string;
}

export const RequestedItemsToBeTransferredReportPage: React.FC = () => {
  const [rows, setRows] = useState<RequestedTransferRow[]>([]);
  const [colFilters, setColFilters] = useState({
    materialRequest: '',
    date: '',
    requiredBy: '',
    itemCode: '',
    itemName: '',
    description: '',
    warehouse: '',
    company: '',
  });

  const fetchReport = useCallback(async () => {
    try {
      const mrs = await stockService.getMaterialRequests();
      const flattened: RequestedTransferRow[] = [];
      for (const mr of mrs) {
        const purpose = String(mr.purpose || '').toLowerCase();
        if (!purpose.includes('transfer')) continue;
        if (mr.status === 'Cancelled') continue;
        for (const it of mr.items || []) {
          const qty = Number(it.qty || 0);
          const transferredQty = Number((it as any).orderedQty || 0);
          const qtyToTransfer = Math.max(0, qty - transferredQty);
          flattened.push({
            id: `${mr.id}-${it.id || it.itemCode}`,
            materialRequest: mr.series || mr.id,
            date: mr.transactionDate ? String(mr.transactionDate).slice(0, 10) : '',
            requiredBy: it.requiredBy || mr.requiredBy || '',
            itemCode: it.itemCode ? `${it.itemCode}${it.itemName ? ': ' + it.itemName : ''}` : it.itemName || '',
            itemName: it.itemName || '',
            description: '',
            warehouse: it.warehouse || mr.setWarehouse || '',
            qty,
            transferredQty,
            qtyToTransfer,
            company: 'Avalon (Demo)',
          });
        }
      }
      setRows(flattened);
    } catch (err) {
      console.error('Failed to fetch requested items to be transferred:', err);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const filteredData = useMemo(() => {
    return rows.filter((row) => {
      if (
        colFilters.materialRequest &&
        !row.materialRequest.toLowerCase().includes(colFilters.materialRequest.toLowerCase())
      ) {
        return false;
      }
      if (colFilters.date && !row.date.includes(colFilters.date)) return false;
      if (colFilters.requiredBy && !row.requiredBy.includes(colFilters.requiredBy)) return false;
      if (colFilters.itemCode && !row.itemCode.toLowerCase().includes(colFilters.itemCode.toLowerCase())) return false;
      if (colFilters.itemName && !row.itemName.toLowerCase().includes(colFilters.itemName.toLowerCase())) return false;
      if (colFilters.description && !row.description.toLowerCase().includes(colFilters.description.toLowerCase())) return false;
      if (colFilters.warehouse && !row.warehouse.toLowerCase().includes(colFilters.warehouse.toLowerCase())) return false;
      if (colFilters.company && !row.company.toLowerCase().includes(colFilters.company.toLowerCase())) return false;

      return true;
    });
  }, [rows, colFilters]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, r) => ({
        qty: acc.qty + r.qty,
        transferredQty: acc.transferredQty + r.transferredQty,
        qtyToTransfer: acc.qtyToTransfer + r.qtyToTransfer,
      }),
      { qty: 0, transferredQty: 0, qtyToTransfer: 0 }
    );
  }, [filteredData]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
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
              <table className="w-full text-xs text-left border-collapse min-w-[1150px]">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal whitespace-nowrap">
                    <th className="py-2.5 px-3 w-10 text-center font-normal text-slate-400"></th>
                    <th className="py-2.5 px-3 font-normal">Material Request</th>
                    <th className="py-2.5 px-3 font-normal">Date</th>
                    <th className="py-2.5 px-3 font-normal">Required By</th>
                    <th className="py-2.5 px-3 font-normal">Item Code</th>
                    <th className="py-2.5 px-3 font-normal">Item Name</th>
                    <th className="py-2.5 px-3 font-normal">Description</th>
                    <th className="py-2.5 px-3 font-normal">Warehouse</th>
                    <th className="py-2.5 px-3 font-normal text-right">Qty</th>
                    <th className="py-2.5 px-3 font-normal text-right">Transferred Qty</th>
                    <th className="py-2.5 px-3 font-normal text-right">Qty to Transfer</th>
                    <th className="py-2.5 px-3 font-normal">Company</th>
                  </tr>

                  {/* Inline Column Filters */}
                  <tr className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A]">
                    <th className="py-1 px-2"></th>
                    <th className="py-1 px-2">
                      <input
                        type="text"
                        value={colFilters.materialRequest}
                        onChange={(e) => setColFilters({ ...colFilters, materialRequest: e.target.value })}
                        className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                      />
                    </th>
                    <th className="py-1 px-2">
                      <input
                        type="text"
                        value={colFilters.date}
                        onChange={(e) => setColFilters({ ...colFilters, date: e.target.value })}
                        className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                      />
                    </th>
                    <th className="py-1 px-2">
                      <input
                        type="text"
                        value={colFilters.requiredBy}
                        onChange={(e) => setColFilters({ ...colFilters, requiredBy: e.target.value })}
                        className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                      />
                    </th>
                    <th className="py-1 px-2">
                      <input
                        type="text"
                        value={colFilters.itemCode}
                        onChange={(e) => setColFilters({ ...colFilters, itemCode: e.target.value })}
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
                    <th className="py-1 px-2"></th>
                    <th className="py-1 px-2"></th>
                    <th className="py-1 px-2"></th>
                    <th className="py-1 px-2">
                      <input
                        type="text"
                        value={colFilters.company}
                        onChange={(e) => setColFilters({ ...colFilters, company: e.target.value })}
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
                      <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        {row.materialRequest}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{row.date}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{row.requiredBy}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-zinc-100">{row.itemCode}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.itemName}</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">{row.description}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.warehouse}</td>
                      <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200">
                        {row.qty.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                        {row.transferredQty.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                        {row.qtyToTransfer.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.company}</td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr className="bg-slate-50/60 dark:bg-[#1E1E22]/60 font-semibold text-slate-900 dark:text-white">
                    <td className="py-2.5 px-3"></td>
                    <td className="py-2.5 px-3">Total</td>
                    <td colSpan={6}></td>
                    <td className="py-2.5 px-3 text-right">{totals.qty.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">
                      {totals.transferredQty.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">
                      {totals.qtyToTransfer.toFixed(3)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer Notes (Matching Image 6) */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] border-t border-slate-100 dark:border-[#1E1E22]">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div>Execution Time: 0.1 sec</div>
      </div>
    </div>
  );
};

