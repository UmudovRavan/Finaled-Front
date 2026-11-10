import React, { useState, useMemo } from 'react';
import { Ban, Search, Check, RefreshCw } from 'lucide-react';

interface QuickStockItem {
  itemCode: string;
  itemName: string;
  barcode: string;
  warehouse: string;
  availableQty: number;
  rate: number;
  image?: string;
}

const SAMPLE_QUICK_ITEMS: QuickStockItem[] = [
  {
    itemCode: 'SKU010: Camera',
    itemName: 'Camera',
    barcode: '8901234567890',
    warehouse: 'Mağazalar - AD',
    availableQty: 78,
    rate: 500.0,
  },
  {
    itemCode: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    barcode: '8901234567891',
    warehouse: 'Devam Eden İşler - AD',
    availableQty: 250,
    rate: 420.0,
  },
  {
    itemCode: 'SKU007: Television',
    itemName: 'Television',
    barcode: '8901234567892',
    warehouse: 'Devam Eden İşler - AD',
    availableQty: 190,
    rate: 375.0,
  },
  {
    itemCode: 'SKU008: Backpack',
    itemName: 'Backpack',
    barcode: '8901234567893',
    warehouse: 'Taşıma Hali... - AD',
    availableQty: 121,
    rate: 333.0,
  },
  {
    itemCode: 'SKU005: Sneakers',
    itemName: 'Sneakers',
    barcode: '8901234567894',
    warehouse: 'Devam Eden İşler - AD',
    availableQty: 32,
    rate: 222.0,
  },
  {
    itemCode: 'SKU009: Headphones',
    itemName: 'Headphones',
    barcode: '8901234567895',
    warehouse: 'Bitmiş Ürünler - AD',
    availableQty: 76,
    rate: 700.0,
  },
  {
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    barcode: '8901234567896',
    warehouse: 'Devam Eden İşler - AD',
    availableQty: 10,
    rate: 50.0,
  },
];

export const QuickStockBalancePage: React.FC = () => {
  const [warehouse, setWarehouse] = useState('');
  const [date, setDate] = useState('14-07-2026');
  const [barcode, setBarcode] = useState('');
  const [itemCode, setItemCode] = useState('');

  // Dropdown suggestions state
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);

  // Available warehouses
  const warehouseOptions = [
    'Mağazalar - AD',
    'Devam Eden İşler - AD',
    'Taşıma Hali... - AD',
    'Bitmiş Ürünler - AD',
    'Mərkəzi Baş Anbar',
    'Sumqayıt Logistika Mərkəzi',
  ];

  // Match item
  const matchedItem = useMemo(() => {
    if (barcode.trim()) {
      const byBarcode = SAMPLE_QUICK_ITEMS.find((it) =>
        it.barcode.toLowerCase().includes(barcode.trim().toLowerCase())
      );
      if (byBarcode) return byBarcode;
    }

    if (itemCode.trim()) {
      const byCode = SAMPLE_QUICK_ITEMS.find(
        (it) =>
          it.itemCode.toLowerCase().includes(itemCode.trim().toLowerCase()) ||
          it.itemName.toLowerCase().includes(itemCode.trim().toLowerCase())
      );
      if (byCode) return byCode;
    }

    return null;
  }, [barcode, itemCode]);

  const availableQty = matchedItem ? matchedItem.availableQty : 0;
  const stockValue = matchedItem ? matchedItem.availableQty * matchedItem.rate : 0;

  const handleSelectItem = (it: QuickStockItem) => {
    setItemCode(it.itemCode);
    setBarcode(it.barcode);
    if (!warehouse) {
      setWarehouse(it.warehouse);
    }
    setIsItemDropdownOpen(false);
  };

  const handleSelectWarehouse = (w: string) => {
    setWarehouse(w);
    setIsWarehouseDropdownOpen(false);
  };

  const handleReset = () => {
    setWarehouse('');
    setDate('14-07-2026');
    setBarcode('');
    setItemCode('');
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Main Card matching Image 4 */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-6 sm:p-8 shadow-xs">
        {/* Top Section: Form Fields (Left) + Image Placeholder (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Inputs Column (Cols 1 to 7/8) */}
          <div className="md:col-span-8 lg:col-span-7 space-y-4">
            {/* Warehouse */}
            <div className="relative">
              <label className="block text-slate-700 dark:text-zinc-300 font-normal mb-1.5 text-xs">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={warehouse}
                onChange={(e) => {
                  setWarehouse(e.target.value);
                  setIsWarehouseDropdownOpen(true);
                }}
                onFocus={() => setIsWarehouseDropdownOpen(true)}
                placeholder=""
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
              />

              {isWarehouseDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                  {warehouseOptions
                    .filter((w) =>
                      w.toLowerCase().includes(warehouse.toLowerCase().trim())
                    )
                    .map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleSelectWarehouse(w)}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs transition-colors flex items-center justify-between"
                      >
                        <span>{w}</span>
                        {warehouse === w && <Check className="w-3.5 h-3.5 text-slate-500" />}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-normal mb-1.5 text-xs">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="14-07-2026"
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
              />
            </div>

            {/* Item Barcode */}
            <div>
              <label className="block text-slate-700 dark:text-zinc-300 font-normal mb-1.5 text-xs">
                Item Barcode
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder=""
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
              />
            </div>

            {/* Item Code */}
            <div className="relative">
              <label className="block text-slate-700 dark:text-zinc-300 font-normal mb-1.5 text-xs">
                Item Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={itemCode}
                onChange={(e) => {
                  setItemCode(e.target.value);
                  setIsItemDropdownOpen(true);
                }}
                onFocus={() => setIsItemDropdownOpen(true)}
                placeholder=""
                className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
              />

              {isItemDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#2E2E33] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                  {SAMPLE_QUICK_ITEMS.filter(
                    (it) =>
                      it.itemCode.toLowerCase().includes(itemCode.toLowerCase().trim()) ||
                      it.itemName.toLowerCase().includes(itemCode.toLowerCase().trim())
                  ).map((it) => (
                    <button
                      key={it.itemCode}
                      type="button"
                      onClick={() => handleSelectItem(it)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-700 dark:text-zinc-200 text-xs transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {it.itemCode}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {it.itemName} • {it.warehouse}
                        </div>
                      </div>
                      {itemCode === it.itemCode && <Check className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Square Image Placeholder Box matching Image 4 */}
          <div className="md:col-span-4 lg:col-span-5 flex justify-start md:justify-center pt-2">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-xl bg-[#F4F5F7] dark:bg-[#1E1E22] border border-slate-200/60 dark:border-[#27272A] flex flex-col items-center justify-center p-3 text-center transition-all">
              <Ban className="w-8 h-8 text-slate-400 dark:text-zinc-500 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Separator / Margin */}
        <div className="my-8 border-b border-slate-100 dark:border-[#222226]" />

        {/* Bottom Section: Readout Boxes for Available Quantity and Stock Value (Image 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Available Quantity */}
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-normal mb-1.5 text-xs">
              Available Quantity
            </label>
            <div className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent font-normal">
              {availableQty.toLocaleString('en-US')}
            </div>
          </div>

          {/* Stock Value */}
          <div>
            <label className="block text-slate-700 dark:text-zinc-300 font-normal mb-1.5 text-xs">
              Stock Value
            </label>
            <div className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 text-xs px-3 py-2 rounded-lg border border-transparent font-normal">
              $ {stockValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

