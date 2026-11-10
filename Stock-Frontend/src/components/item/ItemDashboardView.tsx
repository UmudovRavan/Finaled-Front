import React from 'react';
import { useItem } from '../../context';
import { Package, CheckCircle2, Layers } from 'lucide-react';

export const ItemDashboardView: React.FC = () => {
  const { items } = useItem();

  const total = items.length;
  const enabledCount = items.filter((i) => i.status === 'Enabled').length;
  const groupsCount = new Set(items.map((i) => i.itemGroup)).size;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-[#27272A] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Total Items</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{total}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-[#27272A] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Enabled</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{enabledCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#18181B] border border-slate-200/90 dark:border-[#27272A] rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Item Groups</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{groupsCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDashboardView;

