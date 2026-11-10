import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { useUOMConversionFactor } from '../context';

export const UOMConversionFactorPage: React.FC = () => {
  const {
    filteredFactors,
    filterId,
    setFilterId,
    filterCategory,
    setFilterCategory,
    filterFrom,
    setFilterFrom,
    filterTo,
    setFilterTo,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useUOMConversionFactor();

  const [sortField, setSortField] = useState('Created On');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [hasFilterActive, setHasFilterActive] = useState(true);

  const allSelected =
    filteredFactors.length > 0 && selectedIds.length === filteredFactors.length;

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

          {/* Category Search Input */}
          <div className="relative w-36">
            <input
              type="text"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="Category"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* From Search Input */}
          <div className="relative w-32">
            <input
              type="text"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              placeholder="From"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* To Search Input */}
          <div className="relative w-32">
            <input
              type="text"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              placeholder="To"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Filter ✕ Button */}
          {hasFilterActive && (
            <button
              type="button"
              onClick={() => {
                setFilterId('');
                setFilterCategory('');
                setFilterFrom('');
                setFilterTo('');
                setHasFilterActive(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border border-transparent hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs transition-colors"
            >
              <span>Filter</span>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Right side: Sort option */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortField}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1E1E22] rounded-md shadow-lg border border-slate-200 dark:border-zinc-800 py-1 z-30 text-xs">
              {['Created On', 'ID', 'Category', 'From', 'To'].map((field) => (
                <button
                  key={field}
                  type="button"
                  onClick={() => {
                    setSortField(field);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] ${
                    sortField === field
                      ? 'text-black dark:text-white font-medium'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* UOM Conversion Factor Table */}
      <div className="border border-slate-200 dark:border-[#27272A] rounded-lg bg-white dark:bg-[#18181B] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/50 dark:bg-[#1B1B1F] text-slate-600 dark:text-zinc-400 font-normal">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3 font-normal text-slate-500 dark:text-zinc-400">
                  ID
                </th>
                <th className="py-2.5 px-3 font-normal text-slate-500 dark:text-zinc-400">
                  Category
                </th>
                <th className="py-2.5 px-3 font-normal text-slate-500 dark:text-zinc-400">
                  From
                </th>
                <th className="py-2.5 px-3 font-normal text-slate-500 dark:text-zinc-400">
                  To
                </th>
                <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400">
                  Value
                </th>
                <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{filteredFactors.length} of 235</span>
                    <Heart className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {filteredFactors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-zinc-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredFactors.map((factor) => {
                  const isChecked = selectedIds.includes(factor.id);
                  return (
                    <tr
                      key={factor.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#1E1E22]/60 transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(factor.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/uom-conversion-factor/${encodeURIComponent(factor.id)}`}
                          className="font-medium text-slate-900 dark:text-zinc-100 hover:underline"
                        >
                          {factor.id}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                        {factor.category}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                        {factor.fromUOM}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                        {factor.toUOM}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-zinc-300">
                        {factor.value}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-3 text-slate-400 dark:text-zinc-500 text-[11px]">
                          <span>{factor.createdOn || '3 M'}</span>
                          <span className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-300">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{factor.commentsCount ?? 0}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleLike(factor.id);
                            }}
                            className={`p-0.5 hover:text-rose-500 transition-colors ${
                              factor.isLiked ? 'text-rose-500 fill-rose-500' : ''
                            }`}
                            title="Like"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${factor.isLiked ? 'fill-rose-500' : ''}`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Pagination & Load More Bar */}
      <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          {[20, 100, 500, 2500].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                pageSize === size
                  ? 'bg-slate-200 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-[#1E1E22] text-slate-600 dark:text-zinc-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-normal px-2 py-1 transition-colors"
        >
          Load More
        </button>
      </div>
    </div>
  );
};

