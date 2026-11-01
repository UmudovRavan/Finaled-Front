import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Bell, Sliders } from 'lucide-react';
import { useLanguage } from '../context';

export const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [savedNotice, setSavedNotice] = useState(false);

  const [settings, setSettings] = useState({
    defaultCurrency: 'AZN (₼)',
    defaultUnit: 'ədəd',
    lowStockThreshold: 5,
    autoNotifyLowStock: true,
    requireMovementApproval: false,
    barcodePrefix: 'STK-',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('nav.settings', 'Tənzimləmələr')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Anbar və stok modulunun əsas sistem parametrləri
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          Tənzimləmələr uğurla yadda saxlanıldı!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            Ümumi Anbar Parametrləri
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Əsas Valyuta
              </label>
              <input
                type="text"
                disabled
                value={settings.defaultCurrency}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#161F30] text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Susmaya Görə Ölçü Vahidi
              </label>
              <select
                value={settings.defaultUnit}
                onChange={(e) => setSettings({ ...settings, defaultUnit: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="ədəd">ədəd</option>
                <option value="kq">kq</option>
                <option value="litr">litr</option>
                <option value="metr">metr</option>
                <option value="qutu">qutu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kritik Qalıq Xəbərdarlıq Həddi (min. qalıq)
              </label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Avtomatik SKU Prefiksi
              </label>
              <input
                type="text"
                value={settings.barcodePrefix}
                onChange={(e) => setSettings({ ...settings, barcodePrefix: e.target.value })}
                className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#161F30] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-pink-500" />
            Bildiriş və Nəzarət
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoNotifyLowStock}
                onChange={(e) => setSettings({ ...settings, autoNotifyLowStock: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Qalıq kritik həddən aşağı düşdükdə anbar məsuluna bildiriş göndər
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireMovementApproval}
                onChange={(e) => setSettings({ ...settings, requireMovementApproval: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Böyük məbləğli məxaric əməliyyatlarında rəhbər təsdiqi tələb olunsun
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Dəyişiklikləri Saxla</span>
          </button>
        </div>
      </form>
    </div>
  );
};

