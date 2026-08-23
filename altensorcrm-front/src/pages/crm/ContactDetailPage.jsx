import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contactsApi, dealsApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getDealStatusLabel, getGenderLabel, getSalutationLabel } from '../../utils/statusUtils';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const salutationOptions = ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof'];
const genderOptions = ['Male', 'Female', 'Other'];

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

const ContactDetailPage = () => {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    salutation: 'Mr',
    firstName: '',
    lastName: '',
    emailAddress: '',
    mobileNo: '',
    gender: 'Male',
    companyName: '',
    designation: '',
    address: ''
  });

  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [associatedDeals, setAssociatedDeals] = useState([]);

  useEffect(() => {
    if (id) {
      fetchContactDetail(id);
    }
  }, [id]);

  const fetchContactDetail = async (contactId) => {
    try {
      setLoading(true);
      const data = await contactsApi.getById(contactId);
      if (data) {
        const fetchedData = {
          salutation: data.salutation || data.salutationName || 'Mr',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          emailAddress: data.emailAddress || data.email || '',
          mobileNo: data.mobileNo || data.mobile || '',
          gender: data.gender || data.genderName || 'Male',
          companyName: data.companyName || data.organizationName || '',
          designation: data.designation || '',
          address: data.address?.fullAddress || data.address || ''
        };
        setFormData(fetchedData);
        await fetchAssociatedDeals(contactId, fetchedData);
      }
    } catch (err) {
      console.warn('Notice fetching contact detail:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedDeals = async (contactId, currentData = null) => {
    try {
      const allDeals = await dealsApi.getAll();
      const rawList = Array.isArray(allDeals) ? allDeals : allDeals?.items || [];
      
      const emailToMatch = (currentData?.emailAddress || formData.emailAddress || '').toLowerCase();
      const nameToMatch = (currentData?.firstName || formData.firstName || '').toLowerCase();
      const orgToMatch = (currentData?.companyName || formData.companyName || '').toLowerCase();

      // Filter deals by contact ID, email, name, or organization matching real backend data
      const matched = rawList.filter(d => {
        if (!d) return false;
        if (d.contactId && String(d.contactId).toLowerCase() === String(contactId).toLowerCase()) return true;
        if (emailToMatch && d.primaryEmail && String(d.primaryEmail).toLowerCase() === emailToMatch) return true;
        if (emailToMatch && d.email && String(d.email).toLowerCase() === emailToMatch) return true;
        if (nameToMatch && d.contactName && String(d.contactName).toLowerCase().includes(nameToMatch)) return true;
        if (orgToMatch && d.organizationName && String(d.organizationName).toLowerCase() === orgToMatch) return true;
        return false;
      });

      setAssociatedDeals(matched.map(d => ({
        id: d.id,
        organization: d.organizationName || d.name || 'Organization',
        amount: d.annualRevenue ? `$ ${d.annualRevenue}` : '$ 0.00',
        status: d.statusName || d.status || 'Proposal/Quotation',
        email: d.primaryEmail || d.email || emailToMatch || '—',
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

  const handleSave = async (overrideData = null) => {
    const dataToSave = overrideData || formData;
    try {
      setSaving(true);
      const payload = {
        id: id,
        salutation: dataToSave.salutation,
        firstName: dataToSave.firstName || 'Contact',
        lastName: dataToSave.lastName || '',
        emailAddress: dataToSave.emailAddress || '',
        mobileNo: dataToSave.mobileNo || '',
        gender: dataToSave.gender,
        companyName: dataToSave.companyName || '',
        designation: dataToSave.designation || '',
        addressId: null,
        address: null,
        organizationId: null,
        assignedUserId: null
      };

      await contactsApi.update(id, payload);
      showToast(language === 'az' ? 'Əlaqə uğurla yadda saxlanıldı!' : language === 'en' ? 'Contact saved successfully!' : 'Контакт успешно сохранен!', 'success');
      await fetchContactDetail(id);
    } catch (err) {
      console.error('Error updating contact:', err);
      showToast(err.message || (language === 'az' ? 'Əlaqəni yeniləyərkən xəta baş verdi' : 'Error updating contact'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await contactsApi.delete(id);
      showToast(language === 'az' ? 'Əlaqə uğurla silindi!' : language === 'en' ? 'Contact deleted successfully!' : 'Контакт успешно удален!', 'success');
      setTimeout(() => {
        navigate('/crm/contacts');
      }, 1000);
    } catch (err) {
      console.error('Error deleting contact:', err);
      showToast(err.message || (language === 'az' ? 'Əlaqəni silərkən xəta baş verdi' : 'Error deleting contact'), 'error');
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const contactTitle = `${formData.salutation ? `${formData.salutation} ` : ''}${formData.firstName} ${formData.lastName}`.trim() || (language === 'az' ? 'Əlaqə Detalları' : language === 'en' ? 'Contact Details' : 'Детали контакта');
  const initial = formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'C';

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
              <h3 className="text-base font-bold text-white">{language === 'az' ? 'Əlaqəni Sil' : language === 'en' ? 'Delete Contact' : 'Удалить контакт'}</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-[#A1A1AA] hover:text-white p-1">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              {language === 'az' ? (
                <>Həqiqətən <strong className="text-white">{contactTitle}</strong> əlaqəsini silmək istəyirsiniz? Bu əməliyyat geri qaytarıla bilməz.</>
              ) : language === 'en' ? (
                <>Are you sure you want to delete <strong className="text-white">{contactTitle}</strong>? This action cannot be undone.</>
              ) : (
                <>Вы уверены, что хотите удалить <strong className="text-white">{contactTitle}</strong>? Это действие нельзя отменить.</>
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
          <Link to="/crm/contacts" className="hover:text-white transition-colors">{language === 'az' ? 'Əlaqələr' : language === 'en' ? 'Contacts' : 'Контакты'}</Link>
          <span>/</span>
          <Link to="/crm/contacts" className="hover:text-white transition-colors">{language === 'az' ? 'Siyahı' : language === 'en' ? 'List' : 'Список'}</Link>
          <span>/</span>
          <span className="text-white font-semibold">{contactTitle.toLowerCase()}</span>
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN CONTENT BODY */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* LEFT PANEL: AVATAR, DELETE BUTTON & DETAILS FORM */}
        <div className="w-full lg:w-80 shrink-0 border-r border-[#2C2C2E]/60 bg-[#121214] p-6 space-y-6 text-xs overflow-y-auto custom-scrollbar">
          {/* Avatar & Contact Name Header */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white font-bold text-xl shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-white truncate leading-snug">{contactTitle}</h1>
              <p className="text-xs text-[#A1A1AA] truncate">{formData.companyName || '—'}</p>
            </div>
          </div>

          {/* Delete Button */}
          <div>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs"
            >
              <TrashIcon className="w-4 h-4" />
              <span>{t('common.delete', {}, 'Delete')}</span>
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
                {/* Salutation */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Müraciət forması' : language === 'en' ? 'Salutation' : 'Обращение'}</label>
                  <select
                    value={formData.salutation}
                    onChange={(e) => {
                      const updated = { ...formData, salutation: e.target.value };
                      setFormData(updated);
                      handleSave(updated);
                    }}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1 cursor-pointer"
                  >
                    {salutationOptions.map(s => <option key={s} value={s} className="bg-[#1C1C1E]">{getSalutationLabel(s, language)}</option>)}
                  </select>
                </div>

                {/* First Name */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Ad' : language === 'en' ? 'First Name' : 'Имя'}</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Soyad' : language === 'en' ? 'Last Name' : 'Фамилия'}</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'E-poçt ünvanı' : language === 'en' ? 'Email Address' : 'Адрес электронной почты'}</label>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1 font-mono"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Mobil nömrə' : language === 'en' ? 'Mobile Number' : 'Мобильный номер'}</label>
                  <input
                    type="text"
                    value={formData.mobileNo}
                    onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1 font-mono"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Cins' : language === 'en' ? 'Gender' : 'Пол'}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => {
                      const updated = { ...formData, gender: e.target.value };
                      setFormData(updated);
                      handleSave(updated);
                    }}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1 cursor-pointer"
                  >
                    {genderOptions.map(g => (
                      <option key={g} value={g} className="bg-[#1C1C1E]">
                        {getGenderLabel(g, language)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Organization */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Təşkilat' : language === 'en' ? 'Organization' : 'Организация'}</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1"
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1">
                  <label className="text-[#71717A] text-[11px] block">{language === 'az' ? 'Vəzifə' : language === 'en' ? 'Designation' : 'Должность'}</label>
                  <input
                    type="text"
                    placeholder={language === 'az' ? 'Vəzifə əlavə et...' : language === 'en' ? 'Add Designation...' : 'Добавить должность...'}
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    onBlur={() => handleSave()}
                    className="w-full bg-transparent border-none text-white placeholder:text-[#71717A] focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-1"
                  />
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

        {/* RIGHT MAIN PANEL: DEALS TABLE */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col min-w-0">
          {/* Deals Tab Header with Count Badge */}
          <div className="border-b border-[#2C2C2E]/60 pb-3 flex items-center gap-3">
            <button className="flex items-center gap-2 text-xs font-bold text-white border-b-2 border-sky-500 pb-2 cursor-pointer">
              <BoltIcon className="w-4 h-4 text-sky-400" />
              <span>{language === 'az' ? 'Sövdələşmələr' : language === 'en' ? 'Deals' : 'Сделки'}</span>
              <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                {associatedDeals.length}
              </span>
            </button>
          </div>

          {/* Deals Table */}
          <div className="mt-4 flex-1 overflow-x-auto custom-scrollbar">
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
                {associatedDeals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-16 text-center text-[#71717A]">
                      {language === 'az' ? 'Bu əlaqə ilə əlaqəli heç bir sövdələşmə tapılmadı.' : language === 'en' ? 'No deals associated with this contact.' : 'Нет сделок, связанных с этим контактом.'}
                    </td>
                  </tr>
                ) : (
                  associatedDeals.map((deal) => {
                    const statusColor = dealStatusColors[deal.status] || '#38BDF8';
                    return (
                      <tr key={deal.id} className="border-b border-[#2C2C2E]/40 hover:bg-[#1C1C1E]/60 transition-colors">
                        {/* Organization */}
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <Link
                            to={`/crm/deals/${deal.id}`}
                            className="flex items-center gap-2 hover:text-sky-400 transition-colors group cursor-pointer"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-[#A1A1AA] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {deal.organization ? deal.organization.charAt(0).toUpperCase() : 'E'}
                            </span>
                            <span className="group-hover:underline">{deal.organization}</span>
                          </Link>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono text-[#D4D4D8]">
                          {deal.amount}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: statusColor }}></span>
                            <span className="text-white font-medium">{getDealStatusLabel(deal.status, language)}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">
                          {deal.email}
                        </td>

                        {/* Mobile No */}
                        <td className="py-3.5 px-4 text-[#A1A1AA] font-mono">
                          <div className="flex items-center gap-1.5">
                            <PhoneIcon className="w-3.5 h-3.5 text-[#71717A]" />
                            <span>{deal.mobile}</span>
                          </div>
                        </td>

                        {/* Deal Owner */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-white font-medium">
                            <span className="w-4 h-4 rounded-full bg-[#27272A] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {deal.ownerInitial}
                            </span>
                            <span>{deal.owner}</span>
                          </div>
                        </td>

                        {/* Last Modified */}
                        <td className="py-3.5 px-4 text-[#71717A]">
                          {deal.lastModified}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPage;
