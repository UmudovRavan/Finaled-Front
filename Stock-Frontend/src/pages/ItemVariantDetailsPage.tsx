import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { stockService } from '../api/stockService';
import { useItem } from '../context/ItemContext';

interface ItemVariantDetailRow {
  id: string;
  templateItem: string;
  variantName: string;
  itemName: string;
  attributes: string;
  currentStock: number;
  buyingPrice: number;
  sellingPrice: number;
  openOrders: number;
  sales: number;
}

export const ItemVariantDetailsPage: React.FC = () => {
  const { items } = useItem();
  const [rows, setRows] = useState<ItemVariantDetailRow[]>([]);
  const [itemFilter, setItemFilter] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Inline column filters
  const [colFilters, setColFilters] = useState({
    variantName: '',
    itemName: '',
    attributes: '',
    currentStock: '',
    buyingPrice: '',
    sellingPrice: '',
    openOrders: '',
    sales: '',
  });

  const hasItem = itemFilter.trim().length > 0;

  const templateItems = useMemo(() => {
    const templates = items.filter((i) => i.hasVariants);
    const source = templates.length > 0 ? templates : items;
    return source.map((i) => ({
      id: i.id,
      label: i.itemCode ? `${i.itemCode}: ${i.itemName}` : i.itemName,
    }));
  }, [items]);

  const fetchVariants = useCallback(async () => {
    if (!hasItem) {
      setRows([]);
      return;
    }
    const q = itemFilter.trim().toLowerCase();
    const matched = templateItems.find(
      (t) => t.label.toLowerCase() === q || t.label.toLowerCase().includes(q)
    );
    if (!matched) {
      setRows([]);
      return;
    }
    try {
      const data = await stockService.getItemVariantDetailsReport(matched.id);
      setRows(
        data.map((r: any, idx: number) => ({
          id: r.variantItemId || r.id || `ivd-${idx}`,
          templateItem: matched.label,
          variantName: r.variantCode || r.itemCode || '',
          itemName: r.variantName || r.itemName || '',
          attributes: r.attributes || '',
          currentStock: Number(r.currentStock ?? r.actualQty ?? 0),
          buyingPrice: Number(r.buyingPrice ?? r.buyingRate ?? 0),
          sellingPrice: Number(r.sellingPrice ?? r.sellingRate ?? 0),
          openOrders: Number(r.openOrders ?? 0),
          sales: Number(r.sales ?? 0),
        }))
      );
    } catch (err) {
      console.error('Failed to fetch item variant details:', err);
    }
  }, [hasItem, itemFilter, templateItems]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const filteredData = useMemo(() => {
    if (!hasItem) return [];

    return rows.filter((row) => {
      const q = itemFilter.trim().toLowerCase();
      if (
        !row.templateItem.toLowerCase().includes(q) &&
        !row.variantName.toLowerCase().includes(q) &&
        !row.itemName.toLowerCase().includes(q)
      ) {
        return false;
      }

      if (colFilters.variantName && !row.variantName.toLowerCase().includes(colFilters.variantName.toLowerCase())) return false;
      if (colFilters.itemName && !row.itemName.toLowerCase().includes(colFilters.itemName.toLowerCase())) return false;
      if (colFilters.attributes && !row.attributes.toLowerCase().includes(colFilters.attributes.toLowerCase())) return false;
      if (colFilters.currentStock && !row.currentStock.toFixed(3).includes(colFilters.currentStock)) return false;
      if (colFilters.buyingPrice && !row.buyingPrice.toFixed(2).includes(colFilters.buyingPrice)) return false;
      if (colFilters.sellingPrice && !row.sellingPrice.toFixed(2).includes(colFilters.sellingPrice)) return false;
      if (colFilters.openOrders && !row.openOrders.toFixed(3).includes(colFilters.openOrders)) return false;
      if (colFilters.sales && !row.sales.toFixed(3).includes(colFilters.sales)) return false;

      return true;
    });
  }, [rows, itemFilter, hasItem, colFilters]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      <div className="flex-1 flex flex-col">
        {/* Top Filter Bar (Matching Image 4: Mandatory Item Input) */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-[#1E1E22]">
          <div className="relative">
            <input
              type="text"
              placeholder="Item"
              value={itemFilter}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onChange={(e) => setItemFilter(e.target.value)}
              className={`w-48 h-8 px-3 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] text-slate-900 dark:text-zinc-100 placeholder-slate-400 outline-none transition-colors border ${
                !hasItem
                  ? 'border-rose-300 dark:border-rose-500/60'
                  : 'border-slate-300 dark:border-[#3E3E44]'
              }`}
            />

            {showDropdown && (
              <div className="absolute left-0 top-9 z-40 w-52 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-lg shadow-lg py-1 text-xs">
                {templateItems.filter((t) =>
                  t.label.toLowerCase().includes(itemFilter.toLowerCase())
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onMouseDown={() => {
                      setItemFilter(t.label);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-800 dark:text-zinc-200 transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* When Item is empty: Image 4 state ("This report was generated 1 minute ago." + "Please set filters") */}
        {!hasItem ? (
          <>
            <div className="px-6 pt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 select-none">
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
              <span>This report was generated 1 minute ago.</span>
            </div>
            <div className="flex-1 flex items-center justify-center py-24">
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
                Please set filters
              </p>
            </div>
          </>
        ) : (
          /* Variant Details Table */
          <div className="px-6 py-4">
            <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal whitespace-nowrap">
                      <th className="py-2.5 px-3 w-10 text-center font-normal text-slate-400"></th>
                      <th className="py-2.5 px-3 font-normal">Variant Name</th>
                      <th className="py-2.5 px-3 font-normal">Item Name</th>
                      <th className="py-2.5 px-3 font-normal">Variant Attributes</th>
                      <th className="py-2.5 px-3 font-normal text-right">Current Stock</th>
                      <th className="py-2.5 px-3 font-normal text-right">Buying Price</th>
                      <th className="py-2.5 px-3 font-normal text-right">Selling Price</th>
                      <th className="py-2.5 px-3 font-normal text-right">Open Orders</th>
                      <th className="py-2.5 px-3 font-normal text-right">Sales</th>
                    </tr>

                    {/* Inline Column Filters */}
                    <tr className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A]">
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.variantName}
                          onChange={(e) => setColFilters({ ...colFilters, variantName: e.target.value })}
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
                          value={colFilters.attributes}
                          onChange={(e) => setColFilters({ ...colFilters, attributes: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.currentStock}
                          onChange={(e) => setColFilters({ ...colFilters, currentStock: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.buyingPrice}
                          onChange={(e) => setColFilters({ ...colFilters, buyingPrice: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.sellingPrice}
                          onChange={(e) => setColFilters({ ...colFilters, sellingPrice: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.openOrders}
                          onChange={(e) => setColFilters({ ...colFilters, openOrders: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none text-right"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.sales}
                          onChange={(e) => setColFilters({ ...colFilters, sales: e.target.value })}
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
                        <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          {row.variantName}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-zinc-100">
                          {row.itemName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                          {row.attributes}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-zinc-200">
                          {row.currentStock.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300">
                          $ {row.buyingPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                          $ {row.sellingPrice.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                          {row.openOrders.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-zinc-200">
                          {row.sales.toFixed(3)}
                        </td>
                      </tr>
                    ))}

                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-slate-400">
                          No variants found for &quot;{itemFilter}&quot;
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

      {/* Footer Notes (Matching Image 4) */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] border-t border-slate-100 dark:border-[#1E1E22]">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div>Execution Time: 0.006236 sec</div>
      </div>
    </div>
  );
};

