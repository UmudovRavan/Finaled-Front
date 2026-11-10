import React from 'react';
import { useItem } from '../../context';

export const ItemKanbanView: React.FC = () => {
  const { filteredItems } = useItem();

  const groups = Array.from(new Set(filteredItems.map((i) => i.itemGroup)));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
      {groups.map((group) => {
        const itemsInGroup = filteredItems.filter((i) => i.itemGroup === group);
        return (
          <div
            key={group}
            className="bg-slate-50 dark:bg-[#1C1C1E] rounded-xl p-3 border border-slate-200 dark:border-[#2C2C2E]"
          >
            <div className="font-semibold text-slate-800 dark:text-zinc-200 mb-2 flex items-center justify-between">
              <span>{group}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#27272A] text-slate-600 dark:text-zinc-400">
                {itemsInGroup.length}
              </span>
            </div>
            <div className="space-y-2">
              {itemsInGroup.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#27272A] p-3 rounded-lg border border-slate-200/80 dark:border-transparent shadow-xs"
                >
                  <div className="font-medium text-slate-900 dark:text-white">{item.itemName}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{item.itemCode}</div>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">UOM: {item.uom}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 text-[10px]">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ItemKanbanView;

