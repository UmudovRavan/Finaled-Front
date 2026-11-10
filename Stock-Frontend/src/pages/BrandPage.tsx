import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, ChevronDown, X } from 'lucide-react';
import { useBrand } from '../context';

export const BrandPage: React.FC = () => {
  const {
    brands,
    filteredBrands,
    filterId,
    setFilterId,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useBrand();

  const [sortField, setSortField] = useState('Created On');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [hasFilterActive, setHasFilterActive] = useState(true);

  const allSelected =
    filteredBrands.length > 0 && selectedIds.length === filteredBrands.length;

  return (
    <div className="space-y-3 font-sans">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          {/* ID ≈ Search Input */}
          <div className="relative w-44">
            <input
              type="text"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              placeholder="ID ≈"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Filter ✕ Button */}
          {hasFilterActive && (
            <button
              type="button"
              onClick={() => {
                setFilterId('');
                setHasFilterActive(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border border-transparent hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs transition-colors"
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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs transition-colors"
          >
            <span>{sortField}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-lg shadow-lg py-1 text-xs">
              {['Created On', 'Brand Name', 'ID'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSortField(option);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] ${
                    sortField === option
                      ? 'font-medium text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Brand Table */}
      <div className="bg-white dark:bg-[#151518] rounded-lg border border-slate-200/80 dark:border-[#27272A] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#27272A] bg-transparent text-slate-500 dark:text-zinc-400 text-[11px] font-normal select-none">
                <th className="w-9 py-2.5 pl-3 pr-1 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                  />
                </th>
                <th className="py-2.5 px-3 font-normal">ID</th>
                <th className="py-2.5 px-3 font-normal">Description</th>
                <th className="py-2.5 px-3 text-right font-normal pr-4">
                  <div className="inline-flex items-center gap-1.5 text-slate-400 dark:text-zinc-400 text-[11px]">
                    <span>{filteredBrands.length} of {brands.length}</span>
                    <Heart className="w-3.5 h-3.5 stroke-[1.5]" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#202024] text-slate-700 dark:text-zinc-300">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-zinc-400">
                    No Brands found
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b) => {
                  const isChecked = selectedIds.includes(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`group hover:bg-slate-50/70 dark:hover:bg-[#1C1C20] transition-colors ${
                        isChecked ? 'bg-slate-50/90 dark:bg-[#1E1E22]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 pl-3 pr-1 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(b.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                        />
                      </td>

                      {/* ID (Clickable Link) */}
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        <Link
                          to={`/brand/${encodeURIComponent(b.id)}`}
                          className="hover:underline hover:text-black dark:hover:text-white"
                        >
                          {b.id}
                        </Link>
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                        {b.description || ''}
                      </td>

                      {/* Meta Columns: TimeAgo, Comments, Heart */}
                      <td className="py-2.5 px-3 text-right pr-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-3 text-slate-400 dark:text-zinc-400 text-[11px]">
                          <span>{b.timeAgoText || 'now'}</span>

                          <span className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer">
                            <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
                            <span>{b.commentsCount || 0}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleLike(b.id)}
                            className={`p-0.5 transition-colors ${
                              b.isLiked
                                ? 'text-rose-500 fill-rose-500'
                                : 'text-slate-400 hover:text-rose-500'
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 stroke-[1.5] ${
                                b.isLiked ? 'fill-rose-500' : ''
                              }`}
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

      {/* Bottom Pagination Selector (20, 100, 500, 2500) */}
      <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 dark:text-zinc-400 select-none">
        {[20, 100, 500, 2500].map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setPageSize(size)}
            className={`transition-colors cursor-pointer ${
              pageSize === size
                ? 'font-bold text-slate-900 dark:text-white'
                : 'hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandPage;

