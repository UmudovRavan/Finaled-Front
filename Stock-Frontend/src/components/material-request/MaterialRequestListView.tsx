import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { useMaterialRequest } from '../../context';
import type { MaterialRequestRecord } from '../../types';

export const MaterialRequestListView: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredRequests,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useMaterialRequest();

  const isAllSelected =
    filteredRequests.length > 0 && selectedIds.length === filteredRequests.length;

  const pageSizeOptions = [20, 100, 500, 2500];

  const displayedRequests = filteredRequests.slice(0, pageSize);

  const getStatusBadge = (status: MaterialRequestRecord['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-rose-50 dark:bg-rose-950/60 text-[#E11D48] dark:text-[#FB7185]';
      case 'Pending':
      case 'Partially Ordered':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
      case 'Submitted':
      case 'Ordered':
      case 'Issued':
      case 'Transferred':
      case 'Received':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399]';
      case 'Cancelled':
      case 'Stopped':
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-500 dark:text-zinc-400 line-through';
      default:
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm overflow-hidden text-xs">
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          {/* Table Header from Image 1 */}
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
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[210px]">
                Title
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[100px]">
                Status
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[140px]">
                Purpose
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[130px]">
                Transaction Date
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[120px]">
                Required By
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[150px]">
                ID
              </th>
              <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400 min-w-[110px]">
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {displayedRequests.length > 0
                      ? `1 of ${displayedRequests.length}`
                      : '0 of 0'}
                  </span>
                  <Heart className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
            {displayedRequests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                  No Material Requests found
                </td>
              </tr>
            ) : (
              displayedRequests.map((req) => {
                const isSelected = selectedIds.includes(req.id);
                return (
                  <tr
                    key={req.id}
                    className={`transition-colors group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] ${
                      isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(req.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Title (Bold, Clickable) */}
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/material-request/${req.id}`)}
                        className="text-left font-semibold text-slate-900 dark:text-zinc-100 hover:underline hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        {req.title}
                      </button>
                    </td>

                    {/* Status Pill Badge (Draft in soft pink pill) */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadge(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>

                    {/* Purpose Pill Badge (• Material Issue) */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] dark:bg-[#27272A] text-slate-700 dark:text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 dark:bg-zinc-400" />
                        <span>{req.purpose}</span>
                      </span>
                    </td>

                    {/* Transaction Date */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {req.transactionDate}
                    </td>

                    {/* Required By */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {req.requiredBy}
                    </td>

                    {/* ID */}
                    <td
                      onClick={() => navigate(`/material-request/${req.id}`)}
                      className="py-2.5 px-3 text-slate-600 dark:text-zinc-400 font-normal text-xs cursor-pointer hover:underline"
                    >
                      {req.id}
                    </td>

                    {/* Right metadata: Time, Comments, ·, Heart */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-zinc-500">
                        <span className="text-[11px] font-normal">{req.timeAgoText}</span>

                        <div className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>{req.commentsCount}</span>
                        </div>

                        <span className="text-slate-300 dark:text-zinc-600">·</span>

                        <button
                          onClick={() => toggleLike(req.id)}
                          className={`p-0.5 hover:scale-110 transition-transform ${
                            req.isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
                          }`}
                          title="Like"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 stroke-[1.75] ${
                              req.isLiked ? 'fill-rose-500' : ''
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

      {/* Pagination Footer: 20 100 500 2500 */}
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
          Showing {Math.min(displayedRequests.length, pageSize)} of{' '}
          {filteredRequests.length} records
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestListView;

