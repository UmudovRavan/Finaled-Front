import React, { useState, useEffect, useRef } from 'react';
import { stockService } from '../api';
import {
  Info,
  Heart,
  Users,
  Paperclip,
  Share2,
  Plus,
  Mail,
  ChevronUp,
  ChevronDown,
  Pencil,
  ChevronsUpDown,
  Check,
  X,
} from 'lucide-react';

type TabId =
  | 'defaults'
  | 'stock-validations'
  | 'serial-batch'
  | 'stock-reservation'
  | 'quality'
  | 'stock-planning'
  | 'stock-closing'
  | 'document-naming';

interface NamingRow {
  id: string;
  transaction: string;
  series: string;
  options: string[];
}

interface CommentItem {
  id: string;
  author: string;
  initial: string;
  text: string;
  time: string;
}

const INITIAL_NAMING_ROWS: NamingRow[] = [
  {
    id: 'stock-entry',
    transaction: 'Stock Entry',
    series: 'MAT-STE-.YYYY.-',
    options: ['MAT-STE-.YYYY.-', 'STE-.YYYY.-.#####'],
  },
  {
    id: 'purchase-receipt',
    transaction: 'Purchase Receipt',
    series: 'MAT-PRE-.YYYY.-',
    options: ['MAT-PRE-.YYYY.-', 'MAT-PR-RET-.YYYY.-'],
  },
  {
    id: 'delivery-note',
    transaction: 'Delivery Note',
    series: 'MAT-DN-.YYYY.-',
    options: ['MAT-DN-.YYYY.-', 'MAT-DN-RET-.YYYY.-'],
  },
  {
    id: 'material-request',
    transaction: 'Material Request',
    series: 'MAT-MR-.YYYY.-',
    options: ['MAT-MR-.YYYY.-', 'MR-.YYYY.-.#####'],
  },
  {
    id: 'pick-list',
    transaction: 'Pick List',
    series: 'STO-PICK-.YYYY.-',
    options: ['STO-PICK-.YYYY.-', 'PICK-.YYYY.-.#####'],
  },
  {
    id: 'stock-reconciliation',
    transaction: 'Stock Reconciliation',
    series: 'MAT-RECO-.YYYY.-',
    options: ['MAT-RECO-.YYYY.-', 'RECO-.YYYY.-.#####'],
  },
  {
    id: 'serial-batch-bundle',
    transaction: 'Serial and Batch Bundle',
    series: 'SABB-.YYYY.-',
    options: ['SABB-.YYYY.-', 'SABB-.#####'],
  },
];

const TABS: { id: TabId; label: string }[] = [
  { id: 'defaults', label: 'Defaults' },
  { id: 'stock-validations', label: 'Stock Validations' },
  { id: 'serial-batch', label: 'Serial & Batch Item' },
  { id: 'stock-reservation', label: 'Stock Reservation' },
  { id: 'quality', label: 'Quality' },
  { id: 'stock-planning', label: 'Stock Planning' },
  { id: 'stock-closing', label: 'Stock Closing' },
  { id: 'document-naming', label: 'Document Naming' },
];

const InfoIcon: React.FC<{ title?: string }> = ({ title }) => (
  <span
    title={title}
    className="inline-flex items-center justify-center text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-[#A1A1AA] cursor-help ml-1 align-middle"
  >
    <Info className="w-3.5 h-3.5" />
  </span>
);

const CheckboxField: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  info?: string;
  helperText?: string;
}> = ({ checked, onChange, label, info, helperText }) => (
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
        {info && <InfoIcon title={info} />}
      </span>
    </label>
    {helperText && (
      <p className="pl-[22px] text-[12px] text-[#687178] dark:text-[#A1A1AA] leading-[1.45]">
        {helperText}
      </p>
    )}
  </div>
);

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  info?: string;
  helperText?: string;
}> = ({ label, value, onChange, options, required, info, helperText }) => (
  <div className="space-y-1.5">
    <label className="block text-[12px] font-medium text-[#525A61] dark:text-[#A1A1AA]">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {info && <InfoIcon title={info} />}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] focus:bg-white dark:focus:bg-[#18181B] px-3 py-1.5 pr-8 text-[13px] text-[#1F272E] dark:text-[#F4F4F5] outline-none transition-colors cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-[#71717A] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
    </div>
    {helperText && (
      <p className="text-[12px] text-[#687178] dark:text-[#A1A1AA] leading-[1.4]">
        {helperText}
      </p>
    )}
  </div>
);

const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  info?: string;
  helperText?: string;
  type?: 'text' | 'date';
}> = ({ label, value, onChange, placeholder, info, helperText, type = 'text' }) => (
  <div className="space-y-1.5">
    <label className="block text-[12px] font-medium text-[#525A61] dark:text-[#A1A1AA]">
      {label}
      {info && <InfoIcon title={info} />}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md bg-[#F3F3F3] dark:bg-[#1F1F23] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] focus:bg-white dark:focus:bg-[#18181B] px-3 py-1.5 text-[13px] text-[#1F272E] dark:text-[#F4F4F5] placeholder:text-slate-400 dark:placeholder:text-[#71717A] outline-none transition-colors"
    />
    {helperText && (
      <p className="text-[12px] text-[#687178] dark:text-[#A1A1AA] leading-[1.4]">
        {helperText}
      </p>
    )}
  </div>
);

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('defaults');
  const [liked, setLiked] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Defaults Tab
  const [itemNamingBy, setItemNamingBy] = useState('Item Code');
  const [defaultItemGroup, setDefaultItemGroup] = useState('');
  const [defaultValuationMethod, setDefaultValuationMethod] = useState('FIFO');
  const [autoInsertItemPrice, setAutoInsertItemPrice] = useState(true);
  const [updateExistingPriceListRate, setUpdateExistingPriceListRate] = useState(false);
  const [updatePriceListBasedOn, setUpdatePriceListBasedOn] = useState('Rate');
  const [defaultStockUom, setDefaultStockUom] = useState('Nos');
  const [allowEditUomSales, setAllowEditUomSales] = useState(false);
  const [allowEditUomPurchase, setAllowEditUomPurchase] = useState(false);
  const [allowEditUomStockEntry, setAllowEditUomStockEntry] = useState(false);
  const [allowUomWithConversionRate, setAllowUomWithConversionRate] = useState(false);
  const [defaultWarehouse, setDefaultWarehouse] = useState('');
  const [sampleRetentionWarehouse, setSampleRetentionWarehouse] = useState('');

  // Stock Validations Tab
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [overDeliveryAllowance, setOverDeliveryAllowance] = useState('0.000');
  const [overTransferAllowance, setOverTransferAllowance] = useState('0.000');
  const [overPickingAllowance, setOverPickingAllowance] = useState('0.000');
  const [showBarcodeField, setShowBarcodeField] = useState(true);
  const [convertItemDescToHtml, setConvertItemDescToHtml] = useState(true);
  const [allowInternalTransfersUserRate, setAllowInternalTransfersUserRate] = useState(false);
  const [validateMaterialTransferWarehouses, setValidateMaterialTransferWarehouses] = useState(false);

  // Serial & Batch Item Tab
  const [activateSerialBatchForItem, setActivateSerialBatchForItem] = useState(true);
  const [pickSerialBatchBasedOn, setPickSerialBatchBasedOn] = useState('FIFO');
  const [allowExistingSerialManufacturedAgain, setAllowExistingSerialManufacturedAgain] = useState(true);
  const [useSerialBatchFields, setUseSerialBatchFields] = useState(true);
  const [disableSerialBatchSelector, setDisableSerialBatchSelector] = useState(false);
  const [allowNegativeStockForBatch, setAllowNegativeStockForBatch] = useState(false);
  const [doNotUseBatchWiseValuation, setDoNotUseBatchWiseValuation] = useState(false);
  const [haveDefaultNamingSeriesForBatch, setHaveDefaultNamingSeriesForBatch] = useState(false);
  const [autoCreateBundleOutward, setAutoCreateBundleOutward] = useState(true);
  const [doNotUpdateSerialBatchOnAutoBundle, setDoNotUpdateSerialBatchOnAutoBundle] = useState(true);
  const [setBundleNamingBasedOnSeries, setSetBundleNamingBasedOnSeries] = useState(false);

  // Stock Reservation Tab
  const [enableStockReservation, setEnableStockReservation] = useState(false);
  const [autoReserveStock, setAutoReserveStock] = useState(false);

  // Quality Tab
  const [allowQiAfterPurchaseDelivery, setAllowQiAfterPurchaseDelivery] = useState(false);
  const [actionIfQiRejected, setActionIfQiRejected] = useState('Stop');
  const [actionIfQiNotSubmitted, setActionIfQiNotSubmitted] = useState('Stop');

  // Stock Planning Tab
  const [raiseMrOnReorder, setRaiseMrOnReorder] = useState(true);
  const [notifyEmailOnAutoMr, setNotifyEmailOnAutoMr] = useState(false);

  // Stock Closing Tab
  const [freezeStocksOlderThanDays, setFreezeStocksOlderThanDays] = useState('0');
  const [stockFrozenUpTo, setStockFrozenUpTo] = useState('');
  const [roleAllowedBackdated, setRoleAllowedBackdated] = useState('');

  // Document Naming Tab
  const [namingRows, setNamingRows] = useState<NamingRow[]>(INITIAL_NAMING_ROWS);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingSeriesValue, setEditingSeriesValue] = useState('');

  // Comments & Activity
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [activityExpanded, setActivityExpanded] = useState(false);

  const settingsIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    stockService
      .getStockSettings()
      .then((dto) => {
        if (!dto) return;
        settingsIdRef.current = dto.id;
        setItemNamingBy(dto.itemNamingBy === 'NamingSeries' ? 'Naming Series' : 'Item Code');
        setDefaultValuationMethod(
          dto.defaultValuationMethod === 'MovingAverage'
            ? 'Moving Average'
            : dto.defaultValuationMethod || 'FIFO'
        );
        setAutoInsertItemPrice(Boolean(dto.autoInsertPriceListRateIfMissing));
        setAllowEditUomSales(Boolean(dto.allowEditStockUomQtyForSalesDocuments));
        setAllowEditUomPurchase(Boolean(dto.allowEditStockUomQtyForPurchaseDocuments));
        setAllowNegativeStock(Boolean(dto.allowNegativeStock));
        setOverDeliveryAllowance(String(dto.overDeliveryReceiptAllowancePercent ?? '0.000'));
        setShowBarcodeField(Boolean(dto.showBarcodeFieldInStockTransactions));
        setConvertItemDescToHtml(Boolean(dto.convertItemDescriptionToCleanHtml));
        setUseSerialBatchFields(Boolean(dto.useSerialBatchFields));
        setAutoCreateBundleOutward(Boolean(dto.autoCreateSerialAndBatchBundleForOutward));
        setActionIfQiRejected(dto.actionIfQualityInspectionIsRejected || 'Stop');
        setActionIfQiNotSubmitted(dto.actionIfQualityInspectionIsNotSubmitted || 'Stop');
        setRaiseMrOnReorder(Boolean(dto.autoMaterialRequestOnReorderLevel));
        setNotifyEmailOnAutoMr(Boolean(dto.notifyByEmailOnCreationOfAutomaticMaterialRequest));
        setFreezeStocksOlderThanDays(String(dto.freezeStocksOlderThanDays ?? 0));
        setStockFrozenUpTo(dto.stockFrozenUpto ? String(dto.stockFrozenUpto).slice(0, 10) : '');
        setRoleAllowedBackdated(dto.roleAllowedToEditFrozenStock || '');
      })
      .catch((err) => console.error('Failed to load Stock Settings', err));
  }, []);

  useEffect(() => {
    const handleSave = async () => {
      try {
        await stockService.updateStockSettings({
          id: settingsIdRef.current,
          itemNamingBy: itemNamingBy === 'Naming Series' ? 'NamingSeries' : 'ItemCode',
          defaultValuationMethod:
            defaultValuationMethod === 'Moving Average' ? 'MovingAverage' : defaultValuationMethod,
          autoInsertPriceListRateIfMissing: autoInsertItemPrice,
          allowEditStockUomQtyForSalesDocuments: allowEditUomSales,
          allowEditStockUomQtyForPurchaseDocuments: allowEditUomPurchase,
          allowNegativeStock,
          overDeliveryReceiptAllowancePercent: Number(overDeliveryAllowance || 0),
          showBarcodeFieldInStockTransactions: showBarcodeField,
          convertItemDescriptionToCleanHtml: convertItemDescToHtml,
          useSerialBatchFields,
          autoCreateSerialAndBatchBundleForOutward: autoCreateBundleOutward,
          actionIfQualityInspectionIsRejected: actionIfQiRejected,
          actionIfQualityInspectionIsNotSubmitted: actionIfQiNotSubmitted,
          autoMaterialRequestOnReorderLevel: raiseMrOnReorder,
          notifyByEmailOnCreationOfAutomaticMaterialRequest: notifyEmailOnAutoMr,
          freezeStocksOlderThanDays: Number(freezeStocksOlderThanDays || 0),
          stockFrozenUpto: stockFrozenUpTo ? new Date(stockFrozenUpTo).toISOString() : null,
          roleAllowedToEditFrozenStock: roleAllowedBackdated || null,
        });
        setSaveToast('Saved');
      } catch (err) {
        console.error('Failed to save Stock Settings', err);
        setSaveToast('Error saving');
      } finally {
        setTimeout(() => setSaveToast(null), 2500);
      }
    };
    window.addEventListener('stock-settings-save', handleSave);
    return () => window.removeEventListener('stock-settings-save', handleSave);
  }, [
    itemNamingBy,
    defaultValuationMethod,
    autoInsertItemPrice,
    allowEditUomSales,
    allowEditUomPurchase,
    allowNegativeStock,
    overDeliveryAllowance,
    showBarcodeField,
    convertItemDescToHtml,
    useSerialBatchFields,
    autoCreateBundleOutward,
    actionIfQiRejected,
    actionIfQiNotSubmitted,
    raiseMrOnReorder,
    notifyEmailOnAutoMr,
    freezeStocksOlderThanDays,
    stockFrozenUpTo,
    roleAllowedBackdated,
  ]);

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentInput.trim()) {
      e.preventDefault();
      setComments((prev) => [
        {
          id: String(Date.now()),
          author: 'You',
          initial: 'A',
          text: commentInput.trim(),
          time: 'Just now',
        },
        ...prev,
      ]);
      setCommentInput('');
    }
  };

  const startEditNamingRow = (row: NamingRow) => {
    setEditingRowId(row.id);
    setEditingSeriesValue(row.series);
  };

  const saveEditNamingRow = (id: string) => {
    if (!editingSeriesValue.trim()) {
      setEditingRowId(null);
      return;
    }
    setNamingRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, series: editingSeriesValue.trim() } : row
      )
    );
    setEditingRowId(null);
  };

  return (
    <div className="min-h-full bg-white dark:bg-[#111113] text-[#1F272E] dark:text-[#F4F4F5]">
      {saveToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-[#171717] dark:bg-white text-white dark:text-[#171717] px-3.5 py-2 text-[13px] font-medium shadow-lg">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Stock Settings {saveToast}</span>
        </div>
      )}

      {/* Main 2-column Frappe Desk Layout */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-52px)]">
        {/* Left Main Content Area */}
        <div className="flex-1 min-w-0 border-r border-slate-200 dark:border-[#27272A]">
          {/* Horizontal Tabs Bar */}
          <div className="border-b border-slate-200 dark:border-[#27272A] px-5 overflow-x-auto">
            <nav className="flex items-center gap-6 min-w-max">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-3 text-[13px] transition-colors whitespace-nowrap ${
                      isActive
                        ? 'font-semibold text-[#1F272E] dark:text-white'
                        : 'font-normal text-[#525A61] dark:text-[#A1A1AA] hover:text-[#1F272E] dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717] dark:bg-white rounded-t" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="divide-y divide-slate-200/80 dark:divide-[#27272A]">
            {activeTab === 'defaults' && (
              <>
                {/* Item Defaults */}
                <section className="px-6 py-5">
                  <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                    Item Defaults
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <SelectField
                      label="Item Naming By"
                      value={itemNamingBy}
                      onChange={setItemNamingBy}
                      options={['Item Code', 'Naming Series', 'Item Name']}
                    />
                    <div className="space-y-4">
                      <InputField
                        label="Default Item Group"
                        value={defaultItemGroup}
                        onChange={setDefaultItemGroup}
                        info="Default Item Group for new Items"
                      />
                      <SelectField
                        label="Default Valuation Method"
                        value={defaultValuationMethod}
                        onChange={setDefaultValuationMethod}
                        options={['FIFO', 'Moving Average', 'LIFO']}
                        info="Default valuation method for stock transactions"
                      />
                    </div>
                  </div>
                </section>

                {/* Price List Defaults */}
                <section className="px-6 py-5">
                  <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                    Price List Defaults
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div className="space-y-4">
                      <CheckboxField
                        checked={autoInsertItemPrice}
                        onChange={setAutoInsertItemPrice}
                        label="Auto insert Item Price if missing"
                        info="Automatically create Item Price if not found in Price List"
                      />
                      <CheckboxField
                        checked={updateExistingPriceListRate}
                        onChange={setUpdateExistingPriceListRate}
                        label="Update existing Price List Rate"
                      />
                      <SelectField
                        label="Update Price List based on"
                        required
                        value={updatePriceListBasedOn}
                        onChange={setUpdatePriceListBasedOn}
                        options={['Rate', 'Price List Rate']}
                      />
                    </div>
                  </div>
                </section>

                {/* UOM Defaults */}
                <section className="px-6 py-5">
                  <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                    UOM Defaults
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div className="space-y-4">
                      <InputField
                        label="Default Stock UOM"
                        value={defaultStockUom}
                        onChange={setDefaultStockUom}
                      />
                      <CheckboxField
                        checked={allowEditUomSales}
                        onChange={setAllowEditUomSales}
                        label="Allow to edit stock UOM qty for Sales documents"
                        info="Allow editing Stock UOM quantity in Sales Orders, Delivery Notes, and Sales Invoices"
                      />
                      <CheckboxField
                        checked={allowEditUomPurchase}
                        onChange={setAllowEditUomPurchase}
                        label="Allow to edit stock UOM qty for Purchase documents"
                        info="Allow editing Stock UOM quantity in Purchase Orders, Purchase Receipts, and Purchase Invoices"
                      />
                      <CheckboxField
                        checked={allowEditUomStockEntry}
                        onChange={setAllowEditUomStockEntry}
                        label="Allow to edit stock UOM qty for Stock Entry"
                        info="Allow editing Stock UOM quantity in Stock Entry"
                      />
                      <CheckboxField
                        checked={allowUomWithConversionRate}
                        onChange={setAllowUomWithConversionRate}
                        label="Allow UOM with conversion rate defined in Item"
                        helperText="If enabled, the system will allow selecting UOMs in sales and purchase transactions only if the conversion rate is set in the item master."
                      />
                    </div>
                  </div>
                </section>

                {/* Warehouse Defaults */}
                <section className="px-6 py-5">
                  <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                    Warehouse Defaults
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div className="space-y-4">
                      <InputField
                        label="Default Warehouse"
                        value={defaultWarehouse}
                        onChange={setDefaultWarehouse}
                      />
                      <InputField
                        label="Sample Retention Warehouse"
                        value={sampleRetentionWarehouse}
                        onChange={setSampleRetentionWarehouse}
                        info="Warehouse used to store sample items for quality retention"
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeTab === 'stock-validations' && (
              <>
                <section className="px-6 py-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <CheckboxField
                        checked={allowNegativeStock}
                        onChange={setAllowNegativeStock}
                        label="Allow negative stock"
                        info="Allow stock balance to go below zero"
                      />
                    </div>
                    <div className="space-y-4">
                      <InputField
                        label="Over Delivery/Receipt Allowance (%)"
                        value={overDeliveryAllowance}
                        onChange={setOverDeliveryAllowance}
                        helperText="The percentage you are allowed to receive or deliver more against the quantity ordered. For example, if you have ordered 100 units, and your Allowance is 10%, then you are allowed to receive 110 units."
                      />
                      <InputField
                        label="Over Transfer Allowance (%)"
                        value={overTransferAllowance}
                        onChange={setOverTransferAllowance}
                        helperText="Percentage you are allowed to transfer more against the quantity ordered."
                      />
                      <InputField
                        label="Over Picking Allowance (%)"
                        value={overPickingAllowance}
                        onChange={setOverPickingAllowance}
                        helperText="Percentage you are allowed to pick more against the quantity ordered."
                      />
                    </div>
                  </div>
                </section>

                <section className="px-6 py-5 space-y-4">
                  <CheckboxField
                    checked={showBarcodeField}
                    onChange={setShowBarcodeField}
                    label="Show barcode field in stock transactions"
                  />
                  <CheckboxField
                    checked={convertItemDescToHtml}
                    onChange={setConvertItemDescToHtml}
                    label="Convert Item description to clean HTML in transactions"
                  />
                  <CheckboxField
                    checked={allowInternalTransfersUserRate}
                    onChange={setAllowInternalTransfersUserRate}
                    label="Allow internal transfers at user-defined rate"
                    helperText="If enabled, users can specify custom rates for internal transfers rather than using the item's valuation rate."
                  />
                  <CheckboxField
                    checked={validateMaterialTransferWarehouses}
                    onChange={setValidateMaterialTransferWarehouses}
                    label="Validate Material Transfer warehouses"
                    helperText="If enabled, the system will enforce that the source and target warehouses differ during a Material Transfer"
                  />
                </section>
              </>
            )}

            {activeTab === 'serial-batch' && (
              <>
                <section className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-4">
                      <CheckboxField
                        checked={activateSerialBatchForItem}
                        onChange={setActivateSerialBatchForItem}
                        label="Activate Serial / Batch No for Item"
                      />
                      <SelectField
                        label="Pick Serial / Batch Based On"
                        required
                        value={pickSerialBatchBasedOn}
                        onChange={setPickSerialBatchBasedOn}
                        options={['FIFO', 'LIFO', 'Expiry']}
                      />
                      <CheckboxField
                        checked={allowExistingSerialManufacturedAgain}
                        onChange={setAllowExistingSerialManufacturedAgain}
                        label="Allow existing Serial No to be Manufactured/Received again"
                      />
                      <CheckboxField
                        checked={useSerialBatchFields}
                        onChange={setUseSerialBatchFields}
                        label="Use Serial / Batch fields"
                        helperText="If enabled, the system will use the legacy Serial No / Batch No fields in the stock transactions instead of the Serial and Batch Bundle."
                      />
                      <CheckboxField
                        checked={disableSerialBatchSelector}
                        onChange={setDisableSerialBatchSelector}
                        label="Disable Serial No and Batch selector"
                      />
                    </div>
                  </div>
                </section>

                <section className="px-6 py-5">
                  <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                    Batch Settings
                  </h2>
                  <div className="space-y-4">
                    <CheckboxField
                      checked={allowNegativeStockForBatch}
                      onChange={setAllowNegativeStockForBatch}
                      label="Allow negative stock for Batch"
                    />
                    <CheckboxField
                      checked={doNotUseBatchWiseValuation}
                      onChange={setDoNotUseBatchWiseValuation}
                      label="Do not use Batch-wise Valuation"
                      helperText="If enabled, valuation rate will not be calculated based on batch"
                    />
                    <CheckboxField
                      checked={haveDefaultNamingSeriesForBatch}
                      onChange={setHaveDefaultNamingSeriesForBatch}
                      label="Have default Naming Series for Batch ID?"
                    />
                  </div>
                </section>

                <section className="px-6 py-5">
                  <h2 className="text-[13px] font-semibold text-[#1F272E] dark:text-white mb-4">
                    Serial & Batch Bundle
                  </h2>
                  <div className="space-y-4">
                    <CheckboxField
                      checked={autoCreateBundleOutward}
                      onChange={setAutoCreateBundleOutward}
                      label="Auto create Serial and Batch Bundle for outward"
                      helperText="System will auto create Serial and Batch Bundle for outward entries on submit based on FIFO / LIFO / Expiry"
                    />
                    <CheckboxField
                      checked={doNotUpdateSerialBatchOnAutoBundle}
                      onChange={setDoNotUpdateSerialBatchOnAutoBundle}
                      label="Do not update Serial / Batch on creation of auto bundle"
                      helperText="If enabled, system will not update Serial No / Batch No in the stock transaction table on creation of Serial and Batch Bundle"
                    />
                    <CheckboxField
                      checked={setBundleNamingBasedOnSeries}
                      onChange={setSetBundleNamingBasedOnSeries}
                      label="Set Serial and Batch Bundle Naming Based on Naming Series"
                      helperText="By default the naming of Serial and Batch Bundle is hash based. If this is enabled, it will be based on naming series"
                    />
                  </div>
                </section>
              </>
            )}

            {activeTab === 'stock-reservation' && (
              <section className="px-6 py-5 space-y-4">
                <CheckboxField
                  checked={enableStockReservation}
                  onChange={setEnableStockReservation}
                  label="Enable stock reservation"
                  helperText="Allows to keep aside a specific quantity of inventory for a particular order."
                />
                <CheckboxField
                  checked={autoReserveStock}
                  onChange={setAutoReserveStock}
                  label="Auto reserve stock"
                  helperText="If enabled, Stock Reservation Entries will be created automatically on submission of Purchase Receipt / Stock Entry (Material Receipt / Manufacture) against the Purchase Order / Work Order / Subcontracting Order if the Stock Reservation was requested."
                />
              </section>
            )}

            {activeTab === 'quality' && (
              <section className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div className="space-y-4">
                    <CheckboxField
                      checked={allowQiAfterPurchaseDelivery}
                      onChange={setAllowQiAfterPurchaseDelivery}
                      label="Allow to make Quality Inspection after Purchase / Delivery"
                    />
                    <SelectField
                      label="Action if Quality Inspection is rejected"
                      value={actionIfQiRejected}
                      onChange={setActionIfQiRejected}
                      options={['Stop', 'Warn', 'Ignore']}
                    />
                    <SelectField
                      label="Action if Quality Inspection is not submitted"
                      value={actionIfQiNotSubmitted}
                      onChange={setActionIfQiNotSubmitted}
                      options={['Stop', 'Warn', 'Ignore']}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'stock-planning' && (
              <section className="px-6 py-5 space-y-4">
                <CheckboxField
                  checked={raiseMrOnReorder}
                  onChange={setRaiseMrOnReorder}
                  label="Raise Material Request when stock reaches re-order level"
                  info="Automatically create Material Request when projected qty falls below reorder level"
                />
                <CheckboxField
                  checked={notifyEmailOnAutoMr}
                  onChange={setNotifyEmailOnAutoMr}
                  label="Notify by email on creation of automatic Material Request"
                />
              </section>
            )}

            {activeTab === 'stock-closing' && (
              <section className="px-6 py-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div className="space-y-4">
                    <InputField
                      label="Freeze stocks older than (days)"
                      value={freezeStocksOlderThanDays}
                      onChange={setFreezeStocksOlderThanDays}
                      helperText="Stock transactions that are older than the mentioned days cannot be modified."
                    />
                    <InputField
                      label="Stock frozen up to"
                      value={stockFrozenUpTo}
                      onChange={setStockFrozenUpTo}
                      helperText="No stock transactions can be created or modified before this date."
                    />
                    <InputField
                      label="Role allowed to create/edit back-dated transactions"
                      value={roleAllowedBackdated}
                      onChange={setRoleAllowedBackdated}
                      helperText="Users with this role will be allowed to create or edit back-dated stock transactions even after the stock is frozen."
                    />
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'document-naming' && (
              <section className="px-6 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#1F272E] dark:text-white">
                    <span>Naming Series</span>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-[#27272A] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FA] dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A] text-[12px] font-medium text-[#687178] dark:text-[#A1A1AA]">
                        <th className="py-2.5 px-4 w-[35%]">Transaction</th>
                        <th className="py-2.5 px-4">Naming Series</th>
                        <th className="py-2.5 px-4 w-16 text-right" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80 dark:divide-[#27272A] text-[13px]">
                      {namingRows.map((row) => {
                        const isEditing = editingRowId === row.id;
                        return (
                          <tr
                            key={row.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-[#18181B]/60 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-[#1F272E] dark:text-[#F4F4F5]">
                              {row.transaction}
                            </td>
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <div className="flex items-center gap-2 max-w-xs">
                                  <input
                                    type="text"
                                    value={editingSeriesValue}
                                    onChange={(e) => setEditingSeriesValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEditNamingRow(row.id);
                                      if (e.key === 'Escape') setEditingRowId(null);
                                    }}
                                    autoFocus
                                    className="w-full rounded bg-white dark:bg-[#18181B] border border-slate-300 dark:border-[#3F3F46] px-2.5 py-1 text-[12px] text-[#1F272E] dark:text-white outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => saveEditNamingRow(row.id)}
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
                                <span className="inline-flex items-center rounded-md bg-[#F3F3F3] dark:bg-[#27272A] px-2.5 py-1 text-[12px] font-medium text-[#1F272E] dark:text-[#E4E4E7]">
                                  {row.series}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => startEditNamingRow(row)}
                                  className="inline-flex items-center justify-center p-1.5 rounded-md text-slate-400 hover:text-[#1F272E] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
                                  title="Edit naming series"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

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
                  <Mail className="w-3.5 h-3.5 hidden" />
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
                    changed the value of Activate Serial / Batch No for Item from{' '}
                    <strong className="font-semibold text-[#1F272E] dark:text-white">0</strong> to{' '}
                    <strong className="font-semibold text-[#1F272E] dark:text-white">1</strong> · 3 days ago
                  </span>
                </div>

                <div className="relative text-[12.5px] text-[#525A61] dark:text-[#A1A1AA]">
                  <span className="absolute -left-[22px] top-[6px] w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-white" />
                  <span>
                    <strong className="font-semibold text-[#1F272E] dark:text-white">You</strong>{' '}
                    last edited this · 3 days ago
                  </span>
                </div>

                <div className="relative flex items-start justify-between gap-4 text-[12.5px] text-[#525A61] dark:text-[#A1A1AA]">
                  <span className="absolute -left-[22px] top-[6px] w-1.5 h-1.5 rounded-full bg-[#171717] dark:bg-white" />
                  <span className="leading-[1.5]">
                    <strong className="font-semibold text-[#1F272E] dark:text-white">You</strong>{' '}
                    changed the value of Auto insert Item Price if missing from{' '}
                    <strong className="font-semibold text-[#1F272E] dark:text-white">0</strong> to{' '}
                    <strong className="font-semibold text-[#1F272E] dark:text-white">1</strong>, Default Stock UOM from{' '}
                    <strong className="font-semibold text-[#1F272E] dark:text-white">""</strong> to{' '}
                    <strong className="font-semibold text-[#1F272E] dark:text-white">Nos</strong>, Raise Material Request when stock reaches re-order level from{' '}
                    <strong className="font-semibold text-[#1F272E] dark:text-white">0</strong> to{' '}
                    <strong className="font-semibold text-[#1F272E] dark:text-white">1</strong> · 4 months ago
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
              Stock Settings
            </span>
            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className={`p-1 rounded transition-colors ${
                liked
                  ? 'text-rose-500'
                  : 'text-slate-400 dark:text-[#71717A] hover:text-slate-600 dark:hover:text-white'
              }`}
              aria-label="Like Stock Settings"
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
              <div>3 days ago</div>
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
