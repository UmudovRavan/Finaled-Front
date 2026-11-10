import React from 'react';
import { useItem } from '../../context';

export const ItemReportView: React.FC = () => {
  const { filteredItems } = useItem();

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-4 text-xs">
      <div className="font-semibold text-slate-800 dark:text-zinc-200 mb-3">
        Item Summary Report ({filteredItems.length} records)
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[#27272A] text-slate-500 font-medium">
              <th className="py-2 px-3">Item Code</th>
              <th className="py-2 px-3">Item Name</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Item Group</th>
              <th className="py-2 px-3">UOM</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#202024]">
                <td className="py-2 px-3 font-mono">{item.itemCode}</td>
                <td className="py-2 px-3 font-medium text-slate-800 dark:text-white">{item.itemName}</td>
                <td className="py-2 px-3">{item.status}</td>
                <td className="py-2 px-3">{item.itemGroup}</td>
                <td className="py-2 px-3">{item.uom}</td>
                <td className="py-2 px-3">{item.itemType}</td>
                <td className="py-2 px-3">{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemReportView;

