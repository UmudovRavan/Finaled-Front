import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useBatch } from '../context';
import { BatchDetailSidebar } from '../components/batch/BatchDetailSidebar';
import type { BatchRecord } from '../types';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { batches, updateBatch, toggleLike } = useBatch();

  const decodedId = decodeURIComponent(id || '');
  const currentBatch = batches.find(
    (b) => b.id.toLowerCase() === decodedId.toLowerCase() || b.batchId.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState<Partial<BatchRecord>>({});
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentBatch) {
      setFormData(currentBatch);
    }
  }, [currentBatch]);

  if (!currentBatch) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Batch not found.
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateBatch(currentBatch.id, formData);
    } catch (err) {
      console.error('Failed to update Batch', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left / Main Column */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-8">
            {/* Section: Batch Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Batch Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Batch ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.batchId ?? ''}
                      onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Item <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.item ?? ''}
                      onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-red-200/80 dark:border-red-900/40 focus:border-red-400 dark:focus:border-red-600 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Manufacturing Date
                    </label>
                    <input
                      type="date"
                      value={formData.manufacturingDate ?? ''}
                      onChange={(e) => setFormData({ ...formData, manufacturingDate: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Batch UOM
                    </label>
                    <input
                      type="text"
                      value={formData.batchUOM ?? 'Nos'}
                      onChange={(e) => setFormData({ ...formData, batchUOM: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate ?? ''}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>

                  <div className="pt-1 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.useBatchWiseValuation ?? false}
                        onChange={(e) => setFormData({ ...formData, useBatchWiseValuation: e.target.checked })}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                      />
                      <span className="text-slate-700 dark:text-zinc-300 text-xs">
                        Use Batch-wise Valuation
                      </span>
                    </label>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.allowNegativeStock ?? false}
                          onChange={(e) => setFormData({ ...formData, allowNegativeStock: e.target.checked })}
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                        />
                        <span className="text-slate-700 dark:text-zinc-300 text-xs">
                          Allow Negative Stock for Batch
                        </span>
                      </label>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 pl-6 leading-relaxed">
                        If enabled, the system will allow negative stock entries for this batch, overriding the 'Allow negative stock for Batch' setting in Stock Settings. This may lead to incorrect valuation rates, so it is recommended to avoid using this option.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Batch Description */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A] space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Batch Description
              </h3>
              <textarea
                value={formData.description ?? ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs resize-y transition-all"
              />
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Comments</h3>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center shrink-0 text-xs">
                A
              </div>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type a reply / comment"
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Activity</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs font-normal transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsActivityOpen(!isActivityOpen)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {isActivityOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isActivityOpen && (
              <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400">
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                  <span>
                    You created this · {currentBatch.createdBy || '3 months ago'}
                  </span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                  <span>
                    You last edited this · {currentBatch.lastEdited || '3 months ago'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <BatchDetailSidebar
          batch={currentBatch}
          onToggleLike={() => toggleLike(currentBatch.id)}
        />
      </div>

      {/* Hidden button for Header trigger */}
      <button
        id="save-batch-detail-btn"
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="hidden"
      >
        Save
      </button>
    </div>
  );
};

