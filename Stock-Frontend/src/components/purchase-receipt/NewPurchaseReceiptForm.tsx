import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronsUpDown,
  ChevronRight,
  ChevronDown,
  ScanBarcode,
  Settings as Gear,
  Pencil,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
} from 'lucide-react';
import { usePurchaseReceipt } from '../../context';
import type { PurchaseReceiptItem } from '../../types';
import { formatCurrency } from '../../utils';

interface NewPurchaseReceiptFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

interface TaxChargeRow {
  id: string;
  type: string;
  accountHead: string;
  taxRate: number;
  netAmount: number;
  amount: number;
  total: number;
}

interface RawMaterialRow {
  id: string;
  itemCode: string;
  rawMaterialItemName: string;
  availableQty: number;
  qtyToConsume: number;
  currentStock: number;
}

export const NewPurchaseReceiptForm: React.FC<NewPurchaseReceiptFormProps> = ({
  onSuccess,
  isModal = false,
}) => {
  const navigate = useNavigate();
  const { createReceipt } = usePurchaseReceipt();

  // Tabs: Details, Address & Contact, Terms, More Info (Image 1)
  const [activeTab, setActiveTab] = useState<'details' | 'address_contact' | 'terms' | 'more_info'>('details');

  // Top Section: Column 1
  const [series, setSeries] = useState('MAT-PRE-.YYYY.-');
  const [supplier, setSupplier] = useState('');
  const [supplierDeliveryNote, setSupplierDeliveryNote] = useState('');

  // Top Section: Column 2
  const [date, setDate] = useState('03-11-2026');
  const [postingTime, setPostingTime] = useState('00:51:32');
  const [editPostingDateTime, setEditPostingDateTime] = useState(false);

  // Top Section: Column 3
  const [company, setCompany] = useState('Avalon (Demo)');
  const [applyPutawayRule, setApplyPutawayRule] = useState(false);
  const [isReturn, setIsReturn] = useState(false);

  // Accordion: Currency and Price List (Image 1)
  const [isCurrencyPriceListOpen, setIsCurrencyPriceListOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [priceList, setPriceList] = useState('Standard Buying');
  const [exchangeRate, setExchangeRate] = useState(1.0);

  // Items Section (Image 1)
  const [scanBarcode, setScanBarcode] = useState('');
  const [acceptedWarehouse, setAcceptedWarehouse] = useState('');
  const [rejectedWarehouse, setRejectedWarehouse] = useState('');
  const [isSubcontracted, setIsSubcontracted] = useState(false);

  // Items Table Rows (Image 1)
  const [items, setItems] = useState<PurchaseReceiptItem[]>([
    {
      id: 'row-1',
      itemCode: '',
      itemName: '',
      receivedQty: 0,
      acceptedQty: 0,
      rejectedQty: 0,
      uom: 'Nos',
      rate: 0,
      amount: 0,
      warehouse: '',
    },
  ]);

  // Taxes and Charges (Image 2)
  const [taxCategory, setTaxCategory] = useState('');
  const [shippingRule, setShippingRule] = useState('');
  const [incoterm, setIncoterm] = useState('');
  const [taxTemplate, setTaxTemplate] = useState('');
  const [taxRows, setTaxRows] = useState<TaxChargeRow[]>([]);

  // Totals & Rounding (Image 3 & 4)
  const [disableRoundedTotal, setDisableRoundedTotal] = useState(false);

  // Accordion: Additional Discount (Image 4 & 5)
  const [isAdditionalDiscountOpen, setIsAdditionalDiscountOpen] = useState(false);
  const [applyDiscountOn, setApplyDiscountOn] = useState('Grand Total');
  const [additionalDiscountPercentage, setAdditionalDiscountPercentage] = useState<number | string>('');
  const [additionalDiscountAmount, setAdditionalDiscountAmount] = useState<number | string>('');

  // Accordion: Raw Materials Consumed (Image 4 & 5)
  const [isRawMaterialsOpen, setIsRawMaterialsOpen] = useState(false);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialRow[]>([]);

  // Address & Contact Tab
  const [supplierAddress, setSupplierAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // Terms Tab
  const [termsTemplate, setTermsTemplate] = useState('');
  const [termsContent, setTermsContent] = useState('');

  // More Info Tab
  const [remarks, setRemarks] = useState('');

  const [isGetItemsOpen, setIsGetItemsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculations
  const totalQuantity = items.reduce((sum, it) => sum + (Number(it.acceptedQty) || 0), 0);
  const netTotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const taxesAdded = taxRows.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const taxesDeducted = 0;
  const totalTaxes = taxesAdded - taxesDeducted;

  const discountVal =
    typeof additionalDiscountAmount === 'number'
      ? additionalDiscountAmount
      : Number(additionalDiscountAmount) || 0;

  const rawGrandTotal = Math.max(0, netTotal + totalTaxes - discountVal);
  const roundingAdjustment = disableRoundedTotal ? 0 : Math.round(rawGrandTotal) - rawGrandTotal;
  const roundedTotal = disableRoundedTotal ? rawGrandTotal : Math.round(rawGrandTotal);

  // Items Row Handlers
  const handleItemChange = (index: number, field: keyof PurchaseReceiptItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      if (field === 'acceptedQty' || field === 'rate') {
        const qty = field === 'acceptedQty' ? Number(value) || 0 : Number(target.acceptedQty) || 0;
        const rate = field === 'rate' ? Number(value) || 0 : Number(target.rate) || 0;
        target.amount = Number((qty * rate).toFixed(2));
      }
      updated[index] = target;
      return updated;
    });
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        itemCode: '',
        itemName: '',
        receivedQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
        uom: 'Nos',
        rate: 0,
        amount: 0,
        warehouse: acceptedWarehouse || '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddTaxRow = () => {
    setTaxRows((prev) => [
      ...prev,
      {
        id: `tax-${Date.now()}`,
        type: 'On Net Total',
        accountHead: 'VAT 18% - AD',
        taxRate: 18,
        netAmount: netTotal,
        amount: Number((netTotal * 0.18).toFixed(2)),
        total: Number((netTotal * 1.18).toFixed(2)),
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newRec = await createReceipt({
        supplierName: supplier.trim() || 'Summit Traders Ltd.',
        company,
        series,
        currency,
        date,
        postingDate: date,
        postingTime,
        status: 'Draft',
        grandTotal: roundedTotal,
        netTotal,
        items,
        acceptedWarehouse,
        rejectedWarehouse,
        remarks,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/purchase-receipt/${newRec.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-4 sm:p-6 transition-colors duration-200 text-xs font-sans">
      {/* Top Breadcrumb & Action Row (Image 1) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80 dark:border-[#27272A]">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-white text-sm">
            New Purchase Receipt
          </span>
          <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full">
            Not Saved
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Get Items From ↕ dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGetItemsOpen(!isGetItemsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] text-xs transition-colors"
            >
              <span>Get Items From</span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isGetItemsOpen && (
              <div className="absolute right-0 top-9 z-50 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-xl shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                {['Purchase Order', 'Material Request', 'Supplier Quotation'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setIsGetItemsOpen(false);
                      // Fill sample items
                      setSupplier('Summit Traders Ltd.');
                      setItems([
                        {
                          id: 'it-po-1',
                          itemCode: 'SKU001',
                          itemName: 'Dell XPS 15 Laptop',
                          receivedQty: 2,
                          acceptedQty: 2,
                          rejectedQty: 0,
                          uom: 'Nos',
                          rate: 198.0,
                          amount: 396.0,
                          warehouse: 'Stores - AD',
                        },
                      ]);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Solid Black Save Button (Image 1) */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-medium px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* 4 Tabs: Details, Address & Contact, Terms, More Info (Image 1) */}
      <div className="flex items-center gap-6 border-b border-slate-200/90 dark:border-[#27272A] pb-0 text-xs mb-5 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-2.5 font-medium transition-colors relative ${
            activeTab === 'details'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Details
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('address_contact')}
          className={`pb-2.5 font-medium transition-colors relative ${
            activeTab === 'address_contact'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Address & Contact
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={`pb-2.5 font-medium transition-colors relative ${
            activeTab === 'terms'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Terms
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('more_info')}
          className={`pb-2.5 font-medium transition-colors relative ${
            activeTab === 'more_info'
              ? 'text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
              : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          More Info
        </button>
      </div>

      {/* ================= TAB 1: DETAILS ================= */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          {/* 3 Columns Row (Image 1): Series/Supplier vs Date/Time vs Company/Putaway */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3.5">
            {/* Column 1 */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Series <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  >
                    <option value="MAT-PRE-.YYYY.-">MAT-PRE-.YYYY.-</option>
                    <option value="PR-REC-.YYYY.-">PR-REC-.YYYY.-</option>
                  </select>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Supplier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Select or enter supplier..."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Supplier Delivery Note
                </label>
                <input
                  type="text"
                  value={supplierDeliveryNote}
                  onChange={(e) => setSupplierDeliveryNote(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!editPostingDateTime}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-normal border transition-colors ${
                    editPostingDateTime
                      ? 'bg-white dark:bg-[#18181B] border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white'
                      : 'bg-slate-100/70 dark:bg-[#202024] border-transparent text-slate-800 dark:text-zinc-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Posting Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!editPostingDateTime}
                  value={postingTime}
                  onChange={(e) => setPostingTime(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg text-xs font-normal border transition-colors ${
                    editPostingDateTime
                      ? 'bg-white dark:bg-[#18181B] border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white'
                      : 'bg-slate-100/70 dark:bg-[#202024] border-transparent text-slate-800 dark:text-zinc-200'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editDateTimePR"
                  checked={editPostingDateTime}
                  onChange={(e) => setEditPostingDateTime(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <label
                  htmlFor="editDateTimePR"
                  className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer select-none"
                >
                  Edit Posting Date and Time
                </label>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="applyPutaway"
                  checked={applyPutawayRule}
                  onChange={(e) => setApplyPutawayRule(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <label htmlFor="applyPutaway" className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer select-none">
                  Apply Putaway Rule
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isReturn"
                  checked={isReturn}
                  onChange={(e) => setIsReturn(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <label htmlFor="isReturn" className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer select-none">
                  Is Return
                </label>
              </div>
            </div>
          </div>

          {/* Accordion: Currency and Price List > (Image 1) */}
          <div className="pt-2 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsCurrencyPriceListOpen(!isCurrencyPriceListOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Currency and Price List</span>
              {isCurrencyPriceListOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isCurrencyPriceListOpen && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-[#2A2A2E] grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Currency</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Price List</label>
                  <input
                    type="text"
                    value={priceList}
                    onChange={(e) => setPriceList(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Exchange Rate</label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================= ITEMS SECTION (Image 1) ================= */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Items</h3>

            {/* 3 Columns under Items: Scan Barcode, Accepted Warehouse, Rejected Warehouse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Scan Barcode</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Scan item barcode..."
                    value={scanBarcode}
                    onChange={(e) => setScanBarcode(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <ScanBarcode className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Accepted Warehouse</label>
                <input
                  type="text"
                  placeholder="e.g. Stores - AD"
                  value={acceptedWarehouse}
                  onChange={(e) => setAcceptedWarehouse(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Rejected Warehouse</label>
                <input
                  type="text"
                  placeholder="e.g. Rejected - AD"
                  value={rejectedWarehouse}
                  onChange={(e) => setRejectedWarehouse(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isSubcontracted"
                    checked={isSubcontracted}
                    onChange={(e) => setIsSubcontracted(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                  />
                  <label htmlFor="isSubcontracted" className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer select-none">
                    Is Subcontracted
                  </label>
                </div>
              </div>
            </div>

            {/* Items Table (Image 1) */}
            <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B] mt-3">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                    <th className="py-2.5 px-3 w-10 text-center font-normal">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                    </th>
                    <th className="py-2.5 px-3 w-10 font-normal">No.</th>
                    <th className="py-2.5 px-3 font-normal min-w-[130px]">Item Code <span className="text-rose-500">*</span></th>
                    <th className="py-2.5 px-3 text-right font-normal min-w-[110px]">Accepted Quantity</th>
                    <th className="py-2.5 px-3 text-right font-normal min-w-[90px]">Reject...</th>
                    <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Rate</th>
                    <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Amount</th>
                    <th className="py-2.5 px-3 font-normal min-w-[130px]">Accepted Wareho...</th>
                    <th className="py-2.5 px-3 w-10 text-center font-normal">
                      <Gear className="w-3.5 h-3.5 mx-auto text-slate-400" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#242428]">
                  {items.map((it, idx) => (
                    <tr key={it.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#202024]/60 transition-colors">
                      <td className="py-2 px-3 text-center">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </td>
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="e.g. SKU001"
                          value={it.itemCode}
                          onChange={(e) => handleItemChange(idx, 'itemCode', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs font-mono"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={it.acceptedQty}
                          onChange={(e) => handleItemChange(idx, 'acceptedQty', Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={it.rejectedQty || 0}
                          onChange={(e) => handleItemChange(idx, 'rejectedQty', Number(e.target.value))}
                          className="w-16 px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          value={it.rate}
                          onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                          className="w-24 px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900 dark:text-white">
                        $ {it.amount.toFixed(2)}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Stores - AD"
                          value={it.warehouse || acceptedWarehouse}
                          onChange={(e) => handleItemChange(idx, 'warehouse', e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Remove item"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Action Buttons: Add row, Add multiple | Download, Upload (Image 1) */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  Add row
                </button>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  Add multiple
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Download template')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => alert('Upload CSV')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* 3 Columns of Totals: Total Quantity | Total (Company Currency) / Net Total | Total / Net Total (Image 2) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 pt-3">
              {/* Col 1 */}
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Total Quantity</label>
                <input
                  type="text"
                  readOnly
                  value={totalQuantity}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              {/* Col 2 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Total (Company Currency)</label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${netTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                    Net Total (Company Currency) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${netTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Col 3 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Total</label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${netTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Net Total</label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${netTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= TAXES AND CHARGES SECTION (Image 2 & 3) ================= */}
          <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Taxes and Charges</h3>

            {/* Row 1: 3 cols: Tax Category, Shipping Rule, Incoterm */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Tax Category</label>
                <input
                  type="text"
                  value={taxCategory}
                  onChange={(e) => setTaxCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Shipping Rule</label>
                <input
                  type="text"
                  value={shippingRule}
                  onChange={(e) => setShippingRule(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Incoterm</label>
                <input
                  type="text"
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Purchase Taxes and Charges Template */}
            <div className="w-full md:w-1/3 pr-2">
              <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                Purchase Taxes and Charges Template
              </label>
              <input
                type="text"
                placeholder="Select tax template..."
                value={taxTemplate}
                onChange={(e) => setTaxTemplate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Sub-table: Purchase Taxes and Charges (Image 2) */}
            <div className="pt-2">
              <span className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                Purchase Taxes and Charges
              </span>
              <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                      <th className="py-2.5 px-3 w-10 text-center font-normal">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </th>
                      <th className="py-2.5 px-3 w-10 font-normal">No.</th>
                      <th className="py-2.5 px-3 font-normal min-w-[120px]">Type <span className="text-rose-500">*</span></th>
                      <th className="py-2.5 px-3 font-normal min-w-[140px]">Account Head <span className="text-rose-500">*</span></th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[90px]">Tax Rate</th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Net Amount</th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Amount</th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Total</th>
                      <th className="py-2.5 px-3 w-10 text-center font-normal">
                        <Gear className="w-3.5 h-3.5 mx-auto text-slate-400" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#242428]">
                    {taxRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                          No rows
                        </td>
                      </tr>
                    ) : (
                      taxRows.map((tr, idx) => (
                        <tr key={tr.id} className="hover:bg-slate-50/70 dark:hover:bg-[#202024]/60">
                          <td className="py-2 px-3 text-center">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                          </td>
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3">{tr.type}</td>
                          <td className="py-2 px-3 font-medium">{tr.accountHead}</td>
                          <td className="py-2 px-3 text-right">{tr.taxRate}%</td>
                          <td className="py-2 px-3 text-right">$ {tr.netAmount.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-medium">$ {tr.amount.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-semibold">$ {tr.total.toFixed(2)}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setTaxRows((p) => p.filter((_, i) => i !== idx))}
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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddTaxRow}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#1E1E22] text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-[#27272A] transition-colors"
                >
                  Add row
                </button>
              </div>
            </div>

            {/* Taxes and Charges Totals (Image 2 & 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-3">
              {/* Row 1 */}
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Taxes and Charges Added (Company Currency)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${taxesAdded.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Taxes and Charges Added
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${taxesAdded.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Row 2 */}
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Taxes and Charges Deducted (Company Currency)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${taxesDeducted.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Taxes and Charges Deducted
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${taxesDeducted.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Total Taxes and Charges (Company Currency)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${totalTaxes.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                  Total Taxes and Charges
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${totalTaxes.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* ================= TOTALS (USD) SECTION (Image 3 & 4) ================= */}
          <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Totals (USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {/* Col 1 */}
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Grand Total</label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${rawGrandTotal.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              {/* Col 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="disableRounding"
                    checked={disableRoundedTotal}
                    onChange={(e) => setDisableRoundedTotal(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                  />
                  <label htmlFor="disableRounding" className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer select-none">
                    Disable Rounded Total
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Rounding Adjustment</label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${roundingAdjustment.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Rounded Total</label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${roundedTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= TOTALS (COMPANY CURRENCY) (USD) (Image 4) ================= */}
          <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Totals (Company Currency) (USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Grand Total</label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${rawGrandTotal.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Rounding Adjustment</label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${roundingAdjustment.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">Rounded Total</label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${roundedTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#202024] border border-transparent text-slate-900 dark:text-white text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= ACCORDION: ADDITIONAL DISCOUNT (Image 4 & 5) ================= */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsAdditionalDiscountOpen(!isAdditionalDiscountOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Additional Discount</span>
              {isAdditionalDiscountOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isAdditionalDiscountOpen && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-[#2A2A2E] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {/* Col 1 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Apply Additional Discount On
                    </label>
                    <div className="relative">
                      <select
                        value={applyDiscountOn}
                        onChange={(e) => setApplyDiscountOn(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs appearance-none focus:outline-none focus:ring-1 focus:ring-slate-400"
                      >
                        <option value="Grand Total">Grand Total</option>
                        <option value="Net Total">Net Total</option>
                      </select>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Additional Discount Amount (Company Currency)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`$ ${discountVal.toFixed(2)}`}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-[#18181B] border border-transparent text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Additional Discount Percentage
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={additionalDiscountPercentage}
                      onChange={(e) => {
                        const pct = Number(e.target.value);
                        setAdditionalDiscountPercentage(e.target.value);
                        if (!isNaN(pct)) {
                          const calcAmt = (netTotal * pct) / 100;
                          setAdditionalDiscountAmount(calcAmt.toFixed(2));
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Additional Discount Amount
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={additionalDiscountAmount}
                      onChange={(e) => setAdditionalDiscountAmount(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= ACCORDION: RAW MATERIALS CONSUMED (Image 4 & 5) ================= */}
          <div className="pt-3 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsRawMaterialsOpen(!isRawMaterialsOpen)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Raw Materials Consumed</span>
              {isRawMaterialsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isRawMaterialsOpen && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-[#2A2A2E] space-y-2">
                <span className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                  Consumed Items
                </span>
                <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#202024] text-slate-600 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                        <th className="py-2.5 px-3 w-10 text-center font-normal">
                          <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                        </th>
                        <th className="py-2.5 px-3 w-10 font-normal">No.</th>
                        <th className="py-2.5 px-3 font-normal min-w-[110px]">Item Code</th>
                        <th className="py-2.5 px-3 font-normal min-w-[140px]">Raw Material Item ...</th>
                        <th className="py-2.5 px-3 text-right font-normal min-w-[120px]">Available Qty For C...</th>
                        <th className="py-2.5 px-3 text-right font-normal min-w-[120px]">Qty to Be Consum...</th>
                        <th className="py-2.5 px-3 text-right font-normal min-w-[100px]">Current Stock</th>
                        <th className="py-2.5 px-3 w-10 text-center font-normal">
                          <Gear className="w-3.5 h-3.5 mx-auto text-slate-400" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400 dark:text-zinc-500">
                          No rows
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: ADDRESS & CONTACT ================= */}
      {activeTab === 'address_contact' && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                Supplier Address
              </label>
              <textarea
                rows={3}
                placeholder="Select or type supplier address..."
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="Contact name, email, phone..."
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TERMS ================= */}
      {activeTab === 'terms' && (
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Payment Terms Template
            </label>
            <input
              type="text"
              placeholder="e.g. 30 Days Net"
              value={termsTemplate}
              onChange={(e) => setTermsTemplate(e.target.value)}
              className="w-full md:w-1/2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Terms and Conditions Details
            </label>
            <textarea
              rows={4}
              placeholder="Enter specific contractual terms or warranty notes..."
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>
      )}

      {/* ================= TAB 4: MORE INFO ================= */}
      {activeTab === 'more_info' && (
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Remarks
            </label>
            <textarea
              rows={4}
              placeholder="Add optional notes or remarks here..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>
      )}

      {/* Modal Bottom Save Bar */}
      {isModal && (
        <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-slate-200/80 dark:border-[#27272A]">
          <button
            type="button"
            onClick={onSuccess}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-300 font-normal transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};

export default NewPurchaseReceiptForm;
