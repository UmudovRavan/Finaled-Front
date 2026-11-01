import React, { useEffect, useState } from 'react';
import { Truck, Plus, Search, Mail, Phone, MapPin, PackageCheck } from 'lucide-react';
import { stockService } from '../api';
import type { Supplier } from '../types';
import { Modal, Badge } from '../components/common';
import { useLanguage } from '../context';

export const SuppliersPage: React.FC = () => {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    stockService.getSuppliers().then(setSuppliers);
  }, []);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      code: formData.code || `SUP-00${suppliers.length + 1}`,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      totalSuppliedCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setSuppliers([newSup, ...suppliers]);
    setIsModalOpen(false);
    setFormData({
      code: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('suppliers.title', 'Təchizatçılar')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('suppliers.subtitle', 'Məhsul və xammal tədarükçülərinin reyestri')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('suppliers.addSupplierBtn', 'Yeni Təchizatçı')}</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('suppliers.searchPlaceholder', 'Təchizatçı adı və ya əlaqə şəxsinə görə axtar...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {s.name}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">{s.code}</span>
                  </div>
                </div>
                <Badge variant={s.status === 'active' ? 'success' : 'neutral'}>
                  {s.status === 'active' ? 'Aktiv' : 'Qeyri-aktiv'}
                </Badge>
              </div>

              <div className="space-y-2 mt-4 text-xs text-slate-600 dark:text-slate-400">
                <p>Məsul nümayəndə: <strong className="text-slate-900 dark:text-white">{s.contactPerson}</strong></p>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{s.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{s.phone}</span>
                </div>
                {s.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Tədarük partiyaları</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {s.totalSuppliedCount} əməliyyat
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Təchizatçı Daxil Et"
        subtitle="Məhsul və mal tədarükçüsü barədə rekvizitlər"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Təchizatçı Kodu
              </label>
              <input
                type="text"
                placeholder="SUP-003"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Şirkətin Adı *
              </label>
              <input
                type="text"
                required
                placeholder="məs. Azimport MMC"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Əlaqədar Şəxs (Menecer)
            </label>
            <input
              type="text"
              placeholder="Ad və Soyad"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-poçt Ünvanı
              </label>
              <input
                type="email"
                placeholder="contact@company.az"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telefon Nömrəsi
              </label>
              <input
                type="text"
                placeholder="+994 12 000 00 00"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hüquqi Ünvan
            </label>
            <input
              type="text"
              placeholder="Bakı ş., Nəsimi r-nu, Nizami küç. 8"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              {t('common.save', 'Yadda saxla')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

