import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  ScanBarcode,
  Settings as Gear,
  Pencil,
  Trash2,
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
import { useMaterialRequest } from '../../context';
import type { MaterialRequestItem, MaterialRequestPurpose } from '../../types';

export const NewMaterialRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { createRequest } = useMaterialRequest();

  const [activeTab, setActiveTab] = useState<'details' | 'terms' | 'more_info'>(
    'details'
  );

  // Details Tab state (Image 2)
  const [series, setSeries] = useState('MAT-MR-.YYYY.-');
  const [purpose, setPurpose] = useState<MaterialRequestPurpose>('Purchase');
  const [company, setCompany] = useState('Avalon (Demo)');
  const [transactionDate, setTransactionDate] = useState('09-11-2026');
  const [requiredBy, setRequiredBy] = useState('');
  const [priceList, setPriceList] = useState('Standard Buying');

  // Items section (Image 2)
  const [scanBarcode, setScanBarcode] = useState('');
  const [setWarehouse, setSetWarehouse] = useState('');
  const [items, setItems] = useState<MaterialRequestItem[]>([
    {
      id: 'mr-row-1',
      itemCode: '',
      itemName: '',
      requiredBy: '',
      qty: 0.0,
      warehouse: '',
      uom: '',
    },
  ]);

  // Terms Tab state (Image 3)
  const [terms, setTerms] = useState('');
  const [termsContent, setTermsContent] = useState('');

  // More Info Tab state (Image 4: Printing Details ⌄)
  const [isPrintingDetailsOpen, setIsPrintingDetailsOpen] = useState(true);
  const [letterHead, setLetterHead] = useState('Company Letterhead - Grey');
  const [printHeading, setPrintHeading] = useState('');

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `mr-row-${Date.now()}`,
        itemCode: '',
        itemName: '',
        requiredBy: requiredBy || '',
        qty: 0.0,
        warehouse: setWarehouse || '',
        uom: '',
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof MaterialRequestItem,
    val: any
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: val } : it))
    );
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const firstItem = items[0]?.itemCode || 'Laptop';
    const created = await createRequest({
      series,
      purpose,
      title: `${purpose} Request for ${firstItem}`,
      company,
      transactionDate,
      requiredBy: requiredBy || '13-11-2026',
      priceList,
      setWarehouse,
      status: 'Draft',
      items: items.map((it, idx) => ({
        ...it,
        id: it.id || `it-${idx}`,
        itemCode: it.itemCode || 'SKU002: Laptop',
        requiredBy: it.requiredBy || requiredBy || '13-11-2026',
        warehouse: it.warehouse || setWarehouse || 'Devam Eden İşler - AD',
        uom: it.uom || 'Nos',
      })),
      terms,
      termsContent,
      letterHead,
      printHeading,
    });
    navigate(`/material-request/${created.id}`);
  };

  return (
    <form
      id="new-material-request-form"
      onSubmit={handleSave}
      className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200 dark:border-[#27272A] shadow-xs overflow-hidden text-xs font-sans"
    >
      {/* 3 Tabs Header: Details | Terms | More Info */}
      <div className="flex items-center gap-6 px-6 border-b border-slate-100 dark:border-[#27272A] select-none">
        {[
          { id: 'details', label: 'Details' },
          { id: 'terms', label: 'Terms' },
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
        {activeTab === 'details' && (
          <>
            {/* Top 2-column grid (Image 2): Series *, Purpose *, Company * | Transaction Date *, Required By, Price List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Series <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={series}
                      onChange={(e) => setSeries(e.target.value)}
                      className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-medium outline-none focus:ring-1 focus:ring-slate-400"
                    >
                      <option value="MAT-MR-.YYYY.-">MAT-MR-.YYYY.-</option>
                      <option value="MR-.YYYY.-">MR-.YYYY.-</option>
                    </select>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Purpose <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={purpose}
                      onChange={(e) =>
                        setPurpose(e.target.value as MaterialRequestPurpose)
                      }
                      className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-slate-400"
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
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Transaction Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-900 dark:text-white font-semibold outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Required By
                  </label>
                  <input
                    type="text"
                    value={requiredBy}
                    onChange={(e) => setRequiredBy(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1">
                    Price List
                  </label>
                  <input
                    type="text"
                    value={priceList}
                    onChange={(e) => setPriceList(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-[#27272A]" />

            {/* Items Section (Image 2) */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 dark:text-white text-[13px]">
                Items
              </h3>

              {/* Scan Barcode | Set Warehouse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    Set Warehouse
                  </label>
                  <input
                    type="text"
                    value={setWarehouse}
                    onChange={(e) => setSetWarehouse(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Items Table (Image 2) */}
              <div className="space-y-2 pt-2">
                <label className="block text-slate-600 dark:text-zinc-400">
                  Items
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
                        <th className="py-2 px-3 min-w-[200px]">
                          Item Code <span className="text-rose-500">*</span>
                        </th>
                        <th className="py-2 px-3 min-w-[140px]">
                          Required By <span className="text-rose-500">*</span>
                        </th>
                        <th className="py-2 px-3 w-28 text-right">Quantit...</th>
                        <th className="py-2 px-3 min-w-[180px]">Warehouse</th>
                        <th className="py-2 px-3 w-28">
                          UOM <span className="text-rose-500">*</span>
                        </th>
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
                              className="w-full bg-transparent outline-none text-slate-900 dark:text-white font-medium"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.requiredBy}
                              onChange={(e) =>
                                handleItemChange(
                                  row.id,
                                  'requiredBy',
                                  e.target.value
                                )
                              }
                              className="w-full bg-transparent outline-none text-slate-700 dark:text-zinc-300"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="text"
                              value={
                                typeof row.qty === 'number'
                                  ? row.qty.toFixed(3)
                                  : row.qty
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  row.id,
                                  'qty',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full bg-transparent outline-none text-right font-semibold text-slate-900 dark:text-white"
                            />
                          </td>
                          <td className="py-2 px-3">
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
                              className="w-full bg-transparent outline-none text-slate-700 dark:text-zinc-300"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.uom}
                              onChange={(e) =>
                                handleItemChange(row.id, 'uom', e.target.value)
                              }
                              className="w-full bg-transparent outline-none text-slate-700 dark:text-zinc-300"
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
            </div>
          </>
        )}

        {/* TAB 2: TERMS (Image 3) */}
        {activeTab === 'terms' && (
          <div className="space-y-5">
            <div className="w-full md:w-1/2">
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5">
                Terms
              </label>
              <input
                type="text"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1.5">
                Terms and Conditions Content
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
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  className="w-full bg-[#F3F4F6] dark:bg-[#1E1E22] p-3 text-slate-800 dark:text-zinc-200 outline-none resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MORE INFO (Image 4: Printing Details ⌄) */}
        {activeTab === 'more_info' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setIsPrintingDetailsOpen(!isPrintingDetailsOpen)}
              className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-[13px]"
            >
              <span>Printing Details</span>
              {isPrintingDetailsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {isPrintingDetailsOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-1">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5">
                    Letter Head
                  </label>
                  <input
                    type="text"
                    value={letterHead}
                    onChange={(e) => setLetterHead(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1.5">
                    Print Heading
                  </label>
                  <input
                    type="text"
                    value={printHeading}
                    onChange={(e) => setPrintHeading(e.target.value)}
                    className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden submit button triggered by Header Save button */}
      <button type="submit" className="hidden">
        Save
      </button>
    </form>
  );
};

export default NewMaterialRequestForm;

