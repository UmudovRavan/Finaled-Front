import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Filter, X, Folder, ArrowUpDown, ChevronsUpDown, ChevronDown } from 'lucide-react';
import { stockService } from '../api/stockService';

interface SerialNoStatusRow {
  id: string;
  itemCode: string;
  warehouse: string;
  status: string;
  company: string;
}

export const SerialNoStatusReportPage: React.FC = () => {
  const [rows, setRows] = useState<SerialNoStatusRow[]>([]);
  const [idFilter, setIdFilter] = useState('');
  const [itemCodeFilter, setItemCodeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // Inline table column filters
  const [colFilters, setColFilters] = useState({
    id: '',
    itemCode: '',
    warehouse: '',
    status: '',
    company: '',
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(20);

  const fetchSerials = useCallback(async () => {
    try {
      const data = await stockService.getSerialNos();
      setRows(
        data.map((s) => ({
          id: s.serialNo || s.id,
          itemCode: s.itemCode || '',
          warehouse: s.warehouse || '',
          status: s.status || '',
          company: 'Avalon (Demo)',
        }))
      );
    } catch (err) {
      console.error('Failed to fetch serial numbers:', err);
    }
  }, []);

  useEffect(() => {
    fetchSerials();
  }, [fetchSerials]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (idFilter && !row.id.toLowerCase().includes(idFilter.toLowerCase())) return false;
      if (itemCodeFilter && !row.itemCode.toLowerCase().includes(itemCodeFilter.toLowerCase())) return false;
      if (statusFilter && row.status !== statusFilter) return false;
      if (companyFilter && !row.company.toLowerCase().includes(companyFilter.toLowerCase())) return false;

      if (colFilters.id && !row.id.toLowerCase().includes(colFilters.id.toLowerCase())) return false;
      if (colFilters.itemCode && !row.itemCode.toLowerCase().includes(colFilters.itemCode.toLowerCase())) return false;
      if (colFilters.warehouse && !row.warehouse.toLowerCase().includes(colFilters.warehouse.toLowerCase())) return false;
      if (colFilters.status && !row.status.toLowerCase().includes(colFilters.status.toLowerCase())) return false;
      if (colFilters.company && !row.company.toLowerCase().includes(colFilters.company.toLowerCase())) return false;

      return true;
    });
  }, [rows, idFilter, itemCodeFilter, statusFilter, companyFilter, colFilters]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRows.map((r) => r.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearAllFilters = () => {
    setIdFilter('');
    setItemCodeFilter('');
    setStatusFilter('');
    setCompanyFilter('');
    setColFilters({ id: '', itemCode: '', warehouse: '', status: '', company: '' });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-between bg-white dark:bg-[#121214] text-slate-800 dark:text-zinc-200">
      <div>
        {/* Top Filter Bar (Matching Image 1) */}
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1E1E22]">
          <div className="flex flex-wrap items-center gap-2">
            {/* ID + ≈ */}
            <div className="flex items-center">
              <input
                type="text"
                placeholder="ID"
                value={idFilter}
                onChange={(e) => setIdFilter(e.target.value)}
                className="w-28 h-7 px-2.5 text-xs rounded-l-md bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-800 dark:text-zinc-200 placeholder-slate-400 outline-none focus:border-slate-300"
              />
              <button
                type="button"
                title="Like"
                className="h-7 px-2 text-xs bg-slate-100 dark:bg-[#1E1E22] border-l border-slate-200 dark:border-[#2E2E33] rounded-r-md text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
              >
                ≈
              </button>
            </div>

            {/* Item Code */}
            <input
              type="text"
              placeholder="Item Code"
              value={itemCodeFilter}
              onChange={(e) => setItemCodeFilter(e.target.value)}
              className="w-36 h-7 px-2.5 text-xs rounded-md bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-800 dark:text-zinc-200 placeholder-slate-400 outline-none focus:border-slate-300"
            />

            {/* Status Select */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none w-32 h-7 px-2.5 pr-7 text-xs rounded-md bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-500 dark:text-zinc-300 outline-none cursor-pointer"
              >
                <option value="">Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Delivered">Delivered</option>
                <option value="Expired">Expired</option>
              </select>
              <ChevronsUpDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Company */}
            <input
              type="text"
              placeholder="Company"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-36 h-7 px-2.5 text-xs rounded-md bg-slate-100 dark:bg-[#1E1E22] border border-transparent dark:border-[#2E2E33] text-slate-800 dark:text-zinc-200 placeholder-slate-400 outline-none focus:border-slate-300"
            />
          </div>

          {/* Right Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-[#1E1E22] rounded-md border border-slate-200/60 dark:border-[#2E2E33]">
              <button
                type="button"
                className="flex items-center gap-1.5 h-7 px-2.5 text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-[#27272A] rounded-l-md transition-colors"
              >
                <Filter className="w-3 h-3 text-slate-500" />
                <span>Filter</span>
              </button>
              <button
                type="button"
                onClick={clearAllFilters}
                title="Clear Filters"
                className="h-7 px-2 text-slate-500 hover:text-slate-800 dark:hover:text-white border-l border-slate-200 dark:border-[#2E2E33] hover:bg-slate-200/60 dark:hover:bg-[#27272A] rounded-r-md transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              className="flex items-center gap-1.5 h-7 px-2.5 text-xs bg-slate-100 dark:bg-[#1E1E22] hover:bg-slate-200/60 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-md border border-slate-200/60 dark:border-[#2E2E33] transition-colors"
            >
              <Folder className="w-3 h-3 text-slate-500" />
              <span>Add Group</span>
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 h-7 px-2.5 text-xs bg-slate-100 dark:bg-[#1E1E22] hover:bg-slate-200/60 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-md border border-slate-200/60 dark:border-[#2E2E33] transition-colors"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-500" />
              <span>Created On</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Report Table (Matching Image 1) */}
        <div className="px-6 py-4">
          <div className="inline-block min-w-[540px] border border-slate-200 dark:border-[#27272A] rounded-md overflow-hidden bg-white dark:bg-[#18181B]">
            <table className="text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border-b border-slate-200 dark:border-[#27272A] font-normal">
                  <th className="py-2 px-2.5 w-8 text-center border-r border-slate-100 dark:border-[#27272A]">
                    <input
                      type="checkbox"
                      checked={filteredRows.length > 0 && selectedIds.length === filteredRows.length}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 cursor-pointer"
                    />
                  </th>
                  <th className="py-2 px-2.5 w-8 text-center border-r border-slate-100 dark:border-[#27272A] font-normal text-slate-400"></th>
                  <th className="py-2 px-3 min-w-[110px] font-normal border-r border-slate-100 dark:border-[#27272A]">ID</th>
                  <th className="py-2 px-3 min-w-[115px] font-normal border-r border-slate-100 dark:border-[#27272A]">Item Code</th>
                  <th className="py-2 px-3 min-w-[100px] font-normal border-r border-slate-100 dark:border-[#27272A]">Warehouse</th>
                  <th className="py-2 px-3 min-w-[90px] font-normal border-r border-slate-100 dark:border-[#27272A]">Status</th>
                  <th className="py-2 px-3 min-w-[125px] font-normal">Company</th>
                </tr>

                {/* Inline Filter Row */}
                <tr className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A]">
                  <th className="py-1 px-2 border-r border-slate-100 dark:border-[#27272A]"></th>
                  <th className="py-1 px-2 border-r border-slate-100 dark:border-[#27272A]"></th>
                  <th className="py-1 px-2 border-r border-slate-100 dark:border-[#27272A]">
                    <input
                      type="text"
                      value={colFilters.id}
                      onChange={(e) => setColFilters({ ...colFilters, id: e.target.value })}
                      className="w-full h-5 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                    />
                  </th>
                  <th className="py-1 px-2 border-r border-slate-100 dark:border-[#27272A]">
                    <input
                      type="text"
                      value={colFilters.itemCode}
                      onChange={(e) => setColFilters({ ...colFilters, itemCode: e.target.value })}
                      className="w-full h-5 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                    />
                  </th>
                  <th className="py-1 px-2 border-r border-slate-100 dark:border-[#27272A]">
                    <input
                      type="text"
                      value={colFilters.warehouse}
                      onChange={(e) => setColFilters({ ...colFilters, warehouse: e.target.value })}
                      className="w-full h-5 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                    />
                  </th>
                  <th className="py-1 px-2 border-r border-slate-100 dark:border-[#27272A]">
                    <input
                      type="text"
                      value={colFilters.status}
                      onChange={(e) => setColFilters({ ...colFilters, status: e.target.value })}
                      className="w-full h-5 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                    />
                  </th>
                  <th className="py-1 px-2">
                    <input
                      type="text"
                      value={colFilters.company}
                      onChange={(e) => setColFilters({ ...colFilters, company: e.target.value })}
                      className="w-full h-5 px-2 text-xs rounded bg-slate-100 dark:bg-[#27272A] border-none outline-none"
                    />
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {filteredRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-[#222226] transition-colors">
                    <td className="py-2 px-2.5 text-center border-r border-slate-100 dark:border-[#27272A]">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-2.5 text-center text-slate-400 border-r border-slate-100 dark:border-[#27272A]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 border-r border-slate-100 dark:border-[#27272A]">
                      {row.id}
                    </td>
                    <td className="py-2 px-3 text-slate-800 dark:text-zinc-200 border-r border-slate-100 dark:border-[#27272A]">
                      {row.itemCode}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-zinc-400 border-r border-slate-100 dark:border-[#27272A]">
                      {row.warehouse}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-zinc-400 border-r border-slate-100 dark:border-[#27272A]">
                      {row.status}
                    </td>
                    <td className="py-2 px-3 text-slate-800 dark:text-zinc-200">
                      {row.company}
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400">
                      No Serial No Status records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Pagination Bar (Matching Image 1: 20 | 100 | 500 | 2500 & 1 of 1) */}
      <div className="px-6 py-3 border-t border-slate-100 dark:border-[#1E1E22] flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <div className="inline-flex items-center border border-slate-200 dark:border-[#2E2E33] rounded-md overflow-hidden bg-white dark:bg-[#18181B]">
          {[20, 100, 500, 2500].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={`px-2.5 py-1 transition-colors ${
                pageSize === size
                  ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'hover:bg-slate-50 dark:hover:bg-[#222226]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <div>
          {filteredRows.length} of {rows.length}
        </div>
      </div>
    </div>
  );
};

