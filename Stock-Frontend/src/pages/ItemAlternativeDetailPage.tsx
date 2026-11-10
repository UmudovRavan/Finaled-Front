import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useItemAlternative } from '../context';
import { ItemAlternativeDetailSidebar } from '../components/item-alternative';
import type { ItemAlternativeRecord } from '../types';

export const ItemAlternativeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { alternatives, updateAlternative, toggleLike } = useItemAlternative();

  const decodedId = decodeURIComponent(id || '');
  const currentAlternative = alternatives.find(
    (a) => a.id.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState<Partial<ItemAlternativeRecord>>({});
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentAlternative) {
      setFormData(currentAlternative);
    }
  }, [currentAlternative]);

  if (!currentAlternative) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Item Alternative not found.
      </div>
    );
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      await updateAlternative(currentAlternative.id, formData);
    } catch (err) {
      console.error('Failed to update Item Alternative', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-item-alternative-detail-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
      </button>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-5">
              {/* Item Code */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                  Item Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemCode ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, itemCode: e.target.value })
                  }
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                />
              </div>

              {/* Alternative Item Code */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                  Alternative Item Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.alternativeItemCode ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, alternativeItemCode: e.target.value })
                  }
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                />
              </div>

              {/* Two-way */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.twoWay ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, twoWay: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                  />
                  <span className="text-slate-700 dark:text-zinc-300 text-xs">Two-way</span>
                </label>
              </div>
            </div>
          </form>

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
                    You created this · {currentAlternative.createdOn || 'yesterday'}
                  </span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                  <span>
                    You last edited this · {currentAlternative.lastEdited || 'yesterday'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <ItemAlternativeDetailSidebar
          alternative={currentAlternative}
          onToggleLike={() => toggleLike(currentAlternative.id)}
        />
      </div>
    </div>
  );
};

