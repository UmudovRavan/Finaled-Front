import React, { useState, useMemo } from 'react';

interface ItemShortageRow {
  id: string;
  warehouse: string;
  item: string;
  sku: string;
  actualQty: number;
  orderedQty: number;
  plannedQty: number;
  reservedQty: number;
  reservedQtyForProd: number;
  projectedQty: number;
  company: string;
  itemName: string;
  description: string;
}

const INITIAL_SHORTAGE_DATA: ItemShortageRow[] = [
  {
    id: 'row-1',
    warehouse: 'Mağazalar - AD',
    item: 'SKU006: Coffee Mug',
    sku: 'SKU006',
    actualQty: -100.0,
    orderedQty: 0.0,
    plannedQty: 0.0,
    reservedQty: 0.0,
    reservedQtyForProd: 0.0,
    projectedQty: -100.0,
    company: 'Avalon (Demo)',
    itemName: 'Coffee Mug',
    description: '',
  },
  {
    id: 'row-2',
    warehouse: 'Mağazalar - AD',
    item: 'SKU007: Television',
    sku: 'SKU007',
    actualQty: -100.0,
    orderedQty: 0.0,
    plannedQty: 0.0,
    reservedQty: 0.0,
    reservedQtyForProd: 0.0,
    projectedQty: -100.0,
    company: 'Avalon (Demo)',
    itemName: 'Television',
    description: '',
  },
  {
    id: 'row-3',
    warehouse: 'Devam Eden İşler - AD',
    item: 'SKU010: Camera',
    sku: 'SKU010',
    actualQty: -50.0,
    orderedQty: 0.0,
    plannedQty: 0.0,
    reservedQty: 0.0,
    reservedQtyForProd: 0.0,
    projectedQty: -50.0,
    company: 'Avalon (Demo)',
    itemName: 'Camera',
    description: '',
  },
  {
    id: 'row-4',
    warehouse: 'Devam Eden İşler - AD',
    item: 'SKU009: Headphones',
    sku: 'SKU009',
    actualQty: -40.0,
    orderedQty: 0.0,
    plannedQty: 0.0,
    reservedQty: 0.0,
    reservedQtyForProd: 0.0,
    projectedQty: -40.0,
    company: 'Avalon (Demo)',
    itemName: 'Headphones',
    description: '',
  },
  {
    id: 'row-5',
    warehouse: 'Devam Eden İşler - AD',
    item: 'SKU008: Backpack',
    sku: 'SKU008',
    actualQty: -20.0,
    orderedQty: 0.0,
    plannedQty: 0.0,
    reservedQty: 0.0,
    reservedQtyForProd: 0.0,
    projectedQty: -20.0,
    company: 'Avalon (Demo)',
    itemName: 'Backpack',
    description: '',
  },
  {
    id: 'row-6',
    warehouse: 'Devam Eden İşler - AD',
    item: 'SKU002: Laptop',
    sku: 'SKU002',
    actualQty: -5.0,
    orderedQty: 0.0,
    plannedQty: 0.0,
    reservedQty: 0.0,
    reservedQtyForProd: 0.0,
    projectedQty: -5.0,
    company: 'Avalon (Demo)',
    itemName: 'Laptop',
    description: '',
  },
];

export const ItemShortageReportPage: React.FC = () => {
  const [company] = useState('Avalon (Demo)');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Column inline search filters
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    warehouse: '',
    item: '',
    actualQty: '',
    orderedQty: '',
    plannedQty: '',
    reservedQty: '',
    reservedQtyForProd: '',
    projectedQty: '',
    company: '',
    itemName: '',
    description: '',
  });

  const handleFilterChange = (column: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const filteredData = useMemo(() => {
    return INITIAL_SHORTAGE_DATA.filter((row) => {
      if (warehouseFilter && !row.warehouse.toLowerCase().includes(warehouseFilter.toLowerCase())) {
        return false;
      }
      if (
        columnFilters.warehouse &&
        !row.warehouse.toLowerCase().includes(columnFilters.warehouse.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.item &&
        !row.item.toLowerCase().includes(columnFilters.item.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.company &&
        !row.company.toLowerCase().includes(columnFilters.company.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.itemName &&
        !row.itemName.toLowerCase().includes(columnFilters.itemName.toLowerCase())
      ) {
        return false;
      }
      if (
        columnFilters.actualQty &&
        !row.actualQty.toString().includes(columnFilters.actualQty)
      ) {
        return false;
      }
      if (
        columnFilters.projectedQty &&
        !row.projectedQty.toString().includes(columnFilters.projectedQty)
      ) {
        return false;
      }
      return true;
    });
  }, [warehouseFilter, columnFilters]);

  const formatQty = (val: number) => {
    if (val < 0) {
      return `- ${Math.abs(val).toFixed(3)}`;
    }
    return val.toFixed(3);
  };

  // Chart parameters (Matching Image 2 & 3)
  // Shortage values are negative: 0 down to -100
  const maxAbsVal = 100;

  return (
    <div className="min-h-screen bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      {/* Top Filter Bar (Company & Warehouse) */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-4 border-b border-slate-100 dark:border-[#1E1E22]">
        <div className="relative">
          <input
            type="text"
            readOnly
            value={company}
            className="w-48 px-3.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 font-normal outline-none shadow-none cursor-default"
          />
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Warehouse"
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="w-48 px-3.5 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 font-normal outline-none shadow-none focus:border-slate-300 dark:focus:border-[#3E3E44] transition-colors"
          />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Shortage Bar Chart (Images 2 & 3) */}
        <div className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl p-6 shadow-xs">
          <div className="relative h-64 w-full flex">
            {/* Y-Axis Labels */}
            <div className="w-14 flex flex-col justify-between text-right pr-3 text-[10px] text-slate-400 dark:text-zinc-500 font-mono select-none">
              <span>0</span>
              <span>-25</span>
              <span>-50</span>
              <span>-75</span>
              <span>-100.00</span>
            </div>

            {/* Grid & Bars Container */}
            <div className="relative flex-1 h-full border-l border-slate-200 dark:border-[#27272A]">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-slate-200 dark:border-[#27272A] w-full" />
                <div className="border-b border-dashed border-slate-100 dark:border-[#27272A]/50 w-full" />
                <div className="border-b border-dashed border-slate-100 dark:border-[#27272A]/50 w-full" />
                <div className="border-b border-dashed border-slate-100 dark:border-[#27272A]/50 w-full" />
                <div className="border-b border-slate-200 dark:border-[#27272A] w-full" />
              </div>

              {/* Bars Row */}
              <div className="relative h-full flex items-start justify-around px-8 pt-0">
                {filteredData.map((row, idx) => {
                  const heightPercent = (Math.abs(row.actualQty) / maxAbsVal) * 100;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={row.id}
                      className="relative h-full flex flex-col items-center justify-start group"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Downward hanging pink/rose bar matching Image 2 & 3 */}
                      <div
                        className="w-16 bg-[#F472B6] hover:bg-[#EC4899] dark:bg-[#F472B6] dark:hover:bg-[#F43F5E] transition-all rounded-xs cursor-pointer relative"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Hover Tooltip (shown in Image 3) */}
                        {isHovered && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/90 text-white text-[11px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in duration-75">
                            {formatQty(row.actualQty)}
                          </div>
                        )}
                      </div>

                      {/* X-axis label under chart */}
                      <span className="absolute -bottom-6 text-[10px] text-slate-500 dark:text-zinc-400 font-normal">
                        {row.sku}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
              <thead>
                {/* Headers matching Images 2 & 3 */}
                <tr className="bg-slate-50/80 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal whitespace-nowrap">
                  <th className="py-2.5 px-3 w-10 text-center font-normal text-slate-400"></th>
                  <th className="py-2.5 px-3 font-normal">Warehouse</th>
                  <th className="py-2.5 px-3 font-normal">Item</th>
                  <th className="py-2.5 px-3 font-normal text-right">Actual Quan...</th>
                  <th className="py-2.5 px-3 font-normal text-right">Ordered Qua...</th>
                  <th className="py-2.5 px-3 font-normal text-right">Planned Qua...</th>
                  <th className="py-2.5 px-3 font-normal text-right">Reserved Qu... ⌄</th>
                  <th className="py-2.5 px-3 font-normal text-right">Reserved Qu...</th>
                  <th className="py-2.5 px-3 font-normal text-right">Projected Q...</th>
                  <th className="py-2.5 px-3 font-normal">Company</th>
                  <th className="py-2.5 px-3 font-normal">Item Name</th>
                  <th className="py-2.5 px-3 font-normal">Description</th>
                </tr>

                {/* Inline Search Filter Row */}
                <tr className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A]">
                  <th className="py-1 px-2"></th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.warehouse}
                      onChange={(e) => handleFilterChange('warehouse', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.item}
                      onChange={(e) => handleFilterChange('item', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.actualQty}
                      onChange={(e) => handleFilterChange('actualQty', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none text-right"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.orderedQty}
                      onChange={(e) => handleFilterChange('orderedQty', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none text-right"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.plannedQty}
                      onChange={(e) => handleFilterChange('plannedQty', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none text-right"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.reservedQty}
                      onChange={(e) => handleFilterChange('reservedQty', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none text-right"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.reservedQtyForProd}
                      onChange={(e) => handleFilterChange('reservedQtyForProd', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none text-right"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.projectedQty}
                      onChange={(e) => handleFilterChange('projectedQty', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none text-right"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.company}
                      onChange={(e) => handleFilterChange('company', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.itemName}
                      onChange={(e) => handleFilterChange('itemName', e.target.value)}
                      className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={columnFilters.description}
                      onChange={(e) => handleFilterChange('description', e.target.value)}
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
                    <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                      {row.warehouse}
                    </td>
                    <td className="py-2.5 px-3 font-normal text-slate-900 dark:text-zinc-100">
                      {row.item}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200 font-normal">
                      {formatQty(row.actualQty)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                      {row.orderedQty.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                      {row.plannedQty.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                      {row.reservedQty.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-zinc-400">
                      {row.reservedQtyForProd.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 dark:text-zinc-200 font-normal">
                      {formatQty(row.projectedQty)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                      {row.company}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                      {row.itemName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 dark:text-zinc-500">
                      {row.description}
                    </td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={12} className="text-center py-6 text-slate-400">
                      No shortages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notes (Matching Frappe Desk) */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] pt-4 border-t border-slate-100 dark:border-[#1E1E22]">
          <div>
            For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
          </div>
          <div>Execution Time: 0.003259 sec</div>
        </div>
      </div>
    </div>
  );
};

