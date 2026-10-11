import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { accountsService } from '../../api';
import type { AccountDto, JournalEntryDto } from '../../dto';
import { formatDate } from '../../utils';
import { useLanguage } from '../../context/LanguageContext';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    CheckCircleIcon,
    ScaleIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export const AccountDetailPage: React.FC = () => {
    const { t } = useLanguage();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [account, setAccount] = useState<AccountDto | null>(null);
    const [allAccounts, setAllAccounts] = useState<AccountDto[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntryDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Active Tab in Right Panel
    const [activeTab, setActiveTab] = useState<'transactions' | 'subaccounts' | 'summary'>('transactions');
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);


    const [toastMessage, setToastMessage] = useState('');

    const fetchAccountData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [accsData, entriesData] = await Promise.allSettled([
                accountsService.getAccounts(),
                accountsService.getJournalEntries({ pageSize: 100 }),
            ]);

            let foundAcc: AccountDto | null = null;
            if (accsData.status === 'fulfilled' && Array.isArray(accsData.value)) {
                setAllAccounts(accsData.value);
                const target = String(id).toLowerCase();
                foundAcc = accsData.value.find((a) => String(a.id).toLowerCase() === target || a.code.toLowerCase() === target) || null;
                setAccount(foundAcc);
            }

            if (entriesData.status === 'fulfilled' && Array.isArray(entriesData.value)) {
                // Filter entries that touch this account
                const targetId = foundAcc?.id ? String(foundAcc.id).toLowerCase() : String(id).toLowerCase();
                const relevant = entriesData.value.filter((entry) => {
                    if (!entry.lines || !Array.isArray(entry.lines)) return false;
                    return entry.lines.some((l: any) => String(l.accountId).toLowerCase() === targetId);
                });
                setJournalEntries(relevant);
            }
        } catch (err) {
            console.error('Error fetching account details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountData();
    }, [id]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };



    // Sub-accounts whose parent is this account
    const subAccounts = useMemo(() => {
        if (!account?.id || !allAccounts) return [];
        const accId = String(account.id).toLowerCase();
        return allAccounts.filter((a) => a.parentAccountId && String(a.parentAccountId).toLowerCase() === accId);
    }, [account, allAccounts]);

    // Parent account if any
    const parentAccount = useMemo(() => {
        if (!account?.parentAccountId || !allAccounts) return null;
        const pId = String(account.parentAccountId).toLowerCase();
        return allAccounts.find((a) => String(a.id).toLowerCase() === pId) || null;
    }, [account, allAccounts]);

    const formatCurrency = (val: number, cur: string = 'AZN') => {
        return new Intl.NumberFormat('az-AZ', {
            style: 'currency',
            currency: cur || 'AZN',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    const getTypeColor = (type: string | number) => {
        const typeStr = String(type);
        if (typeStr.includes('Asset') || typeStr === '1') return '#38BDF8';
        if (typeStr.includes('Liability') || typeStr === '2') return '#F59E0B';
        if (typeStr.includes('Equity') || typeStr === '3') return '#A855F7';
        if (typeStr.includes('Revenue') || typeStr.includes('Income') || typeStr === '4') return '#22C55E';
        if (typeStr.includes('Expense') || typeStr === '5') return '#EF4444';
        return '#71717A';
    };

    const getCategoryName = (cat: any) => {
        if (cat === 1 || cat === 'Asset') return t('accounting.asset', {}, 'Aktiv (Asset)');
        if (cat === 2 || cat === 'Liability') return t('accounting.liability', {}, 'Öhdəlik (Liability)');
        if (cat === 3 || cat === 'Equity') return t('accounting.equity', {}, 'Kapital (Equity)');
        if (cat === 4 || cat === 'Income' || cat === 'Revenue') return t('accounting.income', {}, 'Gəlir (Income)');
        if (cat === 5 || cat === 'Expense') return t('accounting.expense', {}, 'Xərc (Expense)');
        return String(cat || '—');
    };

    const getTypeName = (type: any) => {
        const num = Number(type);
        if (!isNaN(num) && type !== null && type !== undefined && type !== '') {
            switch (num) {
                case 0: return t('accounting.typeStandard', {}, 'Standart');
                case 1: return t('accounting.typeReceivable', {}, 'Debitor (Receivable)');
                case 2: return t('accounting.typePayable', {}, 'Kreditor (Payable)');
                case 3: return t('accounting.typeBank', {}, 'Bank');
                case 4: return t('accounting.typeCash', {}, 'Kassa');
                case 5: return t('accounting.typeStock', {}, 'Anbar (Stock)');
                case 6: return 'GRNI';
                case 7: return t('accounting.typeCogs', {}, 'Satışın Mayası (COGS)');
                case 8: return t('accounting.typeTax', {}, 'Vergi (Tax)');
                case 9: return t('accounting.typeRetainedEarnings', {}, 'Bölüşdürülməmiş Mənfəət');
                case 10: return t('accounting.typeRevenue', {}, 'Gəlir (Revenue)');
                case 11: return t('accounting.typeExpense', {}, 'Xərc (Expense)');
                case 12: return t('accounting.typeFixedAsset', {}, 'Əsas Vəsait (Fixed Asset)');
                case 13: return t('accounting.typeCurrentAsset', {}, 'Cari Aktiv (Current Asset)');
                case 14: return t('accounting.typeCurrentLiability', {}, 'Qısamüddətli Öhdəlik');
                case 15: return t('accounting.typeLongTermLiability', {}, 'Uzunmüddətli Öhdəlik');
                case 16: return 'Yığılmış Amortizasiya';
                case 17: return 'Təhtəlhesab Məbləğlər';
                case 18: return 'Verilmiş Avanslar';
                case 19: return 'Alınmış Avanslar';
                case 20: return 'Bank Kreditləri';
                default: break;
            }
        }
        if (type === 'Standard') return t('accounting.typeStandard', {}, 'Standart');
        if (type === 'Receivable') return t('accounting.typeReceivable', {}, 'Debitor (Receivable)');
        if (type === 'Payable') return t('accounting.typePayable', {}, 'Kreditor (Payable)');
        if (type === 'Bank') return t('accounting.typeBank', {}, 'Bank');
        if (type === 'Cash') return t('accounting.typeCash', {}, 'Kassa');
        if (type === 'Stock') return t('accounting.typeStock', {}, 'Anbar (Stock)');
        if (type === 'Revenue') return t('accounting.typeRevenue', {}, 'Gəlir (Revenue)');
        if (type === 'Expense') return t('accounting.typeExpense', {}, 'Xərc (Expense)');
        if (type === 'FixedAsset') return t('accounting.typeFixedAsset', {}, 'Əsas Vəsait (Fixed Asset)');
        if (type === 'CurrentAsset') return t('accounting.typeCurrentAsset', {}, 'Cari Aktiv (Current Asset)');
        if (type === 'CurrentLiability') return t('accounting.typeCurrentLiability', {}, 'Qısamüddətli Öhdəlik');
        if (type === 'LongTermLiability') return t('accounting.typeLongTermLiability', {}, 'Uzunmüddətli Öhdəlik');
        return String(type || t('accounting.typeStandard', {}, 'Standart'));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-xs text-[#71717A]">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-white" />
                <span>{t('common.loading', {}, 'Hesab məlumatları yüklənir...')}</span>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="p-8 text-center space-y-3">
                <p className="text-white text-sm">{t('accounting.accountNotFound', {}, 'Hesab tapılmadı.')}</p>
                <Link
                    to="/accounts"
                    className="inline-block px-4 py-2 bg-white text-black font-semibold text-xs rounded-xl"
                >
                    {t('accounting.backToAccounts', {}, 'Hesablar Planına Qayıt')}
                </Link>
            </div>
        );
    }

    const currentBal = Number(account.balance ?? (account as any).currentBalance) || 0;
    const initialChar = (account.name || 'H').charAt(0).toUpperCase();

    return (
        <div className="space-y-4 font-sans text-[#F4F4F5] antialiased select-none pb-12">
            {/* Toast Alert */}
            {toastMessage && (
                <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ─── 1. TOP BREADCRUMB BAR ─── */}
            <div className="px-1 py-1 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA] flex-wrap">
                    <Link to="/accounts" className="hover:text-white transition-colors">
                        {t('accounting.accountsTitle', {}, 'Hesablar Planı')}
                    </Link>
                    <span>/</span>
                    <Link to="/accounts" className="hover:text-white transition-colors">
                        {t('common.list', {}, 'Siyahı')}
                    </Link>
                    <span>/</span>
                    <span className="text-white font-semibold">
                        {account.code} - {account.name}
                    </span>
                </div>

                <Link
                    to="/accounts"
                    className="px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-white transition-colors"
                >
                    ← {t('accounting.backToList', {}, 'Siyahıya qayıt')}
                </Link>
            </div>

            {/* ─── 2. MAIN TWO-COLUMN CONTENT BODY ─── */}
            <div className="flex flex-col lg:flex-row min-w-0 border border-[#27272A] rounded-2xl bg-[#121214] overflow-hidden shadow-2xl">
                {/* ─── LEFT PANEL: AVATAR, BALANCE & DETAILS ─── */}
                <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-[#27272A] bg-[#121214] p-5 sm:p-6 space-y-5 text-xs overflow-y-auto custom-scrollbar">
                    {/* Header Info */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-13 h-13 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {initialChar}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-base font-bold text-white truncate leading-snug">{account.name}</h1>
                            <p className="text-xs text-[#A1A1AA] font-mono font-bold mt-0.5">{account.code}</p>
                        </div>
                    </div>

                    {/* Balance Highlight Box */}
                    <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-4 space-y-1">
                        <span className="text-[11px] text-[#A1A1AA] font-medium block">{t('accounting.currentBalance', {}, 'Cari Qalıq')}</span>
                        <span className="text-2xl font-bold font-mono text-white tracking-tight block">
                            {formatCurrency(currentBal, account.currency)}
                        </span>
                        <div className="flex items-center gap-2 pt-1 text-[11px]">
                            <span
                                className="w-2 h-2 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: getTypeColor(account.type) }}
                            />
                            <span className="text-[#A1A1AA]">{getTypeName(account.type)}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate('/master-data')}
                            className="w-full flex items-center justify-center gap-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#D4D4D8] hover:text-white font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs shadow-xs"
                        >
                            <ScaleIcon className="w-4 h-4 text-emerald-400" />
                            <span>İlkin Qalıqlar Aktı (Setup Hub)</span>
                        </button>
                    </div>

                    <div className="h-px bg-[#27272A]"></div>

                    {/* Collapsible Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                                className="flex items-center gap-1.5 font-bold text-white cursor-pointer hover:text-white transition-colors text-sm"
                            >
                                <span>{t('common.details', {}, 'Detallar')}</span>
                                {isDetailsOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
                            </button>
                        </div>

                        {isDetailsOpen && (
                            <div className="space-y-3 text-xs">
                                {/* Hesab Kodu */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">{t('accounting.accountCode', {}, 'Hesab Kodu')}</label>
                                    <span className="font-mono font-bold text-white block">{account.code}</span>
                                </div>

                                {/* Hesabın Adı */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">{t('accounting.accountName', {}, 'Hesabın Adı')}</label>
                                    <span className="font-semibold text-white block">{account.name}</span>
                                </div>

                                {/* Kateqoriya */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">{t('accounting.accountCategory', {}, 'Kateqoriya')}</label>
                                    <span className="text-white block">{getCategoryName(account.category || account.type)}</span>
                                </div>

                                {/* Hesab Növü */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">{t('accounting.accountType', {}, 'Hesab Növü (Type)')}</label>
                                    <span className="text-white block">{getTypeName(account.type)}</span>
                                </div>

                                {/* Valyuta */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">{t('common.currency', {}, 'Valyuta')}</label>
                                    <span className="font-mono text-white block">{account.currency || 'AZN'}</span>
                                </div>

                                {/* Nəzarət Hesabı */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">{t('accounting.controlAccount', {}, 'Nəzarət Hesabı (Control)')}</label>
                                    <span className="text-white block">{account.isControlAccount ? t('common.yes', {}, 'Bəli') : t('common.no', {}, 'Xeyr')}</span>
                                </div>

                                {/* Ana Hesab */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">{t('accounting.parentAccount', {}, 'Ana Hesab (Parent)')}</label>
                                    <span className="text-white block">
                                        {parentAccount ? `${parentAccount.code} - ${parentAccount.name}` : t('accounting.noneParent', {}, 'Yoxdur (Baş Hesab)')}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="space-y-1">
                                    <label className="text-[#71717A] text-[11px] block">{t('common.status', {}, 'Status')}</label>
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`w-2 h-2 rounded-full inline-block shrink-0 ${
                                                account.isActive ? 'bg-[#22C55E]' : 'bg-[#71717A]'
                                            }`}
                                        />
                                        <span className="text-white">{account.isActive ? t('common.active', {}, 'Aktiv') : t('common.inactive', {}, 'Deaktiv')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT MAIN PANEL: TABS & TABLES ─── */}
                <div className="flex-1 p-5 sm:p-7 flex flex-col min-w-0 bg-[#121214]">
                    {/* Tabs Header with Badges */}
                    <div className="border-b border-[#27272A] pb-3 flex items-center gap-4 flex-wrap">
                        {/* Tab 1: Transactions */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('transactions')}
                            className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer pb-2 -mb-3 border-b-2 ${
                                activeTab === 'transactions'
                                    ? 'text-white border-white'
                                    : 'text-[#A1A1AA] border-transparent hover:text-white'
                            }`}
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            <span>{t('accounting.journalEntries', {}, 'Jurnal Qeydləri')}</span>
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                                {journalEntries.length}
                            </span>
                        </button>

                        {/* Tab 2: Sub-accounts */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('subaccounts')}
                            className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer pb-2 -mb-3 border-b-2 ${
                                activeTab === 'subaccounts'
                                    ? 'text-white border-white'
                                    : 'text-[#A1A1AA] border-transparent hover:text-white'
                            }`}
                        >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                            <span>{t('accounting.subAccounts', {}, 'Alt Hesablar')}</span>
                            <span className="w-5 h-5 rounded-full bg-[#27272A] text-white text-[10px] font-bold flex items-center justify-center">
                                {subAccounts.length}
                            </span>
                        </button>

                        {/* Tab 3: Summary */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('summary')}
                            className={`flex items-center gap-2 text-xs font-bold transition-all cursor-pointer pb-2 -mb-3 border-b-2 ${
                                activeTab === 'summary'
                                    ? 'text-white border-white'
                                    : 'text-[#A1A1AA] border-transparent hover:text-white'
                            }`}
                        >
                            <ScaleIcon className="w-4 h-4" />
                            <span>{t('accounting.financialMovement', {}, 'Maliyyə Hərəkəti')}</span>
                        </button>
                    </div>

                    {/* Tab 1 Content: Transactions Table */}
                    {activeTab === 'transactions' && (
                        <div className="mt-5 flex-1 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] text-[#71717A] font-medium uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-4">{t('accounting.entryNumber', {}, 'NÖMRƏ')}</th>
                                        <th className="py-3 px-4">{t('common.date', {}, 'TARİX')}</th>
                                        <th className="py-3 px-4">{t('common.description', {}, 'TƏSVİR')}</th>
                                        <th className="py-3 px-4 text-right">{t('common.amount', {}, 'MƏBLƏĞ')}</th>
                                        <th className="py-3 px-4 text-center">{t('common.status', {}, 'STATUS')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/50 text-[#D4D4D8]">
                                    {journalEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-[#71717A]">
                                                {t('accounting.noJournalForAccount', {}, 'Bu hesab üzrə hələ heç bir jurnal qeydi aparılmayıb.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        journalEntries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-[#18181B]/80 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                    {entry.entryNumber}
                                                </td>
                                                <td className="py-3.5 px-4 text-[#A1A1AA]">
                                                    {formatDate(entry.date, '—')}
                                                </td>
                                                <td className="py-3.5 px-4 text-white">
                                                    {entry.description || t('accounting.journalEntry', {}, 'Jurnal əməliyyatı')}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                                    {formatCurrency(Number(entry.totalDebit || entry.totalCredit || 0), account.currency)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                            entry.status === 'POSTED'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                : 'bg-zinc-800 text-zinc-400'
                                                        }`}
                                                    >
                                                        {entry.status === 'POSTED' ? t('statuses.posted', {}, 'Təsdiqlənib') : t('statuses.draft', {}, 'Qaralama')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 2 Content: Sub-Accounts Table */}
                    {activeTab === 'subaccounts' && (
                        <div className="mt-5 flex-1 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-[#27272A] text-[#71717A] font-medium uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-4">{t('accounting.accountCode', {}, 'KOD')}</th>
                                        <th className="py-3 px-4">{t('accounting.accountName', {}, 'HESABIN ADI')}</th>
                                        <th className="py-3 px-4">{t('accounting.accountType', {}, 'TİPİ')}</th>
                                        <th className="py-3 px-4 text-right">{t('accounting.balance', {}, 'QALIQ')}</th>
                                        <th className="py-3 px-4 text-center">{t('common.status', {}, 'STATUS')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#27272A]/50 text-[#D4D4D8]">
                                    {subAccounts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-[#71717A]">
                                                {t('accounting.noSubAccounts', {}, 'Bu hesaba bağlı heç bir alt hesab mövcud deyil.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        subAccounts.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-[#18181B]/80 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                    <Link to={`/accounts/${sub.id}`} className="hover:underline">
                                                        {sub.code}
                                                    </Link>
                                                </td>
                                                <td className="py-3.5 px-4 font-semibold text-white">
                                                    <Link to={`/accounts/${sub.id}`} className="hover:underline">
                                                        {sub.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3.5 px-4 text-[#A1A1AA]">{getTypeName(sub.type)}</td>
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                                                    {formatCurrency(Number(sub.balance ?? (sub as any).currentBalance) || 0, sub.currency)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${sub.isActive ? 'bg-[#22C55E]' : 'bg-[#71717A]'}`} />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 3 Content: Summary Breakdown */}
                    {activeTab === 'summary' && (
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-[#18181B] p-5 rounded-2xl border border-[#27272A] space-y-1">
                                <span className="text-[11px] text-[#A1A1AA] block">{t('accounting.totalCurrentBalance', {}, 'Ümumi Cari Qalıq')}</span>
                                <span className="text-2xl font-bold font-mono text-white block">
                                    {formatCurrency(currentBal, account.currency)}
                                </span>
                            </div>
                            <div className="bg-[#18181B] p-5 rounded-2xl border border-[#27272A] space-y-1">
                                <span className="text-[11px] text-[#A1A1AA] block">{t('accounting.relatedTxCount', {}, 'Əlaqəli Əməliyyat Sayı')}</span>
                                <span className="text-2xl font-bold font-mono text-white block">
                                    {journalEntries.length}
                                </span>
                            </div>
                            <div className="bg-[#18181B] p-5 rounded-2xl border border-[#27272A] space-y-1">
                                <span className="text-[11px] text-[#A1A1AA] block">{t('accounting.subAccountsCount', {}, 'Alt Hesabların Sayı')}</span>
                                <span className="text-2xl font-bold font-mono text-white block">
                                    {subAccounts.length}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AccountDetailPage;
