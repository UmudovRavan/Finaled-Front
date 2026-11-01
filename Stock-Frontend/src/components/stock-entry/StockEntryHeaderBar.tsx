import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  RotateCw,
  MoreHorizontal,
  Plus,
  ChevronsUpDown,
  Table,
  Gauge,
  Kanban,
  List,
  Check,
  FileSpreadsheet,
  Shield,
  Sliders,
  Settings,
} from 'lucide-react';
import { useStockEntry } from '../../context';
import type { StockViewMode } from '../../types';

export const StockEntryHeaderBar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    savedFilter,
    setSavedFilter,
    refresh,
    isRefreshing,
    setIsAddModalOpen,
  } = useStockEntry();

  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isSavedFiltersOpen, setIsSavedFiltersOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const viewMenuRef = useRef<HTMLDivElement>(null);
  const savedFiltersRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setIsViewMenuOpen(false);
      }
      if (savedFiltersRef.current && !savedFiltersRef.current.contains(e.target as Node)) {
        setIsSavedFiltersOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewOptions: { id: StockViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'list', label: 'List View', icon: <List className="w-3.5 h-3.5" /> },
    { id: 'report', label: 'Report View', icon: <Table className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Dashboard View', icon: <Gauge className="w-3.5 h-3.5" /> },
    { id: 'kanban', label: 'Kanban View', icon: <Kanban className="w-3.5 h-3.5" /> },
  ];

  const currentViewLabel =
    viewOptions.find((v) => v.id === viewMode)?.label || 'List View';

  const savedFilterOptions = [
    'All',
    'Draft',
    'Submitted',
    'Material Receipt',
    'Material Issue',
    'Material Transfer',
    'Manufacture',
    'Repack',
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-[#27272A]">
      {/* Left: Breadcrumbs ⌂ / Stock / Stock Entry */}
      <div className="flex items-center gap-2 text-xs font-medium select-none">
        <Link
          to="/"
          className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          title="Home"
        >
          <Home className="w-3.5 h-3.5 stroke-[1.75]" />
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <Link
          to="/"
          className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          Stock
        </Link>
        <span className="text-slate-300 dark:text-zinc-600">/</span>
        <span className="text-slate-900 dark:text-white font-semibold">Stock Entry</span>
      </div>

      {/* Right: Actions from Image 1, 2, 3 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* 1. List View ↕ (Image 2 Dropdown) */}
        <div className="relative" ref={viewMenuRef}>
          <button
            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
          >
            <List className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentViewLabel}</span>
            <ChevronsUpDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Image 2 Dropdown items */}
          {isViewMenuOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              {viewOptions.map((opt) => {
                const isSelected = viewMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setViewMode(opt.id);
                      setIsViewMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#242428] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Saved Filters ↕ */}
        <div className="relative" ref={savedFiltersRef}>
          <button
            onClick={() => setIsSavedFiltersOpen(!isSavedFiltersOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-normal bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] text-slate-700 dark:text-zinc-200 shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
          >
            <span>Saved Filters</span>
            <ChevronsUpDown className="w-3 h-3 text-slate-400" />
          </button>

          {isSavedFiltersOpen && (
            <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500">
                Preset Filters
              </div>
              {savedFilterOptions.map((filter) => {
                const isSelected = savedFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => {
                      setSavedFilter(filter);
                      setIsSavedFiltersOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#242428] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{filter}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Refresh Button ↻ */}
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all disabled:opacity-50"
          title="Refresh List"
        >
          <RotateCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`}
          />
        </button>

        {/* 4. Three dots menu ... (Image 3 Dropdown) */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
            title="More Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Image 3 Dropdown items */}
          {isMoreMenuOpen && (
            <div className="absolute right-0 top-9 z-50 w-52 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-[#27272A]">
              <div className="py-1">
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  <span>Import</span>
                </button>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>User Permissions</span>
                </button>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role Permissions Manager</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customize</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
                </button>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customize Quick Filters</span>
                </button>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>List Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. + Add Stock Entry (Solid Black Button from Image 1) */}
        <Link
          to="/stock-entry/new"
          className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Stock Entry</span>
        </Link>
      </div>
    </div>
  );
};

