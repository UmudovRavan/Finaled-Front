import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChartOptionsMenuProps {
  onRefresh?: () => void;
  onEdit?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  onItemList?: () => void;
}

export const ChartOptionsMenu: React.FC<ChartOptionsMenuProps> = ({
  onRefresh,
  onEdit,
  onReset,
  onExport,
  onItemList,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors ${
          isOpen ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white' : ''
        }`}
        title="Options"
      >
        <MoreHorizontal className="w-3.5 h-3.5 stroke-[1.75]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-36 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2C2C2E] rounded-xl shadow-xl py-1 z-40 text-xs text-slate-700 dark:text-[#D4D4D8] animate-in fade-in duration-100">
          <button
            onClick={() => {
              setIsOpen(false);
              if (onRefresh) onRefresh();
            }}
            className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
          >
            Refresh
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              if (onEdit) onEdit();
            }}
            className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
          >
            Edit
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              if (onReset) onReset();
            }}
            className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
          >
            Reset Chart
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              if (onExport) onExport();
            }}
            className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
          >
            Export
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              if (onItemList) {
                onItemList();
              } else {
                navigate('/products');
              }
            }}
            className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white transition-colors text-left"
          >
            Item List
          </button>
        </div>
      )}
    </div>
  );
};

