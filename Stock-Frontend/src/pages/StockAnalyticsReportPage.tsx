import React, { useState, useMemo } from 'react';

interface StockAnalyticsRow {
  id: string;
  item: string;
  itemName: string;
  itemGroup: string;
  brand: string;
  uom: string;
  nov2026: number;
}

const SAMPLE_ANALYTICS_ROWS: StockAnalyticsRow[] = [
  { id: '1', item: '12ala: ala', itemName: 'ala', itemGroup: 'Products', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '2', item: 'adad', itemName: 'adad', itemGroup: 'Products', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '3', item: 'asas: daads', itemName: 'daads', itemGroup: 'Consumable', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '4', item: 'asdf: asdasd', itemName: 'asdasd', itemGroup: 'Raw Material', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '5', item: 'dsfg: adsfd', itemName: 'adsfd', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '6', item: 'SKU001: T-shirt', itemName: 'T-shirt', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '7', item: 'SKU002: Laptop', itemName: 'Laptop', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 500.0 },
  { id: '8', item: 'SKU003: Book', itemName: 'Book', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '9', item: 'SKU004: Smartphone', itemName: 'Smartphone', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '10', item: 'SKU005: Sneakers', itemName: 'Sneakers', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '11', item: 'SKU006: Coffee Mug', itemName: 'Coffee Mug', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '12', item: 'SKU007: Television', itemName: 'Television', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '13', item: 'SKU008: Backpack', itemName: 'Backpack', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '14', item: 'SKU009: Headphones', itemName: 'Headphones', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
  { id: '15', item: 'SKU010: Camera', itemName: 'Camera', itemGroup: 'Demo Item Group', brand: '', uom: 'Nos', nov2026: 0.0 },
];

export const StockAnalyticsReportPage: React.FC = () => {
  // Top Filter state (Image 3: initially empty date range)
  const [itemGroup, setItemGroup] = useState('');
  const [item, setItem] = useState('');
  const [valueOrQty, setValueOrQty] = useState('Value');
  const [brand, setBrand] = useState('');
  const [company, setCompany] = useState('Avalon (Demo)');
  const [warehouse, setWarehouse] = useState('');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [range, setRange] = useState('Monthly');

  // Checkboxes
  const [selectedIds, setSelectedIds] = useState<string[]>(['1']); // Image 4 & 5 has row 1 checked
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [executionTime, setExecutionTime] = useState('0.059848');

  // Does it have a valid date range?
  const hasDateRange = Boolean(fromDate.trim() && toDate.trim());

  const handleApplySampleRange = () => {
    setFromDate('13-11-2026');
    setToDate('27-11-2026');
    setExecutionTime('0.061402');
  };

  const handleGenerateReport = () => {
    if (!fromDate.trim() || !toDate.trim()) {
      setFromDate('13-11-2026');
      setToDate('27-11-2026');
    }
    setExecutionTime((Math.random() * 0.02 + 0.05).toFixed(6));
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === SAMPLE_ANALYTICS_ROWS.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(SAMPLE_ANALYTICS_ROWS.map((r) => r.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleColFilterChange = (key: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [key]: val }));
  };

  const filteredRows = useMemo(() => {
    return SAMPLE_ANALYTICS_ROWS.filter((row) => {
      if (itemGroup && !row.itemGroup.toLowerCase().includes(itemGroup.toLowerCase())) return false;
      if (item && !row.item.toLowerCase().includes(item.toLowerCase()) && !row.itemName.toLowerCase().includes(item.toLowerCase())) return false;
      if (brand && !row.brand.toLowerCase().includes(brand.toLowerCase())) return false;

      for (const [k, v] of Object.entries(colFilters)) {
        if (!v.trim()) continue;
        const fieldVal = String((row as any)[k] ?? '').toLowerCase();
        if (!fieldVal.includes(v.toLowerCase().trim())) return false;
      }

      return true;
    });
  }, [itemGroup, item, brand, colFilters]);

  const totalNov = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + r.nov2026, 0);
  }, [filteredRows]);

  const formatQty = (val: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Hidden button for Header 'Generate New Report' click delegation */}
      <button
        type="button"
        id="generate-stock-analytics-btn"
        className="hidden"
        onClick={handleGenerateReport}
      >
        Generate New Report
      </button>

      {/* Top Filter Form (Image 3: 2 Rows of Filters) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs space-y-3">
        {/* Row 1: Item Group, Item, Value/Qty, Brand, Company, Warehouse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <input
              type="text"
              value={itemGroup}
              onChange={(e) => setItemGroup(e.target.value)}
              placeholder="Item Group"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Item"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <div className="relative">
              <select
                value={valueOrQty}
                onChange={(e) => setValueOrQty(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none cursor-pointer pr-6 transition-all"
              >
                <option value="Value">Value</option>
                <option value="Quantity">Quantity</option>
              </select>
              <span className="absolute right-2 top-2 pointer-events-none text-slate-400 text-[10px]">
                ↕
              </span>
            </div>
          </div>

          <div>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Avalon (Demo)"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              placeholder="Warehouse"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Row 2: From Date (red outline when empty), To Date (red outline when empty), Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
          <div>
            <input
              type="text"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="From Date"
              className={`w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md transition-all outline-none ${
                !fromDate.trim()
                  ? 'border border-[#F28B82] dark:border-rose-500/80 ring-1 ring-[#F28B82]/30'
                  : 'border border-transparent focus:border-slate-300'
              }`}
            />
          </div>

          <div>
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="To Date"
              className={`w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md transition-all outline-none ${
                !toDate.trim()
                  ? 'border border-[#F28B82] dark:border-rose-500/80 ring-1 ring-[#F28B82]/30'
                  : 'border border-transparent focus:border-slate-300'
              }`}
            />
          </div>

          <div>
            <div className="relative">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none cursor-pointer pr-6 transition-all"
              >
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
              <span className="absolute right-2 top-2 pointer-events-none text-slate-400 text-[10px]">
                ↕
              </span>
            </div>
          </div>

          {/* Quick Date Range Helper Button if empty */}
          {!hasDateRange && (
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplySampleRange}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#252529] dark:hover:bg-[#2F2F35] text-slate-700 dark:text-zinc-300 rounded-md text-[11px] transition-colors"
              >
                Set Demo Range (13-11-2026 to 27-11-2026)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generation Status Note (Image 3: Red bullet) */}
      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 text-xs px-1">
        <span className="w-2 h-2 rounded-full bg-[#E05238] shrink-0 inline-block"></span>
        <span>This report was generated 1 minute ago.</span>
      </div>

      {/* Content Area */}
      {!hasDateRange ? (
        /* State 1: When Date is not set (Image 3: "Please set filters") */
        <div className="min-h-[360px] flex items-center justify-center bg-transparent">
          <div className="text-slate-500 dark:text-zinc-400 text-xs font-normal">
            Please set filters
          </div>
        </div>
      ) : (
        /* State 2: When Date range is set (Image 4 & 5: Grid with Nov 2026) */
        <div className="space-y-3">
          {/* Timeline Period Header */}
          <div className="text-center text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            Nov 2026
          </div>

          {/* Main Grid Table (Images 4 & 5) */}
          <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-xs overflow-hidden">
            <div className="overflow-x-auto min-h-[380px]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  {/* Row 1: Header Titles */}
                  <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] text-slate-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                    <th className="px-3 py-2 w-10 text-center border-r border-slate-200/60 dark:border-[#27272A]/60">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === SAMPLE_ANALYTICS_ROWS.length}
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 dark:border-zinc-600 text-black focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    <th className="px-3 py-2 w-10 text-center text-slate-400 dark:text-zinc-500 font-normal border-r border-slate-200/60 dark:border-[#27272A]/60"></th>
                    <th className="px-3 py-2 min-w-[140px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item</th>
                    <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Name</th>
                    <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Group</th>
                    <th className="px-3 py-2 min-w-[90px] border-r border-slate-200/60 dark:border-[#27272A]/60">Brand</th>
                    <th className="px-3 py-2 min-w-[70px] border-r border-slate-200/60 dark:border-[#27272A]/60">UOM</th>
                    <th className="px-3 py-2 min-w-[100px] text-right">Nov 2026</th>
                  </tr>

                  {/* Row 2: Secondary Inline Filter Row */}
                  <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B]">
                    <td className="px-2 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
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
                        value={colFilters.itemGroup || ''}
                        onChange={(e) => handleColFilterChange('itemGroup', e.target.value)}
                        className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                      <input
                        type="text"
                        value={colFilters.brand || ''}
                        onChange={(e) => handleColFilterChange('brand', e.target.value)}
                        className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                      />
                    </td>
                    <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                      <input
                        type="text"
                        value={colFilters.uom || ''}
                        onChange={(e) => handleColFilterChange('uom', e.target.value)}
                        className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                      />
                    </td>
                    <td className="px-1.5 py-1.5">
                      <input
                        type="text"
                        value={colFilters.nov2026 || ''}
                        onChange={(e) => handleColFilterChange('nov2026', e.target.value)}
                        className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                      />
                    </td>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] text-slate-700 dark:text-zinc-200 whitespace-nowrap">
                  {filteredRows.map((row, idx) => {
                    const isChecked = selectedIds.includes(row.id);
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-[#1E1E22]/60 transition-colors"
                      >
                        <td className="px-3 py-2 text-center border-r border-slate-100 dark:border-[#27272A]">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRow(row.id)}
                            className="rounded border-slate-300 dark:border-zinc-600 text-black focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2 text-center text-slate-400 dark:text-zinc-500 font-normal border-r border-slate-100 dark:border-[#27272A]">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] font-medium text-slate-800 dark:text-zinc-100">
                          {row.item}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                          {row.itemName}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-400">
                          {row.itemGroup}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-400">
                          {row.brand}
                        </td>
                        <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                          {row.uom}
                        </td>
                        <td className={`px-3 py-2 text-right tabular-nums ${row.nov2026 > 0 ? 'font-semibold text-slate-900 dark:text-white' : ''}`}>
                          {formatQty(row.nov2026)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Total Row (Image 5) */}
                {filteredRows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 dark:border-zinc-700 bg-white dark:bg-[#151518] font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                      <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                      <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60">Total</td>
                      <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                      <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                      <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                      <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatQty(totalNov)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

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

