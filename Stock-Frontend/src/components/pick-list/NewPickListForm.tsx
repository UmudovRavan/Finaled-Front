import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronsUpDown,
  ChevronDown,
  ChevronRight,
  Settings,
  Edit2,
  Trash2,
} from 'lucide-react';
import { usePickList } from '../../context';
import { INITIAL_PRODUCTS, INITIAL_WAREHOUSES } from '../../api';
import type { PickListItemLocation, PickListPurpose } from '../../types';

export const NewPickListForm: React.FC = () => {
  const navigate = useNavigate();
  const { createPickList } = usePickList();

  const [activeTab, setActiveTab] = useState<'details' | 'more_info'>('details');

  // Section 1: Details top fields
  const [company, setCompany] = useState('Avalon (Demo)');
  const [series, setSeries] = useState('STO-PICK-.YYYY.-');
  const [purpose, setPurpose] = useState<PickListPurpose>(
    'Material Transfer for Manufacture'
  );
  const [customer, setCustomer] = useState('Palmer Productions Ltd.');
  const [warehouse, setWarehouse] = useState('');
  const [considerRejectedWarehouses, setConsiderRejectedWarehouses] = useState(false);

  // Section 2: Checkboxes
  const [pickManually, setPickManually] = useState(false);
  const [ignorePricingRule, setIgnorePricingRule] = useState(false);

  // Section 3: Barcode & Scan Mode
  const [scanBarcode, setScanBarcode] = useState('');
  const [scanMode, setScanMode] = useState(false);
  const [promptQty, setPromptQty] = useState(false);

  // Section 4: Item Locations (initially empty to show "No rows" as in Screenshot 2)
  const [items, setItems] = useState<PickListItemLocation[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Tab 2: More Info
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(true);
  const [groupSameItems, setGroupSameItems] = useState(false);
  const [workOrder, setWorkOrder] = useState('');

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-pl-${Date.now()}`,
        item: '',
        itemName: '',
        warehouse: warehouse || '',
        qty: 1,
        stockQty: 1,
        pickedQty: 0,
        uom: 'Nos',
      },
    ]);
  };

  const handleGetItemLocations = () => {
    if (items.length === 0) {
      setItems([
        {
          id: `it-pl-${Date.now()}`,
          item: 'SKU002: Laptop',
          itemName: 'SKU002: Laptop',
          warehouse: warehouse || 'Bitmiş Ürünler - AD',
          qty: 1,
          stockQty: 1,
          pickedQty: 1,
          uom: 'Nos',
        },
      ]);
    } else {
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          warehouse: it.warehouse || warehouse || 'Bitmiş Ürünler - AD',
          pickedQty: it.qty,
        }))
      );
    }
  };

  const handleItemChange = (
    rowId: string,
    field: keyof PickListItemLocation,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== rowId) return it;
        const updated = { ...it, [field]: value };
        if (field === 'qty' && typeof value === 'number') {
          updated.stockQty = value;
        }
        return updated;
      })
    );
  };

  const toggleSelectRow = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllRows = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((it) => it.id));
    }
  };

  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((it) => !selectedItemIds.includes(it.id)));
    setSelectedItemIds([]);
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanBarcode.trim()) {
      e.preventDefault();
      const q = scanBarcode.trim().toLowerCase();
      const matched = INITIAL_PRODUCTS.find(
        (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      );
      const code = matched ? `${matched.sku}: ${matched.name}` : scanBarcode.trim();
      setItems((prev) => [
        ...prev,
        {
          id: `it-pl-${Date.now()}`,
          item: code,
          itemName: matched ? matched.name : code,
          warehouse: warehouse || 'Bitmiş Ürünler - AD',
          qty: 1,
          stockQty: 1,
          pickedQty: scanMode ? 0 : 1,
          uom: 'Nos',
        },
      ]);
      setScanBarcode('');
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const created = await createPickList({
      company: company || 'Avalon (Demo)',
      customer: customer || 'Palmer Productions Ltd.',
      series,
      purpose,
      warehouse,
      considerRejectedWarehouses,
      pickManually,
      ignorePricingRule,
      scanMode,
      promptQty,
      groupSameItems,
      workOrder,
      status: 'Draft',
      deliveryStatus: 'Not Delivered',
      items,
    });
    navigate(`/pick-list/${created.id}`);
  };

  return (
    <form
      id="new-pick-list-form"
      onSubmit={handleSave}
      className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200 dark:border-[#27272A] shadow-xs overflow-hidden text-xs font-sans"
    >
      {/* 2 Tabs Header: Details | More Info */}
      <div className="flex items-center gap-6 px-6 border-b border-slate-100 dark:border-[#27272A] select-none">
        {[
          { id: 'details', label: 'Details' },
          { id: 'more_info', label: 'More Info' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 font-medium border-b-2 transition-all ${
                isActive
                  ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                  : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-6">
        {/* ==================== TAB 1: DETAILS (Screenshot 2) ==================== */}
        {activeTab === 'details' && (
          <>
            {/* Section 1: Top 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              {/* Left Column: Company *, Series *, Purpose */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Company <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Series <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={series}
                      onChange={(e) => setSeries(e.target.value)}
                      className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-slate-400"
                    >
                      <option value="STO-PICK-.YYYY.-">STO-PICK-.YYYY.-</option>
                      <option value="PICK-.YYYY.-">PICK-.YYYY.-</option>
                    </select>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Purpose
                  </label>
                  <div className="relative">
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value as PickListPurpose)}
                      className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                    >
                      <option value="Material Transfer for Manufacture">
                        Material Transfer for Manufacture
                      </option>
                      <option value="Material Transfer">Material Transfer</option>
                      <option value="Delivery">Delivery</option>
                    </select>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {purpose === 'Delivery' && (
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Customer
                    </label>
                    <input
                      type="text"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Warehouse, Consider Rejected Warehouses, Get Item Locations */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Warehouse
                  </label>
                  <input
                    type="text"
                    list="pick-list-warehouses"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Items under this warehouse will be suggested
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={considerRejectedWarehouses}
                      onChange={(e) => setConsiderRejectedWarehouses(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-black focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Consider Rejected Warehouses</span>
                  </label>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 pl-5">
                    Enable it if users want to consider rejected materials to dispatch.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleGetItemLocations}
                    className="px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-slate-200/80 dark:bg-[#27272A] dark:hover:bg-[#323236] text-slate-800 dark:text-zinc-200 font-medium transition-colors"
                  >
                    Get Item Locations
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#27272A]" />

            {/* Section 2: Pick Manually | Ignore Pricing Rule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <div className="space-y-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={pickManually}
                    onChange={(e) => setPickManually(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-black focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Pick Manually</span>
                </label>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 pl-5 leading-relaxed">
                  If enabled then system won't override the picked qty / batches /
                  serial numbers / warehouse.
                </p>
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 dark:text-zinc-200">
                  <input
                    type="checkbox"
                    checked={ignorePricingRule}
                    onChange={(e) => setIgnorePricingRule(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-black focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Ignore Pricing Rule</span>
                </label>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 pl-5 leading-relaxed">
                  If enabled then system won't apply the pricing rule on the delivery
                  note which will be create from the pick list
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#27272A]" />

            {/* Section 3: Scan Barcode | Scan Mode & Prompt Qty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Scan Barcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={scanBarcode}
                    onChange={(e) => setScanBarcode(e.target.value)}
                    onKeyDown={handleBarcodeKeyDown}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] pl-3 pr-8 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <span
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-mono select-none"
                    title="Scan Barcode"
                  >
                    [||]
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={scanMode}
                      onChange={(e) => setScanMode(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-black focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Scan Mode</span>
                  </label>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 pl-5 leading-relaxed">
                    If checked, picked qty won't automatically be fulfilled on submit of
                    pick list.
                  </p>
                </div>

                <div>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={promptQty}
                      onChange={(e) => setPromptQty(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-black focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Prompt Qty</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 4: Item Locations Table */}
            <div className="space-y-2 pt-2">
              <label className="block text-slate-600 dark:text-zinc-400">
                Item Locations
              </label>

              <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-[#1E1E22] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-400">
                      <th className="w-9 py-2 px-3 border-r border-slate-200/70 dark:border-[#27272A] text-center">
                        <input
                          type="checkbox"
                          checked={
                            items.length > 0 && selectedItemIds.length === items.length
                          }
                          onChange={toggleSelectAllRows}
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="w-12 py-2 px-2.5 border-r border-slate-200/70 dark:border-[#27272A] font-normal">
                        No.
                      </th>
                      <th className="py-2 px-3 border-r border-slate-200/70 dark:border-[#27272A] font-normal min-w-[160px]">
                        Item <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2 px-3 border-r border-slate-200/70 dark:border-[#27272A] font-normal min-w-[150px]">
                        Warehouse
                      </th>
                      <th className="w-28 py-2 px-3 border-r border-slate-200/70 dark:border-[#27272A] font-normal text-right">
                        Qty <span className="text-rose-500">*</span>
                      </th>
                      <th className="w-36 py-2 px-3 border-r border-slate-200/70 dark:border-[#27272A] font-normal text-right">
                        Qty (in Stock UOM)
                      </th>
                      <th className="w-40 py-2 px-3 border-r border-slate-200/70 dark:border-[#27272A] font-normal text-right">
                        Picked Qty (in Stoc...
                      </th>
                      <th className="w-10 py-2 px-2 text-center">
                        <Settings className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-[#27272A]">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="py-6 text-center text-slate-400 dark:text-zinc-500 bg-[#F8FAFC]/50 dark:bg-[#141417]/50"
                        >
                          No rows
                        </td>
                      </tr>
                    ) : (
                      items.map((it, idx) => (
                        <React.Fragment key={it.id}>
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="py-2 px-3 border-r border-slate-200/70 dark:border-[#27272A] text-center">
                              <input
                                type="checkbox"
                                checked={selectedItemIds.includes(it.id)}
                                onChange={() => toggleSelectRow(it.id)}
                                className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-2 px-2.5 border-r border-slate-200/70 dark:border-[#27272A] text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-3 border-r border-slate-200/70 dark:border-[#27272A]">
                              <input
                                type="text"
                                list="pick-list-products"
                                placeholder="Item Code"
                                value={it.item}
                                onChange={(e) =>
                                  handleItemChange(it.id, 'item', e.target.value)
                                }
                                className="w-full bg-transparent text-slate-900 dark:text-white font-medium outline-none"
                              />
                            </td>
                            <td className="py-1.5 px-3 border-r border-slate-200/70 dark:border-[#27272A]">
                              <input
                                type="text"
                                list="pick-list-warehouses"
                                value={it.warehouse}
                                onChange={(e) =>
                                  handleItemChange(it.id, 'warehouse', e.target.value)
                                }
                                className="w-full bg-transparent text-slate-700 dark:text-zinc-300 outline-none"
                              />
                            </td>
                            <td className="py-1.5 px-3 border-r border-slate-200/70 dark:border-[#27272A]">
                              <input
                                type="number"
                                step="any"
                                value={it.qty}
                                onChange={(e) =>
                                  handleItemChange(
                                    it.id,
                                    'qty',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full bg-transparent text-right text-slate-900 dark:text-white font-semibold outline-none"
                              />
                            </td>
                            <td className="py-1.5 px-3 border-r border-slate-200/70 dark:border-[#27272A]">
                              <input
                                type="number"
                                step="any"
                                value={it.stockQty}
                                onChange={(e) =>
                                  handleItemChange(
                                    it.id,
                                    'stockQty',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full bg-transparent text-right text-slate-700 dark:text-zinc-300 outline-none"
                              />
                            </td>
                            <td className="py-1.5 px-3 border-r border-slate-200/70 dark:border-[#27272A]">
                              <input
                                type="number"
                                step="any"
                                value={it.pickedQty}
                                onChange={(e) =>
                                  handleItemChange(
                                    it.id,
                                    'pickedQty',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full bg-transparent text-right text-slate-900 dark:text-white font-semibold outline-none"
                              />
                            </td>
                            <td className="py-1.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingRowId(editingRowId === it.id ? null : it.id)
                                }
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Edit Row"
                              >
                                <Edit2 className="w-3.5 h-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>

                <datalist id="pick-list-products">
                  <option value="SKU002: Laptop" />
                  {INITIAL_PRODUCTS.map((p) => (
                    <option key={p.id} value={`${p.sku}: ${p.name}`} />
                  ))}
                </datalist>
                <datalist id="pick-list-warehouses">
                  <option value="Bitmiş Ürünler - AD" />
                  <option value="Devam Eden İşler - AD" />
                  {INITIAL_WAREHOUSES.map((w) => (
                    <option key={w.id} value={w.name} />
                  ))}
                </datalist>
              </div>

              {/* Below Table Button: Add row */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3 py-1 rounded-lg bg-[#F3F4F6] hover:bg-slate-200/70 dark:bg-[#27272A] dark:hover:bg-[#323236] text-slate-700 dark:text-zinc-200 font-medium transition-colors"
                >
                  Add row
                </button>
                {selectedItemIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedItemIds.length})</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 2: MORE INFO (Screenshot 3) ==================== */}
        {activeTab === 'more_info' && (
          <div className="space-y-6">
            {/* 1. Collapsible Print Settings v */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setIsPrintSettingsOpen(!isPrintSettingsOpen)}
                className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white text-xs"
              >
                <span>Print Settings</span>
                {isPrintSettingsOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>

              {isPrintSettingsOpen && (
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={groupSameItems}
                      onChange={(e) => setGroupSameItems(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-black focus:ring-0 w-3.5 h-3.5"
                    />
                    <span>Group Same Items</span>
                  </label>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100 dark:border-[#27272A]" />

            {/* 2. Reference Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                Reference
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Work Order
                  </label>
                  <input
                    type="text"
                    value={workOrder}
                    onChange={(e) => setWorkOrder(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden submit button triggered by Top Header Save button */}
        <button type="submit" className="hidden">
          Save
        </button>
      </div>
    </form>
  );
};

export default NewPickListForm;

