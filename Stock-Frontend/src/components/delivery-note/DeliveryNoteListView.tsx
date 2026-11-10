import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare } from 'lucide-react';
import { useDeliveryNote } from '../../context';
import type { DeliveryNoteRecord } from '../../types';

export const DeliveryNoteListView: React.FC = () => {
  const {
    filteredNotes,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    setSelectedNote,
    pageSize,
    setPageSize,
  } = useDeliveryNote();

  const isAllSelected =
    filteredNotes.length > 0 && selectedIds.length === filteredNotes.length;

  const pageSizeOptions = [20, 100, 500, 2500];

  const displayedNotes = filteredNotes.slice(0, pageSize);

  const getStatusBadge = (status: DeliveryNoteRecord['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-rose-50 dark:bg-rose-950/60 text-[#E11D48] dark:text-[#FB7185]';
      case 'To Bill':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
      case 'Completed':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-[#34D399]';
      case 'Return Issued':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400';
      case 'Cancelled':
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-500 dark:text-zinc-400 line-through';
      default:
        return 'bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm overflow-hidden text-xs">
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          {/* Table Header from Image 1 & Image 2 */}
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
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[160px]">
                Customer Name
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[95px]">
                Status
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[110px]">
                Date
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[115px] text-right">
                Grand Total
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[140px]">
                % Amount Billed
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[140px]">
                % Returned
              </th>
              <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 min-w-[140px]">
                ID
              </th>
              <th className="py-2.5 px-3 font-normal text-right text-slate-500 dark:text-zinc-400 min-w-[110px]">
                <div className="flex items-center justify-end gap-1.5">
                  <span>
                    {displayedNotes.length > 0 ? `1 of ${displayedNotes.length}` : '0 of 0'}
                  </span>
                  <Heart className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
            {displayedNotes.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-zinc-500">
                  No Delivery Notes found
                </td>
              </tr>
            ) : (
              displayedNotes.map((note) => {
                const isSelected = selectedIds.includes(note.id);
                return (
                  <tr
                    key={note.id}
                    className={`transition-colors group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] ${
                      isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(note.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Customer Name (Bold, Clickable to Detail) */}
                    <td className="py-2.5 px-3">
                      <Link
                        to={`/delivery-note/${note.id}`}
                        className="text-left font-semibold text-slate-900 dark:text-zinc-100 hover:underline hover:text-slate-700 dark:hover:text-white transition-colors"
                      >
                        {note.customerName}
                      </Link>
                    </td>

                    {/* Status Pill Badge (Draft in soft pink pill) */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadge(
                          note.status
                        )}`}
                      >
                        {note.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">
                      {note.date}
                    </td>

                    {/* Grand Total */}
                    <td className="py-2.5 px-3 font-normal text-slate-800 dark:text-zinc-200 text-right">
                      $ {note.grandTotal.toFixed(2)}
                    </td>

                    {/* % Amount Billed (Capsule Progress Bar) */}
                    <td className="py-2.5 px-3">
                      <div className="w-24 sm:w-28 h-2 rounded-full bg-[#E5E7EB] dark:bg-[#27272A] overflow-hidden">
                        <div
                          className="h-full bg-slate-700 dark:bg-zinc-400 rounded-full transition-all duration-300"
                          style={{ width: `${note.perAmountBilled}%` }}
                        />
                      </div>
                    </td>

                    {/* % Returned (Capsule Progress Bar) */}
                    <td className="py-2.5 px-3">
                      <div className="w-24 sm:w-28 h-2 rounded-full bg-[#E5E7EB] dark:bg-[#27272A] overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full transition-all duration-300"
                          style={{ width: `${note.perReturned}%` }}
                        />
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400 font-normal text-xs">
                      <Link
                        to={`/delivery-note/${note.id}`}
                        className="hover:underline hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {note.id}
                      </Link>
                    </td>

                    {/* Right metadata: Time, Comments, ·, Heart */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-zinc-500">
                        <span className="text-[11px] font-normal">{note.timeAgoText}</span>

                        <div className="flex items-center gap-1 text-[11px]">
                          <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span>{note.commentsCount}</span>
                        </div>

                        <span className="text-slate-300 dark:text-zinc-600">·</span>

                        <button
                          onClick={() => toggleLike(note.id)}
                          className={`p-0.5 hover:scale-110 transition-transform ${
                            note.isLiked ? 'text-rose-500 fill-rose-500' : 'hover:text-rose-400'
                          }`}
                          title={note.isLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 stroke-[1.75] ${
                              note.isLiked ? 'fill-rose-500' : ''
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
          Showing {Math.min(displayedNotes.length, pageSize)} of {filteredNotes.length} records
        </div>
      </div>
    </div>
  );
};

export default DeliveryNoteListView;

