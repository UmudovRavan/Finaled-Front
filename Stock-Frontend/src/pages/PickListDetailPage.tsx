import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Plus,
  Settings,
  Edit2,
  Trash2,
} from 'lucide-react';
import { usePickList } from '../context';
import { INITIAL_PRODUCTS, INITIAL_WAREHOUSES } from '../api';
import type { PickListItemLocation, PickListPurpose } from '../types';
import { PickListDetailSidebar } from '../components/pick-list/PickListDetailSidebar';

export const PickListDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pickLists, toggleLike } = usePickList();

  const entry = pickLists.find((p) => p.id === id);

  const [activeTab, setActiveTab] = useState<'Details' | 'More Info' | 'Connections'>(
    'Details'
  );

  // Details Tab States
  const [company, setCompany] = useState(entry?.company || 'Avalon (Demo)');
  const [purpose, setPurpose] = useState<PickListPurpose>(
    entry?.purpose || 'Delivery'
  );
  const [customer, setCustomer] = useState(
    entry?.customer || 'Palmer Productions Ltd.'
  );
  const [warehouse, setWarehouse] = useState(
    entry?.warehouse || 'Bitmiş Ürünler - AD'
  );
  const [considerRejectedWarehouses, setConsiderRejectedWarehouses] = useState(
    entry?.considerRejectedWarehouses ?? true
  );
  const [pickManually, setPickManually] = useState(entry?.pickManually ?? true);
  const [ignorePricingRule, setIgnorePricingRule] = useState(
    entry?.ignorePricingRule ?? true
  );
  const [scanBarcode, setScanBarcode] = useState('');
  const [scanMode, setScanMode] = useState(entry?.scanMode ?? false);
  const [promptQty, setPromptQty] = useState(entry?.promptQty ?? true);

  // Items State (No rows by default as shown in Screenshot 1 & 2)
  const [items, setItems] = useState<PickListItemLocation[]>(
    entry?.items && entry.items.length > 0 ? entry.items : []
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // More Info Tab States (Screenshot 3)
  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(true);
  const [groupSameItems, setGroupSameItems] = useState(
    entry?.groupSameItems ?? true
  );

  // Comments State
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<
    { id: string; author: string; text: string; time: string }[]
  >([]);

  useEffect(() => {
    if (entry) {
      setCompany(entry.company || 'Avalon (Demo)');
      setPurpose(entry.purpose || 'Delivery');
      setCustomer(entry.customer || 'Palmer Productions Ltd.');
      setWarehouse(entry.warehouse || 'Bitmiş Ürünler - AD');
      setConsiderRejectedWarehouses(entry.considerRejectedWarehouses ?? true);
      setPickManually(entry.pickManually ?? true);
      setIgnorePricingRule(entry.ignorePricingRule ?? true);
      setScanMode(entry.scanMode ?? false);
      setPromptQty(entry.promptQty ?? true);
      setGroupSameItems(entry.groupSameItems ?? true);
      if (entry.items) {
        setItems(entry.items);
      }
    }
  }, [entry]);

  if (!entry) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Pick List tapılmadı: {id}</p>
        <button
          onClick={() => navigate('/pick-list')}
          className="mt-3 px-4 py-1.5 rounded-lg bg-black text-white text-xs"
        >
          Siyahıya qayıt
        </button>
      </div>
    );
  }

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-pl-${Date.now()}`,
        item: '',
        itemName: '',
        warehouse: warehouse || 'Bitmiş Ürünler - AD',
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

  const handleAddComment = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentText.trim()) {
      setComments((prev) => [
        ...prev,
        {
          id: `cm-${Date.now()}`,
          author: 'You',
          text: commentText.trim(),
          time: 'Just now',
        },
      ]);
      setCommentText('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white dark:bg-[#09090B] font-sans text-xs text-slate-800 dark:text-zinc-200">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT MAIN CONTENT AREA */}
          <div className="flex-1 min-w-0 w-full">
            {/* Top Blue Info Banner when Draft (Screenshot 1: "Submit this document to confirm") */}
            {entry.status === 'Draft' && (
              <div className="mb-3 px-4 py-2.5 rounded-lg bg-[#EBF5FF] dark:bg-sky-950/40 text-[#1E6091] dark:text-sky-300 text-xs font-normal">
                Submit this document to confirm
              </div>
            )}

            {/* Tabs Navigation (Details | More Info | Connections) */}
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-[#27272A]">
              {(['Details', 'More Info', 'Connections'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`py-2.5 text-xs font-medium transition-colors relative ${
                      isActive
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 dark:bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ==================== TAB 1: DETAILS (Screenshots 1 & 2) ==================== */}
            {activeTab === 'Details' && (
              <div className="py-5 space-y-6">
                {/* Top 2-Column Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                  {/* Left Column: Company *, Purpose, Customer */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Company <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Purpose
                      </label>
                      <div className="relative">
                        <select
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value as PickListPurpose)}
                          className="w-full appearance-none px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-900 dark:text-white text-xs font-medium focus:outline-none pr-8 cursor-pointer"
                        >
                          <option value="Delivery">Delivery</option>
                          <option value="Material Transfer for Manufacture">
                            Material Transfer for Manufacture
                          </option>
                          <option value="Material Transfer">Material Transfer</option>
                        </select>
                        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Customer
                      </label>
                      <input
                        type="text"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-900 dark:text-white text-xs font-normal focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Warehouse, Consider Rejected Warehouses, Get Item Locations */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Warehouse
                      </label>
                      <input
                        type="text"
                        list="pl-detail-warehouses-list"
                        value={warehouse}
                        onChange={(e) => setWarehouse(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
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
                          onChange={(e) =>
                            setConsiderRejectedWarehouses(e.target.checked)
                          }
                          className="rounded border-slate-300 dark:border-zinc-700 text-black focus:ring-0 w-3.5 h-3.5"
                        />
                        <span className="font-medium">
                          Consider Rejected Warehouses
                        </span>
                      </label>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 pl-5">
                        Enable it if users want to consider rejected materials to dispatch.
                      </p>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleGetItemLocations}
                        className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-800 dark:text-zinc-200 text-xs font-medium transition-colors"
                      >
                        Get Item Locations
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 2: Pick Manually | Ignore Pricing Rule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-slate-800 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={pickManually}
                        onChange={(e) => setPickManually(e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-black focus:ring-0 w-3.5 h-3.5"
                      />
                      <span className="font-medium">Pick Manually</span>
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
                      <span className="font-medium">Ignore Pricing Rule</span>
                    </label>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 pl-5 leading-relaxed">
                      If enabled then system won't apply the pricing rule on the delivery
                      note which will be create from the pick list
                    </p>
                  </div>
                </div>

                {/* Section 3: Scan Barcode | Scan Mode & Prompt Qty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Scan Barcode
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={scanBarcode}
                        onChange={(e) => setScanBarcode(e.target.value)}
                        onKeyDown={handleBarcodeKeyDown}
                        className="w-full pl-3 pr-8 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
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
                        <span className="font-medium">Scan Mode</span>
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
                        <span className="font-medium">Prompt Qty</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 4: Item Locations Table */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400">
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
                                    list="pl-detail-products-list"
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
                                    list="pl-detail-warehouses-list"
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

                    <datalist id="pl-detail-products-list">
                      <option value="SKU002: Laptop" />
                      {INITIAL_PRODUCTS.map((p) => (
                        <option key={p.id} value={`${p.sku}: ${p.name}`} />
                      ))}
                    </datalist>
                    <datalist id="pl-detail-warehouses-list">
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
                      className="px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                    >
                      Add row
                    </button>
                    {selectedItemIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete ({selectedItemIds.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 2: MORE INFO (Screenshot 3) ==================== */}
            {activeTab === 'More Info' && (
              <div className="py-5 space-y-6">
                {/* 1. Print Settings v */}
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
                        <span className="font-medium">Group Same Items</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-[#27272A]" />

                {/* 2. Status */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                    Status
                  </h4>

                  <div className="max-w-md">
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      % Delivered
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="0%"
                      className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                      % of materials delivered against this Pick List
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 dark:border-[#27272A]" />

                {/* 3. Reference */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                    Reference
                  </h4>

                  <div className="max-w-md">
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={customer}
                      className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 3: CONNECTIONS (Screenshot 4) ==================== */}
            {activeTab === 'Connections' && (
              <div className="py-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Column 1: Sales */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Sales
                    </h4>
                    <div className="space-y-2">
                      {['Sales Order', 'Delivery Note', 'Sales Invoice'].map((item) => (
                        <div
                          key={item}
                          onClick={() => {
                            if (item === 'Delivery Note') navigate('/delivery-note');
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Manufacturing */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Manufacturing
                    </h4>
                    <div className="space-y-2">
                      <div
                        onClick={() => navigate('/stock-entry')}
                        className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <span>Stock Entry</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Reference */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Reference
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer">
                        <span>Stock Reservation Entry</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== COMMENTS & ACTIVITY FOOTER (Shown on all tabs) ==================== */}
            <div className="pt-6 mt-4 border-t border-slate-200/80 dark:border-[#27272A] space-y-6">
              {/* Comments Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Comments
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs font-semibold shrink-0">
                    A
                  </div>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleAddComment}
                    placeholder="Type a reply / comment"
                    className="flex-1 px-3.5 py-2 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                {comments.length > 0 && (
                  <div className="pl-10 space-y-2 pt-1">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#141417] border border-slate-200/60 dark:border-[#27272A] text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-medium text-slate-800 dark:text-zinc-200">
                            {c.author}
                          </span>
                          <span>{c.time}</span>
                        </div>
                        <p className="text-slate-700 dark:text-zinc-300">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Activity
                  </h3>
                  <button
                    type="button"
                    onClick={() => alert('New Email Composer')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Email</span>
                  </button>
                </div>

                <div className="relative pl-4 space-y-4 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-slate-200 dark:bg-[#27272A]" />

                  <div className="relative flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-zinc-300 -ml-[13px] ring-4 ring-white dark:ring-[#09090B]" />
                    <span>
                      <strong className="font-medium text-slate-800 dark:text-zinc-200">
                        You
                      </strong>{' '}
                      last edited this · 13 minutes ago
                    </span>
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-zinc-300 -ml-[13px] ring-4 ring-white dark:ring-[#09090B]" />
                      <span>
                        <strong className="font-medium text-slate-800 dark:text-zinc-200">
                          You
                        </strong>{' '}
                        created this · 13 minutes ago
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-600 dark:text-zinc-400 transition-colors"
                      title="Scroll to top"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (Screenshot 1-4) */}
          <PickListDetailSidebar
            documentId={entry.id}
            isLiked={entry.isLiked}
            onToggleLike={() => toggleLike(entry.id)}
            onPrint={() => window.print()}
          />
        </div>
      </div>
    </div>
  );
};

export default PickListDetailPage;

