import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Plus, Check } from 'lucide-react';
import { useStockReconciliation } from '../../context';
import type { FilterRule } from '../../types';

export const StockReconciliationQuickFilters: React.FC = () => {
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
  } = useStockReconciliation();

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
    'Difference Account',
    'Cost Center',
  ];

  const fieldOptions = [
    'ID',
    'Difference Account',
    'Cost Center',
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

  const handleRemoveDraftRule = (id: string) => {
    setDraftRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleApplyFilters = () => {
    setFilterRules(draftRules.filter((r) => r.value.trim() !== ''));
    setIsFilterPopoverOpen(false);
  };

  const handleClearFilters = () => {
    setDraftRules([
      {
        id: 'rule-1',
        field: 'ID',
        operator: 'Equals',
        value: '',
      },
    ]);
    setFilterRules([]);
    setIsFilterPopoverOpen(false);
  };

  const hasActiveFilters = filterRules.length > 0;

  return (
    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-3 pb-2 text-xs">
      {/* Left 3 Quick Filters (Screenshot 1): ID ≈ | Difference Account | Cost Center */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. ID with ≈ button */}
        <div className="flex items-center bg-[#F3F4F6] dark:bg-[#202024] rounded-lg overflow-hidden border border-transparent focus-within:border-slate-300 dark:focus-within:border-[#2E2E33] w-36">
          <input
            type="text"
            placeholder="ID"
            value={quickFilters.id}
            onChange={(e) =>
              setQuickFilters((prev) => ({ ...prev, id: e.target.value }))
            }
            className="w-full bg-transparent px-2.5 py-1.5 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 outline-none text-xs"
          />
          <span className="px-2 py-1 text-slate-400 dark:text-zinc-500 border-l border-slate-200/80 dark:border-[#2E2E33] select-none font-mono text-[11px]">
            ≈
          </span>
        </div>

        {/* 2. Difference Account */}
        <div className="flex items-center bg-[#F3F4F6] dark:bg-[#202024] rounded-lg overflow-hidden border border-transparent focus-within:border-slate-300 dark:focus-within:border-[#2E2E33] w-36">
          <input
            type="text"
            placeholder="Difference Account"
            value={quickFilters.differenceAccount}
            onChange={(e) =>
              setQuickFilters((prev) => ({
                ...prev,
                differenceAccount: e.target.value,
              }))
            }
            className="w-full bg-transparent px-2.5 py-1.5 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 outline-none text-xs"
          />
        </div>

        {/* 3. Cost Center */}
        <div className="flex items-center bg-[#F3F4F6] dark:bg-[#202024] rounded-lg overflow-hidden border border-transparent focus-within:border-slate-300 dark:focus-within:border-[#2E2E33] w-36">
          <input
            type="text"
            placeholder="Cost Center"
            value={quickFilters.costCenter}
            onChange={(e) =>
              setQuickFilters((prev) => ({
                ...prev,
                costCenter: e.target.value,
              }))
            }
            className="w-full bg-transparent px-2.5 py-1.5 text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 outline-none text-xs"
          />
        </div>
      </div>

      {/* Right Controls: Filter × | Sort Order + Created On ∨ */}
      <div className="flex items-center gap-2 self-end lg:self-auto">
        {/* Filter Button + Clear × */}
        <div className="relative" ref={filterPopoverRef}>
          <div className="inline-flex items-center rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-slate-200/60 dark:border-[#2E2E33] overflow-hidden">
            <button
              type="button"
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-[#27272A] transition-colors font-medium text-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full text-[10px]">
                  {filterRules.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickFilters({ id: '', differenceAccount: '', costCenter: '' });
                handleClearFilters();
              }}
              className="px-2 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white border-l border-slate-200 dark:border-[#2E2E33] hover:bg-slate-200/60 dark:hover:bg-[#27272A] transition-colors"
              title="Clear Filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Popover */}
          {isFilterPopoverOpen && (
            <div className="absolute right-0 top-9 z-40 w-[440px] max-w-[92vw] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl p-4 space-y-3 animate-in fade-in duration-100">
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
                      className="w-1/3 bg-[#F3F4F6] dark:bg-[#27272A] px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none text-xs"
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
                      className="w-1/4 bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1.5 rounded-lg text-slate-700 dark:text-zinc-300 outline-none text-xs"
                    >
                      <option value="Equals">Equals</option>
                      <option value="Like">Like</option>
                      <option value="!=">!=</option>
                      <option value="In">In</option>
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
                      className="flex-1 bg-[#F3F4F6] dark:bg-[#27272A] px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveDraftRule(rule.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
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
                  className="flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add a Filter</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-zinc-300 hover:bg-slate-200 text-xs font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="px-3 py-1 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort Field Dropdown + Order Toggle */}
        <div className="relative" ref={sortRef}>
          <div className="inline-flex items-center rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-slate-200/60 dark:border-[#2E2E33] overflow-hidden">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1.5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-[#27272A] border-r border-slate-200 dark:border-[#2E2E33] transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 dark:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-[#27272A] transition-colors font-medium text-xs"
            >
              <span>{sortField}</span>
              <span className="text-slate-400 text-[10px]">∨</span>
            </button>
          </div>

          {isSortOpen && (
            <div className="absolute right-0 top-9 z-40 w-44 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 animate-in fade-in duration-100">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSortField(option);
                    setIsSortOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left text-xs transition-colors ${
                    sortField === option
                      ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]'
                  }`}
                >
                  <span>{option}</span>
                  {sortField === option && <Check className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockReconciliationQuickFilters;

