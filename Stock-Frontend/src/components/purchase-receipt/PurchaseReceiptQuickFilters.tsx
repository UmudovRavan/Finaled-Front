import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Plus, Check } from 'lucide-react';
import { usePurchaseReceipt } from '../../context';
import type { FilterRule } from '../../types';

export const PurchaseReceiptQuickFilters: React.FC = () => {
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
  } = usePurchaseReceipt();

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

  // Exact 16 sort options from Image 2
  const sortOptions = [
    'Last Updated On',
    'Created On',
    'Supplier Name',
    'ID',
    'Most Used',
    'Series',
    'Supplier',
    'Date',
    'Posting Time',
    'Company',
    'Currency',
    'Exchange Rate',
    'Net Total (Company Currency)',
    'Grand Total',
    'Status',
    '% Amount Billed',
    '% Returned',
  ];

  const fieldOptions = [
    'ID',
    'Supplier Name',
    'Status',
    'Company',
    'Date',
    'Grand Total',
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
    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 pb-2 text-xs">
      {/* Left side: 4 Quick Filter Pills from Image 1 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. ID ≈ */}
        <div className="relative w-36 sm:w-40">
          <input
            type="text"
            value={quickFilters.id}
            onChange={(e) =>
              setQuickFilters((prev) => ({ ...prev, id: e.target.value }))
            }
            placeholder="ID"
            className="w-full bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 pr-6 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 font-mono text-sm pointer-events-none select-none"
            title="Approximate match"
          >
            ≈
          </span>
        </div>

        {/* 2. Supplier Name ≈ */}
        <div className="relative w-44 sm:w-52">
          <input
            type="text"
            value={quickFilters.supplierName}
            onChange={(e) =>
              setQuickFilters((prev) => ({
                ...prev,
                supplierName: e.target.value,
              }))
            }
            placeholder="Supplier Name"
            className="w-full bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 pr-6 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 font-mono text-sm pointer-events-none select-none"
            title="Approximate match"
          >
            ≈
          </span>
        </div>

        {/* 3. Company */}
        <div className="w-36 sm:w-40">
          <input
            type="text"
            value={quickFilters.company}
            onChange={(e) =>
              setQuickFilters((prev) => ({
                ...prev,
                company: e.target.value,
              }))
            }
            placeholder="Company"
            className="w-full bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
        </div>

        {/* 4. Status ↕ */}
        <div className="w-32 sm:w-36">
          <select
            value={quickFilters.status}
            onChange={(e) =>
              setQuickFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] transition-all cursor-pointer"
          >
            <option value="">Status</option>
            <option value="Draft">Draft</option>
            <option value="To Bill">To Bill</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Right side: Filter Popover toggle & Sort dropdown */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        {/* = Filter × Button */}
        <div className="relative" ref={filterPopoverRef}>
          <button
            onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isFilterPopoverOpen || hasActiveFilters
                ? 'bg-slate-200 dark:bg-[#2E2E33] text-slate-900 dark:text-white border-slate-300 dark:border-[#3F3F46]'
                : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 border-transparent hover:bg-slate-200/80 dark:hover:bg-[#27272B]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2]" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterRules([]);
                }}
                className="ml-0.5 hover:text-rose-500"
                title="Clear all filters"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            {!hasActiveFilters && <X className="w-3.5 h-3.5 opacity-40 ml-0.5" />}
          </button>

          {/* Filter Popover with top arrow pointer */}
          {isFilterPopoverOpen && (
            <div className="absolute right-0 top-10 z-50 w-[360px] sm:w-[420px] bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-2xl shadow-2xl p-4 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="absolute -top-2 right-8 w-4 h-4 bg-white dark:bg-[#1E1E22] border-t border-l border-slate-200 dark:border-[#2E2E33] rotate-45 transform" />

              <div className="space-y-3 relative z-10">
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
                      className="w-1/3 bg-[#F3F4F6] dark:bg-[#27272B] text-slate-800 dark:text-zinc-200 px-2 py-1.5 rounded-lg border border-transparent outline-none text-xs"
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
                      className="w-1/4 bg-[#F3F4F6] dark:bg-[#27272B] text-slate-800 dark:text-zinc-200 px-2 py-1.5 rounded-lg border border-transparent outline-none text-xs"
                    >
                      <option value="Equals">Equals</option>
                      <option value="Like">Like</option>
                      <option value="In">In</option>
                      <option value="!=">!=</option>
                    </select>

                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) =>
                        setDraftRules((prev) =>
                          prev.map((r) =>
                            r.id === rule.id ? { ...r, value: e.target.value } : r
                          )
                        )
                      }
                      placeholder="Value..."
                      className="flex-1 bg-[#F3F4F6] dark:bg-[#27272B] text-slate-800 dark:text-zinc-200 px-2.5 py-1.5 rounded-lg border border-transparent outline-none text-xs"
                    />

                    {draftRules.length > 1 && (
                      <button
                        onClick={() => handleRemoveDraftRule(rule.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between">
                  <button
                    onClick={handleAddFilterRule}
                    className="flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-medium text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add a Filter</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearFilters}
                      className="px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white font-normal hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3.5 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ↕ Created On ⌵ (Image 2 Sort Menu) */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1.5 bg-[#F3F4F6] dark:bg-[#202024] hover:bg-slate-200/80 dark:hover:bg-[#27272B] text-slate-700 dark:text-zinc-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-transparent transition-all"
          >
            <ArrowUpDown className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>{sortField}</span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
              {sortOrder === 'asc' ? '▲' : '▼'}
            </span>
          </button>

          {/* Image 2 Dropdown */}
          {isSortOpen && (
            <div className="absolute right-0 top-10 z-50 w-64 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100 max-h-84 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500 tracking-wider">
                Sort By
              </div>
              {sortOptions.map((opt) => {
                const isSelected = sortField === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (isSelected) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField(opt);
                        setSortOrder('desc');
                      }
                      setIsSortOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-[#27272B] text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#242428] hover:text-slate-900 dark:hover:text-white font-normal'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-800 dark:text-zinc-200" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseReceiptQuickFilters;

