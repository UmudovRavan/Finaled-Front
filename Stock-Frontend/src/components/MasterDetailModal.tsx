import React, { useState } from 'react';
import { X, Search, Plus, ExternalLink } from 'lucide-react';

interface MasterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
}

export const MasterDetailModal: React.FC<MasterDetailModalProps> = ({
  isOpen,
  onClose,
  title,
  category,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const demoItems = [
    { id: '1', code: 'STK-001', name: `${title} Record Alpha`, status: 'Active', date: '2026-11-01' },
    { id: '2', code: 'STK-002', name: `${title} Record Beta`, status: 'Active', date: '2026-10-31' },
    { id: '3', code: 'STK-003', name: `${title} Record Gamma`, status: 'Completed', date: '2026-10-30' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-5 shadow-2xl relative animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 dark:text-[#71717A] uppercase tracking-wider mb-0.5">
              {category}
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{title}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex items-center gap-2.5 py-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl pl-8 pr-3 py-1.5 border border-slate-200 dark:border-[#27272A] bg-slate-50 dark:bg-[#1C1C1E] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-[#27272A] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#1C1C1E] text-slate-500 dark:text-slate-400 font-medium uppercase text-[11px]">
              <tr>
                <th className="px-3.5 py-2">Identifier</th>
                <th className="px-3.5 py-2">Description</th>
                <th className="px-3.5 py-2">Status</th>
                <th className="px-3.5 py-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {demoItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-[#27272A]/40 transition-colors">
                  <td className="px-3.5 py-2.5 font-mono font-medium text-slate-900 dark:text-white">
                    {item.code}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300">
                    {item.name}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-slate-400">
                    {item.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-1 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#333336] text-slate-700 dark:text-slate-300 text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
