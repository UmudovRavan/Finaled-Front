import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Plus,
  Settings,
  Edit2,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  Indent,
  Outdent,
  Quote,
} from 'lucide-react';
import { useMaterialRequest } from '../context';
import { INITIAL_PRODUCTS, INITIAL_WAREHOUSES } from '../api';
import type { MaterialRequestItem, MaterialRequestPurpose } from '../types';
import { MaterialRequestDetailSidebar } from '../components/material-request/MaterialRequestDetailSidebar';

const PURPOSE_OPTIONS: MaterialRequestPurpose[] = [
  'Purchase',
  'Material Transfer',
  'Material Issue',
  'Manufacture',
  'Customer Provided',
];

export const MaterialRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requests, toggleLike } = useMaterialRequest();
  const products = INITIAL_PRODUCTS;
  const warehouses = INITIAL_WAREHOUSES;

  const entry = requests.find((e) => e.id === id);

  const [activeTab, setActiveTab] = useState<
    'Details' | 'Terms' | 'More Info' | 'Connections'
  >('Details');

  // Form states initialized from entry
  const [title, setTitle] = useState(entry?.title || 'Material Issue Request for Laptop');
  const [purpose, setPurpose] = useState<MaterialRequestPurpose>(
    entry?.purpose || 'Material Issue'
  );
  const [company, setCompany] = useState(entry?.company || 'Avalon (Demo)');
  const [transactionDate, setTransactionDate] = useState(
    entry?.transactionDate || '09-11-2026'
  );
  const [requiredBy, setRequiredBy] = useState(entry?.requiredBy || '13-11-2026');
  const [priceList, setPriceList] = useState(entry?.priceList || 'Standard Buying');
  const [scanBarcode, setScanBarcode] = useState('');
  const [setFromWarehouse, setSetFromWarehouse] = useState(entry?.setWarehouse || '');

  // Items state
  const [items, setItems] = useState<MaterialRequestItem[]>(
    entry?.items && entry.items.length > 0
      ? entry.items
      : [
          {
            id: 'it-mr-1',
            itemCode: 'SKU002: Laptop',
            itemName: 'SKU002: Laptop',
            requiredBy: '13-11-2026',
            qty: 1,
            warehouse: 'Devam Eden İşler - AD',
            uom: 'Nos',
          },
        ]
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Terms Tab State
  const [termsTemplate, setTermsTemplate] = useState(entry?.terms || '');
  const [termsContent, setTermsContent] = useState(entry?.termsContent || '');

  // More Info Tab State (closed by default as in Screenshot 4)
  const [isStatusSectionOpen, setIsStatusSectionOpen] = useState(false);
  const [isPrintingDetailsOpen, setIsPrintingDetailsOpen] = useState(false);
  const [letterHead, setLetterHead] = useState(
    entry?.letterHead || 'Company Letterhead - Grey'
  );
  const [printHeading, setPrintHeading] = useState(entry?.printHeading || '');

  // Comments State
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<
    { id: string; author: string; text: string; time: string }[]
  >([]);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setPurpose(entry.purpose);
      setCompany(entry.company || 'Avalon (Demo)');
      setTransactionDate(entry.transactionDate);
      setRequiredBy(entry.requiredBy || '13-11-2026');
      setPriceList(entry.priceList || 'Standard Buying');
      setSetFromWarehouse(entry.setWarehouse || '');
      if (entry.items && entry.items.length > 0) {
        setItems(entry.items);
      }
      setLetterHead(entry.letterHead || 'Company Letterhead - Grey');
      setPrintHeading(entry.printHeading || '');
    }
  }, [entry]);

  if (!entry) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Material Request tapılmadı: {id}</p>
        <button
          onClick={() => navigate('/material-request')}
          className="mt-3 px-4 py-1.5 rounded-lg bg-black text-white text-xs"
        >
          Siyahıya qayıt
        </button>
      </div>
    );
  }

  const isFromWarehouseLabel =
    purpose === 'Material Issue' || purpose === 'Material Transfer';

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-mr-${Date.now()}`,
        itemCode: '',
        itemName: '',
        requiredBy: requiredBy || '13-11-2026',
        qty: 1,
        warehouse: setFromWarehouse || 'Devam Eden İşler - AD',
        uom: 'Nos',
      },
    ]);
  };

  const handleAddMultiple = () => {
    const now = Date.now();
    setItems((prev) => [
      ...prev,
      {
        id: `it-mr-${now}-1`,
        itemCode: '',
        itemName: '',
        requiredBy: requiredBy || '13-11-2026',
        qty: 1,
        warehouse: setFromWarehouse || 'Devam Eden İşler - AD',
        uom: 'Nos',
      },
      {
        id: `it-mr-${now}-2`,
        itemCode: '',
        itemName: '',
        requiredBy: requiredBy || '13-11-2026',
        qty: 1,
        warehouse: setFromWarehouse || 'Devam Eden İşler - AD',
        uom: 'Nos',
      },
    ]);
  };

  const handleItemChange = (
    rowId: string,
    field: keyof MaterialRequestItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== rowId) return item;
        const updated = { ...item, [field]: value };

        if (field === 'itemCode' && typeof value === 'string') {
          const matchedProd = products.find(
            (p) => `${p.sku}: ${p.name}` === value || p.sku === value || p.name === value
          );
          if (matchedProd) {
            updated.itemName = matchedProd.name;
          }
        }
        return updated;
      })
    );
  };

  const handleRemoveSelectedRows = () => {
    if (selectedItemIds.length === 0) return;
    setItems((prev) => prev.filter((item) => !selectedItemIds.includes(item.id)));
    setSelectedItemIds([]);
  };

  const toggleSelectRow = (rowId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(rowId) ? prev.filter((i) => i !== rowId) : [...prev, rowId]
    );
  };

  const toggleSelectAllRows = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanBarcode.trim()) {
      e.preventDefault();
      const q = scanBarcode.trim().toLowerCase();
      const matched = products.find(
        (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      );
      const code = matched ? `${matched.sku}: ${matched.name}` : scanBarcode.trim();
      setItems((prev) => [
        ...prev,
        {
          id: `it-mr-${Date.now()}`,
          itemCode: code,
          itemName: matched ? matched.name : code,
          requiredBy: requiredBy || '13-11-2026',
          qty: 1,
          warehouse: setFromWarehouse || 'Devam Eden İşler - AD',
          uom: 'Nos',
        },
      ]);
      setScanBarcode('');
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['No,Item Code,Required By,Quantity,From Warehouse,UOM'];
    const rows = items.map(
      (it, idx) =>
        `${idx + 1},"${it.itemCode}","${it.requiredBy}",${it.qty},"${it.warehouse}","${it.uom}"`
    );
    const blob = new Blob([[...headers, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.id}-items.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            {/* Top Blue Info Banner when Draft (Image 1 & 5: "Submit this document to confirm") */}
            {entry.status === 'Draft' && (
              <div className="mb-3 px-4 py-2.5 rounded-lg bg-[#EBF5FF] dark:bg-sky-950/40 text-[#1E6091] dark:text-sky-300 text-xs font-normal">
                Submit this document to confirm
              </div>
            )}

            {/* Tabs Navigation (Details | Terms | More Info | Connections) */}
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-[#27272A]">
              {(['Details', 'Terms', 'More Info', 'Connections'] as const).map((tab) => {
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
                  {/* Left Column: Purpose *, Company * */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Purpose <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={purpose}
                          onChange={(e) =>
                            setPurpose(e.target.value as MaterialRequestPurpose)
                          }
                          className="w-full appearance-none px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-900 dark:text-white text-xs font-medium focus:outline-none pr-8"
                        >
                          {PURPOSE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Company <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Transaction Date *, Required By, Price List */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Transaction Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Required By
                      </label>
                      <input
                        type="text"
                        value={requiredBy}
                        onChange={(e) => setRequiredBy(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        Price List
                      </label>
                      <input
                        type="text"
                        value={priceList}
                        onChange={(e) => setPriceList(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200/80 dark:border-[#27272A]" />

                {/* Items Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    Items
                  </h3>

                  {/* Scan Barcode & Set From Warehouse */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
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
                          title="Barcode Scanner"
                        >
                          [||]
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                        {isFromWarehouseLabel ? 'Set From Warehouse' : 'Set Warehouse'}
                      </label>
                      <input
                        type="text"
                        list="mr-detail-warehouses-list"
                        value={setFromWarehouse}
                        onChange={(e) => setSetFromWarehouse(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="space-y-2 pt-1">
                    <span className="block text-[11px] text-slate-600 dark:text-zinc-400">
                      Items
                    </span>

                    <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 dark:bg-[#141417] border-b border-slate-200 dark:border-[#27272A] text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                            <th className="w-9 px-3 py-2 text-center border-r border-slate-200/70 dark:border-[#27272A]">
                              <input
                                type="checkbox"
                                checked={
                                  items.length > 0 && selectedItemIds.length === items.length
                                }
                                onChange={toggleSelectAllRows}
                                className="rounded border-slate-300 dark:border-zinc-600 text-black focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                              />
                            </th>
                            <th className="w-11 px-2.5 py-2 border-r border-slate-200/70 dark:border-[#27272A]">
                              No.
                            </th>
                            <th className="px-3 py-2 border-r border-slate-200/70 dark:border-[#27272A] min-w-[180px]">
                              Item Code <span className="text-rose-500">*</span>
                            </th>
                            <th className="w-32 px-3 py-2 border-r border-slate-200/70 dark:border-[#27272A]">
                              Required By <span className="text-rose-500">*</span>
                            </th>
                            <th className="w-24 px-3 py-2 text-right border-r border-slate-200/70 dark:border-[#27272A]">
                              Quantity <span className="text-rose-500">*</span>
                            </th>
                            <th className="w-44 px-3 py-2 border-r border-slate-200/70 dark:border-[#27272A]">
                              {isFromWarehouseLabel ? 'From Warehouse' : 'Warehouse'}
                            </th>
                            <th className="w-24 px-3 py-2 border-r border-slate-200/70 dark:border-[#27272A]">
                              UOM <span className="text-rose-500">*</span>
                            </th>
                            <th className="w-10 px-2 py-2 text-center">
                              <Settings className="w-3.5 h-3.5 mx-auto text-slate-400" />
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/70 dark:divide-[#27272A] text-xs">
                          {items.map((row, index) => {
                            const isSelected = selectedItemIds.includes(row.id);
                            return (
                              <React.Fragment key={row.id}>
                                <tr
                                  className={`${
                                    isSelected
                                      ? 'bg-amber-50/40 dark:bg-amber-950/15'
                                      : 'bg-white dark:bg-[#09090B]'
                                  } hover:bg-slate-50/60 dark:hover:bg-[#121215] transition-colors`}
                                >
                                  <td className="px-3 py-2 text-center border-r border-slate-200/70 dark:border-[#27272A]">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleSelectRow(row.id)}
                                      className="rounded border-slate-300 dark:border-zinc-600 text-black focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                                    />
                                  </td>
                                  <td className="px-2.5 py-2 text-slate-500 dark:text-zinc-400 border-r border-slate-200/70 dark:border-[#27272A]">
                                    {index + 1}
                                  </td>
                                  <td className="px-3 py-1.5 border-r border-slate-200/70 dark:border-[#27272A]">
                                    <div className="flex items-center gap-2">
                                      {row.itemCode && (
                                        <span className="w-2 h-2 rounded-full bg-[#B45309] shrink-0" />
                                      )}
                                      <input
                                        type="text"
                                        list="mr-detail-products-list"
                                        value={row.itemCode}
                                        onChange={(e) =>
                                          handleItemChange(row.id, 'itemCode', e.target.value)
                                        }
                                        className="w-full bg-transparent text-slate-900 dark:text-white font-semibold focus:outline-none"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-3 py-1.5 border-r border-slate-200/70 dark:border-[#27272A]">
                                    <input
                                      type="text"
                                      value={row.requiredBy}
                                      onChange={(e) =>
                                        handleItemChange(row.id, 'requiredBy', e.target.value)
                                      }
                                      className="w-full bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-3 py-1.5 text-right border-r border-slate-200/70 dark:border-[#27272A]">
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={row.qty}
                                      onChange={(e) =>
                                        handleItemChange(
                                          row.id,
                                          'qty',
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                      className="w-full bg-transparent text-right text-slate-900 dark:text-white font-semibold focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-3 py-1.5 border-r border-slate-200/70 dark:border-[#27272A]">
                                    <input
                                      type="text"
                                      list="mr-detail-warehouses-list"
                                      value={row.warehouse}
                                      onChange={(e) =>
                                        handleItemChange(row.id, 'warehouse', e.target.value)
                                      }
                                      className="w-full bg-transparent text-slate-700 dark:text-zinc-300 focus:outline-none truncate"
                                    />
                                  </td>
                                  <td className="px-3 py-1.5 border-r border-slate-200/70 dark:border-[#27272A]">
                                    <input
                                      type="text"
                                      value={row.uom}
                                      onChange={(e) =>
                                        handleItemChange(row.id, 'uom', e.target.value)
                                      }
                                      className="w-full bg-transparent text-slate-900 dark:text-white font-semibold focus:outline-none"
                                    />
                                  </td>
                                  <td className="px-2 py-1.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingRowId(editingRowId === row.id ? null : row.id)
                                      }
                                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                      title="Edit Row"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>

                                {editingRowId === row.id && (
                                  <tr className="bg-slate-50/70 dark:bg-[#141417]">
                                    <td colSpan={8} className="px-4 py-3">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div>
                                          <label className="block text-[11px] text-slate-500 mb-1">
                                            Item Name
                                          </label>
                                          <input
                                            type="text"
                                            value={row.itemName}
                                            onChange={(e) =>
                                              handleItemChange(
                                                row.id,
                                                'itemName',
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-2.5 py-1 rounded bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] text-slate-500 mb-1">
                                            UOM
                                          </label>
                                          <input
                                            type="text"
                                            value={row.uom}
                                            onChange={(e) =>
                                              handleItemChange(row.id, 'uom', e.target.value)
                                            }
                                            className="w-full px-2.5 py-1 rounded bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33]"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[11px] text-slate-500 mb-1">
                                            {isFromWarehouseLabel
                                              ? 'From Warehouse'
                                              : 'Warehouse'}
                                          </label>
                                          <input
                                            type="text"
                                            value={row.warehouse}
                                            onChange={(e) =>
                                              handleItemChange(
                                                row.id,
                                                'warehouse',
                                                e.target.value
                                              )
                                            }
                                            className="w-full px-2.5 py-1 rounded bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33]"
                                          />
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>

                      <datalist id="mr-detail-products-list">
                        <option value="SKU002: Laptop" />
                        {products.map((p) => (
                          <option key={p.id} value={`${p.sku}: ${p.name}`} />
                        ))}
                      </datalist>
                      <datalist id="mr-detail-warehouses-list">
                        <option value="Devam Eden İşler - AD" />
                        <option value="Bitmiş Ürünler - AD" />
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.name} />
                        ))}
                      </datalist>
                    </div>

                    {/* Table Action Buttons: Add row | Add multiple --- Download | Upload */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                        >
                          Add row
                        </button>
                        <button
                          type="button"
                          onClick={handleAddMultiple}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                        >
                          Add multiple
                        </button>
                        {selectedItemIds.length > 0 && (
                          <button
                            type="button"
                            onClick={handleRemoveSelectedRows}
                            className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete ({selectedItemIds.length})</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadCSV}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                        >
                          Download
                        </button>
                        <label className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-[#1E1E22] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer">
                          Upload
                          <input type="file" accept=".csv" className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 2: TERMS (Screenshot 3) ==================== */}
            {activeTab === 'Terms' && (
              <div className="py-5 space-y-5">
                <div className="max-w-md">
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Terms
                  </label>
                  <input
                    type="text"
                    value={termsTemplate}
                    onChange={(e) => setTermsTemplate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1.5">
                    Terms and Conditions Content
                  </label>
                  <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden bg-slate-100/60 dark:bg-[#18181B]">
                    {/* Rich Text Editor Toolbar */}
                    <div className="px-3 py-2 bg-white dark:bg-[#141417] border-b border-slate-200 dark:border-[#27272A] space-y-2 text-slate-600 dark:text-zinc-300">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span>Normal</span>
                          <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span>---</span>
                          <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <Underline className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <Strikethrough className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-serif px-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          T<sub>x</sub>
                        </span>
                        <span className="text-xs font-semibold underline px-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          A
                        </span>
                        <span className="text-xs font-semibold border border-slate-300 dark:border-zinc-600 px-1 rounded cursor-pointer">
                          A
                        </span>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <Code className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs px-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          ¶
                        </span>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <ListChecks className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <Outdent className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-100 dark:hover:bg-[#27272A] rounded">
                          <Indent className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs pt-0.5">
                        <span>Table</span>
                        <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>

                    {/* Editor Area */}
                    <textarea
                      rows={12}
                      value={termsContent}
                      onChange={(e) => setTermsContent(e.target.value)}
                      className="w-full p-4 bg-slate-100/80 dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs focus:outline-none resize-y"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 3: MORE INFO (Screenshot 4) ==================== */}
            {activeTab === 'More Info' && (
              <div className="py-2 divide-y divide-slate-200/80 dark:divide-[#27272A]">
                {/* 1. Status > */}
                <div className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setIsStatusSectionOpen(!isStatusSectionOpen)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <span>Status</span>
                    {isStatusSectionOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  {isStatusSectionOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                          Status
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={entry.status}
                          className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                          % Ordered
                        </label>
                        <input
                          type="text"
                          readOnly
                          value="0%"
                          className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Printing Details > */}
                <div className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setIsPrintingDetailsOpen(!isPrintingDetailsOpen)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <span>Printing Details</span>
                    {isPrintingDetailsOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </button>

                  {isPrintingDetailsOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                          Letter Head
                        </label>
                        <input
                          type="text"
                          value={letterHead}
                          onChange={(e) => setLetterHead(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                          Print Heading
                        </label>
                        <input
                          type="text"
                          value={printHeading}
                          onChange={(e) => setPrintHeading(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-md bg-slate-100/80 dark:bg-[#1E1E22] border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== TAB 4: CONNECTIONS (Screenshot 5) ==================== */}
            {activeTab === 'Connections' && (
              <div className="py-5 space-y-7">
                {/* Row 1: Reference | Stock | Manufacturing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Reference */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Reference
                    </h4>
                    <div className="space-y-2">
                      {[
                        'Sales Order',
                        'Request for Quotation',
                        'Supplier Quotation',
                        'Purchase Order',
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                        >
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Stock
                    </h4>
                    <div className="space-y-2">
                      <div
                        onClick={() => navigate('/stock-entry/new')}
                        className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-800 dark:border-zinc-400 bg-white dark:bg-[#141417] text-xs text-slate-900 dark:text-white transition-colors cursor-pointer"
                      >
                        <span className="underline underline-offset-2">Stock Entry</span>
                      </div>
                      <div
                        onClick={() => navigate('/purchase-receipt/new')}
                        className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <span>Purchase Receipt</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer">
                        <span>Pick List</span>
                      </div>
                    </div>
                  </div>

                  {/* Manufacturing */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Manufacturing
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer">
                        <span>Work Order</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2: Internal Transfer | Accounting Dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Internal Transfer */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Internal Transfer
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer">
                        <span>Sales Order</span>
                      </div>
                    </div>
                  </div>

                  {/* Accounting Dimensions */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Accounting Dimensions
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer">
                        <span>Project</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 rounded-md border border-slate-200/80 dark:border-[#27272A] bg-white dark:bg-[#141417] hover:border-slate-300 dark:hover:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span>Cost Center</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#27272A] text-[10px] font-medium text-slate-700 dark:text-zinc-300">
                            1
                          </span>
                        </div>
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
                      created this · 13 minutes ago
                    </span>
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-zinc-300 -ml-[13px] ring-4 ring-white dark:ring-[#09090B]" />
                      <span>
                        <strong className="font-medium text-slate-800 dark:text-zinc-200">
                          You
                        </strong>{' '}
                        last edited this · 13 minutes ago
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

          {/* RIGHT SIDEBAR (Screenshot 1-5) */}
          <MaterialRequestDetailSidebar
            title={title}
            documentId={entry.id}
            isLiked={entry.isLiked}
            onToggleLike={() => toggleLike(entry.id)}
            onPrint={() => window.print()}
            onUpdateTitle={(newTitle) => setTitle(newTitle)}
          />
        </div>
      </div>
    </div>
  );
};

export default MaterialRequestDetailPage;
