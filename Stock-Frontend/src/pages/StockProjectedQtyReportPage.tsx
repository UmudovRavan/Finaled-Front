import React, { useState, useMemo } from 'react';

interface ProjectedQtyRow {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  itemGroup: string;
  brand: string;
  warehouse: string;
  uom: string;
  actualQty: number;
  plannedQty: number;
  requestedQty: number;
  orderedQty: number;
  reservedQtyForProd: number;
  reservedQtyForSub: number;
  reservedQtyForSales: number;
  reservedQtyForWorkOrder: number;
  reservedQty: number;
  reservedOther: number;
  projectedQty: number;
  reorderLevel: number;
  reorderQty: number;
  shortageQty: number;
}

const INITIAL_PROJECTED_ROWS: ProjectedQtyRow[] = [
  {
    id: 'row-1',
    itemCode: 'SKU001: T-shirt',
    itemName: 'T-shirt',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    uom: 'Nos',
    actualQty: -25.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 100.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 75.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-2',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Bitmiş Ürünler - AD',
    uom: 'Nos',
    actualQty: 0.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 50.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 50.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-3',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    uom: 'Nos',
    actualQty: -5.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: -5.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-4',
    itemCode: 'SKU003: Book',
    itemName: 'Book',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Mağazalar - AD',
    uom: 'Nos',
    actualQty: -100.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 200.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 100.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-5',
    itemCode: 'SKU004: Smartphone',
    itemName: 'Smartphone',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Mağazalar - AD',
    uom: 'Nos',
    actualQty: -20.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 60.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 40.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-6',
    itemCode: 'SKU005: Sneakers',
    itemName: 'Sneakers',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    uom: 'Nos',
    actualQty: 32.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 32.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-7',
    itemCode: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    uom: 'Nos',
    actualQty: 250.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 250.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-8',
    itemCode: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Mağazalar - AD',
    uom: 'Nos',
    actualQty: -100.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: -100.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-9',
    itemCode: 'SKU007: Television',
    itemName: 'Television',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    uom: 'Nos',
    actualQty: 190.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 190.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-10',
    itemCode: 'SKU007: Television',
    itemName: 'Television',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Mağazalar - AD',
    uom: 'Nos',
    actualQty: -100.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: -100.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-11',
    itemCode: 'SKU008: Backpack',
    itemName: 'Backpack',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    uom: 'Nos',
    actualQty: -20.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: -20.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-12',
    itemCode: 'SKU008: Backpack',
    itemName: 'Backpack',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Taşıma Halindeki Mallar - AD',
    uom: 'Nos',
    actualQty: 121.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 121.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-13',
    itemCode: 'SKU009: Headphones',
    itemName: 'Headphones',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Bitmiş Ürünler - AD',
    uom: 'Nos',
    actualQty: 76.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: 76.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-14',
    itemCode: 'SKU009: Headphones',
    itemName: 'Headphones',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    uom: 'Nos',
    actualQty: -40.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: -40.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
  {
    id: 'row-15',
    itemCode: 'SKU010: Camera',
    itemName: 'Camera',
    description: '',
    itemGroup: 'Demo Item Group',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    uom: 'Nos',
    actualQty: -50.0,
    plannedQty: 0.0,
    requestedQty: 0.0,
    orderedQty: 0.0,
    reservedQtyForProd: 0.0,
    reservedQtyForSub: 0.0,
    reservedQtyForSales: 0.0,
    reservedQtyForWorkOrder: 0.0,
    reservedQty: 0.0,
    reservedOther: 0.0,
    projectedQty: -50.0,
    reorderLevel: 0.0,
    reorderQty: 0.0,
    shortageQty: 0.0,
  },
];

export const StockProjectedQtyReportPage: React.FC = () => {
  const [company, setCompany] = useState('Avalon (Demo)');
  const [warehouse, setWarehouse] = useState('');
  const [item, setItem] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [brand, setBrand] = useState('');
  const [includeUom, setIncludeUom] = useState('');

  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [executionTime, setExecutionTime] = useState('0.041285');

  const handleColFilterChange = (colKey: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [colKey]: val }));
  };

  const handleGenerateReport = () => {
    setExecutionTime((Math.random() * 0.02 + 0.03).toFixed(6));
  };

  const filteredRows = useMemo(() => {
    return INITIAL_PROJECTED_ROWS.filter((row) => {
      if (warehouse && !row.warehouse.toLowerCase().includes(warehouse.toLowerCase())) return false;
      if (item && !row.itemCode.toLowerCase().includes(item.toLowerCase()) && !row.itemName.toLowerCase().includes(item.toLowerCase())) return false;
      if (itemGroup && !row.itemGroup.toLowerCase().includes(itemGroup.toLowerCase())) return false;
      if (brand && !row.brand.toLowerCase().includes(brand.toLowerCase())) return false;

      for (const [k, v] of Object.entries(colFilters)) {
        if (!v.trim()) continue;
        const fieldVal = String((row as any)[k] ?? '').toLowerCase();
        if (!fieldVal.includes(v.toLowerCase().trim())) return false;
      }

      return true;
    });
  }, [warehouse, item, itemGroup, brand, colFilters]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        acc.actualQty += r.actualQty;
        acc.plannedQty += r.plannedQty;
        acc.requestedQty += r.requestedQty;
        acc.orderedQty += r.orderedQty;
        acc.projectedQty += r.projectedQty;
        return acc;
      },
      {
        actualQty: 0,
        plannedQty: 0,
        requestedQty: 0,
        orderedQty: 0,
        projectedQty: 0,
      }
    );
  }, [filteredRows]);

  const formatQty = (val: number) => {
    const isNegative = val < 0;
    const absStr = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    return isNegative ? `-${absStr}` : absStr;
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Hidden button for header Generate Report delegation */}
      <button
        type="button"
        id="generate-stock-projected-btn"
        className="hidden"
        onClick={handleGenerateReport}
      >
        Generate New Report
      </button>

      {/* Top Filter Form (Image 1: 1 Row of 6 inputs) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs">
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
              value={itemGroup}
              onChange={(e) => setItemGroup(e.target.value)}
              placeholder="Item Group"
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

          <div>
            <input
              type="text"
              value={includeUom}
              onChange={(e) => setIncludeUom(e.target.value)}
              placeholder="Include UOM"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Grid Table (Images 1 & 2) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Row 1: Header Titles */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] text-slate-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                <th className="px-3 py-2 w-10 text-center text-slate-400 dark:text-zinc-500 font-normal border-r border-slate-200/60 dark:border-[#27272A]/60"></th>
                <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Code</th>
                <th className="px-3 py-2 min-w-[120px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Name</th>
                <th className="px-3 py-2 min-w-[100px] border-r border-slate-200/60 dark:border-[#27272A]/60">Description</th>
                <th className="px-3 py-2 min-w-[110px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Group</th>
                <th className="px-3 py-2 min-w-[90px] border-r border-slate-200/60 dark:border-[#27272A]/60">Brand</th>
                <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">Warehouse</th>
                <th className="px-3 py-2 min-w-[70px] border-r border-slate-200/60 dark:border-[#27272A]/60">UOM</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Actual Qty</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Planned ...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Requested ...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Ordered ...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Reserved...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Reserved...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Reserved...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Reserved...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Reserved...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Reserved...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Projected...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Reorder L...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Reorder ...</th>
                <th className="px-3 py-2 min-w-[90px] text-right">Shortage ...</th>
              </tr>

              {/* Row 2: Secondary Inline Filter Row */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B]">
                <td className="px-2 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                {['itemCode', 'itemName', 'description', 'itemGroup', 'brand', 'warehouse', 'uom', 'actualQty', 'plannedQty', 'requestedQty', 'orderedQty', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'projectedQty', 'reorderLevel', 'reorderQty', 'shortageQty'].map((col) => (
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
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-300">
                    <span title={row.warehouse}>
                      {row.warehouse.includes('Devam')
                        ? 'Devam Eden İ...'
                        : row.warehouse.includes('Bitmiş')
                        ? 'Bitmiş Ürünler...'
                        : row.warehouse.includes('Taşıma')
                        ? 'Taşıma Halind...'
                        : row.warehouse}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                    {row.uom}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums font-medium">
                    {formatQty(row.actualQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.plannedQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.requestedQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums font-medium">
                    {formatQty(row.orderedQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    0.000
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    0.000
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    0.000
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    0.000
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    0.000
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    0.000
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums font-semibold">
                    {formatQty(row.projectedQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.reorderLevel)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.reorderQty)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatQty(row.shortageQty)}
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={22} className="px-4 py-8 text-center text-slate-400 dark:text-zinc-500">
                    No records found matching filters
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Row (Image 1 & 2) */}
            {filteredRows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 dark:border-zinc-700 bg-white dark:bg-[#151518] font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60">Total</td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.actualQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.plannedQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.requestedQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.orderedQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">0.000</td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">0.000</td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">0.000</td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">0.000</td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">0.000</td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">0.000</td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.projectedQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">0.000</td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">0.000</td>
                  <td className="px-3 py-2 text-right tabular-nums">0.000</td>
                </tr>
              </tfoot>
            )}
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

