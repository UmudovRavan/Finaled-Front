import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBatch } from '../context';

export const NewBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const { addBatch } = useBatch();

  const [batchId, setBatchId] = useState('');
  const [item, setItem] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState('2026-11-10');
  const [batchUOM, setBatchUOM] = useState('Nos');
  const [expiryDate, setExpiryDate] = useState('');
  const [useBatchWiseValuation, setUseBatchWiseValuation] = useState(false);
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!batchId.trim()) {
      alert('Batch ID is required');
      return;
    }
    if (!item.trim()) {
      alert('Item is required');
      return;
    }

    try {
      setIsSaving(true);
      const newRecord = await addBatch({
        batchId: batchId.trim(),
        item: item.trim(),
        manufacturingDate: manufacturingDate || '10-11-2026',
        batchUOM: batchUOM.trim() || 'Nos',
        expiryDate: expiryDate || undefined,
        useBatchWiseValuation,
        allowNegativeStock,
        description: description.trim(),
        status: 'Active',
      });
      navigate(`/batch-no/${encodeURIComponent(newRecord.id)}`);
    } catch (err) {
      console.error('Failed to create Batch', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans text-xs">
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
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Item <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-red-200/80 dark:border-red-900/40 focus:border-red-400 dark:focus:border-red-600 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Manufacturing Date
                </label>
                <input
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
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
                  value={batchUOM}
                  onChange={(e) => setBatchUOM(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div className="pt-1 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useBatchWiseValuation}
                    onChange={(e) => setUseBatchWiseValuation(e.target.checked)}
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
                      checked={allowNegativeStock}
                      onChange={(e) => setAllowNegativeStock(e.target.checked)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs resize-y transition-all"
          />
        </div>

        {/* Hidden button for Header trigger */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="hidden"
        >
          Save
        </button>
      </div>
    </div>
  );
};

