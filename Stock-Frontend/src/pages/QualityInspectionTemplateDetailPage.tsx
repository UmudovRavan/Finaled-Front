import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Trash2, Settings, Edit2 } from 'lucide-react';
import { useQualityInspectionTemplate } from '../context';
import { QualityInspectionTemplateDetailSidebar } from '../components/quality-inspection-template';
import type { QualityInspectionTemplateRecord, QualityInspectionParameterItem } from '../types';

export const QualityInspectionTemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { templates, updateTemplate, toggleLike } = useQualityInspectionTemplate();

  const decodedId = decodeURIComponent(id || '');
  const currentTemplate = templates.find(
    (t) => t.id.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState<Partial<QualityInspectionTemplateRecord>>({});
  const [parameters, setParameters] = useState<QualityInspectionParameterItem[]>([]);
  const [selectedParamIndices, setSelectedParamIndices] = useState<number[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentTemplate) {
      setFormData(currentTemplate);
      setParameters(currentTemplate.parameters || []);
    }
  }, [currentTemplate]);

  if (!currentTemplate) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Quality Inspection Template not found.
      </div>
    );
  }

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
    try {
      setIsSaving(true);
      await updateTemplate(currentTemplate.id, {
        ...formData,
        parameters,
      });
    } catch (err) {
      console.error('Failed to update Quality Inspection Template', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-quality-inspection-template-detail-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
      </button>

      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-6">
              {/* Quality Inspection Top Box */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 mb-2 font-normal text-xs">
                  Quality Inspection
                </label>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-[#27272A] transition-colors cursor-pointer">
                  <span>Quality Inspection</span>
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                </div>
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
                      <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] bg-white dark:bg-[#18181B]">
                        {parameters.map((param, idx) => (
                          <tr
                            key={param.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-[#202024]/50 transition-colors group"
                          >
                            <td className="py-2 px-3">
                              <input
                                type="checkbox"
                                checked={selectedParamIndices.includes(idx)}
                                onChange={() => toggleSelectRow(idx)}
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                              />
                            </td>
                            <td className="py-2 px-3 text-slate-500 dark:text-zinc-400">
                              {idx + 1}
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                required
                                value={param.parameter}
                                onChange={(e) =>
                                  handleUpdateParam(idx, 'parameter', e.target.value)
                                }
                                placeholder=""
                                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
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
                                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none"
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
                                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none disabled:opacity-40"
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
                                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-2.5 py-1.5 rounded border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none disabled:opacity-40"
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

          {/* Comments Section */}
          <div className="space-y-4 pt-4">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Comments
            </h4>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] flex items-center justify-center font-medium text-slate-600 dark:text-zinc-300 shrink-0 text-xs">
                A
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type a reply / comment"
                  rows={3}
                  className="w-full bg-[#F4F5F7] dark:bg-[#18181B] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-xs p-3 rounded-lg border border-slate-200/80 dark:border-[#27272A] focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all resize-y"
                />
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setCommentText('')}
                    className="px-3 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium rounded-md text-xs hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-[#27272A]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsActivityOpen(!isActivityOpen)}
                className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-xs hover:text-slate-600 dark:hover:text-zinc-400 transition-colors"
              >
                <span>Activity</span>
                {isActivityOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                className="flex items-center gap-1 px-2.5 py-1 bg-[#F4F5F7] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 rounded-md hover:bg-slate-200 dark:hover:bg-[#27272A] transition-colors text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Email</span>
              </button>
            </div>

            {isActivityOpen && (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-[#27272A]">
                <div className="relative flex items-center gap-2">
                  <div className="absolute -left-6 w-4 h-4 rounded-full bg-slate-100 dark:bg-[#202024] border border-slate-300 dark:border-zinc-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                  <span className="text-slate-700 dark:text-zinc-300 font-medium text-xs">
                    You created this
                  </span>
                  <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                    · {currentTemplate.createdOn || 'yesterday'}
                  </span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div className="absolute -left-6 w-4 h-4 rounded-full bg-slate-100 dark:bg-[#202024] border border-slate-300 dark:border-zinc-600 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                  <span className="text-slate-700 dark:text-zinc-300 font-medium text-xs">
                    You last edited this
                  </span>
                  <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                    · {currentTemplate.lastEdited || 'yesterday'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <QualityInspectionTemplateDetailSidebar
          template={currentTemplate}
          onToggleLike={() => toggleLike(currentTemplate.id)}
        />
      </div>
    </div>
  );
};

