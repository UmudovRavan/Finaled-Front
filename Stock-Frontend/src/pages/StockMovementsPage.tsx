import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { stockService } from '../api';
import type { StockMovement, StockProduct, Warehouse, MovementType } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { Modal, MovementTypeBadge } from '../components/common';
import { useLanguage } from '../context';

export const StockMovementsPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const defaultAction = searchParams.get('action');
  const [isModalOpen, setIsModalOpen] = useState(defaultAction === 'in' || defaultAction === 'out');

  const [formData, setFormData] = useState<{
    type: MovementType;
    productId: string;
    warehouseId: string;
    toWarehouseId?: string;
    quantity: number;
    unitPrice: number;
    note: string;
  }>({
    type: defaultAction === 'out' ? 'OUT' : 'IN',
    productId: '',
    warehouseId: '',
    toWarehouseId: '',
    quantity: 1,
    unitPrice: 0,
    note: '',
  });

  useEffect(() => {
    Promise.all([
      stockService.getMovements(),
      stockService.getProducts(),
      stockService.getWarehouses(),
    ]).then(([movs, prods, whs]) => {
      setMovements(movs);
      setProducts(prods);
      setWarehouses(whs);
      if (prods.length > 0 && whs.length > 0) {
        setFormData((prev) => ({
          ...prev,
          productId: prods[0].id,
          warehouseId: whs[0].id,
          unitPrice: prods[0].buyPrice,
        }));
      }
    });
  }, []);

  const filtered = movements.filter((m) => {
    const matchSearch =
      m.documentNo.toLowerCase().includes(search.toLowerCase()) ||
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.performedBy.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === formData.productId) || products[0];
    const warehouse = warehouses.find((w) => w.id === formData.warehouseId) || warehouses[0];
    const toWarehouse = warehouses.find((w) => w.id === formData.toWarehouseId);

    const newMov = await stockService.createMovement({
      type: formData.type,
      productId: product?.id || '',
      productName: product?.name || '',
      productSku: product?.sku || '',
      fromWarehouseId: formData.type === 'IN' ? undefined : warehouse?.id,
      fromWarehouseName: formData.type === 'IN' ? undefined : warehouse?.name,
      toWarehouseId: formData.type === 'OUT' ? undefined : toWarehouse?.id || warehouse?.id,
      toWarehouseName: formData.type === 'OUT' ? undefined : toWarehouse?.name || warehouse?.name,
      quantity: Number(formData.quantity) || 1,
      unit: product?.unit || 'ədəd',
      unitPrice: Number(formData.unitPrice) || 0,
      note: formData.note,
      performedBy: 'Cari İstifadəçi',
    });

    setMovements([newMov, ...movements]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('movements.title', 'Mədaxil və Məxaric Əməliyyatları')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('movements.subtitle', 'Anbara daxilolma, çıxarılma və daxili yerdəyişmə qeydiyyatı')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('movements.newMovementBtn', 'Yeni Hərəkət Sənədi')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('movements.searchPlaceholder', 'Sənəd №, məhsul və ya icraçıya görə axtar...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Bütün Növlər</option>
          <option value="IN">Yalnız Mədaxil (Giriş)</option>
          <option value="OUT">Yalnız Məxaric (Çıxış)</option>
          <option value="TRANSFER">Anbarlararası Transfer</option>
        </select>
      </div>

      {/* Movements Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#161F30] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Sənəd №</th>
                <th className="px-4 py-3">Əməliyyat Növü</th>
                <th className="px-4 py-3">Məhsul</th>
                <th className="px-4 py-3">Anbar Marşrutu</th>
                <th className="px-4 py-3">Miqdar</th>
                <th className="px-4 py-3">Məbləğ</th>
                <th className="px-4 py-3">Tarix</th>
                <th className="px-4 py-3 text-right">İcraçı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {m.documentNo}
                  </td>
                  <td className="px-4 py-3">
                    <MovementTypeBadge type={m.type} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900 dark:text-white block">{m.productName}</span>
                    <span className="font-mono text-[11px] text-slate-400">{m.productSku}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {m.type === 'IN' && <span>→ {m.toWarehouseName}</span>}
                    {m.type === 'OUT' && <span>{m.fromWarehouseName} →</span>}
                    {m.type === 'TRANSFER' && <span>{m.fromWarehouseName} → {m.toWarehouseName}</span>}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {m.quantity} {m.unit}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                    {m.totalPrice ? formatCurrency(m.totalPrice) : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(m.date)}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{m.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Hərəkət Sənədi Tərtib Et"
        subtitle="Mədaxil, məxaric və ya anbarlararası yerdəyişmə qeydiyyatı"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Əməliyyat Növü
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'IN', label: 'Mədaxil (Giriş)', icon: ArrowDownRight },
                { type: 'OUT', label: 'Məxaric (Çıxış)', icon: ArrowUpRight },
                { type: 'TRANSFER', label: 'Transfer', icon: ArrowLeftRight },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: opt.type as MovementType })}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Məhsul Seçimi *
            </label>
            <select
              value={formData.productId}
              onChange={(e) => {
                const p = products.find((x) => x.id === e.target.value);
                setFormData({
                  ...formData,
                  productId: e.target.value,
                  unitPrice: p?.buyPrice || 0,
                });
              }}
              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Mövcud: {p.currentStock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {formData.type === 'IN' ? 'Qəbul Edən Anbar' : 'Çıxış Edən Anbar'}
              </label>
              <select
                value={formData.warehouseId}
                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {formData.type === 'TRANSFER' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qəbul Edən Anbar
                </label>
                <select
                  value={formData.toWarehouseId}
                  onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                  className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Anbar seçin...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vahid Qiymət (₼)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                  className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hərəkət Miqdarı
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Əlavə Qeyd / Səbəb
            </label>
            <textarea
              rows={2}
              placeholder="Qaimə və ya sifariş barədə məlumat..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('common.cancel', 'İmtina')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
            >
              {t('common.save', 'Təsdiqlə və Yadda Saxla')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

