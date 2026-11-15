import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardCheck } from 'lucide-react';
import { useQualityInspection } from '../context';
import { stockService } from '../api';
import { BulkActionMenu } from '../components/common';

export const QualityInspectionPage: React.FC = () => {
  const {
    inspections,
    filteredInspections,
    loading,
    filterId,
    setFilterId,
    filterStatus,
    setFilterStatus,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    refreshInspections,
  } = useQualityInspection();

  const allSelected =
    filteredInspections.length > 0 && selectedIds.length === filteredInspections.length;

  return (
    <div className="space-y-4 font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-slate-500" />
            <span>Quality Inspection</span>
          </h1>
          <span className="text-slate-400 text-xs">({inspections.length})</span>
        </div>

        <Link
          to="/quality-inspection/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Quality Inspection</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            placeholder="Search ID, Item, Reference..."
            className="w-56 bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg outline-none text-xs"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg outline-none text-xs"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <BulkActionMenu
          selectedCount={selectedIds.length}
          onBulkDelete={async () => {
            await stockService.executeBulkAction('QualityInspection', 'Delete', selectedIds);
            await refreshInspections();
          }}
        />
      </div>

      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 text-[11px]">
              <th className="w-9 py-2.5 pl-3 pr-1 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded accent-black dark:accent-white"
                />
              </th>
              <th className="py-2.5 px-3 font-normal">ID</th>
              <th className="py-2.5 px-3 font-normal">Status</th>
              <th className="py-2.5 px-3 font-normal">Item Code</th>
              <th className="py-2.5 px-3 font-normal">Inspection Type</th>
              <th className="py-2.5 px-3 font-normal">Reference</th>
              <th className="py-2.5 px-3 font-normal">Report Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#202024]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Loading Quality Inspections...
                </td>
              </tr>
            ) : filteredInspections.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No Quality Inspections found.
                </td>
              </tr>
            ) : (
              filteredInspections.map((qi) => (
                <tr key={qi.id} className="hover:bg-slate-50/70 dark:hover:bg-[#1E1E22]/50">
                  <td className="py-2.5 pl-3 pr-1 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(qi.id)}
                      onChange={() => toggleSelect(qi.id)}
                      className="w-3.5 h-3.5 rounded accent-black dark:accent-white"
                    />
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    <Link
                      to={`/quality-inspection/${encodeURIComponent(qi.id)}`}
                      className="text-slate-900 dark:text-white hover:underline"
                    >
                      {qi.inspectionNo || qi.id}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        qi.qualityStatus === 'Accepted' && qi.documentStatus === 'Submitted'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : qi.qualityStatus === 'Rejected' || qi.documentStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {qi.documentStatus === 'Draft' ? 'Draft' : qi.qualityStatus || qi.documentStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">{qi.itemCode}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">{qi.inspectionType}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                    {qi.referenceType ? `${qi.referenceType}: ${qi.referenceDocumentNo || '-'}` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">{qi.reportDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
