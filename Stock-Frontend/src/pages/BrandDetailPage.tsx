import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, Plus, Trash2, ChevronUp } from 'lucide-react';
import { useBrand } from '../context';
import type { BrandDefaultRow } from '../types';
import { BrandDetailSidebar } from '../components/brand/BrandDetailSidebar';

export const BrandDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { brands, loading, updateBrand, deleteBrand, toggleLike } = useBrand();

  const decodedId = id ? decodeURIComponent(id) : '';
  const brand = brands.find(
    (b) =>
      b.id.toLowerCase() === decodedId.toLowerCase() ||
      b.brandName.toLowerCase() === decodedId.toLowerCase()
  );

  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [defaults, setDefaults] = useState<BrandDefaultRow[]>([]);
  const [selectedDefaultRows, setSelectedDefaultRows] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (brand) {
      setBrandName(brand.brandName || '');
      setDescription(brand.description || '');
      setDefaults(brand.defaults || []);
    }
  }, [brand]);

  if (loading && !brand) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Loading Brand...
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-zinc-400 text-sm">
        Brand not found.
      </div>
    );
  }

  const handleAddDefaultRow = () => {
    const newRow: BrandDefaultRow = {
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!brandName.trim()) {
      alert('Brand Name is required');
      return;
    }
    try {
      setIsSaving(true);
      await updateBrand(brand.id, {
        brandName: brandName.trim(),
        description,
        defaults,
      });
    } catch (err) {
      console.error('Failed to update Brand', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`"${brand.brandName}" brendini silmək istədiyinizə əminsiniz?`)) {
      return;
    }
    try {
      setIsDeleting(true);
      await deleteBrand(brand.id);
      navigate('/brand');
    } catch (err) {
      console.error('Failed to delete Brand', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* 2-Column Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Column */}
        <div className="flex-1 w-full space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 shadow-xs space-y-8">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 max-w-md flex-1">
                  <label className="block text-slate-700 dark:text-zinc-300 text-xs font-normal">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-900 dark:text-white px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-xs font-medium transition-colors disabled:opacity-50 mt-6"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>

              {/* Description Input */}
              <div className="space-y-2 max-w-2xl">
                <label className="block text-slate-700 dark:text-zinc-300 text-xs font-normal">
                  Description
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-900 dark:text-white px-3 py-2.5 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none text-xs transition-all resize-y"
                />
              </div>

              <hr className="border-slate-100 dark:border-[#27272A]" />

              {/* Defaults Section */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Defaults
                </h2>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    Brand Defaults
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
                        You last edited this · <span className="text-slate-400 dark:text-zinc-400">just now</span>
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-zinc-500 ring-4 ring-white dark:ring-[#151518]" />
                      <div className="text-xs text-slate-600 dark:text-zinc-300">
                        You created this · <span className="text-slate-400 dark:text-zinc-400">12 hours ago</span>
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
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium text-xs shadow-sm transition-all disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: BrandDetailSidebar */}
        <BrandDetailSidebar
          brand={brand}
          onToggleLike={() => toggleLike(brand.id)}
        />
      </div>
    </div>
  );
};

export default BrandDetailPage;

