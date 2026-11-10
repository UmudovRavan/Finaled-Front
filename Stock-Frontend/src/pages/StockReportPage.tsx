import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Printer,
  RotateCw,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Building2,
  Warehouse,
  Package,
} from 'lucide-react';

// Friendly title map
const REPORT_TITLES: Record<string, string> = {
  'stock-ledger': 'Stock Ledger',
  'stock-balance': 'Stock Balance',
  'quick-stock-balance': 'Quick Stock Balance',
  'stock-projected-qty': 'Stock Projected Qty',
  'stock-analytics': 'Stock Analytics',
  'stock-ageing': 'Stock Ageing',
  'purchase-receipt-trends': 'Purchase Receipt Trends',
  'delivery-note-trends': 'Delivery Note Trends',
  'item-price-stock': 'Item Price Stock',
  'warehouse-wise-stock-balance': 'Warehouse Wise Stock Balance',
  'item-shortage-report': 'Item Shortage Report',
  'serial-no-and-batch-traceability': 'Serial No and Batch Traceability',
  'serial-no-status': 'Serial No Status',
  'serial-no-ledger': 'Serial No Ledger',
  'serial-no-warranty-expiry': 'Serial No Warranty Expiry',
  'batch-wise-balance-history': 'Batch-Wise Balance History',
  'batch-item-expiry-status': 'Batch Item Expiry Status',
  'requested-items-to-be-transferred': 'Requested Items To Be Transferred',
  'itemwise-recommended-reorder-level': 'Itemwise Recommended Reorder Level',
  'item-variant-details': 'Item Variant Details',
  ledger: 'Stock Ledger',
  balance: 'Stock Balance',
};

// Realistic mock datasets for standard reports
const SAMPLE_RECORDS: Record<string, any[]> = {
  'stock-ledger': [
    {
      date: '2026-11-10',
      time: '14:20:00',
      itemCode: 'ITEM-001',
      itemName: 'Wireless Headset Pro',
      warehouse: 'Mərkəzi Baş Anbar',
      voucherType: 'Stock Entry',
      voucherNo: 'MAT-STE-2026-00001',
      qtyChange: 25,
      balanceQty: 125,
      rate: 120.0,
      balanceValue: 15000.0,
    },
    {
      date: '2026-11-09',
      time: '11:15:30',
      itemCode: 'ITEM-002',
      itemName: 'Ultra HD Monitor 27"',
      warehouse: 'Sumqayıt Logistika Mərkəzi',
      voucherType: 'Purchase Receipt',
      voucherNo: 'MAT-PRE-2026-00001',
      qtyChange: 50,
      balanceQty: 80,
      rate: 450.0,
      balanceValue: 36000.0,
    },
    {
      date: '2026-11-08',
      time: '16:45:10',
      itemCode: 'ITEM-003',
      itemName: 'Smart Keyboard RGB',
      warehouse: 'Gəncə Satış Mərkəzi',
      voucherType: 'Delivery Note',
      voucherNo: 'MAT-DN-2026-00001',
      qtyChange: -10,
      balanceQty: 40,
      rate: 85.0,
      balanceValue: 3400.0,
    },
  ],
  'stock-balance': [
    {
      itemCode: 'ITEM-001',
      itemName: 'Wireless Headset Pro',
      itemGroup: 'Products',
      warehouse: 'Mərkəzi Baş Anbar',
      uom: 'Nos',
      openingQty: 100,
      inQty: 35,
      outQty: 10,
      balanceQty: 125,
      valRate: 120.0,
      balanceValue: 15000.0,
    },
    {
      itemCode: 'ITEM-002',
      itemName: 'Ultra HD Monitor 27"',
      itemGroup: 'Monitors',
      warehouse: 'Sumqayıt Logistika Mərkəzi',
      uom: 'Nos',
      openingQty: 30,
      inQty: 50,
      outQty: 0,
      balanceQty: 80,
      valRate: 450.0,
      balanceValue: 36000.0,
    },
    {
      itemCode: 'ITEM-003',
      itemName: 'Smart Keyboard RGB',
      itemGroup: 'Accessories',
      warehouse: 'Gəncə Satış Mərkəzi',
      uom: 'Nos',
      openingQty: 50,
      inQty: 5,
      outQty: 15,
      balanceQty: 40,
      valRate: 85.0,
      balanceValue: 3400.0,
    },
  ],
  'quick-stock-balance': [
    {
      itemCode: 'ITEM-001',
      itemName: 'Wireless Headset Pro',
      warehouse: 'Mərkəzi Baş Anbar',
      availableQty: 110,
      reservedQty: 15,
      uom: 'Nos',
    },
    {
      itemCode: 'ITEM-002',
      itemName: 'Ultra HD Monitor 27"',
      warehouse: 'Sumqayıt Logistika Mərkəzi',
      availableQty: 75,
      reservedQty: 5,
      uom: 'Nos',
    },
    {
      itemCode: 'ITEM-003',
      itemName: 'Smart Keyboard RGB',
      warehouse: 'Gəncə Satış Mərkəzi',
      availableQty: 40,
      reservedQty: 0,
      uom: 'Nos',
    },
  ],
  'stock-projected-qty': [
    {
      itemCode: 'ITEM-001',
      itemName: 'Wireless Headset Pro',
      warehouse: 'Mərkəzi Baş Anbar',
      actualQty: 125,
      plannedQty: 20,
      requestedQty: 15,
      orderedQty: 50,
      reservedQty: 10,
      projectedQty: 185,
    },
    {
      itemCode: 'ITEM-002',
      itemName: 'Ultra HD Monitor 27"',
      warehouse: 'Sumqayıt Logistika Mərkəzi',
      actualQty: 80,
      plannedQty: 0,
      requestedQty: 0,
      orderedQty: 25,
      reservedQty: 5,
      projectedQty: 100,
    },
  ],
  'stock-ageing': [
    {
      itemCode: 'ITEM-001',
      itemName: 'Wireless Headset Pro',
      warehouse: 'Mərkəzi Baş Anbar',
      range030: 45,
      range3160: 50,
      range6190: 20,
      range90Plus: 10,
      totalQty: 125,
    },
    {
      itemCode: 'ITEM-002',
      itemName: 'Ultra HD Monitor 27"',
      warehouse: 'Sumqayıt Logistika Mərkəzi',
      range030: 50,
      range3160: 30,
      range6190: 0,
      range90Plus: 0,
      totalQty: 80,
    },
  ],
};

export const StockReportPage: React.FC = () => {
  const { reportSlug = 'stock-ledger' } = useParams<{ reportSlug: string }>();

  const reportName =
    REPORT_TITLES[reportSlug.toLowerCase()] ||
    reportSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const [company, setCompany] = useState('Avalon (Demo)');
  const [fromDate, setFromDate] = useState('2026-10-11');
  const [toDate, setToDate] = useState('2026-11-11');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [searchItem, setSearchItem] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const rawData =
    SAMPLE_RECORDS[reportSlug.toLowerCase()] || SAMPLE_RECORDS['stock-ledger'];

  const filteredData = useMemo(() => {
    return rawData.filter((row: any) => {
      if (searchItem.trim()) {
        const q = searchItem.toLowerCase();
        const matchesCode = (row.itemCode || row.serialNo || row.batchId || '')
          .toLowerCase()
          .includes(q);
        const matchesName = (row.itemName || '').toLowerCase().includes(q);
        if (!matchesCode && !matchesName) return false;
      }
      if (filterWarehouse.trim()) {
        if (!row.warehouse?.toLowerCase().includes(filterWarehouse.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [rawData, searchItem, filterWarehouse]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleExportCSV = () => {
    alert(`Exporting ${reportName} to CSV format...`);
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Top Filter and Controls Bar (Frappe ERP Standard Report Header) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-[#27272A]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {reportName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
              title="Refresh Report"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`}
              />
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
              title="Print Report"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Company */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
            />
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
            />
          </div>

          {/* Search Item / Keyword */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Item Code / Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                placeholder="Filter items..."
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs pl-7 pr-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Report Data Table */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] dark:bg-[#1A1A1E] text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-[#27272A]">
                {reportSlug.includes('balance') ? (
                  <>
                    <th className="py-2.5 px-3 font-medium">Item Code</th>
                    <th className="py-2.5 px-3 font-medium">Item Name</th>
                    <th className="py-2.5 px-3 font-medium">Warehouse</th>
                    <th className="py-2.5 px-3 font-medium text-right">Balance Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Valuation Rate (AZN)</th>
                    <th className="py-2.5 px-3 font-medium text-right">Balance Value (AZN)</th>
                  </>
                ) : reportSlug.includes('projected') ? (
                  <>
                    <th className="py-2.5 px-3 font-medium">Item Code</th>
                    <th className="py-2.5 px-3 font-medium">Item Name</th>
                    <th className="py-2.5 px-3 font-medium">Warehouse</th>
                    <th className="py-2.5 px-3 font-medium text-right">Actual Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Planned Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Ordered Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Projected Qty</th>
                  </>
                ) : reportSlug.includes('ageing') ? (
                  <>
                    <th className="py-2.5 px-3 font-medium">Item Code</th>
                    <th className="py-2.5 px-3 font-medium">Item Name</th>
                    <th className="py-2.5 px-3 font-medium">Warehouse</th>
                    <th className="py-2.5 px-3 font-medium text-right">0 - 30 Days</th>
                    <th className="py-2.5 px-3 font-medium text-right">31 - 60 Days</th>
                    <th className="py-2.5 px-3 font-medium text-right">61 - 90 Days</th>
                    <th className="py-2.5 px-3 font-medium text-right">90+ Days</th>
                    <th className="py-2.5 px-3 font-medium text-right">Total Qty</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3 font-medium">Date & Time</th>
                    <th className="py-2.5 px-3 font-medium">Item Code</th>
                    <th className="py-2.5 px-3 font-medium">Item Name</th>
                    <th className="py-2.5 px-3 font-medium">Warehouse</th>
                    <th className="py-2.5 px-3 font-medium">Voucher Type</th>
                    <th className="py-2.5 px-3 font-medium">Voucher #</th>
                    <th className="py-2.5 px-3 font-medium text-right">Qty Change</th>
                    <th className="py-2.5 px-3 font-medium text-right">Balance Qty</th>
                    <th className="py-2.5 px-3 font-medium text-right">Rate (AZN)</th>
                    <th className="py-2.5 px-3 font-medium text-right">Balance Value (AZN)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] bg-white dark:bg-[#151518]">
              {filteredData.map((row: any, idx: number) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/60 dark:hover:bg-[#1E1E22]/60 transition-colors"
                >
                  {reportSlug.includes('balance') ? (
                    <>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-zinc-200">
                        {row.itemCode}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.itemName}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.warehouse}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white">
                        {row.balanceQty ?? row.availableQty ?? 0}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {(row.valRate ?? 0).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white">
                        {(row.balanceValue ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </>
                  ) : reportSlug.includes('projected') ? (
                    <>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-zinc-200">
                        {row.itemCode}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.itemName}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.warehouse}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {row.actualQty}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {row.plannedQty}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {row.orderedQty}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-indigo-600 dark:text-indigo-400">
                        {row.projectedQty}
                      </td>
                    </>
                  ) : reportSlug.includes('ageing') ? (
                    <>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-zinc-200">
                        {row.itemCode}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.itemName}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.warehouse}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {row.range030}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {row.range3160}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {row.range6190}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {row.range90Plus}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white">
                        {row.totalQty}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.date} {row.time}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-zinc-200">
                        {row.itemCode}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.itemName}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.warehouse}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">
                        {row.voucherType}
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                        {row.voucherNo}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-medium ${
                          (row.qtyChange ?? 0) >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {(row.qtyChange ?? 0) > 0 ? `+${row.qtyChange}` : row.qtyChange}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white">
                        {row.balanceQty}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-zinc-400">
                        {(row.rate ?? 0).toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white">
                        {(row.balanceValue ?? 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="py-2.5 px-4 bg-[#F8F9FA] dark:bg-[#1A1A1E] border-t border-slate-200 dark:border-[#27272A] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
          <span>Showing {filteredData.length} records</span>
          <span className="text-[11px]">Report executed successfully</span>
        </div>
      </div>
    </div>
  );
};

