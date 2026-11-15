import React from 'react';
import { Printer, Heart, Edit2 } from 'lucide-react';
import { DocumentSidebarMeta } from '../common';
import type { QualityInspectionTemplateRecord } from '../../types';

interface QualityInspectionTemplateDetailSidebarProps {
  template: QualityInspectionTemplateRecord;
  onToggleLike?: () => void;
  onRename?: () => void;
}

export const QualityInspectionTemplateDetailSidebar: React.FC<
  QualityInspectionTemplateDetailSidebarProps
> = ({ template, onToggleLike, onRename }) => {
  return (
    <div className="w-full lg:w-64 shrink-0 font-sans text-xs space-y-4">
      {/* Top Header Title & Icons (Edit, Printer, Heart) */}
      <div className="flex items-center justify-between pb-1">
        <div className="font-semibold text-slate-800 dark:text-zinc-200 text-sm tracking-tight truncate">
          {template.templateName || template.id}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onRename}
            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors"
            title="Edit / Rename"
          >
            <Edit2 className="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
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
              template.isLiked
                ? 'text-rose-500 fill-rose-500'
                : 'text-slate-400 hover:text-rose-500'
            }`}
            title="Like"
          >
            <Heart
              className={`w-4 h-4 stroke-[1.75] ${
                template.isLiked ? 'fill-rose-500' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Items List */}
      <div className="pt-1 pb-4 border-b border-slate-100 dark:border-[#27272A]">
        <DocumentSidebarMeta
          docType="QualityInspectionTemplate"
          docId={template.id}
          docName={template.templateName || template.id}
        />
      </div>

      {/* Metadata Timestamps */}
      <div className="space-y-3 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
        <div>
          <div className="text-slate-400 dark:text-zinc-500">Last Edited By You</div>
          <div className="text-slate-700 dark:text-zinc-300 mt-0.5 font-normal">
            {template.lastEdited || 'yesterday'}
          </div>
        </div>

        <div>
          <div className="text-slate-400 dark:text-zinc-500">Created By You</div>
          <div className="text-slate-700 dark:text-zinc-300 mt-0.5 font-normal">
            {template.createdOn || 'yesterday'}
          </div>
        </div>
      </div>
    </div>
  );
};
