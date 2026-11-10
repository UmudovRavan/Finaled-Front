import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { useItem } from '../../context';
import type { ItemRecord } from '../../types';

export const ItemListView: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredItems,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useItem();

  const isAllSelected =
    filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  const pageSizeOptions = [20, 100, 500, 2500];
  const displayedItems = filteredItems.slice(0, pageSize);

  const getStatusBadge = (status: ItemRecord['status']) => {
    switch (status) {
      case 'Enabled':
        return 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8]';
      case 'Disabled':
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-500 dark:text-zinc-400';
      default:
        return 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0284C7] dark:text-[#38BDF8]';
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm overflow-hidden text-xs">
      {/* Scrollable table container matching Screenshot 1 */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          {/* Table Header: Checkbox | Item Name | Status | Item Group | UOM | Item Type | Purpose | ID | 12 of 12 ♡ */}
          <thead>
            <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal select-none">
              <th className="py-2.5 px-3 w-8">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[160px]">
                Item Name
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[100px]">
                Status
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[150px]">
                Item Group
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[100px]">
                UOM
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[110px]">
                Item Type
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[150px]">
                Purpose
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[110px]">
                ID
              </th>
              <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400 min-w-[110px]">
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {displayedItems.length > 0
                      ? `${displayedItems.length} of ${filteredItems.length}`
                      : '0 of 0'}
                  </span>
                  <Heart className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
            {displayedItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                  No Items found
                </td>
              </tr>
            ) : (
              displayedItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-[#202024]/60 transition-colors group ${
                      isSelected ? 'bg-slate-50 dark:bg-[#202024]/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Item Name */}
                    <td className="py-2.5 px-3 font-normal text-slate-800 dark:text-zinc-200">
                      <span
                        onClick={() => navigate(`/item/${item.id}`)}
                        className="hover:text-slate-900 dark:hover:text-white cursor-pointer font-medium"
                      >
                        {item.itemName}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Item Group */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {item.itemGroup}
                    </td>

                    {/* UOM */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      <span
                        title={`UOM: ${item.uom}`}
                        className="cursor-help hover:text-slate-900 dark:hover:text-white"
                      >
                        {item.uom}
                      </span>
                    </td>

                    {/* Item Type */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {item.itemType}
                    </td>

                    {/* Purpose */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {item.purpose}
                    </td>

                    {/* ID */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300 font-mono text-[11.5px]">
                      <span
                        onClick={() => navigate(`/item/${item.id}`)}
                        className="hover:text-slate-900 dark:hover:text-white cursor-pointer hover:underline"
                      >
                        {item.id}
                      </span>
                    </td>

                    {/* Right metadata: Time, Comments, Heart */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-zinc-500">
                        <span className="text-[11px] font-normal">{item.timeAgoText}</span>

                        <div className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>{item.commentsCount}</span>
                        </div>

                        <button
                          onClick={() => toggleLike(item.id)}
                          className={`p-0.5 hover:scale-110 transition-transform ${
                            item.isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
                          }`}
                          title="Like"
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
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer: 20 | 100 | 500 | 2500 */}
      <div className="px-3 py-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between bg-white dark:bg-[#18181B] text-slate-500 dark:text-zinc-400">
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
      </div>
    </div>
  );
};

export default ItemListView;

