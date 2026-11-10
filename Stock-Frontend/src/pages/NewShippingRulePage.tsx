import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useShippingRule } from '../context';
import type { ShippingRuleType, ShippingCalculateBasedOn, ShippingRuleCountry } from '../types';

export const NewShippingRulePage: React.FC = () => {
  const navigate = useNavigate();
  const { addShippingRule } = useShippingRule();

  // Form states
  const [shippingRuleLabel, setShippingRuleLabel] = useState('');
  const [shippingRuleType, setShippingRuleType] = useState<ShippingRuleType>('Selling');
  const [disabled, setDisabled] = useState(false);
  const [company, setCompany] = useState('Avalon (Demo)');
  const [shippingAccount, setShippingAccount] = useState('');
  const [calculateBasedOn, setCalculateBasedOn] = useState<ShippingCalculateBasedOn>('Fixed');
  const [shippingAmount, setShippingAmount] = useState<string>('');
  const [countries, setCountries] = useState<ShippingRuleCountry[]>([]);
  const [selectedCountryIndices, setSelectedCountryIndices] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCountryRow = () => {
    setCountries((prev) => [
      ...prev,
      { id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, country: '' },
    ]);
  };

  const handleRemoveCountryRow = (index: number) => {
    setCountries((prev) => prev.filter((_, i) => i !== index));
    setSelectedCountryIndices((prev) => prev.filter((i) => i !== index));
  };

  const handleCountryChange = (index: number, val: string) => {
    setCountries((prev) =>
      prev.map((item, i) => (i === index ? { ...item, country: val } : item))
    );
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!shippingRuleLabel.trim()) {
      alert('Please enter a Shipping Rule Label');
      return;
    }
    if (!shippingAccount.trim()) {
      alert('Please enter a Shipping Account');
      return;
    }

    try {
      setIsSaving(true);
      const created = await addShippingRule({
        shippingRuleLabel: shippingRuleLabel.trim(),
        shippingRuleType,
        disabled,
        company: company.trim() || 'Avalon (Demo)',
        shippingAccount: shippingAccount.trim(),
        calculateBasedOn,
        shippingAmount: parseFloat(shippingAmount) || 0,
        countries: countries.filter((c) => c.country.trim() !== ''),
      });
      navigate(`/shipping-rule/${encodeURIComponent(created.id)}`);
    } catch (err) {
      console.error('Failed to create Shipping Rule', err);
      alert('Failed to create Shipping Rule');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-sans text-xs pb-16">
      {/* Hidden button for Header Save click delegation */}
      <button
        type="button"
        id="save-shipping-rule-btn"
        className="hidden"
        onClick={() => handleSave()}
      >
        Save
      </button>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-6">
          {/* Row 1: Shipping Rule Label * and Shipping Rule Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                Shipping Rule Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shippingRuleLabel}
                onChange={(e) => setShippingRuleLabel(e.target.value)}
                placeholder=""
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                Shipping Rule Type
              </label>
              <select
                value={shippingRuleType}
                onChange={(e) => setShippingRuleType(e.target.value as ShippingRuleType)}
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all cursor-pointer"
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
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
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
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-300 mb-1.5 font-normal text-xs">
                  Shipping Account <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingAccount}
                  onChange={(e) => setShippingAccount(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
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
                  value={calculateBasedOn}
                  onChange={(e) =>
                    setCalculateBasedOn(e.target.value as ShippingCalculateBasedOn)
                  }
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all cursor-pointer"
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
                  value={shippingAmount}
                  onChange={(e) => setShippingAmount(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
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
                      <td colSpan={4} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                        No rows
                      </td>
                    </tr>
                  ) : (
                    countries.map((c, idx) => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C1C20]">
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
    </div>
  );
};

