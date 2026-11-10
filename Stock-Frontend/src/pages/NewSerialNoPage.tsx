import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSerialNo } from '../context';

export const NewSerialNoPage: React.FC = () => {
  const navigate = useNavigate();
  const { addSerialNo } = useSerialNo();

  const [serialNo, setSerialNo] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [amcExpiryDate, setAmcExpiryDate] = useState('');
  const [company, setCompany] = useState('Avalon (Demo)');
  const [workOrder, setWorkOrder] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!serialNo.trim()) {
      alert('Serial No is required');
      return;
    }
    if (!itemCode.trim()) {
      alert('Item Code is required');
      return;
    }

    try {
      setIsSaving(true);
      const newRecord = await addSerialNo({
        serialNo: serialNo.trim(),
        itemCode: itemCode.trim(),
        status: 'Active',
        company: company.trim() || 'Avalon (Demo)',
        warrantyExpiryDate: warrantyExpiryDate || undefined,
        amcExpiryDate: amcExpiryDate || undefined,
        workOrder: workOrder.trim() || undefined,
      });
      navigate(`/serial-no/${encodeURIComponent(newRecord.id)}`);
    } catch (err) {
      console.error('Failed to create Serial No', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans text-xs">
      <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-8">
        {/* Top Details (Serial No & Item Code) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
              Serial No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
              Item Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              placeholder=""
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
                value={warrantyExpiryDate}
                onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                AMC Expiry Date
              </label>
              <input
                type="date"
                value={amcExpiryDate}
                onChange={(e) => setAmcExpiryDate(e.target.value)}
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
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                Work Order
              </label>
              <input
                type="text"
                value={workOrder}
                onChange={(e) => setWorkOrder(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>
          </div>
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

