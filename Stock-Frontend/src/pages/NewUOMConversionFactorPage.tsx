import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUOMConversionFactor } from '../context';

export const NewUOMConversionFactorPage: React.FC = () => {
  const navigate = useNavigate();
  const { addConversionFactor } = useUOMConversionFactor();

  const [category, setCategory] = useState('');
  const [fromUOM, setFromUOM] = useState('');
  const [toUOM, setToUOM] = useState('');
  const [value, setValue] = useState('0.000000000');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!category.trim() || !fromUOM.trim() || !toUOM.trim()) {
      alert('Category, From, and To fields are required');
      return;
    }

    try {
      setIsSaving(true);
      const newRecord = await addConversionFactor({
        category: category.trim(),
        fromUOM: fromUOM.trim(),
        toUOM: toUOM.trim(),
        value: value.trim() || '0.000000000',
      });
      navigate(`/uom-conversion-factor/${encodeURIComponent(newRecord.id)}`);
    } catch (err) {
      console.error('Failed to create UOM Conversion Factor', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 font-sans text-xs">
      <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-5">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              autoFocus
            />
          </div>

          <div className="border-t border-slate-100 dark:border-[#27272A] pt-3 space-y-4">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                From <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fromUOM}
                onChange={(e) => setFromUOM(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={toUOM}
                onChange={(e) => setToUOM(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 font-mono px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden button for Header trigger */}
      <button
        id="save-new-uom-conversion-factor-btn"
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

