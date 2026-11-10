import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Settings, Edit2 } from 'lucide-react';
import { useQualityInspectionTemplate } from '../context';
import type { QualityInspectionParameterItem } from '../types';

export const NewQualityInspectionTemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const { addTemplate } = useQualityInspectionTemplate();

  const [templateName, setTemplateName] = useState('');
  const [parameters, setParameters] = useState<QualityInspectionParameterItem[]>([
    {
      id: 'param-1',
      parameter: '',
      acceptanceCriteria: '',
      numeric: true,
      minValue: 0,
      maxValue: 0,
    },
  ]);
  const [selectedParamIndices, setSelectedParamIndices] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRow = () => {
    setParameters((prev) => [
      ...prev,
      {
        id: `param-${Date.now()}-${prev.length + 1}`,
        parameter: '',
        acceptanceCriteria: '',
        numeric: true,
        minValue: 0,
        maxValue: 0,
      },
    ]);
  };

  const handleRemoveSelectedRows = () => {
    setParameters((prev) => prev.filter((_, idx) => !selectedParamIndices.includes(idx)));
    setSelectedParamIndices([]);
  };

  const handleUpdateParam = (
    index: number,
    field: keyof QualityInspectionParameterItem,
    value: any
  ) => {
    setParameters((prev) =>
      prev.map((param, idx) => (idx === index ? { ...param, [field]: value } : param))
    );
  };

  const toggleSelectRow = (index: number) => {
    setSelectedParamIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleSelectAllRows = () => {
    if (selectedParamIndices.length === parameters.length) {
      setSelectedParamIndices([]);
    } else {
      setSelectedParamIndices(parameters.map((_, idx) => idx));
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!templateName.trim()) {
      alert('Please enter a Quality Inspection Template Name');
      return;
    }

    try {
      setIsSaving(true);
      const created = await addTemplate({
        templateName: templateName.trim(),
        parameters: parameters.filter((p) => p.parameter.trim() !== ''),
      });
      navigate(`/quality-inspection-template/${encodeURIComponent(created.id)}`);
    } catch (err) {
      console.error('Failed to create Quality Inspection Template', err);
      alert('Failed to create Quality Inspection Template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-sans text-xs pb-16">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-quality-inspection-template-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
      </button>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-6">
          {/* Quality Inspection Template Name */}
          <div className="max-w-md">
            <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
              Quality Inspection Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder=""
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Section: Item Quality Inspection Parameter */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Item Quality Inspection Parameter
              </h3>
              {selectedParamIndices.length > 0 && (
                <button
                  type="button"
                  onClick={handleRemoveSelectedRows}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete selected ({selectedParamIndices.length})</span>
                </button>
              )}
            </div>

            <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#1A1A1E] text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-[#27272A]">
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            parameters.length > 0 &&
                            selectedParamIndices.length === parameters.length
                          }
                          onChange={toggleSelectAllRows}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                        />
                      </th>
                      <th className="py-2.5 px-3 w-12 font-medium">No.</th>
                      <th className="py-2.5 px-3 font-medium">
                        Parameter <span className="text-red-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-medium">Acceptance Criteria</th>
                      <th className="py-2.5 px-3 w-20 font-medium text-center">Numeric</th>
                      <th className="py-2.5 px-3 w-32 font-medium">Minimum Value</th>
                      <th className="py-2.5 px-3 w-32 font-medium">Maximum Value</th>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <Settings className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] bg-white dark:bg-[#151518]">
                    {parameters.map((param, idx) => (
                      <tr
                        key={param.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-[#1E1E22]/50 transition-colors group"
                      >
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={selectedParamIndices.includes(idx)}
                            onChange={() => toggleSelectRow(idx)}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-zinc-400">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            required
                            value={param.parameter}
                            onChange={(e) =>
                              handleUpdateParam(idx, 'parameter', e.target.value)
                            }
                            placeholder=""
                            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={param.acceptanceCriteria ?? ''}
                            onChange={(e) =>
                              handleUpdateParam(idx, 'acceptanceCriteria', e.target.value)
                            }
                            placeholder=""
                            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={param.numeric}
                            onChange={(e) =>
                              handleUpdateParam(idx, 'numeric', e.target.checked)
                            }
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="any"
                            value={param.minValue ?? 0}
                            disabled={!param.numeric}
                            onChange={(e) =>
                              handleUpdateParam(
                                idx,
                                'minValue',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none disabled:opacity-40"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="any"
                            value={param.maxValue ?? 0}
                            disabled={!param.numeric}
                            onChange={(e) =>
                              handleUpdateParam(
                                idx,
                                'maxValue',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none disabled:opacity-40"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 opacity-60 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add row button */}
              <div className="p-2 bg-[#FAFBFB] dark:bg-[#18181B] border-t border-slate-200 dark:border-[#27272A]">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add row</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

