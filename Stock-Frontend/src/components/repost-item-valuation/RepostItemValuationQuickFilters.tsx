import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Plus, Check, ChevronsUpDown } from 'lucide-react';
import { useRepostItemValuation } from '../../context';
import type { FilterRule } from '../../types';

export const RepostItemValuationQuickFilters: React.FC = () => {
  const {
    quickFilters,
    setQuickFilters,
    filterRules,
    setFilterRules,
    isFilterPopoverOpen,
    setIsFilterPopoverOpen,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
  } = useRepostItemValuation();

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  const [draftRules, setDraftRules] = useState<FilterRule[]>([]);

  useEffect(() => {
    if (isFilterPopoverOpen) {
      if (filterRules.length === 0) {
        setDraftRules([
          {
            id: 'rule-1',
            field: 'ID',
            operator: 'Equals',
            value: '',
          },
        ]);
      } else {
        setDraftRules([...filterRules]);
      }
    }
  }, [isFilterPopoverOpen, filterRules]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(e.target as Node)
      ) {
        setIsFilterPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsFilterPopoverOpen]);

  const sortOptions = [
    'Created On',
    'Last Updated On',
    'ID',
    'Status',
    'Voucher Type',
    'Voucher No',
  ];

  const statusOptions = [
    'Queued',
    'In Progress',
    'Completed',
    'Failed',
    'Cancelled',
  ];

  const fieldOptions = [
    'ID',
    'Status',
    'Voucher Type',
    'Voucher No',
    'Company',
    'Item Code',
    'Warehouse',
  ];

  const handleAddFilterRule = () => {
    setDraftRules((prev) => [
      ...prev,
      {
        id: `rule-${Date.now()}`,
        field: 'ID',
        operator: 'Equals',
        value: '',
      },
    ]);
  };

  const handleRemoveFilterRule = (id: string) => {
    setDraftRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApplyFilters = () => {
    setFilterRules(draftRules.filter((r) => r.value.trim() !== ''));
    setIsFilterPopoverOpen(false);
  };

  const handleClearAll = () => {
    setQuickFilters({
      id: '',
      voucherType: '',
      voucherNo: '',
      status: '',
    });
    setFilterRules([]);
    setIsFilterPopoverOpen(false);
  };

  const hasActiveFilters =
    Boolean(quickFilters.id) ||
    Boolean(quickFilters.voucherType) ||
    Boolean(quickFilters.voucherNo) ||
    Boolean(quickFilters.status) ||
    filterRules.length > 0;

  return (
    <div className="relative font-sans text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2.5 py-1">
        {/* LEFT: Quick Search Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* ID input */}
          <div className="relative w-36">
            <input
              type="text"
              placeholder="ID"
              value={quickFilters.id}
              onChange={(e) =>
                setQuickFilters((prev) => ({ ...prev, id: e.target.value }))
              }
              className="w-full h-8 pl-3 pr-7 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none transition-colors text-xs"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-[11px] pointer-events-none select-none">
              ≈
            </span>
          </div>

          {/* Voucher Type input */}
          <div className="w-36">
            <input
              type="text"
              placeholder="Voucher Type"
              value={quickFilters.voucherType}
              onChange={(e) =>
                setQuickFilters((prev) => ({
                  ...prev,
                  voucherType: e.target.value,
                }))
              }
              className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none transition-colors text-xs"
            />
          </div>

          {/* Voucher No input */}
          <div className="w-36">
            <input
              type="text"
              placeholder="Voucher No"
              value={quickFilters.voucherNo}
              onChange={(e) =>
                setQuickFilters((prev) => ({
                  ...prev,
                  voucherNo: e.target.value,
                }))
              }
              className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none transition-colors text-xs"
            />
          </div>

          {/* Status dropdown */}
          <div className="relative w-36" ref={statusRef}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
              className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-left text-slate-800 dark:text-zinc-200 rounded-lg border border-transparent flex items-center justify-between text-xs transition-colors"
            >
              <span
                className={
                  quickFilters.status
                    ? 'text-slate-800 dark:text-zinc-200'
                    : 'text-slate-400 dark:text-zinc-500'
                }
              >
                {quickFilters.status || 'Status'}
              </span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0 ml-1" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute left-0 mt-1 w-full bg-white dark:bg-[#202024] rounded-lg shadow-lg border border-slate-200 dark:border-[#2E2E33] py-1 z-30">
                <button
                  type="button"
                  onClick={() => {
                    setQuickFilters((prev) => ({ ...prev, status: '' }));
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors ${
                    !quickFilters.status
                      ? 'text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  Status (All)
                </button>
                {statusOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setQuickFilters((prev) => ({ ...prev, status: opt }));
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors ${
                      quickFilters.status === opt
                        ? 'text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Filter Button Group + Sort Button */}
        <div className="flex items-center gap-2">
          {/* Filter & Clear Button Group */}
          <div className="inline-flex items-center rounded-lg bg-[#F4F5F7] dark:bg-[#202024] p-0.5 border border-transparent">
            <button
              type="button"
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md text-xs font-normal transition-colors ${
                isFilterPopoverOpen || filterRules.length > 0
                  ? 'bg-white dark:bg-[#27272A] text-slate-900 dark:text-white shadow-xs font-medium'
                  : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Filter</span>
              {filterRules.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] flex items-center justify-center font-semibold">
                  {filterRules.length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="h-7 px-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-md transition-colors"
                title="Clear Filters"
              >
                <X className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="h-8 px-2.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 rounded-lg flex items-center gap-1.5 text-xs font-normal transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 stroke-[1.75] text-slate-500 dark:text-zinc-400" />
              <span>{sortField}</span>
              <span className="text-[10px] text-slate-400 ml-0.5">
                {sortOrder === 'asc' ? '↑' : '⌄'}
              </span>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#202024] rounded-lg shadow-lg border border-slate-200 dark:border-[#2E2E33] py-1 z-30">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Sort By
                </div>
                {sortOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      if (sortField === opt) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField(opt);
                        setSortOrder('desc');
                      }
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs flex items-center justify-between transition-colors ${
                      sortField === opt
                        ? 'text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <span>{opt}</span>
                    {sortField === opt && (
                      <span className="text-[11px] text-slate-400">
                        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTER POPOVER / MODAL */}
      {isFilterPopoverOpen && (
        <div
          ref={filterPopoverRef}
          className="absolute right-0 top-11 z-40 w-full sm:w-[460px] bg-white dark:bg-[#1E1E22] rounded-xl shadow-xl border border-slate-200 dark:border-[#2E2E33] p-4 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#27272A]">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
              Filters
            </h4>
            <button
              type="button"
              onClick={() => setIsFilterPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {draftRules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-2">
                <select
                  value={rule.field}
                  onChange={(e) =>
                    setDraftRules((prev) =>
                      prev.map((r) =>
                        r.id === rule.id ? { ...r, field: e.target.value } : r
                      )
                    )
                  }
                  className="w-1/3 h-8 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#323238] rounded-md px-2 text-xs text-slate-700 dark:text-zinc-200 outline-none"
                >
                  {fieldOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                <select
                  value={rule.operator}
                  onChange={(e) =>
                    setDraftRules((prev) =>
                      prev.map((r) =>
                        r.id === rule.id
                          ? { ...r, operator: e.target.value as any }
                          : r
                      )
                    )
                  }
                  className="w-1/4 h-8 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#323238] rounded-md px-2 text-xs text-slate-700 dark:text-zinc-200 outline-none"
                >
                  <option value="Equals">Equals</option>
                  <option value="Like">Like</option>
                  <option value="!=">!=</option>
                </select>

                <input
                  type="text"
                  placeholder="Value"
                  value={rule.value}
                  onChange={(e) =>
                    setDraftRules((prev) =>
                      prev.map((r) =>
                        r.id === rule.id ? { ...r, value: e.target.value } : r
                      )
                    )
                  }
                  className="flex-1 h-8 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#323238] rounded-md px-2 text-xs text-slate-800 dark:text-zinc-200 outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveFilterRule(rule.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={handleAddFilterRule}
              className="text-xs text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add filter</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-3 py-1.5 rounded-md text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-slate-900 font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepostItemValuationQuickFilters;

