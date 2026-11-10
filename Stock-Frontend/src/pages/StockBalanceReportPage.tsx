import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface StockBalanceRow {
  id: string;
  item: string;
  itemName: string;
  itemGroup: string;
  warehouse: string;
  stockUom: string;
  balanceQty: number;
  balanceValue: number;
  openingQty: number;
  openingValue: number;
  inQty: number;
  inValue: number;
  outQty: number;
  outValue: number;
  valuationRate: number;
  reservedQty: number;
  company: string;
}

const INITIAL_BALANCE_ROWS: StockBalanceRow[] = [
  {
    id: 'row-1',
    item: 'SKU010: Camera',
    itemName: 'Camera',
    itemGroup: 'Demo Item Group',
    warehouse: 'Mağazalar - AD',
    stockUom: 'Nos',
    balanceQty: 78.0,
    balanceValue: 39000.0,
    openingQty: 78.0,
    openingValue: 39000.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 500.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-2',
    item: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    itemGroup: 'Demo Item Group',
    warehouse: 'Devam Eden İşler - AD',
    stockUom: 'Nos',
    balanceQty: 250.0,
    balanceValue: 105000.0,
    openingQty: 250.0,
    openingValue: 105000.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 420.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-3',
    item: 'SKU007: Television',
    itemName: 'Television',
    itemGroup: 'Demo Item Group',
    warehouse: 'Devam Eden İşler - AD',
    stockUom: 'Nos',
    balanceQty: 190.0,
    balanceValue: 71250.0,
    openingQty: 190.0,
    openingValue: 71250.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 375.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-4',
    item: 'SKU008: Backpack',
    itemName: 'Backpack',
    itemGroup: 'Demo Item Group',
    warehouse: 'Taşıma Hali... - AD',
    stockUom: 'Nos',
    balanceQty: 121.0,
    balanceValue: 40293.0,
    openingQty: 121.0,
    openingValue: 40293.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 333.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-5',
    item: 'SKU005: Sneakers',
    itemName: 'Sneakers',
    itemGroup: 'Demo Item Group',
    warehouse: 'Devam Eden İşler - AD',
    stockUom: 'Nos',
    balanceQty: 32.0,
    balanceValue: 7104.0,
    openingQty: 32.0,
    openingValue: 7104.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 222.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-6',
    item: 'SKU009: Headphones',
    itemName: 'Headphones',
    itemGroup: 'Demo Item Group',
    warehouse: 'Bitmiş Ürünler - AD',
    stockUom: 'Nos',
    balanceQty: 76.0,
    balanceValue: 53200.0,
    openingQty: 76.0,
    openingValue: 53200.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 700.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-7',
    item: 'SKU003: Book',
    itemName: 'Book',
    itemGroup: 'Demo Item Group',
    warehouse: 'Mağazalar - AD',
    stockUom: 'Nos',
    balanceQty: -100.0,
    balanceValue: -52300.0,
    openingQty: -100.0,
    openingValue: -52300.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 523.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-8',
    item: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    itemGroup: 'Demo Item Group',
    warehouse: 'Mağazalar - AD',
    stockUom: 'Nos',
    balanceQty: -100.0,
    balanceValue: -42000.0,
    openingQty: -100.0,
    openingValue: -42000.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 420.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-9',
    item: 'SKU007: Television',
    itemName: 'Television',
    itemGroup: 'Demo Item Group',
    warehouse: 'Mağazalar - AD',
    stockUom: 'Nos',
    balanceQty: -100.0,
    balanceValue: -37500.0,
    openingQty: -100.0,
    openingValue: -37500.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 375.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-10',
    item: 'SKU004: Smartphone',
    itemName: 'Smartphone',
    itemGroup: 'Demo Item Group',
    warehouse: 'Mağazalar - AD',
    stockUom: 'Nos',
    balanceQty: -20.0,
    balanceValue: -14500.0,
    openingQty: -20.0,
    openingValue: -14500.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 725.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-11',
    item: 'SKU008: Backpack',
    itemName: 'Backpack',
    itemGroup: 'Demo Item Group',
    warehouse: 'Devam Eden İşler - AD',
    stockUom: 'Nos',
    balanceQty: -20.0,
    balanceValue: -6660.0,
    openingQty: -20.0,
    openingValue: -6660.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 333.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-12',
    item: 'SKU009: Headphones',
    itemName: 'Headphones',
    itemGroup: 'Demo Item Group',
    warehouse: 'Devam Eden İşler - AD',
    stockUom: 'Nos',
    balanceQty: -40.0,
    balanceValue: -28000.0,
    openingQty: -40.0,
    openingValue: -28000.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 700.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-13',
    item: 'SKU010: Camera',
    itemName: 'Camera',
    itemGroup: 'Demo Item Group',
    warehouse: 'Devam Eden İşler - AD',
    stockUom: 'Nos',
    balanceQty: -50.0,
    balanceValue: -25000.0,
    openingQty: -50.0,
    openingValue: -25000.0,
    inQty: 0.0,
    inValue: 0.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 500.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-14',
    item: 'SKU002: Laptop',
    itemName: 'Laptop',
    itemGroup: 'Demo Item Group',
    warehouse: 'Devam Eden İşler - AD',
    stockUom: 'Nos',
    balanceQty: 10.0,
    balanceValue: 500.0,
    openingQty: 0.0,
    openingValue: 0.0,
    inQty: 10.0,
    inValue: 500.0,
    outQty: 0.0,
    outValue: 0.0,
    valuationRate: 50.0,
    reservedQty: 0.0,
    company: 'Avalon (Demo)',
  },
];

export const StockBalanceReportPage: React.FC = () => {
  const navigate = useNavigate();

  // Top Filter state (matching Image 1)
  const [company, setCompany] = useState('Avalon (Demo)');
  const [fromDate, setFromDate] = useState('11-10-2026');
  const [toDate, setToDate] = useState('11-11-2026');
  const [itemGroup, setItemGroup] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [warehouse, setWarehouse] = useState('');

  const [warehouseType, setWarehouseType] = useState('');
  const [currency, setCurrency] = useState('Currency');
  const [includeUom, setIncludeUom] = useState('');
  const [showAlternateUom, setShowAlternateUom] = useState(false);
  const [showVariantAttributes, setShowVariantAttributes] = useState(false);
  const [showStockAgeing, setShowStockAgeing] = useState(false);

  const [ignoreClosingBalance, setIgnoreClosingBalance] = useState(false);
  const [includeZeroStock, setIncludeZeroStock] = useState(false);
  const [showDimensionWiseStock, setShowDimensionWiseStock] = useState(false);

  // Column inline search filters (Header row 2)
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const [executionTime, setExecutionTime] = useState('0.056143');
  const [isRebuilding, setIsRebuilding] = useState(false);

  const handleColFilterChange = (colKey: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [colKey]: val }));
  };

  const handleRebuild = () => {
    setIsRebuilding(true);
    setTimeout(() => {
      setIsRebuilding(false);
      setExecutionTime((Math.random() * 0.03 + 0.04).toFixed(6));
    }, 500);
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return INITIAL_BALANCE_ROWS.filter((row) => {
      // Global row filters
      if (company && !row.company.toLowerCase().includes(company.toLowerCase())) {
        return false;
      }
      if (warehouse && !row.warehouse.toLowerCase().includes(warehouse.toLowerCase())) {
        return false;
      }
      if (itemFilter) {
        const q = itemFilter.toLowerCase();
        if (
          !row.item.toLowerCase().includes(q) &&
          !row.itemName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (itemGroup && !row.itemGroup.toLowerCase().includes(itemGroup.toLowerCase())) {
        return false;
      }

      // Column inline filters
      for (const [key, searchVal] of Object.entries(colFilters)) {
        if (!searchVal.trim()) continue;
        const val = String((row as any)[key] ?? '').toLowerCase();
        if (!val.includes(searchVal.toLowerCase().trim())) {
          return false;
        }
      }

      return true;
    });
  }, [company, warehouse, itemFilter, itemGroup, colFilters]);

  // Totals calculation
  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, r) => {
        acc.balanceQty += r.balanceQty;
        acc.balanceValue += r.balanceValue;
        acc.openingQty += r.openingQty;
        acc.openingValue += r.openingValue;
        acc.inQty += r.inQty;
        acc.inValue += r.inValue;
        acc.outQty += r.outQty;
        acc.outValue += r.outValue;
        acc.valuationRate += r.valuationRate;
        acc.reservedQty += r.reservedQty;
        return acc;
      },
      {
        balanceQty: 0,
        balanceValue: 0,
        openingQty: 0,
        openingValue: 0,
        inQty: 0,
        inValue: 0,
        outQty: 0,
        outValue: 0,
        valuationRate: 0,
        reservedQty: 0,
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

  const formatCurrency = (val: number) => {
    const isNegative = val < 0;
    const absFormatted = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return isNegative ? `$-${absFormatted}` : `$ ${absFormatted}`;
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Hidden button for Header 'Rebuild' click delegation */}
      <button
        type="button"
        id="rebuild-stock-balance-btn"
        className="hidden"
        onClick={handleRebuild}
      >
        Rebuild
      </button>

      {/* Top Filter Form (Image 1: 3 Rows of Filters) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs space-y-3">
        {/* Row 1: Company, From Date, To Date, Item Group, Items, Warehouses */}
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
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="11-10-2026"
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
              value={itemGroup}
              onChange={(e) => setItemGroup(e.target.value)}
              placeholder="Item Group"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={itemFilter}
              onChange={(e) => setItemFilter(e.target.value)}
              placeholder="Items"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              placeholder="Warehouses"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Row 2: Warehouse Type, Currency, Include UOM, Show Alternate UOM Balance, Show Variant Attributes, Show Stock Ageing Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-center">
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
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full appearance-none bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none cursor-pointer pr-6 transition-all"
              >
                <option value="Currency">Currency</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="AZN">AZN (₼)</option>
              </select>
              <span className="absolute right-2 top-2 pointer-events-none text-slate-400 text-[10px]">
                ↕
              </span>
            </div>
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

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAlternateUom}
              onChange={(e) => setShowAlternateUom(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-zinc-200 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="truncate">Show Alternate UOM Balance</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showVariantAttributes}
              onChange={(e) => setShowVariantAttributes(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-zinc-200 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="truncate">Show Variant Attributes</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showStockAgeing}
              onChange={(e) => setShowStockAgeing(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-zinc-200 focus:ring-0 w-3.5 h-3.5"
            />
            <span className="truncate">Show Stock Ageing Data</span>
          </label>
        </div>

        {/* Row 3: Ignore Closing Balance, Include Zero Stock Items, Show Dimension Wise Stock */}
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={ignoreClosingBalance}
              onChange={(e) => setIgnoreClosingBalance(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-zinc-200 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Ignore Closing Balance</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeZeroStock}
              onChange={(e) => setIncludeZeroStock(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-zinc-200 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Include Zero Stock Items</span>
          </label>

          <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDimensionWiseStock}
              onChange={(e) => setShowDimensionWiseStock(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-600 text-slate-900 dark:text-zinc-200 focus:ring-0 w-3.5 h-3.5"
            />
            <span>Show Dimension Wise Stock</span>
          </label>
        </div>
      </div>

      {/* Generation Status Note (Image 1 & 2: Red bullet) */}
      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 text-xs px-1">
        <span className="w-2 h-2 rounded-full bg-[#E05238] shrink-0 inline-block"></span>
        <span>This report was generated 17 minutes ago.</span>
      </div>

      {/* Main Grid Table (Image 1, 2, 3: Query Report Grid) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Row 1: Column Titles */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] text-slate-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                <th className="px-3 py-2 w-10 text-center text-slate-400 dark:text-zinc-500 font-normal border-r border-slate-200/60 dark:border-[#27272A]/60">
                  {/* Empty for row number */}
                </th>
                <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Item
                </th>
                <th className="px-3 py-2 min-w-[120px] border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Item Name
                </th>
                <th className="px-3 py-2 min-w-[110px] border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Item Group
                </th>
                <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Warehouse
                </th>
                <th className="px-3 py-2 min-w-[90px] border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Stock U...
                </th>
                <th className="px-3 py-2 min-w-[100px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Balance ...
                </th>
                <th className="px-3 py-2 min-w-[110px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Balance ...
                </th>
                <th className="px-3 py-2 min-w-[100px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Opening ...
                </th>
                <th className="px-3 py-2 min-w-[110px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Opening V...
                </th>
                <th className="px-3 py-2 min-w-[80px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  In Qty
                </th>
                <th className="px-3 py-2 min-w-[80px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  In Value
                </th>
                <th className="px-3 py-2 min-w-[80px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Out Qty
                </th>
                <th className="px-3 py-2 min-w-[80px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Out Value
                </th>
                <th className="px-3 py-2 min-w-[100px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Valuatio...
                </th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">
                  Reserv...
                </th>
                <th className="px-3 py-2 min-w-[120px]">
                  Company
                </th>
              </tr>

              {/* Row 2: Secondary Header with Rounded Filter Inputs (Image 1, 2) */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B]">
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
                    value={colFilters.warehouse || ''}
                    onChange={(e) => handleColFilterChange('warehouse', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.stockUom || ''}
                    onChange={(e) => handleColFilterChange('stockUom', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.balanceQty || ''}
                    onChange={(e) => handleColFilterChange('balanceQty', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.balanceValue || ''}
                    onChange={(e) => handleColFilterChange('balanceValue', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.openingQty || ''}
                    onChange={(e) => handleColFilterChange('openingQty', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.openingValue || ''}
                    onChange={(e) => handleColFilterChange('openingValue', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.inQty || ''}
                    onChange={(e) => handleColFilterChange('inQty', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.inValue || ''}
                    onChange={(e) => handleColFilterChange('inValue', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.outQty || ''}
                    onChange={(e) => handleColFilterChange('outQty', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.outValue || ''}
                    onChange={(e) => handleColFilterChange('outValue', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.valuationRate || ''}
                    onChange={(e) => handleColFilterChange('valuationRate', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.reservedQty || ''}
                    onChange={(e) => handleColFilterChange('reservedQty', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5">
                  <input
                    type="text"
                    value={colFilters.company || ''}
                    onChange={(e) => handleColFilterChange('company', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
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
                    <span title={row.item}>
                      {row.item.length > 14 ? `${row.item.slice(0, 12)}...` : row.item}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                    {row.itemName}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-500 dark:text-zinc-400">
                    <span title={row.itemGroup}>Demo Item ...</span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-300">
                    <span title={row.warehouse}>
                      {row.warehouse.includes('Mağazalar')
                        ? 'Mağazalar ...'
                        : row.warehouse.includes('Devam')
                        ? 'Devam Ede...'
                        : row.warehouse.includes('Taşıma')
                        ? 'Taşıma Hali...'
                        : row.warehouse.includes('Bitmiş')
                        ? 'Bitmiş Ürü...'
                        : row.warehouse}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                    {row.stockUom}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums font-medium">
                    {formatQty(row.balanceQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatCurrency(row.balanceValue)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.openingQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatCurrency(row.openingValue)}
                  </td>
                  <td className={`px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums ${row.inQty > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                    {formatQty(row.inQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.inValue)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.outQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.outValue)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatCurrency(row.valuationRate)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatQty(row.reservedQty)}
                  </td>
                  <td className="px-3 py-2 text-slate-500 dark:text-zinc-400">
                    <span title={row.company}>Avalon (De...</span>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={17} className="px-4 py-8 text-center text-slate-400 dark:text-zinc-500">
                    No records found matching filters
                  </td>
                </tr>
              )}
            </tbody>

            {/* Total Row matching Image 2 & 3 */}
            {filteredRows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-300 dark:border-zinc-700 bg-white dark:bg-[#151518] font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60">
                    Total
                  </td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.balanceQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatCurrency(totals.balanceValue)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.openingQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatCurrency(totals.openingValue)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatQty(totals.inQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.inValue)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.outQty)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.outValue)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatCurrency(totals.valuationRate)}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-200/60 dark:border-[#27272A]/60 tabular-nums">
                    {formatQty(totals.reservedQty)}
                  </td>
                  <td className="px-3 py-2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Footer Instructions and Dynamic Execution Time (matching Image 2 & 3) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 gap-2 px-1">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div>
          Execution Time: {executionTime} sec
        </div>
      </div>
    </div>
  );
};

