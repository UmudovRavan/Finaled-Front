import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useInventoryDimension } from '../context';
import { InventoryDimensionDetailSidebar } from '../components/inventory-dimension';
import type { InventoryDimensionRecord } from '../types';

export const InventoryDimensionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dimensions, updateDimension, deleteDimension, toggleLike } = useInventoryDimension();

  const decodedId = decodeURIComponent(id || '');
  const currentDimension = dimensions.find(
    (d) => d.id.toLowerCase() === decodedId.toLowerCase() || d.dimensionName.toLowerCase() === decodedId.toLowerCase()
  );

  const [activeTab, setActiveTab] = useState<'details' | 'applicable'>('details');
  const [formData, setFormData] = useState<Partial<InventoryDimensionRecord>>({});
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentDimension) {
      setFormData(currentDimension);
    }
  }, [currentDimension]);

  if (!currentDimension) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Inventory Dimension not found.
      </div>
    );
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      await updateDimension(currentDimension.id, formData);
    } catch (err) {
      console.error('Failed to update Inventory Dimension', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${currentDimension.dimensionName || currentDimension.id}?`)) {
      await deleteDimension(currentDimension.id);
      navigate('/inventory-dimension');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-inventory-dimension-detail-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
      </button>

      {/* Hidden button for Header Delete Dimension click delegation */}
      <button
        type="button"
        id="delete-inventory-dimension-btn"
        className="hidden"
        onClick={() => handleDelete()}
      >
        Delete Dimension
      </button>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-[#27272A] mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-2.5 text-xs font-medium transition-colors relative ${
            activeTab === 'details'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          Dimension Details
          {activeTab === 'details' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('applicable')}
          className={`pb-2.5 text-xs font-medium transition-colors relative ${
            activeTab === 'applicable'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          Applicable For
          {activeTab === 'applicable' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white rounded-full" />
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          {activeTab === 'details' && (
            <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side empty or read-only dimension name */}
                <div>
                  {/* Keep blank or light subtitle matching Frappe UI */}
                </div>

                {/* Reference Document * */}
                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                    Reference Document <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.referenceDocument ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, referenceDocument: e.target.value })
                    }
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applicable' && (
            <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-6">
              {/* Checkboxes Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Apply to All Inventory Documents */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.applyToAllInventoryDocuments ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        applyToAllInventoryDocuments: e.target.checked,
                      })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                  />
                  <span className="text-slate-800 dark:text-zinc-200 font-medium text-xs">
                    Apply to All Inventory Documents
                  </span>
                </label>

                {/* Validate Negative Stock */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.validateNegativeStock ?? false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        validateNegativeStock: e.target.checked,
                      })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                  />
                  <span className="text-slate-700 dark:text-zinc-300 text-xs">
                    Validate Negative Stock
                  </span>
                </label>
              </div>

              {/* Fetch Value From */}
              <div className="max-w-md">
                <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                  Fetch Value From
                </label>
                <select
                  value={formData.fetchValueFrom ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, fetchValueFrom: e.target.value })
                  }
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all cursor-pointer"
                >
                  <option value=""></option>
                  <option value="parent_warehouse">parent_warehouse</option>
                  <option value="source_warehouse">source_warehouse</option>
                  <option value="target_warehouse">target_warehouse</option>
                  <option value="cost_center">cost_center</option>
                  <option value="project">project</option>
                </select>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5">
                  Set fieldname from which you want to fetch the data from the parent form.
                </p>
              </div>

              {/* Mandatory Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#202024] space-y-4">
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Mandatory Section
                </div>

                {/* Mandatory checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.mandatory ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, mandatory: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                  />
                  <span className="text-slate-700 dark:text-zinc-300 text-xs">
                    Mandatory
                  </span>
                </label>

                {/* Mandatory Depends On (Backend) */}
                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                    Mandatory Depends On (Backend)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.mandatoryDependsOn ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mandatoryDependsOn: e.target.value,
                      })
                    }
                    placeholder=""
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 font-mono text-xs p-3 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all resize-y"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 leading-relaxed">
                    Python expression evaluated on the server. Use doc.fieldname for the row and parent.fieldname for the parent document. When it evaluates to true the dimension becomes mandatory. Example: doc.t_warehouse and doc.qty &gt; 0
                  </p>
                </div>
              </div>
            </div>
          )}

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

          {/* Activity Section (Visible in Details tab like Image 4) */}
          {activeTab === 'details' && (
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
                      You created this · {currentDimension.createdOn || 'yesterday'}
                    </span>
                  </div>
                  <div className="relative flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                    <span>
                      You last edited this · {currentDimension.lastEdited || 'yesterday'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <InventoryDimensionDetailSidebar
          dimension={currentDimension}
          onToggleLike={() => toggleLike(currentDimension.id)}
        />
      </div>
    </div>
  );
};

