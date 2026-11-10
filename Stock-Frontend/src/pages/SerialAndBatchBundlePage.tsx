import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, ChevronDown, X, FileText } from 'lucide-react';
import { useSerialAndBatchBundle } from '../context';

export const SerialAndBatchBundlePage: React.FC = () => {
  const {
    filteredBundles,
    filterId,
    setFilterId,
    filterItemCode,
    setFilterItemCode,
    filterWarehouse,
    setFilterWarehouse,
    filterVoucherNo,
    setFilterVoucherNo,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useSerialAndBatchBundle();

  const [sortField, setSortField] = useState('Created On');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [hasFilterActive, setHasFilterActive] = useState(true);

  const allSelected =
    filteredBundles.length > 0 && selectedIds.length === filteredBundles.length;

  return (
    <div className="space-y-3 font-sans">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[320px] flex-wrap">
          {/* ID ≈ Search Input */}
          <div className="relative w-40">
            <input
              type="text"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              placeholder="ID"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs pl-2.5 pr-6 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none select-none text-xs">
              ≈
            </span>
          </div>

          {/* Item Code Search Input */}
          <div className="relative w-36">
            <input
              type="text"
              value={filterItemCode}
              onChange={(e) => setFilterItemCode(e.target.value)}
              placeholder="Item Code"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Warehouse Search Input */}
          <div className="relative w-36">
            <input
              type="text"
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              placeholder="Warehouse"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Voucher No Search Input */}
          <div className="relative w-36">
            <input
              type="text"
              value={filterVoucherNo}
              onChange={(e) => setFilterVoucherNo(e.target.value)}
              placeholder="Voucher No"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Filter ✕ Button */}
          {hasFilterActive && (
            <button
              type="button"
              onClick={() => {
                setFilterId('');
                setFilterItemCode('');
                setFilterWarehouse('');
                setFilterVoucherNo('');
                setHasFilterActive(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border border-transparent hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs transition-colors"
            >
              <span>Filter</span>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Right Sort Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <div className="w-2.5 h-0.5 bg-slate-500 rounded-full" />
                <div className="w-1.5 h-0.5 bg-slate-500 rounded-full" />
              </div>
              <span>{sortField}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1C1C1F] border border-slate-200 dark:border-[#27272A] rounded shadow-lg py-1 z-20">
                {['Created On', 'ID', 'Item Code', 'Warehouse'].map((field) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => {
                      setSortField(field);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors ${
                      sortField === field
                        ? 'font-medium text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-zinc-300'
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredBundles.length === 0 ? (
        /* Empty State (Screenshot 1) */
        <div className="bg-white dark:bg-[#141416] border border-slate-200 dark:border-[#27272A] rounded-lg p-16 flex flex-col items-center justify-center text-center min-h-[420px]">
          <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-[#1E1E22] flex items-center justify-center mb-4 text-slate-400 dark:text-zinc-500">
            <FileText className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-4">
            You haven't created a Serial and Batch Bundle yet
          </div>
          <Link
            to="/serial-and-batch-bundle/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#1B1B1E] hover:bg-black dark:bg-[#27272A] dark:hover:bg-[#323238] text-white text-xs font-medium rounded-md shadow-sm transition-colors"
          >
            Create your first Serial and Batch Bundle
          </Link>
        </div>
      ) : (
        /* Table View */
        <div className="border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#141416] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#19191C] text-slate-600 dark:text-zinc-400 select-none">
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300">ID</th>
                  <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300">Item Code</th>
                  <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300">Warehouse</th>
                  <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300">Voucher No</th>
                  <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300">Type of Transaction</th>
                  <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300 text-right pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <span>{filteredBundles.length} of {filteredBundles.length}</span>
                      <Heart className="w-3 h-3 text-slate-400 stroke-[1.5]" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#202024]">
                {filteredBundles.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1A1A1E] transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-zinc-100">
                        <Link
                          to={`/serial-and-batch-bundle/${encodeURIComponent(item.id)}`}
                          className="hover:underline cursor-pointer"
                        >
                          {item.id}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                        {item.itemCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                        {item.warehouse || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                        {item.voucherNo || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal ${
                            item.typeOfTransaction === 'Inward'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}
                        >
                          {item.typeOfTransaction}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right pr-6">
                        <div className="flex items-center justify-end gap-3 text-slate-400 dark:text-zinc-500">
                          <span className="text-[11px]">{item.createdOn || '3 M'}</span>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                            <span className="text-[11px]">{item.commentsCount || 0}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleLike(item.id)}
                            className={`p-0.5 transition-colors ${
                              item.isLiked
                                ? 'text-rose-500 fill-rose-500'
                                : 'hover:text-rose-500'
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 stroke-[1.75] ${
                                item.isLiked ? 'fill-rose-500' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Pagination / Row Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2 px-1">
        <div className="flex items-center gap-2">
          {[20, 100, 500, 2500].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={`px-2 py-1 rounded transition-colors ${
                pageSize === size
                  ? 'bg-slate-200 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-[#1E1E22] text-slate-500 dark:text-zinc-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

