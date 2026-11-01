import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (item: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Stock Entry', category: 'Stock Transactions', path: '/movements' },
    { title: 'Purchase Receipt', category: 'Stock Transactions', path: '/movements' },
    { title: 'Delivery Note', category: 'Stock Transactions', path: '/movements' },
    { title: 'Material Request', category: 'Stock Transactions', path: '/movements' },
    { title: 'Pick List', category: 'Stock Transactions', path: '/movements' },
    { title: 'Items Catalogue', category: 'Items Catalogue', path: '/products' },
    { title: 'Warehouse', category: 'Settings', path: '/warehouses' },
    { title: 'Stock Ledger', category: 'Stock Reports', path: '/reports' },
    { title: 'Stock Balance', category: 'Stock Reports', path: '/reports' },
    { title: 'Stock Summary', category: 'Stock Reports', path: '/reports' },
    { title: 'Stock Analytics', category: 'Key Reports', path: '/reports' },
    { title: 'Quality Inspection', category: 'Tools', path: '/tools' },
    { title: 'Serial No and Batch', category: 'Serial No and Batch', path: '/serials' },
  ];

  const filtered = quickLinks.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (item: { title: string; path: string }) => {
    if (onSelectItem) {
      onSelectItem(item.title);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-[#27272A]">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search items, reports, transactions or settings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching stock documents or reports found.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(item)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272A] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-pink-500 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#242427] text-slate-500">
                    {item.category}
                  </span>
                </div>
                <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-[#141416] border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with arrow keys</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};

