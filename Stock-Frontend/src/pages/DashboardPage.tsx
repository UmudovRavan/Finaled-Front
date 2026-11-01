import React, { useState, useRef, useEffect } from 'react';
import {
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StockKpiCard } from '../components/StockKpiCard';
import { ChartOptionsMenu } from '../components/ChartOptionsMenu';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Sync state
  const [lastSynced, setLastSynced] = useState('24 minutes ago');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Time range & frequency states for trends
  const [prRange, setPrRange] = useState('Last Year');
  const [prFrequency, setPrFrequency] = useState('Monthly');
  const [isPrFreqOpen, setIsPrFreqOpen] = useState(false);
  const [isPrRangeOpen, setIsPrRangeOpen] = useState(false);

  const [delRange, setDelRange] = useState('Last Year');
  const [delFrequency, setDelFrequency] = useState('Monthly');
  const [isDelFreqOpen, setIsDelFreqOpen] = useState(false);
  const [isDelRangeOpen, setIsDelRangeOpen] = useState(false);

  // Edit Modal State
  const [editModalTitle, setEditModalTitle] = useState<string | null>(null);

  const prFreqRef = useRef<HTMLDivElement>(null);
  const prRangeRef = useRef<HTMLDivElement>(null);
  const delFreqRef = useRef<HTMLDivElement>(null);
  const delRangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (prFreqRef.current && !prFreqRef.current.contains(e.target as Node)) {
        setIsPrFreqOpen(false);
      }
      if (prRangeRef.current && !prRangeRef.current.contains(e.target as Node)) {
        setIsPrRangeOpen(false);
      }
      if (delFreqRef.current && !delFreqRef.current.contains(e.target as Node)) {
        setIsDelFreqOpen(false);
      }
      if (delRangeRef.current && !delRangeRef.current.contains(e.target as Node)) {
        setIsDelRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const frequencyOptions = ['Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily'];
  const rangeOptions = ['Last Year', 'Last 6 Months', 'This Year', 'All Time'];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSynced('just now');
    }, 500);
  };

  const handleExport = (chartName: string, dataRows: string) => {
    const csvContent = `data:text/csv;charset=utf-8,${chartName}\n` + dataRows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${chartName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Data for Warehouse wise Stock Value (Image 1)
  const warehouseBars = [
    { name: 'Devam Eden İşler - AD', value: 175, height: 87.5 },
    { name: 'Bitmiş Ürünler - AD', value: 50, height: 25 },
    { name: 'Taşıma Halindeki Ürünl ...', value: 40, height: 20 },
    { name: 'Mağazalar - AD', value: 38, height: 19 },
  ];
  const whYAxis = ['200 K', '150 K', '100 K', '50 K', '0'];

  // Trend months for Purchase & Delivery (Image 2)
  const trendMonths = ['Nov 2025', 'Jan 2026', 'Mar 2026', 'May 2026', 'Jul 2026', 'Sep 2026', 'Nov 2026'];
  const trendYAxis = ['5', '4', '3', '2', '1', '0'];

  // Oldest Items (Image 2 - Blue bars descending)
  const oldestItems = [
    { sku: 'SKU-001', label: 'SK ...', value: 690, height: 86.25 },
    { sku: 'SKU-002', label: 'SK ...', value: 500, height: 62.5 },
    { sku: 'SKU-003', label: 'SK ..', value: 460, height: 57.5 },
    { sku: 'SKU-004', label: 'SK ...', value: 400, height: 50 },
    { sku: 'SKU-005', label: 'SK ...', value: 330, height: 41.25 },
    { sku: 'SKU-006', label: 'SK ...', value: 290, height: 36.25 },
    { sku: 'SKU-007', label: 'SK ..', value: 140, height: 17.5 },
    { sku: 'SKU-008', label: 'SK ...', value: 85, height: 10.6 },
  ];
  const oldestYAxis = ['800.00', '600.00', '400.00', '200.00', '0'];

  // Item Shortage Summary (Image 2 - Pink hanging bars downwards from 0)
  const shortageItems = [
    { sku: 'SKU006', value: -100, depth: 100 },
    { sku: 'SKU007', value: -100, depth: 100 },
    { sku: 'SKU010', value: -50, depth: 50 },
    { sku: 'SKU009', value: -40, depth: 40 },
    { sku: 'SKU008', value: -20, depth: 20 },
    { sku: 'SKU002', value: -15, depth: 15 },
  ];
  const shortageYAxis = ['0', '-25', '-50', '-75', '-100.00'];

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. Three KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <StockKpiCard
          title="Total Active Items"
          value="10"
          subtitle="0 % since last month"
          onViewDetails={() => navigate('/products')}
        />
        <StockKpiCard
          title="Total Warehouses"
          value="5"
          subtitle="0 % since last month"
          onViewDetails={() => navigate('/warehouses')}
        />
        <StockKpiCard
          title="Total Stock Value"
          value="95.390 K"
          subtitle="0 % since yesterday"
          onViewDetails={() => navigate('/products')}
        />
      </section>

      {/* 2. Warehouse wise Stock Value (Full Width) */}
      <section className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs transition-colors duration-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">
              Warehouse wise Stock Value
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-[#71717A] mt-0.5">
              Last synced {lastSynced}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors">
              <Filter className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>

            {/* Exact 5-option 3-dots Menu (Refresh, Edit, Reset Chart, Export, Item List) */}
            <ChartOptionsMenu
              onRefresh={handleRefresh}
              onEdit={() => setEditModalTitle('Warehouse wise Stock Value')}
              onReset={() => alert('Warehouse wise Stock Value chart reset to default.')}
              onExport={() => handleExport('Warehouse wise Stock Value', 'Warehouse,Value (K)\nDevam Eden Isler - AD,175\nBitmis Urunler - AD,50\nTasima Halindeki Urunler,40\nMagazalar - AD,38\n')}
              onItemList={() => navigate('/products')}
            />
          </div>
        </div>

        {/* 4 Pink Bars Chart */}
        <div className="w-full mt-2">
          <div className="relative h-60 sm:h-64 w-full flex">
            {/* Y Axis */}
            <div className="w-12 sm:w-14 flex flex-col justify-between text-right pr-2 text-[10.5px] font-normal text-slate-400 dark:text-[#71717A] select-none pb-5">
              {whYAxis.map((tick, i) => (
                <span key={i} className="leading-none">{tick}</span>
              ))}
            </div>

            {/* Grid & 4 Bars */}
            <div className="flex-1 relative flex flex-col justify-between pb-5">
              <div className="absolute inset-0 pb-5 flex flex-col justify-between pointer-events-none">
                {whYAxis.map((_, i) => (
                  <div key={i} className="w-full border-b border-slate-100 dark:border-[#27272A]/60" />
                ))}
              </div>

              {/* 4 Bars spaced horizontally */}
              <div className="absolute inset-x-0 bottom-5 top-0 flex items-end justify-around px-2 sm:px-6 pointer-events-auto">
                {warehouseBars.map((bar, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 max-w-[140px] px-2 h-full justify-end group">
                    <div
                      className="w-full rounded-t-xs transition-all duration-200 cursor-pointer hover:opacity-90 relative"
                      style={{
                        height: `${bar.height}%`,
                        backgroundColor: '#F472B6', // flat matte pink matching screenshot
                      }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        {bar.value} K
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-around pl-12 sm:pl-14 pt-1.5 text-[11px] text-slate-500 dark:text-[#A1A1AA]">
            {warehouseBars.map((bar, i) => (
              <span key={i} className="flex-1 text-center truncate max-w-[140px] px-1">
                {bar.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trends Row: Purchase Receipt Trends & Delivery Trends */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Card A: Purchase Receipt Trends */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">
                Purchase Receipt Trends
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-[#71717A] mt-0.5">
                Last synced {lastSynced}
              </p>
            </div>

            {/* Controls: Filter, Range Pill, Frequency Pill, 3-dots */}
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A]">
                <Filter className="w-3.5 h-3.5" />
              </button>

              {/* Range Dropdown Pill */}
              <div className="relative" ref={prRangeRef}>
                <button
                  onClick={() => setIsPrRangeOpen(!isPrRangeOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#1C1C1E] text-[11px] text-slate-600 dark:text-[#D4D4D8]"
                >
                  <span>{prRange}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {isPrRangeOpen && (
                  <div className="absolute right-0 top-7 w-32 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-30 text-xs">
                    {rangeOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setPrRange(opt); setIsPrRangeOpen(false); }}
                        className="w-full px-2.5 py-1 text-left hover:bg-slate-100 dark:hover:bg-[#27272A]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Frequency Dropdown Pill */}
              <div className="relative" ref={prFreqRef}>
                <button
                  onClick={() => setIsPrFreqOpen(!isPrFreqOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#1C1C1E] text-[11px] text-slate-600 dark:text-[#D4D4D8]"
                >
                  <span>{prFrequency}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {isPrFreqOpen && (
                  <div className="absolute right-0 top-7 w-32 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100">
                    {frequencyOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setPrFrequency(opt); setIsPrFreqOpen(false); }}
                        className={`w-full px-2.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-[#27272A] ${
                          prFrequency === opt ? 'font-medium text-pink-500' : 'text-slate-700 dark:text-[#D4D4D8]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5-Option 3-dots Menu */}
              <ChartOptionsMenu
                onRefresh={handleRefresh}
                onEdit={() => setEditModalTitle('Purchase Receipt Trends')}
                onReset={() => alert('Purchase Receipt Trends reset.')}
                onExport={() => handleExport('Purchase Receipt Trends', 'Month,Value\nNov 2025,0\nJan 2026,0\nMar 2026,0\n')}
                onItemList={() => navigate('/products')}
              />
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="w-full">
            <div className="relative h-48 w-full flex">
              <div className="w-6 flex flex-col justify-between text-right pr-2 text-[10.5px] font-normal text-slate-400 dark:text-[#71717A] pb-5">
                {trendYAxis.map((t, i) => (
                  <span key={i} className="leading-none">{t}</span>
                ))}
              </div>
              <div className="flex-1 relative flex flex-col justify-between pb-5">
                <div className="absolute inset-0 pb-5 flex flex-col justify-between pointer-events-none">
                  {trendYAxis.map((_, i) => (
                    <div key={i} className="w-full border-b border-slate-100 dark:border-[#27272A]/60" />
                  ))}
                </div>
              </div>
            </div>
            {/* Months */}
            <div className="flex justify-between pl-6 pt-1 text-[10.5px] text-slate-400 dark:text-[#71717A]">
              {trendMonths.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Card B: Delivery Trends */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">
                Delivery Trends
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-[#71717A] mt-0.5">
                Last synced {lastSynced}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A]">
                <Filter className="w-3.5 h-3.5" />
              </button>

              <div className="relative" ref={delRangeRef}>
                <button
                  onClick={() => setIsDelRangeOpen(!isDelRangeOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#1C1C1E] text-[11px] text-slate-600 dark:text-[#D4D4D8]"
                >
                  <span>{delRange}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {isDelRangeOpen && (
                  <div className="absolute right-0 top-7 w-32 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-30 text-xs">
                    {rangeOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setDelRange(opt); setIsDelRangeOpen(false); }}
                        className="w-full px-2.5 py-1 text-left hover:bg-slate-100 dark:hover:bg-[#27272A]"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={delFreqRef}>
                <button
                  onClick={() => setIsDelFreqOpen(!isDelFreqOpen)}
                  className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-[#2C2C2E] bg-slate-50 dark:bg-[#1C1C1E] text-[11px] text-slate-600 dark:text-[#D4D4D8]"
                >
                  <span>{delFrequency}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {isDelFreqOpen && (
                  <div className="absolute right-0 top-7 w-32 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100">
                    {frequencyOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setDelFrequency(opt); setIsDelFreqOpen(false); }}
                        className={`w-full px-2.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-[#27272A] ${
                          delFrequency === opt ? 'font-medium text-pink-500' : 'text-slate-700 dark:text-[#D4D4D8]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 5-Option 3-dots Menu */}
              <ChartOptionsMenu
                onRefresh={handleRefresh}
                onEdit={() => setEditModalTitle('Delivery Trends')}
                onReset={() => alert('Delivery Trends reset.')}
                onExport={() => handleExport('Delivery Trends', 'Month,Value\nNov 2025,0\nJan 2026,0\nMar 2026,0\n')}
                onItemList={() => navigate('/products')}
              />
            </div>
          </div>

          <div className="w-full">
            <div className="relative h-48 w-full flex">
              <div className="w-6 flex flex-col justify-between text-right pr-2 text-[10.5px] font-normal text-slate-400 dark:text-[#71717A] pb-5">
                {trendYAxis.map((t, i) => (
                  <span key={i} className="leading-none">{t}</span>
                ))}
              </div>
              <div className="flex-1 relative flex flex-col justify-between pb-5">
                <div className="absolute inset-0 pb-5 flex flex-col justify-between pointer-events-none">
                  {trendYAxis.map((_, i) => (
                    <div key={i} className="w-full border-b border-slate-100 dark:border-[#27272A]/60" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between pl-6 pt-1 text-[10.5px] text-slate-400 dark:text-[#71717A]">
              {trendMonths.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Row: Oldest Items & Item Shortage Summary (Image with exact 5-option 3-dots menu) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Card C: Oldest Items (Blue/Indigo descending bars) */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2 mb-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">
              Oldest Items
            </h2>
            <div className="flex items-center gap-1">
              <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <Filter className="w-3.5 h-3.5" />
              </button>

              {/* Exact 5-option 3-dots Menu matching uploaded screenshot */}
              <ChartOptionsMenu
                onRefresh={handleRefresh}
                onEdit={() => setEditModalTitle('Oldest Items')}
                onReset={() => alert('Oldest Items chart reset.')}
                onExport={() => handleExport('Oldest Items', 'SKU,Age\nSKU-001,690\nSKU-002,500\nSKU-003,460\n')}
                onItemList={() => navigate('/products')}
              />
            </div>
          </div>

          <div className="w-full">
            <div className="relative h-48 w-full flex">
              {/* Y Axis */}
              <div className="w-12 flex flex-col justify-between text-right pr-2 text-[10px] font-normal text-slate-400 dark:text-[#71717A] pb-5">
                {oldestYAxis.map((t, i) => (
                  <span key={i} className="leading-none">{t}</span>
                ))}
              </div>

              {/* Grid & Blue Bars */}
              <div className="flex-1 relative flex flex-col justify-between pb-5">
                <div className="absolute inset-0 pb-5 flex flex-col justify-between pointer-events-none">
                  {oldestYAxis.map((_, i) => (
                    <div key={i} className="w-full border-b border-slate-100 dark:border-[#27272A]/60" />
                  ))}
                </div>

                <div className="absolute inset-x-0 bottom-5 top-0 flex items-end justify-between px-1 pointer-events-auto">
                  {oldestItems.map((item, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 px-1 h-full justify-end group">
                      <div
                        className="w-full rounded-t-xs transition-all duration-200 cursor-pointer hover:opacity-90 relative"
                        style={{
                          height: `${item.height}%`,
                          backgroundColor: '#6366F1', // clean indigo/blue matching screenshot
                        }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9.5px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* X Axis */}
            <div className="flex justify-between pl-12 pt-1 text-[10px] text-slate-400 dark:text-[#71717A]">
              {oldestItems.map((item, i) => (
                <span key={i} className="flex-1 text-center truncate">{item.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Card D: Item Shortage Summary (Pink hanging bars downwards from 0) */}
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-2 mb-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight">
              Item Shortage Summary
            </h2>
            <div className="flex items-center gap-1">
              <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <Filter className="w-3.5 h-3.5" />
              </button>

              {/* Exact 5-option 3-dots Menu matching uploaded screenshot */}
              <ChartOptionsMenu
                onRefresh={handleRefresh}
                onEdit={() => setEditModalTitle('Item Shortage Summary')}
                onReset={() => alert('Item Shortage Summary chart reset.')}
                onExport={() => handleExport('Item Shortage Summary', 'SKU,Shortage\nSKU006,-100\nSKU007,-100\nSKU010,-50\n')}
                onItemList={() => navigate('/products')}
              />
            </div>
          </div>

          <div className="w-full">
            <div className="relative h-48 w-full flex">
              {/* Y Axis (0 down to -100) */}
              <div className="w-12 flex flex-col justify-between text-right pr-2 text-[10px] font-normal text-slate-400 dark:text-[#71717A] pt-1 pb-4">
                {shortageYAxis.map((t, i) => (
                  <span key={i} className="leading-none">{t}</span>
                ))}
              </div>

              {/* Grid & Hanging Pink Bars from top 0 */}
              <div className="flex-1 relative flex flex-col justify-between pt-1 pb-4">
                <div className="absolute inset-0 pt-1 pb-4 flex flex-col justify-between pointer-events-none">
                  {shortageYAxis.map((_, i) => (
                    <div key={i} className="w-full border-b border-slate-100 dark:border-[#27272A]/60" />
                  ))}
                </div>

                <div className="absolute inset-x-0 top-1 bottom-4 flex items-start justify-between px-1 pointer-events-auto">
                  {shortageItems.map((item, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 px-1 h-full justify-start group">
                      <div
                        className="w-full rounded-b-xs transition-all duration-200 cursor-pointer hover:opacity-90 relative"
                        style={{
                          height: `${item.depth}%`,
                          backgroundColor: '#F472B6', // pink matching screenshot
                        }}
                      >
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9.5px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-20 pointer-events-none">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* X Axis */}
            <div className="flex justify-between pl-12 pt-1 text-[10px] text-slate-400 dark:text-[#71717A]">
              {shortageItems.map((item, i) => (
                <span key={i} className="flex-1 text-center truncate">{item.sku}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal Dialog */}
      {editModalTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 shadow-2xl text-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Edit {editModalTitle}
            </h3>
            <p className="text-slate-500 mb-4 text-[11.5px]">Configure metric display rules and sources.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-[#A1A1AA] mb-1">Chart Label</label>
                <input
                  type="text"
                  defaultValue={editModalTitle}
                  className="w-full rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditModalTitle(null)}
                className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#27272A]"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditModalTitle(null)}
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
