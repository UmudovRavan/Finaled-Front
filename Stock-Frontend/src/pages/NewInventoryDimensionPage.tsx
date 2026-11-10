import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryDimension } from '../context';

export const NewInventoryDimensionPage: React.FC = () => {
  const navigate = useNavigate();
  const { addDimension } = useInventoryDimension();

  const [activeTab, setActiveTab] = useState<'details' | 'applicable'>('details');

  // Form state
  const [dimensionName, setDimensionName] = useState('');
  const [referenceDocument, setReferenceDocument] = useState('');
  const [applyToAllInventoryDocuments, setApplyToAllInventoryDocuments] = useState(true);
  const [validateNegativeStock, setValidateNegativeStock] = useState(false);
  const [fetchValueFrom, setFetchValueFrom] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [mandatoryDependsOn, setMandatoryDependsOn] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dimensionName.trim()) {
      alert('Please enter a Dimension Name');
      return;
    }
    if (!referenceDocument.trim()) {
      alert('Please enter a Reference Document');
      return;
    }

    try {
      setSaving(true);
      const created = await addDimension({
        dimensionName: dimensionName.trim(),
        referenceDocument: referenceDocument.trim(),
        applyToAllInventoryDocuments,
        validateNegativeStock,
        fetchValueFrom: fetchValueFrom.trim(),
        mandatory,
        mandatoryDependsOn: mandatoryDependsOn.trim(),
      });
      navigate(`/inventory-dimension/${encodeURIComponent(created.id)}`);
    } catch (err) {
      console.error('Failed to save Inventory Dimension', err);
      alert('Failed to save Inventory Dimension');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-sans text-xs pb-16">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-inventory-dimension-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
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

      {/* Form Content */}
      <form onSubmit={handleSave}>
        {activeTab === 'details' && (
          <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dimension Name * */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                  Dimension Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dimensionName}
                  onChange={(e) => setDimensionName(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                />
              </div>

              {/* Reference Document * */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                  Reference Document <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={referenceDocument}
                  onChange={(e) => setReferenceDocument(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applicable' && (
          <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-6">
            {/* Checkboxes Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Apply to All Inventory Documents */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={applyToAllInventoryDocuments}
                  onChange={(e) => setApplyToAllInventoryDocuments(e.target.checked)}
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
                  checked={validateNegativeStock}
                  onChange={(e) => setValidateNegativeStock(e.target.checked)}
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
                value={fetchValueFrom}
                onChange={(e) => setFetchValueFrom(e.target.value)}
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all cursor-pointer"
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
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
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
                  value={mandatoryDependsOn}
                  onChange={(e) => setMandatoryDependsOn(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 font-mono text-xs p-3 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all resize-y"
                />
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 leading-relaxed">
                  Python expression evaluated on the server. Use doc.fieldname for the row and parent.fieldname for the parent document. When it evaluates to true the dimension becomes mandatory. Example: doc.t_warehouse and doc.qty &gt; 0
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

