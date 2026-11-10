import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useUOMConversionFactor } from '../context';
import { UOMConversionFactorDetailSidebar } from '../components/uom-conversion-factor/UOMConversionFactorDetailSidebar';
import type { UOMConversionFactorRecord } from '../types';

export const UOMConversionFactorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { factors, updateConversionFactor, toggleLike } = useUOMConversionFactor();

  const decodedId = decodeURIComponent(id || '');
  const currentFactor = factors.find(
    (f) => f.id.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState<Partial<UOMConversionFactorRecord>>({});
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentFactor) {
      setFormData(currentFactor);
    }
  }, [currentFactor]);

  if (!currentFactor) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        UOM Conversion Factor not found.
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateConversionFactor(currentFactor.id, formData);
    } catch (err) {
      console.error('Failed to update UOM Conversion Factor', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left / Main Column */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-5">
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.category ?? 'Mass'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-[#27272A] pt-3 space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fromUOM ?? 'Gram'}
                    onChange={(e) => setFormData({ ...formData, fromUOM: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.toUOM ?? 'Ounce'}
                    onChange={(e) => setFormData({ ...formData, toUOM: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.value ?? '0.035274000'}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 font-mono px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">
              Comments
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-medium text-xs shrink-0 select-none">
                A
              </div>
              <input
                type="text"
                placeholder="Type a reply / comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-white dark:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:border-slate-400 dark:focus:border-zinc-600 transition-all"
              />
            </div>
          </div>

          {/* Activity Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-zinc-200 text-sm">
                Activity
              </h3>
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
                    You created this · {currentFactor.createdBy || '3 months ago'}
                  </span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                  <span>
                    You last edited this · {currentFactor.lastEdited || '3 months ago'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <UOMConversionFactorDetailSidebar
          factor={currentFactor}
          onToggleLike={() => toggleLike(currentFactor.id)}
        />
      </div>

      {/* Hidden button for Header trigger */}
      <button
        id="save-uom-conversion-factor-detail-btn"
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

