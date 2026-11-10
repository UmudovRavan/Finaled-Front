import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronsUpDown,
  ChevronRight,
  ChevronDown,
  ScanBarcode,
  Settings as Gear,
  Pencil,
  Trash2,
  ArrowRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  RemoveFormatting,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  ListChecks,
  AlignLeft,
  Outdent,
  Indent,
} from 'lucide-react';
import { useDeliveryNote } from '../../context';
import type { DeliveryNoteItem } from '../../types';

interface NewDeliveryNoteFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

interface SalesTaxChargeRow {
  id: string;
  type: string;
  accountHead: string;
  taxRate: number;
  netAmount: number;
  amount: number;
  total: number;
}

interface SalesTeamRow {
  id: string;
  salesPerson: string;
  contributionPct: number;
  contributionToNetTotal: number;
  commissionRate: number;
  incentives: number;
}

export const NewDeliveryNoteForm: React.FC<NewDeliveryNoteFormProps> = ({
  onSuccess,
  isModal = false,
}) => {
  const navigate = useNavigate();
  const { createNote } = useDeliveryNote();

  // Tabs: Details, Address & Contact, Terms, More Info (Image 1)
  const [activeTab, setActiveTab] = useState<'details' | 'address_contact' | 'terms' | 'more_info'>('details');

  // Top Section: Column 1 (Image 1)
  const [series, setSeries] = useState('MAT-DN-.YYYY.-');
  const [customer, setCustomer] = useState('');

  // Top Section: Column 2 (Image 1)
  const [date, setDate] = useState('09-11-2026');
  const [postingTime, setPostingTime] = useState('15:12:18');
  const [editPostingDateTime, setEditPostingDateTime] = useState(false);

  // Top Section: Column 3 (Image 1)
  const [company, setCompany] = useState('Avalon (Demo)');
  const [isReturn, setIsReturn] = useState(false);

  // Accordion: Currency and Price List (Image 1 - open by default as shown in Image 1)
  const [isCurrencyPriceListOpen, setIsCurrencyPriceListOpen] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState('1.000000000');
  const [priceList, setPriceList] = useState('Standard Selling');
  const [priceListCurrency, setPriceListCurrency] = useState('USD');
  const [priceListExchangeRate, setPriceListExchangeRate] = useState('1.000000000');
  const [ignorePricingRule, setIgnorePricingRule] = useState(false);

  // Items Section (Image 2)
  const [scanBarcode, setScanBarcode] = useState('');
  const [setSourceWarehouse, setSetSourceWarehouse] = useState('');

  // Delivery Note Item Table Rows (Image 2)
  const [items, setItems] = useState<DeliveryNoteItem[]>([
    {
      id: 'row-1',
      itemCode: '',
      itemName: '',
      qty: 0,
      uom: '',
      rate: 0,
      amount: 0,
      warehouse: '',
    },
  ]);

  // Taxes and Charges (Image 3)
  const [taxCategory, setTaxCategory] = useState('');
  const [shippingRule, setShippingRule] = useState('');
  const [incoterm, setIncoterm] = useState('');
  const [salesTaxTemplate, setSalesTaxTemplate] = useState('');
  const [taxRows, setTaxRows] = useState<SalesTaxChargeRow[]>([]);

  // Accordion: Additional Discount (Image 4 & 5 - open by default as shown in Image 4 & 5)
  const [isAdditionalDiscountOpen, setIsAdditionalDiscountOpen] = useState(true);
  const [applyDiscountOn, setApplyDiscountOn] = useState('Grand Total');
  const [additionalDiscountPercentage, setAdditionalDiscountPercentage] = useState<number | string>('');
  const [additionalDiscountAmount, setAdditionalDiscountAmount] = useState<number | string>('');

  // Address & Contact Tab (Image 1)
  const [shippingAddress, setShippingAddress] = useState('');
  const [dispatchAddressName, setDispatchAddressName] = useState('');
  const [companyAddressName, setCompanyAddressName] = useState('');
  const [companyContactPerson, setCompanyContactPerson] = useState('');

  // Terms Tab (Image 2)
  const [tcName, setTcName] = useState('');
  const [terms, setTerms] = useState('');

  // More Info Tab (Images 3, 4, 5)
  const [isStatusSectionOpen, setIsStatusSectionOpen] = useState(true);
  const [docStatus, setDocStatus] = useState('Draft');

  const [isTransporterInfoOpen, setIsTransporterInfoOpen] = useState(true);
  const [transporter, setTransporter] = useState('');
  const [transportReceiptDate, setTransportReceiptDate] = useState('09-11-2026');
  const [transportReceiptNo, setTransportReceiptNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [deliveryTrip, setDeliveryTrip] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driver, setDriver] = useState('');

  const [isCustomerPoOpen, setIsCustomerPoOpen] = useState(true);
  const [poNo, setPoNo] = useState('');
  const [poDate, setPoDate] = useState('');

  const [isCommissionOpen, setIsCommissionOpen] = useState(true);
  const [salesPartner, setSalesPartner] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [totalCommission, setTotalCommission] = useState('');

  const [isSalesTeamOpen, setIsSalesTeamOpen] = useState(true);
  const [salesTeamRows, setSalesTeamRows] = useState<SalesTeamRow[]>([]);

  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(true);
  const [letterHead, setLetterHead] = useState('Company Letterhead - Grey');
  const [printHeading, setPrintHeading] = useState('');
  const [printWithoutAmount, setPrintWithoutAmount] = useState(false);
  const [groupSameItems, setGroupSameItems] = useState(false);
  const [printLanguage, setPrintLanguage] = useState('en');

  const [isUtmAnalyticsOpen, setIsUtmAnalyticsOpen] = useState(true);
  const [utmSource, setUtmSource] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmContent, setUtmContent] = useState('');

  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(true);
  const [isInternalCustomer, setIsInternalCustomer] = useState(false);
  const [interCompanyReference, setInterCompanyReference] = useState('');
  const [territory, setTerritory] = useState('');
  const [instructions, setInstructions] = useState('');
  const [remarks] = useState('');

  const [isGetItemsOpen, setIsGetItemsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Calculations
  const totalQuantity = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const netTotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const totalTaxes = taxRows.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const discountVal =
    typeof additionalDiscountAmount === 'number'
      ? additionalDiscountAmount
      : Number(additionalDiscountAmount) || 0;

  const rawGrandTotal = Math.max(0, netTotal + totalTaxes - discountVal);
  const roundingAdjustment = 0;
  const roundedTotal = rawGrandTotal;

  // Items Row Handlers
  const handleItemChange = (index: number, field: keyof DeliveryNoteItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      if (field === 'qty' || field === 'rate') {
        const qty = field === 'qty' ? Number(value) || 0 : Number(target.qty) || 0;
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
        qty: 0,
        uom: '',
        rate: 0,
        amount: 0,
        warehouse: setSourceWarehouse || '',
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
        accountHead: 'Output Tax - AD',
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
      await createNote({
        customer: customer.trim() || 'Grant Plastics Ltd.',
        customerName: customer.trim() || 'Grant Plastics Ltd.',
        company,
        series,
        currency,
        date,
        postingDate: date,
        postingTime,
        isReturn,
        status: 'Draft',
        grandTotal: roundedTotal,
        netTotal,
        items: items.map((it) => ({
          ...it,
          uom: it.uom || 'Nos',
        })),
        setSourceWarehouse,
        remarks,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/delivery-note');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-slate-200/90 dark:border-[#27272A] shadow-sm p-4 sm:p-6 transition-colors duration-200 text-xs font-sans">
      {/* Top Action Row when in Modal */}
      {isModal && (
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80 dark:border-[#27272A]">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              New Delivery Note
            </span>
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium px-2 py-0.5 rounded-full">
              Not Saved
            </span>
          </div>

          <div className="flex items-center gap-2 pr-8">
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
                  {['Sales Order', 'Pick List', 'Packing Slip', 'Delivery Trip'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIsGetItemsOpen(false)}
                      className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-[#27272A]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
      )}

      {/* Hidden Save button for Header.tsx trigger when on full page */}
      {!isModal && (
        <button
          type="button"
          onClick={handleSave}
          className="hidden"
          aria-hidden="true"
        >
          Save
        </button>
      )}

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
          {/* Top 3 Columns Row (Image 1): Series/Customer vs Date/Posting Time/Edit vs Company/Is Return */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3.5">
            {/* Column 1 */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Series <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs appearance-none focus:outline-none font-medium"
                  >
                    <option value="MAT-DN-.YYYY.-">MAT-DN-.YYYY.-</option>
                    <option value="MAT-DN-RET-.YYYY.-">MAT-DN-RET-.YYYY.-</option>
                  </select>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Customer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
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
                      : 'bg-[#F3F4F6] dark:bg-[#202024] border-transparent text-slate-800 dark:text-zinc-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
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
                      : 'bg-[#F3F4F6] dark:bg-[#202024] border-transparent text-slate-800 dark:text-zinc-200'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="editDateTimeDN"
                  checked={editPostingDateTime}
                  onChange={(e) => setEditPostingDateTime(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <label
                  htmlFor="editDateTimeDN"
                  className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer select-none"
                >
                  Edit Posting Date and Time
                </label>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Company <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isReturnDN"
                  checked={isReturn}
                  onChange={(e) => setIsReturn(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                />
                <label
                  htmlFor="isReturnDN"
                  className="text-slate-600 dark:text-zinc-300 text-xs cursor-pointer select-none"
                >
                  Is Return
                </label>
              </div>
            </div>
          </div>

          {/* ================= CURRENCY AND PRICE LIST ACCORDION (Image 1) ================= */}
          <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsCurrencyPriceListOpen(!isCurrencyPriceListOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Currency and Price List</span>
              {isCurrencyPriceListOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isCurrencyPriceListOpen && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {/* Left Column: Currency & Exchange Rate */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Currency <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-1.5 pr-8 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                      />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Exchange Rate <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
                      Rate at which customer's currency is converted to company's base currency
                    </p>
                  </div>
                </div>

                {/* Right Column: Price List, Price List Currency, Price List Exchange Rate, Ignore Pricing Rule */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Price List <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={priceList}
                      onChange={(e) => setPriceList(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Price List Currency <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={priceListCurrency}
                      onChange={(e) => setPriceListCurrency(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Price List Exchange Rate
                    </label>
                    <input
                      type="text"
                      value={priceListExchangeRate}
                      onChange={(e) => setPriceListExchangeRate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs font-normal focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
                      Rate at which Price list currency is converted to company's base currency
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="ignorePricingRuleDN"
                      checked={ignorePricingRule}
                      onChange={(e) => setIgnorePricingRule(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                    />
                    <label
                      htmlFor="ignorePricingRuleDN"
                      className="text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none"
                    >
                      Ignore Pricing Rule
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= ITEMS SECTION (Image 2) ================= */}
          <div className="space-y-3.5 pt-4 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Items</h3>

            {/* 2 Columns under Items: Scan Barcode & Set Source Warehouse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Scan Barcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={scanBarcode}
                    onChange={(e) => setScanBarcode(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <ScanBarcode className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Set Source Warehouse
                </label>
                <input
                  type="text"
                  value={setSourceWarehouse}
                  onChange={(e) => setSetSourceWarehouse(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Delivery Note Item Table (Image 2) */}
            <div className="pt-1">
              <span className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1.5">
                Delivery Note Item
              </span>
              <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F3F4F6]/80 dark:bg-[#202024] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                      <th className="py-2.5 px-3 w-10 text-center font-normal">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </th>
                      <th className="py-2.5 px-3 w-12 font-normal">No.</th>
                      <th className="py-2.5 px-3 font-normal min-w-[160px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Item Code <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[110px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Quantity <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-normal min-w-[100px] border-l border-slate-200/70 dark:border-[#27272A]">
                        UOM <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[110px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Rate
                      </th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[110px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Amount
                      </th>
                      <th className="py-2.5 px-3 font-normal min-w-[130px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Warehouse
                      </th>
                      <th className="py-2.5 px-3 w-10 text-center font-normal border-l border-slate-200/70 dark:border-[#27272A]">
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
                        <td className="py-2 px-3 text-slate-600 dark:text-zinc-400">{idx + 1}</td>
                        <td className="py-2 px-3 border-l border-slate-100 dark:border-[#242428]">
                          <input
                            type="text"
                            value={it.itemCode}
                            onChange={(e) => handleItemChange(idx, 'itemCode', e.target.value)}
                            className="w-full px-1 py-0.5 bg-transparent text-slate-900 dark:text-white text-xs outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-right border-l border-slate-100 dark:border-[#242428]">
                          <input
                            type="number"
                            value={it.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                            className="w-full px-1 py-0.5 bg-transparent text-slate-900 dark:text-white text-xs text-right font-medium outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 border-l border-slate-100 dark:border-[#242428]">
                          <input
                            type="text"
                            value={it.uom}
                            onChange={(e) => handleItemChange(idx, 'uom', e.target.value)}
                            className="w-full px-1 py-0.5 bg-transparent text-slate-900 dark:text-white text-xs outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-right border-l border-slate-100 dark:border-[#242428]">
                          <div className="flex items-center justify-end gap-0.5 text-slate-700 dark:text-zinc-300">
                            <span>$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={it.rate.toFixed(2)}
                              onChange={(e) => handleItemChange(idx, 'rate', Number(e.target.value))}
                              className="w-16 px-1 py-0.5 bg-transparent text-slate-900 dark:text-white text-xs text-right outline-none"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300 border-l border-slate-100 dark:border-[#242428]">
                          $ {it.amount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 border-l border-slate-100 dark:border-[#242428]">
                          <input
                            type="text"
                            value={it.warehouse || setSourceWarehouse}
                            onChange={(e) => handleItemChange(idx, 'warehouse', e.target.value)}
                            className="w-full px-1 py-0.5 bg-transparent text-slate-900 dark:text-white text-xs outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 text-center border-l border-slate-100 dark:border-[#242428]">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                            title="Edit / Remove item"
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

            {/* Table Action Buttons: Add row, Add multiple | Download, Upload (Image 2) */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-slate-200/80 dark:bg-[#202024] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                >
                  Add row
                </button>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-slate-200/80 dark:bg-[#202024] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                >
                  Add multiple
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-slate-200/80 dark:bg-[#202024] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                >
                  Download
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-slate-200/80 dark:bg-[#202024] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* 3 Columns of Totals: Total Quantity | Total (Company Currency) / Net Total (Company Currency) | Total / Net Total (Image 2) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3.5 pt-3">
              {/* Col 1 */}
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Total Quantity
                </label>
                <input
                  type="text"
                  readOnly
                  value={totalQuantity}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                />
              </div>

              {/* Col 2 */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Total (Company Currency)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${netTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Net Total (Company Currency)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${netTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>
              </div>

              {/* Col 3 */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Total
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${netTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Net Total
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${netTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= TAXES AND CHARGES SECTION (Image 2 & 3) ================= */}
          <div className="space-y-3.5 pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Taxes and Charges</h3>

            {/* Row 1: 3 cols: Tax Category, Shipping Rule, Incoterm */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Tax Category
                </label>
                <input
                  type="text"
                  value={taxCategory}
                  onChange={(e) => setTaxCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Shipping Rule
                </label>
                <input
                  type="text"
                  value={shippingRule}
                  onChange={(e) => setShippingRule(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Incoterm
                </label>
                <input
                  type="text"
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Sales Taxes and Charges Template (Image 3) */}
            <div className="w-full md:w-1/3 pr-2">
              <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                Sales Taxes and Charges Template
              </label>
              <input
                type="text"
                value={salesTaxTemplate}
                onChange={(e) => setSalesTaxTemplate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
              />
            </div>

            {/* Sub-table: Sales Taxes and Charges (Image 3) */}
            <div className="pt-2">
              <span className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1.5">
                Sales Taxes and Charges
              </span>
              <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F3F4F6]/80 dark:bg-[#202024] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                      <th className="py-2.5 px-3 w-10 text-center font-normal">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </th>
                      <th className="py-2.5 px-3 w-10 font-normal">No.</th>
                      <th className="py-2.5 px-3 font-normal min-w-[120px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Type <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 font-normal min-w-[150px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Account Head <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[90px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Tax Rate
                      </th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[100px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Net Amount
                      </th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[100px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Amount
                      </th>
                      <th className="py-2.5 px-3 text-right font-normal min-w-[100px] border-l border-slate-200/70 dark:border-[#27272A]">
                        Total
                      </th>
                      <th className="py-2.5 px-3 w-10 text-center font-normal border-l border-slate-200/70 dark:border-[#27272A]">
                        <Gear className="w-3.5 h-3.5 mx-auto text-slate-400" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#242428]">
                    {taxRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-5 text-center text-slate-400 dark:text-zinc-500">
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
                  className="px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-slate-200/80 dark:bg-[#202024] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                >
                  Add row
                </button>
              </div>
            </div>

            {/* Total Taxes and Charges Row (Image 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Total Taxes and Charges (Company Currency)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${totalTaxes.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Total Taxes and Charges
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${totalTaxes.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ================= TOTALS (USD) SECTION (Image 3 & 4) ================= */}
          <div className="space-y-3.5 pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Totals (USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
              {/* Col 1: Grand Total */}
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Grand Total
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${rawGrandTotal.toFixed(2)}`}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                />
              </div>

              {/* Col 2: Rounding Adjustment & Rounded Total */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Rounding Adjustment
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${roundingAdjustment.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Rounded Total
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${roundedTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= TOTALS (COMPANY CURRENCY) (USD) (Image 4 & 5) ================= */}
          <div className="space-y-3.5 pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">
              Totals (Company Currency) (USD)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Grand Total
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${rawGrandTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Rounding Adjustment
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${roundingAdjustment.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Rounded Total
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${roundedTotal.toFixed(2)}`}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= ACCORDION: ADDITIONAL DISCOUNT (Image 4 & 5) ================= */}
          <div className="pt-4 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsAdditionalDiscountOpen(!isAdditionalDiscountOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Additional Discount</span>
              {isAdditionalDiscountOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isAdditionalDiscountOpen && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {/* Col 1 */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Apply Additional Discount On
                    </label>
                    <div className="relative">
                      <select
                        value={applyDiscountOn}
                        onChange={(e) => setApplyDiscountOn(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs appearance-none focus:outline-none"
                      >
                        <option value="Grand Total">Grand Total</option>
                        <option value="Net Total">Net Total</option>
                      </select>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Additional Discount Amount (Company Currency)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`$ ${discountVal.toFixed(2)}`}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                    />
                  </div>
                </div>

                {/* Col 2 */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Additional Discount Percentage
                    </label>
                    <input
                      type="number"
                      value={additionalDiscountPercentage}
                      onChange={(e) => {
                        const pct = Number(e.target.value);
                        setAdditionalDiscountPercentage(e.target.value);
                        if (!isNaN(pct)) {
                          const calcAmt = (netTotal * pct) / 100;
                          setAdditionalDiscountAmount(calcAmt.toFixed(2));
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Additional Discount Amount
                    </label>
                    <input
                      type="number"
                      value={additionalDiscountAmount}
                      onChange={(e) => setAdditionalDiscountAmount(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: ADDRESS & CONTACT (Image 1) ================= */}
      {activeTab === 'address_contact' && (
        <div className="space-y-6 pt-1">
          {/* Shipping Address Section */}
          <div className="space-y-3.5">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">
              Shipping Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Shipping Address
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Dispatch Address Name
                </label>
                <input
                  type="text"
                  value={dispatchAddressName}
                  onChange={(e) => setDispatchAddressName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Company Address Section */}
          <div className="space-y-3.5 pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <h3 className="font-semibold text-slate-900 dark:text-white text-xs">
              Company Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Company Address Name
                </label>
                <input
                  type="text"
                  value={companyAddressName}
                  onChange={(e) => setCompanyAddressName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Company Contact Person
                </label>
                <input
                  type="text"
                  value={companyContactPerson}
                  onChange={(e) => setCompanyContactPerson(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TERMS (Image 2) ================= */}
      {activeTab === 'terms' && (
        <div className="space-y-4 pt-1">
          <div className="w-full md:w-1/2 md:pr-4">
            <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
              Terms
            </label>
            <input
              type="text"
              value={tcName}
              onChange={(e) => setTcName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1.5">
              Terms and Conditions Details
            </label>

            {/* Frappe Rich Text Editor Container (Image 2) */}
            <div className="rounded-xl border border-slate-200/90 dark:border-[#27272A] overflow-hidden bg-[#F3F4F6] dark:bg-[#202024]">
              {/* Toolbar */}
              <div className="bg-[#F8FAFC] dark:bg-[#1E1E22] border-b border-slate-200/80 dark:border-[#27272A] px-3 py-2 space-y-1.5 text-slate-700 dark:text-zinc-300 select-none">
                {/* Row 1 */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Normal ↕ */}
                  <div className="flex items-center gap-4 text-xs font-normal cursor-pointer hover:text-slate-900 dark:hover:text-white">
                    <span>Normal</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>

                  {/* --- ↕ */}
                  <div className="flex items-center gap-2 text-xs font-normal cursor-pointer hover:text-slate-900 dark:hover:text-white pl-1">
                    <span className="tracking-tighter">---</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>

                  {/* B I U S Tx */}
                  <div className="flex items-center gap-2.5 pl-1">
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Bold">
                      <Bold className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Italic">
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Underline">
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Strikethrough">
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Clear Formatting">
                      <RemoveFormatting className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* A (Text Color) & A (Highlight) */}
                  <div className="flex items-center gap-2.5 pl-2">
                    <button
                      type="button"
                      className="text-xs font-serif font-semibold underline decoration-2 underline-offset-2 hover:text-black dark:hover:text-white"
                      title="Text Color"
                    >
                      A
                    </button>
                    <button
                      type="button"
                      className="text-[11px] font-serif px-1 py-0.2 rounded border border-dashed border-slate-400 hover:text-black dark:hover:text-white"
                      title="Background Color"
                    >
                      A
                    </button>
                  </div>

                  {/* Quote & Code */}
                  <div className="flex items-center gap-2.5 pl-2">
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Blockquote">
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Code">
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Paragraph, Link, Image */}
                  <div className="flex items-center gap-2.5 pl-2">
                    <button type="button" className="text-xs font-serif hover:text-black dark:hover:text-white" title="Direction">
                      ▸¶
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Insert Link">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Insert Image">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Lists */}
                  <div className="flex items-center gap-2.5 pl-2">
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Ordered List">
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Bullet List">
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Checklist">
                      <ListChecks className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Alignment & Indent */}
                  <div className="flex items-center gap-2.5 pl-2">
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Align">
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Outdent">
                      <Outdent className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-0.5 hover:text-black dark:hover:text-white" title="Indent">
                      <Indent className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Table ↕ */}
                <div className="flex items-center gap-2 pt-0.5 text-xs font-normal cursor-pointer hover:text-slate-900 dark:hover:text-white w-fit">
                  <span>Table</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Editor Content Area */}
              <textarea
                rows={11}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3.5 py-3 bg-[#F3F4F6] dark:bg-[#202024] text-slate-900 dark:text-white text-xs focus:outline-none resize-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: MORE INFO (Images 3, 4, 5) ================= */}
      {activeTab === 'more_info' && (
        <div className="space-y-6 pt-1">
          {/* 1. Status Section (Image 3) */}
          <div>
            <button
              type="button"
              onClick={() => setIsStatusSectionOpen(!isStatusSectionOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Status</span>
              {isStatusSectionOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isStatusSectionOpen && (
              <div className="mt-3.5 w-full md:w-1/3">
                <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={docStatus}
                  onChange={(e) => setDocStatus(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* 2. Transporter Info Section (Image 3) */}
          <div className="pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsTransporterInfoOpen(!isTransporterInfoOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Transporter Info</span>
              {isTransporterInfoOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isTransporterInfoOpen && (
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                {/* Left Column */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Transporter
                    </label>
                    <input
                      type="text"
                      value={transporter}
                      onChange={(e) => setTransporter(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Transport Receipt No
                    </label>
                    <input
                      type="text"
                      value={transportReceiptNo}
                      onChange={(e) => setTransportReceiptNo(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Delivery Trip
                    </label>
                    <input
                      type="text"
                      value={deliveryTrip}
                      onChange={(e) => setDeliveryTrip(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Driver
                    </label>
                    <input
                      type="text"
                      value={driver}
                      onChange={(e) => setDriver(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Transport Receipt Date
                    </label>
                    <input
                      type="text"
                      value={transportReceiptDate}
                      onChange={(e) => setTransportReceiptDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Vehicle No
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Customer PO Details Section (Image 3 & 4) */}
          <div className="pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsCustomerPoOpen(!isCustomerPoOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Customer PO Details</span>
              {isCustomerPoOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isCustomerPoOpen && (
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Customer's Purchase Order No
                  </label>
                  <textarea
                    rows={5}
                    value={poNo}
                    onChange={(e) => setPoNo(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none resize-y"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Customer's Purchase Order Date
                  </label>
                  <input
                    type="text"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Commission Section (Image 4) */}
          <div className="pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsCommissionOpen(!isCommissionOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Commission</span>
              {isCommissionOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isCommissionOpen && (
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Sales Partner
                    </label>
                    <input
                      type="text"
                      value={salesPartner}
                      onChange={(e) => setSalesPartner(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Amount Eligible for Commission
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`$ ${netTotal.toFixed(2)}`}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent text-slate-800 dark:text-zinc-200 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Commission Rate (%)
                    </label>
                    <input
                      type="text"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Total Commission
                    </label>
                    <input
                      type="text"
                      value={totalCommission}
                      onChange={(e) => setTotalCommission(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. Sales Team Section (Image 4) */}
          <div className="pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsSalesTeamOpen(!isSalesTeamOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Sales Team</span>
              {isSalesTeamOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isSalesTeamOpen && (
              <div className="mt-3.5 space-y-2">
                <span className="block text-[11px] text-slate-600 dark:text-zinc-400">
                  Sales Team
                </span>
                <div className="border border-slate-200/90 dark:border-[#27272A] rounded-xl overflow-x-auto bg-white dark:bg-[#18181B]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F3F4F6]/80 dark:bg-[#202024] text-slate-500 dark:text-zinc-400 border-b border-slate-200/90 dark:border-[#27272A]">
                        <th className="py-2.5 px-3 w-10 text-center font-normal">
                          <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                        </th>
                        <th className="py-2.5 px-3 w-10 font-normal">No.</th>
                        <th className="py-2.5 px-3 font-normal min-w-[140px] border-l border-slate-200/70 dark:border-[#27272A]">
                          Sales Person <span className="text-rose-500">*</span>
                        </th>
                        <th className="py-2.5 px-3 text-right font-normal min-w-[110px] border-l border-slate-200/70 dark:border-[#27272A]">
                          Contribution (%)
                        </th>
                        <th className="py-2.5 px-3 text-right font-normal min-w-[130px] border-l border-slate-200/70 dark:border-[#27272A]">
                          Contribution to Net...
                        </th>
                        <th className="py-2.5 px-3 text-right font-normal min-w-[110px] border-l border-slate-200/70 dark:border-[#27272A]">
                          Commission Rate
                        </th>
                        <th className="py-2.5 px-3 text-right font-normal min-w-[100px] border-l border-slate-200/70 dark:border-[#27272A]">
                          Incentives
                        </th>
                        <th className="py-2.5 px-3 w-10 text-center font-normal border-l border-slate-200/70 dark:border-[#27272A]">
                          <Gear className="w-3.5 h-3.5 mx-auto text-slate-400" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#242428]">
                      {salesTeamRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-5 text-center text-slate-400 dark:text-zinc-500">
                            No rows
                          </td>
                        </tr>
                      ) : (
                        salesTeamRows.map((row, idx) => (
                          <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-[#202024]/60">
                            <td className="py-2 px-3 text-center">
                              <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                            </td>
                            <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3 border-l border-slate-100 dark:border-[#242428]">
                              <input
                                type="text"
                                value={row.salesPerson}
                                onChange={(e) =>
                                  setSalesTeamRows((prev) =>
                                    prev.map((r, i) => (i === idx ? { ...r, salesPerson: e.target.value } : r))
                                  )
                                }
                                placeholder="Sales Person"
                                className="w-full bg-transparent outline-none text-slate-900 dark:text-white"
                              />
                            </td>
                            <td className="py-2 px-3 text-right border-l border-slate-100 dark:border-[#242428]">
                              {row.contributionPct}%
                            </td>
                            <td className="py-2 px-3 text-right border-l border-slate-100 dark:border-[#242428]">
                              $ {row.contributionToNetTotal.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-right border-l border-slate-100 dark:border-[#242428]">
                              {row.commissionRate}%
                            </td>
                            <td className="py-2 px-3 text-right border-l border-slate-100 dark:border-[#242428]">
                              $ {row.incentives.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-center border-l border-slate-100 dark:border-[#242428]">
                              <button
                                type="button"
                                onClick={() => setSalesTeamRows((p) => p.filter((_, i) => i !== idx))}
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

                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setSalesTeamRows((prev) => [
                        ...prev,
                        {
                          id: `st-${Date.now()}`,
                          salesPerson: '',
                          contributionPct: 100,
                          contributionToNetTotal: netTotal,
                          commissionRate: 0,
                          incentives: 0,
                        },
                      ])
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#F3F4F6] hover:bg-slate-200/80 dark:bg-[#202024] dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 transition-colors"
                  >
                    Add row
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 6. Print Settings Section (Image 5) */}
          <div className="pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsPrintSettingsOpen(!isPrintSettingsOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Print Settings</span>
              {isPrintSettingsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isPrintSettingsOpen && (
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Letter Head
                    </label>
                    <input
                      type="text"
                      value={letterHead}
                      onChange={(e) => setLetterHead(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="printWithoutAmountDN"
                      checked={printWithoutAmount}
                      onChange={(e) => setPrintWithoutAmount(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                    />
                    <label
                      htmlFor="printWithoutAmountDN"
                      className="text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none"
                    >
                      Print Without Amount
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="groupSameItemsDN"
                      checked={groupSameItems}
                      onChange={(e) => setGroupSameItems(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                    />
                    <label
                      htmlFor="groupSameItemsDN"
                      className="text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none"
                    >
                      Group same items
                    </label>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Print Heading
                    </label>
                    <input
                      type="text"
                      value={printHeading}
                      onChange={(e) => setPrintHeading(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Print Language
                    </label>
                    <input
                      type="text"
                      value={printLanguage}
                      onChange={(e) => setPrintLanguage(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 7. UTM Analytics Section (Image 5) */}
          <div className="pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsUtmAnalyticsOpen(!isUtmAnalyticsOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>UTM Analytics</span>
              {isUtmAnalyticsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isUtmAnalyticsOpen && (
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Source
                    </label>
                    <input
                      type="text"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Medium
                    </label>
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Campaign
                    </label>
                    <input
                      type="text"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Content
                    </label>
                    <input
                      type="text"
                      value={utmContent}
                      onChange={(e) => setUtmContent(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 8. Additional Info Section (Image 5) */}
          <div className="pt-5 border-t border-slate-100 dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white"
            >
              <span>Additional Info</span>
              {isAdditionalInfoOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isAdditionalInfoOpen && (
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isInternalCustomerDN"
                      checked={isInternalCustomer}
                      onChange={(e) => setIsInternalCustomer(e.target.checked)}
                      className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0 w-3.5 h-3.5"
                    />
                    <label
                      htmlFor="isInternalCustomerDN"
                      className="text-slate-700 dark:text-zinc-300 text-xs cursor-pointer select-none"
                    >
                      Is Internal Customer
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Inter Company Reference
                    </label>
                    <input
                      type="text"
                      value={interCompanyReference}
                      onChange={(e) => setInterCompanyReference(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                      Territory
                    </label>
                    <input
                      type="text"
                      value={territory}
                      onChange={(e) => setTerritory(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-zinc-400 mb-1">
                    Instructions
                  </label>
                  <textarea
                    rows={5}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] border border-transparent focus:border-slate-300 dark:focus:border-[#3F3F46] text-slate-900 dark:text-white text-xs focus:outline-none resize-y"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewDeliveryNoteForm;

