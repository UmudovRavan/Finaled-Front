import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { masterDataService, accountsService, fiscalService } from '../../api';
import type {
    MasterDataSummaryDto,
    MasterDataTabItemDto,
    AccountDto,
    SetInitialBalancesDto,
} from '../../dto';
import { useLanguage } from '../../context/LanguageContext';
import CustomersPage from '../invoicing/CustomersPage';
import SuppliersPage from '../procurement/SuppliersPage';
import ItemsPage from '../invoicing/ItemsPage';
import WarehousesPage from '../inventory/WarehousesPage';
import BankAccountsPage from '../treasury/BankAccountsPage';
import {
    CircleStackIcon,
    ArrowPathIcon,
    PlusIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    BuildingOffice2Icon,
    CalendarDaysIcon,
    ScaleIcon,
    ArchiveBoxIcon,
    ShoppingBagIcon,
    UserGroupIcon,
    TruckIcon,
    XMarkIcon,
    TrashIcon,
    ArrowTopRightOnSquareIcon,
    PaperClipIcon,
    CreditCardIcon,
    BuildingOfficeIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';

const formatCurrency = (val: number, cur = 'AZN'): string => {
    return `${val.toLocaleString('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}`;
};

interface LocalBalanceLine {
    accountId: string;
    debitAmount: number;
    creditAmount: number;
    notes?: string;
}

export const MasterDataPage: React.FC = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab') || 'overview';

    const handleTabChange = (key: string) => {
        if (key === 'overview') {
            searchParams.delete('tab');
            setSearchParams(searchParams);
        } else {
            setSearchParams({ tab: key });
        }
    };

    const [summary, setSummary] = useState<MasterDataSummaryDto | null>(null);
    const [tabs, setTabs] = useState<MasterDataTabItemDto[]>([]);
    const [accounts, setAccounts] = useState<AccountDto[]>([]);
    const [fiscalYears, setFiscalYears] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initial Balances State
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fiscalYearId, setFiscalYearId] = useState('');
    const [asOfDate, setAsOfDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-01-01`;
    });
    const [actNumber, setActNumber] = useState('');
    const [attachmentUrl, setAttachmentUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [balanceLines, setBalanceLines] = useState<LocalBalanceLine[]>([
        { accountId: '', debitAmount: 0, creditAmount: 0, notes: '' },
        { accountId: '', debitAmount: 0, creditAmount: 0, notes: '' },
    ]);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const [sumData, tabsData, accData, periodsData] = await Promise.all([
                masterDataService.getSummary(),
                masterDataService.getTabs(),
                accountsService.getAccounts().catch(() => []),
                fiscalService.getFiscalPeriods().catch(() => []),
            ]);
            setSummary(sumData);
            setTabs(tabsData);
            setAccounts(accData);

            // Extract unique fiscal years
            const uniqueYears: { id: string; name: string }[] = [];
            const seenYears = new Set<number>();
            periodsData.forEach((p) => {
                if (!seenYears.has(p.fiscalYear)) {
                    seenYears.add(p.fiscalYear);
                    uniqueYears.push({
                        id: String(p.fiscalYear),
                        name: `${p.fiscalYear} Maliyyə İli`,
                    });
                }
            });
            if (uniqueYears.length === 0) {
                const currentYear = new Date().getFullYear();
                uniqueYears.push({ id: String(currentYear), name: `${currentYear} Maliyyə İli` });
            }
            setFiscalYears(uniqueYears);
            if (!fiscalYearId && uniqueYears.length > 0) {
                setFiscalYearId(uniqueYears[0].id);
            }
        } catch (err: any) {
            console.error('Master data load error:', err);
            showToast('Əsas məlumatları yükləyərkən xəta baş verdi', 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Line balance calculations
    const totalDebit = balanceLines.reduce((sum, l) => sum + (Number(l.debitAmount) || 0), 0);
    const totalCredit = balanceLines.reduce((sum, l) => sum + (Number(l.creditAmount) || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = difference < 0.0001 && (totalDebit > 0 || totalCredit > 0);

    const handleAddLine = () => {
        setBalanceLines((prev) => [
            ...prev,
            { accountId: '', debitAmount: 0, creditAmount: 0, notes: '' },
        ]);
    };

    const handleRemoveLine = (idx: number) => {
        if (balanceLines.length <= 1) return;
        setBalanceLines((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleLineChange = (idx: number, field: keyof LocalBalanceLine, val: any) => {
        setBalanceLines((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: val };
            return next;
        });
    };

    const handleSubmitInitialBalances = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!fiscalYearId) {
            showToast('Zəhmət olmasa maliyyə ilini seçin', 'error');
            return;
        }
        if (!isBalanced) {
            showToast('Debet və Kredit məbləğləri bərabər olmalıdır! Fərq: ' + difference.toFixed(2), 'error');
            return;
        }

        const validLines = balanceLines.filter((l) => l.accountId && (l.debitAmount > 0 || l.creditAmount > 0));
        if (validLines.length === 0) {
            showToast('Ən azı bir hesab üçün məbləğ daxil edin', 'error');
            return;
        }

        const payload: SetInitialBalancesDto = {
            actNumber: actNumber.trim() || `AKT-${new Date().getFullYear()}/01`,
            actDate: new Date(asOfDate).toISOString(),
            attachmentUrl: attachmentUrl.trim() || null,
            notes: notes.trim() || null,
            lines: validLines.map((l) => ({
                accountId: l.accountId,
                debit: Number(l.debitAmount) || 0,
                credit: Number(l.creditAmount) || 0,
                description: l.notes || undefined,
            })),
        };

        setSubmitting(true);
        try {
            await masterDataService.setInitialBalances(payload);
            showToast('İllik qalıqlar uğurla qeydə alındı və balanslaşdırıldı!', 'success');
            setShowBalanceModal(false);
            loadData(true);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'İllik qalıqları saxlayarkən xəta baş verdi';
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getTabIcon = (key: string) => {
        switch (key) {
            case 'accounts':
                return ScaleIcon;
            case 'warehouses':
                return ArchiveBoxIcon;
            case 'items':
                return ShoppingBagIcon;
            case 'customers':
                return UserGroupIcon;
            case 'suppliers':
                return TruckIcon;
            case 'bankAccounts':
                return CreditCardIcon;
            default:
                return CircleStackIcon;
        }
    };

    const MASTER_DATA_TABS = useMemo(() => [
        {
            key: 'overview',
            label: 'İcmal',
            icon: CircleStackIcon,
        },
        {
            key: 'balances',
            label: 'İllik Qalıqlar',
            icon: ScaleIcon,
        },
        {
            key: 'customers',
            label: 'Müştərilər',
            icon: UserGroupIcon,
        },
        {
            key: 'suppliers',
            label: 'Təchizatçılar',
            icon: BuildingOfficeIcon,
        },
        {
            key: 'items',
            label: 'Məhsul & Xidmətlər',
            icon: ShoppingBagIcon,
        },
        {
            key: 'warehouses',
            label: 'Anbarlar',
            icon: ArchiveBoxIcon,
        },
        {
            key: 'bankAccounts',
            label: 'Bank Hesabları',
            icon: CreditCardIcon,
        },
    ], []);

    const currentTabMeta = MASTER_DATA_TABS.find((t) => t.key === currentTab) || MASTER_DATA_TABS[0];

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* ─── Toast Notification ─── */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-white text-xs flex items-center gap-2 shadow-2xl animate-in fade-in">
                    {toastMessage.type === 'success' ? (
                        <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />
                    ) : (
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* ─── Top Header (Breadcrumb & Action buttons) ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>{t('masterData.title', {}, 'Əsas Məlumatlar')}</span>
                        <span className="text-[#52525B]">/</span>
                        <div className="inline-flex items-center gap-1.5 text-white font-bold">
                            <CircleStackIcon className="w-4 h-4 text-[#A1A1AA]" />
                            <span>{currentTabMeta.label}</span>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => loadData(true)}
                        disabled={isRefreshing || loading}
                        className="p-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                        title={t('common.refresh', {}, 'Yenilə')}
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    {currentTab === 'balances' ? (
                        <button
                            type="button"
                            onClick={() => handleSubmitInitialBalances()}
                            disabled={submitting || !isBalanced}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                    <span>{t('common.saving', {}, 'Saxlanılır...')}</span>
                                </>
                            ) : (
                                <>
                                    <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                    <span>Balansı Təsdiqlə</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleTabChange('balances')}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer"
                        >
                            <ScaleIcon className="w-4 h-4 stroke-[2]" />
                            <span>İllik Qalıqlar</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Top Master Data Tab Bar (Sleek Scrollable Tabs) ─── */}
            <div className="flex items-center justify-between gap-2 p-1.5 bg-[#121214] border border-[#27272A] rounded-2xl overflow-x-auto scrollbar-none shadow-sm">
                <div className="flex items-center gap-1 shrink-0">
                    {MASTER_DATA_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white text-black font-semibold shadow-xs'
                                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Active Tab Content: Overview (İcmal) ─── */}
            {currentTab === 'overview' && (
                <div className="space-y-4">
                    {/* Header Summary Banner */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 shadow-2xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0">
                                    <CircleStackIcon className="w-6 h-6 stroke-[1.75] text-white" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-bold tracking-tight text-white">
                                            Əsas Məlumatlar Mərkəzi
                                        </h2>
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#18181B] text-[#D4D4D8] border border-[#27272A]">
                                            Master Data Hub
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#A1A1AA] mt-1">
                                        ERP sisteminin ilkin sazlamaları, anbar strukturu və illik balans qalıqlarının tənzimlənməsi
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('balances')}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-semibold text-white transition-all cursor-pointer"
                                >
                                    <ScaleIcon className="w-4 h-4 text-[#A1A1AA]" />
                                    <span>İllik Qalıqları Tənzimlə</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                        <div
                            onClick={() => navigate('/accounts')}
                            className="bg-[#121214] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors shadow-sm"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Hesablar Planı</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white font-mono">{summary?.accountsCount ?? 0}</span>
                                <ScaleIcon className="w-4 h-4 text-[#A1A1AA]" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('warehouses')}
                            className="bg-[#121214] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors shadow-sm"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Anbarlar</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white font-mono">{summary?.warehousesCount ?? 0}</span>
                                <ArchiveBoxIcon className="w-4 h-4 text-[#A1A1AA]" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('items')}
                            className="bg-[#121214] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors shadow-sm"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Məhsullar</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white font-mono">{summary?.itemsCount ?? 0}</span>
                                <ShoppingBagIcon className="w-4 h-4 text-[#A1A1AA]" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('customers')}
                            className="bg-[#121214] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors shadow-sm"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Müştərilər</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white font-mono">{summary?.customersCount ?? 0}</span>
                                <UserGroupIcon className="w-4 h-4 text-[#A1A1AA]" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('suppliers')}
                            className="bg-[#121214] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors shadow-sm"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Təchizatçılar</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white font-mono">{summary?.suppliersCount ?? 0}</span>
                                <TruckIcon className="w-4 h-4 text-[#A1A1AA]" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('bankAccounts')}
                            className="bg-[#121214] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors shadow-sm"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Bank Hesabları</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white font-mono">{summary?.bankAccountsCount ?? 0}</span>
                                <CreditCardIcon className="w-4 h-4 text-[#A1A1AA]" />
                            </div>
                        </div>

                        <div className="bg-[#121214] p-4 rounded-xl border border-[#27272A] flex flex-col justify-between shadow-sm">
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Əsas Vəsaitlər</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white font-mono">{summary?.fixedAssetsCount ?? 0}</span>
                                <BuildingOfficeIcon className="w-4 h-4 text-[#A1A1AA]" />
                            </div>
                        </div>
                    </div>

                    {/* Checklist Modules Grid */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                                Sistem Quraşdırma Modulları və Vəziyyəti
                            </h3>
                            <span className="text-[11px] text-[#71717A]">
                                Bütün modullar tamamlandıqdan sonra tam avtomatlaşdırılmış mühasibat hesabatları formalaşır.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {tabs.map((tab) => {
                                const Icon = getTabIcon(tab.key);
                                const isConfigured = tab.count > 0;
                                return (
                                    <div
                                        key={tab.key}
                                        className="bg-[#121214] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-colors shadow-sm"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white shrink-0">
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-white">
                                                            {tab.titleAz || tab.titleEn}
                                                        </h4>
                                                        <span className="text-[11px] text-[#71717A]">
                                                            {tab.count} qeyd mövcuddur
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                                        isConfigured
                                                            ? 'bg-[#18181B] text-white border-[#3F3F46]'
                                                            : 'bg-[#18181B] text-[#71717A] border-[#27272A]'
                                                    }`}
                                                >
                                                    {isConfigured ? `Aktiv (${tab.count})` : 'Boşdur'}
                                                </span>
                                            </div>

                                            <p className="text-xs text-[#A1A1AA] mt-3">
                                                {tab.titleAz} modulu üzrə sistem rekvizitlərinin tənzimlənməsi və idarə edilməsi.
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (tab.key === 'accounts') navigate('/accounts');
                                                    else handleTabChange(tab.key);
                                                }}
                                                className="text-xs font-semibold text-[#A1A1AA] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                                            >
                                                <span>Karta keç</span>
                                                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Active Tab Content: Balances (İllik Qalıqlar) ─── */}
            {currentTab === 'balances' && (
                <div className="space-y-4">
                    {/* Header Metadata Card */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] p-5 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#27272A]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-2">
                                <ScaleIcon className="w-4 h-4 text-white" />
                                <span>İllik və İlkin Qalıqların Daxil Edilməsi (Balans Aktı)</span>
                            </h3>
                            <span className="text-[11px] text-[#71717A]">
                                İkiqat qeydiyyat prinsipinə əsasən Debet və Kredit cəmləri bərabər olmalıdır.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Maliyyə İli *
                                </label>
                                <select
                                    value={fiscalYearId}
                                    onChange={(e) => setFiscalYearId(e.target.value)}
                                    required
                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                >
                                    {fiscalYears.map((fy) => (
                                        <option key={fy.id} value={fy.id} className="bg-[#18181B] text-white">
                                            {fy.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Tarix (As of Date) *
                                </label>
                                <input
                                    type="date"
                                    value={asOfDate}
                                    onChange={(e) => setAsOfDate(e.target.value)}
                                    required
                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Akt Nömrəsi (№)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Məs: AKT-2026/01"
                                    value={actNumber}
                                    onChange={(e) => setActNumber(e.target.value)}
                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Əlavə Sənəd (URL / Link)
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={attachmentUrl}
                                        onChange={(e) => setAttachmentUrl(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                    />
                                    <PaperClipIcon className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-2.5" />
                                </div>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-4">
                                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                                    Qeydlər / Əsaslandırma
                                </label>
                                <input
                                    type="text"
                                    placeholder="İllik qalıqların köçürülməsi haqqında qeyd..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Balance Equality Checker */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-[#121214] border border-[#27272A] shadow-sm">
                            <div className="text-[11px] text-[#71717A] uppercase font-semibold">Cəmi Debet</div>
                            <div className="text-base sm:text-lg font-mono font-bold text-white mt-1">
                                {formatCurrency(totalDebit)}
                            </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#121214] border border-[#27272A] shadow-sm">
                            <div className="text-[11px] text-[#71717A] uppercase font-semibold">Cəmi Kredit</div>
                            <div className="text-base sm:text-lg font-mono font-bold text-white mt-1">
                                {formatCurrency(totalCredit)}
                            </div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#121214] border border-[#27272A] shadow-sm">
                            <div className="text-[11px] text-[#71717A] uppercase font-semibold">Balans Fərqi</div>
                            <div
                                className={`text-base sm:text-lg font-mono font-bold mt-1 ${
                                    isBalanced ? 'text-white' : 'text-red-400'
                                }`}
                            >
                                {formatCurrency(difference)}
                            </div>
                        </div>
                    </div>

                    {/* Status Badge */}
                    {isBalanced ? (
                        <div className="p-3 rounded-xl bg-[#14291F] border border-[#22C55E]/30 text-[#4ADE80] text-xs flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 shrink-0" />
                            <span>Mühasibat balansı təmin edilib: Debet və Kredit cəmləri tam bərabərdir.</span>
                        </div>
                    ) : (
                        <div className="p-3 rounded-xl bg-[#2E1619] border border-[#EF4444]/30 text-[#F87171] text-xs flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                            <span>Balans uyğunsuzluğu! Mühasibat qaydalarına əsasən Debet və Kredit cəmi tam bərabər olmalıdır.</span>
                        </div>
                    )}

                    {/* Lines Table */}
                    <div className="rounded-2xl border border-[#27272A] bg-[#121214] overflow-hidden shadow-2xl">
                        <div className="p-3.5 border-b border-[#27272A] flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                                Hesablar və Qalıq Sətirləri
                            </span>
                            <button
                                type="button"
                                onClick={handleAddLine}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-white hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                <span>Sətir Əlavə Et</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto scrollbar-none">
                            <table className="w-full text-left text-xs text-[#E4E4E7] border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] bg-[#18181B]/80 text-[#A1A1AA] text-[11px] font-bold">
                                        <th className="py-2.5 px-3 min-w-[280px]">Hesab (Kod & Ad)</th>
                                        <th className="py-2.5 px-3 text-right w-40">Debet (AZN)</th>
                                        <th className="py-2.5 px-3 text-right w-40">Kredit (AZN)</th>
                                        <th className="py-2.5 px-3 min-w-[200px]">Açıqlama</th>
                                        <th className="py-2.5 px-3 text-center w-12">Sil</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/60">
                                    {balanceLines.map((line, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.02]">
                                            <td className="p-2">
                                                <select
                                                    value={line.accountId}
                                                    onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                                                    required
                                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                                                >
                                                    <option value="" className="bg-[#18181B] text-[#71717A]">
                                                        Hesab seçin...
                                                    </option>
                                                    {accounts.map((acc) => (
                                                        <option key={acc.id} value={acc.id} className="bg-[#18181B] text-white">
                                                            {acc.code} - {acc.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-2 text-right">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.debitAmount || ''}
                                                    onChange={(e) => handleLineChange(idx, 'debitAmount', parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-right font-mono text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                                />
                                            </td>
                                            <td className="p-2 text-right">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={line.creditAmount || ''}
                                                    onChange={(e) => handleLineChange(idx, 'creditAmount', parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-right font-mono text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={line.notes || ''}
                                                    onChange={(e) => handleLineChange(idx, 'notes', e.target.value)}
                                                    placeholder="Qeyd..."
                                                    className="w-full bg-[#18181B] border border-[#27272A] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white transition-colors"
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLine(idx)}
                                                    disabled={balanceLines.length <= 1}
                                                    className="p-1 rounded-lg text-[#71717A] hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-30 cursor-pointer"
                                                    title="Sil"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Bottom Action */}
                        <div className="p-3.5 border-t border-[#27272A] flex items-center justify-between">
                            <button
                                type="button"
                                onClick={handleAddLine}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-white/5 text-xs text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                <span>Sətir Əlavə Et</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleSubmitInitialBalances()}
                                disabled={submitting || !isBalanced}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {submitting ? (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4 animate-spin text-black" />
                                        <span>Saxlanılır...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="w-4 h-4 stroke-[2.5]" />
                                        <span>Balansı Təsdiqlə və Yadda Saxla</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentTab === 'customers' && (
                <div className="animate-in fade-in duration-200">
                    <CustomersPage />
                </div>
            )}

            {currentTab === 'suppliers' && (
                <div className="animate-in fade-in duration-200">
                    <SuppliersPage />
                </div>
            )}

            {currentTab === 'items' && (
                <div className="animate-in fade-in duration-200">
                    <ItemsPage />
                </div>
            )}

            {currentTab === 'warehouses' && (
                <div className="animate-in fade-in duration-200">
                    <WarehousesPage />
                </div>
            )}

            {currentTab === 'bankAccounts' && (
                <div className="animate-in fade-in duration-200">
                    <BankAccountsPage />
                </div>
            )}
        </div>
    );
};

export default MasterDataPage;
