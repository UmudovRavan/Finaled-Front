import React from 'react';
import { Printer, Heart } from 'lucide-react';
import { DocumentSidebarMeta } from '../common';
import type { WarehouseRecord } from '../../types';

interface WarehouseDetailSidebarProps {
  warehouse: WarehouseRecord;
  onToggleLike?: () => void;
}

export const WarehouseDetailSidebar: React.FC<WarehouseDetailSidebarProps> = ({
  warehouse,
  onToggleLike,
}) => {
  return (
    <div className="w-full lg:w-64 shrink-0 font-sans text-xs space-y-4">
      {/* Top Header Icons (Printer, Heart) */}
      <div className="flex items-center justify-end gap-2 pb-1">
        <button
          type="button"
          onClick={() => window.print()}
          className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
          title="Print"
        >
          <Printer className="w-4 h-4 stroke-[1.75]" />
        </button>
        <button
          type="button"
          onClick={onToggleLike}
          className={`p-1 transition-colors ${
            warehouse.isLiked
              ? 'text-rose-500 fill-rose-500'
              : 'text-slate-400 hover:text-rose-500'
          }`}
          title="Like"
        >
          <Heart
            className={`w-4 h-4 stroke-[1.75] ${
              warehouse.isLiked ? 'fill-rose-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Title */}
      <div className="font-medium text-slate-800 dark:text-zinc-200 text-sm tracking-tight truncate pb-1">
        {warehouse.warehouseName || warehouse.id}
      </div>

      {/* Action Items List */}
      <div className="pt-1 pb-4 border-b border-slate-100 dark:border-[#27272A]">
        <DocumentSidebarMeta docType="Warehouse" docId={warehouse.id} docName={warehouse.warehouseName || warehouse.id} />
      </div>

      {/* Timestamp Audits */}
      <div className="space-y-3 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
        <div>
          <div className="font-normal text-slate-700 dark:text-zinc-300">Last Edited By You</div>
          <div className="text-slate-400 dark:text-zinc-500 mt-0.5">
            {warehouse.lastEdited || '3 months ago'}
          </div>
        </div>

        <div>
          <div className="font-normal text-slate-700 dark:text-zinc-300">Created By You</div>
          <div className="text-slate-400 dark:text-zinc-500 mt-0.5">
            {warehouse.createdBy || '3 months ago'}
          </div>
        </div>
      </div>
    </div>
  );
};
