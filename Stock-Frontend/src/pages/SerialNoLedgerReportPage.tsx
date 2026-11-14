import React, { useState, useMemo } from 'react';
import { ChevronsUpDown } from 'lucide-react';

interface SerialNoLedgerEntry {
  id: string;
  itemCode: string;
  postingDate: string;
  postingTime: string;
  voucherType: string;
  voucherNo: string;
  company: string;
  warehouse: string;
  qty: number;
  serialNo: string;
  status: string;
}

const AVAILABLE_ITEMS = [
  'NOUTBUK-0003',
  'SKU002: Laptop',
  'SKU004: Smartphone',
  'SKU010: Camera',
];

const INITIAL_LEDGER_ENTRIES: SerialNoLedgerEntry[] = [
  {
    id: 'snl-1',
    itemCode: 'NOUTBUK-0003',
    postingDate: '10-11-2026',
    postingTime: '09:15:00',
    voucherType: 'Purchase Receipt',
    voucherNo: 'MAT-PRE-2026-00001',
    company: 'Avalon (Demo)',
    warehouse: 'Devam Eden İşler - AD',
    qty: 1.0,
    serialNo: 'NOUTBUK-0003',
    status: 'Active',
  },
  {
    id: 'snl-2',
    itemCode: 'NOUTBUK-0003',
    postingDate: '12-11-2026',
    postingTime: '14:30:00',
    voucherType: 'Stock Entry',
    voucherNo: 'MAT-STE-2026-00003',
    company: 'Avalon (Demo)',
    warehouse: 'Bitmiş Ürünler - AD',
    qty: 1.0,
    serialNo: 'NOUTBUK-0003',
    status: 'Active',
  },
  {
    id: 'snl-3',
    itemCode: 'SKU002: Laptop',
    postingDate: '01-11-2026',
    postingTime: '11:00:00',
    voucherType: 'Purchase Receipt',
    voucherNo: 'MAT-PRE-2026-00004',
    company: 'Avalon (Demo)',
    warehouse: 'Mağazalar - AD',
    qty: 2.0,
    serialNo: 'SN-LAP-2026-01, SN-LAP-2026-02',
    status: 'Active',
  },
  {
    id: 'snl-4',
    itemCode: 'SKU002: Laptop',
    postingDate: '08-11-2026',
    postingTime: '16:20:00',
    voucherType: 'Delivery Note',
    voucherNo: 'MAT-DN-2026-00002',
    company: 'Avalon (Demo)',
    warehouse: 'Mağazalar - AD',
    qty: -1.0,
    serialNo: 'SN-LAP-2026-01',
    status: 'Delivered',
  },
  {
    id: 'snl-5',
    itemCode: 'SKU004: Smartphone',
    postingDate: '05-11-2026',
    postingTime: '10:45:00',
    voucherType: 'Purchase Receipt',
    voucherNo: 'MAT-PRE-2026-00007',
    company: 'Avalon (Demo)',
    warehouse: 'Mağazalar - AD',
    qty: 1.0,
    serialNo: 'SN-PHN-2026-09',
    status: 'Active',
  },
  {
    id: 'snl-6',
    itemCode: 'SKU010: Camera',
    postingDate: '07-11-2026',
    postingTime: '13:10:00',
    voucherType: 'Stock Entry',
    voucherNo: 'MAT-STE-2026-00008',
    company: 'Avalon (Demo)',
    warehouse: 'Bitmiş Ürünler - AD',
    qty: 1.0,
    serialNo: 'SN-CAM-2026-04',
    status: 'Active',
  },
];

export const SerialNoLedgerReportPage: React.FC = () => {
  const [itemCode, setItemCode] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [postingDate, setPostingDate] = useState('14-11-2026');
  const [postingTime, setPostingTime] = useState('10:43:00');

  // Inline column search filters
  const [colFilters, setColFilters] = useState({
    postingDate: '',
    voucherType: '',
    voucherNo: '',
    warehouse: '',
    serialNo: '',
    status: '',
  });

  const filteredEntries = useMemo(() => {
    if (!itemCode.trim()) return [];
    return INITIAL_LEDGER_ENTRIES.filter((entry) => {
      if (entry.itemCode !== itemCode) return false;
      if (warehouse && !entry.warehouse.toLowerCase().includes(warehouse.toLowerCase())) return false;
      if (serialNo && !entry.serialNo.toLowerCase().includes(serialNo.toLowerCase())) return false;

      if (colFilters.postingDate && !entry.postingDate.includes(colFilters.postingDate)) return false;
      if (colFilters.voucherType && !entry.voucherType.toLowerCase().includes(colFilters.voucherType.toLowerCase())) return false;
      if (colFilters.voucherNo && !entry.voucherNo.toLowerCase().includes(colFilters.voucherNo.toLowerCase())) return false;
      if (colFilters.warehouse && !entry.warehouse.toLowerCase().includes(colFilters.warehouse.toLowerCase())) return false;
      if (colFilters.serialNo && !entry.serialNo.toLowerCase().includes(colFilters.serialNo.toLowerCase())) return false;
      if (colFilters.status && !entry.status.toLowerCase().includes(colFilters.status.toLowerCase())) return false;

      return true;
    });
  }, [itemCode, warehouse, serialNo, colFilters]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      <div className="flex-1 flex flex-col">
        {/* Top Filter Row (Matching Image 2) */}
        <div className="px-6 py-4 flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-[#1E1E22]">
          {/* Mandatory Item Code Selector */}
          <div className="relative">
            <select
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="appearance-none w-44 h-8 px-3 pr-8 text-xs rounded-lg bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-800 dark:text-zinc-100 outline-none focus:border-slate-300 dark:focus:border-[#3E3E44] cursor-pointer"
            >
              <option value="">Item Code</option>
              {AVAILABLE_ITEMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <input
            type="text"
            placeholder="Warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="w-44 h-8 px-3 text-xs rounded-lg bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-800 dark:text-zinc-100 placeholder-slate-400 outline-none focus:border-slate-300 dark:focus:border-[#3E3E44]"
          />

          <input
            type="text"
            placeholder="Serial No"
            value={serialNo}
            onChange={(e) => setSerialNo(e.target.value)}
            className="w-44 h-8 px-3 text-xs rounded-lg bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-800 dark:text-zinc-100 placeholder-slate-400 outline-none focus:border-slate-300 dark:focus:border-[#3E3E44]"
          />

          <input
            type="text"
            value={postingDate}
            onChange={(e) => setPostingDate(e.target.value)}
            className="w-44 h-8 px-3 text-xs rounded-lg bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-800 dark:text-zinc-100 outline-none focus:border-slate-300 dark:focus:border-[#3E3E44]"
          />

          <input
            type="text"
            value={postingTime}
            onChange={(e) => setPostingTime(e.target.value)}
            className="w-44 h-8 px-3 text-xs rounded-lg bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-800 dark:text-zinc-100 outline-none focus:border-slate-300 dark:focus:border-[#3E3E44]"
          />
        </div>

        {/* Empty Prompt when Item Code is not selected (Image 2: "Please set filters") */}
        {!itemCode ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
              Please set filters
            </p>
          </div>
        ) : (
          <div className="px-6 py-4">
            <div className="border border-slate-200 dark:border-[#27272A] rounded-xl overflow-hidden bg-white dark:bg-[#18181B] shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal whitespace-nowrap">
                      <th className="py-2.5 px-3 w-10 text-center font-normal text-slate-400"></th>
                      <th className="py-2.5 px-3 font-normal">Posting Date</th>
                      <th className="py-2.5 px-3 font-normal">Posting Time</th>
                      <th className="py-2.5 px-3 font-normal">Voucher Type</th>
                      <th className="py-2.5 px-3 font-normal">Voucher No</th>
                      <th className="py-2.5 px-3 font-normal">Company</th>
                      <th className="py-2.5 px-3 font-normal">Warehouse</th>
                      <th className="py-2.5 px-3 font-normal text-right">Qty</th>
                      <th className="py-2.5 px-3 font-normal">Serial No</th>
                      <th className="py-2.5 px-3 font-normal">Status</th>
                    </tr>

                    {/* Inline Column Filters */}
                    <tr className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A]">
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.postingDate}
                          onChange={(e) => setColFilters({ ...colFilters, postingDate: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.voucherType}
                          onChange={(e) => setColFilters({ ...colFilters, voucherType: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.voucherNo}
                          onChange={(e) => setColFilters({ ...colFilters, voucherNo: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.warehouse}
                          onChange={(e) => setColFilters({ ...colFilters, warehouse: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2"></th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.serialNo}
                          onChange={(e) => setColFilters({ ...colFilters, serialNo: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                      <th className="py-1 px-2">
                        <input
                          type="text"
                          value={colFilters.status}
                          onChange={(e) => setColFilters({ ...colFilters, status: e.target.value })}
                          className="w-full h-6 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                        />
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                    {filteredEntries.map((row, idx) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-[#222226] transition-colors whitespace-nowrap"
                      >
                        <td className="py-2.5 px-3 text-slate-400 text-center w-10">{idx + 1}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.postingDate}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{row.postingTime}</td>
                        <td className="py-2.5 px-3 text-slate-800 dark:text-zinc-200">{row.voucherType}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          {row.voucherNo}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.company}</td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{row.warehouse}</td>
                        <td className={`py-2.5 px-3 text-right font-medium ${row.qty < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {row.qty.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-zinc-300">{row.serialNo}</td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            row.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-[#27272A] dark:text-zinc-400'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredEntries.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-6 text-slate-400">
                          No ledger entries found for selected filters
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

      {/* Footer Notes (Matching Image 2) */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-[#71717A] border-t border-slate-100 dark:border-[#1E1E22]">
        <div>
          For comparison, use &gt;5, &lt;10 or =324. For ranges, use 5:10 (for values between 5 &amp; 10).
        </div>
        <div>Execution Time: 0.002023 sec</div>
      </div>
    </div>
  );
};

