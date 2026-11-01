import React, { useEffect, useState } from 'react';
import {
  Warehouse as WarehouseIcon,
  Plus,
  Search,
  MapPin,
  User,
  Phone,
  Boxes,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { stockService } from '../api';
import type { Warehouse } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { Modal, Badge } from '../components/common';
import { useLanguage } from '../context';

export const WarehousesPage: React.FC = () => {
  const { t } = useLanguage();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    capacity: 2000,
    managerName: '',
    contactPhone: '',
  });

  useEffect(() => {
    stockService.getWarehouses().then(setWarehouses);
  }, []);

  const filtered = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()) ||
      w.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newWh = await stockService.createWarehouse({
      code: formData.code || `WH-0${warehouses.length + 1}`,
      name: formData.name,
      location: formData.location,
      capacity: Number(formData.capacity) || 1000,
      managerName: formData.managerName || 'Təyin edilməyib',
      contactPhone: formData.contactPhone || '',
      status: 'active',
    });

    setWarehouses([newWh, ...warehouses]);
    setIsModalOpen(false);
    setFormData({
      code: '',
      name: '',
      location: '',
      capacity: 2000,
      managerName: '',
      contactPhone: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('warehouses.title', 'Anbarlar')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('warehouses.subtitle', 'Fiziki və regional saxlama məntəqələrinin idarə edilməsi')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('warehouses.addWarehouseBtn', 'Yeni Anbar Əlavə Et')}</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('warehouses.searchPlaceholder', 'Anbar adı və ya koduna görə axtar...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((wh) => {
          const occupancyRate = Math.min(
            100,
            Math.round((wh.usedCapacity / (wh.capacity || 1)) * 100)
          );

          return (
            <div
              key={wh.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center font-bold text-xs">
                      <WarehouseIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {wh.name}
                      </h3>
                      <span className="text-[11px] font-mono font-semibold text-slate-400">
                        {wh.code}
                      </span>
                    </div>
                  </div>
                  <Badge variant={wh.status === 'active' ? 'success' : 'neutral'}>
                    {wh.status === 'active' ? 'Aktiv' : 'Qeyri-aktiv'}
                  </Badge>
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{wh.location || 'Ünvan qeyd olunmayıb'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Məsul: <strong>{wh.managerName}</strong></span>
                  </div>
                  {wh.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{wh.contactPhone}</span>
                    </div>
                  )}
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Doluluq dərəcəsi</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {occupancyRate}% ({wh.usedCapacity} / {wh.capacity} m³)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancyRate > 85
                          ? 'bg-rose-500'
                          : occupancyRate > 60
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Products & Stock Value */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Boxes className="w-4 h-4 text-slate-400" />
                  <span>{wh.totalProductsCount} növ məhsul</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(wh.totalStockValue)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Anbar Əlavə Et"
        subtitle="Sistemə yeni fiziki və ya məntiqi saxlama anbarı daxil edin"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Anbar Kodu
              </label>
              <input
                type="text"
                placeholder="məs. WH-04"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tutum (m³)
              </label>
              <input
                type="number"
                placeholder="2000"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Anbarın Adı *
            </label>
            <input
              type="text"
              required
              placeholder="məs. Xətai Logistika Anbarı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ünvan / Yerləşmə
            </label>
            <input
              type="text"
              placeholder="Bakı ş., Xətai r-nu, Babək pr. 12"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Məsul Şəxs (Menecer)
              </label>
              <input
                type="text"
                placeholder="Ad və Soyad"
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Əlaqə Telefonu
              </label>
              <input
                type="text"
                placeholder="+994 50 123 45 67"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
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

