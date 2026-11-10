import React from 'react';
import { useDeliveryNote } from '../../context';
import { Truck, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils';

export const DeliveryNoteDashboardView: React.FC = () => {
  const { notes, setSelectedNote } = useDeliveryNote();

  const totalNotes = notes.length;
  const draftNotes = notes.filter((n) => n.status === 'Draft').length;
  const completedNotes = notes.filter((n) => n.status === 'Completed').length;
  const toBillNotes = notes.filter((n) => n.status === 'To Bill').length;
  const totalValuation = notes.reduce((sum, n) => sum + n.grandTotal, 0);

  const customerCounts = notes.reduce<Record<string, number>>((acc, n) => {
    acc[n.customerName] = (acc[n.customerName] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4 text-xs">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Total Delivery Notes</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalNotes}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-zinc-300">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Draft Status</span>
            <p className="text-xl font-bold text-rose-500 mt-0.5">{draftNotes}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">To Bill / Completed</span>
            <p className="text-xl font-bold text-emerald-500 mt-0.5">{toBillNotes + completedNotes}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Total Grand Amount</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{formatCurrency(totalValuation)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Breakdown by Customer & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Deliveries by Customer</h4>
          <div className="space-y-2">
            {Object.entries(customerCounts).map(([customer, count]) => {
              const pct = Math.round((count / (totalNotes || 1)) * 100);
              return (
                <div key={customer} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-zinc-300 font-medium truncate max-w-[200px]">{customer}</span>
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

        <div className="p-4 rounded-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] shadow-sm space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Recent Delivery Notes</h4>
          <div className="space-y-2">
            {notes.slice(0, 4).map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-[#27272A] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{note.id}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">{note.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900 dark:text-white">{formatCurrency(note.grandTotal)}</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      note.status === 'Draft'
                        ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/40'
                        : note.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40'
                        : 'bg-blue-50 text-blue-500 dark:bg-blue-950/40'
                    }`}
                  >
                    {note.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNoteDashboardView;

