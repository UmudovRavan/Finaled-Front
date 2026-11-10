import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';
import { useSerialAndBatchBundle } from '../context';
import type { SerialAndBatchBundleItem } from '../types';

export const NewSerialAndBatchBundlePage: React.FC = () => {
  const navigate = useNavigate();
  const { addBundle } = useSerialAndBatchBundle();

  const [activeTab, setActiveTab] = useState<'serial_and_batch' | 'reference'>('serial_and_batch');

  // Serial and Batch Tab fields
  const [namingSeries, setNamingSeries] = useState('SABB-.########');
  const [company, setCompany] = useState('Avalon (Demo)');
  const [hasSerialNo, setHasSerialNo] = useState(false);
  const [hasBatchNo, setHasBatchNo] = useState(false);
  const [itemCode, setItemCode] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [typeOfTransaction, setTypeOfTransaction] = useState<'Inward' | 'Outward'>('Inward');

  const [rows, setRows] = useState<SerialAndBatchBundleItem[]>([
    { id: 'row-1', serialNo: '', batchNo: '', qty: 1, warehouse: '' },
  ]);

  // Reference Tab fields
  const [voucherType, setVoucherType] = useState('');
  const [voucherNo, setVoucherNo] = useState('');
  const [isCancelled, setIsCancelled] = useState(false);
  const [isPacked, setIsPacked] = useState(false);
  const [postingDatetime, setPostingDatetime] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        serialNo: '',
        batchNo: '',
        qty: 1,
        warehouse: warehouse || '',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleUpdateRow = (id: string, field: keyof SerialAndBatchBundleItem, value: any) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = async () => {
    if (!itemCode.trim()) {
      alert('Item Code is required');
      setActiveTab('serial_and_batch');
      return;
    }

    try {
      setIsSaving(true);
      const newRecord = await addBundle({
        namingSeries,
        company: company.trim() || 'Avalon (Demo)',
        hasSerialNo,
        hasBatchNo,
        itemCode: itemCode.trim(),
        warehouse: warehouse.trim(),
        typeOfTransaction,
        items: rows,
        voucherType: voucherType.trim(),
        voucherNo: voucherNo.trim(),
        isCancelled,
        isPacked,
        postingDatetime: postingDatetime || new Date().toISOString(),
        status: 'Draft',
      });
      navigate(`/serial-and-batch-bundle/${encodeURIComponent(newRecord.id)}`);
    } catch (err) {
      console.error('Failed to create Serial and Batch Bundle', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans text-xs">
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
                    value={namingSeries}
                    onChange={(e) => setNamingSeries(e.target.value)}
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
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>

                <div className="pt-1 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasSerialNo}
                      onChange={(e) => setHasSerialNo(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                    />
                    <span className="text-slate-700 dark:text-zinc-300 text-xs">
                      Has Serial No
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasBatchNo}
                      onChange={(e) => setHasBatchNo(e.target.checked)}
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
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-red-200/80 dark:border-red-900/40 focus:border-red-400 dark:focus:border-red-600 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    placeholder=""
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                    Type of Transaction <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={typeOfTransaction}
                    onChange={(e) => setTypeOfTransaction(e.target.value as any)}
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
                            placeholder={warehouse || ''}
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
                  value={voucherType}
                  onChange={(e) => setVoucherType(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-red-200/80 dark:border-red-900/40 focus:border-red-400 dark:focus:border-red-600 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1.5 font-normal">
                  Voucher No
                </label>
                <input
                  type="text"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
              </div>

              <div className="pt-1 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCancelled}
                    onChange={(e) => setIsCancelled(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                  />
                  <span className="text-slate-700 dark:text-zinc-300 text-xs">
                    Is Cancelled
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPacked}
                    onChange={(e) => setIsPacked(e.target.checked)}
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
                  type="datetime-local"
                  value={postingDatetime}
                  onChange={(e) => setPostingDatetime(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                />
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                  Asia/Baku
                </p>
              </div>
            </div>
          </div>
        )}

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

