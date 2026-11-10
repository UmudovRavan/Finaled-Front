import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { usePickList } from '../../context';
import type { PickListRecord } from '../../types';

export const PickListListView: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredPickLists,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = usePickList();

  const isAllSelected =
    filteredPickLists.length > 0 && selectedIds.length === filteredPickLists.length;

  const pageSizeOptions = [20, 100, 500, 2500];

  const displayedPickLists = filteredPickLists.slice(0, pageSize);

  const getStatusBadge = (status: PickListRecord['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-rose-50 dark:bg-rose-950/60 text-[#E11D48] dark:text-[#FB7185]';
      case 'Open':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
      case 'Completed':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399]';
      case 'Cancelled':
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-500 dark:text-zinc-400 line-through';
      default:
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm overflow-hidden text-xs">
      {/* Scrollable table container */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          {/* Table Header: Checkbox | ID | Status | Company | Customer | 1 of 1 ♡ */}
          <thead>
            <tr className="bg-[#F3F4F6]/80 dark:bg-[#202024] border-b border-slate-100 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal select-none">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[200px]">
                ID
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[120px]">
                Status
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[180px]">
                Company
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[220px]">
                Customer
              </th>
              <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400 min-w-[110px]">
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {displayedPickLists.length > 0
                      ? `1 of ${displayedPickLists.length}`
                      : '0 of 0'}
                  </span>
                  <Heart className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
            {displayedPickLists.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                  No Pick Lists found
                </td>
              </tr>
            ) : (
              displayedPickLists.map((pl) => {
                const isSelected = selectedIds.includes(pl.id);
                return (
                  <tr
                    key={pl.id}
                    className={`transition-colors group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] ${
                      isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(pl.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* ID (Bold, Clickable) */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/pick-list/${pl.id}`)}
                        className="text-left font-semibold text-slate-900 dark:text-zinc-100 hover:underline hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        {pl.id}
                      </button>
                    </td>

                    {/* Status Pill Badge (Draft in soft pink pill) */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadge(
                          pl.status
                        )}`}
                      >
                        {pl.status}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {pl.company}
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {pl.customer}
                    </td>

                    {/* Right metadata: Time, Comments, ·, Heart */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-zinc-500">
                        <span className="text-[11px] font-normal">{pl.timeAgoText}</span>

                        <div className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>{pl.commentsCount}</span>
                        </div>

                        <span className="text-slate-300 dark:text-zinc-600">·</span>

                        <button
                          onClick={() => toggleLike(pl.id)}
                          className={`p-0.5 hover:scale-110 transition-transform ${
                            pl.isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
                          }`}
                          title="Like"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 stroke-[1.75] ${
                              pl.isLiked ? 'fill-rose-500' : ''
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

      {/* Pagination Footer: 20 | 100 | 500 | 2500 */}
      <div className="px-3 py-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between bg-slate-50/50 dark:bg-[#18181B] text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          {pageSizeOptions.map((size) => {
            const isActive = pageSize === size;
            return (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-200 dark:bg-[#2E2E33] text-slate-900 dark:text-white font-medium'
                    : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#242428]'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 dark:text-zinc-500">
          Showing {Math.min(displayedPickLists.length, pageSize)} of{' '}
          {filteredPickLists.length} records
        </div>
      </div>
    </div>
  );
};

export default PickListListView;
