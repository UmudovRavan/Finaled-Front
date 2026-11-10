import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Settings,
  Edit2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Image,
  List,
  ListOrdered,
  AlignLeft,
  Quote,
  Table as TableIcon,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useItem } from '../context';
import type { ItemRecord } from '../types';
import { ItemDetailSidebar } from '../components/item/ItemDetailSidebar';

type DetailTabType =
  | 'details'
  | 'accounting'
  | 'uom'
  | 'tax'
  | 'inventory'
  | 'purchasing'
  | 'sales'
  | 'manufacturing'
  | 'quality'
  | 'pricing'
  | 'connections';

interface ItemDefaultRow {
  id: string;
  company: string;
  defaultWarehouse: string;
  defaultPriceList: string;
}

interface UomRow {
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

interface ReorderRow {
  id: string;
  requestFor: string;
  warehouse: string;
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

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { items, toggleLike } = useItem();

  const foundItem = items.find((i) => i.id === id || i.itemCode === id);
  const currentItem: ItemRecord = foundItem || {
    id: id || 'adad',
    itemCode: id || 'adad',
    itemName: id || 'adad',
    status: 'Enabled',
    itemGroup: 'Products',
    uom: 'Nos',
    itemType: 'Stock',
    purpose: 'Sales & Purchase',
    maintainStock: true,
    isFixedAsset: false,
    hasVariants: false,
    createdOn: new Date().toISOString(),
    lastUpdatedOn: new Date().toISOString(),
    timeAgoText: '10 hours ago',
    commentsCount: 0,
    isLiked: false,
  };

  // Determine active tab from hash or default to 'details'
  const [activeTab, setActiveTab] = useState<DetailTabType>('details');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'details') setActiveTab('details');
    else if (hash === 'accounting') setActiveTab('accounting');
    else if (hash === 'uom_tab' || hash === 'uom') setActiveTab('uom');
    else if (hash === 'item_tax_section_break' || hash === 'tax') setActiveTab('tax');
    else if (hash === 'inventory_section' || hash === 'inventory') setActiveTab('inventory');
    else if (hash === 'purchasing_tab' || hash === 'purchasing') setActiveTab('purchasing');
    else if (hash === 'sales_details' || hash === 'sales_tab' || hash === 'sales') setActiveTab('sales');
    else if (hash === 'manufacturing') setActiveTab('manufacturing');
    else if (hash === 'quality_tab' || hash === 'quality') setActiveTab('quality');
    else if (hash === 'pricing_tab' || hash === 'pricing') setActiveTab('pricing');
    else if (hash === 'connections') setActiveTab('connections');
  }, [location.hash]);

  // Form Fields - Details Tab (Screenshots 1 & 2)
  const [itemName, setItemName] = useState(currentItem.itemName || 'adad');
  const [itemGroup, setItemGroup] = useState(currentItem.itemGroup || 'Products');
  const [defaultUom, setDefaultUom] = useState(currentItem.uom || 'Nos');
  const [disabled, setDisabled] = useState(currentItem.status === 'Disabled');
  const [maintainStock, setMaintainStock] = useState(currentItem.maintainStock ?? true);
  const [isFixedAsset, setIsFixedAsset] = useState(currentItem.isFixedAsset ?? false);

  const [allowSales, setAllowSales] = useState(true);
  const [allowPurchase, setAllowPurchase] = useState(true);
  const [allowAlternativeItem, setAllowAlternativeItem] = useState(false);
  const [isCustomerProvidedItem, setIsCustomerProvidedItem] = useState(false);
  const [hasVariants, setHasVariants] = useState(currentItem.hasVariants ?? false);

  const [overDeliveryAllowance, setOverDeliveryAllowance] = useState('0.000');
  const [overBillingAllowance, setOverBillingAllowance] = useState('0.000');

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [brand, setBrand] = useState('');
  const [descriptionText, setDescriptionText] = useState('');

  // Accounting Tab (Screenshot 3)
  const [itemDefaults, setItemDefaults] = useState<ItemDefaultRow[]>([]);
  const [enableDeferredExpense, setEnableDeferredExpense] = useState(false);
  const [enableDeferredRevenue, setEnableDeferredRevenue] = useState(false);

  // UOM Tab (Screenshot 4)
  const [uomRows, setUomRows] = useState<UomRow[]>([
    { id: 'uom-1', uom: 'Nos', conversionFactor: 1 },
  ]);

  // Tax Tab (Screenshot 5)
  const [taxRows, setTaxRows] = useState<TaxRow[]>([]);
  const [purchaseTaxWithholding, setPurchaseTaxWithholding] = useState('');
  const [salesTaxWithholding, setSalesTaxWithholding] = useState('');

  // Inventory Tab (Screenshots 1, 2, 3)
  const [valuationMethod, setValuationMethod] = useState('');
  const [valuationRate, setValuationRate] = useState('0.00');
  const [endOfLife, setEndOfLife] = useState('31-12-2099');
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [defaultMaterialRequestType, setDefaultMaterialRequestType] = useState('Purchase');
  const [weightPerUnit, setWeightPerUnit] = useState('0.000');
  const [weightUom, setWeightUom] = useState('');
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [barcodes, setBarcodes] = useState<BarcodeRow[]>([]);
  const [isAutoReorderOpen, setIsAutoReorderOpen] = useState(true);
  const [reorderRows, setReorderRows] = useState<ReorderRow[]>([]);
  const [isSerialBatchOpen, setIsSerialBatchOpen] = useState(true);
  const [hasBatchNo, setHasBatchNo] = useState(false);
  const [hasSerialNo, setHasSerialNo] = useState(false);

  // Purchasing Tab (Screenshots 4 & 5)
  const [defaultPurchaseUom, setDefaultPurchaseUom] = useState('');
  const [minimumOrderQty, setMinimumOrderQty] = useState('0.000');
  const [safetyStock, setSafetyStock] = useState('0.000');
  const [leadTimeInDays, setLeadTimeInDays] = useState('0');
  const [lastPurchaseRate, setLastPurchaseRate] = useState('0');
  const [deliveredBySupplier, setDeliveredBySupplier] = useState(false);
  const [itemSuppliers, setItemSuppliers] = useState<ItemSupplierRow[]>([]);
  const [isForeignTradeOpen, setIsForeignTradeOpen] = useState(true);
  const [countryOfOrigin, setCountryOfOrigin] = useState('Azerbaijan');
  const [customsTariffNumber, setCustomsTariffNumber] = useState('');

  // Sales Tab (Screenshot 1)
  const [defaultSalesUom, setDefaultSalesUom] = useState('');
  const [grantCommission, setGrantCommission] = useState(true);
  const [maxDiscount, setMaxDiscount] = useState('0.000');
  const [customerItems, setCustomerItems] = useState<CustomerItemRow[]>([]);

  // Manufacturing Tab (Screenshot 2)
  const [includeItemInManufacturing, setIncludeItemInManufacturing] = useState(true);
  const [isSubcontractedItem, setIsSubcontractedItem] = useState(false);
  const [productionCapacity, setProductionCapacity] = useState('0');

  // Quality Tab (Screenshot 3)
  const [inspectionRequiredBeforePurchase, setInspectionRequiredBeforePurchase] = useState(false);
  const [inspectionRequiredBeforeDelivery, setInspectionRequiredBeforeDelivery] = useState(false);
  const [qualityInspectionTemplate, setQualityInspectionTemplate] = useState('');

  // Connections Tab (Screenshots 1, 2, 3)
  const [isActivityHeatmapOpen, setIsActivityHeatmapOpen] = useState(true);

  // Comments & Activity
  const [comments, setComments] = useState<
    { id: string; author: string; text: string; time: string }[]
  >([]);
  const [commentInput, setCommentInput] = useState('');

  const handleAddComment = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentInput.trim()) {
      setComments((prev) => [
        ...prev,
        {
          id: `c-${Date.now()}`,
          author: 'Administrator',
          text: commentInput.trim(),
          time: 'Just now',
        },
      ]);
      setCommentInput('');
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    alert('Item updated successfully');
  };

  const tabs: { id: DetailTabType; label: string; hash: string }[] = [
    { id: 'details', label: 'Details', hash: '#details' },
    { id: 'accounting', label: 'Accounting', hash: '#accounting' },
    { id: 'uom', label: 'UOM', hash: '#uom_tab' },
    { id: 'tax', label: 'Tax', hash: '#item_tax_section_break' },
    { id: 'inventory', label: 'Inventory', hash: '#inventory_section' },
    { id: 'purchasing', label: 'Purchasing', hash: '#purchasing_tab' },
    { id: 'sales', label: 'Sales', hash: '#sales_details' },
    { id: 'manufacturing', label: 'Manufacturing', hash: '#manufacturing' },
    { id: 'quality', label: 'Quality', hash: '#quality_tab' },
    { id: 'pricing', label: 'Pricing', hash: '#pricing_tab' },
    { id: 'connections', label: 'Connections', hash: '#connections' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-xs">
      {/* Main Container Card */}
      <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Tab Navigation Header (Screenshot 1) */}
            <div className="border-b border-slate-200 dark:border-[#27272A] overflow-x-auto no-scrollbar">
              <nav className="flex items-center gap-6 text-xs whitespace-nowrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      navigate(tab.hash, { replace: true });
                    }}
                    className={`pb-2.5 font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* TAB CONTENT */}
            <form onSubmit={handleSave} className="space-y-6">
              {/* ========================================================================= */}
              {/* TAB 1: DETAILS (Screenshots 1 & 2) */}
              {/* ========================================================================= */}
              {activeTab === 'details' && (
                <div className="space-y-6 animate-in fade-in duration-100">
                  {/* Top 2 Columns Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left Column */}
                    <div className="space-y-4">
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
                          value={itemGroup}
                          onChange={(e) => setItemGroup(e.target.value)}
                          className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                          Default Unit of Measure <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={defaultUom}
                          onChange={(e) => setDefaultUom(e.target.value)}
                          className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={disabled}
                          onChange={(e) => setDisabled(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                        />
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          Disabled
                        </span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                      </label>

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

                      <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
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
                      {/* Left */}
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
                          <span className="text-slate-800 dark:text-zinc-200">
                            Allow Alternative Item
                          </span>
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

                      {/* Right */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={allowPurchase}
                            onChange={(e) => setAllowPurchase(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                          />
                          <span className="text-slate-800 dark:text-zinc-200">
                            Allow Purchase
                          </span>
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isCustomerProvidedItem}
                            onChange={(e) => setIsCustomerProvidedItem(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                          />
                          <span className="text-slate-800 dark:text-zinc-200">
                            Is Customer Provided Item
                          </span>
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Over Delivery / Over Billing Section (Screenshot 1) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                        Over Delivery/Receipt Allowance (%)
                      </label>
                      <input
                        type="text"
                        value={overDeliveryAllowance}
                        onChange={(e) => setOverDeliveryAllowance(e.target.value)}
                        className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                      />
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 leading-relaxed font-normal">
                        Percentage by which over-delivery or over-receipt is allowed against a Sales/Purchase Order for this item. If not set, value from Stock Settings will be used.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                        Over Billing Allowance (%)
                      </label>
                      <input
                        type="text"
                        value={overBillingAllowance}
                        onChange={(e) => setOverBillingAllowance(e.target.value)}
                        className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                      />
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 leading-relaxed font-normal">
                        Percentage by which over-billing is allowed against a Sales/Purchase Order for this item. If not set, value from Accounts Settings will be used.
                      </p>
                    </div>
                  </div>

                  {/* Collapsible: Description (Screenshot 2) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      {isDescriptionOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <span>Description</span>
                    </button>

                    {isDescriptionOpen && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                            Brand
                          </label>
                          <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                          />
                        </div>

                        {/* Rich Text Editor Toolbar */}
                        <div className="space-y-1">
                          <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1">
                            Description
                          </label>
                          <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden bg-white dark:bg-[#18181B]">
                            <div className="flex flex-wrap items-center gap-1 p-2 bg-[#F9FAFB] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-600 dark:text-zinc-400">
                              <select className="bg-transparent border border-slate-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs outline-none">
                                <option>Normal</option>
                                <option>Heading 1</option>
                                <option>Heading 2</option>
                              </select>
                              <div className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1" />
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <Bold className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <Italic className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <Underline className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <Strikethrough className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1" />
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <Quote className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <Code className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <Link className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <Image className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-px h-4 bg-slate-300 dark:bg-zinc-700 mx-1" />
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <List className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <ListOrdered className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <AlignLeft className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded">
                                <TableIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows={4}
                              value={descriptionText}
                              onChange={(e) => setDescriptionText(e.target.value)}
                              placeholder="Enter item description..."
                              className="w-full p-3 bg-transparent text-slate-800 dark:text-zinc-200 text-xs outline-none resize-y"
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
                <div className="space-y-6 animate-in fade-in duration-100">
                  {/* Item Defaults */}
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Item Defaults
                    </h3>
                    <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#F8F9FA] dark:bg-[#1E1E22] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                          <tr>
                            <th className="w-10 py-2.5 px-3">
                              <input type="checkbox" className="rounded border-slate-300" />
                            </th>
                            <th className="w-12 py-2.5 px-3 font-normal">No.</th>
                            <th className="py-2.5 px-3 font-normal">Company *</th>
                            <th className="py-2.5 px-3 font-normal">Default Warehouse</th>
                            <th className="py-2.5 px-3 font-normal">Default Price List</th>
                            <th className="w-10 py-2.5 px-3 text-right">
                              <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemDefaults.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                                No rows
                              </td>
                            </tr>
                          ) : (
                            itemDefaults.map((row, index) => (
                              <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]">
                                <td className="py-2.5 px-3">
                                  <input type="checkbox" className="rounded" />
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">{index + 1}</td>
                                <td className="py-2.5 px-3">{row.company}</td>
                                <td className="py-2.5 px-3">{row.defaultWarehouse}</td>
                                <td className="py-2.5 px-3">{row.defaultPriceList}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setItemDefaults((p) => p.filter((r) => r.id !== row.id))}
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
                      onClick={() =>
                        setItemDefaults((p) => [
                          ...p,
                          {
                            id: `def-${Date.now()}`,
                            company: 'Avalon (Demo)',
                            defaultWarehouse: 'Stores - AD',
                            defaultPriceList: 'Standard Selling',
                          },
                        ])
                      }
                      className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      Add row
                    </button>
                  </div>

                  {/* Deferred Accounting (Screenshot 3) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Deferred Accounting
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={enableDeferredExpense}
                          onChange={(e) => setEnableDeferredExpense(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-800 dark:text-zinc-200">
                            Enable Deferred Expense
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed font-normal">
                            Income from this item will be recognized over a period of months instead of all at once. Eg: annual subscription paid upfront.
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={enableDeferredRevenue}
                          onChange={(e) => setEnableDeferredRevenue(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-800 dark:text-zinc-200">
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
              )}

              {/* ========================================================================= */}
              {/* TAB 3: UOM (Screenshot 4) */}
              {/* ========================================================================= */}
              {activeTab === 'uom' && (
                <div className="space-y-6 animate-in fade-in duration-100">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      UOM Conversion Details
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mb-3">
                      Define alternate units for this item. Eg: 1 Box = 12 Nos, set conversion factor as 12. (Will also apply for variants){' '}
                      <span className="text-slate-800 dark:text-zinc-200 underline cursor-pointer hover:text-slate-900 inline-flex items-center gap-0.5">
                        Learn more →
                      </span>
                    </p>

                    <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#F8F9FA] dark:bg-[#1E1E22] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                          <tr>
                            <th className="w-10 py-2.5 px-3">
                              <input type="checkbox" className="rounded border-slate-300" />
                            </th>
                            <th className="w-12 py-2.5 px-3 font-normal">No.</th>
                            <th className="py-2.5 px-3 font-normal">UOM *</th>
                            <th className="py-2.5 px-3 font-normal">Conversion Factor</th>
                            <th className="w-10 py-2.5 px-3 text-right">
                              <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uomRows.map((row, index) => (
                            <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]">
                              <td className="py-2.5 px-3">
                                <input type="checkbox" className="rounded" />
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">{index + 1}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-zinc-200">
                                {row.uom}
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 dark:text-zinc-300">
                                {row.conversionFactor}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button type="button" className="text-slate-400 hover:text-slate-700">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setUomRows((p) => [
                          ...p,
                          { id: `uom-${Date.now()}`, uom: 'Box', conversionFactor: 12 },
                        ])
                      }
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
                <div className="space-y-6 animate-in fade-in duration-100">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      Taxes
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-3">
                      Will also apply for variants
                    </p>

                    <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#F8F9FA] dark:bg-[#1E1E22] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                          <tr>
                            <th className="w-10 py-2.5 px-3">
                              <input type="checkbox" className="rounded border-slate-300" />
                            </th>
                            <th className="w-12 py-2.5 px-3 font-normal">No.</th>
                            <th className="py-2.5 px-3 font-normal">Item Tax Template *</th>
                            <th className="py-2.5 px-3 font-normal">Tax Category</th>
                            <th className="py-2.5 px-3 font-normal">Valid From</th>
                            <th className="py-2.5 px-3 font-normal">Minimum Net Rate</th>
                            <th className="py-2.5 px-3 font-normal">Maximum Net Rate</th>
                            <th className="w-10 py-2.5 px-3 text-right">
                              <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxRows.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                                No rows
                              </td>
                            </tr>
                          ) : (
                            taxRows.map((row, index) => (
                              <tr key={row.id} className="border-b border-slate-100 dark:border-[#27272A]">
                                <td className="py-2.5 px-3">
                                  <input type="checkbox" className="rounded" />
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">{index + 1}</td>
                                <td className="py-2.5 px-3">{row.itemTaxTemplate}</td>
                                <td className="py-2.5 px-3">{row.taxCategory}</td>
                                <td className="py-2.5 px-3">{row.validFrom}</td>
                                <td className="py-2.5 px-3">{row.minNetRate}</td>
                                <td className="py-2.5 px-3">{row.maxNetRate}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setTaxRows((p) => p.filter((r) => r.id !== row.id))}
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
                      onClick={() =>
                        setTaxRows((p) => [
                          ...p,
                          {
                            id: `tax-${Date.now()}`,
                            itemTaxTemplate: 'VAT 18%',
                            taxCategory: 'Standard',
                            validFrom: '2026-01-01',
                            minNetRate: '0.00',
                            maxNetRate: '0.00',
                          },
                        ])
                      }
                      className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      Add row
                    </button>
                  </div>

                  {/* Withholding Categories */}
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
              {/* TAB 5: INVENTORY (Screenshots 1, 2, 3) */}
              {/* ========================================================================= */}
              {activeTab === 'inventory' && (
                <div className="space-y-6 animate-in fade-in duration-100">
                  {/* Stock Levels (Screenshot 1) */}
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Stock Levels
                    </h3>
                    <div className="py-8 text-center text-slate-500 dark:text-zinc-400 text-xs font-normal">
                      No Stock Available Currently
                    </div>
                  </div>

                  {/* Inventory Valuation */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Inventory Valuation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      <div>
                        <label className="flex items-center gap-1 text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                          <span>Valuation Method</span>
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                        </label>
                        <select
                          value={valuationMethod}
                          onChange={(e) => setValuationMethod(e.target.value)}
                          className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                        >
                          <option value=""></option>
                          <option value="FIFO">FIFO</option>
                          <option value="Moving Average">Moving Average</option>
                          <option value="LIFO">LIFO</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                          Valuation Rate
                        </label>
                        <input
                          type="text"
                          value={valuationRate}
                          onChange={(e) => setValuationRate(e.target.value)}
                          className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inventory Settings */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                      Inventory Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Left Column */}
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
                          <select
                            value={defaultMaterialRequestType}
                            onChange={(e) => setDefaultMaterialRequestType(e.target.value)}
                            className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                          >
                            <option value="Purchase">Purchase</option>
                            <option value="Material Transfer">Material Transfer</option>
                            <option value="Material Issue">Material Issue</option>
                            <option value="Manufacture">Manufacture</option>
                            <option value="Customer Provided">Customer Provided</option>
                          </select>
                        </div>
                      </div>

                      {/* Right Column */}
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

                        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
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

                  {/* Barcodes (Screenshot 2) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Barcodes
                    </h3>
                    <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-2">
                      Barcodes
                    </label>
                    <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#F8F9FA] dark:bg-[#1E1E22] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                          <tr>
                            <th className="w-10 py-2.5 px-3">
                              <input type="checkbox" className="rounded border-slate-300" />
                            </th>
                            <th className="w-12 py-2.5 px-3 font-normal">No.</th>
                            <th className="py-2.5 px-3 font-normal">Barcode *</th>
                            <th className="py-2.5 px-3 font-normal">Barcode Type</th>
                            <th className="py-2.5 px-3 font-normal">UOM</th>
                            <th className="w-10 py-2.5 px-3 text-right">
                              <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {barcodes.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                                No rows
                              </td>
                            </tr>
                          ) : (
                            barcodes.map((b, idx) => (
                              <tr key={b.id} className="border-b border-slate-100 dark:border-[#27272A]">
                                <td className="py-2.5 px-3">
                                  <input type="checkbox" className="rounded" />
                                </td>
                                <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                                <td className="py-2.5 px-3">{b.barcode}</td>
                                <td className="py-2.5 px-3">{b.barcodeType}</td>
                                <td className="py-2.5 px-3">{b.uom}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setBarcodes((p) => p.filter((r) => r.id !== b.id))}
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
                      onClick={() =>
                        setBarcodes((p) => [
                          ...p,
                          {
                            id: `bc-${Date.now()}`,
                            barcode: '',
                            barcodeType: 'EAN',
                            uom: 'Nos',
                          },
                        ])
                      }
                      className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                    >
                      Add row
                    </button>
                  </div>

                  {/* Auto re-order Collapsible (Screenshot 2) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => setIsAutoReorderOpen(!isAutoReorderOpen)}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      {isAutoReorderOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <span>Auto re-order</span>
                    </button>

                    {isAutoReorderOpen && (
                      <div className="mt-3 space-y-3">
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 space-y-0.5">
                          <div>Reorder level based on Warehouse</div>
                          <div>Will also apply for variants unless overridden</div>
                        </div>

                        <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-[#F8F9FA] dark:bg-[#1E1E22] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                              <tr>
                                <th className="w-10 py-2.5 px-3">
                                  <input type="checkbox" className="rounded border-slate-300" />
                                </th>
                                <th className="w-12 py-2.5 px-3 font-normal">No.</th>
                                <th className="py-2.5 px-3 font-normal">Request for *</th>
                                <th className="py-2.5 px-3 font-normal">Check Availability in Ware...</th>
                                <th className="py-2.5 px-3 font-normal">Re-order Level</th>
                                <th className="py-2.5 px-3 font-normal">Re-order Qty</th>
                                <th className="py-2.5 px-3 font-normal">Material Request T...</th>
                                <th className="w-10 py-2.5 px-3 text-right">
                                  <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {reorderRows.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                                    No rows
                                  </td>
                                </tr>
                              ) : (
                                reorderRows.map((r, idx) => (
                                  <tr key={r.id} className="border-b border-slate-100 dark:border-[#27272A]">
                                    <td className="py-2.5 px-3">
                                      <input type="checkbox" className="rounded" />
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                                    <td className="py-2.5 px-3">{r.requestFor}</td>
                                    <td className="py-2.5 px-3">{r.warehouse}</td>
                                    <td className="py-2.5 px-3">{r.reorderLevel}</td>
                                    <td className="py-2.5 px-3">{r.reorderQty}</td>
                                    <td className="py-2.5 px-3">{r.materialRequestType}</td>
                                    <td className="py-2.5 px-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => setReorderRows((p) => p.filter((row) => row.id !== r.id))}
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
                          onClick={() =>
                            setReorderRows((p) => [
                              ...p,
                              {
                                id: `re-${Date.now()}`,
                                requestFor: 'Stores - AD',
                                warehouse: 'Stores - AD',
                                reorderLevel: 10,
                                reorderQty: 50,
                                materialRequestType: 'Purchase',
                              },
                            ])
                          }
                          className="px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          Add row
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Serial Nos / Batches Collapsible (Screenshot 2 & 3) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => setIsSerialBatchOpen(!isSerialBatchOpen)}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      {isSerialBatchOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <span>Serial Nos / Batches</span>
                    </button>

                    {isSerialBatchOpen && (
                      <div className="mt-3 space-y-4">
                        {/* Amber Alert Banner */}
                        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-[#FEF9EE] dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs">
                          <span className="text-amber-600 dark:text-amber-400 font-semibold text-sm">⚠️</span>
                          <span>
                            To use Serial / Batch feature, enable{' '}
                            <span className="font-semibold underline cursor-pointer">
                              Activate Serial / Batch No for Item in Stock Settings
                            </span>
                            .
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={hasBatchNo}
                              onChange={(e) => setHasBatchNo(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                            />
                            <span className="text-slate-800 dark:text-zinc-200">Has Batch No</span>
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={hasSerialNo}
                              onChange={(e) => setHasSerialNo(e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                            />
                            <span className="text-slate-800 dark:text-zinc-200">Has Serial No</span>
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 stroke-[1.75]" />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 6: PURCHASING (Screenshots 4 & 5) */}
              {/* ========================================================================= */}
              {activeTab === 'purchasing' && (
                <div className="space-y-6 animate-in fade-in duration-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 font-normal">
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
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 leading-relaxed font-normal">
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
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 font-normal">
                          Average time taken by the supplier to deliver
                        </p>
                      </div>

                      <div>
                        <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                          Last Purchase Rate
                        </label>
                        <input
                          type="text"
                          value={lastPurchaseRate}
                          onChange={(e) => setLastPurchaseRate(e.target.value)}
                          className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                        />
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 leading-relaxed font-normal">
                          The rate at which this item was last purchased via a Purchase Invoice. Auto-updated by the system.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Details (Screenshot 4) */}
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
                      <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-2">
                        Item Supplier
                      </label>
                      <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-[#F8F9FA] dark:bg-[#1E1E22] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                            <tr>
                              <th className="w-10 py-2.5 px-3">
                                <input type="checkbox" className="rounded border-slate-300" />
                              </th>
                              <th className="w-12 py-2.5 px-3 font-normal">No.</th>
                              <th className="py-2.5 px-3 font-normal">Supplier *</th>
                              <th className="py-2.5 px-3 font-normal">Supplier Part Number</th>
                              <th className="w-10 py-2.5 px-3 text-right">
                                <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemSuppliers.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                                  No rows
                                </td>
                              </tr>
                            ) : (
                              itemSuppliers.map((s, idx) => (
                                <tr key={s.id} className="border-b border-slate-100 dark:border-[#27272A]">
                                  <td className="py-2.5 px-3">
                                    <input type="checkbox" className="rounded" />
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                                  <td className="py-2.5 px-3">{s.supplier}</td>
                                  <td className="py-2.5 px-3">{s.supplierPartNumber}</td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setItemSuppliers((p) => p.filter((row) => row.id !== s.id))}
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
                        onClick={() =>
                          setItemSuppliers((p) => [
                            ...p,
                            {
                              id: `sup-${Date.now()}`,
                              supplier: 'Zuckerman Security',
                              supplierPartNumber: 'PART-001',
                            },
                          ])
                        }
                        className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Add row
                      </button>
                    </div>
                  </div>

                  {/* Foreign Trade Details Collapsible (Screenshot 5) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => setIsForeignTradeOpen(!isForeignTradeOpen)}
                      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      {isForeignTradeOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <span>Foreign Trade Details</span>
                    </button>

                    {isForeignTradeOpen && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div>
                          <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-1.5">
                            Country of Origin
                          </label>
                          <input
                            type="text"
                            value={countryOfOrigin}
                            onChange={(e) => setCountryOfOrigin(e.target.value)}
                            className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                          />
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
              {/* TAB 7: SALES (Screenshot 1) */}
              {/* ========================================================================= */}
              {activeTab === 'sales' && (
                <div className="space-y-6 animate-in fade-in duration-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                          className="w-full h-8 px-3 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
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

                    {/* Right Column */}
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
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5 leading-relaxed font-normal">
                        Maximum discount % allowed when selling this item. Eg: if set to 20%, a discount greater than 20% cannot be applied in sales transactions.
                      </p>
                    </div>
                  </div>

                  {/* Customer Details (Screenshot 1) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-[#27272A] space-y-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Customer Details
                    </h3>

                    <div>
                      <label className="block text-slate-700 dark:text-zinc-300 font-medium mb-2">
                        Customer Items
                      </label>
                      <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-[#F8F9FA] dark:bg-[#1E1E22] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                            <tr>
                              <th className="w-10 py-2.5 px-3">
                                <input type="checkbox" className="rounded border-slate-300" />
                              </th>
                              <th className="w-12 py-2.5 px-3 font-normal">No.</th>
                              <th className="py-2.5 px-3 font-normal">Customer Name</th>
                              <th className="py-2.5 px-3 font-normal">Customer Group</th>
                              <th className="py-2.5 px-3 font-normal">Ref Code *</th>
                              <th className="w-10 py-2.5 px-3 text-right">
                                <Settings className="w-3.5 h-3.5 text-slate-400 inline" />
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerItems.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                                  No rows
                                </td>
                              </tr>
                            ) : (
                              customerItems.map((c, idx) => (
                                <tr key={c.id} className="border-b border-slate-100 dark:border-[#27272A]">
                                  <td className="py-2.5 px-3">
                                    <input type="checkbox" className="rounded" />
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                                  <td className="py-2.5 px-3">{c.customerName}</td>
                                  <td className="py-2.5 px-3">{c.customerGroup}</td>
                                  <td className="py-2.5 px-3">{c.refCode}</td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setCustomerItems((p) => p.filter((row) => row.id !== c.id))}
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
                        onClick={() =>
                          setCustomerItems((p) => [
                            ...p,
                            {
                              id: `cust-${Date.now()}`,
                              customerName: '',
                              customerGroup: '',
                              refCode: '',
                            },
                          ])
                        }
                        className="mt-2.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Add row
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 8: MANUFACTURING (Screenshot 2) */}
              {/* ========================================================================= */}
              {activeTab === 'manufacturing' && (
                <div className="space-y-6 animate-in fade-in duration-100">
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
              {/* TAB 9: QUALITY (Screenshot 3) */}
              {/* ========================================================================= */}
              {activeTab === 'quality' && (
                <div className="space-y-6 animate-in fade-in duration-100">
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

              {/* ========================================================================= */}
              {/* TAB 10: PRICING (Screenshot 4) */}
              {/* ========================================================================= */}
              {activeTab === 'pricing' && (
                <div className="space-y-6 animate-in fade-in duration-100">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Item Prices
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
                      All active prices for this item across buying and selling price lists.
                    </p>
                  </div>

                  <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl p-12 text-center bg-white dark:bg-[#18181B] space-y-3">
                    <div className="text-slate-500 dark:text-zinc-400 text-xs font-normal">
                      No active item prices found.
                    </div>
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                        <span>Add Price</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 11: CONNECTIONS (Screenshots 1, 2, 3) */}
              {/* ========================================================================= */}
              {activeTab === 'connections' && (
                <div className="space-y-6 animate-in fade-in duration-100">
                  {/* Activity Heatmap Collapsible (Screenshot 1) */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsActivityHeatmapOpen(!isActivityHeatmapOpen)}
                      className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                    >
                      <span>Activity</span>
                      {isActivityHeatmapOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    {isActivityHeatmapOpen && (
                      <div className="pt-2 pb-1 space-y-3">
                        {/* Heatmap Matrix */}
                        <div className="overflow-x-auto no-scrollbar py-2">
                          <div className="inline-block min-w-[620px]">
                            {/* Months Header */}
                            <div className="flex justify-between pl-8 pr-2 text-[10px] text-slate-400 dark:text-zinc-500 mb-1.5 select-none font-medium">
                              <span>NOV</span>
                              <span>DEC</span>
                              <span>JAN</span>
                              <span>FEB</span>
                              <span>MAR</span>
                              <span>APR</span>
                              <span>MAY</span>
                              <span>JUN</span>
                              <span>JUL</span>
                              <span>AUG</span>
                              <span>SEP</span>
                              <span>OCT</span>
                              <span>NOV</span>
                            </div>

                            {/* Days & Cells Grid */}
                            <div className="flex items-start gap-2">
                              {/* Days on left */}
                              <div className="flex flex-col justify-between text-[10px] text-slate-400 dark:text-zinc-500 h-[72px] select-none pt-0.5 font-medium">
                                <span>Mon</span>
                                <span>Wed</span>
                                <span>Fri</span>
                              </div>

                              {/* 52 Columns of 7 Squares */}
                              <div className="grid grid-flow-col grid-rows-7 gap-1">
                                {Array.from({ length: 52 * 7 }).map((_, i) => (
                                  <div
                                    key={i}
                                    title="0 stock movements"
                                    className="w-2.5 h-2.5 rounded-[2px] bg-[#EBECEF] dark:bg-[#27272A] hover:bg-slate-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Subtitle */}
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal">
                          This is based on stock movement. See{' '}
                          <span
                            onClick={() => navigate('/stock-ledger')}
                            className="text-slate-800 dark:text-zinc-200 underline cursor-pointer hover:text-slate-900 font-medium"
                          >
                            Stock Ledger
                          </span>{' '}
                          for details
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 3-Column Connections Categories Grid (Screenshots 1, 2, 3) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-[#27272A]">
                    {/* Column 1: Groups, Buy, Stock Movement */}
                    <div className="space-y-6">
                      {/* Groups */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2.5">
                          Groups
                        </h4>
                        <div className="space-y-2">
                          {['BOM', 'Product Bundle', 'Item Alternative'].map((title) => (
                            <div
                              key={title}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
                            >
                              <span className="text-slate-700 dark:text-zinc-300 text-xs font-normal">
                                {title}
                              </span>
                              <button
                                type="button"
                                className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Buy */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2.5">
                          Buy
                        </h4>
                        <div className="space-y-2">
                          {[
                            'Material Request',
                            'Supplier Quotation',
                            'Request for Quotation',
                            'Purchase Order',
                            'Purchase Receipt',
                            'Purchase Invoice',
                          ].map((title) => (
                            <div
                              key={title}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
                            >
                              <span className="text-slate-700 dark:text-zinc-300 text-xs font-normal">
                                {title}
                              </span>
                              <button
                                type="button"
                                className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stock Movement */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2.5">
                          Stock Movement
                        </h4>
                        <div className="space-y-2">
                          {['Stock Entry', 'Stock Reconciliation'].map((title) => (
                            <div
                              key={title}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
                            >
                              <span className="text-slate-700 dark:text-zinc-300 text-xs font-normal">
                                {title}
                              </span>
                              <button
                                type="button"
                                className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Pricing, Manufacture, Lead Time */}
                    <div className="space-y-6">
                      {/* Pricing */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2.5">
                          Pricing
                        </h4>
                        <div className="space-y-2">
                          {['Item Price', 'Pricing Rule'].map((title) => (
                            <div
                              key={title}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
                            >
                              <span className="text-slate-700 dark:text-zinc-300 text-xs font-normal">
                                {title}
                              </span>
                              <button
                                type="button"
                                className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Manufacture */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2.5">
                          Manufacture
                        </h4>
                        <div className="space-y-2">
                          {['Production Plan', 'Work Order', 'Item Manufacturer'].map((title) => (
                            <div
                              key={title}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
                            >
                              <span className="text-slate-700 dark:text-zinc-300 text-xs font-normal">
                                {title}
                              </span>
                              <button
                                type="button"
                                className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Lead Time */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2.5">
                          Lead Time
                        </h4>
                        <div className="space-y-2">
                          {['Item Lead Time'].map((title) => (
                            <div
                              key={title}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
                            >
                              <span className="text-slate-700 dark:text-zinc-300 text-xs font-normal">
                                {title}
                              </span>
                              <button
                                type="button"
                                className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Sell, Traceability */}
                    <div className="space-y-6">
                      {/* Sell */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2.5">
                          Sell
                        </h4>
                        <div className="space-y-2">
                          {['Quotation', 'Sales Order', 'Delivery Note', 'Sales Invoice'].map((title) => (
                            <div
                              key={title}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
                            >
                              <span className="text-slate-700 dark:text-zinc-300 text-xs font-normal">
                                {title}
                              </span>
                              <button
                                type="button"
                                className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Traceability */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-xs mb-2.5">
                          Traceability
                        </h4>
                        <div className="space-y-2">
                          {['Serial No', 'Batch'].map((title) => (
                            <div
                              key={title}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/90 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] hover:bg-slate-50 dark:hover:bg-[#202024] cursor-pointer transition-colors"
                            >
                              <span className="text-slate-700 dark:text-zinc-300 text-xs font-normal">
                                {title}
                              </span>
                              <button
                                type="button"
                                className="w-5 h-5 rounded hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SHARED BOTTOM SECTIONS: COMMENTS & ACTIVITY (Screenshots 2, 3, 4, 5) */}
              {/* ========================================================================= */}
              <div className="pt-8 border-t border-slate-200 dark:border-[#27272A] space-y-6">
                {/* Comments Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    Comments
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center shrink-0">
                      A
                    </div>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={handleAddComment}
                        placeholder="Type a reply / comment"
                        className="w-full h-8 px-3 pr-8 bg-[#F4F5F7] dark:bg-[#202024] hover:bg-[#EBEEF2] dark:hover:bg-[#27272A] focus:bg-white dark:focus:bg-[#18181B] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs transition-colors"
                      />
                      {commentInput.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            if (commentInput.trim()) {
                              setComments((p) => [
                                ...p,
                                {
                                  id: `c-${Date.now()}`,
                                  author: 'Administrator',
                                  text: commentInput.trim(),
                                  time: 'Just now',
                                },
                              ]);
                              setCommentInput('');
                            }
                          }}
                          className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List of comments if any */}
                  {comments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {comments.map((c) => (
                        <div key={c.id} className="p-3 bg-[#F8F9FA] dark:bg-[#202024] rounded-lg">
                          <div className="flex items-center justify-between font-medium text-[11px] text-slate-700 dark:text-zinc-300">
                            <span>{c.author}</span>
                            <span className="text-slate-400 font-normal">{c.time}</span>
                          </div>
                          <p className="mt-1 text-slate-800 dark:text-zinc-200">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#27272A]">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Activity
                    </h4>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-[#202024] hover:bg-slate-200 dark:hover:bg-[#27272A] rounded-lg transition-colors"
                    >
                      + New Email
                    </button>
                  </div>

                  <div className="space-y-3 pl-2 border-l-2 border-slate-200 dark:border-zinc-800 text-[11.5px] text-slate-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[13px]" />
                      <span>
                        You created this · <span className="font-medium">10 hours ago</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-600 -ml-[13px]" />
                      <span>
                        You last edited this · <span className="font-medium">10 hours ago</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hidden submit trigger */}
              <button type="submit" className="hidden" aria-hidden="true" />
            </form>
          </div>

          {/* Right Sidebar (Screenshots 1-5) */}
          <ItemDetailSidebar
            item={currentItem}
            onToggleLike={() => toggleLike(currentItem.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;

