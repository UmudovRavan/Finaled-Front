import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUOM } from '../context';

export const NewUOMPage: React.FC = () => {
  const navigate = useNavigate();
  const { addUOM } = useUOM();

  const [uomName, setUomName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [commonCode, setCommonCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [mustBeWholeNumber, setMustBeWholeNumber] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!uomName.trim()) {
      alert('UOM Name is required');
      return;
    }

    try {
      setIsSaving(true);
      const newRecord = await addUOM({
        uomName: uomName.trim(),
        symbol: symbol.trim(),
        commonCode: commonCode.trim(),
        description: description.trim(),
        category: category.trim(),
        enabled,
        mustBeWholeNumber,
        status: enabled ? 'Enabled' : 'Disabled',
      });
      navigate(`/uom/${encodeURIComponent(newRecord.id)}`);
    } catch (err) {
      console.error('Failed to create UOM', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans text-xs">
      <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                UOM Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={uomName}
                onChange={(e) => setUomName(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                Common Code
              </label>
              <input
                type="text"
                value={commonCode}
                onChange={(e) => setCommonCode(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                According to CEFACT/ICG/2010/IC013 or CEFACT/ICG/2010/IC010
              </p>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs resize-y transition-all"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                />
                <span className="font-normal text-slate-700 dark:text-zinc-300">
                  Enabled
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={mustBeWholeNumber}
                  onChange={(e) => setMustBeWholeNumber(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 dark:border-zinc-700 text-black dark:text-white focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-normal text-slate-700 dark:text-zinc-300">
                    Must be Whole Number
                  </span>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    Check this to disallow fractions. (for Nos)
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden button for Header trigger */}
      <button
        id="save-new-uom-btn"
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

