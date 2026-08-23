import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orgsApi, dealsApi, contactsApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getDealStatusLabel, getIndustryLabel, getTerritoryLabel } from '../../utils/statusUtils';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  TrashIcon,
  LinkIcon,
  PencilSquareIcon,
  BoltIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const territoryOptions = ['Azerbaijan', 'Turkey', 'United States', 'Global'];
const industryOptions = ['Advertising', 'Technology', 'Finance', 'Healthcare', 'Real Estate', 'Education', 'Other'];
const employeeCountOptions = ['1-10', '11-50', '51-200', '201-500', '501+'];

const dealStatusColors = {
  'Qualification': '#71717A',
  'Demo/Making': '#F97316',
  'Demo': '#F97316',
  'Proposal/Quotation': '#38BDF8',
  'Proposal': '#38BDF8',
  'Negotiation': '#EAB308',
  'Ready to Close': '#A855F7',
  'ReadyToClose': '#A855F7',
  'Won': '#10B981',
  'Lost': '#EF4444'
};

const OrganizationDetailPage = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('Deals');

  // Custom Toast Alert System
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Form State
  const [formData, setFormData] = useState({
    organizationName: '',
    website: '',
    territory: '',
    industry: 'Advertising',
    noOfEmployees: '1-10',
    address: ''
  });

  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  // Real Database Lists
  const [associatedDeals, setAssociatedDeals] = useState([]);
  const [associatedContacts, setAssociatedContacts] = useState([]);

  useEffect(() => {
    if (id) {
      fetchOrgDetail(id);
    }
  }, [id]);

  const fetchOrgDetail = async (orgId) => {
    try {
      setLoading(true);
      const data = await orgsApi.getById(orgId);
      if (data) {
        const fetchedData = {
          organizationName: data.organizationName || data.name || '',
          website: data.website || '',
          territory: data.territoryName || '',
          industry: data.industry || data.industryName || 'Advertising',
          noOfEmployees: data.noOfEmployees || data.employeeRange || '1-10',
          address: data.address?.fullAddress || data.address || ''
        };
        setFormData(fetchedData);

        // Fetch real database deals & contacts linked to this organization
        await Promise.all([
          fetchRealDeals(orgId, fetchedData.organizationName),
          fetchRealContacts(orgId, fetchedData.organizationName)
        ]);
      }
    } catch (err) {
      console.warn('Notice fetching organization detail:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealDeals = async (orgId, orgName) => {
    try {
      let rawList = [];
      try {
        rawList = await orgsApi.getDeals(orgId);
      } catch {
        const allDeals = await dealsApi.getAll();
        rawList = Array.isArray(allDeals) ? allDeals : allDeals?.items || [];
      }

      const list = Array.isArray(rawList) ? rawList : rawList?.items || [];
      const orgNameToMatch = (orgName || '').toLowerCase().trim();

      const matched = list.filter(d => {
        if (!d) return false;
        if (d.organizationId && String(d.organizationId).toLowerCase() === String(orgId).toLowerCase()) return true;
        if (orgNameToMatch && d.organizationName && String(d.organizationName).toLowerCase().trim() === orgNameToMatch) return true;
        return false;
      });

      setAssociatedDeals(matched.map(d => ({
        id: d.id,
        organization: d.organizationName || orgName || 'Organization',
        amount: d.annualRevenue ? `$ ${d.annualRevenue}` : '$ 0.00',
        status: d.statusName || d.status || 'Proposal/Quotation',
        email: d.primaryEmail || d.email || '—',
        mobile: d.primaryMobileNo || d.mobile || '—',
        owner: d.dealOwnerName || 'Elvin Muzaffarli',
        ownerInitial: d.dealOwnerName ? d.dealOwnerName.charAt(0).toUpperCase() : 'E',
        lastModified: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'Recently'
      })));
    } catch (err) {
      console.warn('Error fetching deals:', err.message);
      setAssociatedDeals([]);
    }
  };

  const fetchRealContacts = async (orgId, orgName) => {
    try {
      let rawList = [];
      try {
        rawList = await orgsApi.getContacts(orgId);
      } catch {
        const allContacts = await contactsApi.getAll();
        rawList = Array.isArray(allContacts) ? allContacts : allContacts?.items || [];
      }

      const list = Array.isArray(rawList) ? rawList : rawList?.items || [];
      const orgNameToMatch = (orgName || '').toLowerCase().trim();

      const matched = list.filter(c => {
        if (!c) return false;
        if (c.organizationId && String(c.organizationId).toLowerCase() === String(orgId).toLowerCase()) return true;
        if (orgNameToMatch && c.companyName && String(c.companyName).toLowerCase().trim() === orgNameToMatch) return true;
        if (orgNameToMatch && c.organizationName && String(c.organizationName).toLowerCase().trim() === orgNameToMatch) return true;
        return false;
      });

      setAssociatedContacts(matched.map(c => ({
        id: c.id,
        name: c.fullName || `${c.salutation ? `${c.salutation} ` : ''}${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Contact',
        initial: c.firstName ? c.firstName.charAt(0).toUpperCase() : 'C',
        email: c.emailAddress || c.email || '—',
        phone: c.mobileNo || c.phone || '—',
        organization: c.companyName || c.organizationName || orgName || 'Organization',
        orgInitial: (c.companyName || orgName || 'O').charAt(0).toUpperCase(),
        lastModified: c.createdAt ? '1 hour ago' : 'Recently'
      })));
    } catch (err) {
      console.warn('Error fetching contacts:', err.message);
      setAssociatedContacts([]);
    }
  };

  const handleSave = async (overrideData = null) => {
    const dataToSave = overrideData || formData;
    try {
      setSaving(true);
      const payload = {
        id: id,
        organizationName: dataToSave.organizationName || 'Organization',
        annualRevenue: 0,
        website: dataToSave.website || '',
        territoryId: null,
        noOfEmployees: null,
        industry: null,
        addressId: null,
        address: null
      };

      await orgsApi.update(id, payload);
      showToast(language === 'az' ? 'Təşkilat uğurla yadda saxlanıldı!' : language === 'en' ? 'Organization saved successfully!' : 'Организация успешно сохранена!', 'success');
      await fetchOrgDetail(id);
    } catch (err) {
      console.error('Error updating organization:', err);
      showToast(err.message || (language === 'az' ? 'Təşkilatı yeniləyərkən xəta baş verdi' : 'Error updating organization'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await orgsApi.delete(id);
      showToast(language === 'az' ? 'Təşkilat uğurla silindi!' : language === 'en' ? 'Organization deleted successfully!' : 'Организация успешно удалена!', 'success');
      setTimeout(() => {
        navigate('/crm/organizations');
      }, 1000);
    } catch (err) {
      console.error('Error deleting organization:', err);
      showToast(err.message || (language === 'az' ? 'Təşkilatı silərkən xəta baş verdi' : 'Error deleting organization'), 'error');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast(language === 'az' ? 'Keçid panoya kopyalandı!' : language === 'en' ? 'Link copied to clipboard!' : 'Ссылка скопирована в буфер обмена!', 'success');
  };

  const orgTitle = formData.organizationName || (language === 'az' ? 'Təşkilat Detalları' : language === 'en' ? 'Organization Details' : 'Детали организации');
  const initial = orgTitle ? orgTitle.charAt(0).toUpperCase() : 'O';

  return (
    <div className="-m-4 lg:-m-6 -mb-20 min-h-screen bg-[#121214] text-[#E4E4E7] flex flex-col font-sans relative">
      {/* FLOATING TOAST ALERT NOTIFICATION */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] flex items-center justify-between gap-3 bg-[#E4E4E7] text-[#18181B] px-4 py-2.5 rounded-2xl shadow-2xl min-w-[280px] max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            {toast.type === 'error' ? (
              <ExclamationCircleIcon className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-black shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-[#71717A] hover:text-black transition-colors cursor-pointer p-0.5"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">{language === 'az' ? 'Təşkilatı Sil' : language === 'en' ? 'Delete Organization' : 'Удалить организацию'}</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-[#A1A1AA] hover:text-white p-1">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              {language === 'az' ? (
                <>Həqiqətən <strong className="text-white">{orgTitle}</strong> təşkilatını silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.</>
              ) : language === 'en' ? (
                <>Are you sure you want to delete <strong className="text-white">{orgTitle}</strong>? This action cannot be undone.</>
              ) : (
                <>Вы уверены, что хотите удалить <strong className="text-white">{orgTitle}</strong>? Это действие нельзя отменить.</>
              )}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t('common.cancel', {}, 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? (language === 'az' ? 'Silinir...' : language === 'en' ? 'Deleting...' : 'Удаление...') : t('common.delete', {}, 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP BREADCRUMB BAR */}
      <div className="px-6 py-3 border-b border-[#2C2C2E]/60 bg-[#121214] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
          <Link to="/crm/organizations" className="hover:text-white transition-colors">{language === 'az' ? 'Təşkilatlar' : language === 'en' ? 'Organizations' : 'Организации'}</Link>
          <span>/</span>
          <Link to="/crm/organizations" className="hover:text-white transition-colors">{language === 'az' ? 'Siyahı' : language === 'en' ? 'List' : 'Список'}</Link>
          <span>/</span>
          <span className="text-white font-semibold">{orgTitle}</span>
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN CONTENT BODY */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* LEFT PANEL: AVATAR, ACTION BUTTONS & DETAILS FORM */}
        <div className="w-full lg:w-80 shrink-0 border-r border-[#2C2C2E]/60 bg-[#121214] p-6 space-y-6 text-xs overflow-y-auto custom-scrollbar">
          {/* Avatar & Organization Name Header */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white font-bold text-xl shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate leading-snug">{orgTitle}</h1>
            </div>
          </div>

          {/* Action Buttons: Delete & Share Link */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs"
            >
              <TrashIcon className="w-4 h-4" />
              <span>{t('common.delete', {}, 'Delete')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white rounded-xl transition-colors cursor-pointer"
              title={language === 'az' ? 'Keçidi kopyala' : language === 'en' ? 'Copy Link' : 'Скопировать ссылку'}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="h-px bg-[#2C2C2E]/60"></div>

          {/* Details Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="flex items-center gap-1.5 font-bold text-white cursor-pointer hover:text-sky-400 transition-colors text-sm"
              >
                <span>{language === 'az' ? 'Detallar' : language === 'en' ? 'Details' : 'Детали'}</span>
                {isDetailsOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="p-1.5 text-[#A1A1AA] hover:text-white hover:bg-[#27272A] rounded-lg transition-colors cursor-pointer"
                title="Save Changes"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
            </div>

            {isDetailsOpen && (
              <div className="space-y-3.5 text-xs">
                {/* Organization Name */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Təşkilatın Adı' : language === 'en' ? 'Organization Name' : 'Название организации'}</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1 font-semibold"
                  />
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Veb sayt' : language === 'en' ? 'Website' : 'Веб-сайт'}</label>
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Veb sayt əlavə et...' : language === 'en' ? 'Add Website...' : 'Добавить веб-сайт...'}
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-sky-400 placeholder:text-[#71717A] focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1 font-mono"
                  />
                </div>

                {/* Territory */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Ərazi' : language === 'en' ? 'Territory' : 'Территория'}</label>
                  <select
                    value={formData.territory}
                    onChange={(e) => {
                      const updated = { ...formData, territory: e.target.value };
                      setFormData(updated);
                      handleSave(updated);
                    }}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1 cursor-pointer"
                  >
                    <option value="" className="bg-[#1C1C1E]">{language === 'az' ? 'Ərazi əlavə et...' : language === 'en' ? 'Add Territory...' : 'Добавить территорию...'}</option>
                    {territoryOptions.map(t => <option key={t} value={t} className="bg-[#1C1C1E]">{getTerritoryLabel(t, language)}</option>)}
                  </select>
                </div>

                {/* Industry */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Sənaye sahəsi' : language === 'en' ? 'Industry' : 'Индустрия'}</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => {
                      const updated = { ...formData, industry: e.target.value };
                      setFormData(updated);
                      handleSave(updated);
                    }}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1 cursor-pointer"
                  >
                    {industryOptions.map(i => <option key={i} value={i} className="bg-[#1C1C1E]">{getIndustryLabel(i, language)}</option>)}
                  </select>
                </div>

                {/* No. of Employees */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'İşçi sayı' : language === 'en' ? 'No. of Employees' : 'Кол-во сотрудников'}</label>
                  <select
                    value={formData.noOfEmployees}
                    onChange={(e) => {
                      const updated = { ...formData, noOfEmployees: e.target.value };
                      setFormData(updated);
                      handleSave(updated);
                    }}
                    className="w-full bg-[#1C1C1E] border border-[#2C2C2E] text-white focus:outline-none focus:border-sky-500 rounded-xl px-3 py-1.5 cursor-pointer"
                  >
                    {employeeCountOptions.map(e => <option key={e} value={e} className="bg-[#1C1C1E]">{e}</option>)}
                  </select>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Ünvan' : language === 'en' ? 'Address' : 'Адрес'}</label>
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Ünvan əlavə et...' : language === 'en' ? 'Add Address...' : 'Добавить адрес...'}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-white placeholder:text-[#71717A] focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT MAIN PANEL: DEALS & CONTACTS TABS */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col min-w-0">
          {/* Tabs Navigation Header */}
          <div className="border-b border-[#2C2C2E]/60 flex items-center gap-6 text-xs text-[#A1A1AA]">
            <button
              onClick={() => setActiveTab('Deals')}
              className={`flex items-center gap-2 pb-3 font-bold transition-colors border-b-2 cursor-pointer ${activeTab === 'Deals'
                ? 'border-sky-500 text-white font-semibold'
                : 'border-transparent hover:text-white'
                }`}
            >
              <BoltIcon className="w-4 h-4 text-sky-400" />
              <span>{language === 'az' ? 'Sövdələşmələr' : language === 'en' ? 'Deals' : 'Сделки'}</span>
              <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                {associatedDeals.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('Contacts')}
              className={`flex items-center gap-2 pb-3 font-bold transition-colors border-b-2 cursor-pointer ${activeTab === 'Contacts'
                ? 'border-sky-500 text-white font-semibold'
                : 'border-transparent hover:text-white'
                }`}
            >
              <UserIcon className="w-4 h-4 text-sky-400" />
              <span>{language === 'az' ? 'Əlaqələr' : language === 'en' ? 'Contacts' : 'Контакты'}</span>
              <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                {associatedContacts.length}
              </span>
            </button>
          </div>

          {/* TAB 1: DEALS TAB */}
          {activeTab === 'Deals' && (
            <div className="mt-4 flex-1 flex flex-col">
              {associatedDeals.length === 0 ? (
                /* Empty State */
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A]">
                    <BoltIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-4">{language === 'az' ? 'Sövdələşmə tapılmadı' : language === 'en' ? 'No Deals Found' : 'Сделок не найдено'}</h3>
                  <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 leading-relaxed">
                    {language === 'az' ? 'Hazırda bu təşkilata aid heç bir sövdələşmə yoxdur. Yuxarıdakı Yarat düyməsi ilə yenisini əlavə edə bilərsiniz.' : language === 'en' ? 'It appears that there are currently no Deals available. You can create more Deals by using the Create button.' : 'Для этой организации пока нет сделок.'}
                  </p>
                </div>
              ) : (
                /* Real Database Deals Table */
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2C2C2E]/60 text-[#A1A1AA] font-medium">
                        <th className="py-3 px-4">{language === 'az' ? 'Təşkilat' : language === 'en' ? 'Organization' : 'Организация'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'Məbləğ' : language === 'en' ? 'Amount' : 'Сумма'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'Status' : language === 'en' ? 'Status' : 'Статус'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'E-poçt' : language === 'en' ? 'Email' : 'Эл. адрес'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'Mobil nömrə' : language === 'en' ? 'Mobile No.' : 'Мобильный номер'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'Sövdələşmə sahibi' : language === 'en' ? 'Deal Owner' : 'Владелец сделки'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'Son dəyişiklik' : language === 'en' ? 'Last Modified' : 'Последнее изменение'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {associatedDeals.map((deal) => {
                        const statusColor = dealStatusColors[deal.status] || '#38BDF8';
                        return (
                          <tr key={deal.id} className="border-b border-[#2C2C2E]/40 hover:bg-[#1C1C1E]/60 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              <Link
                                to={`/crm/deals/${deal.id}`}
                                className="flex items-center gap-2 hover:text-sky-400 transition-colors group cursor-pointer"
                              >
                                <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {deal.organization ? deal.organization.charAt(0).toUpperCase() : 'O'}
                                </span>
                                <span className="group-hover:underline">{deal.organization}</span>
                              </Link>
                            </td>

                            <td className="py-3.5 px-4 font-mono text-[#D4D4D8]">
                              {deal.amount}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: statusColor }}></span>
                                <span className="text-white font-medium">{getDealStatusLabel(deal.status, language)}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">
                              {deal.email}
                            </td>

                            <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">
                              <div className="flex items-center gap-1.5">
                                <PhoneIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                <span>{deal.mobile}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2 text-white font-medium">
                                <span className="w-4 h-4 rounded-full bg-[#27272A] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                                  {deal.ownerInitial}
                                </span>
                                <span>{deal.owner}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-[#71717A]">
                              {deal.lastModified}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTACTS TAB */}
          {activeTab === 'Contacts' && (
            <div className="mt-4 flex-1 flex flex-col">
              {associatedContacts.length === 0 ? (
                /* Empty State */
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#1C1C1E] border border-[#2C2C2E] flex items-center justify-center text-[#71717A]">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white mt-4">{language === 'az' ? 'Əlaqə tapılmadı' : language === 'en' ? 'No Contacts Found' : 'Контактов не найдено'}</h3>
                  <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 leading-relaxed">
                    {language === 'az' ? 'Bu təşkilat üçün heç bir əlaqə tapılmadı.' : language === 'en' ? 'No contacts found for this organization.' : 'Для этой организации контактов не найдено.'}
                  </p>
                </div>
              ) : (
                /* Real Database Contacts Table */
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#2C2C2E]/60 text-[#A1A1AA] font-medium">
                        <th className="py-3 px-4">{language === 'az' ? 'Ad' : language === 'en' ? 'Name' : 'Имя'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'E-poçt' : language === 'en' ? 'Email' : 'Эл. адрес'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'Telefon' : language === 'en' ? 'Phone' : 'Телефон'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'Təşkilat' : language === 'en' ? 'Organization' : 'Организация'}</th>
                        <th className="py-3 px-4">{language === 'az' ? 'Son dəyişiklik' : language === 'en' ? 'Last Modified' : 'Последнее изменение'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {associatedContacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-[#2C2C2E]/40 hover:bg-[#1C1C1E]/60 transition-colors">
                          {/* Name */}
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <Link
                              to={`/crm/contacts/${contact.id}`}
                              className="flex items-center gap-2 hover:text-sky-400 transition-colors group cursor-pointer"
                            >
                              <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                                {contact.initial}
                              </span>
                              <span className="group-hover:underline">{contact.name}</span>
                            </Link>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">
                            {contact.email}
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">
                            <div className="flex items-center gap-1.5">
                              <PhoneIcon className="w-3.5 h-3.5 text-[#71717A]" />
                              <span>{contact.phone}</span>
                            </div>
                          </td>

                          {/* Organization */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 text-white font-medium">
                              <span className="w-4 h-4 rounded-full bg-[#27272A] text-[#A1A1AA] text-[9px] font-bold flex items-center justify-center shrink-0">
                                {contact.orgInitial}
                              </span>
                              <span>{contact.organization}</span>
                            </div>
                          </td>

                          {/* Last Modified */}
                          <td className="py-3.5 px-4 text-[#71717A]">
                            {contact.lastModified}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetailPage;
