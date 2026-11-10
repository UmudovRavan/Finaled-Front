import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scan,
  Plus,
  Settings,
  Edit2,
  Trash2,
  Download,
  Upload,
  ChevronsUpDown,
} from 'lucide-react';
import { useStockReconciliation } from '../../context';
import { INITIAL_PRODUCTS, INITIAL_WAREHOUSES } from '../../api';
import type {
  StockReconciliationItem,
  StockReconciliationPurpose,
} from '../../types';

interface NewStockReconciliationFormProps {
  onSaved?: (id: string) => void;
}

export const NewStockReconciliationForm: React.FC<
  NewStockReconciliationFormProps
> = ({ onSaved }) => {
  const navigate = useNavigate();
  const { createReconciliation } = useStockReconciliation();

  // Top Section states
  const [series, setSeries] = useState('MAT-RECO-.YYYY.-');
  const [company, setCompany] = useState('Avalon (Demo)');
  const [purpose, setPurpose] =
    useState<StockReconciliationPurpose>('Opening Stock');
  const [defaultWarehouse, setDefaultWarehouse] = useState('');
  const [postingDate, setPostingDate] = useState('10-11-2026');
  const [postingTime, setPostingTime] = useState('00:32:40');
  const [editPostingDateTime, setEditPostingDateTime] = useState(false);

  // Scan states
  const [scanBarcode, setScanBarcode] = useState('');
  const [scanMode, setScanMode] = useState(false);

  // Items State (Screenshot 2: 1 initial row with 0.000 / $ 0.00)
  const [items, setItems] = useState<StockReconciliationItem[]>([
    {
      id: 'it-init-1',
      itemCode: '',
      itemName: '',
      warehouse: '',
      qty: 0,
      stockUom: 'Nos',
      valuationRate: 0,
      amount: 0,
    },
  ]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Difference Account state
  const [differenceAccount, setDifferenceAccount] = useState('');

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        itemCode: '',
        itemName: '',
        warehouse: defaultWarehouse || '',
        qty: 0,
        stockUom: 'Nos',
        valuationRate: 0,
        amount: 0,
      },
    ]);
  };

  const handleFetchItemsFromWarehouse = () => {
    // Populate with warehouse items
    const wh = defaultWarehouse || 'Bitmiş Ürünler - AD';
    setItems([
      {
        id: `it-${Date.now()}-1`,
        itemCode: 'SKU001: T-shirt',
        itemName: 'SKU001: T-shirt',
        warehouse: wh,
        qty: 3,
        stockUom: 'Nos',
        valuationRate: 3.0,
        amount: 9.0,
      },
    ]);
    if (!defaultWarehouse) setDefaultWarehouse(wh);
    if (!differenceAccount) setDifferenceAccount('111.01 - Sermaye Ekipmanı - AD');
  };

  const handleItemChange = (
    id: string,
    field: keyof StockReconciliationItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'valuationRate') {
          const q = field === 'qty' ? Number(value) || 0 : item.qty;
          const r = field === 'valuationRate' ? Number(value) || 0 : item.valuationRate;
          updated.amount = q * r;
        }
        return updated;
      })
    );
  };

  const toggleSelectRow = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map((i) => i.id));
    }
  };

  const handleDeleteSelected = () => {
    setItems((prev) => prev.filter((i) => !selectedItemIds.includes(i.id)));
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
          id: `it-${Date.now()}`,
          itemCode: code,
          itemName: matched ? matched.name : code,
          warehouse: defaultWarehouse || 'Bitmiş Ürünler - AD',
          qty: scanMode ? 0 : 1,
          stockUom: 'Nos',
          valuationRate: 3.0,
          amount: 3.0,
        },
      ]);
      setScanBarcode('');
    }
  };

  const handleSave = async () => {
    const validItems = items.filter((it) => it.itemCode.trim() !== '');
    const finalItems =
      validItems.length > 0
        ? validItems
        : [
            {
              id: 'it-reco-1',
              itemCode: 'SKU001: T-shirt',
              itemName: 'SKU001: T-shirt',
              warehouse: defaultWarehouse || 'Bitmiş Ürünler - AD',
              qty: 3,
              stockUom: 'Nos',
              valuationRate: 3.0,
              amount: 9.0,
            },
          ];

    const totalDiff = finalItems.reduce((acc, it) => acc + (it.amount || 0), 0);

    const created = await createReconciliation({
      series,
      company,
      purpose,
      postingDate,
      postingTime,
      editPostingDateTime,
      defaultWarehouse: defaultWarehouse || 'Bitmiş Ürünler - AD',
      scanBarcode,
      scanMode,
      differenceAccount: differenceAccount || '111.01 - Sermaye Ekipmanı - AD',
      differenceAmount: totalDiff,
      items: finalItems,
    });

    if (onSaved) {
      onSaved(created.id);
    } else {
      navigate(`/stock-reconciliation/${created.id}`);
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-xl border border-slate-200/90 dark:border-[#27272A] p-6 shadow-sm font-sans text-xs space-y-6">
      {/* Top action row inside form (or accessed via header) */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#27272A]">
        <div className="text-slate-500 dark:text-zinc-400">
          Fill in the details below to create a new Stock Reconciliation
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFetchItemsFromWarehouse}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2E33] bg-white dark:bg-[#202024] hover:bg-slate-50 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs font-normal transition-colors"
          >
            Fetch Items from Warehouse
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-medium shadow-sm transition-all"
          >
            Save
          </button>
        </div>
      </div>

      {/* Top 2 Columns Grid from Screenshot 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Series * */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Series <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 pr-8 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs cursor-pointer"
              >
                <option value="MAT-RECO-.YYYY.-">MAT-RECO-.YYYY.-</option>
              </select>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Company * */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs"
            />
          </div>

          {/* Purpose * */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Purpose <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={purpose}
                onChange={(e) =>
                  setPurpose(e.target.value as StockReconciliationPurpose)
                }
                className="w-full appearance-none bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 pr-8 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs cursor-pointer"
              >
                <option value="Opening Stock">Opening Stock</option>
                <option value="Stock Reconciliation">Stock Reconciliation</option>
              </select>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Default Warehouse */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Default Warehouse
            </label>
            <input
              type="text"
              placeholder="Default Warehouse"
              value={defaultWarehouse}
              onChange={(e) => setDefaultWarehouse(e.target.value)}
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Posting Date * */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Posting Date <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={postingDate}
              onChange={(e) => setPostingDate(e.target.value)}
              disabled={!editPostingDateTime}
              className={`w-full px-3 py-1.5 rounded-lg border border-transparent outline-none text-xs ${
                editPostingDateTime
                  ? 'bg-white dark:bg-[#202024] text-slate-800 dark:text-zinc-200 border-slate-300'
                  : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 cursor-not-allowed opacity-90'
              }`}
            />
          </div>

          {/* Posting Time * */}
          <div>
            <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
              Posting Time <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={postingTime}
              onChange={(e) => setPostingTime(e.target.value)}
              disabled={!editPostingDateTime}
              className={`w-full px-3 py-1.5 rounded-lg border border-transparent outline-none text-xs ${
                editPostingDateTime
                  ? 'bg-white dark:bg-[#202024] text-slate-800 dark:text-zinc-200 border-slate-300'
                  : 'bg-[#F3F4F6] dark:bg-[#202024] text-slate-700 dark:text-zinc-300 cursor-not-allowed opacity-90'
              }`}
            />
          </div>

          {/* Edit Posting Date and Time Checkbox */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={editPostingDateTime}
                onChange={(e) => setEditPostingDateTime(e.target.checked)}
                className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
              />
              <span>Edit Posting Date and Time</span>
            </label>
          </div>
        </div>
      </div>

      {/* Barcode & Scan Mode Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 pt-2">
        {/* Left: Scan Barcode */}
        <div>
          <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
            Scan Barcode
          </label>
          <div className="relative">
            <input
              type="text"
              value={scanBarcode}
              onChange={(e) => setScanBarcode(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Scan Barcode and press Enter"
              className="w-full bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 pr-8 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs placeholder:text-slate-400"
            />
            <Scan className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Scan Mode */}
        <div className="pt-5">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={scanMode}
              onChange={(e) => setScanMode(e.target.checked)}
              className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
            />
            <span className="font-medium">Scan Mode</span>
          </label>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 ml-5">
            Disables auto-fetching of existing quantity
          </p>
        </div>
      </div>

      {/* Items Section (Screenshot 2) */}
      <div className="space-y-3 pt-2">
        <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
          Items
        </h4>

        {selectedItemIds.length > 0 && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
              {selectedItemIds.length} item(s) selected
            </span>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-[#27272A]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8F9FA] dark:bg-[#202024] border-b border-slate-200 dark:border-[#27272A] text-slate-500 font-normal select-none">
                <th className="py-2 px-2.5 w-7 text-center">
                  <input
                    type="checkbox"
                    checked={
                      items.length > 0 && selectedItemIds.length === items.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2 px-2.5 w-10 text-slate-500 font-normal">
                  No.
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[200px]">
                  Item Code <span className="text-red-500">*</span>
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[180px]">
                  Warehouse <span className="text-red-500">*</span>
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[110px] text-right">
                  Quantity
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[90px]">
                  Stock UOM
                </th>
                <th className="py-2 px-2.5 font-normal text-slate-600 dark:text-zinc-300 min-w-[120px] text-right">
                  Valuation Rate
                </th>
                <th className="py-2 px-2.5 w-8 text-center text-slate-400">
                  <Settings className="w-3.5 h-3.5 mx-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
              {items.map((it, idx) => {
                const isSelected = selectedItemIds.includes(it.id);
                const isEditing = editingRowId === it.id;

                return (
                  <tr
                    key={it.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors ${
                      isSelected ? 'bg-slate-50 dark:bg-white/[0.04]' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2 px-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(it.id)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* No. */}
                    <td className="py-2 px-2.5 text-slate-400 select-none">
                      {idx + 1}
                    </td>

                    {/* Item Code */}
                    <td className="py-2 px-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={it.itemCode}
                          onChange={(e) =>
                            handleItemChange(it.id, 'itemCode', e.target.value)
                          }
                          placeholder="SKU or Item Code"
                          className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingRowId(it.id)}
                          className="cursor-pointer text-slate-800 dark:text-zinc-200 hover:text-indigo-600 font-medium"
                        >
                          {it.itemCode || (
                            <span className="text-slate-400 font-normal italic">
                              Click to set item code
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Warehouse */}
                    <td className="py-2 px-2.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={it.warehouse}
                          onChange={(e) =>
                            handleItemChange(it.id, 'warehouse', e.target.value)
                          }
                          placeholder="Warehouse"
                          className="w-full bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingRowId(it.id)}
                          className="cursor-pointer text-slate-600 dark:text-zinc-300"
                        >
                          {it.warehouse || defaultWarehouse || (
                            <span className="text-slate-400 italic">
                              Click to set warehouse
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-2 px-2.5 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.001"
                          value={it.qty}
                          onChange={(e) =>
                            handleItemChange(
                              it.id,
                              'qty',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 text-right bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <span
                          onClick={() => setEditingRowId(it.id)}
                          className="cursor-pointer"
                        >
                          {it.qty.toFixed(3)}
                        </span>
                      )}
                    </td>

                    {/* Stock UOM */}
                    <td className="py-2 px-2.5 text-slate-600 dark:text-zinc-300">
                      {it.stockUom || 'Nos'}
                    </td>

                    {/* Valuation Rate */}
                    <td className="py-2 px-2.5 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={it.valuationRate}
                          onChange={(e) =>
                            handleItemChange(
                              it.id,
                              'valuationRate',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 text-right bg-[#F3F4F6] dark:bg-[#27272A] px-2 py-1 rounded text-xs outline-none"
                        />
                      ) : (
                        <span
                          onClick={() => setEditingRowId(it.id)}
                          className="cursor-pointer"
                        >
                          $ {it.valuationRate.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Pen icon */}
                    <td className="py-2 px-2.5 text-center">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingRowId(isEditing ? null : it.id)
                        }
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        title="Edit Row"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons below Items Table (Screenshot 2: Add row / Download / Upload) */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleAddRow}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
          >
            Add row
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Download template')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
            >
              Download
            </button>
            <button
              type="button"
              onClick={() => alert('Upload template')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#27272A] hover:bg-slate-200 dark:hover:bg-[#323238] text-slate-700 dark:text-zinc-200 text-xs font-medium transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Difference Account Section (Screenshot 2 bottom) */}
      <div className="pt-2">
        <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
          Difference Account
        </label>
        <input
          type="text"
          placeholder="Difference Account"
          value={differenceAccount}
          onChange={(e) => setDifferenceAccount(e.target.value)}
          className="w-full md:w-1/2 bg-[#F3F4F6] dark:bg-[#202024] px-3 py-1.5 rounded-lg text-slate-800 dark:text-zinc-200 border border-transparent focus:border-slate-300 dark:focus:border-[#2E2E33] outline-none text-xs placeholder:text-slate-400"
        />
      </div>
    </div>
  );
};

export default NewStockReconciliationForm;

