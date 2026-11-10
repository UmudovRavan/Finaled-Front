import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Plus, Check } from 'lucide-react';
import { useLandedCostVoucher } from '../../context';
import type { FilterRule } from '../../types';

export const LandedCostVoucherQuickFilters: React.FC = () => {
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
  } = useLandedCostVoucher();

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
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
    'Posting Date',
    'ID',
    'Status',
    'Company',
  ];

  const fieldOptions = [
    'ID',
    'Company',
    'Status',
    'Posting Date',
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
      company: '',
    });
    setFilterRules([]);
    setDraftRules([]);
  };

  const hasActiveFilters =
    Boolean(quickFilters.id) ||
    Boolean(quickFilters.company) ||
    filterRules.length > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* LEFT FILTERS */}
      <div className="flex flex-wrap items-center gap-2">
        {/* ID Filter Input with ≈ */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="ID"
            value={quickFilters.id}
            onChange={(e) =>
              setQuickFilters((prev) => ({ ...prev, id: e.target.value }))
            }
            className="w-36 bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EAEBED] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 px-3 py-1.5 rounded-lg text-xs outline-none border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] transition-all"
          />
          <button
            type="button"
            className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 text-xs select-none"
            title="Like comparison"
          >
            ≈
          </button>
        </div>

        {/* Company Filter Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Company"
            value={quickFilters.company}
            onChange={(e) =>
              setQuickFilters((prev) => ({
                ...prev,
                company: e.target.value,
              }))
            }
            className="w-40 bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EAEBED] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 px-3 py-1.5 rounded-lg text-xs outline-none border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] transition-all"
          />
        </div>

        {/* Filter and Clear Filter Buttons Group (Screenshot 1: "Filter  x") */}
        <div className="relative flex items-center rounded-lg bg-[#F3F4F6] dark:bg-[#202024] p-0.5 border border-transparent">
          <button
            type="button"
            onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-normal transition-colors ${
              filterRules.length > 0
                ? 'bg-white dark:bg-[#2E2E33] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {filterRules.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] flex items-center justify-center font-bold">
                {filterRules.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            title="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Filter Popover */}
          {isFilterPopoverOpen && (
            <div
              ref={filterPopoverRef}
              className="absolute top-9 left-0 w-80 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl shadow-xl p-3 z-50 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#27272A] pb-2">
                <span className="font-semibold text-slate-900 dark:text-white text-xs">
                  Filter By
                </span>
                <button
                  type="button"
                  onClick={() => setIsFilterPopoverOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {draftRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-1.5">
                    <select
                      value={rule.field}
                      onChange={(e) =>
                        setDraftRules((prev) =>
                          prev.map((r) =>
                            r.id === rule.id
                              ? { ...r, field: e.target.value }
                              : r
                          )
                        )
                      }
                      className="w-28 bg-[#F3F4F6] dark:bg-[#202024] px-2 py-1 rounded text-xs text-slate-800 dark:text-zinc-200 outline-none"
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
                              ? {
                                  ...r,
                                  operator: e.target.value as FilterRule['operator'],
                                }
                              : r
                          )
                        )
                      }
                      className="w-24 bg-[#F3F4F6] dark:bg-[#202024] px-2 py-1 rounded text-xs text-slate-800 dark:text-zinc-200 outline-none"
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
                            r.id === rule.id
                              ? { ...r, value: e.target.value }
                              : r
                          )
                        )
                      }
                      className="flex-1 bg-[#F3F4F6] dark:bg-[#202024] px-2 py-1 rounded text-xs text-slate-800 dark:text-zinc-200 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveFilterRule(rule.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#27272A]">
                <button
                  type="button"
                  onClick={handleAddFilterRule}
                  className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Filter</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-zinc-300 px-2 py-1"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="text-[11px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1 rounded-md font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SORT DROPDOWN (Screenshot 1: "Created On ⌄" with ⇅ icon) */}
      <div className="relative" ref={sortRef}>
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EAEBED] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 text-xs font-normal transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>
            {sortField === 'createdOn'
              ? 'Created On'
              : sortField === 'postingDate'
              ? 'Posting Date'
              : sortField === 'id'
              ? 'ID'
              : sortField === 'company'
              ? 'Company'
              : sortField === 'status'
              ? 'Status'
              : sortField}
          </span>
          <span className="text-slate-400 text-[10px]">
            {sortOrder === 'asc' ? '▲' : '▼'}
          </span>
        </button>

        {isSortOpen && (
          <div className="absolute right-0 top-9 w-44 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl shadow-xl py-1.5 z-50 text-xs">
            <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Sort By
            </div>
            {sortOptions.map((opt) => {
              const fieldKey =
                opt === 'Created On'
                  ? 'createdOn'
                  : opt === 'Posting Date'
                  ? 'postingDate'
                  : opt === 'ID'
                  ? 'id'
                  : opt === 'Company'
                  ? 'company'
                  : 'status';
              const isSelected = sortField === fieldKey;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(fieldKey);
                      setSortOrder('desc');
                    }
                    setIsSortOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-left text-slate-700 dark:text-zinc-200"
                >
                  <span>{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
