import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Download, Upload, Trash2 } from 'lucide-react';
import { useSerialAndBatchBundle } from '../context';
import { SerialAndBatchBundleDetailSidebar } from '../components/serial-and-batch-bundle/SerialAndBatchBundleDetailSidebar';
import type { SerialAndBatchBundleRecord, SerialAndBatchBundleItem } from '../types';

export const SerialAndBatchBundleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bundles, updateBundle, toggleLike } = useSerialAndBatchBundle();

  const decodedId = decodeURIComponent(id || '');
  const currentBundle = bundles.find(
    (b) => b.id.toLowerCase() === decodedId.toLowerCase()
  );

  const [activeTab, setActiveTab] = useState<'serial_and_batch' | 'reference'>('serial_and_batch');
  const [formData, setFormData] = useState<Partial<SerialAndBatchBundleRecord>>({});
  const [rows, setRows] = useState<SerialAndBatchBundleItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentBundle) {
      setFormData(currentBundle);
      setRows(currentBundle.items || [{ id: 'row-1', qty: 1 }]);
    }
  }, [currentBundle]);

  if (!currentBundle) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Serial and Batch Bundle not found.
      </div>
    );
  }

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        serialNo: '',
        batchNo: '',
        qty: 1,
        warehouse: formData.warehouse || '',
      },
    ]);
  };

  const handleRemoveRow = (rowId: string) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((r) => r.id !== rowId));
    }
  };

  const handleUpdateRow = (rowId: string, field: keyof SerialAndBatchBundleItem, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateBundle(currentBundle.id, {
        ...formData,
        items: rows,
      });
    } catch (err) {
      console.error('Failed to update Serial and Batch Bundle', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left / Main Column */}
        <div className="flex-1 w-full space-y-6">
          {/* Top Tab Bar */}
          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-[#27272A] px-1 select-none">
            <button
              type="button"
              onClick={() => setActiveTab('serial_and_batch')}
              className={`pb-2.5 font-medium transition-all ${
                activeTab === 'serial_and_batch'
                  ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Serial and Batch
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reference')}
              className={`pb-2.5 font-medium transition-all ${
                activeTab === 'reference'
                  ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Reference
            </button>
          </div>

          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-8">
            {activeTab === 'serial_and_batch' ? (
              <>
                {/* Top Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                        Naming Series
                      </label>
                      <select
                        value={formData.namingSeries ?? 'SABB-.########'}
                        onChange={(e) => setFormData({ ...formData, namingSeries: e.target.value })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all cursor-pointer"
                      >
                        <option value="SABB-.########">SABB-.########</option>
                      </select>
                    </div>

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

                    <div className="pt-1 space-y-2.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.hasSerialNo ?? false}
                          onChange={(e) => setFormData({ ...formData, hasSerialNo: e.target.checked })}
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                        />
                        <span className="text-slate-700 dark:text-zinc-300 text-xs">
                          Has Serial No
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.hasBatchNo ?? false}
                          onChange={(e) => setFormData({ ...formData, hasBatchNo: e.target.checked })}
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                        />
                        <span className="text-slate-700 dark:text-zinc-300 text-xs">
                          Has Batch No
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
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
                        Warehouse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.warehouse ?? ''}
                        onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                        Type of Transaction <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.typeOfTransaction ?? 'Inward'}
                        onChange={(e) => setFormData({ ...formData, typeOfTransaction: e.target.value as any })}
                        className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all cursor-pointer"
                      >
                        <option value="Inward">Inward</option>
                        <option value="Outward">Outward</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Serial / Batch No Table */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#27272A] space-y-3">
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    Serial / Batch No
                  </h3>

                  <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#1F1F23] text-slate-600 dark:text-zinc-400 select-none">
                          <th className="py-2.5 px-3 w-8">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                            />
                          </th>
                          <th className="py-2.5 px-3 w-12 font-normal text-slate-700 dark:text-zinc-300">No.</th>
                          <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300">Serial No</th>
                          <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300">Batch No</th>
                          <th className="py-2.5 px-3 w-20 font-normal text-slate-700 dark:text-zinc-300">Qty</th>
                          <th className="py-2.5 px-3 font-normal text-slate-700 dark:text-zinc-300">Warehouse</th>
                          <th className="py-2.5 px-3 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#202024]">
                        {rows.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1A1A1E]">
                            <td className="py-2.5 px-3">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400">{idx + 1}</td>
                            <td className="py-1 px-3">
                              <input
                                type="text"
                                value={row.serialNo ?? ''}
                                onChange={(e) => handleUpdateRow(row.id, 'serialNo', e.target.value)}
                                placeholder=""
                                className="w-full bg-transparent px-2 py-1 text-slate-800 dark:text-zinc-200 outline-none rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
                              />
                            </td>
                            <td className="py-1 px-3">
                              <input
                                type="text"
                                value={row.batchNo ?? ''}
                                onChange={(e) => handleUpdateRow(row.id, 'batchNo', e.target.value)}
                                placeholder=""
                                className="w-full bg-transparent px-2 py-1 text-slate-800 dark:text-zinc-200 outline-none rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
                              />
                            </td>
                            <td className="py-1 px-3">
                              <input
                                type="number"
                                value={row.qty}
                                onChange={(e) => handleUpdateRow(row.id, 'qty', Number(e.target.value) || 1)}
                                className="w-16 bg-transparent px-2 py-1 text-slate-800 dark:text-zinc-200 outline-none rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
                              />
                            </td>
                            <td className="py-1 px-3">
                              <input
                                type="text"
                                value={row.warehouse ?? ''}
                                onChange={(e) => handleUpdateRow(row.id, 'warehouse', e.target.value)}
                                placeholder={formData.warehouse || ''}
                                className="w-full bg-transparent px-2 py-1 text-slate-800 dark:text-zinc-200 outline-none rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {rows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(row.id)}
                                  className="text-slate-400 hover:text-red-500 transition-colors"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-medium transition-colors"
                    >
                      Add row
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alert('Download template / CSV')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('Upload CSV')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Reference Tab (Screenshot 3) */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Voucher Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.voucherType ?? ''}
                      onChange={(e) => setFormData({ ...formData, voucherType: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Voucher No
                    </label>
                    <input
                      type="text"
                      value={formData.voucherNo ?? ''}
                      onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>

                  <div className="pt-1 space-y-2.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.isCancelled ?? false}
                        onChange={(e) => setFormData({ ...formData, isCancelled: e.target.checked })}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                      />
                      <span className="text-slate-700 dark:text-zinc-300 text-xs">
                        Is Cancelled
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.isPacked ?? false}
                        onChange={(e) => setFormData({ ...formData, isPacked: e.target.checked })}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                      />
                      <span className="text-slate-700 dark:text-zinc-300 text-xs">
                        Is Packed
                      </span>
                    </label>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                      Posting Datetime
                    </label>
                    <input
                      type="text"
                      value={formData.postingDatetime ?? ''}
                      onChange={(e) => setFormData({ ...formData, postingDatetime: e.target.value })}
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                      Asia/Baku
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                    You created this · {currentBundle.createdBy || '3 months ago'}
                  </span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                  <span>
                    You last edited this · {currentBundle.lastEdited || '3 months ago'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <SerialAndBatchBundleDetailSidebar
          bundle={currentBundle}
          onToggleLike={() => toggleLike(currentBundle.id)}
        />
      </div>

      {/* Hidden button for Header trigger */}
      <button
        id="save-serial-and-batch-bundle-detail-btn"
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

