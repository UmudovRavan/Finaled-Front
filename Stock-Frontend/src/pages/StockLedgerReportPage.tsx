import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RotateCw,
  MoreHorizontal,
  ChevronsUpDown,
  Check,
  ChevronDown,
} from 'lucide-react';

interface StockLedgerRow {
  id: string;
  date: string;
  item: string;
  itemName: string;
  stockUom: string;
  apiRequestLog: string;
  inQty: number;
  outQty: number;
  balanceQty: number;
  warehouse: string;
  itemGroup: string;
  brand: string;
  description: string;
  incomingRate: number;
  avgRate: number;
  outgoingRate: number;
  balanceValue: number;
  valueChange: number;
  voucherType: string;
  voucherNo: string;
  project: string;
  company: string;
}

const INITIAL_LEDGER_ROWS: StockLedgerRow[] = [
  {
    id: 'row-1',
    date: '01-11-2026 23:14:02',
    item: 'SKU002: Laptop',
    itemName: 'Laptop',
    stockUom: 'Nos',
    apiRequestLog: '',
    inQty: 10.0,
    outQty: 0.0,
    balanceQty: 10.0,
    warehouse: 'Devam Eden İşler - AD',
    itemGroup: 'Demo Item Group',
    brand: '',
    description: '',
    incomingRate: 50.0,
    avgRate: 50.0,
    outgoingRate: 0.0,
    balanceValue: 500.0,
    valueChange: 500.0,
    voucherType: 'Stock Entry',
    voucherNo: 'MAT-STE-2026-00001',
    project: '',
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-2',
    date: '02-11-2026 10:20:15',
    item: 'SKU001: Headset Pro',
    itemName: 'Wireless Headset Pro',
    stockUom: 'Nos',
    apiRequestLog: '',
    inQty: 25.0,
    outQty: 0.0,
    balanceQty: 25.0,
    warehouse: 'Mərkəzi Baş Anbar',
    itemGroup: 'Products',
    brand: '',
    description: '',
    incomingRate: 120.0,
    avgRate: 120.0,
    outgoingRate: 0.0,
    balanceValue: 3000.0,
    valueChange: 3000.0,
    voucherType: 'Purchase Receipt',
    voucherNo: 'MAT-PRE-2026-00001',
    project: '',
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-3',
    date: '03-11-2026 15:30:00',
    item: 'SKU001: Headset Pro',
    itemName: 'Wireless Headset Pro',
    stockUom: 'Nos',
    apiRequestLog: '',
    inQty: 0.0,
    outQty: 5.0,
    balanceQty: 20.0,
    warehouse: 'Mərkəzi Baş Anbar',
    itemGroup: 'Products',
    brand: '',
    description: '',
    incomingRate: 0.0,
    avgRate: 120.0,
    outgoingRate: 120.0,
    balanceValue: 2400.0,
    valueChange: -600.0,
    voucherType: 'Delivery Note',
    voucherNo: 'MAT-DN-2026-00001',
    project: '',
    company: 'Avalon (Demo)',
  },
  {
    id: 'row-4',
    date: '04-11-2026 09:45:00',
    item: 'SKU003: Ultra Monitor',
    itemName: 'Ultra HD Monitor 27"',
    stockUom: 'Nos',
    apiRequestLog: '',
    inQty: 15.0,
    outQty: 0.0,
    balanceQty: 15.0,
    warehouse: 'Sumqayıt Logistika Mərkəzi',
    itemGroup: 'Monitors',
    brand: '',
    description: '',
    incomingRate: 450.0,
    avgRate: 450.0,
    outgoingRate: 0.0,
    balanceValue: 6750.0,
    valueChange: 6750.0,
    voucherType: 'Purchase Receipt',
    voucherNo: 'MAT-PRE-2026-00002',
    project: '',
    company: 'Avalon (Demo)',
  },
];

export const StockLedgerReportPage: React.FC = () => {
  const navigate = useNavigate();

  // Top Filter state (matching Image 1 & 2)
  const [company, setCompany] = useState('Avalon (Demo)');
  const [fromDate, setFromDate] = useState('11-10-2026');
  const [toDate, setToDate] = useState('11-11-2026');
  const [warehouse, setWarehouse] = useState('');
  const [itemFilter, setItemFilter] = useState('');
  const [itemGroup, setItemGroup] = useState('');

  const [batchNo, setBatchNo] = useState('');
  const [brand, setBrand] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [project, setProject] = useState('');
  const [apiRequestLog, setApiRequestLog] = useState('');
  const [includeUom, setIncludeUom] = useState('');

  const [currency, setCurrency] = useState('Currency');
  const [enableSerialBatch, setEnableSerialBatch] = useState(false);

  // Column inline search filters (Header row 2)
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const [executionTime, setExecutionTime] = useState('0.006406');
  const [isRebuilding, setIsRebuilding] = useState(false);

  const handleColFilterChange = (colKey: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [colKey]: val }));
  };

  const handleRebuild = () => {
    setIsRebuilding(true);
    setTimeout(() => {
      setIsRebuilding(false);
      setExecutionTime((Math.random() * 0.01 + 0.004).toFixed(6));
    }, 500);
  };

  // Filtered rows
  const filteredRows = useMemo(() => {
    return INITIAL_LEDGER_ROWS.filter((row) => {
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
      if (brand && !row.brand.toLowerCase().includes(brand.toLowerCase())) {
        return false;
      }
      if (voucherNo && !row.voucherNo.toLowerCase().includes(voucherNo.toLowerCase())) {
        return false;
      }
      if (project && !row.project.toLowerCase().includes(project.toLowerCase())) {
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
  }, [
    company,
    warehouse,
    itemFilter,
    itemGroup,
    brand,
    voucherNo,
    project,
    colFilters,
  ]);

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Hidden button for Header 'Rebuild' click delegation if needed */}
      <button
        type="button"
        id="rebuild-stock-ledger-btn"
        className="hidden"
        onClick={handleRebuild}
      >
        Rebuild
      </button>

      {/* Top Filter Form (Image 1 & 2: 3 Rows of Filters) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs space-y-3">
        {/* Row 1: Company, From Date, To Date, Warehouses, Items, Item Group */}
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
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              placeholder="Warehouses"
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
              value={itemGroup}
              onChange={(e) => setItemGroup(e.target.value)}
              placeholder="Item Group"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>
        </div>

        {/* Row 2: Batch No, Brand, Voucher #, Project, API Request Log, Include UOM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              placeholder="Batch No"
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
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              placeholder="Voucher #"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Project"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              value={apiRequestLog}
              onChange={(e) => setApiRequestLog(e.target.value)}
              placeholder="API Request Log"
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

        {/* Row 3: Currency ↕, Enable Serial / Batch Bundle */}
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <div className="w-48">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all cursor-pointer"
            >
              <option value="Currency">Currency</option>
              <option value="USD">USD ($)</option>
              <option value="AZN">AZN (₼)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableSerialBatch}
                onChange={(e) => setEnableSerialBatch(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
              />
              <span className="text-slate-700 dark:text-zinc-300 text-xs">
                Enable Serial / Batch Bundle
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Report Table (Image 1 & 2: Responsive Scrollable Frappe Grid) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[1900px]">
            <thead>
              {/* Row 1: Column Headers */}
              <tr className="bg-[#F8F9FA] dark:bg-[#1A1A1E] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A]">
                <th className="py-2 px-3 w-10 text-center font-medium border-r border-slate-200/60 dark:border-[#27272A]">
                  &nbsp;
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[140px]">
                  Date
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[130px]">
                  Item
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[120px]">
                  Item Name
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[90px]">
                  Stock UOM
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[120px]">
                  API Request Log
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] text-right min-w-[90px]">
                  In Qty
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] text-right min-w-[90px]">
                  Out Qty
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] text-right min-w-[100px]">
                  Balance Qty
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[160px]">
                  Warehouse
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[130px]">
                  Item Group
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[90px]">
                  Brand
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[110px]">
                  Description
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] text-right min-w-[110px]">
                  Incoming Rate
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] text-right min-w-[140px]">
                  Avg Rate (Balance Stock)
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] text-right min-w-[110px]">
                  Outgoing Rate
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] text-right min-w-[110px]">
                  Balance Value
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] text-right min-w-[110px]">
                  Value Change
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[120px]">
                  Voucher Type
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[140px]">
                  Voucher #
                </th>
                <th className="py-2 px-3 font-medium border-r border-slate-200/60 dark:border-[#27272A] min-w-[90px]">
                  Project
                </th>
                <th className="py-2 px-3 font-medium min-w-[120px]">Company</th>
              </tr>

              {/* Row 2: Frappe Inline Column Filter Inputs (the rounded light pills seen in screenshot) */}
              <tr className="bg-[#F8F9FA] dark:bg-[#1A1A1E] border-b border-slate-200 dark:border-[#27272A]">
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A] text-center font-normal">
                  &nbsp;
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.date ?? ''}
                    onChange={(e) => handleColFilterChange('date', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.item ?? ''}
                    onChange={(e) => handleColFilterChange('item', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.itemName ?? ''}
                    onChange={(e) => handleColFilterChange('itemName', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.stockUom ?? ''}
                    onChange={(e) => handleColFilterChange('stockUom', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.apiRequestLog ?? ''}
                    onChange={(e) => handleColFilterChange('apiRequestLog', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.inQty ?? ''}
                    onChange={(e) => handleColFilterChange('inQty', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.outQty ?? ''}
                    onChange={(e) => handleColFilterChange('outQty', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.balanceQty ?? ''}
                    onChange={(e) => handleColFilterChange('balanceQty', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.warehouse ?? ''}
                    onChange={(e) => handleColFilterChange('warehouse', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.itemGroup ?? ''}
                    onChange={(e) => handleColFilterChange('itemGroup', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.brand ?? ''}
                    onChange={(e) => handleColFilterChange('brand', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.description ?? ''}
                    onChange={(e) => handleColFilterChange('description', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.incomingRate ?? ''}
                    onChange={(e) => handleColFilterChange('incomingRate', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.avgRate ?? ''}
                    onChange={(e) => handleColFilterChange('avgRate', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.outgoingRate ?? ''}
                    onChange={(e) => handleColFilterChange('outgoingRate', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.balanceValue ?? ''}
                    onChange={(e) => handleColFilterChange('balanceValue', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.valueChange ?? ''}
                    onChange={(e) => handleColFilterChange('valueChange', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.voucherType ?? ''}
                    onChange={(e) => handleColFilterChange('voucherType', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.voucherNo ?? ''}
                    onChange={(e) => handleColFilterChange('voucherNo', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1 border-r border-slate-200/60 dark:border-[#27272A]">
                  <input
                    type="text"
                    value={colFilters.project ?? ''}
                    onChange={(e) => handleColFilterChange('project', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    value={colFilters.company ?? ''}
                    onChange={(e) => handleColFilterChange('company', e.target.value)}
                    className="w-full bg-[#EBF0F5]/70 dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border border-transparent outline-none"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] bg-white dark:bg-[#151518]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={22}
                    className="py-12 text-center text-slate-400 dark:text-zinc-500 text-xs"
                  >
                    No Stock Ledger records matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#1E1E22]/70 transition-colors"
                  >
                    <td className="py-2 px-3 text-center text-slate-500 dark:text-zinc-400 border-r border-slate-100 dark:border-[#27272A]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      {row.date}
                    </td>
                    <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      <span className="hover:underline cursor-pointer" title={row.item}>
                        {row.item}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      {row.itemName}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-zinc-400 border-r border-slate-100 dark:border-[#27272A]">
                      {row.stockUom}
                    </td>
                    <td className="py-2 px-3 text-slate-400 dark:text-zinc-500 border-r border-slate-100 dark:border-[#27272A]">
                      {row.apiRequestLog || ''}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-[#27272A]">
                      {row.inQty.toFixed(3)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400 border-r border-slate-100 dark:border-[#27272A]">
                      {row.outQty.toFixed(3)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white border-r border-slate-100 dark:border-[#27272A]">
                      {row.balanceQty.toFixed(3)}
                    </td>
                    <td
                      className="py-2 px-3 text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap truncate max-w-[180px]"
                      title={row.warehouse}
                    >
                      {row.warehouse}
                    </td>
                    <td
                      className="py-2 px-3 text-slate-600 dark:text-zinc-400 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap truncate max-w-[150px]"
                      title={row.itemGroup}
                    >
                      {row.itemGroup}
                    </td>
                    <td className="py-2 px-3 text-slate-400 dark:text-zinc-500 border-r border-slate-100 dark:border-[#27272A]">
                      {row.brand || ''}
                    </td>
                    <td className="py-2 px-3 text-slate-400 dark:text-zinc-500 border-r border-slate-100 dark:border-[#27272A]">
                      {row.description || ''}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      ${' '}{row.incomingRate.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      ${' '}{row.avgRate.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      ${' '}{row.outgoingRate.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      ${' '}{row.balanceValue.toFixed(2)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-medium border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap ${
                        row.valueChange >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      ${' '}{row.valueChange.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      <span className="hover:underline cursor-pointer" title={row.voucherType}>
                        {row.voucherType}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-zinc-300 font-mono text-[11px] border-r border-slate-100 dark:border-[#27272A] whitespace-nowrap">
                      <span className="hover:underline cursor-pointer" title={row.voucherNo}>
                        {row.voucherNo}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 dark:text-zinc-500 border-r border-slate-100 dark:border-[#27272A]">
                      {row.project || ''}
                    </td>
                    <td
                      className="py-2 px-3 text-slate-700 dark:text-zinc-300 whitespace-nowrap truncate max-w-[140px]"
                      title={row.company}
                    >
                      {row.company}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Hint and Execution Time (Image 1 & 2) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400 pt-1">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div className="text-right">
          Execution Time: {executionTime} sec
        </div>
      </div>
    </div>
  );
};

