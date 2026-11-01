import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Barcode,
  AlertTriangle,
  ArrowUpDown,
} from 'lucide-react';
import { stockService } from '../api';
import type { StockProduct, Warehouse } from '../types';
import { formatCurrency } from '../utils';
import { Modal, StockStatusBadge, Badge } from '../components/common';
import { useLanguage } from '../context';

export const ProductsPage: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('new') === '1');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Elektronika',
    warehouseId: '',
    unit: 'ədəd',
    currentStock: 10,
    minStock: 5,
    maxStock: 100,
    buyPrice: 0,
    sellPrice: 0,
  });

  useEffect(() => {
    Promise.all([stockService.getProducts(), stockService.getWarehouses()]).then(
      ([prods, whs]) => {
        setProducts(prods);
        setWarehouses(whs);
        if (whs.length > 0) {
          setFormData((prev) => ({ ...prev, warehouseId: whs[0].id }));
        }
      }
    );
  }, []);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase());

    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchWarehouse = selectedWarehouse === 'all' || p.warehouseId === selectedWarehouse;

    return matchSearch && matchCategory && matchWarehouse;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const chosenWh = warehouses.find((w) => w.id === formData.warehouseId) || warehouses[0];

    const newProd = await stockService.createProduct({
      name: formData.name,
      sku: formData.sku || `STK-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: formData.barcode || `${Math.floor(4000000000000 + Math.random() * 1000000000000)}`,
      category: formData.category,
      warehouseId: chosenWh?.id || 'wh-1',
      warehouseName: chosenWh?.name || 'Mərkəzi Anbar',
      unit: formData.unit,
      currentStock: Number(formData.currentStock) || 0,
      minStock: Number(formData.minStock) || 5,
      maxStock: Number(formData.maxStock) || 100,
      buyPrice: Number(formData.buyPrice) || 0,
      sellPrice: Number(formData.sellPrice) || 0,
    });

    setProducts([newProd, ...products]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      category: 'Elektronika',
      warehouseId: warehouses[0]?.id || '',
      unit: 'ədəd',
      currentStock: 10,
      minStock: 5,
      maxStock: 100,
      buyPrice: 0,
      sellPrice: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('products.title', 'Məhsullar və Anbar Qalıqları')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('products.subtitle', 'Bütün anbarlar üzrə əmtəə-maddi qiymətlilərin siyahısı və qalıqları')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('products.addProductBtn', 'Yeni Məhsul Əlavə Et')}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('products.searchPlaceholder', 'SKU, barkod və ya məhsul adına görə axtar...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Bütün Kateqoriyalar</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Warehouse Filter */}
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="text-xs rounded-xl px-3 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Bütün Anbarlar</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#161F30] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">SKU / Barkod</th>
                <th className="px-4 py-3">Məhsul Adı</th>
                <th className="px-4 py-3">Kateqoriya</th>
                <th className="px-4 py-3">Anbar</th>
                <th className="px-4 py-3">Cari Qalıq</th>
                <th className="px-4 py-3">Alış / Satış</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block">{p.sku}</span>
                    <span className="font-mono text-[11px] text-slate-400">{p.barcode}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {p.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {p.warehouseName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {p.currentStock} {p.unit}
                    </div>
                    <span className="text-[10px] text-slate-400">Min: {p.minStock} {p.unit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-500 block">Alış: {formatCurrency(p.buyPrice)}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">Satış: {formatCurrency(p.sellPrice)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StockStatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Məhsul Əlavə Et"
        subtitle="Anbar nomenklaturasına yeni mal və ya material daxil edin"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Məhsulun Tam Adı *
            </label>
            <input
              type="text"
              required
              placeholder="məs. HP LaserJet Pro M404dn Printer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SKU (Məhsul Kodu)
              </label>
              <input
                type="text"
                placeholder="STK-PRN-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Barkod
              </label>
              <input
                type="text"
                placeholder="4760019283741"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kateqoriya
              </label>
              <input
                type="text"
                placeholder="Elektronika"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Saxlanılacaq Anbar
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
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                İlkin Qalıq
              </label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min. Hədd (Xəbərdarlıq)
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ölçü Vahidi
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ədəd">ədəd</option>
                <option value="kq">kq</option>
                <option value="litr">litr</option>
                <option value="metr">metr</option>
                <option value="qutu">qutu</option>
                <option value="bağlama">bağlama</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alış Qiyməti (₼)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.buyPrice}
                onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Satış Qiyməti (₼)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sellPrice}
                onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
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
              {t('common.save', 'Yadda saxla')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

