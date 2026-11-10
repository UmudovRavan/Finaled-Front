import React, { useState, useMemo } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface StockAgeingRow {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  itemGroup: string;
  brand: string;
  availableQty: number;
  averageRate: number;
  age0_30: number;
  val0_30: number;
  age31_60: number;
  val31_60: number;
  age61_90: number;
  val61_90: number;
  age91_above: number;
  val91_above: number;
  earliest: number;
  latest: number;
  uom: string;
}

const INITIAL_AGEING_ROWS: StockAgeingRow[] = [
  {
    id: 'row-1',
    itemCode: 'SKU010: Camera',
    itemName: 'Camera',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: 28.0,
    averageRate: 700.29,
    age0_30: 0.0,
    val0_30: 0.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: 28.0,
    val91_above: 14000.0,
    earliest: 311,
    latest: 93,
    uom: 'Nos',
  },
  {
    id: 'row-2',
    itemCode: 'SKU009: Headphones',
    itemName: 'Headphones',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: 36.0,
    averageRate: 511.0,
    age0_30: 0.0,
    val0_30: 0.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: 36.0,
    val91_above: 25200.0,
    earliest: 291,
    latest: 93,
    uom: 'Nos',
  },
  {
    id: 'row-3',
    itemCode: 'SKU007: Television',
    itemName: 'Television',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: 90.0,
    averageRate: 462.89,
    age0_30: 0.0,
    val0_30: 0.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: 90.0,
    val91_above: 33750.0,
    earliest: 304,
    latest: 161,
    uom: 'Nos',
  },
  {
    id: 'row-4',
    itemCode: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: 150.0,
    averageRate: 406.0,
    age0_30: 0.0,
    val0_30: 0.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: 150.0,
    val91_above: 63000.0,
    earliest: 308,
    latest: 161,
    uom: 'Nos',
  },
  {
    id: 'row-5',
    itemCode: 'SKU008: Backpack',
    itemName: 'Backpack',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: 101.0,
    averageRate: 339.79,
    age0_30: 0.0,
    val0_30: 0.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: 101.0,
    val91_above: 33633.0,
    earliest: 299,
    latest: 93,
    uom: 'Nos',
  },
  {
    id: 'row-6',
    itemCode: 'SKU005: Sneakers',
    itemName: 'Sneakers',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: 32.0,
    averageRate: 296.0,
    age0_30: 0.0,
    val0_30: 0.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: 32.0,
    val91_above: 7104.0,
    earliest: 296,
    latest: 296,
    uom: 'Nos',
  },
  {
    id: 'row-7',
    itemCode: 'SKU003: Book',
    itemName: 'Book',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: -100.0,
    averageRate: 161.0,
    age0_30: 0.0,
    val0_30: 0.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: -100.0,
    val91_above: -52300.0,
    earliest: 161,
    latest: 161,
    uom: 'Nos',
  },
  {
    id: 'row-8',
    itemCode: 'SKU004: Smartphone',
    itemName: 'Smartphone',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: -20.0,
    averageRate: 97.0,
    age0_30: 0.0,
    val0_30: 0.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: -20.0,
    val91_above: -14500.0,
    earliest: 97,
    latest: 97,
    uom: 'Nos',
  },
  {
    id: 'row-9',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    availableQty: 10.0,
    averageRate: 10.0,
    age0_30: 10.0,
    val0_30: 500.0,
    age31_60: 0.0,
    val31_60: 0.0,
    age61_90: 0.0,
    val61_90: 0.0,
    age91_above: 0.0,
    val91_above: 0.0,
    earliest: 10,
    latest: 10,
    uom: 'Nos',
  },
];

export const StockAgeingReportPage: React.FC = () => {
  const [company, setCompany] = useState('Avalon (Demo)');
  const [toDate, setToDate] = useState('11-11-2026');
  const [warehouseType, setWarehouseType] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [item, setItem] = useState('');
  const [brand, setBrand] = useState('');

  const [range, setRange] = useState('30, 60, 90');
  const [showWarehouseWise, setShowWarehouseWise] = useState(false);

  const [showToast, setShowToast] = useState(true);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [executionTime, setExecutionTime] = useState('0.011574');

  const handleColFilterChange = (colKey: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [colKey]: val }));
  };

  const handleGenerateReport = () => {
    setShowToast(true);
    setExecutionTime((Math.random() * 0.01 + 0.01).toFixed(6));
  };

  const filteredRows = useMemo(() => {
    return INITIAL_AGEING_ROWS.filter((row) => {
      if (item && !row.itemCode.toLowerCase().includes(item.toLowerCase()) && !row.itemName.toLowerCase().includes(item.toLowerCase())) return false;
      if (brand && !row.brand.toLowerCase().includes(brand.toLowerCase())) return false;

      for (const [k, v] of Object.entries(colFilters)) {
        if (!v.trim()) continue;
        const val = String((row as any)[k] ?? '').toLowerCase();
        if (!val.includes(v.toLowerCase().trim())) return false;
      }
      return true;
    });
  }, [item, brand, colFilters]);

  const formatQty = (val: number) => {
    const isNeg = val < 0;
    const abs = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    return isNeg ? `-${abs}` : abs;
  };

  const chartItems = [
    { label: 'SKU010', value: 700.29 },
    { label: 'SKU009', value: 511.0 },
    { label: 'SKU007', value: 462.89 },
    { label: 'SKU006', value: 406.0 },
    { label: 'SKU008', value: 339.79 },
    { label: 'SKU005', value: 296.0 },
    { label: 'SKU003', value: 161.0 },
    { label: 'SKU004', value: 97.0 },
    { label: 'SKU002', value: 10.0 },
  ];

  return (
    <div className="font-sans text-xs pb-16 space-y-4 relative">
      {/* Hidden button for Header 'Generate New Report' click delegation */}
      <button
        type="button"
        id="generate-stock-ageing-btn"
        className="hidden"
        onClick={handleGenerateReport}
      >
        Generate New Report
      </button>

      {/* Top Filter Form (Images 1 & 2: 2 rows of filters) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs space-y-3">
        {/* Row 1: Company, To Date, Warehouse Type, Warehouse, Item, Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="11-11-2026"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={warehouseType}
              onChange={(e) => setWarehouseType(e.target.value)}
              placeholder="Warehouse Type"
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
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Row 2: Range, Show Warehouse-wise Stock */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-36">
            <input
              type="text"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="30, 60, 90"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showWarehouseWise}
              onChange={(e) => setShowWarehouseWise(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-zinc-200 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Show Warehouse-wise Stock</span>
          </label>
        </div>
      </div>

      {/* Pink Bar Chart (Images 1, 2, 3) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs">
        <div className="h-44 sm:h-52 flex items-end justify-between pt-6 px-4 sm:px-12 relative border-b border-slate-200/60 dark:border-[#27272A]/60 pb-6">
          {/* Y Axis Guide lines */}
          <div className="absolute left-2 top-2 text-[10px] text-slate-400 tabular-nums">800.00</div>
          <div className="absolute left-2 top-1/4 text-[10px] text-slate-400 tabular-nums">600.00</div>
          <div className="absolute left-2 top-2/4 text-[10px] text-slate-400 tabular-nums">400.00</div>
          <div className="absolute left-2 top-3/4 text-[10px] text-slate-400 tabular-nums">200.00</div>

          {/* Background grid lines */}
          <div className="absolute inset-x-12 top-4 border-b border-dashed border-slate-100 dark:border-zinc-800 pointer-events-none" />
          <div className="absolute inset-x-12 top-1/4 border-b border-dashed border-slate-100 dark:border-zinc-800 pointer-events-none" />
          <div className="absolute inset-x-12 top-2/4 border-b border-dashed border-slate-100 dark:border-zinc-800 pointer-events-none" />
          <div className="absolute inset-x-12 top-3/4 border-b border-dashed border-slate-100 dark:border-zinc-800 pointer-events-none" />

          {/* Pink Bars */}
          {chartItems.map((item) => {
            const heightPercent = Math.max(3, (item.value / 800) * 100);
            return (
              <div key={item.label} className="flex flex-col items-center flex-1 max-w-[64px] h-full justify-end group z-10">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-10 sm:w-12 bg-[#F67599] hover:bg-[#F45884] dark:bg-[#F67599] transition-all rounded-xs shadow-xs relative cursor-pointer"
                  title={`${item.label}: ${item.value}`}
                />
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-2 font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
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
                <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Code</th>
                <th className="px-3 py-2 min-w-[120px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Name</th>
                <th className="px-3 py-2 min-w-[100px] border-r border-slate-200/60 dark:border-[#27272A]/60">Description</th>
                <th className="px-3 py-2 min-w-[110px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Group</th>
                <th className="px-3 py-2 min-w-[80px] border-r border-slate-200/60 dark:border-[#27272A]/60">Brand</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Available ...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Average ...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Age (0 - 30)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Value (0 - 30)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Age (31 - 60)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Value (31 - 60)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Age (61 - 90)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Value (61 - 90)</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Age (91 - Above)</th>
                <th className="px-3 py-2 min-w-[100px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Value (91 - Abo...</th>
                <th className="px-3 py-2 min-w-[70px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Earliest</th>
                <th className="px-3 py-2 min-w-[70px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Latest</th>
                <th className="px-3 py-2 min-w-[60px]">UOM</th>
              </tr>

              {/* Row 2: Secondary Inline Filter Row */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B]">
                <td className="px-2 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                {['itemCode', 'itemName', 'description', 'itemGroup', 'brand', 'availableQty', 'averageRate', 'age0_30', 'val0_30', 'age31_60', 'val31_60', 'age61_90', 'val61_90', 'age91_above', 'val91_above', 'earliest', 'latest', 'uom'].map((col) => (
                  <td key={col} className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60 last:border-r-0">
                    <input
                      type="text"
                      value={colFilters[col] || ''}
                      onChange={(e) => handleColFilterChange(col, e.target.value)}
                      className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                    />
                  </td>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] text-slate-700 dark:text-zinc-200 whitespace-nowrap">
              {filteredRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-[#1E1E22]/60 transition-colors"
                >
                  <td className="px-3 py-2 text-center text-slate-400 dark:text-zinc-500 font-normal border-r border-slate-100 dark:border-[#27272A]">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] font-medium text-slate-800 dark:text-zinc-100">
                    <span title={row.itemCode}>
                      {row.itemCode.length > 15 ? `${row.itemCode.slice(0, 13)}...` : row.itemCode}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                    {row.itemName}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-400">
                    {row.description}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-500 dark:text-zinc-400">
                    Demo Item ...
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-400">
                    {row.brand}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums font-medium">
                    {formatQty(row.availableQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {row.averageRate.toFixed(3)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.age0_30)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.val0_30)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.age31_60)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.val31_60)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.age61_90)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.val61_90)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.age91_above)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums font-medium">
                    {formatQty(row.val91_above)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {row.earliest}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {row.latest}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-zinc-300">
                    {row.uom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bottom Toast Notification (Image 1) */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#FFF9E6] dark:bg-[#2A2415] border border-[#FFE8A3] dark:border-[#4B3F1B] text-[#8C6D1F] dark:text-[#E6C665] text-xs px-3.5 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <AlertTriangle className="w-4 h-4 text-[#C28C1A] shrink-0" />
          <span>Report initiated, click to view status</span>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
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

