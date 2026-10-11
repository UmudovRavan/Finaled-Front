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

    // Initial Balances Modal State
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
        setBalanceLines((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleLineChange = (idx: number, field: keyof LocalBalanceLine, val: any) => {
        setBalanceLines((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: val };
            return next;
        });
    };

    const handleSubmitInitialBalances = async (e: React.FormEvent) => {
        e.preventDefault();
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
            showToast('İlkin qalıqlar uğurla qeydə alındı və balanslaşdırıldı!', 'success');
            setShowBalanceModal(false);
            loadData(true);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'İlkin qalıqları saxlayarkən xəta baş verdi';
            showToast(msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getTabRoute = (key: string): string => {
        switch (key) {
            case 'accounts':
                return '/accounts';
            case 'warehouses':
                return '/warehouses';
            case 'items':
                return '/items';
            case 'customers':
                return '/customers';
            case 'suppliers':
                return '/suppliers';
            case 'bankAccounts':
                return '/bank-accounts';
            default:
                return '/accounts';
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
            label: 'İcmal & İlkin Qalıqlar',
            icon: CircleStackIcon,
        },
        {
            key: 'customers',
            label: 'Müştərilər (Customers)',
            icon: UserGroupIcon,
            count: summary?.customersCount,
        },
        {
            key: 'suppliers',
            label: 'Təchizatçılar (Suppliers)',
            icon: BuildingOfficeIcon,
            count: summary?.suppliersCount,
        },
        {
            key: 'items',
            label: 'Məhsul & Xidmətlər (Items)',
            icon: ShoppingBagIcon,
            count: summary?.itemsCount,
        },
        {
            key: 'warehouses',
            label: 'Anbarlar (Warehouses)',
            icon: ArchiveBoxIcon,
            count: summary?.warehousesCount,
        },
        {
            key: 'bankAccounts',
            label: 'Bank Hesabları (Banks)',
            icon: CreditCardIcon,
            count: summary?.bankAccountsCount,
        },
    ], [summary]);

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Toast Notification */}
            {toastMessage && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border flex items-center gap-3 animate-in slide-in-from-top-2 duration-200 ${
                        toastMessage.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200 shadow-emerald-950/50'
                            : 'bg-rose-950/90 border-rose-500/30 text-rose-200 shadow-rose-950/50'
                    }`}
                >
                    {toastMessage.type === 'success' ? (
                        <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                        <ExclamationTriangleIcon className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span>{toastMessage.text}</span>
                </div>
            )}

            {/* ─── Top Master Data Tab Bar (Screenshot 2 Architecture) ─── */}
            <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-2 shadow-xl flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0">
                    {MASTER_DATA_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white text-black shadow-md font-bold'
                                        : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.05]'
                                }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-[#71717A]'}`} />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span
                                        className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                                            isActive
                                                ? 'bg-black/10 text-black font-bold'
                                                : 'bg-[#1C1C1E] text-[#71717A] border border-[#27272A]'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-[#27272A]/80">
                    <button
                        type="button"
                        onClick={() => setShowBalanceModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="İlkin Qalıqları Təyin Et"
                    >
                        <ScaleIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">İlkin Qalıqlar</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => loadData(true)}
                        disabled={isRefreshing || loading}
                        className="p-2 rounded-xl bg-[#1C1C1E] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-all cursor-pointer shadow-sm"
                        title="Yenilə"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ─── Active Tab Content ─── */}
            {currentTab === 'overview' && (
                <div className="space-y-6">
                    {/* Top Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#141416] p-5 sm:p-6 rounded-2xl border border-[#27272A] shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/30">
                                <CircleStackIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                    Əsas Məlumatlar Mərkəzi
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#27272A] text-zinc-400 border border-white/5 font-mono">
                                        Master Data Hub
                                    </span>
                                </h1>
                                <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
                                    ERP sisteminin ilkin sazlamaları, anbar strukturu və ilkin qalıqların tənzimlənməsi
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => setShowBalanceModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <ScaleIcon className="w-4 h-4" />
                                <span>İlkin Qalıqları Təyin Et</span>
                            </button>
                        </div>
                    </div>

                    {/* Summary Statistics Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                        <div
                            onClick={() => navigate('/accounts')}
                            className="bg-[#141416] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Hesablar Planı</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white">{summary?.accountsCount ?? 0}</span>
                                <ScaleIcon className="w-4 h-4 text-emerald-400" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('warehouses')}
                            className="bg-[#141416] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Anbarlar</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white">{summary?.warehousesCount ?? 0}</span>
                                <ArchiveBoxIcon className="w-4 h-4 text-amber-400" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('items')}
                            className="bg-[#141416] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Məhsullar</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white">{summary?.itemsCount ?? 0}</span>
                                <ShoppingBagIcon className="w-4 h-4 text-indigo-400" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('customers')}
                            className="bg-[#141416] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Müştərilər</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white">{summary?.customersCount ?? 0}</span>
                                <UserGroupIcon className="w-4 h-4 text-cyan-400" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('suppliers')}
                            className="bg-[#141416] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Təchizatçılar</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white">{summary?.suppliersCount ?? 0}</span>
                                <TruckIcon className="w-4 h-4 text-purple-400" />
                            </div>
                        </div>

                        <div
                            onClick={() => handleTabChange('bankAccounts')}
                            className="bg-[#141416] p-4 rounded-xl border border-[#27272A] hover:border-[#3F3F46] flex flex-col justify-between cursor-pointer transition-colors"
                        >
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Bank Hesabları</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-teal-400">{summary?.bankAccountsCount ?? 0}</span>
                                <CreditCardIcon className="w-4 h-4 text-teal-400" />
                            </div>
                        </div>

                        <div className="bg-[#141416] p-4 rounded-xl border border-[#27272A] flex flex-col justify-between">
                            <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-wider">Əsas Vəsaitlər</span>
                            <div className="mt-2 flex items-baseline justify-between">
                                <span className="text-xl font-bold text-white">{summary?.fixedAssetsCount ?? 0}</span>
                                <BuildingOfficeIcon className="w-4 h-4 text-pink-400" />
                            </div>
                        </div>
                    </div>

                    {/* Checklist Modules Grid */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A1A1AA]">
                                Sistem Quraşdırma Modulları və Vəziyyəti
                            </h2>
                            <span className="text-xs text-[#71717A]">
                                Bütün modullar tamamlandıqdan sonra tam avtomatlaşdırılmış mühasibat hesabatları aktivləşir
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {tabs.map((tab) => {
                                const Icon = getTabIcon(tab.key);
                                const isConfigured = tab.count > 0;
                                return (
                                    <div
                                        key={tab.key}
                                        className="bg-[#141416] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-lg shadow-black/20"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-[#27272A] flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                            {tab.titleAz || tab.titleEn}
                                                        </h3>
                                                        <span className="text-[11px] text-[#71717A]">
                                                            {tab.count} qeyd mövcuddur
                                                        </span>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                                        isConfigured
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                                    }`}
                                                >
                                                    {isConfigured ? (
                                                        <>
                                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                                            Aktiv ({tab.count})
                                                        </>
                                                    ) : (
                                                        'Boşdur'
                                                    )}
                                                </span>
                                            </div>

                                            <p className="text-xs text-[#A1A1AA] mt-3">
                                                {tab.titleAz} modulu üzrə sistem rekvizitlərinin tənzimlənməsi və idarə edilməsi.
                                            </p>
                                        </div>

                                        <div className="mt-5 pt-3 border-t border-[#27272A]/60 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (tab.key === 'accounts') navigate('/accounts');
                                                    else handleTabChange(tab.key);
                                                }}
                                                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer"
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

            {/* ─── INITIAL BALANCES MODAL ─── */}
            {showBalanceModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !submitting) setShowBalanceModal(false);
                    }}
                >
                    <div
                        className="bg-[#141416] border border-[#27272A] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl text-[#E4E4E7] flex flex-col max-h-[92vh] overflow-hidden my-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#27272A] p-4 sm:p-6 bg-[#18181B] shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <ScaleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                                        İlkin Qalıqların Daxil Edilməsi (Balans Aktı)
                                    </h2>
                                    <p className="text-xs text-[#A1A1AA]">
                                        İkitərəfli mühasibat prinsipinə əsasən Debet və Kredit cəmləri bərabər olmalıdır
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !submitting && setShowBalanceModal(false)}
                                className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmitInitialBalances} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
                            {/* Top metadata inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                        Maliyyə İli *
                                    </label>
                                    <select
                                        value={fiscalYearId}
                                        onChange={(e) => setFiscalYearId(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] text-white text-xs focus:border-emerald-500 outline-none"
                                    >
                                        {fiscalYears.map((fy) => (
                                            <option key={fy.id} value={fy.id}>
                                                {fy.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                        Tarix (As of Date) *
                                    </label>
                                    <input
                                        type="date"
                                        value={asOfDate}
                                        onChange={(e) => setAsOfDate(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] text-white text-xs focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                        Akt Nömrəsi (№)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Məs: AKT-2026/01"
                                        value={actNumber}
                                        onChange={(e) => setActNumber(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] text-white text-xs focus:border-emerald-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                        Əlavə Sənəd (URL / Link)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={attachmentUrl}
                                            onChange={(e) => setAttachmentUrl(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] text-white text-xs focus:border-emerald-500 outline-none"
                                        />
                                        <PaperClipIcon className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-2.5" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2 lg:col-span-4">
                                    <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                                        Qeydlər / Əsaslandırma
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="İlkin qalıqların köçürülməsi haqqında qeyd..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] text-white text-xs focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Lines Table */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                                        Hesablar və Qalıq Sətirləri
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleAddLine}
                                        className="px-2.5 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                                    >
                                        <PlusIcon className="w-3.5 h-3.5" />
                                        <span>Sətir Əlavə Et</span>
                                    </button>
                                </div>

                                <div className="border border-[#27272A] rounded-xl overflow-hidden bg-[#18181B]">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-[#141416] border-b border-[#27272A] text-[#71717A] font-semibold uppercase tracking-wider text-[11px]">
                                                    <th className="py-2.5 px-3 min-w-[260px]">Hesab (Kod & Ad)</th>
                                                    <th className="py-2.5 px-3 text-right w-36">Debet (AZN)</th>
                                                    <th className="py-2.5 px-3 text-right w-36">Kredit (AZN)</th>
                                                    <th className="py-2.5 px-3 min-w-[160px]">Açıqlama</th>
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
                                                                className="w-full px-2 py-1.5 rounded-lg bg-[#141416] border border-[#27272A] text-white text-xs focus:border-emerald-500 outline-none"
                                                            >
                                                                <option value="">Hesab seçin...</option>
                                                                {accounts.map((acc) => (
                                                                    <option key={acc.id} value={acc.id}>
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
                                                                className="w-full px-2 py-1.5 rounded-lg bg-[#141416] border border-[#27272A] text-emerald-400 font-mono text-right text-xs focus:border-emerald-500 outline-none"
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
                                                                className="w-full px-2 py-1.5 rounded-lg bg-[#141416] border border-[#27272A] text-teal-400 font-mono text-right text-xs focus:border-emerald-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                value={line.notes || ''}
                                                                onChange={(e) => handleLineChange(idx, 'notes', e.target.value)}
                                                                placeholder="Qeyd..."
                                                                className="w-full px-2 py-1.5 rounded-lg bg-[#141416] border border-[#27272A] text-white text-xs focus:border-emerald-500 outline-none"
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveLine(idx)}
                                                                disabled={balanceLines.length <= 1}
                                                                className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30 cursor-pointer"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Balance Indicator / Equality Checker */}
                            <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-3">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-2.5 rounded-lg bg-[#141416] border border-[#27272A]">
                                        <div className="text-[11px] text-[#71717A] uppercase font-semibold">Cəmi Debet</div>
                                        <div className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-0.5">
                                            {formatCurrency(totalDebit)}
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-[#141416] border border-[#27272A]">
                                        <div className="text-[11px] text-[#71717A] uppercase font-semibold">Cəmi Kredit</div>
                                        <div className="text-base sm:text-lg font-mono font-bold text-teal-400 mt-0.5">
                                            {formatCurrency(totalCredit)}
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-[#141416] border border-[#27272A]">
                                        <div className="text-[11px] text-[#71717A] uppercase font-semibold">Balans Fərqi</div>
                                        <div
                                            className={`text-base sm:text-lg font-mono font-bold mt-0.5 ${
                                                isBalanced ? 'text-emerald-400' : 'text-rose-400'
                                            }`}
                                        >
                                            {formatCurrency(difference)}
                                        </div>
                                    </div>
                                </div>

                                {isBalanced ? (
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span>
                                            Mühasibat balansı təmin edilib: Debet və Kredit cəmləri tam bərabərdir.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                                        <span>
                                            Balans uyğunsuzluğu! Mühasibat uçotu qaydalarına əsasən Debet və Kredit cəmi bərabər olmalıdır.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
                                <button
                                    type="button"
                                    onClick={() => setShowBalanceModal(false)}
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-xl border border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:text-white hover:bg-[#27272A] text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    İmtina
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !isBalanced}
                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                            <span>Saxlanılır...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>Balansı Təsdiqlə və Yadda Saxla</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterDataPage;
