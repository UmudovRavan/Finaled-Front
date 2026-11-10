import React, { useState, useMemo } from 'react';

interface ItemPriceStockRow {
  id: string;
  itemCode: string;
  itemName: string;
  brand: string;
  warehouse: string;
  stockAvailable: number;
  buyingPriceList: string;
  buyingRate: number;
  sellingPriceList: string;
  sellingRate: number;
}

const INITIAL_PRICE_STOCK_ROWS: ItemPriceStockRow[] = [
  // Buying price rows (Image 4)
  {
    id: '1',
    itemCode: 'SKU001: T-shirt',
    itemName: 'T-shirt',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: -25.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 400.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '2',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    brand: '',
    warehouse: 'Bitmiş Ürünler - AD',
    stockAvailable: 0.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 300.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '3',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: -5.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 300.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '4',
    itemCode: 'SKU003: Book',
    itemName: 'Book',
    brand: '',
    warehouse: 'Mağazalar - AD',
    stockAvailable: -100.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 523.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '5',
    itemCode: 'SKU004: Smartphone',
    itemName: 'Smartphone',
    brand: '',
    warehouse: 'Mağazalar - AD',
    stockAvailable: -20.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 725.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '6',
    itemCode: 'SKU005: Sneakers',
    itemName: 'Sneakers',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: 32.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 222.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '7',
    itemCode: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: 250.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 420.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '8',
    itemCode: 'SKU006: Coffee Mug',
    itemName: 'Coffee Mug',
    brand: '',
    warehouse: 'Mağazalar - AD',
    stockAvailable: -100.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 420.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '9',
    itemCode: 'SKU007: Television',
    itemName: 'Television',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: 190.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 375.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '10',
    itemCode: 'SKU007: Television',
    itemName: 'Television',
    brand: '',
    warehouse: 'Mağazalar - AD',
    stockAvailable: -100.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 375.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '11',
    itemCode: 'SKU008: Backpack',
    itemName: 'Backpack',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: -20.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 333.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '12',
    itemCode: 'SKU008: Backpack',
    itemName: 'Backpack',
    brand: '',
    warehouse: 'Taşıma Halindeki Mallar - AD',
    stockAvailable: 121.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 333.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '13',
    itemCode: 'SKU009: Headphones',
    itemName: 'Headphones',
    brand: '',
    warehouse: 'Bitmiş Ürünler - AD',
    stockAvailable: 76.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 700.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '14',
    itemCode: 'SKU009: Headphones',
    itemName: 'Headphones',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: -40.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 700.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },
  {
    id: '15',
    itemCode: 'SKU010: Camera',
    itemName: 'Camera',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: -50.0,
    buyingPriceList: 'Standard Buying',
    buyingRate: 500.0,
    sellingPriceList: '',
    sellingRate: 0.0,
  },

  // Selling price rows (Image 5)
  {
    id: '17',
    itemCode: 'SKU004: Smartphone',
    itemName: 'Smartphone',
    brand: '',
    warehouse: 'Mağazalar - AD',
    stockAvailable: -20.0,
    buyingPriceList: '',
    buyingRate: 0.0,
    sellingPriceList: 'Standard Selling',
    sellingRate: 1000.0,
  },
  {
    id: '18',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    brand: '',
    warehouse: 'Bitmiş Ürünler - AD',
    stockAvailable: 0.0,
    buyingPriceList: '',
    buyingRate: 0.0,
    sellingPriceList: 'Standard Selling',
    sellingRate: 800.0,
  },
  {
    id: '19',
    itemCode: 'SKU002: Laptop',
    itemName: 'Laptop',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: -5.0,
    buyingPriceList: '',
    buyingRate: 0.0,
    sellingPriceList: 'Standard Selling',
    sellingRate: 800.0,
  },
  {
    id: '20',
    itemCode: 'SKU001: T-shirt',
    itemName: 'T-shirt',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: -25.0,
    buyingPriceList: '',
    buyingRate: 0.0,
    sellingPriceList: 'Standard Selling',
    sellingRate: 800.0,
  },
  {
    id: '21',
    itemCode: 'SKU007: Television',
    itemName: 'Television',
    brand: '',
    warehouse: 'Devam Eden İşler - AD',
    stockAvailable: 190.0,
    buyingPriceList: '',
    buyingRate: 0.0,
    sellingPriceList: 'Standard Selling',
    sellingRate: 900.0,
  },
  {
    id: '22',
    itemCode: 'SKU007: Television',
    itemName: 'Television',
    brand: '',
    warehouse: 'Mağazalar - AD',
    stockAvailable: -100.0,
    buyingPriceList: '',
    buyingRate: 0.0,
    sellingPriceList: 'Standard Selling',
    sellingRate: 900.0,
  },
];

export const ItemPriceStockReportPage: React.FC = () => {
  const [topItemFilter, setTopItemFilter] = useState('');
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const handleColFilterChange = (colKey: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [colKey]: val }));
  };

  const filteredRows = useMemo(() => {
    return INITIAL_PRICE_STOCK_ROWS.filter((row) => {
      if (topItemFilter) {
        const q = topItemFilter.toLowerCase();
        if (!row.itemCode.toLowerCase().includes(q) && !row.itemName.toLowerCase().includes(q)) {
          return false;
        }
      }

      for (const [k, v] of Object.entries(colFilters)) {
        if (!v.trim()) continue;
        const val = String((row as any)[k] ?? '').toLowerCase();
        if (!val.includes(v.toLowerCase().trim())) return false;
      }

      return true;
    });
  }, [topItemFilter, colFilters]);

  const formatQty = (val: number) => {
    const isNeg = val < 0;
    const abs = Math.abs(val).toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
    return isNeg ? `-${abs}` : abs;
  };

  const formatCurrency = (val: number) => {
    return `$ ${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="font-sans text-xs pb-16 space-y-4">
      {/* Top Filter Form (Image 4 & 5: Single Item Filter) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] p-4 shadow-xs">
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={topItemFilter}
            onChange={(e) => setTopItemFilter(e.target.value)}
            placeholder="Item"
            className="w-full bg-[#F4F5F7] dark:bg-[#1E1E22] text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-400 text-xs px-2.5 py-1.5 rounded-md border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 outline-none transition-all"
          />
        </div>
      </div>

      {/* Generation Status Note */}
      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 text-xs px-1">
        <span className="w-2 h-2 rounded-full bg-[#E05238] shrink-0 inline-block"></span>
        <span>This report was generated 2 minutes ago.</span>
      </div>

      {/* Main Grid Table (Image 4 & 5) */}
      <div className="bg-white dark:bg-[#151518] rounded-xl border border-slate-200/80 dark:border-[#27272A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {/* Row 1: Header Titles */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] text-slate-600 dark:text-zinc-400 font-medium whitespace-nowrap">
                <th className="px-3 py-2 w-10 text-center text-slate-400 border-r border-slate-200/60 dark:border-[#27272A]/60"></th>
                <th className="px-3 py-2 min-w-[130px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Code</th>
                <th className="px-3 py-2 min-w-[120px] border-r border-slate-200/60 dark:border-[#27272A]/60">Item Name</th>
                <th className="px-3 py-2 min-w-[80px] border-r border-slate-200/60 dark:border-[#27272A]/60">Brand</th>
                <th className="px-3 py-2 min-w-[140px] border-r border-slate-200/60 dark:border-[#27272A]/60">Warehouse</th>
                <th className="px-3 py-2 min-w-[100px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Stock Availa...</th>
                <th className="px-3 py-2 min-w-[120px] border-r border-slate-200/60 dark:border-[#27272A]/60">Buying Price...</th>
                <th className="px-3 py-2 min-w-[90px] text-right border-r border-slate-200/60 dark:border-[#27272A]/60">Buying Rate</th>
                <th className="px-3 py-2 min-w-[120px] border-r border-slate-200/60 dark:border-[#27272A]/60">Selling Price...</th>
                <th className="px-3 py-2 min-w-[90px] text-right">Selling Rate</th>
              </tr>

              {/* Row 2: Secondary Inline Filter Row (Image 5: User types 'T' into Item Name) */}
              <tr className="border-b border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B]">
                <td className="px-2 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60"></td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.itemCode || ''}
                    onChange={(e) => handleColFilterChange('itemCode', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.itemName || ''}
                    onChange={(e) => handleColFilterChange('itemName', e.target.value)}
                    placeholder=""
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.brand || ''}
                    onChange={(e) => handleColFilterChange('brand', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.warehouse || ''}
                    onChange={(e) => handleColFilterChange('warehouse', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.stockAvailable || ''}
                    onChange={(e) => handleColFilterChange('stockAvailable', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.buyingPriceList || ''}
                    onChange={(e) => handleColFilterChange('buyingPriceList', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.buyingRate || ''}
                    onChange={(e) => handleColFilterChange('buyingRate', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
                <td className="px-1.5 py-1.5 border-r border-slate-200/60 dark:border-[#27272A]/60">
                  <input
                    type="text"
                    value={colFilters.sellingPriceList || ''}
                    onChange={(e) => handleColFilterChange('sellingPriceList', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300"
                  />
                </td>
                <td className="px-1.5 py-1.5">
                  <input
                    type="text"
                    value={colFilters.sellingRate || ''}
                    onChange={(e) => handleColFilterChange('sellingRate', e.target.value)}
                    className="w-full bg-[#EDEDED] dark:bg-[#252529] text-slate-800 dark:text-zinc-200 text-[11px] px-2 py-1 rounded-md border-0 outline-none focus:ring-1 focus:ring-slate-300 text-right"
                  />
                </td>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-[#27272A] text-slate-700 dark:text-zinc-200 whitespace-nowrap">
              {filteredRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-[#1E1E22]/60 transition-colors"
                >
                  <td className="px-3 py-2 text-center text-slate-400 dark:text-zinc-500 font-normal border-r border-slate-100 dark:border-[#27272A]">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] font-medium text-slate-800 dark:text-zinc-100">
                    <span title={row.itemCode}>
                      {row.itemCode.length > 15 ? `${row.itemCode.slice(0, 13)}...` : row.itemCode}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A]">
                    {row.itemName}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-400">
                    {row.brand}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-300">
                    <span title={row.warehouse}>
                      {row.warehouse.includes('Devam')
                        ? 'Devam Eden İ...'
                        : row.warehouse.includes('Bitmiş')
                        ? 'Bitmiş Ürünler...'
                        : row.warehouse.includes('Taşıma')
                        ? 'Taşıma Halind...'
                        : row.warehouse}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums font-medium">
                    {formatQty(row.stockAvailable)}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-300">
                    {row.buyingPriceList ? `${row.buyingPriceList.slice(0, 13)}...` : ''}
                  </td>
                  <td className="px-3 py-2 text-right border-r border-slate-100 dark:border-[#27272A] tabular-nums">
                    {formatCurrency(row.buyingRate)}
                  </td>
                  <td className="px-3 py-2 border-r border-slate-100 dark:border-[#27272A] text-slate-600 dark:text-zinc-300">
                    {row.sellingPriceList ? `${row.sellingPriceList.slice(0, 14)}...` : ''}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(row.sellingRate)}
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400 dark:text-zinc-500">
                    No records found matching filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

