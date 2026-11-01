import React, { useState, useRef, useEffect } from 'react';
import {
  Filter,
  MoreHorizontal,
  RefreshCw,
  Edit2,
  RotateCcw,
  Download,
  Check,
} from 'lucide-react';

interface StockValueChartProps {
  onRefresh?: () => void;
}

export const StockValueChart: React.FC<StockValueChartProps> = ({ onRefresh }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState('Stock Value by Item Group');
  const [itemGroupName, setItemGroupName] = useState('Demo Item Group');
  const [stockValue, setStockValue] = useState(95.39);
  const [lastSynced, setLastSynced] = useState('14 minutes ago');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'central' | 'regional'>('all');

  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsMenuOpen(false);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSynced('just now');
      if (onRefresh) onRefresh();
    }, 600);
  };

  const handleReset = () => {
    setChartTitle('Stock Value by Item Group');
    setItemGroupName('Demo Item Group');
    setStockValue(95.39);
    setActiveFilter('all');
    setIsMenuOpen(false);
  };

  const handleExport = () => {
    setIsMenuOpen(false);
    const csvContent =
      'data:text/csv;charset=utf-8,Item Group,Stock Value (K),Currency\n' +
      `${itemGroupName},${stockValue},AZN\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock_value_by_item_group_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Y-axis tick values (100 K down to 0)
  const yTicks = ['100 K', '80 K', '60 K', '40 K', '20 K', '0'];
  // Height percentage
  const barHeightPercent = Math.min(100, Math.max(10, (stockValue / 100) * 100));

  return (
    <div className="w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 shadow-xs relative transition-colors duration-200">
      {/* Header (Refined CRM Typography) */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">
            {chartTitle}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-[#71717A] mt-0.5 flex items-center gap-1.5">
            <span>Last synced {lastSynced}</span>
            {isRefreshing && (
              <RefreshCw className="w-2.5 h-2.5 text-slate-400 animate-spin" />
            )}
          </p>
        </div>

        {/* Action icons: Filter and 3-dots */}
        <div className="flex items-center gap-1">
          {/* Filter button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors ${
                isFilterOpen ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white' : ''
              }`}
              title="Filter"
            >
              <Filter className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-40 text-xs text-slate-700 dark:text-[#D4D4D8] animate-in fade-in duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Filter Warehouse
                </div>
                {[
                  { id: 'all', label: 'All Warehouses' },
                  { id: 'central', label: 'Central Head' },
                  { id: 'regional', label: 'Regional' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFilter(f.id as any);
                      setIsFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                  >
                    <span>{f.label}</span>
                    {activeFilter === f.id && <Check className="w-3 h-3 text-slate-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Three dots button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors ${
                isMenuOpen ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white' : ''
              }`}
              title="Options"
            >
              <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-40 text-xs text-slate-700 dark:text-[#D4D4D8] animate-in fade-in duration-100">
                <button
                  onClick={handleRefresh}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleReset}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Chart</span>
                </button>
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-900 dark:text-white font-medium transition-colors text-left"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full mt-2">
        <div className="relative h-60 sm:h-64 w-full flex">
          {/* Y-axis Labels */}
          <div className="w-10 sm:w-12 flex flex-col justify-between text-right pr-2 text-[10.5px] font-normal text-slate-400 dark:text-[#71717A] select-none pb-5">
            {yTicks.map((tick, i) => (
              <span key={i} className="leading-none">
                {tick}
              </span>
            ))}
          </div>

          {/* Grid and Bars Area */}
          <div className="flex-1 relative flex flex-col justify-between pb-5">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 pb-5 flex flex-col justify-between pointer-events-none">
              {yTicks.map((_, i) => (
                <div
                  key={i}
                  className="w-full border-b border-slate-100 dark:border-[#27272A]/60"
                />
              ))}
            </div>

            {/* Flat Matte Bar matching Screenshot (NO neon glow) */}
            <div className="absolute inset-x-0 bottom-5 top-0 flex items-end justify-center pointer-events-auto">
              <div
                className="group relative w-3/5 sm:w-1/2 max-w-sm rounded-t-xs transition-all duration-200 cursor-pointer hover:opacity-95"
                style={{
                  height: `${barHeightPercent}%`,
                  backgroundColor: '#F472B6', // clean soft flat pink matching screenshot
                }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10.5px] font-medium px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  {itemGroupName}: {stockValue.toFixed(3)} K
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* X-axis Label */}
        <div className="flex justify-center pl-10 sm:pl-12 pt-1.5">
          <span className="text-[11.5px] font-normal text-slate-500 dark:text-[#A1A1AA]">
            {itemGroupName}
          </span>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 shadow-xl text-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
              Edit Chart
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-[#A1A1AA] mb-1">Title</label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className="w-full rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-[#A1A1AA] mb-1">Item Group Name</label>
                <input
                  type="text"
                  value={itemGroupName}
                  onChange={(e) => setItemGroupName(e.target.value)}
                  className="w-full rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-[#A1A1AA] mb-1">Stock Value (K)</label>
                <input
                  type="number"
                  step="0.1"
                  value={stockValue}
                  onChange={(e) => setStockValue(Number(e.target.value))}
                  className="w-full rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#27272A]"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
