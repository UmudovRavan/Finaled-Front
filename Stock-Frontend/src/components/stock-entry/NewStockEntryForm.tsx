import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronsUpDown,
  ChevronRight,
  ChevronDown,
  ScanBarcode,
  Settings as Gear,
  Pencil,
  Download,
  Upload,
  Check,
} from 'lucide-react';
import { useStockEntry } from '../../context';
import type { StockEntryType } from '../../types';

interface FormItemRow {
  id: string;
  selected: boolean;
  sourceWarehouse: string;
  itemCode: string;
  qty: number;
  basicRate: number;
}

interface NewStockEntryFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const NewStockEntryForm: React.FC<NewStockEntryFormProps> = ({
  onSuccess,
  isModal = false,
}) => {
  const navigate = useNavigate();
  const { createEntry } = useStockEntry();

  // Active Tab: Details vs Other Info
  const [activeTab, setActiveTab] = useState<'details' | 'other_info'>('details');

  // Top Action Dropdowns
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isGetItemsMenuOpen, setIsGetItemsMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const getItemsMenuRef = useRef<HTMLDivElement>(null);

  // Form Fields (Image 1, 3, 4)
  const [company, setCompany] = useState('Avalon (Demo)');
  const [series, setSeries] = useState('MAT-STE-.YYYY.-');
  const [stockEntryType, setStockEntryType] = useState<StockEntryType>('Material Receipt');

  // Posting Date & Time
  const [editPostingDateTime, setEditPostingDateTime] = useState(false);
  const [postingDate, setPostingDate] = useState('01-11-2026');
  const [postingTime, setPostingTime] = useState('22:28:33');

  // Inspection
  const [inspectionRequired, setInspectionRequired] = useState(false);

  // BOM Accordion
  const [isBomInfoOpen, setIsBomInfoOpen] = useState(false);
  const [fromBom, setFromBom] = useState(false);
  const [useMultiLevelBom, setUseMultiLevelBom] = useState(true);
  const [bomNo, setBomNo] = useState('');
  const [finishedGoodQuantity, setFinishedGoodQuantity] = useState('');

  // Default Warehouse Accordion
  const [isDefaultWarehouseOpen, setIsDefaultWarehouseOpen] = useState(false);
  const [defaultSourceWarehouse, setDefaultSourceWarehouse] = useState('');
  const [defaultTargetWarehouse, setDefaultTargetWarehouse] = useState('');

  // Barcode
  const [scanBarcode, setScanBarcode] = useState('');

  // Other Info
  const [supplier, setSupplier] = useState('');
  const [remarks, setRemarks] = useState('');

  // Items Table (Image 1, 2, 5)
  const [items, setItems] = useState<FormItemRow[]>([
    {
      id: 'row-1',
      selected: false,
      sourceWarehouse: '',
      itemCode: '',
      qty: 0,
      basicRate: 0,
    },
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setIsCreateMenuOpen(false);
      }
      if (getItemsMenuRef.current && !getItemsMenuRef.current.contains(e.target as Node)) {
        setIsGetItemsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Checkbox helpers
  const selectedCount = items.filter((it) => it.selected).length;
  const isAllSelected = items.length > 0 && selectedCount === items.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setItems((prev) => prev.map((it) => ({ ...it, selected: false })));
    } else {
      setItems((prev) => prev.map((it) => ({ ...it, selected: true })));
    }
  };

  const handleSelectRow = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  };

  const handleItemChange = (id: string, field: keyof FormItemRow, value: any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Button actions (Images 2 & 5)
  const handleAddRow = () => {
    const newId = `row-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        selected: false,
        sourceWarehouse: defaultSourceWarehouse || '',
        itemCode: '',
        qty: 0,
        basicRate: 0,
      },
    ]);
  };

  const handleAddMultiple = () => {
    const newItems: FormItemRow[] = [
      {
        id: `row-${Date.now()}-1`,
        selected: false,
        sourceWarehouse: defaultSourceWarehouse || '',
        itemCode: 'SKU-001',
        qty: 5,
        basicRate: 45,
      },
      {
        id: `row-${Date.now()}-2`,
        selected: false,
        sourceWarehouse: defaultSourceWarehouse || '',
        itemCode: 'SKU-002',
        qty: 12,
        basicRate: 85,
      },
    ];
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleDeleteSelected = () => {
    setItems((prev) => {
      const remaining = prev.filter((it) => !it.selected);
      if (remaining.length === 0) {
        return [
          {
            id: `row-${Date.now()}`,
            selected: false,
            sourceWarehouse: '',
            itemCode: '',
            qty: 0,
            basicRate: 0,
          },
        ];
      }
      return remaining;
    });
  };

  const handleDuplicateSelected = () => {
    const selectedRows = items.filter((it) => it.selected);
    const duplicates: FormItemRow[] = selectedRows.map((it) => ({
      ...it,
      id: `row-${Date.now()}-${Math.random()}`,
      selected: false,
    }));
    setItems((prev) => [...prev, ...duplicates]);
  };

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scanBarcode.trim()) {
      const scannedCode = scanBarcode.trim();
      setItems((prev) => [
        ...prev,
        {
          id: `row-${Date.now()}`,
          selected: false,
          sourceWarehouse: defaultSourceWarehouse || '',
          itemCode: scannedCode,
          qty: 1,
          basicRate: 100,
        },
      ]);
      setScanBarcode('');
    }
  };

  // Populate from BOM
  const handleGetItemsFromBom = () => {
    setItems([
      {
        id: 'bom-1',
        selected: false,
        sourceWarehouse: 'Mərkəzi Baş Anbar',
        itemCode: 'RAW-STL-01',
        qty: 10,
        basicRate: 35,
      },
      {
        id: 'bom-2',
        selected: false,
        sourceWarehouse: 'Mərkəzi Baş Anbar',
        itemCode: 'COMP-ELEC-04',
        qty: 2,
        basicRate: 150,
      },
      {
        id: 'bom-3',
        selected: false,
        sourceWarehouse: 'Sumqayıt Logistika',
        itemCode: 'PACK-BOX-M',
        qty: 10,
        basicRate: 4.5,
      },
    ]);
  };

  // Save handler
  const handleSave = async () => {
    const validItems = items
      .filter((it) => it.itemCode.trim() !== '' || it.qty > 0)
      .map((it) => ({
        id: it.id,
        itemCode: it.itemCode.trim() || 'SKU-GENERAL',
        itemName: it.itemCode.trim() || 'General Inventory Item',
        qty: Number(it.qty) || 1,
        uom: 'Nos',
        basicRate: Number(it.basicRate) || 0,
        amount: (Number(it.qty) || 1) * (Number(it.basicRate) || 0),
      }));

    await createEntry({
      stockEntryType,
      title: stockEntryType,
      status: 'Draft',
      purpose: stockEntryType,
      company,
      series,
      defaultSourceWarehouse: defaultSourceWarehouse || undefined,
      defaultTargetWarehouse: defaultTargetWarehouse || 'Devam Eden İşler - AD',
      supplierName: supplier || undefined,
      remarks,
      items:
        validItems.length > 0
          ? validItems
          : [
              {
                id: 'it-default',
                itemCode: 'SKU-001',
                itemName: 'Demo Item Group Component',
                qty: 1,
                uom: 'Nos',
                basicRate: 100,
                amount: 100,
              },
            ],
    });

    if (onSuccess) {
      onSuccess();
    } else {
      navigate('/stock-entry');
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] shadow-sm text-xs font-sans">
      {/* 1. Header Toolbar (Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 dark:border-[#27272A]">
        {/* Breadcrumb + Not Saved Badge */}
        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-zinc-300">
          <span className="text-slate-900 dark:text-white font-semibold text-sm">
            New Stock Entry
          </span>
          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full select-none">
            Not Saved
          </span>
        </div>

        {/* Top Right Action Buttons: Create ↕, Get Items From ↕, Save */}
        <div className="flex items-center gap-2">
          {/* Create ↕ Dropdown */}
          <div className="relative" ref={createMenuRef}>
            <button
              type="button"
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
            >
              <span>Create</span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isCreateMenuOpen && (
              <div className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                {[
                  'Material Receipt',
                  'Material Issue',
                  'Material Transfer',
                  'Manufacture',
                  'Repack',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setStockEntryType(type as StockEntryType);
                      setIsCreateMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-left transition-colors ${
                      stockEntryType === type
                        ? 'bg-slate-100 dark:bg-[#27272A] text-slate-900 dark:text-white font-medium'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#242428]'
                    }`}
                  >
                    <span>{type}</span>
                    {stockEntryType === type && <Check className="w-3 h-3 text-slate-700 dark:text-zinc-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Get Items From ↕ Dropdown */}
          <div className="relative" ref={getItemsMenuRef}>
            <button
              type="button"
              onClick={() => setIsGetItemsMenuOpen(!isGetItemsMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
            >
              <span>Get Items From</span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isGetItemsMenuOpen && (
              <div className="absolute right-0 top-9 z-50 w-52 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    handleGetItemsFromBom();
                    setIsGetItemsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                >
                  Bill of Materials (BOM)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddMultiple();
                    setIsGetItemsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                >
                  Purchase Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAddMultiple();
                    setIsGetItemsMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                >
                  Material Request
                </button>
              </div>
            )}
          </div>

          {/* Solid Black Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
          >
            Save
          </button>
        </div>
      </div>

      {/* 2. Tabs: Details & Other Info (Image 1) */}
      <div className="flex items-center gap-6 px-5 border-b border-slate-100 dark:border-[#27272A] text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`py-2.5 font-medium border-b-2 transition-all ${
            activeTab === 'details'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('other_info')}
          className={`py-2.5 font-medium border-b-2 transition-all ${
            activeTab === 'other_info'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
              : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
          }`}
        >
          Other Info
        </button>
      </div>

      {/* 3. Form Body */}
      {activeTab === 'details' ? (
        <div className="p-5 space-y-5">
          {/* Main 2-Column Grid from Image 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column: Company, Series, Stock Entry Type */}
            <div className="space-y-4">
              {/* Company * */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 transition-all font-medium"
                />
              </div>

              {/* Series * */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Series <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 pr-8 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 transition-all"
                  >
                    <option value="MAT-STE-.YYYY.-">MAT-STE-.YYYY.-</option>
                    <option value="STE-.YYYY.-">STE-.YYYY.-</option>
                  </select>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Stock Entry Type * */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Stock Entry Type <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={stockEntryType}
                    onChange={(e) => setStockEntryType(e.target.value as StockEntryType)}
                    className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 pr-8 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 transition-all"
                  >
                    <option value="Material Receipt">Material Receipt</option>
                    <option value="Material Issue">Material Issue</option>
                    <option value="Material Transfer">Material Transfer</option>
                    <option value="Manufacture">Manufacture</option>
                    <option value="Repack">Repack</option>
                  </select>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right Column: Edit Posting Date and Time, Posting Date, Posting Time */}
            <div className="space-y-4">
              {/* Checkbox: Edit Posting Date and Time */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editPostingDateTime"
                  checked={editPostingDateTime}
                  onChange={(e) => setEditPostingDateTime(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="editPostingDateTime"
                  className="text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
                >
                  Edit Posting Date and Time
                </label>
              </div>

              {/* Posting Date */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Posting Date
                </label>
                <input
                  type="text"
                  value={postingDate}
                  disabled={!editPostingDateTime}
                  onChange={(e) => setPostingDate(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-lg outline-none border border-transparent transition-all ${
                    editPostingDateTime
                      ? 'bg-white dark:bg-[#202024] text-slate-900 dark:text-white border-slate-300 dark:border-zinc-700'
                      : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-500 dark:text-zinc-400 opacity-90 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Posting Time */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                  Posting Time
                </label>
                <input
                  type="text"
                  value={postingTime}
                  disabled={!editPostingDateTime}
                  onChange={(e) => setPostingTime(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-lg outline-none border border-transparent transition-all ${
                    editPostingDateTime
                      ? 'bg-white dark:bg-[#202024] text-slate-900 dark:text-white border-slate-300 dark:border-zinc-700'
                      : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-500 dark:text-zinc-400 opacity-90 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Checkbox: Inspection Required (Image 1) */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="inspectionRequired"
              checked={inspectionRequired}
              onChange={(e) => setInspectionRequired(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="inspectionRequired"
              className="text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
            >
              Inspection Required
            </label>
          </div>

          {/* Accordion 1: BOM Info (Image 1, 3, 4) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsBomInfoOpen(!isBomInfoOpen)}
              className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span>BOM Info</span>
              {isBomInfoOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isBomInfoOpen && (
              <div className="mt-3 pl-1 space-y-3 animate-in fade-in duration-150">
                {/* Checkbox: From BOM (Image 3) */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fromBom"
                    checked={fromBom}
                    onChange={(e) => setFromBom(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="fromBom"
                    className="text-slate-700 dark:text-zinc-300 cursor-pointer select-none"
                  >
                    From BOM
                  </label>
                </div>

                {/* When "From BOM" is checked (Image 4) */}
                {fromBom && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-1">
                    {/* Left: Use Multi-Level BOM & BOM No */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="useMultiLevelBom"
                            checked={useMultiLevelBom}
                            onChange={(e) => setUseMultiLevelBom(e.target.checked)}
                            className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                          <label
                            htmlFor="useMultiLevelBom"
                            className="text-slate-700 dark:text-zinc-300 font-medium cursor-pointer"
                          >
                            Use Multi-Level BOM
                          </label>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 pl-6 mt-0.5">
                          Including items for sub assemblies
                        </p>
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                          BOM No
                        </label>
                        <input
                          type="text"
                          value={bomNo}
                          onChange={(e) => setBomNo(e.target.value)}
                          placeholder="e.g. BOM-PROD-2026-001"
                          className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
                        />
                      </div>
                    </div>

                    {/* Right: Finished Good Quantity & Get Items button */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                          Finished Good Quantity
                        </label>
                        <input
                          type="number"
                          value={finishedGoodQuantity}
                          onChange={(e) => setFinishedGoodQuantity(e.target.value)}
                          placeholder="0.000"
                          className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
                        />
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          As per Stock UOM
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGetItemsFromBom}
                        className="bg-[#F3F4F6] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272B] text-slate-700 dark:text-zinc-300 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      >
                        Get Items
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Accordion 2: Default Warehouse (Image 1, 3) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsDefaultWarehouseOpen(!isDefaultWarehouseOpen)}
              className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span>Default Warehouse</span>
              {isDefaultWarehouseOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isDefaultWarehouseOpen && (
              <div className="mt-3 pl-1 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                    Default Source Warehouse
                  </label>
                  <input
                    type="text"
                    value={defaultSourceWarehouse}
                    onChange={(e) => setDefaultSourceWarehouse(e.target.value)}
                    placeholder="Search warehouse..."
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Sets 'Source Warehouse' in each row of the items table.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                    Default Target Warehouse
                  </label>
                  <input
                    type="text"
                    value={defaultTargetWarehouse}
                    onChange={(e) => setDefaultTargetWarehouse(e.target.value)}
                    placeholder="Search warehouse..."
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Sets 'Target Warehouse' in each row of the items table.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scan Barcode (Image 1, 2, 3, 4) */}
          <div className="pt-1">
            <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
              Scan Barcode
            </label>
            <div className="relative">
              <input
                type="text"
                value={scanBarcode}
                onChange={(e) => setScanBarcode(e.target.value)}
                onKeyDown={handleBarcodeScan}
                placeholder="Scan or enter barcode / SKU (press Enter)..."
                className="w-full bg-[#F3F4F6] dark:bg-[#202024] hover:bg-[#EBEDF0] dark:hover:bg-[#27272B] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 pr-10 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 transition-all"
              />
              <ScanBarcode className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Items Section (Image 1, 2, 5) */}
          <div className="pt-2 space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-xs">Items</h4>
            <p className="text-[11px] text-slate-500">Items</p>

            {/* Items Table */}
            <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#27272A] bg-slate-50/60 dark:bg-[#202024] text-slate-500 dark:text-zinc-400 select-none">
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-2 w-10 text-slate-600 dark:text-zinc-300 font-normal">
                        No.
                      </th>
                      <th className="py-2.5 px-3 font-normal text-slate-600 dark:text-zinc-300 min-w-[180px]">
                        Source Warehouse
                      </th>
                      <th className="py-2.5 px-3 font-normal text-slate-600 dark:text-zinc-300 min-w-[200px]">
                        Item Code <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-normal text-right text-slate-600 dark:text-zinc-300 min-w-[100px]">
                        Qty <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-normal text-right text-slate-600 dark:text-zinc-300 min-w-[120px]">
                        Basic Rate (as per ...
                      </th>
                      <th className="py-2.5 px-3 w-10 text-center text-slate-400">
                        <Gear className="w-3.5 h-3.5 mx-auto" />
                      </th>
                    </tr>
                  </thead>

                  {/* Table Rows */}
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]/70">
                    {items.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          row.selected
                            ? 'bg-slate-50 dark:bg-white/[0.04]'
                            : 'hover:bg-slate-50/50 dark:hover:bg-white/[0.01]'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={row.selected}
                            onChange={() => handleSelectRow(row.id)}
                            className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* No. */}
                        <td className="py-2.5 px-2 text-slate-500 dark:text-zinc-400">
                          {index + 1}
                        </td>

                        {/* Source Warehouse */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.sourceWarehouse}
                            onChange={(e) =>
                              handleItemChange(row.id, 'sourceWarehouse', e.target.value)
                            }
                            placeholder="Source Warehouse..."
                            className="w-full bg-transparent text-slate-800 dark:text-zinc-200 outline-none hover:bg-slate-100/60 dark:hover:bg-[#27272B] px-1.5 py-1 rounded transition-colors text-xs placeholder:text-slate-400"
                          />
                        </td>

                        {/* Item Code * */}
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.itemCode}
                            onChange={(e) =>
                              handleItemChange(row.id, 'itemCode', e.target.value)
                            }
                            placeholder="Item Code..."
                            className="w-full bg-transparent text-slate-800 dark:text-zinc-200 outline-none hover:bg-slate-100/60 dark:hover:bg-[#27272B] px-1.5 py-1 rounded transition-colors text-xs font-medium placeholder:text-slate-400"
                          />
                        </td>

                        {/* Qty * */}
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.001"
                            value={row.qty || ''}
                            onChange={(e) =>
                              handleItemChange(row.id, 'qty', Number(e.target.value))
                            }
                            placeholder="0.000"
                            className="w-20 text-right bg-transparent text-slate-800 dark:text-zinc-200 outline-none hover:bg-slate-100/60 dark:hover:bg-[#27272B] px-1.5 py-1 rounded transition-colors text-xs"
                          />
                        </td>

                        {/* Basic Rate */}
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={row.basicRate || ''}
                            onChange={(e) =>
                              handleItemChange(row.id, 'basicRate', Number(e.target.value))
                            }
                            placeholder="$ 0.00"
                            className="w-24 text-right bg-transparent text-slate-800 dark:text-zinc-200 outline-none hover:bg-slate-100/60 dark:hover:bg-[#27272B] px-1.5 py-1 rounded transition-colors text-xs"
                          />
                        </td>

                        {/* Edit Row Icon */}
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Edit row details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Actions (Images 2 & 5) */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Left side dynamic buttons */}
                <div className="flex items-center gap-2">
                  {selectedCount > 0 ? (
                    /* Image 5: Row(s) are selected -> RED "Delete row" & "Duplicate row" */
                    <>
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="bg-[#DC2626] hover:bg-red-700 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                      >
                        Delete row
                      </button>
                      <button
                        type="button"
                        onClick={handleDuplicateSelected}
                        className="bg-[#F3F4F6] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272B] text-slate-700 dark:text-zinc-300 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Duplicate row
                      </button>
                    </>
                  ) : (
                    /* Image 2: No rows selected -> "Add row" & "Add multiple" */
                    <>
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="bg-[#F3F4F6] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272B] text-slate-700 dark:text-zinc-300 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Add row
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMultiple}
                        className="bg-[#F3F4F6] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272B] text-slate-700 dark:text-zinc-300 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        Add multiple
                      </button>
                    </>
                  )}
                </div>

                {/* Right side: Download & Upload (Images 2 & 5) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const csv =
                        'data:text/csv;charset=utf-8,Item Code,Source Warehouse,Qty,Basic Rate\n' +
                        items
                          .map((it) => `${it.itemCode},${it.sourceWarehouse},${it.qty},${it.basicRate}`)
                          .join('\n');
                      const link = document.createElement('a');
                      link.href = encodeURI(csv);
                      link.download = 'stock_entry_items_template.csv';
                      link.click();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#202024] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-normal transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddMultiple}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#202024] text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs font-normal transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Update Rate and Availability (Images 2 & 5) */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((it) => ({
                        ...it,
                        basicRate: it.basicRate > 0 ? it.basicRate : 75.0,
                      }))
                    );
                  }}
                  className="bg-[#F3F4F6] dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272B] text-slate-700 dark:text-zinc-300 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Update Rate and Availability
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Other Info Tab */
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Select or enter supplier..."
                className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
                Cost Center / Project
              </label>
              <input
                type="text"
                placeholder="Main - ALT"
                className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 text-xs mb-1">
              Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Internal notes or shipment notes..."
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg outline-none border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};

