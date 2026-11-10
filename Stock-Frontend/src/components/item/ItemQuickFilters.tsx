import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Plus, Check } from 'lucide-react';
import { useItem } from '../../context';
import type { FilterRule } from '../../types';

export const ItemQuickFilters: React.FC = () => {
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
  } = useItem();

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
            field: 'Item Code',
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
    'Last Updated On',
    'Item Name',
    'ID',
    'Item Group',
    'Status',
  ];

  const fieldOptions = [
    'ID',
    'Item Name',
    'Status',
    'Item Group',
    'UOM',
    'Item Type',
    'Purpose',
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

  const handleClearAll = () => {
    setQuickFilters({
      id: '',
      itemName: '',
      itemGroup: '',
      variantOf: '',
      hasVariants: false,
    });
    setFilterRules([]);
    setDraftRules([
      {
        id: 'rule-1',
        field: 'ID',
        operator: 'Equals',
        value: '',
      },
    ]);
    setIsFilterPopoverOpen(false);
  };

  const hasActiveFilters =
    filterRules.length > 0 ||
    Boolean(
      quickFilters.id ||
      quickFilters.itemName ||
      quickFilters.itemGroup ||
      quickFilters.variantOf ||
      quickFilters.hasVariants
    );

  return (
    <div className="relative py-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* LEFT: Quick Filter Inputs matching Screenshot 1 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1. ID ≈ */}
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

          {/* 2. Item Name ≈ */}
          <div className="relative w-36">
            <input
              type="text"
              placeholder="Item Name"
              value={quickFilters.itemName}
              onChange={(e) =>
                setQuickFilters((prev) => ({ ...prev, itemName: e.target.value }))
              }
              className="w-full h-8 pl-3 pr-7 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none transition-colors text-xs"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-[11px] pointer-events-none select-none">
              ≈
            </span>
          </div>

          {/* 3. Item Group */}
          <div className="relative w-36">
            <input
              type="text"
              placeholder="Item Group"
              value={quickFilters.itemGroup}
              onChange={(e) =>
                setQuickFilters((prev) => ({ ...prev, itemGroup: e.target.value }))
              }
              className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none transition-colors text-xs"
            />
          </div>

          {/* 4. Variant Of */}
          <div className="relative w-36">
            <input
              type="text"
              placeholder="Variant Of"
              value={quickFilters.variantOf}
              onChange={(e) =>
                setQuickFilters((prev) => ({ ...prev, variantOf: e.target.value }))
              }
              className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none transition-colors text-xs"
            />
          </div>

          {/* 5. Has Variants (checkbox) */}
          <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#27272A] cursor-pointer text-slate-600 dark:text-zinc-300 text-xs select-none">
            <input
              type="checkbox"
              checked={quickFilters.hasVariants}
              onChange={(e) =>
                setQuickFilters((prev) => ({ ...prev, hasVariants: e.target.checked }))
              }
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
            />
            <span>Has Variants</span>
          </label>
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
              <span>{filterRules.length > 0 ? `Filters ${filterRules.length}` : 'Filter'}</span>
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
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 text-xs font-normal transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 stroke-[1.75] text-slate-500" />
              <span>{sortField}</span>
              <span className="text-[10px] text-slate-400 select-none">⌄</span>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-9 w-48 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1.5 z-40 text-xs animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Order
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setIsSortOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300"
                >
                  <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-[#2C2C2E]" />
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Field
                </div>
                {sortOptions.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setSortField(f);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-[#27272A] ${
                      sortField === f
                        ? 'text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    <span>{f}</span>
                    {sortField === f && (
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Popover Dropdown */}
      {isFilterPopoverOpen && (
        <div
          ref={filterPopoverRef}
          className="absolute right-0 top-12 z-50 w-[420px] max-w-[95vw] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-2xl p-4 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2C2C2E] pb-2">
            <span className="font-semibold text-xs text-slate-900 dark:text-white">
              Filter Rules
            </span>
            <button
              onClick={() => setIsFilterPopoverOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
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
                        r.id === rule.id ? { ...r, field: e.target.value } : r
                      )
                    )
                  }
                  className="w-1/3 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-zinc-200 outline-none"
                >
                  {fieldOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
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
                  className="w-1/3 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-zinc-200 outline-none"
                >
                  <option value="Equals">Equals</option>
                  <option value="Like">Like</option>
                  <option value="In">In</option>
                  <option value="!=">!=</option>
                </select>

                <input
                  type="text"
                  placeholder="value"
                  value={rule.value}
                  onChange={(e) =>
                    setDraftRules((prev) =>
                      prev.map((r) =>
                        r.id === rule.id ? { ...r, value: e.target.value } : r
                      )
                    )
                  }
                  className="w-1/3 bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#333] rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-zinc-200 outline-none"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveDraftRule(rule.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2C2C2E]">
            <button
              type="button"
              onClick={handleAddFilterRule}
              className="flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add row</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-medium hover:bg-black dark:hover:bg-zinc-200"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemQuickFilters;
