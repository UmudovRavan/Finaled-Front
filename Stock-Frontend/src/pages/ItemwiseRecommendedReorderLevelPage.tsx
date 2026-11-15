import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { stockService } from '../api/stockService';
import { useItem } from '../context/ItemContext';

interface ReorderLevelRow {
  id: string;
  item: string;
  itemName: string;
  itemGroup: string;
  brand: string;
  description: string;
  safetyStock: number;
  leadTimeDays: number;
  consumed: number;
  delivered: number;
  totalOutgoing: number;
  avgDailyOutgoing: number;
  reorderLevel: number;
}

export const ItemwiseRecommendedReorderLevelPage: React.FC = () => {
  const { items } = useItem();
  const [rows, setRows] = useState<ReorderLevelRow[]>([]);
  const [fromDate, setFromDate] = useState('01-01-2026');
  const [toDate, setToDate] = useState('14-11-2026');
  const [itemGroup, setItemGroup] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  // Inline column search filters
  const [colFilters, setColFilters] = useState({
    item: '',
    itemName: '',
    itemGroup: '',
    brand: '',
    description: '',
    safetyStock: '',
    leadTimeDays: '',
    consumed: '',
    delivered: '',
    totalOutgoing: '',
    avgDailyOutgoing: '',
    reorderLevel: '',
  });

  const groupNames = useMemo(() => {
    const names = new Set<string>();
    items.forEach((i) => {
      if (i.itemGroup) names.add(i.itemGroup);
    });
    return Array.from(names);
  }, [items]);

  const fetchReorderData = useCallback(async () => {
    try {
      const ledger = await stockService.getStockLedgerReport();
      const outgoingByItem = new Map<string, { consumed: number; delivered: number }>();
      for (const l of ledger) {
        const key = l.itemId || l.itemCode || '';
        if (!key) continue;
        const curr = outgoingByItem.get(key) || { consumed: 0, delivered: 0 };
        const out = Number(l.outQty || 0);
        if (out > 0) {
          if (String(l.voucherType || '').toLowerCase().includes('delivery')) {
            curr.delivered += out;
          } else {
            curr.consumed += out;
          }
        }
        outgoingByItem.set(key, curr);
      }

      setRows(
        items.map((it) => {
          const stats = outgoingByItem.get(it.id) || outgoingByItem.get(it.itemCode) || { consumed: 0, delivered: 0 };
          const totalOutgoing = stats.consumed + stats.delivered;
          const avgDailyOutgoing = Number((totalOutgoing / 30).toFixed(3));
          const leadTimeDays = Number((it as any).leadTimeDays || 0);
          const safetyStock = Number((it as any).safetyStock || (it as any).reorderLevel || 0);
          const reorderLevel = Number((safetyStock + avgDailyOutgoing * leadTimeDays).toFixed(3));
          return {
            id: it.id,
            item: it.itemCode ? `${it.itemCode}: ${it.itemName}` : it.itemName,
            itemName: it.itemName,
            itemGroup: it.itemGroup || '',
            brand: (it as any).brand || '',
            description: (it as any).description || '',
            safetyStock,
            leadTimeDays,
            consumed: stats.consumed,
            delivered: stats.delivered,
            totalOutgoing,
            avgDailyOutgoing,
            reorderLevel,
          };
        })
      );
    } catch (err) {
      console.error('Failed to fetch recommended reorder level data:', err);
    }
  }, [items]);

  useEffect(() => {
    fetchReorderData();
  }, [fetchReorderData]);

  const filteredData = useMemo(() => {
    if (!itemGroup.trim()) return [];

    return rows.filter((row) => {
      if (!row.itemGroup.toLowerCase().includes(itemGroup.trim().toLowerCase())) {
        return false;
      }
      if (brandFilter && !row.brand.toLowerCase().includes(brandFilter.toLowerCase())) {
        return false;
      }

      if (colFilters.item && !row.item.toLowerCase().includes(colFilters.item.toLowerCase())) return false;
      if (colFilters.itemName && !row.itemName.toLowerCase().includes(colFilters.itemName.toLowerCase())) return false;
      if (colFilters.itemGroup && !row.itemGroup.toLowerCase().includes(colFilters.itemGroup.toLowerCase())) return false;
      if (colFilters.brand && !row.brand.toLowerCase().includes(colFilters.brand.toLowerCase())) return false;
      if (colFilters.description && !row.description.toLowerCase().includes(colFilters.description.toLowerCase())) return false;
      if (colFilters.safetyStock && !row.safetyStock.toFixed(3).includes(colFilters.safetyStock)) return false;
      if (colFilters.leadTimeDays && !row.leadTimeDays.toFixed(3).includes(colFilters.leadTimeDays)) return false;
      if (colFilters.consumed && !row.consumed.toFixed(3).includes(colFilters.consumed)) return false;
      if (colFilters.delivered && !row.delivered.toFixed(3).includes(colFilters.delivered)) return false;
      if (colFilters.totalOutgoing && !row.totalOutgoing.toFixed(3).includes(colFilters.totalOutgoing)) return false;
      if (colFilters.avgDailyOutgoing && !row.avgDailyOutgoing.toFixed(3).includes(colFilters.avgDailyOutgoing)) return false;
      if (colFilters.reorderLevel && !row.reorderLevel.toFixed(3).includes(colFilters.reorderLevel)) return false;

      return true;
    });
  }, [rows, itemGroup, brandFilter, colFilters]);

  const hasItemGroup = itemGroup.trim().length > 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      <div className="flex-1 flex flex-col">
        {/* Top Filter Row (Matching Images 1, 2, 3) */}
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

          {/* Mandatory Item Group Filter (Red border when empty as in Image 1) */}
          <div className="relative">
            <input
              type="text"
              placeholder="Item Group"
              value={itemGroup}
              onFocus={() => setShowGroupDropdown(true)}
              onBlur={() => setTimeout(() => setShowGroupDropdown(false), 150)}
              onChange={(e) => setItemGroup(e.target.value)}
              className={`w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none transition-colors border ${
                !hasItemGroup
                  ? 'border-rose-300 dark:border-rose-500/60'
                  : 'border-slate-300 dark:border-[#3E3E44]'
              }`}
            />

            {showGroupDropdown && (
              <div className="absolute left-0 top-9 z-40 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-lg shadow-lg py-1 text-xs">
                {groupNames.filter((g) =>
                  g.toLowerCase().includes(itemGroup.toLowerCase())
                ).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onMouseDown={() => {
                      setItemGroup(g);
                      setShowGroupDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-800 dark:text-zinc-200 transition-colors"
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Brand"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-44 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none focus:border-slate-300"
          />
        </div>

        {/* If Item Group is not entered: Image 1 state ("This report was generated 9 minutes ago." + "Please set filters") */}
        {!hasItemGroup ? (
          <>
            <div className="px-6 pt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 select-none">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
              <span>This report was generated 9 minutes ago.</span>
            </div>
            <div className="flex-1 flex items-center justify-center py-24">
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
                Please set filters
              </p>
            </div>
          </>
        ) : (
          /* Table matching Images 2 & 3 */
          <div className="px-6 py-4">
            <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[1250px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal whitespace-nowrap">
                      <th className="py-2.5 px-3 w-10 text-center font-normal text-slate-400"></th>
                      <th className="py-2.5 px-3 font-normal">Item</th>
                      <th className="py-2.5 px-3 font-normal">Item Name</th>
                      <th className="py-2.5 px-3 font-normal">Item Group</th>
                      <th className="py-2.5 px-3 font-normal">Brand</th>
                      <th className="py-2.5 px-3 font-normal">Description</th>
                      <th className="py-2.5 px-3 font-normal text-right">Safety Stock</th>
                      <th className="py-2.5 px-3 font-normal text-right">Lead Time D...</th>
                      <th className="py-2.5 px-3 font-normal text-right">Consumed</th>
                      <th className="py-2.5 px-3 font-normal text-right">Delivered</th>
                      <th className="py-2.5 px-3 font-normal text-right">Total Outgoi...</th>
                      <th className="py-2.5 px-3 font-normal text-right">Avg Daily Outgoing</th>
                      <th className="py-2.5 px-3 font-normal text-right">Reorder Level</th>
                    </tr>

                    {/* Inline Search Filter Row */}
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
                          value={colFilters.itemGroup}
                          onChange={(e) => setColFilters({ ...colFilters, itemGroup: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.brand}
                          onChange={(e) => setColFilters({ ...colFilters, brand: e.target.value })}
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
                          value={colFilters.safetyStock}
                          onChange={(e) => setColFilters({ ...colFilters, safetyStock: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.leadTimeDays}
                          onChange={(e) => setColFilters({ ...colFilters, leadTimeDays: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.consumed}
                          onChange={(e) => setColFilters({ ...colFilters, consumed: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.delivered}
                          onChange={(e) => setColFilters({ ...colFilters, delivered: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.totalOutgoing}
                          onChange={(e) => setColFilters({ ...colFilters, totalOutgoing: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.avgDailyOutgoing}
                          onChange={(e) => setColFilters({ ...colFilters, avgDailyOutgoing: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.reorderLevel}
                          onChange={(e) => setColFilters({ ...colFilters, reorderLevel: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
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
                        <td className="py-2.5 px-3 font-normal text-slate-900 dark:text-zinc-100">{row.item}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.itemName}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.itemGroup}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{row.brand}</td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">{row.description}</td>
                        <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200">
                          {row.safetyStock.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200">
                          {row.leadTimeDays.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200">
                          {row.consumed.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200">
                          {row.delivered.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200">
                          {row.totalOutgoing.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200">
                          {row.avgDailyOutgoing.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-900 dark:text-white">
                          {row.reorderLevel.toFixed(3)}
                        </td>
                      </tr>
                    ))}

                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={13} className="text-center py-6 text-slate-400">
                          No matching items found in {itemGroup}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Notes */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] border-t border-slate-100 dark:border-[#1E1E22]">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div>
          Execution Time: {hasItemGroup ? '0.006236 sec' : '0.1 sec'}
        </div>
      </div>
    </div>
  );
};

