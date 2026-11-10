import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useSerialNo } from '../context';
import { SerialNoDetailSidebar } from '../components/serial-no/SerialNoDetailSidebar';
import type { SerialNoRecord } from '../types';

export const SerialNoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { serialNos, updateSerialNo, toggleLike } = useSerialNo();

  const decodedId = decodeURIComponent(id || '');
  const currentSerial = serialNos.find(
    (s) => s.id.toLowerCase() === decodedId.toLowerCase() || s.serialNo.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState<Partial<SerialNoRecord>>({});
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentSerial) {
      setFormData(currentSerial);
    }
  }, [currentSerial]);

  if (!currentSerial) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Serial No not found.
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSerialNo(currentSerial.id, formData);
    } catch (err) {
      console.error('Failed to update Serial No', err);
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
            {/* Top Details (Serial No & Item Code & Status) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Serial No <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.serialNo ?? ''}
                  onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Item Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.itemCode ?? ''}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Status
                </label>
                <select
                  value={formData.status ?? 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Warehouse
                </label>
                <input
                  type="text"
                  value={formData.warehouse ?? ''}
                  onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                  placeholder="e.g. Bitmiş Ürünler - AD"
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>
            </div>

            {/* Section: Warranty / AMC Details */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A] space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Warranty / AMC Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Warranty Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.warrantyExpiryDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, warrantyExpiryDate: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    AMC Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.amcExpiryDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, amcExpiryDate: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section: More Information */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A] space-y-4">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                More Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.company ?? 'Avalon (Demo)'}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Work Order
                  </label>
                  <input
                    type="text"
                    value={formData.workOrder ?? ''}
                    onChange={(e) => setFormData({ ...formData, workOrder: e.target.value })}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
              </div>
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
                    You created this · {currentSerial.createdBy || '10 hours ago'}
                  </span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                  <span>
                    You last edited this · {currentSerial.lastEdited || '10 hours ago'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <SerialNoDetailSidebar
          serialRecord={currentSerial}
          onToggleLike={() => toggleLike(currentSerial.id)}
        />
      </div>

      {/* Hidden button for Header trigger */}
      <button
        id="save-serial-no-detail-btn"
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

