import React from 'react';
import { useStockEntry } from '../../context';
import { Package, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency } from '../../utils';

export const StockEntryDashboardView: React.FC = () => {
  const { entries, setSelectedEntry } = useStockEntry();

  const totalEntries = entries.length;
  const draftEntries = entries.filter((e) => e.status === 'Draft').length;
  const submittedEntries = entries.filter((e) => e.status === 'Submitted').length;
  const totalValuation = entries.reduce(
    (sum, e) => sum + e.items.reduce((s, it) => s + it.amount, 0),
    0
  );

  // Group by Type
  const typeCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.stockEntryType] = (acc[e.stockEntryType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4 text-xs">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Total Entries</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalEntries}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-zinc-300">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Draft Status</span>
            <p className="text-xl font-bold text-rose-500 mt-0.5">{draftEntries}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Submitted</span>
            <p className="text-xl font-bold text-emerald-500 mt-0.5">{submittedEntries}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Handled Value</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{formatCurrency(totalValuation)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Breakdown by Type & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Entry Types Bar */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Stock Entries by Type</h4>
          <div className="space-y-2">
            {Object.entries(typeCounts).map(([type, count]) => {
              const pct = Math.round((count / (totalEntries || 1)) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-zinc-300 font-medium">{type}</span>
                    <span className="text-slate-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#27272A] overflow-hidden">
                    <div
                      className="h-full bg-slate-800 dark:bg-zinc-300 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Recent Entries */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Recent Processed Documents</h4>
          <div className="space-y-2">
            {entries.slice(0, 4).map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#202024] hover:bg-slate-100 dark:hover:bg-[#27272B] cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{entry.id}</p>
                  <p className="text-[11px] text-slate-500">{entry.stockEntryType} • {entry.defaultTargetWarehouse || 'Central'}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`font-medium ${
                      entry.status === 'Draft' ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {entry.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{entry.timeAgoText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

