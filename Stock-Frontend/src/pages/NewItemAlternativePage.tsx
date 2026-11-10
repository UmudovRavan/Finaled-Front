import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItemAlternative } from '../context';

export const NewItemAlternativePage: React.FC = () => {
  const navigate = useNavigate();
  const { addAlternative } = useItemAlternative();

  const [itemCode, setItemCode] = useState('');
  const [alternativeItemCode, setAlternativeItemCode] = useState('');
  const [twoWay, setTwoWay] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemCode.trim()) {
      alert('Please enter an Item Code');
      return;
    }
    if (!alternativeItemCode.trim()) {
      alert('Please enter an Alternative Item Code');
      return;
    }

    try {
      setIsSaving(true);
      const created = await addAlternative({
        itemCode: itemCode.trim(),
        alternativeItemCode: alternativeItemCode.trim(),
        twoWay,
      });
      navigate(`/item-alternative/${encodeURIComponent(created.id)}`);
    } catch (err) {
      console.error('Failed to create Item Alternative', err);
      alert('Failed to create Item Alternative');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-sans text-xs pb-16">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-item-alternative-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
      </button>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-5 max-w-2xl">
          {/* Item Code */}
          <div>
            <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
              Item Code
            </label>
            <input
              type="text"
              required
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              placeholder=""
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
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
              value={alternativeItemCode}
              onChange={(e) => setAlternativeItemCode(e.target.value)}
              placeholder=""
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Two-way */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={twoWay}
                onChange={(e) => setTwoWay(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
              />
              <span className="text-slate-700 dark:text-zinc-300 text-xs">Two-way</span>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

