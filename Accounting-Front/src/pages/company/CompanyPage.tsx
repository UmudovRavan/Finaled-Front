import React, { useState, useEffect } from 'react';
import { companyService, accountsService } from '../../api';
import type {
    CompanyProfileDto,
    UpdateCompanyProfileDto,
    CompanyDefaultAccountsDto,
    AccountDto,
} from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import CustomSelect from '../../components/CustomSelect';
import {
    BuildingOffice2Icon,
    ShieldCheckIcon,
    BanknotesIcon,
    ScaleIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    UserIcon,
    IdentificationIcon,
    GlobeAltIcon,
    CalendarDaysIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

const LEGAL_FORMS = [
    { value: 'MMC', label: 'MMC - Məhdud Məsuliyyətli Cəmiyyət' },
    { value: 'ASC', label: 'ASC - Açıq Səhmdar Cəmiyyəti' },
    { value: 'QSC', label: 'QSC - Qapalı Səhmdar Cəmiyyəti' },
    { value: 'FS', label: 'Fərdi Sahibkar (F/S)' },
    { value: 'BM', label: 'BM - Birgə Müəssisə' },
    { value: 'DM', label: 'Dövlət Müəssisəsi' },
    { value: 'FILIAL', label: 'Xarici Müəssisənin Filial / Nümayəndəliyi' },
    { value: 'DIGER', label: 'Digər' },
];

const TAX_REGIMES = [
    { value: 'VAT', label: 'Ümumi Vergi Rejimi (Mənfəət vergisi 20% + ƏDV 18%)' },
    { value: 'SIMPLIFIED_2', label: 'Sadələşdirilmiş Vergi (2% Bakı xaricində)' },
    { value: 'SIMPLIFIED_4', label: 'Sadələşdirilmiş Vergi (4% Bakı şəhəri)' },
    { value: 'INCOME_TAX', label: 'Gəlir Vergisi (Fərdi Sahibkarlar üzrə 20%)' },
    { value: 'EXEMPT', label: 'Vergidən Azad Edilmiş (Güzəştli Texnopark / Azad İqtisadi Zona)' },
];

const CURRENCIES = [
    { value: 'AZN', label: 'AZN - Azərbaycan Manatı (₼)' },
    { value: 'USD', label: 'USD - ABŞ Dolları ($)' },
    { value: 'EUR', label: 'EUR - Avro (€)' },
    { value: 'GBP', label: 'GBP - Britaniya Funt Sterlinqi (£)' },
    { value: 'TRY', label: 'TRY - Türk Lirəsi (₺)' },
];

const MONTHS = [
    { value: '1', label: 'Yanvar (01)' },
    { value: '2', label: 'Fevral (02)' },
    { value: '3', label: 'Mart (03)' },
    { value: '4', label: 'Aprel (04)' },
    { value: '5', label: 'May (05)' },
    { value: '6', label: 'İyun (06)' },
    { value: '7', label: 'İyul (07)' },
    { value: '8', label: 'Avqust (08)' },
    { value: '9', label: 'Sentyabr (09)' },
    { value: '10', label: 'Oktyabr (10)' },
    { value: '11', label: 'Noyabr (11)' },
    { value: '12', label: 'Dekabr (12)' },
];

export const CompanyPage: React.FC = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const [activeTab, setActiveTab] = useState<'profile' | 'tax' | 'bank' | 'accounts'>('profile');
    const [accounts, setAccounts] = useState<AccountDto[]>([]);

    const [profile, setProfile] = useState<CompanyProfileDto>({
        id: '',
        name: 'Altensor MMC',
        taxNumber: '1401234561',
        baseCurrency: 'AZN',
        country: 'AZE',
        address: 'Bakı şəhəri, Nizami r-nu, Heydər Əliyev pr. 105',
        phone: '+994 (12) 599-00-00',
        email: 'info@altensor.com',
        legalForm: 'MMC',
        taxRegime: 'VAT',
        isVatPayer: true,
        vatRate: 18.0,
        fiscalYearStartMonth: 1,
        fiscalYearEndMonth: 12,
        directorName: 'Rəvan Ümüdov',
        chiefAccountantName: 'Baş Mühasib',
        bankName: 'PAŞA Bank ASC',
        bankCode: '505520',
        bankAccountNumber: 'AZ00PASHA0000000000000000000',
        iban: 'AZ00PASHA0000000000000000000',
        swiftBic: 'PASHAZ22',
        correspondentAccount: '0137010001944',
        statisticalCode: '1234567',
        asanLoginId: 'ASAN-1401234561',
    });

    const [defaultAccounts, setDefaultAccounts] = useState<CompanyDefaultAccountsDto>({
        defaultReceivableAccountId: '',
        defaultPayableAccountId: '',
        defaultStockAccountId: '',
        defaultGRNIAccountId: '',
        defaultCOGSAccountId: '',
        defaultRetainedEarningsAccountId: '',
        defaultInputVatAccountId: '',
        defaultOutputVatAccountId: '',
        defaultRevenueAccountId: '',
        defaultFXGainLossAccountId: '',
    });

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 4000);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [profRes, defRes, accRes] = await Promise.allSettled([
                companyService.getCompanyProfile(),
                companyService.getDefaultAccounts(),
                accountsService.getAccounts(),
            ]);

            if (profRes.status === 'fulfilled' && profRes.value) {
                setProfile((prev) => ({
                    ...prev,
                    ...profRes.value,
                }));
            }
            if (defRes.status === 'fulfilled' && defRes.value) {
                setDefaultAccounts((prev) => ({
                    ...prev,
                    ...defRes.value,
                }));
            }
            if (accRes.status === 'fulfilled' && Array.isArray(accRes.value)) {
                setAccounts(accRes.value);
            }
        } catch (err) {
            console.error('Company load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const updatePayload: UpdateCompanyProfileDto = {
                name: profile.name,
                taxNumber: profile.taxNumber,
                baseCurrency: profile.baseCurrency,
                country: profile.country,
                address: profile.address,
                phone: profile.phone,
                email: profile.email,
                legalForm: profile.legalForm,
                taxRegime: profile.taxRegime,
                isVatPayer: profile.isVatPayer,
                vatRate: Number(profile.vatRate) || 18,
                fiscalYearStartMonth: Number(profile.fiscalYearStartMonth) || 1,
                fiscalYearEndMonth: Number(profile.fiscalYearEndMonth) || 12,
                directorName: profile.directorName,
                chiefAccountantName: profile.chiefAccountantName,
                bankName: profile.bankName,
                bankCode: profile.bankCode,
                bankAccountNumber: profile.bankAccountNumber,
                iban: profile.iban,
                swiftBic: profile.swiftBic,
                correspondentAccount: profile.correspondentAccount,
                statisticalCode: profile.statisticalCode,
                asanLoginId: profile.asanLoginId,
            };

            await Promise.all([
                companyService.updateCompanyProfile(updatePayload),
                companyService.updateDefaultAccounts(defaultAccounts),
            ]);

            showToast('Şirkət məlumatları və standart hesablar uğurla yadda saxlanıldı', 'success');
        } catch (err: any) {
            console.error('Save company error:', err);
            const msg = err?.response?.data?.message || err?.message || 'Məlumatları yadda saxlayarkən xəta baş verdi';
            showToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    const accountSelectOptions = accounts.map((a) => ({
        value: a.id,
        label: `${a.code} - ${a.name}`,
    }));

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Top Header (Breadcrumb & Action buttons) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{t('company.title', {}, 'Şirkət')}</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <BuildingOffice2Icon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{profile.name || t('company.profile', {}, 'Profil və Tənzimləmələr')}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                <span>{t('common.saving', {}, 'Saxlanılır...')}</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                <span>{t('common.save', {}, 'Yadda Saxla')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ─── Toast Notification ─── */}
            {toast && (
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs flex items-center gap-2 shadow-2xl animate-in fade-in">
                    {toast.type === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />
                    ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{toast.text}</span>
                </div>
            )}

            {/* ─── Summary Overview Card ─── */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0">
                            <BuildingOffice2Icon className="w-6 h-6 stroke-[1.75] text-white" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-white">
                                    {profile.name || 'Şirkət Profili'}
                                </h2>
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                                    {profile.legalForm || 'MMC'}
                                </span>
                                {profile.isVatPayer ? (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-white border border-[#3F3F46]">
                                        ƏDV: {profile.vatRate}%
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#71717A] border border-[#27272A]">
                                        ƏDV-siz
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#A1A1AA]">
                                <span className="flex items-center gap-1 font-mono">
                                    <IdentificationIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span className="text-[#71717A]">VÖEN:</span>
                                    <strong className="text-white font-mono">{profile.taxNumber || '—'}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                    <GlobeAltIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span className="text-[#71717A]">Ölkə:</span>
                                    <strong className="text-white">Azərbaycan</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                    <BanknotesIcon className="w-3.5 h-3.5 text-[#71717A]" />
                                    <span className="text-[#71717A]">Valyuta:</span>
                                    <strong className="text-white">{profile.baseCurrency}</strong>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Navigation Tabs ─── */}
                <div className="flex items-center gap-1 mt-5 pt-4 border-t border-[#27272A] overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeTab === 'profile'
                                ? 'bg-white text-black font-semibold'
                                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <BuildingOffice2Icon className="w-3.5 h-3.5" />
                        <span>Hüquqi Kimlik</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('tax')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeTab === 'tax'
                                ? 'bg-white text-black font-semibold'
                                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                        <span>Vergi & Maliyyə İli</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('bank')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeTab === 'bank'
                                ? 'bg-white text-black font-semibold'
                                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <BanknotesIcon className="w-3.5 h-3.5" />
                        <span>Bank Rekvizitləri</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('accounts')}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                            activeTab === 'accounts'
                                ? 'bg-white text-black font-semibold'
                                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                        <ScaleIcon className="w-3.5 h-3.5" />
                        <span>Standart Hesablar</span>
                    </button>
                </div>
            </div>

            {/* ─── Form Tabs Content ─── */}
            <form onSubmit={handleSave} className="space-y-4">
                {/* TAB 1: Profile & Legal */}
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Legal Identity Card */}
                        <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2 pb-2 border-b border-[#27272A]">
                                <IdentificationIcon className="w-4 h-4 text-white" />
                                <span>Hüquqi Kimlik və Dövlət Qeydiyyatı</span>
                            </h3>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Şirkətin Tam Adı *
                                </label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    required
                                    placeholder='Məs: "Altensor" MMC'
                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        VÖEN (Vergi Nömrəsi) *
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.taxNumber}
                                        onChange={(e) => setProfile({ ...profile, taxNumber: e.target.value })}
                                        required
                                        maxLength={10}
                                        placeholder="10 rəqəmli VÖEN"
                                        className="w-full font-mono bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Təşkilati-Hüquqi Forma
                                    </label>
                                    <CustomSelect
                                        options={LEGAL_FORMS}
                                        value={profile.legalForm || 'MMC'}
                                        onChange={(val) => setProfile({ ...profile, legalForm: val })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Statistik Kod
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.statisticalCode || ''}
                                        onChange={(e) => setProfile({ ...profile, statisticalCode: e.target.value })}
                                        placeholder="Dövlət statistika kodu"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        ASAN Login / Sertifikat ID
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.asanLoginId || ''}
                                        onChange={(e) => setProfile({ ...profile, asanLoginId: e.target.value })}
                                        placeholder="Asan İmza ID"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Management & Signatories */}
                        <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2 pb-2 border-b border-[#27272A]">
                                <UserIcon className="w-4 h-4 text-white" />
                                <span>Rəhbərlik və Əlaqə Məlumatları</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Baş Direktor
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.directorName || ''}
                                        onChange={(e) => setProfile({ ...profile, directorName: e.target.value })}
                                        placeholder="Direktorun Adı Soyadı"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Baş Mühasib
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.chiefAccountantName || ''}
                                        onChange={(e) => setProfile({ ...profile, chiefAccountantName: e.target.value })}
                                        placeholder="Baş Mühasibin Adı Soyadı"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Hüquqi / Faktiki Ünvan
                                </label>
                                <input
                                    type="text"
                                    value={profile.address || ''}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    placeholder="Şəhər, Rayon, Küçə, Ev"
                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Rəsmi Telefon
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.phone || ''}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+994 (12) 000-00-00"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Rəsmi E-poçt
                                    </label>
                                    <input
                                        type="email"
                                        value={profile.email || ''}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="info@company.az"
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: Tax & Fiscal Year */}
                {activeTab === 'tax' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tax Regime */}
                        <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2 pb-2 border-b border-[#27272A]">
                                <ShieldCheckIcon className="w-4 h-4 text-white" />
                                <span>Azərbaycan Vergi Məcəlləsi üzrə Rejim</span>
                            </h3>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Vergi Rejimi
                                </label>
                                <CustomSelect
                                    options={TAX_REGIMES}
                                    value={profile.taxRegime || 'VAT'}
                                    onChange={(val) => setProfile({ ...profile, taxRegime: val })}
                                />
                            </div>

                            <div className="p-3.5 rounded-xl border border-[#27272A] bg-[#18181B] flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-semibold text-white">ƏDV Mükəlləfiyyəti</div>
                                    <div className="text-[11px] text-[#71717A]">
                                        Şirkət ƏDV qeydiyyatındadır və ƏDV-li qaimələr təqdim edir
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.isVatPayer}
                                        onChange={(e) => setProfile({ ...profile, isVatPayer: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-[#27272A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white after:peer-checked:bg-black" />
                                </label>
                            </div>

                            {profile.isVatPayer && (
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Standart ƏDV Dərəcəsi (%)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={profile.vatRate}
                                        onChange={(e) => setProfile({ ...profile, vatRate: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Fiscal Year & Currency */}
                        <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2 pb-2 border-b border-[#27272A]">
                                <CalendarDaysIcon className="w-4 h-4 text-white" />
                                <span>Maliyyə İli və Əsas Uçot Valyutası</span>
                            </h3>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Əsas Uçot Valyutası *
                                </label>
                                <CustomSelect
                                    options={CURRENCIES}
                                    value={profile.baseCurrency || 'AZN'}
                                    onChange={(val) => setProfile({ ...profile, baseCurrency: val })}
                                />
                                <p className="text-[11px] text-[#71717A] mt-1.5">
                                    Bütün Baş Kitab (General Ledger) və maliyyə hesabatları bu valyutada formalaşır.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Maliyyə İli Başlanğıcı
                                    </label>
                                    <CustomSelect
                                        options={MONTHS}
                                        value={String(profile.fiscalYearStartMonth || 1)}
                                        onChange={(val) => setProfile({ ...profile, fiscalYearStartMonth: parseInt(val, 10) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                        Maliyyə İli Sonu
                                    </label>
                                    <CustomSelect
                                        options={MONTHS}
                                        value={String(profile.fiscalYearEndMonth || 12)}
                                        onChange={(val) => setProfile({ ...profile, fiscalYearEndMonth: parseInt(val, 10) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: Bank Details */}
                {activeTab === 'bank' && (
                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2 pb-2 border-b border-[#27272A]">
                            <BanknotesIcon className="w-4 h-4 text-white" />
                            <span>Əsas Bank Hesabı və Rekvizitlər</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Bankın Adı
                                </label>
                                <input
                                    type="text"
                                    value={profile.bankName || ''}
                                    onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                                    placeholder="Məs: PAŞA Bank ASC, Kapital Bank ASC"
                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Bank Kodu (MFO)
                                </label>
                                <input
                                    type="text"
                                    value={profile.bankCode || ''}
                                    onChange={(e) => setProfile({ ...profile, bankCode: e.target.value })}
                                    placeholder="Məs: 505520"
                                    className="w-full font-mono bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    İBAN (Beynəlxalq Bank Hesab Nömrəsi)
                                </label>
                                <input
                                    type="text"
                                    value={profile.iban || ''}
                                    onChange={(e) => setProfile({ ...profile, iban: e.target.value })}
                                    placeholder="AZ00PASHA0000000000000000000"
                                    className="w-full font-mono uppercase bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white tracking-wider transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    SWIFT / BIC Kodu
                                </label>
                                <input
                                    type="text"
                                    value={profile.swiftBic || ''}
                                    onChange={(e) => setProfile({ ...profile, swiftBic: e.target.value })}
                                    placeholder="Məs: PASHAZ22"
                                    className="w-full font-mono uppercase bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Müxbir Hesab
                                </label>
                                <input
                                    type="text"
                                    value={profile.correspondentAccount || ''}
                                    onChange={(e) => setProfile({ ...profile, correspondentAccount: e.target.value })}
                                    placeholder="Məs: 0137010001944"
                                    className="w-full font-mono bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: Default Accounts (CoA) */}
                {activeTab === 'accounts' && (
                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#27272A]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
                                <ScaleIcon className="w-4 h-4 text-white" />
                                <span>Avtomatik Əməliyyatlar üçün Standart Hesablar Planı</span>
                            </h3>
                            <span className="text-[11px] text-[#71717A]">
                                Sistem avtomatik qaimə və ödənişlərdə bu hesablardan istifadə edir.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Debitor Hesabı (AR - Alıcılar və Sifarişçilər)
                                </label>
                                <CustomSelect
                                    options={accountSelectOptions}
                                    value={defaultAccounts.defaultReceivableAccountId || ''}
                                    onChange={(val) => setDefaultAccounts({ ...defaultAccounts, defaultReceivableAccountId: val })}
                                    placeholder="211 - Alıcıların qısamüddətli debitor borcları"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Kreditor Hesabı (AP - Təchizatçılar və Podratçılar)
                                </label>
                                <CustomSelect
                                    options={accountSelectOptions}
                                    value={defaultAccounts.defaultPayableAccountId || ''}
                                    onChange={(val) => setDefaultAccounts({ ...defaultAccounts, defaultPayableAccountId: val })}
                                    placeholder="531 - Təchizatçılara qısamüddətli kreditor borcları"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Mallar / Ehtiyatlar Hesabı (Inventory)
                                </label>
                                <CustomSelect
                                    options={accountSelectOptions}
                                    value={defaultAccounts.defaultStockAccountId || ''}
                                    onChange={(val) => setDefaultAccounts({ ...defaultAccounts, defaultStockAccountId: val })}
                                    placeholder="205 - Mallar"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Satışın Maya Dəyəri (COGS)
                                </label>
                                <CustomSelect
                                    options={accountSelectOptions}
                                    value={defaultAccounts.defaultCOGSAccountId || ''}
                                    onChange={(val) => setDefaultAccounts({ ...defaultAccounts, defaultCOGSAccountId: val })}
                                    placeholder="701 - Satışın maya dəyəri"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Əsas Satış Gəlirləri (Revenue)
                                </label>
                                <CustomSelect
                                    options={accountSelectOptions}
                                    value={defaultAccounts.defaultRevenueAccountId || ''}
                                    onChange={(val) => setDefaultAccounts({ ...defaultAccounts, defaultRevenueAccountId: val })}
                                    placeholder="601 - Əsas əməliyyat gəlirləri"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Bölüşdürülməmiş Mənfəət Hesabı (Retained Earnings)
                                </label>
                                <CustomSelect
                                    options={accountSelectOptions}
                                    value={defaultAccounts.defaultRetainedEarningsAccountId || ''}
                                    onChange={(val) => setDefaultAccounts({ ...defaultAccounts, defaultRetainedEarningsAccountId: val })}
                                    placeholder="341 - Hesabat ilinin bölüşdürülməmiş mənfəəti"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Giriş ƏDV Hesabı (Əvəzləşdirilən ƏDV)
                                </label>
                                <CustomSelect
                                    options={accountSelectOptions}
                                    value={defaultAccounts.defaultInputVatAccountId || ''}
                                    onChange={(val) => setDefaultAccounts({ ...defaultAccounts, defaultInputVatAccountId: val })}
                                    placeholder="241 - Büdcə ilə ƏDV üzrə hesablaşmalar"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Çıxış ƏDV Hesabı (Ödənilməli ƏDV)
                                </label>
                                <CustomSelect
                                    options={accountSelectOptions}
                                    value={defaultAccounts.defaultOutputVatAccountId || ''}
                                    onChange={(val) => setDefaultAccounts({ ...defaultAccounts, defaultOutputVatAccountId: val })}
                                    placeholder="545 - Büdcəyə vergilər üzrə digər borclar"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CompanyPage;
