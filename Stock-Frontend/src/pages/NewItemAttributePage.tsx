import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useItemAttribute } from '../context';
import type { ItemAttributeValueRow } from '../types';

export const NewItemAttributePage: React.FC = () => {
  const navigate = useNavigate();
  const { addAttribute } = useItemAttribute();

  const [attributeName, setAttributeName] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [numericValues, setNumericValues] = useState(false);

  const [values, setValues] = useState<ItemAttributeValueRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!attributeName.trim()) {
      alert('Please enter Attribute Name');
      return;
    }
    const created = await addAttribute({
      attributeName: attributeName.trim(),
      disabled,
      status: disabled ? 'Disabled' : 'Enabled',
      numericValues,
      values,
    });
    navigate(`/item-attribute/${encodeURIComponent(created.id)}`);
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-6 max-w-5xl">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-8">
          {/* Top Form Section */}
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
                            placeholder="e.g. Red"
                            className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
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
                            placeholder="e.g. RED"
                            className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-600"
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
  );
};

export default NewItemAttributePage;

