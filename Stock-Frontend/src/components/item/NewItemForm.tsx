import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HelpCircle,
  ChevronDown,
  Plus,
  Trash2,
  Settings,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  List as ListIcon,
  ListOrdered,
  AlignLeft,
  Table as TableIcon,
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  ChevronsUpDown,
} from 'lucide-react';
import { useItem } from '../../context';

type TabType =
  | 'details'
  | 'accounting'
  | 'uom'
  | 'tax'
  | 'inventory'
  | 'purchasing'
  | 'sales'
  | 'manufacturing'
  | 'quality';

interface ItemDefaultRow {
  id: string;
  company: string;
  defaultWarehouse: string;
  defaultPriceList: string;
}

interface UOMRow {
  id: string;
  uom: string;
  conversionFactor: number;
}

interface TaxRow {
  id: string;
  itemTaxTemplate: string;
  taxCategory: string;
  validFrom: string;
  minNetRate: string;
  maxNetRate: string;
}

interface BarcodeRow {
  id: string;
  barcode: string;
  barcodeType: string;
  uom: string;
}

interface AutoReorderRow {
  id: string;
  requestFor: string;
  checkAvailabilityInWarehouse: string;
  reorderLevel: number;
  reorderQty: number;
  materialRequestType: string;
}

interface ItemSupplierRow {
  id: string;
  supplier: string;
  supplierPartNumber: string;
}

interface CustomerItemRow {
  id: string;
  customerName: string;
  customerGroup: string;
  refCode: string;
}

export const NewItemForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useItem();

  const initialValues = (location.state as any) || {};

  const [activeTab, setActiveTab] = useState<TabType>('details');

  // Details tab state
  const [itemCode, setItemCode] = useState(initialValues.itemCode || '');
  const [itemName, setItemName] = useState(initialValues.itemName || '');
  const [itemGroup, setItemGroup] = useState(initialValues.itemGroup || '');
  const [defaultUom, setDefaultUom] = useState(initialValues.defaultUom || 'Nos');
  const [maintainStock, setMaintainStock] = useState(
    initialValues.maintainStock !== undefined ? initialValues.maintainStock : true
  );
  const [isFixedAsset, setIsFixedAsset] = useState(
    initialValues.isFixedAsset !== undefined ? initialValues.isFixedAsset : false
  );

  const [allowSales, setAllowSales] = useState(true);
  const [allowPurchase, setAllowPurchase] = useState(true);
  const [allowAlternativeItem, setAllowAlternativeItem] = useState(false);
  const [isCustomerProvidedItem, setIsCustomerProvidedItem] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);

  const [standardSellingRate, setStandardSellingRate] = useState('');
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');

  // Accounting tab state
  const [itemDefaults, setItemDefaults] = useState<ItemDefaultRow[]>([]);
  const [enableDeferredExpense, setEnableDeferredExpense] = useState(false);
  const [enableDeferredRevenue, setEnableDeferredRevenue] = useState(false);

  // UOM tab state
  const [uomRows, setUomRows] = useState<UOMRow[]>([]);

  // Tax tab state
  const [taxRows, setTaxRows] = useState<TaxRow[]>([]);
  const [purchaseTaxWithholding, setPurchaseTaxWithholding] = useState('');
  const [salesTaxWithholding, setSalesTaxWithholding] = useState('');

  // Inventory tab state (Screenshots 1 & 2)
  const [valuationMethod, setValuationMethod] = useState('');
  const [valuationRate, setValuationRate] = useState('');
  const [endOfLife, setEndOfLife] = useState('31-12-2099');
  const [defaultMaterialRequestType, setDefaultMaterialRequestType] = useState('Purchase');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [weightPerUnit, setWeightPerUnit] = useState('');
  const [weightUom, setWeightUom] = useState('');
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [barcodes, setBarcodes] = useState<BarcodeRow[]>([]);
  const [isAutoReorderOpen, setIsAutoReorderOpen] = useState(true);
  const [autoReorderRows, setAutoReorderRows] = useState<AutoReorderRow[]>([]);
  const [isSerialNosBatchesOpen, setIsSerialNosBatchesOpen] = useState(true);
  const [hasBatchNo, setHasBatchNo] = useState(false);
  const [hasSerialNo, setHasSerialNo] = useState(false);

  // Purchasing tab state (Screenshots 3 & 4)
  const [defaultPurchaseUom, setDefaultPurchaseUom] = useState('');
  const [minimumOrderQty, setMinimumOrderQty] = useState('0.000');
  const [safetyStock, setSafetyStock] = useState('');
  const [leadTimeInDays, setLeadTimeInDays] = useState('');
  const [deliveredBySupplier, setDeliveredBySupplier] = useState(false);
  const [itemSuppliers, setItemSuppliers] = useState<ItemSupplierRow[]>([]);
  const [isForeignTradeOpen, setIsForeignTradeOpen] = useState(true);
  const [countryOfOrigin, setCountryOfOrigin] = useState('Azerbaijan');
  const [customsTariffNumber, setCustomsTariffNumber] = useState('');

  // Sales tab state (Screenshot 5)
  const [defaultSalesUom, setDefaultSalesUom] = useState('');
  const [grantCommission, setGrantCommission] = useState(true);
  const [maxDiscount, setMaxDiscount] = useState('');
  const [customerItems, setCustomerItems] = useState<CustomerItemRow[]>([]);

  // Manufacturing tab state (Screenshot 1)
  const [includeItemInManufacturing, setIncludeItemInManufacturing] = useState(true);
  const [isSubcontractedItem, setIsSubcontractedItem] = useState(false);
  const [productionCapacity, setProductionCapacity] = useState('');

  // Quality tab state (Screenshot 2)
  const [inspectionRequiredBeforePurchase, setInspectionRequiredBeforePurchase] = useState(false);
  const [inspectionRequiredBeforeDelivery, setInspectionRequiredBeforeDelivery] = useState(false);
  const [qualityInspectionTemplate, setQualityInspectionTemplate] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'accounting', label: 'Accounting' },
    { id: 'uom', label: 'UOM' },
    { id: 'tax', label: 'Tax' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'purchasing', label: 'Purchasing' },
    { id: 'sales', label: 'Sales' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'quality', label: 'Quality' },
  ];

  // Save handler
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemCode.trim()) {
      setActiveTab('details');
      alert('Please enter Item Code');
      return;
    }

    try {
      setIsSaving(true);
      await addItem({
        id: itemCode.trim(),
        itemCode: itemCode.trim(),
        itemName: itemName.trim() || itemCode.trim(),
        itemGroup: itemGroup.trim() || 'Products',
        uom: defaultUom.trim() || 'Nos',
        status: 'Enabled',
        itemType: maintainStock ? 'Stock' : 'Non-Stock',
        purpose: allowSales && allowPurchase ? 'Sales & Purchase' : allowSales ? 'Sales' : 'Purchase',
        maintainStock,
        isFixedAsset,
        hasVariants,
      });

      navigate('/item');
    } catch (err) {
      console.error('Failed to create item:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Row handlers for Accounting tab
  const handleAddDefaultRow = () => {
    setItemDefaults((prev) => [
      ...prev,
      {
        id: `def-${Date.now()}`,
        company: 'Avalon (Demo)',
        defaultWarehouse: 'Stores - AD',
        defaultPriceList: 'Standard Selling',
      },
    ]);
  };

  const handleRemoveDefaultRow = (id: string) => {
    setItemDefaults((prev) => prev.filter((r) => r.id !== id));
  };

  // Row handlers for UOM tab
  const handleAddUomRow = () => {
    setUomRows((prev) => [
      ...prev,
      {
        id: `uom-${Date.now()}`,
        uom: 'Box',
        conversionFactor: 12,
      },
    ]);
  };

  const handleRemoveUomRow = (id: string) => {
    setUomRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Row handlers for Tax tab
  const handleAddTaxRow = () => {
    setTaxRows((prev) => [
      ...prev,
      {
        id: `tax-${Date.now()}`,
        itemTaxTemplate: 'Standard Tax - 18%',
        taxCategory: 'Standard',
        validFrom: '2026-01-01',
        minNetRate: '0.00',
        maxNetRate: '0.00',
      },
    ]);
  };

  const handleRemoveTaxRow = (id: string) => {
    setTaxRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Row handlers for Inventory Barcodes
  const handleAddBarcodeRow = () => {
    setBarcodes((prev) => [
      ...prev,
      {
        id: `bar-${Date.now()}`,
        barcode: '',
        barcodeType: 'EAN',
        uom: defaultUom || 'Nos',
      },
    ]);
  };
  const handleRemoveBarcodeRow = (id: string) => {
    setBarcodes((prev) => prev.filter((r) => r.id !== id));
  };

  // Row handlers for Auto re-order
  const handleAddAutoReorderRow = () => {
    setAutoReorderRows((prev) => [
      ...prev,
      {
        id: `reorder-${Date.now()}`,
        requestFor: 'Stores - AD',
        checkAvailabilityInWarehouse: 'Stores - AD',
        reorderLevel: 10,
        reorderQty: 20,
        materialRequestType: 'Purchase',
      },
    ]);
  };
  const handleRemoveAutoReorderRow = (id: string) => {
    setAutoReorderRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Row handlers for Supplier Details
  const handleAddSupplierRow = () => {
    setItemSuppliers((prev) => [
      ...prev,
      {
        id: `sup-${Date.now()}`,
        supplier: '',
        supplierPartNumber: '',
      },
    ]);
  };
  const handleRemoveSupplierRow = (id: string) => {
    setItemSuppliers((prev) => prev.filter((r) => r.id !== id));
  };

  // Row handlers for Customer Details
  const handleAddCustomerItemRow = () => {
    setCustomerItems((prev) => [
      ...prev,
      {
        id: `cust-${Date.now()}`,
        customerName: '',
        customerGroup: 'All Customer Groups',
        refCode: '',
      },
    ]);
  };
  const handleRemoveCustomerItemRow = (id: string) => {
    setCustomerItems((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-xs overflow-hidden">
      {/* Top Tab Bar matching Screenshot 1 */}
      <div className="px-6 pt-3 border-b border-slate-200/80 dark:border-[#27272A]">
        <div className="flex items-center gap-7 overflow-x-auto select-none no-scrollbar text-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 font-normal transition-colors whitespace-nowrap relative ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-slate-900 dark:after:bg-white'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* ========================================================================= */}
        {/* TAB 1: DETAILS (Screenshots 1 & 2) */}
        {/* ========================================================================= */}
        {activeTab === 'details' && (
          <div className="p-6 space-y-6 text-xs animate-in fade-in duration-100">
            {/* Top 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Item Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Item Group <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemGroup}
                    onChange={(e) => setItemGroup(e.target.value)}
                    placeholder="e.g. Products, Demo Item Group, Consumable"
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Default Unit of Measure <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={defaultUom}
                    onChange={(e) => setDefaultUom(e.target.value)}
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={maintainStock}
                    onChange={(e) => setMaintainStock(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      Maintain Stock
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                      Altensor ERP will make a stock ledger entry for each transaction of this item. Keep unchecked for non-stock or service items.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none pt-2">
                  <input
                    type="checkbox"
                    checked={isFixedAsset}
                    onChange={(e) => setIsFixedAsset(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      Is Fixed Asset
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                      Enable if this item is a company asset like machinery or furniture.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Section: Item Attributes */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Item Attributes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                {/* Left check items */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowSales}
                      onChange={(e) => setAllowSales(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-800 dark:text-zinc-200">Allow Sales</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowAlternativeItem}
                      onChange={(e) => setAllowAlternativeItem(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-800 dark:text-zinc-200">Allow Alternative Item</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-800 dark:text-zinc-200">Has Variants</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                  </label>
                </div>

                {/* Right check items */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowPurchase}
                      onChange={(e) => setAllowPurchase(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-800 dark:text-zinc-200">Allow Purchase</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCustomerProvidedItem}
                      onChange={(e) => setIsCustomerProvidedItem(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-slate-800 dark:text-zinc-200">Is Customer Provided Item</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                  </label>
                </div>
              </div>
            </div>

            {/* Standard Selling Rate */}
            <div className="pt-2 max-w-md">
              <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                Standard Selling Rate
              </label>
              <input
                type="text"
                value={standardSellingRate}
                onChange={(e) => setStandardSellingRate(e.target.value)}
                placeholder="0.00"
                className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                Creates an Item Price automatically when the item is saved
              </p>
            </div>

            {/* Description Collapsible Section (Screenshot 2) */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <button
                type="button"
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white hover:text-slate-700 transition-colors"
              >
                <span>Description</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isDescriptionOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {isDescriptionOpen && (
                <div className="pt-4 space-y-4 animate-in fade-in duration-100">
                  {/* Brand */}
                  <div className="max-w-md">
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Apple, Dell, Nike"
                      className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                    />
                  </div>

                  {/* Description Rich Text Editor */}
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      Description
                    </label>
                    <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden bg-white dark:bg-[#18181B]">
                      {/* Rich Editor Toolbar matching Screenshot 2 */}
                      <div className="flex items-center flex-wrap gap-1 px-3 py-1.5 bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-600 dark:text-zinc-400 text-xs select-none">
                        <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-zinc-700">
                          <span className="text-[11.5px] cursor-pointer hover:text-slate-900 dark:hover:text-white">Normal</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>

                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded font-bold" title="Bold">
                          <Bold className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded italic" title="Italic">
                          <Italic className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded underline" title="Underline">
                          <Underline className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded line-through" title="Strikethrough">
                          <Strikethrough className="w-3.5 h-3.5 stroke-[2]" />
                        </button>

                        <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-700 mx-1" />

                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded" title="Quote">
                          <Quote className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded" title="Code">
                          <Code className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded" title="Link">
                          <LinkIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded" title="Image">
                          <ImageIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </button>

                        <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-700 mx-1" />

                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded" title="Bullet List">
                          <ListIcon className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded" title="Numbered List">
                          <ListOrdered className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                        <button type="button" className="p-1 hover:bg-slate-200/70 dark:hover:bg-[#27272A] rounded" title="Align Left">
                          <AlignLeft className="w-3.5 h-3.5 stroke-[2]" />
                        </button>

                        <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-zinc-700">
                          <TableIcon className="w-3.5 h-3.5 stroke-[1.75]" />
                          <span className="text-[11.5px] cursor-pointer hover:text-slate-900 dark:hover:text-white">Table</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>

                      {/* Textarea */}
                      <textarea
                        rows={8}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter item description..."
                        className="w-full p-4 bg-transparent text-slate-800 dark:text-zinc-200 outline-none text-xs resize-y"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ACCOUNTING (Screenshot 3) */}
        {/* ========================================================================= */}
        {activeTab === 'accounting' && (
          <div className="p-6 space-y-6 text-xs animate-in fade-in duration-100">
            {/* Section: Item Defaults */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Item Defaults
              </h3>
              <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                      <th className="py-2.5 px-3 w-8">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 w-16">
                        No.
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Company <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Default Warehouse
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Default Price List
                      </th>
                      <th className="py-2.5 px-3 w-10 text-right">
                        <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemDefaults.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-zinc-500">
                          No rows
                        </td>
                      </tr>
                    ) : (
                      itemDefaults.map((row, idx) => (
                        <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]/70">
                          <td className="py-2 px-3">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                          </td>
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.company}
                              onChange={(e) =>
                                setItemDefaults((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, company: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.defaultWarehouse}
                              onChange={(e) =>
                                setItemDefaults((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, defaultWarehouse: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.defaultPriceList}
                              onChange={(e) =>
                                setItemDefaults((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, defaultPriceList: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveDefaultRow(row.id)}
                              className="text-slate-400 hover:text-rose-500"
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
              <button
                type="button"
                onClick={handleAddDefaultRow}
                className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
              >
                Add row
              </button>
            </div>

            {/* Section: Deferred Accounting */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Deferred Accounting
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Enable Deferred Expense */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableDeferredExpense}
                      onChange={(e) => setEnableDeferredExpense(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        Enable Deferred Expense
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                        Income from this item will be recognized over a period of months instead of all at once. Eg: annual subscription paid upfront.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Enable Deferred Revenue */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableDeferredRevenue}
                      onChange={(e) => setEnableDeferredRevenue(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        Enable Deferred Revenue
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                        Expense for this item will be recognized over a period of months. Eg: prepaid insurance or annual software license
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: UOM (Screenshot 4) */}
        {/* ========================================================================= */}
        {activeTab === 'uom' && (
          <div className="p-6 space-y-4 text-xs animate-in fade-in duration-100">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                UOM Conversion Details
              </h3>
              <p className="text-slate-500 dark:text-zinc-400 text-[11.5px] mb-3">
                Define alternate units for this item. Eg: 1 Box = 12 Nos, set conversion factor as 12. (Will also apply for variants){' '}
                <a href="#learn" className="text-slate-800 dark:text-white font-medium hover:underline inline-flex items-center gap-0.5">
                  Learn more <span className="text-[10px]">→</span>
                </a>
              </p>

              <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                      <th className="py-2.5 px-3 w-8">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 w-16">
                        No.
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        UOM <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Conversion Factor
                      </th>
                      <th className="py-2.5 px-3 w-10 text-right">
                        <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {uomRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 dark:text-zinc-500">
                          No rows
                        </td>
                      </tr>
                    ) : (
                      uomRows.map((row, idx) => (
                        <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]/70">
                          <td className="py-2 px-3">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                          </td>
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.uom}
                              onChange={(e) =>
                                setUomRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, uom: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              value={row.conversionFactor}
                              onChange={(e) =>
                                setUomRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id
                                      ? { ...r, conversionFactor: Number(e.target.value) }
                                      : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveUomRow(row.id)}
                              className="text-slate-400 hover:text-rose-500"
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
              <button
                type="button"
                onClick={handleAddUomRow}
                className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
              >
                Add row
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: TAX (Screenshot 5) */}
        {/* ========================================================================= */}
        {activeTab === 'tax' && (
          <div className="p-6 space-y-6 text-xs animate-in fade-in duration-100">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Taxes
              </h3>
              <p className="text-slate-500 dark:text-zinc-400 text-[11.5px] mb-3">
                Will also apply for variants
              </p>

              <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                      <th className="py-2.5 px-3 w-8">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 w-16">
                        No.
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Item Tax Template <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Tax Category
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Valid From
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Minimum Net Rate
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Maximum Net Rate
                      </th>
                      <th className="py-2.5 px-3 w-10 text-right">
                        <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-zinc-500">
                          No rows
                        </td>
                      </tr>
                    ) : (
                      taxRows.map((row, idx) => (
                        <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]/70">
                          <td className="py-2 px-3">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                          </td>
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.itemTaxTemplate}
                              onChange={(e) =>
                                setTaxRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, itemTaxTemplate: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.taxCategory}
                              onChange={(e) =>
                                setTaxRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, taxCategory: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={row.validFrom}
                              onChange={(e) =>
                                setTaxRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, validFrom: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.minNetRate}
                              onChange={(e) =>
                                setTaxRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, minNetRate: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.maxNetRate}
                              onChange={(e) =>
                                setTaxRows((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, maxNetRate: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveTaxRow(row.id)}
                              className="text-slate-400 hover:text-rose-500"
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
              <button
                type="button"
                onClick={handleAddTaxRow}
                className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
              >
                Add row
              </button>
            </div>

            {/* Inputs below table: Purchase Tax & Sales Tax Withholding Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                  Purchase Tax Withholding Category
                </label>
                <input
                  type="text"
                  value={purchaseTaxWithholding}
                  onChange={(e) => setPurchaseTaxWithholding(e.target.value)}
                  className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                  Sales Tax Withholding Category
                </label>
                <input
                  type="text"
                  value={salesTaxWithholding}
                  onChange={(e) => setSalesTaxWithholding(e.target.value)}
                  className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INVENTORY (Screenshots 1 & 2) */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="p-6 space-y-6 text-xs animate-in fade-in duration-100">
            {/* Section: Inventory Valuation */}
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Inventory Valuation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center gap-1 text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    <span>Valuation Method</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                  </label>
                  <div className="relative">
                    <select
                      value={valuationMethod}
                      onChange={(e) => setValuationMethod(e.target.value)}
                      className="w-full h-8 pl-3 pr-8 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select Valuation Method</option>
                      <option value="FIFO">FIFO</option>
                      <option value="Moving Average">Moving Average</option>
                      <option value="LIFO">LIFO</option>
                    </select>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Valuation Rate
                  </label>
                  <input
                    type="text"
                    value={valuationRate}
                    onChange={(e) => setValuationRate(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Section: Inventory Settings */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                Inventory Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left column */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1 text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      <span>End of Life</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                    </label>
                    <input
                      type="text"
                      value={endOfLife}
                      onChange={(e) => setEndOfLife(e.target.value)}
                      className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      Default Material Request Type
                    </label>
                    <div className="relative">
                      <select
                        value={defaultMaterialRequestType}
                        onChange={(e) => setDefaultMaterialRequestType(e.target.value)}
                        className="w-full h-8 pl-3 pr-8 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors appearance-none cursor-pointer"
                      >
                        <option value="Purchase">Purchase</option>
                        <option value="Material Transfer">Material Transfer</option>
                        <option value="Material Issue">Material Issue</option>
                        <option value="Manufacture">Manufacture</option>
                        <option value="Customer Provided">Customer Provided</option>
                      </select>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      Warranty Period (in days)
                    </label>
                    <input
                      type="text"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                      className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      Weight Per Unit
                    </label>
                    <input
                      type="text"
                      value={weightPerUnit}
                      onChange={(e) => setWeightPerUnit(e.target.value)}
                      className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      Weight UOM
                    </label>
                    <input
                      type="text"
                      value={weightUom}
                      onChange={(e) => setWeightUom(e.target.value)}
                      className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                    />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowNegativeStock}
                        onChange={(e) => setAllowNegativeStock(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          Allow Negative Stock
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                          Allow stock to go below zero for this item, even if negative stock is disabled in Stock Settings.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Barcodes */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                Barcodes
              </h3>
              <p className="text-slate-500 dark:text-zinc-400 text-[11.5px] mb-3">
                Barcodes
              </p>

              <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                      <th className="py-2.5 px-3 w-8">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 w-16">
                        No.
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Barcode <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        Barcode Type
                      </th>
                      <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                        UOM
                      </th>
                      <th className="py-2.5 px-3 w-10 text-right">
                        <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {barcodes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-zinc-500">
                          No rows
                        </td>
                      </tr>
                    ) : (
                      barcodes.map((row, idx) => (
                        <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]/70">
                          <td className="py-2 px-3">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                          </td>
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.barcode}
                              onChange={(e) =>
                                setBarcodes((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, barcode: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.barcodeType}
                              onChange={(e) =>
                                setBarcodes((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, barcodeType: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.uom}
                              onChange={(e) =>
                                setBarcodes((prev) =>
                                  prev.map((r) =>
                                    r.id === row.id ? { ...r, uom: e.target.value } : r
                                  )
                                )
                              }
                              className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveBarcodeRow(row.id)}
                              className="text-slate-400 hover:text-rose-500"
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
              <button
                type="button"
                onClick={handleAddBarcodeRow}
                className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
              >
                Add row
              </button>
            </div>

            {/* Section: Auto re-order ⌵ (Screenshot 2) */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <button
                type="button"
                onClick={() => setIsAutoReorderOpen(!isAutoReorderOpen)}
                className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white hover:text-slate-700 transition-colors mb-1"
              >
                <span>Auto re-order</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isAutoReorderOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {isAutoReorderOpen && (
                <div className="pt-1 space-y-3 animate-in fade-in duration-100">
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-zinc-200 text-xs">
                      Reorder level based on Warehouse
                    </h4>
                    <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
                      Will also apply for variants unless overridden
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                          <th className="py-2.5 px-3 w-8">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                          </th>
                          <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 w-16">
                            No.
                          </th>
                          <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                            Request for <span className="text-rose-500">*</span>
                          </th>
                          <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                            Check Availability in Ware...
                          </th>
                          <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                            Re-order Level
                          </th>
                          <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                            Re-order Qty
                          </th>
                          <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                            Material Request T...
                          </th>
                          <th className="py-2.5 px-3 w-10 text-right">
                            <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {autoReorderRows.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-zinc-500">
                              No rows
                            </td>
                          </tr>
                        ) : (
                          autoReorderRows.map((row, idx) => (
                            <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]/70">
                              <td className="py-2 px-3">
                                <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                              </td>
                              <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={row.requestFor}
                                  onChange={(e) =>
                                    setAutoReorderRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id ? { ...r, requestFor: e.target.value } : r
                                      )
                                    )
                                  }
                                  className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={row.checkAvailabilityInWarehouse}
                                  onChange={(e) =>
                                    setAutoReorderRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, checkAvailabilityInWarehouse: e.target.value }
                                          : r
                                      )
                                    )
                                  }
                                  className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={row.reorderLevel}
                                  onChange={(e) =>
                                    setAutoReorderRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, reorderLevel: Number(e.target.value) }
                                          : r
                                      )
                                    )
                                  }
                                  className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={row.reorderQty}
                                  onChange={(e) =>
                                    setAutoReorderRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, reorderQty: Number(e.target.value) }
                                          : r
                                      )
                                    )
                                  }
                                  className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={row.materialRequestType}
                                  onChange={(e) =>
                                    setAutoReorderRows((prev) =>
                                      prev.map((r) =>
                                        r.id === row.id
                                          ? { ...r, materialRequestType: e.target.value }
                                          : r
                                      )
                                    )
                                  }
                                  className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                                />
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAutoReorderRow(row.id)}
                                  className="text-slate-400 hover:text-rose-500"
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
                  <button
                    type="button"
                    onClick={handleAddAutoReorderRow}
                    className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    Add row
                  </button>
                </div>
              )}
            </div>

            {/* Section: Serial Nos / Batches ⌵ (Screenshot 2) */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <button
                type="button"
                onClick={() => setIsSerialNosBatchesOpen(!isSerialNosBatchesOpen)}
                className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white hover:text-slate-700 transition-colors mb-2"
              >
                <span>Serial Nos / Batches</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isSerialNosBatchesOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {isSerialNosBatchesOpen && (
                <div className="space-y-4 pt-1 animate-in fade-in duration-100">
                  {/* Amber Alert Banner */}
                  <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl flex items-center gap-2.5 text-amber-800 dark:text-amber-200 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      To use Serial / Batch feature, enable{' '}
                      <strong>Activate Serial / Batch No for Item</strong> in{' '}
                      <a href="#settings" className="underline font-medium hover:text-amber-950 dark:hover:text-amber-100">
                        Stock Settings
                      </a>
                      .
                    </span>
                  </div>

                  {/* Two checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 dark:text-zinc-400">
                      <input
                        type="checkbox"
                        checked={hasBatchNo}
                        onChange={(e) => setHasBatchNo(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                      <span>Has Batch No</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 dark:text-zinc-400">
                      <input
                        type="checkbox"
                        checked={hasSerialNo}
                        onChange={(e) => setHasSerialNo(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                      <span>Has Serial No</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: PURCHASING (Screenshots 3 & 4) */}
        {/* ========================================================================= */}
        {activeTab === 'purchasing' && (
          <div className="p-6 space-y-6 text-xs animate-in fade-in duration-100">
            {/* Top 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Default Purchase Unit of Measure
                  </label>
                  <input
                    type="text"
                    value={defaultPurchaseUom}
                    onChange={(e) => setDefaultPurchaseUom(e.target.value)}
                    placeholder="e.g. Nos, Box"
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Minimum Order Qty
                  </label>
                  <input
                    type="text"
                    value={minimumOrderQty}
                    onChange={(e) => setMinimumOrderQty(e.target.value)}
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Minimum quantity should be as per Stock UOM
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Safety Stock
                  </label>
                  <input
                    type="text"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(e.target.value)}
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Minimum stock level to maintain as a buffer. Used to calculate recommended reorder level: Reorder Level = Safety Stock + (Average Daily Consumption × Lead Time).
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Lead Time in days
                  </label>
                  <input
                    type="text"
                    value={leadTimeInDays}
                    onChange={(e) => setLeadTimeInDays(e.target.value)}
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Average time taken by the supplier to deliver
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Supplier Details */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A] space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Supplier Details
              </h3>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deliveredBySupplier}
                  onChange={(e) => setDeliveredBySupplier(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    Delivered by Supplier (Drop Ship)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                    Enable for drop shipping - supplier delivers directly to the customer without passing through your warehouse.
                  </p>
                </div>
              </label>

              <div>
                <h4 className="font-medium text-slate-800 dark:text-zinc-200 text-xs mb-2">
                  Item Supplier
                </h4>
                <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                        <th className="py-2.5 px-3 w-8">
                          <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                        </th>
                        <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 w-16">
                          No.
                        </th>
                        <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                          Supplier <span className="text-rose-500">*</span>
                        </th>
                        <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                          Supplier Part Number
                        </th>
                        <th className="py-2.5 px-3 w-10 text-right">
                          <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemSuppliers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400 dark:text-zinc-500">
                            No rows
                          </td>
                        </tr>
                      ) : (
                        itemSuppliers.map((row, idx) => (
                          <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]/70">
                            <td className="py-2 px-3">
                              <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                            </td>
                            <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.supplier}
                                onChange={(e) =>
                                  setItemSuppliers((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, supplier: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.supplierPartNumber}
                                onChange={(e) =>
                                  setItemSuppliers((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id
                                        ? { ...r, supplierPartNumber: e.target.value }
                                        : r
                                    )
                                  )
                                }
                                className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveSupplierRow(row.id)}
                                className="text-slate-400 hover:text-rose-500"
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
                <button
                  type="button"
                  onClick={handleAddSupplierRow}
                  className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Add row
                </button>
              </div>
            </div>

            {/* Section: Foreign Trade Details ⌵ (Screenshot 4) */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
              <button
                type="button"
                onClick={() => setIsForeignTradeOpen(!isForeignTradeOpen)}
                className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white hover:text-slate-700 transition-colors mb-3"
              >
                <span>Foreign Trade Details</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isForeignTradeOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {isForeignTradeOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-1 animate-in fade-in duration-100">
                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      Country of Origin
                    </label>
                    <div className="flex items-center bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus-within:bg-white dark:focus-within:bg-[#18181B] rounded-lg border border-transparent focus-within:border-slate-300 dark:focus-within:border-[#2E2E33] overflow-hidden transition-colors">
                      <input
                        type="text"
                        value={countryOfOrigin}
                        onChange={(e) => setCountryOfOrigin(e.target.value)}
                        className="w-full h-8 pl-3 pr-2 bg-transparent text-slate-900 dark:text-white outline-none text-xs"
                      />
                      <span className="px-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer">
                        →
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                      Customs Tariff Number
                    </label>
                    <input
                      type="text"
                      value={customsTariffNumber}
                      onChange={(e) => setCustomsTariffNumber(e.target.value)}
                      className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SALES (Screenshot 5) */}
        {/* ========================================================================= */}
        {activeTab === 'sales' && (
          <div className="p-6 space-y-6 text-xs animate-in fade-in duration-100">
            {/* Top 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Default Sales Unit of Measure
                  </label>
                  <input
                    type="text"
                    value={defaultSalesUom}
                    onChange={(e) => setDefaultSalesUom(e.target.value)}
                    placeholder="e.g. Nos, Box"
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={grantCommission}
                      onChange={(e) => setGrantCommission(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      Grant Commission
                    </span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                  </label>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                    Max Discount (%)
                  </label>
                  <input
                    type="text"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Maximum discount % allowed when selling this item. Eg: if set to 20%, a discount greater than 20% cannot be applied in sales transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Customer Details */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#27272A] space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Customer Details
              </h3>

              <div>
                <h4 className="font-medium text-slate-800 dark:text-zinc-200 text-xs mb-2">
                  Customer Items
                </h4>
                <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200/80 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                        <th className="py-2.5 px-3 w-8">
                          <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                        </th>
                        <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300 w-16">
                          No.
                        </th>
                        <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                          Customer Name
                        </th>
                        <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                          Customer Group
                        </th>
                        <th className="py-2.5 px-3 font-medium text-slate-600 dark:text-zinc-300">
                          Ref Code <span className="text-rose-500">*</span>
                        </th>
                        <th className="py-2.5 px-3 w-10 text-right">
                          <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-zinc-500">
                            No rows
                          </td>
                        </tr>
                      ) : (
                        customerItems.map((row, idx) => (
                          <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]/70">
                            <td className="py-2 px-3">
                              <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                            </td>
                            <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.customerName}
                                onChange={(e) =>
                                  setCustomerItems((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, customerName: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.customerGroup}
                                onChange={(e) =>
                                  setCustomerItems((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, customerGroup: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={row.refCode}
                                onChange={(e) =>
                                  setCustomerItems((prev) =>
                                    prev.map((r) =>
                                      r.id === row.id ? { ...r, refCode: e.target.value } : r
                                    )
                                  )
                                }
                                className="w-full h-7 px-2 bg-transparent text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomerItemRow(row.id)}
                                className="text-slate-400 hover:text-rose-500"
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
                <button
                  type="button"
                  onClick={handleAddCustomerItemRow}
                  className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Add row
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: MANUFACTURING */}
        {/* ========================================================================= */}
        {activeTab === 'manufacturing' && (
          <div className="p-6 space-y-6 text-xs animate-in fade-in duration-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column */}
              <div className="space-y-5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeItemInManufacturing}
                    onChange={(e) => setIncludeItemInManufacturing(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      Include Item In Manufacturing
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                      Enable for raw material items used in BOM. Uncheck for additional services like &apos;washing&apos; used in manufacturing.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSubcontractedItem}
                    onChange={(e) => setIsSubcontractedItem(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      Is Subcontracted Item
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                      Enable if a vendor manufactures this item for you. You can choose to provide them raw materials using the default BOM.
                    </p>
                  </div>
                </label>
              </div>

              {/* Right Column */}
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                  Production Capacity
                </label>
                <input
                  type="text"
                  value={productionCapacity}
                  onChange={(e) => setProductionCapacity(e.target.value)}
                  className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: QUALITY */}
        {/* ========================================================================= */}
        {activeTab === 'quality' && (
          <div className="p-6 space-y-6 text-xs animate-in fade-in duration-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inspectionRequiredBeforePurchase}
                    onChange={(e) => setInspectionRequiredBeforePurchase(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="text-slate-800 dark:text-zinc-200 font-normal">
                    Inspection Required before Purchase
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inspectionRequiredBeforeDelivery}
                    onChange={(e) => setInspectionRequiredBeforeDelivery(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                  <span className="text-slate-800 dark:text-zinc-200 font-normal">
                    Inspection Required before Delivery
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                </label>
              </div>

              {/* Right Column */}
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                  Quality Inspection Template
                </label>
                <input
                  type="text"
                  value={qualityInspectionTemplate}
                  onChange={(e) => setQualityInspectionTemplate(e.target.value)}
                  className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hidden submit button triggered by Header Save button */}
        <button type="submit" className="hidden" aria-hidden="true" />
      </form>
    </div>
  );
};

export default NewItemForm;

