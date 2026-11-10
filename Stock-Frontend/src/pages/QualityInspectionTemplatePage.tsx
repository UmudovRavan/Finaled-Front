import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, ChevronDown, X, FileText, Plus } from 'lucide-react';
import { useQualityInspectionTemplate } from '../context';

export const QualityInspectionTemplatePage: React.FC = () => {
  const {
    templates,
    filteredTemplates,
    filterId,
    setFilterId,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    toggleLike,
    pageSize,
    setPageSize,
  } = useQualityInspectionTemplate();

  const [sortField, setSortField] = useState('Created On');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const allSelected =
    filteredTemplates.length > 0 && selectedIds.length === filteredTemplates.length;

  const hasFilterActive = filterId !== '';

  return (
    <div className="space-y-3 font-sans">
      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          {/* ID ≈ Search Input */}
          <div className="relative w-44">
            <input
              type="text"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              placeholder="ID ≈"
              className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-[#151518] outline-none transition-all"
            />
          </div>

          {/* Filter ✕ Button */}
          {hasFilterActive && (
            <button
              type="button"
              onClick={() => setFilterId('')}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 border border-transparent hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs transition-colors"
            >
              <span>Filter</span>
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Right side: Sort option */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#27272A] text-xs transition-colors"
          >
            <span>{sortField}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {isSortOpen && (
            <div className="absolute right-0 top-8 z-50 w-36 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-lg py-1 text-xs">
              {['Created On', 'ID', 'Quality Inspection Template Name'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setSortField(f);
                    setIsSortOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-[#151518] border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden shadow-xs">
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-[#1E1E22] flex items-center justify-center mb-3 text-slate-400 dark:text-zinc-500">
              <FileText className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-slate-600 dark:text-zinc-300 text-xs mb-3 font-normal">
              You haven't created a Quality Inspection Template yet
            </p>
            <Link
              to="/quality-inspection-template/new"
              className="px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#1E1E22] hover:bg-slate-200 dark:hover:bg-[#27272A] text-slate-800 dark:text-zinc-200 rounded-md text-xs font-normal transition-colors"
            >
              Create your first Quality Inspection Template
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#27272A] text-slate-600 dark:text-zinc-400 bg-transparent font-normal">
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                    />
                  </th>
                  <th className="py-2.5 px-3 font-normal w-1/3">ID</th>
                  <th className="py-2.5 px-3 font-normal">Quality Inspection Template Name</th>
                  <th className="py-2.5 px-4 font-normal text-right">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-end gap-1">
                      <span>{filteredTemplates.length} of {templates.length}</span>
                      <Heart className="w-3 h-3 stroke-[1.5]" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {filteredTemplates.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-[#1E1E22]/60 transition-colors group"
                    >
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(item.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 accent-black dark:accent-white"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <Link
                          to={`/quality-inspection-template/${encodeURIComponent(item.id)}`}
                          className="font-normal text-slate-900 dark:text-zinc-100 hover:underline"
                        >
                          {item.id}
                        </Link>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400 font-normal">
                        {item.templateName}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3 text-slate-400 dark:text-zinc-500">
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                            {item.createdOn || '1 d'}
                          </span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
                            <span>{item.commentsCount ?? 0}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleLike(item.id);
                            }}
                            className={`p-0.5 transition-colors ${
                              item.isLiked
                                ? 'text-rose-500 fill-rose-500'
                                : 'hover:text-rose-500'
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 stroke-[1.5] ${
                                item.isLiked ? 'fill-rose-500' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1">
        <div className="flex items-center gap-1">
          {[20, 100, 500, 2500].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setPageSize(size)}
              className={`px-2 py-0.5 rounded transition-colors ${
                pageSize === size
                  ? 'bg-slate-200 dark:bg-[#27272A] text-slate-800 dark:text-zinc-200 font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-[#1E1E22] text-slate-600 dark:text-zinc-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

