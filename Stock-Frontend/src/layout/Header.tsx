import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  MoreHorizontal,
  Sun,
  Moon,
  Check,
  RotateCw,
  Plus,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  List,
  Table,
  Gauge,
  Kanban,
  FileSpreadsheet,
  Shield,
  Sliders,
  Settings,
} from 'lucide-react';
import { useTheme, useLanguage, useStockEntry } from '../context';
import type { StockViewMode } from '../types';

interface HeaderProps {
  onPageOptions?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPageOptions }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Stock Entry specific dropdowns
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isSavedFiltersOpen, setIsSavedFiltersOpen] = useState(false);
  const [isStockMoreMenuOpen, setIsStockMoreMenuOpen] = useState(false);

  // Detail actions dropdowns
  const [isDetailCreateOpen, setIsDetailCreateOpen] = useState(false);
  const [isDetailGetItemsOpen, setIsDetailGetItemsOpen] = useState(false);
  const [isDetailPreviewOpen, setIsDetailPreviewOpen] = useState(false);

  const pageMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const savedFiltersRef = useRef<HTMLDivElement>(null);
  const stockMoreMenuRef = useRef<HTMLDivElement>(null);
  const detailCreateRef = useRef<HTMLDivElement>(null);
  const detailGetItemsRef = useRef<HTMLDivElement>(null);
  const detailPreviewRef = useRef<HTMLDivElement>(null);

  const isNewStockEntry = location.pathname.startsWith('/stock-entry/new');
  const isStockEntryList = location.pathname === '/stock-entry';
  const isStockEntryDetail =
    location.pathname.startsWith('/stock-entry/') && !isNewStockEntry;
  const isStockEntry = isStockEntryList || isNewStockEntry || isStockEntryDetail;
  const isDashboard = location.pathname.startsWith('/dashboard');

  const stockEntry = useStockEntry();

  const detailId = isStockEntryDetail
    ? location.pathname.replace('/stock-entry/', '')
    : '';
  const currentDetailEntry =
    stockEntry.entries.find((e) => e.id === detailId) || stockEntry.entries[0];

  const currentDetailIndex = currentDetailEntry
    ? stockEntry.entries.findIndex((e) => e.id === currentDetailEntry.id)
    : 0;
  const prevDetailEntry =
    currentDetailIndex > 0 ? stockEntry.entries[currentDetailIndex - 1] : null;
  const nextDetailEntry =
    currentDetailIndex < stockEntry.entries.length - 1
      ? stockEntry.entries[currentDetailIndex + 1]
      : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pageMenuRef.current && !pageMenuRef.current.contains(e.target as Node)) {
        setIsPageMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setIsViewMenuOpen(false);
      }
      if (savedFiltersRef.current && !savedFiltersRef.current.contains(e.target as Node)) {
        setIsSavedFiltersOpen(false);
      }
      if (stockMoreMenuRef.current && !stockMoreMenuRef.current.contains(e.target as Node)) {
        setIsStockMoreMenuOpen(false);
      }
      if (detailCreateRef.current && !detailCreateRef.current.contains(e.target as Node)) {
        setIsDetailCreateOpen(false);
      }
      if (detailGetItemsRef.current && !detailGetItemsRef.current.contains(e.target as Node)) {
        setIsDetailGetItemsOpen(false);
      }
      if (detailPreviewRef.current && !detailPreviewRef.current.contains(e.target as Node)) {
        setIsDetailPreviewOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  ];

  const currentFlag = languages.find((l) => l.code === language)?.flag || '🇦🇿';

  const viewOptions: { id: StockViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'list', label: 'List View', icon: <List className="w-3.5 h-3.5" /> },
    { id: 'report', label: 'Report View', icon: <Table className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Dashboard View', icon: <Gauge className="w-3.5 h-3.5" /> },
    { id: 'kanban', label: 'Kanban View', icon: <Kanban className="w-3.5 h-3.5" /> },
  ];

  const currentViewLabel =
    viewOptions.find((v) => v.id === stockEntry?.viewMode)?.label || 'List View';

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
    <header className="sticky top-0 z-30 min-h-[48px] bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#27272A] px-4 sm:px-5 py-1.5 flex flex-wrap items-center justify-between gap-2 transition-colors duration-200">
      {/* Breadcrumb: [Home icon / Stock / Stock Entry] on Stock Entry, [Home / Build / Dashboard / Stock] on Dashboard, [Home / Stock] on Home */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-[#A1A1AA] select-none">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors" title="Home">
          <Home className="w-3.5 h-3.5 stroke-[1.75]" />
        </Link>
        {isStockEntryDetail ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/stock-entry" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock Entry
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">
              {currentDetailEntry?.title || 'Material Receipt'}
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-1 ${
                currentDetailEntry?.status === 'Draft'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500'
              }`}
            >
              {currentDetailEntry?.status || 'Draft'}
            </span>
          </>
        ) : isNewStockEntry ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/stock-entry" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock Entry
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">New Stock Entry</span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full ml-1">
              Not Saved
            </span>
          </>
        ) : isStockEntryList ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <Link to="/" className="text-slate-500 dark:text-[#71717A] hover:text-slate-900 dark:hover:text-white transition-colors">
              Stock
            </Link>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock Entry</span>
          </>
        ) : isDashboard ? (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-500 dark:text-[#71717A]">Build</span>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-500 dark:text-[#71717A]">Dashboard</span>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock</span>
          </>
        ) : (
          <>
            <span className="text-slate-300 dark:text-[#3F3F46]">/</span>
            <span className="text-slate-900 dark:text-white font-semibold">Stock</span>
          </>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* If on Stock Entry List, render Image 1, 2, 3 action buttons */}
        {isStockEntryList && stockEntry && (
          <>
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
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {viewOptions.map((opt) => {
                    const isSelected = stockEntry.viewMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          stockEntry.setViewMode(opt.id);
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
                    const isSelected = stockEntry.savedFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => {
                          stockEntry.setSavedFilter(filter);
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
              onClick={stockEntry.refresh}
              disabled={stockEntry.isRefreshing}
              className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all disabled:opacity-50"
              title="Refresh List"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${stockEntry.isRefreshing ? 'animate-spin text-indigo-500' : ''}`}
              />
            </button>

            {/* 4. Three dots menu ... (Image 3 Dropdown) */}
            <div className="relative" ref={stockMoreMenuRef}>
              <button
                onClick={() => setIsStockMoreMenuOpen(!isStockMoreMenuOpen)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] shadow-sm hover:bg-slate-50 dark:hover:bg-[#27272A] transition-all"
                title="More Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Image 3 Dropdown items */}
              {isStockMoreMenuOpen && (
                <div className="absolute right-0 top-9 z-50 w-52 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-[#27272A]">
                  <div className="py-1">
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                      <span>Import</span>
                    </button>
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>User Permissions</span>
                    </button>
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>Role Permissions Manager</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-slate-400" />
                        <span>Customize</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
                    </button>
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Customize Quick Filters</span>
                    </button>
                    <button
                      onClick={() => setIsStockMoreMenuOpen(false)}
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

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* If on Stock Entry Detail Page, render Image 1 Action Buttons */}
        {isStockEntryDetail && currentDetailEntry && (
          <>
            {/* Create ↕ */}
            <div className="relative" ref={detailCreateRef}>
              <button
                type="button"
                onClick={() => setIsDetailCreateOpen(!isDetailCreateOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>Create</span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {isDetailCreateOpen && (
                <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Material Receipt', 'Material Issue', 'Material Transfer'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        navigate('/stock-entry/new');
                        setIsDetailCreateOpen(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Get Items From ↕ */}
            <div className="relative" ref={detailGetItemsRef}>
              <button
                type="button"
                onClick={() => setIsDetailGetItemsOpen(!isDetailGetItemsOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>Get Items From</span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {isDetailGetItemsOpen && (
                <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  {['Purchase Order', 'Material Request', 'Bill of Materials (BOM)'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setIsDetailGetItemsOpen(false)}
                      className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview ↕ */}
            <div className="relative" ref={detailPreviewRef}>
              <button
                type="button"
                onClick={() => setIsDetailPreviewOpen(!isDetailPreviewOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
              >
                <span>Preview</span>
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {isDetailPreviewOpen && (
                <div className="absolute right-0 top-9 z-50 w-40 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      window.print();
                      setIsDetailPreviewOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                  >
                    Print Format
                  </button>
                </div>
              )}
            </div>

            {/* Previous < and Next > buttons */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-[#2E2E33] overflow-hidden bg-white dark:bg-[#1E1E22]">
              <button
                type="button"
                disabled={!prevDetailEntry}
                onClick={() => prevDetailEntry && navigate(`/stock-entry/${prevDetailEntry.id}`)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] disabled:opacity-40 text-slate-600 dark:text-zinc-400 transition-colors"
                title="Previous Document"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3.5 bg-slate-200 dark:bg-[#2E2E33]" />
              <button
                type="button"
                disabled={!nextDetailEntry}
                onClick={() => nextDetailEntry && navigate(`/stock-entry/${nextDetailEntry.id}`)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] disabled:opacity-40 text-slate-600 dark:text-zinc-400 transition-colors"
                title="Next Document"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ... More button */}
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
              title="More"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Submit Button (Image 1: Solid Black Pill) */}
            {currentDetailEntry.status === 'Draft' ? (
              <button
                type="button"
                onClick={() => stockEntry.updateStatus(currentDetailEntry.id, 'Submitted')}
                className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => stockEntry.updateStatus(currentDetailEntry.id, 'Cancelled')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
              >
                Cancel
              </button>
            )}

            <div className="w-px h-4 bg-slate-200 dark:bg-[#2E2E33] mx-0.5" />
          </>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Language Switcher */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs font-normal text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          >
            <span>{currentFlag}</span>
            <span className="uppercase text-[11px] font-medium">{language}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-50 text-xs animate-in fade-in duration-100">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code as any);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                    language === l.code
                      ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                      : 'text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#27272A]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </span>
                  {language === l.code && <Check className="w-3 h-3 text-slate-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Page Options Three Dots Button (hidden on Stock Entry since it has its own Image 3 dropdown) */}
        {!isStockEntry && (
          <div className="relative" ref={pageMenuRef}>
            <button
              onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
              title="Options"
            >
              <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {isPageMenuOpen && (
              <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-50 text-xs text-slate-700 dark:text-[#D4D4D8] animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setIsPageMenuOpen(false);
                    window.location.reload();
                  }}
                  className="w-full px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] text-left"
                >
                  Reload
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
