import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useShippingRule } from '../context';
import { ShippingRuleDetailSidebar } from '../components/shipping-rule';
import type { ShippingRuleRecord, ShippingRuleType, ShippingCalculateBasedOn } from '../types';

export const ShippingRuleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { shippingRules, updateShippingRule, toggleLike } = useShippingRule();

  const decodedId = decodeURIComponent(id || '');
  const currentShippingRule = shippingRules.find(
    (s) =>
      s.id.toLowerCase() === decodedId.toLowerCase() ||
      s.shippingRuleLabel.toLowerCase() === decodedId.toLowerCase()
  );

  const [formData, setFormData] = useState<Partial<ShippingRuleRecord>>({});
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [selectedCountryIndices, setSelectedCountryIndices] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentShippingRule) {
      setFormData(currentShippingRule);
    }
  }, [currentShippingRule]);

  if (!currentShippingRule) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Shipping Rule not found.
      </div>
    );
  }

  const handleAddCountryRow = () => {
    setFormData((prev) => ({
      ...prev,
      countries: [
        ...(prev.countries || []),
        { id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, country: '' },
      ],
    }));
  };

  const handleRemoveCountryRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      countries: (prev.countries || []).filter((_, i) => i !== index),
    }));
    setSelectedCountryIndices((prev) => prev.filter((i) => i !== index));
  };

  const handleCountryChange = (index: number, val: string) => {
    setFormData((prev) => ({
      ...prev,
      countries: (prev.countries || []).map((item, i) =>
        i === index ? { ...item, country: val } : item
      ),
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      await updateShippingRule(currentShippingRule.id, formData);
    } catch (err) {
      console.error('Failed to update Shipping Rule', err);
    } finally {
      setIsSaving(false);
    }
  };

  const countries = formData.countries || [];

  return (
    <div className="max-w-7xl mx-auto pb-16 font-sans text-xs">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-shipping-rule-detail-btn"
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
              {/* Row 1: Shipping Rule Label * and Shipping Rule Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                    Shipping Rule Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shippingRuleLabel ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingRuleLabel: e.target.value })
                    }
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                    Shipping Rule Type
                  </label>
                  <select
                    value={formData.shippingRuleType ?? 'Selling'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingRuleType: e.target.value as ShippingRuleType,
                      })
                    }
                    className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all cursor-pointer"
                  >
                    <option value="Selling">Selling</option>
                    <option value="Buying">Buying</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Disabled Checkbox */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.disabled ?? false}
                    onChange={(e) =>
                      setFormData({ ...formData, disabled: e.target.checked })
                    }
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                  />
                  <span className="text-slate-700 dark:text-zinc-300 text-xs">Disabled</span>
                </label>
              </div>

              {/* Accounting Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#202024] space-y-6">
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Accounting
                </div>

                {/* Row 3: Company * and Shipping Account * */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company ?? ''}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                      Shipping Account <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.shippingAccount ?? ''}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingAccount: e.target.value })
                      }
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Row 4: Calculate Based On and Shipping Amount * */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                      Calculate Based On
                    </label>
                    <select
                      value={formData.calculateBasedOn ?? 'Fixed'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          calculateBasedOn: e.target.value as ShippingCalculateBasedOn,
                        })
                      }
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all cursor-pointer"
                    >
                      <option value="Fixed">Fixed</option>
                      <option value="Net Total">Net Total</option>
                      <option value="Net Weight">Net Weight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                      Shipping Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.shippingAmount ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shippingAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Restrict to Countries Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#202024] space-y-4">
                <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Restrict to Countries
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Valid for Countries
                </div>

                {/* Countries Table */}
                <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#1A1A1E] text-slate-500 dark:text-zinc-400 text-[11px]">
                        <th className="w-9 py-2 pl-3 pr-1 text-center">
                          <input
                            type="checkbox"
                            checked={
                              countries.length > 0 &&
                              selectedCountryIndices.length === countries.length
                            }
                            onChange={() => {
                              if (selectedCountryIndices.length === countries.length) {
                                setSelectedCountryIndices([]);
                              } else {
                                setSelectedCountryIndices(countries.map((_, i) => i));
                              }
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                          />
                        </th>
                        <th className="w-12 py-2 px-2 font-normal">No.</th>
                        <th className="py-2 px-3 font-normal">
                          Country <span className="text-red-500">*</span>
                        </th>
                        <th className="w-12 py-2 px-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#202024] text-slate-700 dark:text-zinc-300">
                      {countries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-6 text-center text-slate-400 dark:text-zinc-500"
                          >
                            No rows
                          </td>
                        </tr>
                      ) : (
                        countries.map((c, idx) => (
                          <tr
                            key={c.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-[#1C1C20]"
                          >
                            <td className="py-2 pl-3 pr-1 text-center">
                              <input
                                type="checkbox"
                                checked={selectedCountryIndices.includes(idx)}
                                onChange={() =>
                                  setSelectedCountryIndices((prev) =>
                                    prev.includes(idx)
                                      ? prev.filter((i) => i !== idx)
                                      : [...prev, idx]
                                  )
                                }
                                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer accent-black dark:accent-white"
                              />
                            </td>
                            <td className="py-2 px-2 text-slate-500 dark:text-zinc-400">
                              {idx + 1}
                            </td>
                            <td className="py-1 px-3">
                              <input
                                type="text"
                                required
                                placeholder="e.g. Azerbaijan, Turkey, USA..."
                                value={c.country}
                                onChange={(e) => handleCountryChange(idx, e.target.value)}
                                className="w-full bg-transparent text-slate-800 dark:text-zinc-200 text-xs py-1 px-2 border-b border-transparent focus:border-slate-400 dark:focus:border-zinc-600 outline-none transition-all"
                              />
                            </td>
                            <td className="py-1 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveCountryRow(idx)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Delete Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleAddCountryRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add row</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments Section */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Comments</h3>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center shrink-0 text-xs">
                A
              </div>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type a reply / comment"
                className="w-full bg-[#F4F5F7] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
              />
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Activity</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs font-normal transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsActivityOpen(!isActivityOpen)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {isActivityOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {isActivityOpen && (
              <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400">
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                  <span>
                    You created this · {currentShippingRule.createdOn || 'yesterday'}
                  </span>
                </div>
                <div className="relative flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[19px]" />
                  <span>
                    You last edited this · {currentShippingRule.lastEdited || 'yesterday'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <ShippingRuleDetailSidebar
          shippingRule={currentShippingRule}
          onToggleLike={() => toggleLike(currentShippingRule.id)}
        />
      </div>
    </div>
  );
};

