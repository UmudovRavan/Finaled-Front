import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { useItemGroup } from '../context';
import type { ItemGroupDefaultRow, ItemGroupTaxRow } from '../types';

export const NewItemGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { addGroup, groups } = useItemGroup();

  const [itemGroupName, setItemGroupName] = useState('');
  const [parentItemGroup, setParentItemGroup] = useState('');
  const [isGroup, setIsGroup] = useState(false);

  // Defaults Table
  const [defaults, setDefaults] = useState<ItemGroupDefaultRow[]>([]);
  const [selectedDefaultRows, setSelectedDefaultRows] = useState<string[]>([]);

  // Tax Table
  const [taxes, setTaxes] = useState<ItemGroupTaxRow[]>([]);
  const [selectedTaxRows, setSelectedTaxRows] = useState<string[]>([]);

  const handleAddDefaultRow = () => {
    const newRow: ItemGroupDefaultRow = {
      id: `def-${Date.now()}`,
      company: 'Altensor ERP Corp',
      defaultWarehouse: '',
      defaultPriceList: '',
    };
    setDefaults((prev) => [...prev, newRow]);
  };

  const handleRemoveDefaultRows = () => {
    setDefaults((prev) => prev.filter((r) => !selectedDefaultRows.includes(r.id)));
    setSelectedDefaultRows([]);
  };

  const handleAddTaxRow = () => {
    const newRow: ItemGroupTaxRow = {
      id: `tax-${Date.now()}`,
      itemTaxTemplate: '',
      taxCategory: '',
      validFrom: '',
      minNetRate: '',
      maxNetRate: '',
    };
    setTaxes((prev) => [...prev, newRow]);
  };

  const handleRemoveTaxRows = () => {
    setTaxes((prev) => prev.filter((r) => !selectedTaxRows.includes(r.id)));
    setSelectedTaxRows([]);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemGroupName.trim()) {
      alert('Please enter Item Group Name');
      return;
    }
    const created = await addGroup({
      itemGroupName: itemGroupName.trim(),
      parentItemGroup: parentItemGroup.trim(),
      isGroup,
      defaults,
      taxes,
    });
    navigate(`/item-group/${encodeURIComponent(created.id)}`);
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-6 max-w-5xl">
      {/* Top Header fallback if standalone */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-8">
          {/* SECTION 1: General Settings */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              General Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 text-xs mb-1.5 font-normal">
                    Item Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemGroupName}
                    onChange={(e) => setItemGroupName(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 text-xs mb-1.5 font-normal">
                    Parent Item Group
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="parent-group-options"
                      value={parentItemGroup}
                      onChange={(e) => setParentItemGroup(e.target.value)}
                      placeholder="e.g. All Item Groups"
                      className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                    />
                    <datalist id="parent-group-options">
                      {groups.map((g) => (
                        <option key={g.id} value={g.itemGroupName} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="pt-2 md:pt-4">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGroup}
                    onChange={(e) => setIsGroup(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white text-xs">
                      Is Group
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-400 mt-0.5">
                      Only leaf nodes are allowed in transaction
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* SECTION 2: Defaults */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Defaults
            </h2>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Item Group Defaults
              </h3>

              <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFBFD] dark:bg-[#1A1A1E] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 text-[11px] font-normal">
                      <th className="w-9 py-2 pl-3 pr-1 text-center">
                        <input
                          type="checkbox"
                          checked={defaults.length > 0 && selectedDefaultRows.length === defaults.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDefaultRows(defaults.map((d) => d.id));
                            } else {
                              setSelectedDefaultRows([]);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 accent-black dark:accent-white"
                        />
                      </th>
                      <th className="w-12 py-2 px-3 font-normal">No.</th>
                      <th className="py-2 px-3 font-normal">Company *</th>
                      <th className="py-2 px-3 font-normal">Default Warehouse</th>
                      <th className="py-2 px-3 font-normal">Default Price List</th>
                      <th className="w-10 py-2 px-3 text-right">
                        <Settings className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#202024] text-slate-700 dark:text-zinc-300">
                    {defaults.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-7 text-center text-slate-400 dark:text-zinc-400 text-xs">
                          No rows
                        </td>
                      </tr>
                    ) : (
                      defaults.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-[#1E1E22]">
                          <td className="py-2 pl-3 pr-1 text-center">
                            <input
                              type="checkbox"
                              checked={selectedDefaultRows.includes(row.id)}
                              onChange={() =>
                                setSelectedDefaultRows((prev) =>
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
                              value={row.company}
                              onChange={(e) =>
                                setDefaults((prev) =>
                                  prev.map((r) => (r.id === row.id ? { ...r, company: e.target.value } : r))
                                )
                              }
                              className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.defaultWarehouse || ''}
                              onChange={(e) =>
                                setDefaults((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, defaultWarehouse: e.target.value } : r
                                  )
                                )
                              }
                              placeholder="Stores - AD"
                              className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-400"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.defaultPriceList || ''}
                              onChange={(e) =>
                                setDefaults((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, defaultPriceList: e.target.value } : r
                                  )
                                )
                              }
                              placeholder="Standard Selling"
                              className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-400"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDefaults((prev) => prev.filter((r) => r.id !== row.id))}
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
                  onClick={handleAddDefaultRow}
                  className="px-3 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#27272A] font-medium text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add row</span>
                </button>
                {selectedDefaultRows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRemoveDefaultRows}
                    className="px-3 py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 transition-colors"
                  >
                    Delete ({selectedDefaultRows.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* SECTION 3: Item Tax */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Item Tax
            </h2>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Taxes
              </h3>

              <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFBFD] dark:bg-[#1A1A1E] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 text-[11px] font-normal">
                      <th className="w-9 py-2 pl-3 pr-1 text-center">
                        <input
                          type="checkbox"
                          checked={taxes.length > 0 && selectedTaxRows.length === taxes.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTaxRows(taxes.map((t) => t.id));
                            } else {
                              setSelectedTaxRows([]);
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 accent-black dark:accent-white"
                        />
                      </th>
                      <th className="w-12 py-2 px-3 font-normal">No.</th>
                      <th className="py-2 px-3 font-normal">Item Tax Template *</th>
                      <th className="py-2 px-3 font-normal">Tax Category</th>
                      <th className="py-2 px-3 font-normal">Valid From</th>
                      <th className="py-2 px-3 font-normal">Min Net Rate</th>
                      <th className="py-2 px-3 font-normal">Max Net Rate</th>
                      <th className="w-10 py-2 px-3 text-right">
                        <Settings className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#202024] text-slate-700 dark:text-zinc-300">
                    {taxes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-7 text-center text-slate-400 dark:text-zinc-400 text-xs">
                          No rows
                        </td>
                      </tr>
                    ) : (
                      taxes.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-[#1E1E22]">
                          <td className="py-2 pl-3 pr-1 text-center">
                            <input
                              type="checkbox"
                              checked={selectedTaxRows.includes(row.id)}
                              onChange={() =>
                                setSelectedTaxRows((prev) =>
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
                              value={row.itemTaxTemplate}
                              onChange={(e) =>
                                setTaxes((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, itemTaxTemplate: e.target.value } : r
                                  )
                                )
                              }
                              placeholder="VAT 18%"
                              className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.taxCategory || ''}
                              onChange={(e) =>
                                setTaxes((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, taxCategory: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={row.validFrom || ''}
                              onChange={(e) =>
                                setTaxes((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, validFrom: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={row.minNetRate ?? ''}
                              onChange={(e) =>
                                setTaxes((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, minNetRate: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={row.maxNetRate ?? ''}
                              onChange={(e) =>
                                setTaxes((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, maxNetRate: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full bg-transparent border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setTaxes((prev) => prev.filter((r) => r.id !== row.id))}
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
                  onClick={handleAddTaxRow}
                  className="px-3 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-[#27272A] font-medium text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add row</span>
                </button>
                {selectedTaxRows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRemoveTaxRows}
                    className="px-3 py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 transition-colors"
                  >
                    Delete ({selectedTaxRows.length})
                  </button>
                )}
              </div>
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

export default NewItemGroupPage;

