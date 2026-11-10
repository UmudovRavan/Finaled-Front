import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, ChevronDown, X, FileText, Plus } from 'lucide-react';
import { useDeliveryTrip } from '../context';

export const DeliveryTripPage: React.FC = () => {
  const {
    trips,
    filteredTrips,
    filterId,
    setFilterId,
    filterDriver,
    setFilterDriver,
    filterStatus,
    setFilterStatus,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useDeliveryTrip();

  const [sortField, setSortField] = useState('Created On');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const allSelected =
    filteredTrips.length > 0 && selectedIds.length === filteredTrips.length;

  const hasFilterActive = filterId !== '' || filterDriver !== '' || filterStatus !== '';

  return (
    <div className="space-y-3 font-sans">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[320px]">
          {/* ID ≈ Search Input */}
          <div className="relative w-40">
            <input
              type="text"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              placeholder="ID ≈"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Driver Name ≈ Search Input */}
          <div className="relative w-40">
            <input
              type="text"
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              placeholder="Driver Name ≈"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Status ↕ Select */}
          <div className="relative w-36">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all cursor-pointer"
            >
              <option value="">Status</option>
              <option value="Draft">Draft</option>
              <option value="In Transit">In Transit</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Filter ✕ Button */}
          {hasFilterActive && (
            <button
              type="button"
              onClick={() => {
                setFilterId('');
                setFilterDriver('');
                setFilterStatus('');
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
              {['Created On', 'Driver', 'Status', 'ID'].map((option) => (
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

      {/* Delivery Trip Table / Empty State */}
      {trips.length === 0 ? (
        <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-16 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-[#1E1E22] flex items-center justify-center mb-3 text-slate-400 dark:text-zinc-500">
            <FileText className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
            You haven't created a Delivery Trip yet
          </div>
          <Link
            to="/delivery-trip/new"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create your first Delivery Trip</span>
          </Link>
        </div>
      ) : (
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
                  <th className="py-2.5 px-3 font-normal">Driver</th>
                  <th className="py-2.5 px-3 font-normal">Vehicle</th>
                  <th className="py-2.5 px-3 font-normal">Status</th>
                  <th className="py-2.5 px-3 font-normal">Company</th>
                  <th className="py-2.5 px-3 text-right font-normal pr-4">
                    <div className="inline-flex items-center gap-1.5 text-slate-400 dark:text-zinc-400 text-[11px]">
                      <span>
                        {filteredTrips.length} of {trips.length}
                      </span>
                      <Heart className="w-3.5 h-3.5 stroke-[1.5]" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#202024] text-slate-700 dark:text-zinc-300">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-zinc-400">
                      No matching Delivery Trips found
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map((item) => {
                    const isChecked = selectedIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`group hover:bg-slate-50/70 dark:hover:bg-[#1C1C20] transition-colors ${
                          isChecked ? 'bg-slate-50/90 dark:bg-[#1E1E22]' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2.5 pl-3 pr-1 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(item.id)}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                          />
                        </td>

                        {/* ID */}
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          <Link
                            to={`/delivery-trip/${encodeURIComponent(item.id)}`}
                            className="hover:underline hover:text-black dark:hover:text-white"
                          >
                            {item.id}
                          </Link>
                        </td>

                        {/* Driver */}
                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-zinc-200">
                          {item.driver || '-'}
                        </td>

                        {/* Vehicle */}
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                          {item.vehicle || '-'}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              item.status === 'Completed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                                : item.status === 'In Transit'
                                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                                : item.status === 'Cancelled'
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Company */}
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                          {item.company}
                        </td>

                        {/* Meta Columns: TimeAgo, Comments, Heart */}
                        <td className="py-2.5 px-3 text-right pr-4">
                          <div className="inline-flex items-center gap-3 text-slate-400 dark:text-zinc-400 text-xs">
                            <span className="text-[11px] text-slate-400 dark:text-zinc-400">
                              {item.createdOn || 'now'}
                            </span>
                            <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-400">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{item.commentsCount || 0}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleLike(item.id)}
                              className={`p-0.5 hover:text-rose-500 transition-colors ${
                                item.isLiked ? 'text-rose-500 fill-rose-500' : 'text-slate-400'
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-rose-500' : ''}`}
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
      )}

      {/* Pagination Footer */}
      <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 dark:text-zinc-400 select-none">
        {[20, 100, 500, 2500].map((sz) => (
          <button
            key={sz}
            type="button"
            onClick={() => setPageSize(sz)}
            className={`px-2 py-0.5 rounded transition-colors ${
              pageSize === sz
                ? 'bg-slate-200 dark:bg-[#27272A] font-semibold text-slate-800 dark:text-zinc-200'
                : 'hover:bg-slate-100 dark:hover:bg-[#1E1E22]'
            }`}
          >
            {sz}
          </button>
        ))}
      </div>
    </div>
  );
};

