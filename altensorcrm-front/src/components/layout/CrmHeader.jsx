import React, { useState } from 'react';
import { Search, Bell, Plus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const CrmHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('nav.searchPlaceholder', {}, 'CRM-də axtarın...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 text-sm rounded-full pl-10 pr-4 py-2 border border-slate-200/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/deals')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('deals.newDealLead', {}, t('deals.addDeal', {}, 'Yeni Sövdələşmə'))}</span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <button
          onClick={() => navigate('/notifications')}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
          title={t('nav.notifications', {}, 'Bildirişlər')}
        >
          <Bell className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
        </button>

        <button
          onClick={() => { window.location.href = import.meta.env.VITE_INFO_WEB_URL ? `${import.meta.env.VITE_INFO_WEB_URL}/desktop` : 'https://info.altensor.com/desktop'; }}
          className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#15803D] font-semibold text-sm flex items-center justify-center hover:ring-2 hover:ring-emerald-200 transition-all cursor-pointer shadow-sm"
          title={t('nav.profileLaunchpad', {}, 'Profil / Desktop Launchpad')}
        >
          A
        </button>
      </div>
    </header>
  );
};

export default CrmHeader;
