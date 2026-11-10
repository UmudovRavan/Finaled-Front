import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Settings, Plus, Trash2, ChevronUp } from 'lucide-react';
import { useItemAttribute } from '../context';
import type { ItemAttributeValueRow } from '../types';
import { ItemAttributeDetailSidebar } from '../components/item-attribute/ItemAttributeDetailSidebar';

export const ItemAttributeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { attributes, updateAttribute, toggleLike } = useItemAttribute();

  const decodedId = id ? decodeURIComponent(id) : 'Colour';
  const attribute =
    attributes.find(
      (a) =>
        a.id.toLowerCase() === decodedId.toLowerCase() ||
        a.attributeName.toLowerCase() === decodedId.toLowerCase()
    ) || {
      id: decodedId,
      attributeName: decodedId,
      status: 'Enabled' as const,
      disabled: false,
      numericValues: false,
      values: [],
      timeAgoText: '3 M',
      commentsCount: 0,
      isLiked: false,
    };

  const [attributeName, setAttributeName] = useState(attribute.attributeName);
  const [disabled, setDisabled] = useState(attribute.disabled || attribute.status === 'Disabled');
  const [numericValues, setNumericValues] = useState(attribute.numericValues || false);
  const [values, setValues] = useState<ItemAttributeValueRow[]>(attribute.values || []);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);

  const handleAddRow = () => {
    const newRow: ItemAttributeValueRow = {
      id: `val-${Date.now()}`,
      attributeValue: '',
      abbreviation: '',
    };
    setValues((prev) => [...prev, newRow]);
  };

  const handleRemoveRows = () => {
    setValues((prev) => prev.filter((r) => !selectedRows.includes(r.id)));
    setSelectedRows([]);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateAttribute(attribute.id, {
      attributeName,
      disabled,
      status: disabled ? 'Disabled' : 'Enabled',
      numericValues,
      values,
    });
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* 2 Columns: Form & Activity on Left, Sidebar on Right */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Column */}
        <div className="flex-1 w-full space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-8">
              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column: Attribute Name + Numeric Values */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 text-xs mb-1.5 font-normal">
                      Attribute Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={attributeName}
                      onChange={(e) => setAttributeName(e.target.value)}
                      className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={numericValues}
                        onChange={(e) => setNumericValues(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white cursor-pointer"
                      />
                      <span className="font-normal text-slate-800 dark:text-zinc-200 text-xs">
                        Numeric Values
                      </span>
                    </label>
                  </div>
                </div>

                {/* Right Column: Disabled Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={disabled}
                      onChange={(e) => setDisabled(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white cursor-pointer"
                    />
                    <span className="font-normal text-slate-800 dark:text-zinc-200 text-xs">
                      Disabled
                    </span>
                  </label>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-[#27272A]" />

              {/* Item Attribute Values Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Item Attribute Values
                </h3>

                <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAFBFD] dark:bg-[#1A1A1E] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 text-[11px] font-normal">
                        <th className="w-9 py-2 pl-3 pr-1 text-center">
                          <input
                            type="checkbox"
                            checked={values.length > 0 && selectedRows.length === values.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows(values.map((v) => v.id));
                              } else {
                                setSelectedRows([]);
                              }
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 accent-black dark:accent-white"
                          />
                        </th>
                        <th className="w-12 py-2 px-3 font-normal">No.</th>
                        <th className="py-2 px-3 font-normal">Attribute Value *</th>
                        <th className="py-2 px-3 font-normal">Abbreviation *</th>
                        <th className="w-10 py-2 px-3 text-right">
                          <Settings className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#202024] text-slate-700 dark:text-zinc-300">
                      {values.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-7 text-center text-slate-400 dark:text-zinc-400 text-xs">
                            No rows
                          </td>
                        </tr>
                      ) : (
                        values.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-[#1E1E22]">
                            <td className="py-2 pl-3 pr-1 text-center">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(row.id)}
                                onChange={() =>
                                  setSelectedRows((prev) =>
                                    prev.includes(row.id)
                                      ? prev.filter((i) => i !== row.id)
                                      : [...prev, row.id]
                                  )
                                }
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 accent-black dark:accent-white"
                              />
                            </td>
                            <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.attributeValue}
                                onChange={(e) =>
                                  setValues((prev) =>
                                    prev.map((r) => (r.id === row.id ? { ...r, attributeValue: e.target.value } : r))
                                  )
                                }
                                className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.abbreviation}
                                onChange={(e) =>
                                  setValues((prev) =>
                                    prev.map((r) => (r.id === row.id ? { ...r, abbreviation: e.target.value } : r))
                                  )
                                }
                                className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => setValues((prev) => prev.filter((r) => r.id !== row.id))}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5 ml-auto" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-3 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#27272A] font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Add row</span>
                  </button>
                  {selectedRows.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveRows}
                      className="px-3 py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 transition-colors"
                    >
                      Delete ({selectedRows.length})
                    </button>
                  )}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-[#27272A]" />

              {/* Comments Section */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Comments
                </h2>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#E0E7FF] dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center shrink-0">
                    A
                  </div>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type a reply / comment"
                    className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-900 dark:text-white px-3.5 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <hr className="border-slate-100 dark:border-[#27272A]" />

              {/* Activity Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Activity
                  </h2>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-slate-500" />
                    <span>New Email</span>
                  </button>
                </div>

                {isActivityOpen && (
                  <div className="relative pl-5 border-l-2 border-slate-200 dark:border-[#27272A] space-y-4 pt-1 ml-2">
                    <div className="relative">
                      <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-zinc-500 ring-4 ring-white dark:ring-[#151518]" />
                      <div className="text-xs text-slate-600 dark:text-zinc-300">
                        You created this · <span className="text-slate-400 dark:text-zinc-400">3 months ago</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsActivityOpen(!isActivityOpen)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    <ChevronUp
                      className={`w-4 h-4 transition-transform duration-200 ${
                        !isActivityOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Save Action Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium text-xs shadow-sm transition-all"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: ItemAttributeDetailSidebar */}
        <ItemAttributeDetailSidebar
          attribute={attribute}
          onToggleLike={() => toggleLike(attribute.id)}
        />
      </div>
    </div>
  );
};

export default ItemAttributeDetailPage;

