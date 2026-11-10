import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, ChevronDown, X, ArrowUpDown } from 'lucide-react';
import { useUOM } from '../context';

export const UOMPage: React.FC = () => {
  const {
    filteredUOMs,
    filterId,
    setFilterId,
    filterCategory,
    setFilterCategory,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useUOM();

  const [sortField, setSortField] = useState('Created On');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [hasFilterActive, setHasFilterActive] = useState(true);

  const allSelected =
    filteredUOMs.length > 0 && selectedIds.length === filteredUOMs.length;

  return (
    <div className="space-y-3 font-sans">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          {/* ID ≈ Search Input */}
          <div className="relative w-44">
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
          <div className="relative w-44">
            <input
              type="text"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="Category"
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
              {['Created On', 'ID', 'Category', 'UOM Name'].map((field) => (
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

      {/* UOM Table */}
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
                  Status
                </th>
                <th className="py-2.5 px-3 font-normal text-slate-500 dark:text-zinc-400">
                  UOM Name
                </th>
                <th className="py-2.5 px-3 font-normal text-slate-500 dark:text-zinc-400">
                  Category
                </th>
                <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{filteredUOMs.length} of 239</span>
                    <Heart className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {filteredUOMs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-zinc-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredUOMs.map((uom) => {
                  const isChecked = selectedIds.includes(uom.id);
                  return (
                    <tr
                      key={uom.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#1E1E22]/60 transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(uom.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/uom/${encodeURIComponent(uom.id)}`}
                          className="font-medium text-slate-900 dark:text-zinc-100 hover:underline"
                        >
                          {uom.id}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50">
                          {uom.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                        {uom.uomName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">
                        {uom.category || ''}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-3 text-slate-400 dark:text-zinc-500 text-[11px]">
                          <span>{uom.createdOn || '3 M'}</span>
                          <span className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-zinc-300">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{uom.commentsCount ?? 0}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleLike(uom.id);
                            }}
                            className={`p-0.5 hover:text-rose-500 transition-colors ${
                              uom.isLiked ? 'text-rose-500 fill-rose-500' : ''
                            }`}
                            title="Like"
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${uom.isLiked ? 'fill-rose-500' : ''}`}
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

