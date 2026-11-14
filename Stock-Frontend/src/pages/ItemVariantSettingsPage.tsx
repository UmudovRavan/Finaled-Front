import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Users,
  Paperclip,
  Share2,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Settings,
  Check,
  X,
  Trash2,
} from 'lucide-react';

interface FieldRow {
  id: string;
  fieldName: string;
}

interface CommentItem {
  id: string;
  author: string;
  text: string;
  time: string;
}

const INITIAL_FIELD_NAMES: string[] = [
  'details',
  'item_group',
  'stock_uom',
  'disabled',
  'is_stock_item',
  'is_fixed_asset',
  'auto_create_assets',
  'is_grouped_asset',
  'asset_category',
  'asset_naming_series',
  'is_sales_item',
  'allow_alternative_item',
  'is_purchase_item',
  'is_customer_provided_item',
  'over_delivery_receipt_allowance',
  'over_billing_allowance',
  'brand',
  'accounting',
  'item_defaults',
  'enable_deferred_expense',
  'no_of_months_exp',
  'enable_deferred_revenue',
  'no_of_months',
  'uom_tab',
  'uoms',
  'item_tax_section_break',
  'taxes',
  'purchase_tax_withholding_category',
  'sales_tax_withholding_category',
  'inventory_section',
  'valuation_method',
  'end_of_life',
  'default_material_request_type',
  'warranty_period',
  'weight_per_unit',
  'weight_uom',
  'allow_negative_stock',
  'reorder_levels',
  'has_batch_no',
  'create_new_batch',
  'batch_number_series',
  'has_expiry_date',
  'shelf_life_in_days',
  'retain_sample',
  'sample_quantity',
  'has_serial_no',
  'serial_no_series',
  'variants_section',
  'variant_based_on',
  'purchasing_tab',
  'is_sub_contracted_item',
  'customer_items',
  'supplier_items',
  'country_of_origin',
  'customs_tariff_number',
  'sales_details',
  'grant_commission',
  'max_discount',
  'deferred_revenue_account',
  'deferred_expense_account',
  'inspection_required_before_purchase',
  'quality_inspection_template',
  'inspection_required_before_delivery',
  'include_item_in_manufacturing',
  'is_stock_item_manufacturing',
  'default_bom',
  'item_attributes',
  'website_section',
  'show_in_website',
  'route',
  'weightage',
  'slideshow',
  'website_image',
  'thumbnail',
  'website_warehouse',
  'description',
];

const INITIAL_ROWS: FieldRow[] = INITIAL_FIELD_NAMES.map((name, idx) => ({
  id: `field-${idx + 1}`,
  fieldName: name,
}));

const PAGE_SIZE = 50;

const CheckboxField: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  helperText?: string;
}> = ({ checked, onChange, label, helperText }) => (
  <div className="space-y-1">
    <label className="inline-flex items-start gap-2 cursor-pointer select-none group">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-3.5 h-3.5 rounded-[3px] flex items-center justify-center transition-colors shrink-0 border ${
          checked
            ? 'bg-[#171717] dark:bg-white border-[#171717] dark:border-white text-white dark:text-[#171717]'
            : 'bg-white dark:bg-[#18181B] border-slate-300 dark:border-[#3F3F46] group-hover:border-slate-400 dark:group-hover:border-[#52525B]'
        }`}
      >
        {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
      </button>
      <span className="text-[13px] font-medium text-[#1F272E] dark:text-[#E4E4E7] leading-[1.35]">
        {label}
      </span>
    </label>
    {helperText && (
      <p className="pl-[22px] text-[12px] text-[#687178] dark:text-[#A1A1AA] leading-[1.45]">
        {helperText}
      </p>
    )}
  </div>
);

export const ItemVariantSettingsPage: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Top Checkboxes
  const [doNotUpdateVariantsOnSave, setDoNotUpdateVariantsOnSave] = useState(false);
  const [allowRenameAttributeValue, setAllowRenameAttributeValue] = useState(false);
  const [allowVariantUomDifferent, setAllowVariantUomDifferent] = useState(false);

  // Copy Fields to Variant Table
  const [rows, setRows] = useState<FieldRow[]>(INITIAL_ROWS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Comments & Activity
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activityExpanded, setActivityExpanded] = useState(false);

  useEffect(() => {
    const handleSave = () => {
      setSaveToast('Saved');
      setTimeout(() => setSaveToast(null), 2500);
    };
    window.addEventListener('item-variant-settings-save', handleSave);
    return () => window.removeEventListener('item-variant-settings-save', handleSave);
  }, []);

  const filteredRows = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.fieldName.toLowerCase().includes(q));
  }, [rows, searchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedRows = filteredRows.slice(pageStartIndex, pageStartIndex + PAGE_SIZE);

  const allOnPageSelected =
    paginatedRows.length > 0 && paginatedRows.every((r) => selectedIds.has(r.id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paginatedRows.forEach((r) => next.delete(r.id));
      } else {
        paginatedRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const toggleRowSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddRow = () => {
    const newId = `field-${Date.now()}`;
    const newRow: FieldRow = { id: newId, fieldName: '' };
    setRows((prev) => [...prev, newRow]);
    const newTotalPages = Math.max(1, Math.ceil((rows.length + 1) / PAGE_SIZE));
    setCurrentPage(newTotalPages);
    setEditingRowId(newId);
    setEditingValue('');
  };

  const handleDeleteSelected = () => {
    setRows((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  const startEditRow = (row: FieldRow) => {
    setEditingRowId(row.id);
    setEditingValue(row.fieldName);
  };

  const saveEditRow = (id: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, fieldName: editingValue.trim() || r.fieldName } : r))
    );
    setEditingRowId(null);
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentInput.trim()) {
      e.preventDefault();
      setComments((prev) => [
        {
          id: String(Date.now()),
          author: 'You',
          text: commentInput.trim(),
          time: 'Just now',
        },
        ...prev,
      ]);
      setCommentInput('');
    }
  };

  return (
    <div className="min-h-full bg-white dark:bg-[#111113] text-[#1F272E] dark:text-[#F4F4F5]">
      {saveToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-[#171717] dark:bg-white text-white dark:text-[#171717] px-3.5 py-2 text-[13px] font-medium shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Item Variant Settings {saveToast}</span>
        </div>
      )}

      {/* Main 2-column Frappe Desk Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-52px)]">
        {/* Left Main Content Area */}
        <div className="flex-1 min-w-0 border-r border-slate-200 dark:border-[#27272A]">
          <div className="divide-y divide-slate-200/80 dark:divide-[#27272A]">
            {/* Top Checkboxes Section */}
            <section className="px-6 py-5 space-y-4">
              <CheckboxField
                checked={doNotUpdateVariantsOnSave}
                onChange={setDoNotUpdateVariantsOnSave}
                label="Do not update variants on save"
                helperText="Fields will be copied over only at time of creation."
              />
              <CheckboxField
                checked={allowRenameAttributeValue}
                onChange={setAllowRenameAttributeValue}
                label="Allow Rename Attribute Value"
                helperText="Rename Attribute Value in Item Attribute."
              />
              <CheckboxField
                checked={allowVariantUomDifferent}
                onChange={setAllowVariantUomDifferent}
                label="Allow Variant UOM to be different from Template UOM"
              />
            </section>

            {/* Copy Fields to Variant Section */}
            <section className="px-6 py-5">
              <h2 className="text-[14px] font-semibold text-[#1F272E] dark:text-white mb-4">
                Copy Fields to Variant
              </h2>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#525A61] dark:text-[#A1A1AA]">
                  Fields
                </span>
                {selectedIds.size > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="inline-flex items-center gap-1 rounded bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-2 py-0.5 text-[12px] font-medium hover:bg-red-100 dark:hover:bg-red-950 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete ({selectedIds.size})</span>
                  </button>
                )}
              </div>

              {/* Frappe Child Table */}
              <div className="rounded-lg border border-slate-200 dark:border-[#27272A] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A] text-[12px] font-medium text-[#687178] dark:text-[#A1A1AA]">
                      <th className="py-2.5 px-3 w-9 text-center">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={allOnPageSelected}
                          onClick={toggleSelectAllOnPage}
                          className={`w-3.5 h-3.5 rounded-[3px] inline-flex items-center justify-center border transition-colors ${
                            allOnPageSelected
                              ? 'bg-[#171717] dark:bg-white border-[#171717] dark:border-white text-white dark:text-[#171717]'
                              : 'bg-white dark:bg-[#18181B] border-slate-300 dark:border-[#3F3F46]'
                          }`}
                        >
                          {allOnPageSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </button>
                      </th>
                      <th className="py-2.5 px-2 w-12 text-center">No.</th>
                      <th className="py-2.5 px-3">
                        Field Name <span className="text-red-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 w-12 text-center">
                        <Settings className="w-3.5 h-3.5 mx-auto text-slate-400 dark:text-[#71717A]" />
                      </th>
                    </tr>
                    {/* Filter Row */}
                    <tr className="bg-white dark:bg-[#111113] border-b border-slate-200 dark:border-[#27272A]">
                      <td className="py-2 px-3" />
                      <td className="py-2 px-2">
                        <div className="h-6 rounded bg-[#F3F3F3] dark:bg-[#1F1F23]" />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={searchFilter}
                          onChange={(e) => {
                            setSearchFilter(e.target.value);
                            setCurrentPage(1);
                          }}
                          aria-label="Filter Field Name"
                          className="w-full h-6 rounded bg-[#F3F3F3] dark:bg-[#1F1F23] px-2.5 text-[12px] text-[#1F272E] dark:text-[#F4F4F5] outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-[#3F3F46]"
                        />
                      </td>
                      <td className="py-2 px-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-[#27272A] text-[13px]">
                    {paginatedRows.map((row, idx) => {
                      const rowNumber = pageStartIndex + idx + 1;
                      const isSelected = selectedIds.has(row.id);
                      const isEditing = editingRowId === row.id;

                      return (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-[#18181B]/60 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isSelected}
                              onClick={() => toggleRowSelect(row.id)}
                              className={`w-3.5 h-3.5 rounded-[3px] inline-flex items-center justify-center border transition-colors ${
                                isSelected
                                  ? 'bg-[#171717] dark:bg-white border-[#171717] dark:border-white text-white dark:text-[#171717]'
                                  : 'bg-white dark:bg-[#18181B] border-slate-300 dark:border-[#3F3F46]'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>
                          </td>
                          <td className="py-2.5 px-2 text-center text-[12px] text-[#687178] dark:text-[#A1A1AA]">
                            {rowNumber}
                          </td>
                          <td className="py-2.5 px-3 text-[#1F272E] dark:text-[#E4E4E7]">
                            {isEditing ? (
                              <div className="flex items-center gap-2 max-w-sm">
                                <input
                                  type="text"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditRow(row.id);
                                    if (e.key === 'Escape') setEditingRowId(null);
                                  }}
                                  placeholder="Enter field_name"
                                  autoFocus
                                  className="w-full rounded bg-white dark:bg-[#18181B] border border-slate-300 dark:border-[#3F3F46] px-2.5 py-1 text-[12.5px] text-[#1F272E] dark:text-white outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => saveEditRow(row.id)}
                                  className="p-1 rounded bg-[#171717] dark:bg-white text-white dark:text-[#171717]"
                                  title="Save"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingRowId(null)}
                                  className="p-1 rounded border border-slate-200 dark:border-[#3F3F46] text-slate-500"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span>{row.fieldName}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {!isEditing && (
                              <button
                                type="button"
                                onClick={() => startEditRow(row)}
                                className="inline-flex items-center justify-center p-1 rounded text-slate-400 hover:text-[#1F272E] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
                                title="Edit row"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedRows.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-[13px] text-[#687178] dark:text-[#A1A1AA]"
                        >
                          No matching fields
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer: Add row + Pagination */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-[#E8E8E8] dark:hover:bg-[#27272A] px-3 py-1.5 text-[12px] font-medium text-[#1F272E] dark:text-[#E4E4E7] transition-colors"
                >
                  Add row
                </button>

                <div className="flex items-center gap-1.5 text-[12px]">
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage(1)}
                    className="rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-[#E8E8E8] dark:hover:bg-[#27272A] disabled:opacity-50 px-2.5 py-1 text-[#1F272E] dark:text-[#E4E4E7] transition-colors"
                  >
                    First
                  </button>
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-[#E8E8E8] dark:hover:bg-[#27272A] disabled:opacity-50 p-1 text-[#1F272E] dark:text-[#E4E4E7] transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[#525A61] dark:text-[#A1A1AA]">
                    <strong className="font-semibold text-[#1F272E] dark:text-white">
                      {safePage}
                    </strong>{' '}
                    of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-[#E8E8E8] dark:hover:bg-[#27272A] disabled:opacity-50 p-1 text-[#1F272E] dark:text-[#E4E4E7] transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-[#E8E8E8] dark:hover:bg-[#27272A] disabled:opacity-50 px-2.5 py-1 text-[#1F272E] dark:text-[#E4E4E7] transition-colors"
                  >
                    Last
                  </button>
                </div>
              </div>
            </section>

            {/* Comments Section */}
            <section className="px-6 py-5">
              <h2 className="text-[15px] font-semibold text-[#1F272E] dark:text-white mb-4">
                Comments
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E6F4EA] dark:bg-emerald-950/60 text-[#1E7E34] dark:text-emerald-400 flex items-center justify-center text-[12px] font-semibold shrink-0">
                  A
                </div>
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={handleCommentKeyDown}
                  placeholder="Type a reply / comment"
                  className="flex-1 rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] focus:bg-white dark:focus:bg-[#18181B] px-3 py-2 text-[13px] text-[#1F272E] dark:text-[#F4F4F5] placeholder:text-[#7C858E] dark:placeholder:text-[#71717A] outline-none transition-colors"
                />
              </div>

              {comments.length > 0 && (
                <div className="mt-4 space-y-3 pl-10">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-md border border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] px-3.5 py-2.5"
                    >
                      <div className="flex items-center justify-between text-[12px] text-[#687178] dark:text-[#A1A1AA] mb-1">
                        <span className="font-semibold text-[#1F272E] dark:text-white">
                          {c.author}
                        </span>
                        <span>{c.time}</span>
                      </div>
                      <p className="text-[13px] text-[#1F272E] dark:text-[#E4E4E7]">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Activity Section */}
            <section className="px-6 py-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-semibold text-[#1F272E] dark:text-white">
                  Activity
                </h2>
                <button
                  type="button"
                  onClick={() => setSaveToast('Email composer opened')}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-[#E9E9E9] dark:hover:bg-[#27272A] px-2.5 py-1 text-[12px] font-medium text-[#1F272E] dark:text-[#E4E4E7] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Email</span>
                </button>
              </div>

              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-[#27272A]">
                <div className="relative text-[12.5px] text-[#525A61] dark:text-[#A1A1AA]">
                  <span className="absolute -left-[22px] top-[6px] w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-white" />
                  <span>
                    <strong className="font-semibold text-[#1F272E] dark:text-white">You</strong>{' '}
                    created this ·
                  </span>
                </div>

                <div className="relative text-[12.5px] text-[#525A61] dark:text-[#A1A1AA]">
                  <span className="absolute -left-[22px] top-[6px] w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-white" />
                  <span>
                    <strong className="font-semibold text-[#1F272E] dark:text-white">You</strong>{' '}
                    added {rows.length} rows to Fields · 4 months ago
                  </span>
                </div>

                <div className="relative flex items-center justify-between gap-4 text-[12.5px] text-[#525A61] dark:text-[#A1A1AA]">
                  <span className="absolute -left-[22px] top-[6px] w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-white" />
                  <span>
                    <strong className="font-semibold text-[#1F272E] dark:text-white">You</strong>{' '}
                    last edited this · 4 months ago
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivityExpanded(!activityExpanded)}
                    className="shrink-0 w-6 h-6 rounded bg-[#F3F3F3] dark:bg-[#1F1F23] hover:bg-slate-200 dark:hover:bg-[#27272A] flex items-center justify-center text-[#525A61] dark:text-[#A1A1AA]"
                    aria-label="Toggle activity details"
                  >
                    {activityExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-[260px] shrink-0 bg-white dark:bg-[#111113]">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#27272A]">
            <span className="text-[13px] font-semibold text-[#1F272E] dark:text-white">
              Item Variant Settings
            </span>
            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className={`p-1 rounded transition-colors ${
                liked
                  ? 'text-rose-500'
                  : 'text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-white'
              }`}
              aria-label="Like Item Variant Settings"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Assign / Attachments / Share */}
          <div className="px-4 py-3 space-y-3.5 border-b border-slate-200 dark:border-[#27272A]">
            <button
              type="button"
              className="w-full flex items-center justify-between text-[13px] text-[#525A61] dark:text-[#A1A1AA] hover:text-[#1F272E] dark:hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                <span>Assign</span>
              </span>
              <Plus className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between text-[13px] text-[#525A61] dark:text-[#A1A1AA] hover:text-[#1F272E] dark:hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <Paperclip className="w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                <span>Attachments</span>
              </span>
              <Plus className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between text-[13px] text-[#525A61] dark:text-[#A1A1AA] hover:text-[#1F272E] dark:hover:text-white transition-colors"
            >
              <span className="inline-flex items-center gap-2.5">
                <Share2 className="w-4 h-4 text-slate-400 dark:text-[#71717A]" />
                <span>Share</span>
              </span>
              <Plus className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
            </button>
          </div>

          {/* Metadata Footer */}
          <div className="px-4 py-4 space-y-3 text-[12px] text-[#687178] dark:text-[#A1A1AA]">
            <div className="space-y-0.5">
              <div className="text-[#525A61] dark:text-[#D4D4D8] font-medium">
                Last Edited By You
              </div>
              <div>4 months ago</div>
            </div>
            <div className="text-[#525A61] dark:text-[#D4D4D8] font-medium">
              Created By You
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

