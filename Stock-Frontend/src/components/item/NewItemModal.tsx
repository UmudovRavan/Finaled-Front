import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useItem } from '../../context';

export const NewItemModal: React.FC = () => {
  const navigate = useNavigate();
  const { isNewItemModalOpen, setIsNewItemModalOpen, addItem } = useItem();

  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [defaultUom, setDefaultUom] = useState('Nos');
  const [maintainStock, setMaintainStock] = useState(true);
  const [isFixedAsset, setIsFixedAsset] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewItemModalOpen) return null;

  const handleClose = () => {
    setIsNewItemModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim()) return;

    try {
      setIsSubmitting(true);
      await addItem({
        id: itemCode.trim(),
        itemCode: itemCode.trim(),
        itemName: itemName.trim() || itemCode.trim(),
        itemGroup: itemGroup.trim() || 'Products',
        uom: defaultUom.trim() || 'Nos',
        status: 'Enabled',
        itemType: maintainStock ? 'Stock' : 'Non-Stock',
        purpose: 'Sales & Purchase',
        maintainStock,
        isFixedAsset,
      });

      // Reset & close
      setItemCode('');
      setItemName('');
      setItemGroup('');
      setDefaultUom('Nos');
      setMaintainStock(true);
      setIsFixedAsset(false);
      setIsNewItemModalOpen(false);
    } catch (err) {
      console.error('Failed to create item', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[560px] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#2C2C2E] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#2C2C2E]">
          <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white">
            New Item
          </h2>
          <button
            onClick={handleClose}
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Modal Form matching Screenshot 2 */}
        <form onSubmit={handleSave}>
          <div className="px-6 py-5 space-y-4 text-xs">
            {/* Item Code * */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                Item Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full h-9 px-3 bg-[#F4F5F7] dark:bg-[#27272A] hover:bg-[#EBEEF2] dark:hover:bg-[#333] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#3E3E44] outline-none transition-colors text-xs"
              />
            </div>

            {/* Item Name */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                Item Name
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full h-9 px-3 bg-[#F4F5F7] dark:bg-[#27272A] hover:bg-[#EBEEF2] dark:hover:bg-[#333] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#3E3E44] outline-none transition-colors text-xs"
              />
            </div>

            {/* Item Group * */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                Item Group <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={itemGroup}
                onChange={(e) => setItemGroup(e.target.value)}
                placeholder="e.g. Products, Demo Item Group, Consumable"
                className="w-full h-9 px-3 bg-[#F4F5F7] dark:bg-[#27272A] hover:bg-[#EBEEF2] dark:hover:bg-[#333] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#3E3E44] outline-none transition-colors text-xs"
              />
            </div>

            {/* Default Unit of Measure * */}
            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                Default Unit of Measure <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={defaultUom}
                onChange={(e) => setDefaultUom(e.target.value)}
                className="w-full h-9 px-3 bg-[#F4F5F7] dark:bg-[#27272A] hover:bg-[#EBEEF2] dark:hover:bg-[#333] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#3E3E44] outline-none transition-colors text-xs"
              />
            </div>

            {/* Maintain Stock Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={maintainStock}
                  onChange={(e) => setMaintainStock(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    Maintain Stock
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                    Altensor ERP will make a stock ledger entry for each transaction of this item. Keep unchecked for non-stock or service items.
                  </p>
                </div>
              </label>
            </div>

            {/* Is Fixed Asset Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFixedAsset}
                  onChange={(e) => setIsFixedAsset(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    Is Fixed Asset
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                    Enable if this item is a company asset like machinery or furniture.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Footer matching Screenshot 2 */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-[#2C2C2E] bg-slate-50/50 dark:bg-[#18181B]/50">
            <button
              type="button"
              onClick={() => {
                setIsNewItemModalOpen(false);
                navigate('/item/new', {
                  state: {
                    itemCode,
                    itemName,
                    itemGroup,
                    defaultUom,
                    maintainStock,
                    isFixedAsset,
                  },
                });
              }}
              className="px-3.5 py-1.5 bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-[#E5E7EB] dark:hover:bg-[#333] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
            >
              Edit Full Form
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-1.5 bg-[#18181B] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-zinc-200 rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewItemModal;

