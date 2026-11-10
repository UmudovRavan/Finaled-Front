import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ScanBarcode,
  Settings as Gear,
  Pencil,
  Trash2,
  Plus,
  ChevronsUpDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  Code,
  Link2,
  Image,
  List,
  ListOrdered,
  CheckSquare,
  AlignLeft,
  Indent,
  Outdent,
} from 'lucide-react';
import type { DeliveryNoteRecord, DeliveryNoteItem } from '../../types';

interface DeliveryNoteDetailContentProps {
  note: DeliveryNoteRecord;
}

export const DeliveryNoteDetailContent: React.FC<DeliveryNoteDetailContentProps> = ({
  note,
}) => {
  const [activeTab, setActiveTab] = useState<
    'details' | 'address_contact' | 'terms' | 'more_info' | 'connections'
  >('details');

  // Details Tab state (Image 1)
  const [customer, setCustomer] = useState(note.customerName || 'Grant Plastics Ltd.');
  const [date, setDate] = useState(note.date || '09-11-2026');
  const [postingTime, setPostingTime] = useState(note.postingTime || '14:53:21');
  const [editDateTime, setEditDateTime] = useState(false);
  const [company, setCompany] = useState(note.company || 'Avalon (Demo)');
  const [isReturn, setIsReturn] = useState(!!note.isReturn);

  // Currency and Price List accordion (collapsed by default in Image 1)
  const [isCurrencySectionOpen, setIsCurrencySectionOpen] = useState(false);
  const [currency, setCurrency] = useState(note.currency || 'USD');
  const [priceList, setPriceList] = useState('Standard Selling');
  const [exchangeRate, setExchangeRate] = useState('1.000000000');
  const [priceListCurrency, setPriceListCurrency] = useState('USD');
  const [priceListExchangeRate, setPriceListExchangeRate] = useState('1.000000000');
  const [ignorePricingRule, setIgnorePricingRule] = useState(false);

  // Items section (Image 1)
  const [scanBarcode, setScanBarcode] = useState('');
  const [setSourceWarehouse, setSetSourceWarehouse] = useState(
    note.setSourceWarehouse || 'Bitmiş Ürünler - AD'
  );
  const [items, setItems] = useState<DeliveryNoteItem[]>(
    note.items && note.items.length > 0
      ? note.items
      : [
          {
            id: 'dn-row-1',
            itemCode: 'SKU002: Laptop',
            itemName: 'SKU002: Laptop',
            qty: 1,
            uom: 'Nos',
            rate: 0.0,
            amount: 0.0,
            warehouse: 'Bitmiş Ürünler - AD',
          },
        ]
  );

  // Taxes and Charges section (Image 2)
  const [taxCategory, setTaxCategory] = useState('');
  const [shippingRule, setShippingRule] = useState('');
  const [incoterm, setIncoterm] = useState('');
  const [salesTaxesTemplate, setSalesTaxesTemplate] = useState('');
  const [taxes, setTaxes] = useState<
    {
      id: string;
      type: string;
      accountHead: string;
      taxRate: number;
      netAmount: number;
      amount: number;
      total: number;
    }[]
  >([]);

  // Additional Discount section (Image 3)
  const [isAdditionalDiscountOpen, setIsAdditionalDiscountOpen] = useState(true);
  const [applyDiscountOn, setApplyDiscountOn] = useState('Grand Total');
  const [additionalDiscountPercentage, setAdditionalDiscountPercentage] = useState('0.000');
  const [additionalDiscountAmount, setAdditionalDiscountAmount] = useState('0.00');

  // Address & Contact Tab state (Image 1)
  const [billingAddressName, setBillingAddressName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [dispatchAddressName, setDispatchAddressName] = useState('');
  const [companyAddressName, setCompanyAddressName] = useState('');
  const [companyContactPerson, setCompanyContactPerson] = useState('');

  // Terms Tab state (Image 2)
  const [terms, setTerms] = useState('');
  const [termsDetails, setTermsDetails] = useState('');

  // More Info Tab state (Image 3: collapsed by default)
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [docStatus, setDocStatus] = useState(note.status || 'Draft');

  const [isTransporterOpen, setIsTransporterOpen] = useState(false);
  const [transporter, setTransporter] = useState('');
  const [transportReceiptDate, setTransportReceiptDate] = useState('09-11-2026');
  const [transportReceiptNo, setTransportReceiptNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [deliveryTrip, setDeliveryTrip] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driver, setDriver] = useState('');

  const [isCustomerPoOpen, setIsCustomerPoOpen] = useState(false);
  const [customerPoNo, setCustomerPoNo] = useState('');
  const [customerPoDate, setCustomerPoDate] = useState('');

  const [isCommissionOpen, setIsCommissionOpen] = useState(false);
  const [salesPartner, setSalesPartner] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [amountEligibleForCommission, setAmountEligibleForCommission] = useState('$ 0.00');
  const [totalCommission, setTotalCommission] = useState('');

  const [isSalesTeamOpen, setIsSalesTeamOpen] = useState(false);
  const [salesTeam, setSalesTeam] = useState<
    {
      id: string;
      salesPerson: string;
      contribution: string;
      contributionToNetTotal: string;
      commissionRate: string;
      incentives: string;
    }[]
  >([]);

  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false);
  const [letterHead, setLetterHead] = useState('Company Letterhead - Grey');
  const [printHeading, setPrintHeading] = useState('');
  const [printWithoutAmount, setPrintWithoutAmount] = useState(false);
  const [groupSameItems, setGroupSameItems] = useState(false);
  const [printLanguage, setPrintLanguage] = useState('en');

  const [isUtmAnalyticsOpen, setIsUtmAnalyticsOpen] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmContent, setUtmContent] = useState('');

  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(false);
  const [isInternalCustomer, setIsInternalCustomer] = useState(false);
  const [interCompanyReference, setInterCompanyReference] = useState('');
  const [territory, setTerritory] = useState('');
  const [instructions, setInstructions] = useState('');

  // Comments & Activity (Image 3)
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([]);
  const [activities, setActivities] = useState([
    { text: 'You created this', time: '35 minutes ago' },
    { text: 'You last edited this', time: '35 minutes ago' },
  ]);

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `dn-row-${Date.now()}`,
        itemCode: '',
        itemName: '',
        qty: 0,
        uom: 'Nos',
        rate: 0.0,
        amount: 0.0,
        warehouse: setSourceWarehouse || 'Bitmiş Ürünler - AD',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id: string, field: keyof DeliveryNoteItem, val: any) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [field]: val };
        if (field === 'qty' || field === 'rate') {
          const q = field === 'qty' ? Number(val) || 0 : it.qty;
          const r = field === 'rate' ? Number(val) || 0 : it.rate;
          updated.amount = q * r;
        }
        return updated;
      })
    );
  };

  const handleAddTaxRow = () => {
    setTaxes((prev) => [
      ...prev,
      {
        id: `tax-${Date.now()}`,
        type: 'On Net Total',
        accountHead: '',
        taxRate: 0,
        netAmount: 0,
        amount: 0,
        total: 0,
      },
    ]);
  };

  const handleAddSalesTeamRow = () => {
    setSalesTeam((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}`,
        salesPerson: '',
        contribution: '100%',
        contributionToNetTotal: '$ 0.00',
        commissionRate: '0%',
        incentives: '$ 0.00',
      },
    ]);
  };

  const handleAddComment = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && commentText.trim()) {
      setComments((prev) => [...prev, commentText.trim()]);
      setActivities((prev) => [
        ...prev,
        { text: `You commented: "${commentText.trim()}"`, time: 'Just now' },
      ]);
      setCommentText('');
    }
  };

  const totalQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const totalAmount = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalTaxesAmount = taxes.reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const discountVal = Number(additionalDiscountAmount) || 0;
  const grandTotal = Math.max(0, totalAmount + totalTaxesAmount - discountVal);

  return (
    <div className="flex-1 space-y-4 text-xs font-sans min-w-0">
      {/* Top Blue Banner (Image 1): Submit this document to confirm */}
      {note.status === 'Draft' && (
        <div className="bg-[#EBF5FF] dark:bg-sky-950/40 text-[#0070CC] dark:text-sky-400 text-xs font-medium px-4 py-2.5 rounded-lg select-none">
          Submit this document to confirm
        </div>
      )}

      {/* 5 Tabs Row (Image 1, 2, 3): Details | Address & Contact | Terms | More Info | Connections */}
      <div className="flex items-center gap-6 border-b border-slate-200/90 dark:border-[#27272A] select-none overflow-x-auto">
        {[
          { id: 'details', label: 'Details' },
          { id: 'address_contact', label: 'Address & Contact' },
          { id: 'terms', label: 'Terms' },
          { id: 'more_info', label: 'More Info' },
          { id: 'connections', label: 'Connections' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 font-medium border-b-2 whitespace-nowrap transition-all ${
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

      {/* TAB 1: DETAILS (Images 1, 2, 3) */}
      {activeTab === 'details' && (
        <div className="space-y-6 pt-2">
          {/* Top 3-column grid (Image 1): Customer * | Date *, Posting Time *, Edit Posting Date and Time | Company *, Is Return */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
            {/* Column 1: Customer * */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Customer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Column 2: Date *, Posting Time *, Edit Posting Date and Time */}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={date}
                  disabled={!editDateTime}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none disabled:opacity-90"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Posting Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={postingTime}
                  disabled={!editDateTime}
                  onChange={(e) => setPostingTime(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none disabled:opacity-90"
                />
              </div>

              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={editDateTime}
                    onChange={(e) => setEditDateTime(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                  />
                  <span>Edit Posting Date and Time</span>
                </label>
              </div>
            </div>

            {/* Column 3: Company *, Is Return */}
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

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={isReturn}
                    onChange={(e) => setIsReturn(e.target.checked)}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                  />
                  <span>Is Return</span>
                </label>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Currency and Price List > (Image 1) */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsCurrencySectionOpen(!isCurrencySectionOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-[13px]"
            >
              <span>Currency and Price List</span>
              {isCurrencySectionOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isCurrencySectionOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Currency <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Exchange Rate <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-medium outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Price List <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={priceList}
                      onChange={(e) => setPriceList(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Price List Currency <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={priceListCurrency}
                      onChange={(e) => setPriceListCurrency(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Price List Exchange Rate
                    </label>
                    <input
                      type="text"
                      value={priceListExchangeRate}
                      onChange={(e) => setPriceListExchangeRate(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={ignorePricingRule}
                        onChange={(e) => setIgnorePricingRule(e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                      />
                      <span>Ignore Pricing Rule</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Items Section (Image 1 & Image 2) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">Items</h3>

            {/* Scan Barcode | Set Source Warehouse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Scan Barcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={scanBarcode}
                    onChange={(e) => setScanBarcode(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 pr-8 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                  <ScanBarcode className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Set Source Warehouse
                </label>
                <input
                  type="text"
                  value={setSourceWarehouse}
                  onChange={(e) => setSetSourceWarehouse(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            {/* Delivery Note Item Table (Image 1) */}
            <div className="space-y-2 pt-2">
              <label className="block text-slate-600 dark:text-zinc-400">
                Delivery Note Item
              </label>

              <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                      <th className="py-2 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 dark:border-zinc-700"
                        />
                      </th>
                      <th className="py-2 px-2 w-10">No.</th>
                      <th className="py-2 px-3 min-w-[160px]">
                        Item Code <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2 px-3 w-28 text-right">
                        Quantity <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2 px-3 w-28">
                        UOM <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2 px-3 w-28 text-right">Rate</th>
                      <th className="py-2 px-3 w-28 text-right">Amount</th>
                      <th className="py-2 px-3 min-w-[130px]">Warehouse</th>
                      <th className="py-2 px-2 w-10 text-center">
                        <Gear className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                    {items.map((row, idx) => (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
                      >
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 dark:border-zinc-700"
                          />
                        </td>
                        <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.itemCode}
                            onChange={(e) =>
                              handleItemChange(row.id, 'itemCode', e.target.value)
                            }
                            className="w-full bg-transparent outline-none font-semibold text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) =>
                              handleItemChange(row.id, 'qty', e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-right font-semibold text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.uom}
                            onChange={(e) =>
                              handleItemChange(row.id, 'uom', e.target.value)
                            }
                            className="w-full bg-transparent outline-none font-semibold text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1 text-slate-800 dark:text-zinc-200">
                            <span>$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={row.rate}
                              onChange={(e) =>
                                handleItemChange(row.id, 'rate', e.target.value)
                              }
                              className="w-16 bg-transparent outline-none text-right"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 dark:text-zinc-300">
                          $ {row.amount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.warehouse || ''}
                            onChange={(e) =>
                              handleItemChange(row.id, 'warehouse', e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-slate-700 dark:text-zinc-300 truncate"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Pencil className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                className="text-slate-400 hover:text-rose-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Buttons: Add row | Add multiple --- Download | Upload */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-2.5 py-1 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs transition-colors"
                  >
                    Add row
                  </button>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-2.5 py-1 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs transition-colors"
                  >
                    Add multiple
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs transition-colors"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs transition-colors"
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>

            {/* Total Quantity | Total (USD) (Image 1 & Image 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Total Quantity
                </label>
                <input
                  type="text"
                  readOnly
                  value={totalQty}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Total (USD)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${totalAmount.toFixed(2)}`}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Taxes and Charges Section (Image 2) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
              Taxes and Charges
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Tax Category
                </label>
                <input
                  type="text"
                  value={taxCategory}
                  onChange={(e) => setTaxCategory(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Shipping Rule
                </label>
                <input
                  type="text"
                  value={shippingRule}
                  onChange={(e) => setShippingRule(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Incoterm
                </label>
                <input
                  type="text"
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Sales Taxes and Charges Template
                </label>
                <input
                  type="text"
                  value={salesTaxesTemplate}
                  onChange={(e) => setSalesTaxesTemplate(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
            </div>

            {/* Sales Taxes and Charges Table */}
            <div className="space-y-2 pt-1">
              <label className="block text-slate-600 dark:text-zinc-400">
                Sales Taxes and Charges
              </label>

              <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                      <th className="py-2 px-3 w-8 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 dark:border-zinc-700"
                        />
                      </th>
                      <th className="py-2 px-2 w-10">No.</th>
                      <th className="py-2 px-3">
                        Type <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2 px-3">
                        Account Head <span className="text-rose-500">*</span>
                      </th>
                      <th className="py-2 px-3 text-right">Tax Rate</th>
                      <th className="py-2 px-3 text-right">Net Amount</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-2 w-10 text-center">
                        <Gear className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="py-5 text-center text-slate-400 dark:text-zinc-500"
                        >
                          No rows
                        </td>
                      </tr>
                    ) : (
                      taxes.map((t, idx) => (
                        <tr
                          key={t.id}
                          className="border-b border-slate-100 dark:border-[#27272A] last:border-0"
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300 dark:border-zinc-700"
                            />
                          </td>
                          <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3">{t.type}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={t.accountHead}
                              placeholder="Account Head"
                              onChange={(e) => {
                                const val = e.target.value;
                                setTaxes((prev) =>
                                  prev.map((x) =>
                                    x.id === t.id ? { ...x, accountHead: val } : x
                                  )
                                );
                              }}
                              className="w-full bg-transparent outline-none"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">{t.taxRate}%</td>
                          <td className="py-2 px-3 text-right">
                            $ {t.netAmount.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            $ {t.amount.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            $ {t.total.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setTaxes((prev) => prev.filter((x) => x.id !== t.id))
                              }
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-3 h-3 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAddTaxRow}
                  className="px-2.5 py-1 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs transition-colors"
                >
                  Add row
                </button>
              </div>
            </div>

            {/* Total Taxes and Charges row (Image 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Total Taxes and Charges (Company Currency) (USD)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${totalTaxesAmount.toFixed(2)}`}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Total Taxes and Charges (USD)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$ ${totalTaxesAmount.toFixed(2)}`}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Totals (USD) Section (Image 2 & Image 3) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
              Totals (USD)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Grand Total (USD), In Words */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Grand Total (USD)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${grandTotal.toFixed(2)}`}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    In Words
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="USD Zero only."
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5">
                    In Words (Export) will be visible once you save the Delivery Note.
                  </p>
                </div>
              </div>

              {/* Right Column: Rounding Adjustment (USD), Rounded Total (USD) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Rounding Adjustment (USD)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="$ 0.00"
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Rounded Total (USD)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`$ ${Math.round(grandTotal).toFixed(2)}`}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Additional Discount ⌄ Section (Image 3) */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsAdditionalDiscountOpen(!isAdditionalDiscountOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-[13px]"
            >
              <span>Additional Discount</span>
              {isAdditionalDiscountOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isAdditionalDiscountOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Apply Additional Discount On
                  </label>
                  <div className="relative">
                    <select
                      value={applyDiscountOn}
                      onChange={(e) => setApplyDiscountOn(e.target.value)}
                      className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    >
                      <option value="Grand Total">Grand Total</option>
                      <option value="Net Total">Net Total</option>
                    </select>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Additional Discount Percentage
                    </label>
                    <input
                      type="text"
                      value={additionalDiscountPercentage}
                      onChange={(e) =>
                        setAdditionalDiscountPercentage(e.target.value)
                      }
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Additional Discount Amount (USD)
                    </label>
                    <input
                      type="text"
                      value={additionalDiscountAmount}
                      onChange={(e) => setAdditionalDiscountAmount(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADDRESS & CONTACT (Image 1) */}
      {activeTab === 'address_contact' && (
        <div className="space-y-6 pt-2">
          {/* Billing Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
              Billing Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Billing Address Name
                </label>
                <input
                  type="text"
                  value={billingAddressName}
                  onChange={(e) => setBillingAddressName(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
              Shipping Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Shipping Address
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Dispatch Address Name
                </label>
                <input
                  type="text"
                  value={dispatchAddressName}
                  onChange={(e) => setDispatchAddressName(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Company Address */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
              Company Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Company Address Name
                </label>
                <input
                  type="text"
                  value={companyAddressName}
                  onChange={(e) => setCompanyAddressName(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Company Contact Person
                </label>
                <input
                  type="text"
                  value={companyContactPerson}
                  onChange={(e) => setCompanyContactPerson(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TERMS (Image 2) */}
      {activeTab === 'terms' && (
        <div className="space-y-5 pt-2">
          <div className="w-full md:w-1/2">
            <label className="block text-slate-600 dark:text-zinc-400 mb-1.5">
              Terms
            </label>
            <input
              type="text"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 mb-1.5">
              Terms and Conditions Details
            </label>
            <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
              <div className="bg-[#F8FAFC] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] px-3 py-1.5 space-y-1.5 text-slate-600 dark:text-zinc-300">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 text-xs cursor-pointer">
                    <span>Normal</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1 text-xs cursor-pointer">
                    <span>---</span>
                    <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Bold className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <Italic className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <Underline className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <Strikethrough className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <span className="font-serif text-xs cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      T<sub>x</sub>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs border-b-2 border-slate-700 dark:border-zinc-300 leading-none px-0.5 cursor-pointer">
                      A
                    </span>
                    <span className="font-semibold text-xs bg-slate-200 dark:bg-zinc-700 px-1 rounded leading-none cursor-pointer">
                      A
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Quote className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <Code className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs cursor-pointer hover:text-slate-900 dark:hover:text-white">
                      ▸¶
                    </span>
                    <Link2 className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <Image className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ListOrdered className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <List className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <CheckSquare className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <AlignLeft className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <Outdent className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    <Indent className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs cursor-pointer pt-0.5">
                  <span>Table</span>
                  <ChevronsUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <textarea
                rows={11}
                value={termsDetails}
                onChange={(e) => setTermsDetails(e.target.value)}
                className="w-full bg-[#F3F4F6] dark:bg-[#1E1E22] p-3 text-slate-800 dark:text-zinc-200 outline-none resize-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MORE INFO */}
      {activeTab === 'more_info' && (
        <div className="space-y-6 pt-2">
          {/* Status */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[13px]"
            >
              <span>Status</span>
              {isStatusOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isStatusOpen && (
              <div className="w-full md:w-1/2">
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={docStatus}
                  className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-semibold outline-none"
                />
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Transporter Info */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsTransporterOpen(!isTransporterOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[13px]"
            >
              <span>Transporter Info</span>
              {isTransporterOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isTransporterOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Transporter
                    </label>
                    <input
                      type="text"
                      value={transporter}
                      onChange={(e) => setTransporter(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Transport Receipt No
                    </label>
                    <input
                      type="text"
                      value={transportReceiptNo}
                      onChange={(e) => setTransportReceiptNo(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Vehicle No
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Transport Receipt Date
                    </label>
                    <input
                      type="text"
                      value={transportReceiptDate}
                      onChange={(e) => setTransportReceiptDate(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Delivery Trip
                    </label>
                    <input
                      type="text"
                      value={deliveryTrip}
                      onChange={(e) => setDeliveryTrip(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Driver
                    </label>
                    <input
                      type="text"
                      value={driver}
                      onChange={(e) => setDriver(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Customer PO Details */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsCustomerPoOpen(!isCustomerPoOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[13px]"
            >
              <span>Customer PO Details</span>
              {isCustomerPoOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isCustomerPoOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Customer's Purchase Order No
                  </label>
                  <textarea
                    rows={5}
                    value={customerPoNo}
                    onChange={(e) => setCustomerPoNo(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 outline-none resize-y"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Customer's Purchase Order Date
                  </label>
                  <input
                    type="text"
                    value={customerPoDate}
                    onChange={(e) => setCustomerPoDate(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Commission */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsCommissionOpen(!isCommissionOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[13px]"
            >
              <span>Commission</span>
              {isCommissionOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isCommissionOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Sales Partner
                    </label>
                    <input
                      type="text"
                      value={salesPartner}
                      onChange={(e) => setSalesPartner(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Commission Rate (%)
                    </label>
                    <input
                      type="text"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Amount Eligible for Commission
                    </label>
                    <input
                      type="text"
                      value={amountEligibleForCommission}
                      onChange={(e) => setAmountEligibleForCommission(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Total Commission
                    </label>
                    <input
                      type="text"
                      value={totalCommission}
                      onChange={(e) => setTotalCommission(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Sales Team */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsSalesTeamOpen(!isSalesTeamOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[13px]"
            >
              <span>Sales Team</span>
              {isSalesTeamOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isSalesTeamOpen && (
              <div className="space-y-2">
                <label className="block text-slate-600 dark:text-zinc-400">
                  Sales Team
                </label>
                <div className="border border-slate-200 dark:border-[#27272A] rounded-lg overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-400 font-normal">
                        <th className="py-2 px-3 w-8 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 dark:border-zinc-700"
                          />
                        </th>
                        <th className="py-2 px-2 w-10">No.</th>
                        <th className="py-2 px-3">
                          Sales Person <span className="text-rose-500">*</span>
                        </th>
                        <th className="py-2 px-3 text-right">Contribution (%)</th>
                        <th className="py-2 px-3 text-right">Contribution to Net...</th>
                        <th className="py-2 px-3 text-right">Commission Rate</th>
                        <th className="py-2 px-3 text-right">Incentives</th>
                        <th className="py-2 px-2 w-10 text-center">
                          <Gear className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesTeam.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-5 text-center text-slate-400 dark:text-zinc-500"
                          >
                            No rows
                          </td>
                        </tr>
                      ) : (
                        salesTeam.map((st, idx) => (
                          <tr
                            key={st.id}
                            className="border-b border-slate-100 dark:border-[#27272A] last:border-0"
                          >
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300 dark:border-zinc-700"
                              />
                            </td>
                            <td className="py-2 px-2 text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3">{st.salesPerson || 'Sales Rep'}</td>
                            <td className="py-2 px-3 text-right">{st.contribution}</td>
                            <td className="py-2 px-3 text-right">
                              {st.contributionToNetTotal}
                            </td>
                            <td className="py-2 px-3 text-right">{st.commissionRate}</td>
                            <td className="py-2 px-3 text-right">{st.incentives}</td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setSalesTeam((prev) =>
                                    prev.filter((x) => x.id !== st.id)
                                  )
                                }
                                className="text-slate-400 hover:text-rose-500"
                              >
                                <Trash2 className="w-3 h-3 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleAddSalesTeamRow}
                    className="px-2.5 py-1 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs transition-colors"
                  >
                    Add row
                  </button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Print Settings */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsPrintSettingsOpen(!isPrintSettingsOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[13px]"
            >
              <span>Print Settings</span>
              {isPrintSettingsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isPrintSettingsOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Letter Head
                    </label>
                    <input
                      type="text"
                      value={letterHead}
                      onChange={(e) => setLetterHead(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Print Heading
                    </label>
                    <input
                      type="text"
                      value={printHeading}
                      onChange={(e) => setPrintHeading(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={printWithoutAmount}
                        onChange={(e) => setPrintWithoutAmount(e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                      />
                      <span>Print Without Amount</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={groupSameItems}
                        onChange={(e) => setGroupSameItems(e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                      />
                      <span>Group same items</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Print Language
                    </label>
                    <input
                      type="text"
                      value={printLanguage}
                      onChange={(e) => setPrintLanguage(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* UTM Analytics */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsUtmAnalyticsOpen(!isUtmAnalyticsOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[13px]"
            >
              <span>UTM Analytics</span>
              {isUtmAnalyticsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isUtmAnalyticsOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Source
                    </label>
                    <input
                      type="text"
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Medium
                    </label>
                    <input
                      type="text"
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Campaign
                    </label>
                    <input
                      type="text"
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Content
                    </label>
                    <input
                      type="text"
                      value={utmContent}
                      onChange={(e) => setUtmContent(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100 dark:border-[#27272A]" />

          {/* Additional Info */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 text-[13px]"
            >
              <span>Additional Info</span>
              {isAdditionalInfoOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {isAdditionalInfoOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-4">
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 select-none">
                      <input
                        type="checkbox"
                        checked={isInternalCustomer}
                        onChange={(e) => setIsInternalCustomer(e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 focus:ring-0"
                      />
                      <span>Is Internal Customer</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Inter Company Reference
                    </label>
                    <input
                      type="text"
                      value={interCompanyReference}
                      onChange={(e) => setInterCompanyReference(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Territory
                    </label>
                    <input
                      type="text"
                      value={territory}
                      onChange={(e) => setTerritory(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                      Instructions
                    </label>
                    <textarea
                      rows={5}
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-2 rounded-lg text-slate-800 dark:text-zinc-200 outline-none resize-y"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CONNECTIONS (Images 4 & 5) */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3">
          {/* Column 1: Related & Subscription */}
          <div className="space-y-6">
            <div className="space-y-2.5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
                Related
              </h3>
              <div className="space-y-2">
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Sales Invoice
                </div>
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer flex items-center justify-between">
                  <span>Packing Slip</span>
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-600 dark:text-zinc-300 transition-colors"
                    title="New Packing Slip"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Delivery Trip
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
                Subscription
              </h3>
              <div className="space-y-2">
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Auto Repeat
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Reference & Internal Transfer */}
          <div className="space-y-6">
            <div className="space-y-2.5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
                Reference
              </h3>
              <div className="space-y-2">
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Sales Order
                </div>
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Shipment
                </div>
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Quality Inspection
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
                Internal Transfer
              </h3>
              <div className="space-y-2">
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Material Request
                </div>
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Purchase Order
                </div>
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Purchase Receipt
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Returns */}
          <div className="space-y-6">
            <div className="space-y-2.5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
                Returns
              </h3>
              <div className="space-y-2">
                <div className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 hover:border-slate-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                  Stock Entry
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section: Comments & Activity (Image 3) */}
      <div className="pt-6 space-y-6 border-t border-slate-200/90 dark:border-[#27272A]">
        {/* Comments Section */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Comments
          </h4>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center shrink-0">
              A
            </div>
            <input
              type="text"
              placeholder="Type a reply / comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleAddComment}
              className="flex-1 px-3 py-2 rounded-lg bg-[#F3F4F6] dark:bg-[#202024] text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {comments.length > 0 && (
            <div className="pl-10 space-y-2">
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#202024] border border-slate-100 dark:border-[#2A2A2E] text-slate-800 dark:text-zinc-200 text-xs"
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Timeline Section (Image 3) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Activity
            </h4>
            <button
              type="button"
              className="px-3 py-1 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
            >
              + New Email
            </button>
          </div>

          <div className="flex items-end justify-between pl-2">
            <ul className="relative border-l border-slate-200 dark:border-zinc-700 ml-1.5 space-y-5 py-0.5">
              {activities.map((act, i) => (
                <li key={i} className="relative pl-5 text-xs text-slate-600 dark:text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-zinc-300 absolute -left-[3.5px] top-1.5" />
                  <span>
                    {act.text}{' '}
                    <span className="text-slate-400 dark:text-zinc-500">· {act.time}</span>
                  </span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-1.5 rounded-md bg-[#F3F4F6] dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
              title="Scroll to top"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNoteDetailContent;

